import { Injectable, Logger, Optional } from '@nestjs/common';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { SiteDetectorService, SiteProfile } from './site-detector.service';
import { createHash } from 'crypto';
import puppeteer, { Browser, Page } from 'puppeteer';

export interface RenderedPage {
  html: string;
  url: string;
  loadTime: number;
  strategy: 'cheerio' | 'puppeteer';
  profile?: SiteProfile;
}

@Injectable()
export class HybridRendererService {
  private readonly logger = new Logger(HybridRendererService.name);
  private browser: Browser | null = null;
  private readonly PAGE_RENDER_CACHE_TTL = 60 * 60; // 1 hour
  private readonly MAX_WAIT_TIME = 30000; // 30 seconds max wait for page load

  constructor(
    @Optional() private readonly redisService: RedisService | null,
    private readonly siteDetector: SiteDetectorService,
  ) {}

  /**
   * Render page using the optimal strategy (Cheerio or Puppeteer)
   */
  async renderPage(url: string, html: string, forceRefresh = false): Promise<RenderedPage> {
    const startTime = Date.now();

    // Check cache first
    if (!forceRefresh && this.redisService) {
      const cacheKey = `render:${createHash('sha256').update(url).digest('hex').substring(0, 16)}`;
      const cached = await this.redisService.getCached<RenderedPage>(cacheKey);
      if (cached) {
        this.logger.log(`[CACHE HIT] Rendered page for ${url}`);
        return cached;
      }
    }

    // Detect site technology
    const profile = await this.siteDetector.detectSite(html, url);
    this.logger.log(`[RENDER] ${url} - Strategy: ${profile.recommendedStrategy}`);

    let renderedHtml = html;
    let strategy: 'cheerio' | 'puppeteer' = 'cheerio';

    // Use Puppeteer if needed
    if (profile.needsJsRendering || profile.recommendedStrategy === 'puppeteer') {
      try {
        // Add timeout wrapper to prevent hanging
        renderedHtml = await this.renderWithTimeout(url, this.MAX_WAIT_TIME + 10000);
        strategy = 'puppeteer';
      } catch (error) {
        this.logger.error(`[PUPPETEER ERROR] ${url}: ${error.message}`);
        this.logger.warn(`[FALLBACK] Using static HTML for ${url}`);
        // Fall back to static HTML
        renderedHtml = html;
        strategy = 'cheerio';
      }
    } else if (profile.recommendedStrategy === 'hybrid') {
      // For hybrid sites (WordPress with JS, Shopify), try Cheerio first
      // If content looks sparse, retry with Puppeteer
      const isContentSparse = this.checkIfContentSparse(html);
      if (isContentSparse) {
        this.logger.log(`[HYBRID] Content sparse, using Puppeteer for ${url}`);
        try {
          renderedHtml = await this.renderWithTimeout(url, this.MAX_WAIT_TIME + 10000);
          strategy = 'puppeteer';
        } catch (error) {
          this.logger.error(`[PUPPETEER ERROR] ${url}: ${error.message}`);
          renderedHtml = html;
          strategy = 'cheerio';
        }
      }
    }

    const loadTime = Date.now() - startTime;

    const result: RenderedPage = {
      html: renderedHtml,
      url,
      loadTime,
      strategy,
      profile,
    };

    // Cache the result
    if (this.redisService) {
      const cacheKey = `render:${createHash('sha256').update(url).digest('hex').substring(0, 16)}`;
      await this.redisService.setCached(cacheKey, result, this.PAGE_RENDER_CACHE_TTL);
      this.logger.log(`[RENDER CACHED] ${url} using ${strategy} (${loadTime}ms)`);
    }

    return result;
  }

