import { Injectable, Logger, Optional } from '@nestjs/common';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { createHash } from 'crypto';

export interface SiteProfile {
  framework: 'wordpress' | 'shopify' | 'react' | 'vue' | 'angular' | 'nextjs' | 'gatsby' | 'static' | 'unknown';
  renderingMethod: 'ssr' | 'csr' | 'static' | 'hybrid';
  needsJsRendering: boolean;
  cmsSignals: string[];
  estimatedComplexity: 'low' | 'medium' | 'high';
  recommendedStrategy: 'cheerio' | 'puppeteer' | 'hybrid';
  detectedAt: Date;
}

@Injectable()
export class SiteDetectorService {
  private readonly logger = new Logger(SiteDetectorService.name);
  private readonly DETECTION_CACHE_TTL = 7 * 24 * 60 * 60; // 7 days

  constructor(@Optional() private readonly redisService: RedisService | null) {}

  /**
   * Detect website platform and rendering method
   */
  async detectSite(html: string, url: string): Promise<SiteProfile> {
    // Check cache first (only if Redis is available)
    const domain = this.extractDomain(url);

    if (this.redisService) {
      const cacheKey = `tech:${createHash('sha256').update(domain).digest('hex').substring(0, 16)}`;
      const cached = await this.redisService.getCached<SiteProfile>(cacheKey);

      if (cached) {
        this.logger.log(`[CACHE HIT] Technology detection for ${domain}`);
        return cached;
      }
    }

    this.logger.log(`[DETECTION] Analyzing ${domain}...`);

    const signals: string[] = [];
    let framework: SiteProfile['framework'] = 'unknown';
    let renderingMethod: SiteProfile['renderingMethod'] = 'static';
    let needsJsRendering = false;

    // WordPress Detection
    if (this.detectWordPress(html)) {
      framework = 'wordpress';
      signals.push('WordPress CMS detected');
      renderingMethod = 'ssr';
      // WordPress with JS plugins may need rendering
      needsJsRendering = this.detectWordPressJsPlugins(html);
    }

    // Shopify Detection
    if (this.detectShopify(html)) {
      framework = 'shopify';
      signals.push('Shopify platform detected');
      renderingMethod = 'hybrid';
      needsJsRendering = true; // Shopify often uses JS for product grids
    }

    // React Detection
    if (this.detectReact(html)) {
      framework = 'react';
      signals.push('React framework detected');
      renderingMethod = 'csr';
      needsJsRendering = true;
    }

    // Next.js Detection (overrides React if found)
    if (this.detectNextJs(html)) {
      framework = 'nextjs';
      signals.push('Next.js framework detected');
      renderingMethod = 'hybrid'; // Next.js can do SSR/SSG/CSR
      needsJsRendering = true; // Still needs rendering for hydration
    }

    // Vue Detection
    if (this.detectVue(html)) {
      framework = 'vue';
      signals.push('Vue.js framework detected');
      renderingMethod = 'csr';
      needsJsRendering = true;
    }

    // Angular Detection
    if (this.detectAngular(html)) {
      framework = 'angular';
      signals.push('Angular framework detected');
      renderingMethod = 'csr';
      needsJsRendering = true;
    }

    // Gatsby Detection
    if (this.detectGatsby(html)) {
      framework = 'gatsby';
      signals.push('Gatsby framework detected');
      renderingMethod = 'static'; // Gatsby pre-renders
      needsJsRendering = false; // Gatsby pages are static HTML
    }

    // Estimate complexity
    const estimatedComplexity = this.estimateComplexity(html, needsJsRendering);

    // Determine recommended strategy
    const recommendedStrategy = this.determineStrategy(framework, needsJsRendering);

    const profile: SiteProfile = {
      framework,
      renderingMethod,
      needsJsRendering,
      cmsSignals: signals,
      estimatedComplexity,
      recommendedStrategy,
      detectedAt: new Date(),
    };

    // Cache the result (only if Redis is available)
    if (this.redisService) {
      const cacheKey = `tech:${createHash('sha256').update(domain).digest('hex').substring(0, 16)}`;
      await this.redisService.setCached(cacheKey, profile, this.DETECTION_CACHE_TTL);
    }
    this.logger.log(`[DETECTION] ${domain}: ${framework} (${renderingMethod}) - ${recommendedStrategy} strategy`);

    return profile;
  }