  /**
   * Render with timeout to prevent hanging
   */
  private async renderWithTimeout(url: string, timeoutMs: number): Promise<string> {
    return Promise.race([
      this.renderWithPuppeteer(url),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error(`Rendering timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }

  /**
   * Render page with Puppeteer (full JavaScript execution)
   */
  private async renderWithPuppeteer(url: string): Promise<string> {
    const startTime = Date.now();
    let page: Page | null = null;

    try {
      // Initialize browser if needed
      if (!this.browser) {
        await this.initializeBrowser();
      }

      page = await this.browser!.newPage();

      // Set viewport and user agent
      await page.setViewport({ width: 1920, height: 1080 });
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
      );

      // Block only heavy resources, keep stylesheets for proper rendering
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const resourceType = request.resourceType();
        const url = request.url();

        // Block only images and media, but keep fonts and stylesheets for accuracy
        if (['image', 'media'].includes(resourceType)) {
          request.abort();
        }
        // Block third-party analytics/tracking to speed up
        else if (url.includes('google-analytics.com') ||
                 url.includes('googletagmanager.com') ||
                 url.includes('facebook.com/tr') ||
                 url.includes('doubleclick.net')) {
          request.abort();
        }
        else {
          request.continue();
        }
      });

      this.logger.log(`[PUPPETEER] Navigating to ${url}...`);

      // Navigate to page with more lenient timeout strategy
      await page.goto(url, {
        waitUntil: 'domcontentloaded', // More lenient than networkidle2
        timeout: this.MAX_WAIT_TIME,
      });

      // Wait for content to render based on site type
      await this.waitForContent(page, url);

      // Extract the rendered HTML
      const html = await page.content();

      // Close page
      await page.close();
      page = null;

      const renderTime = Date.now() - startTime;
      this.logger.log(`[PUPPETEER] Successfully rendered ${url} in ${renderTime}ms`);

      return html;
    } catch (error) {
      this.logger.error(`[PUPPETEER] Failed to render ${url}: ${error.message}`);

      // Ensure page is closed on error
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          this.logger.error(`[PUPPETEER] Error closing page: ${closeError.message}`);
        }
      }

      throw error;
    }
  }

  /**
   * Wait for content to load based on site patterns
   */
  private async waitForContent(page: Page, url: string): Promise<void> {
    try {
      // Check if it's a Shopify store (URL or content-based detection)
      const html = await page.content();
      const isShopify = url.includes('myshopify.com') ||
                        url.includes('.shopify.com') ||
                        html.includes('Shopify.theme') ||
                        html.includes('cdn.shopify.com') ||
                        html.includes('window.Shopify');

      if (isShopify) {
        this.logger.log(`[PUPPETEER] Detected Shopify store, using specific wait strategy`);

        // Wait for Shopify's common elements
        await Promise.race([
          page.waitForSelector('.product-grid', { timeout: 8000 }),
          page.waitForSelector('[data-section-type]', { timeout: 8000 }),
          page.waitForSelector('.shopify-section', { timeout: 8000 }),
          page.waitForSelector('.product-item', { timeout: 8000 }),
          page.waitForSelector('.collection-grid', { timeout: 8000 }),
          new Promise((resolve) => setTimeout(resolve, 8000)),
        ]).catch(() => {
          this.logger.warn(`[PUPPETEER] Shopify selectors not found, continuing anyway`);
        });

        // Additional wait for lazy loading and product grids
        await new Promise((resolve) => setTimeout(resolve, 4000));
      } else {
        // For React/Vue/Angular apps
        await Promise.race([
          page.waitForSelector('[data-reactroot], [data-reactid], #root > *, #app > *, app-root > *', { timeout: 5000 }),
          page.waitForFunction(() => document.body.innerText.length > 100, { timeout: 5000 }),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]).catch(() => {
          this.logger.warn(`[PUPPETEER] Content selectors not found, continuing anyway`);
        });

        // Give time for hydration and lazy loading
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      this.logger.log(`[PUPPETEER] Content loaded successfully`);
    } catch (error) {
      this.logger.warn(`[PUPPETEER] Wait for content error: ${error.message}, proceeding anyway`);
    }
  }

  /**
   * Initialize Puppeteer browser
   */
  private async initializeBrowser(): Promise<void> {
    try {
      this.logger.log('[PUPPETEER] Initializing browser...');
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920,1080',
        ],
      });
      this.logger.log('[PUPPETEER] Browser initialized successfully');
    } catch (error) {
      this.logger.error(`[PUPPETEER] Failed to initialize browser: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if HTML content appears sparse (indicator that JS rendering is needed)
   */
  private checkIfContentSparse(html: string): boolean {
    // Remove HTML tags and whitespace
    const textContent = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

    // If text content is very small compared to HTML size, it's likely JS-rendered
    const contentRatio = textContent.length / html.length;

    // Check for common SPA indicators
    const hasReactRoot = /<div[^>]*id=["']root["'][^>]*>[\s\S]*?<\/div>/.test(html);
    const hasVueApp = /<div[^>]*id=["']app["'][^>]*>[\s\S]*?<\/div>/.test(html);
    const hasAngularRoot = /<app-root[^>]*>[\s\S]*?<\/app-root>/.test(html);
    const hasMinimalContent = textContent.length < 500;

    return (
      contentRatio < 0.05 || // Less than 5% text content
      (hasMinimalContent && (hasReactRoot || hasVueApp || hasAngularRoot))
    );
  }

  /**
   * Close browser on module destroy
   */
  async onModuleDestroy() {
    if (this.browser) {
      this.logger.log('[PUPPETEER] Closing browser...');
      await this.browser.close();
      this.browser = null;
    }
  }
}