  private detectWordPress(html: string): boolean {
    const wpSignals = [
      /\/wp-content\//i,
      /\/wp-includes\//i,
      /<meta name=["']generator["'] content=["']WordPress/i,
      /wp-json/i,
      /wlwmanifest.xml/i,
    ];
    return wpSignals.some(pattern => pattern.test(html));
  }

  private detectWordPressJsPlugins(html: string): boolean {
    const jsPluginSignals = [
      /elementor/i,
      /divi/i,
      /beaver-builder/i,
      /woocommerce/i,
    ];
    return jsPluginSignals.some(pattern => pattern.test(html));
  }

  private detectShopify(html: string): boolean {
    const shopifySignals = [
      /Shopify\.theme/i,
      /shopify\.com\/cdn/i,
      /window\.Shopify/i,
      /cdn\.shopify\.com/i,
      /<script[^>]*shopify[^>]*>/i,
    ];
    return shopifySignals.some(pattern => pattern.test(html));
  }

  private detectReact(html: string): boolean {
    const reactSignals = [
      /<div[^>]*id=["']root["']/i,
      /react\.min\.js/i,
      /__REACT_DEVTOOLS_GLOBAL_HOOK__/i,
      /data-reactroot/i,
      /data-reactid/i,
    ];
    return reactSignals.some(pattern => pattern.test(html));
  }

  private detectNextJs(html: string): boolean {
    const nextSignals = [
      /__NEXT_DATA__/i,
      /_next\/static/i,
      /next\.js/i,
    ];
    return nextSignals.some(pattern => pattern.test(html));
  }

  private detectVue(html: string): boolean {
    const vueSignals = [
      /<div[^>]*id=["']app["']/i,
      /vue\.min\.js/i,
      /data-v-/i,
      /v-if=/i,
      /v-for=/i,
    ];
    return vueSignals.some(pattern => pattern.test(html));
  }

  private detectAngular(html: string): boolean {
    const angularSignals = [
      /<app-root/i,
      /ng-version/i,
      /platform-browser/i,
      /angular\.min\.js/i,
    ];
    return angularSignals.some(pattern => pattern.test(html));
  }

  private detectGatsby(html: string): boolean {
    const gatsbySignals = [
      /___gatsby/i,
      /gatsby\.min\.js/i,
      /gatsby-/i,
    ];
    return gatsbySignals.some(pattern => pattern.test(html));
  }

  private estimateComplexity(html: string, needsJsRendering: boolean): 'low' | 'medium' | 'high' {
    const htmlSize = html.length;
    const scriptTags = (html.match(/<script/gi) || []).length;
    const hasLazyLoading = /loading=["']lazy["']/i.test(html);
    const hasInfiniteScroll = /infinite.*scroll/i.test(html);

    if (needsJsRendering && (scriptTags > 20 || hasInfiniteScroll)) {
      return 'high';
    }
    if (needsJsRendering || htmlSize > 500000 || hasLazyLoading) {
      return 'medium';
    }
    return 'low';
  }

  private determineStrategy(
    framework: SiteProfile['framework'],
    needsJsRendering: boolean,
  ): 'cheerio' | 'puppeteer' | 'hybrid' {
    // SPAs always need Puppeteer
    if (['react', 'vue', 'angular', 'nextjs'].includes(framework)) {
      return 'puppeteer';
    }

    // Shopify benefits from Puppeteer for dynamic content
    if (framework === 'shopify') {
      return 'hybrid'; // Try Cheerio first, fall back to Puppeteer
    }

    // WordPress with JS plugins needs hybrid approach
    if (framework === 'wordpress' && needsJsRendering) {
      return 'hybrid';
    }

    // Gatsby is pre-rendered, Cheerio is fine
    if (framework === 'gatsby' || framework === 'static') {
      return 'cheerio';
    }

    // Default: use Cheerio for speed
    return 'cheerio';
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace(/^www\./, '');
    } catch (error) {
      return url;
    }
  }
}
