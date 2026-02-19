import { Injectable, Logger, Optional } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { createHash } from 'crypto';
import { RedisService } from '../../../infrastructure/redis/redis.service';
import { HybridRendererService } from './hybrid-renderer.service';

export interface ScrapedSEOData {
  // 1. On-Page SEO Analysis
  onPageSEO: {
    titleTag: {
      content: string;
      length: number;
      isOptimal: boolean;
      recommendation: string;
    };
    metaDescription: {
      content: string;
      length: number;
      isOptimal: boolean;
      recommendation: string;
    };
    // SERP Preview data for Google search results simulation
    serpPreview: {
      desktop: {
        title: string;
        titleTruncated: boolean;
        url: string;
        description: string;
        descriptionTruncated: boolean;
      };
      mobile: {
        title: string;
        titleTruncated: boolean;
        url: string;
        description: string;
        descriptionTruncated: boolean;
      };
    };
    headings: {
      h1: string[];
      h2: string[];
      h3: string[];
      h4: string[];
      h5: string[];
      h6: string[];
      structure: Array<{ tag: string; text: string; level: number }>;
      issues: string[];
    };
    images: {
      total: number;
      withAlt: number;
      withoutAlt: number;
      withTitle: number;
      withoutTitle: number;
      altTextTooLong: number;
      details: Array<{
        src: string;
        alt: string;
        title: string;
        altLength: number;
        hasAlt: boolean;
        hasTitle: boolean;
      }>;
    };
    content: {
      wordCount: number;
      sentenceCount: number;
      avgWordsPerSentence: number;
      readabilityScore: number;
      paragraphCount: number;
      // Keyword density analysis
      keywordDensity: Array<{
        keyword: string;
        count: number;
        density: number; // percentage
      }>;
      nGrams: {
        [key: number]: Array<{ keyword: string; count: number; density: number }>;
      };
      topKeywords: string[];
    };
    links: {
      internal: {
        count: number;
        links: Array<{ url: string; anchorText: string }>;
      };
      external: {
        count: number;
        links: Array<{ url: string; anchorText: string }>;
      };
      broken: {
        count: number;
        links: Array<{ url: string; anchorText: string; statusCode: number }>;
      };
      total: number;
    };
    crawledUrls: Array<{ url: string; statusCode: number | null }>;
  };

  // 2. Page Speed & Performance
  performance: {
    pageSize: number;
    loadTime: number;
    lcp: number;
    fcp: number;
    imageStats: {
      totalImages: number;
      totalSize: number;
      avgSize: number;
      oversizedImages: Array<{
        src: string;
        estimatedSize: string;
        severity: 'optimal' | 'warning' | 'critical';
      }>;
    };
    lazyLoading: {
      implemented: boolean;
      imagesWithLazyLoad: number;
      recommendation: string;
    };
    imageFormats: {
      webp: number;
      jpeg: number;
      png: number;
      gif: number;
      svg: number;
      recommendation: string;
    };
  };

  // 3. Mobile & Responsive Design
  mobile: {
    viewport: {
      hasViewportTag: boolean;
      content: string;
      isOptimal: boolean;
    };
    responsiveImages: {
      imagesWithSrcset: number;
      totalImages: number;
      percentage: number;
    };
    touchElements: {
      hasProperSpacing: boolean;
      recommendation: string;
    };
  };

  // 4. Technical SEO Infrastructure
  technical: {
    url: {
      original: string;
      length: number;
      isClean: boolean;
      hasKeywords: boolean;
      issues: string[];
    };
    canonicalTag: {
      exists: boolean;
      url: string;
      recommendation: string;
    };
    robotsMeta: {
      exists: boolean;
      content: string;
      isIndexable: boolean;
    };
    favicon: {
      exists: boolean;
      url: string;
      type: string;
    };
  };

  // 5. Schema Markup & Structured Data
  structuredData: {
    hasSchema: boolean;
    types: string[];
    jsonLd: any[];
    microdata: any[];
    recommendations: string[];
  };

  // 6. Security & Compliance
  security: {
    https: {
      isSecure: boolean;
      protocol: string;
    };
    mixedContent: {
      hasIssues: boolean;
      insecureResources: string[];
    };
    socialLinks: {
      facebook: string | null;
      instagram: string | null;
      twitter: string | null;
      linkedin: string | null;
      youtube: string | null;
    };
  };

  // 7. Integration Tags
  integrations: {
    googleAnalytics: {
      found: boolean;
      ids: string[];
    };
    googleTagManager: {
      found: boolean;
      ids: string[];
    };
    facebookPixel: {
      found: boolean;
      ids: string[];
    };
    microsoftClarity: {
      found: boolean;
      ids: string[];
    };
  };

  // Raw HTML for advanced analysis
  rawData: {
    htmlLength: number;
    scriptsCount: number;
    stylesheetsCount: number;
    inlineStylesCount: number;
    inlineScriptsCount: number;
    domNodeCount: number;
    scriptSrcCount: number;
    deferAsyncScriptCount: number;
    resourceCount: number; // script[src] + link[rel=stylesheet] + img[src] + 1 (HTML)
  };

  // Resource details for actionable fixes
  resources: {
    scripts: Array<{ url: string; codeSnippet: string; hasDefer: boolean; hasAsync: boolean }>;
    stylesheets: Array<{ url: string; codeSnippet: string }>;
    images: Array<{ url: string; codeSnippet: string; alt: string; width?: number; height?: number }>;
    brokenLinks: Array<{ url: string; codeSnippet: string; statusCode: number }>;
  };
}

@Injectable()
export class WebScraperService {
  private readonly logger = new Logger(WebScraperService.name);

  // Cache TTLs in seconds
  private readonly ANALYSIS_CACHE_TTL = 6 * 60 * 60; // 6 hours
  private readonly PAGE_CACHE_TTL = 60 * 60; // 1 hour
  private readonly LINK_STATUS_CACHE_TTL = 24 * 60 * 60; // 24 hours for 200 OK
  private readonly LINK_STATUS_ERROR_TTL = 60 * 60; // 1 hour for errors

  constructor(
    @Optional() private readonly redisService: RedisService | null,
    @Optional() private readonly hybridRenderer: HybridRendererService | null,
  ) {}

  private generateCacheKey(url: string, type: 'analysis' | 'page'): string {
    const hash = createHash('sha256').update(url).digest('hex').substring(0, 16);
    return `${type}:${hash}:v2`;
  }

  async scrapePage(url: string, forceRefresh = false): Promise<ScrapedSEOData> {
    try {
      // Check cache first unless force refresh (only if Redis is available)
      if (!forceRefresh && this.redisService) {
        const cacheKey = this.generateCacheKey(url, 'analysis');
        const cached = await this.redisService.getCached<ScrapedSEOData>(cacheKey);
        if (cached) {
          this.logger.log(`[CACHE HIT] ${url} - Returning cached analysis`);
          return cached;
        }
        this.logger.log(`[CACHE MISS] ${url} - Performing fresh analysis`);
      } else if (forceRefresh) {
        this.logger.log(`[FORCE REFRESH] ${url} - Bypassing cache`);
      } else {
        this.logger.log(`[NO REDIS] ${url} - Caching disabled, performing fresh analysis`);
      }

      this.logger.log(`Starting to scrape: ${url}`);

      // Fetch the page
      const startTime = Date.now();
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; RivisoBot/1.0; +https://riviso.com/bot)',
        },
        maxRedirects: 5,
        timeout: 15000,
      });
      let loadTime = Date.now() - startTime;
      let html = response.data;

      // Use hybrid renderer for JavaScript-heavy sites
      if (this.hybridRenderer) {
        const rendered = await this.hybridRenderer.renderPage(url, html, forceRefresh);
        html = rendered.html;
        loadTime = rendered.loadTime;
        this.logger.log(`Page rendered using ${rendered.strategy} in ${loadTime}ms`);
      } else {
        this.logger.log(`Page loaded in ${loadTime}ms (static HTML only)`);
      }

      const $ = cheerio.load(html);

      this.logger.log(`Analyzing content...`);

      // Extract all SEO data
      const onPageData = await this.analyzeOnPageSEO($, html, url);
      const scrapedData: ScrapedSEOData = {
        onPageSEO: onPageData,
        performance: this.analyzePerformance($, html, loadTime),
        mobile: this.analyzeMobileOptimization($),
        technical: this.analyzeTechnicalSEO($, url),
        structuredData: this.analyzeStructuredData($, html),
        security: this.analyzeSecurityCompliance($, url),
        integrations: this.analyzeIntegrationTags($, html),
        rawData: this.analyzeRawData($, html),
        resources: this.collectResources($, html, url, onPageData.links.broken.links),
      };

      this.logger.log(`Scraping completed for: ${url}`);

      // Cache the result (only if Redis is available)
      if (this.redisService) {
        const cacheKey = this.generateCacheKey(url, 'analysis');
        await this.redisService.setCached(cacheKey, scrapedData, this.ANALYSIS_CACHE_TTL);
        this.logger.log(`[CACHE SET] ${url} - Analysis cached for ${this.ANALYSIS_CACHE_TTL}s`);
      }

      return scrapedData;
    } catch (error) {
      this.logger.error(`Error scraping ${url}: ${error.message}`);
      throw error;
    }
  }

  private async analyzeOnPageSEO($: any, html: string, url?: string) {
    // Title Tag Analysis - Check multiple sources
    let titleTag = $('title').text().trim();

    // Fallback to og:title if regular title is empty
    if (!titleTag || titleTag.length === 0) {
      titleTag = $('meta[property="og:title"]').attr('content') || '';
    }

    // Fallback to meta title if still empty
    if (!titleTag || titleTag.length === 0) {
      titleTag = $('meta[name="title"]').attr('content') || '';
    }

    // Final fallback to h1 if no title found
    if (!titleTag || titleTag.length === 0) {
      titleTag = $('h1').first().text().trim() || '';
    }

    const titleLength = titleTag.length;
    const titleOptimal = titleLength >= 50 && titleLength <= 60;

    // Meta Description Analysis
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaLength = metaDescription.length;
    const metaOptimal = metaLength >= 150 && metaLength <= 160;

    // Headings Analysis - Preserve order and hierarchy
    const headingStructure: Array<{ tag: string; text: string; level: number }> = [];
    $(':header').each((_: number, el: any) => {
      const tag = el.name.toUpperCase(); // H1, H2, etc.
      const level = parseInt(tag.substring(1), 10);
      const text = $(el).text().trim();
      if (text) {
        headingStructure.push({ tag, text, level });
      }
    });

    const h1Array = headingStructure.filter(h => h.level === 1).map(h => h.text);
    const h2Array = headingStructure.filter(h => h.level === 2).map(h => h.text);
    const h3Array = headingStructure.filter(h => h.level === 3).map(h => h.text);
    const h4Array = headingStructure.filter(h => h.level === 4).map(h => h.text);
    const h5Array = headingStructure.filter(h => h.level === 5).map(h => h.text);
    const h6Array = headingStructure.filter(h => h.level === 6).map(h => h.text);

    const headingIssues = [];
    if (h1Array.length === 0) headingIssues.push('No H1 tag found');
    if (h1Array.length > 1) headingIssues.push(`Multiple H1 tags found (${h1Array.length})`);

    // Links Analysis
    const allLinks = $('a[href]');
    const baseUrl = url ? new URL(url) : null;
    const internalLinks: Array<{ url: string; anchorText: string }> = [];
    const externalLinks: Array<{ url: string; anchorText: string }> = [];
    const brokenLinks: Array<{ url: string; href?: string; anchorText: string; statusCode: number; element?: any }> = [];

    // Function to check if a link is broken (404 or other error status) with caching
    const checkLinkStatus = async (linkUrl: string): Promise<number | null> => {
      // Check cache first (only if Redis is available)
      if (this.redisService) {
        const cacheKey = `link:${createHash('sha256').update(linkUrl).digest('hex').substring(0, 16)}`;
        const cached = await this.redisService.getCached<number>(cacheKey);
        if (cached !== null && cached !== -1) {
          return cached;
        }
      }

      try {
        const response = await axios.head(linkUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RivisoBot/1.0; +https://riviso.com/bot)',
          },
          maxRedirects: 5,
          timeout: 5000,
          validateStatus: () => true, // Don't throw on any status
        });

        // Cache the result based on status code (only if Redis is available)
        if (this.redisService) {
          const cacheKey = `link:${createHash('sha256').update(linkUrl).digest('hex').substring(0, 16)}`;
          const ttl = response.status >= 200 && response.status < 300
            ? this.LINK_STATUS_CACHE_TTL
            : this.LINK_STATUS_ERROR_TTL;
          await this.redisService.setCached(cacheKey, response.status, ttl);
        }

        return response.status;
      } catch (error) {
        // If HEAD fails, try GET
        try {
          const response = await axios.get(linkUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; RivisoBot/1.0; +https://riviso.com/bot)',
            },
            maxRedirects: 5,
            timeout: 5000,
            validateStatus: () => true,
          });

          // Cache the result (only if Redis is available)
          if (this.redisService) {
            const cacheKey = `link:${createHash('sha256').update(linkUrl).digest('hex').substring(0, 16)}`;
            const ttl = response.status >= 200 && response.status < 300
              ? this.LINK_STATUS_CACHE_TTL
              : this.LINK_STATUS_ERROR_TTL;
            await this.redisService.setCached(cacheKey, response.status, ttl);
          }

          return response.status;
        } catch (e) {
          // Cache null result for short period to avoid repeated failures (only if Redis is available)
          if (this.redisService) {
            const cacheKey = `link:${createHash('sha256').update(linkUrl).digest('hex').substring(0, 16)}`;
            await this.redisService.setCached(cacheKey, -1, this.LINK_STATUS_ERROR_TTL);
          }
          return null; // Could not check
        }
      }
    };

    // Collect all links first
    const linksToCheck: Array<{ fullUrl: string; href: string; anchorText: string; element: any }> = [];

    allLinks.each((_: number, el: any) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      // Extract anchor text (the clickable text)
      let anchorText = $el.text().trim();
      // If no text, try to get alt text from image inside the link
      if (!anchorText) {
        anchorText = $el.find('img').attr('alt') || $el.find('img').attr('title') || '';
      }
      // If still no text, use the URL as fallback
      if (!anchorText) {
        anchorText = href;
      }

      try {
        let fullUrl = href;
        if (baseUrl) {
          const linkUrl = new URL(href, baseUrl.origin);
          fullUrl = linkUrl.href;

          if (linkUrl.hostname === baseUrl.hostname) {
            internalLinks.push({ url: href, anchorText });
          } else {
            externalLinks.push({ url: href, anchorText });
          }
        } else {
          // If no base URL, consider relative links as internal
          if (href.startsWith('http://') || href.startsWith('https://')) {
            externalLinks.push({ url: href, anchorText });
            fullUrl = href;
          } else {
            internalLinks.push({ url: href, anchorText });
            // Can't check relative URLs without base URL
            return;
          }
        }

        // Collect links to check (only for absolute URLs, limit to 30 for performance)
        if ((fullUrl.startsWith('http://') || fullUrl.startsWith('https://')) && linksToCheck.length < 30) {
          linksToCheck.push({ fullUrl, href, anchorText, element: $el });
        }
      } catch (e) {
        // Invalid URL, skip
      }
    });

    // Collect all unique URLs from links, images, scripts, stylesheets
    const urlSet = new Set<string>();

    // Add the main page URL first
    if (url) {
      urlSet.add(url);
    }

    // Add all link URLs
    allLinks.each((_: number, el: any) => {
      const href = $(el).attr('href');
      if (href && !href.startsWith('#') && !href.startsWith('javascript:') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
        try {
          if (baseUrl) {
            const linkUrl = new URL(href, baseUrl.origin);
            urlSet.add(linkUrl.href);
          } else if (href.startsWith('http://') || href.startsWith('https://')) {
            urlSet.add(href);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    // Add image URLs
    $('img[src]').each((_: number, el: any) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          if (baseUrl) {
            const imgUrl = new URL(src, baseUrl.origin);
            urlSet.add(imgUrl.href);
          } else if (src.startsWith('http://') || src.startsWith('https://')) {
            urlSet.add(src);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    // Add script URLs
    $('script[src]').each((_: number, el: any) => {
      const src = $(el).attr('src');
      if (src) {
        try {
          if (baseUrl) {
            const scriptUrl = new URL(src, baseUrl.origin);
            urlSet.add(scriptUrl.href);
          } else if (src.startsWith('http://') || src.startsWith('https://')) {
            urlSet.add(src);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    // Add stylesheet URLs
    $('link[href][rel="stylesheet"]').each((_: number, el: any) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          if (baseUrl) {
            const cssUrl = new URL(href, baseUrl.origin);
            urlSet.add(cssUrl.href);
          } else if (href.startsWith('http://') || href.startsWith('https://')) {
            urlSet.add(href);
          }
        } catch (e) {
          // Invalid URL, skip
        }
      }
    });

    // Convert Set to Array and add to allUrls
    const urlsToCheck = Array.from(urlSet).slice(0, 100); // Limit to 100 URLs for performance

    // Initialize array for all crawled URLs
    const allUrls: Array<{ url: string; statusCode: number | null }> = [];

    // Check links in parallel batches (max 50 concurrent)
    const batchSize = 50;
    const linkCheckPromises = linksToCheck.map(async ({ fullUrl, href, anchorText, element }) => {
      try {
        const statusCode = await checkLinkStatus(fullUrl);
        // Only include 404 Not Found errors and other 4xx/5xx errors
        if (statusCode && statusCode >= 400 && statusCode < 600) {
          brokenLinks.push({ url: fullUrl, href, anchorText, statusCode, element: element });
        }
      } catch (error) {
        // Don't add to broken links if check fails - only 404s are considered broken
      }
    });
    await Promise.allSettled(linkCheckPromises);

    // Check all URLs for status codes (for crawled pages view) in parallel
    const urlCheckPromises = urlsToCheck.map(async (urlToCheck) => {
      try {
        // Main page URL is always 200
        if (url && urlToCheck === url) {
          allUrls.push({ url: urlToCheck, statusCode: 200 });
          return;
        }

        const statusCode = await checkLinkStatus(urlToCheck);
        allUrls.push({ url: urlToCheck, statusCode: statusCode || null });
      } catch (error) {
        allUrls.push({ url: urlToCheck, statusCode: null });
      }
    });
    await Promise.allSettled(urlCheckPromises);

    // Images Analysis (with title attribute)
    const images = $('img');
    const imageDetails = images.map((_: number, el: any) => {
      const $img = $(el);
      const alt = $img.attr('alt') || '';
      const title = $img.attr('title') || '';
      return {
        src: $img.attr('src') || '',
        alt,
        title,
        altLength: alt.length,
        hasAlt: !!alt,
        hasTitle: !!title,
      };
    }).get();

    const imagesWithAlt = imageDetails.filter((img: any) => img.hasAlt).length;
    const imagesWithoutAlt = imageDetails.filter((img: any) => !img.hasAlt).length;
    const imagesWithTitle = imageDetails.filter((img: any) => img.hasTitle).length;
    const imagesWithoutTitle = imageDetails.filter((img: any) => !img.hasTitle).length;
    const altTextTooLong = imageDetails.filter((img: any) => img.altLength > 100).length;

    // Content Analysis
    const bodyText = $('body').text();
    const words = bodyText.split(/\s+/).filter((word: string) => word.length > 0);
    const sentences = bodyText.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const paragraphs = $('p').length;

    // Keyword Density Analysis
    const nGrams = this.calculateKeywordDensity(bodyText);
    const topKeywords = nGrams[1].slice(0, 10).map(k => k.keyword);
    const keywordDensity = nGrams[1];

    // SERP Preview Generation
    const serpPreview = this.generateSerpPreview(titleTag, metaDescription, url || '');

    return {
      titleTag: {
        content: titleTag || 'No title tag found',
        length: titleLength,
        isOptimal: titleOptimal && titleLength > 0,
        recommendation: titleLength === 0
          ? 'Title tag is missing. This is critical for SEO. Add a descriptive title tag (50-60 characters).'
          : titleOptimal
            ? 'Title length is optimal'
            : titleLength < 50
              ? `Title is too short (${titleLength} chars). Recommended: 50-60 characters.`
              : `Title is too long (${titleLength} chars). Recommended: 50-60 characters.`,
      },
      metaDescription: {
        content: metaDescription,
        length: metaLength,
        isOptimal: metaOptimal,
        recommendation: metaOptimal
          ? 'Meta description length is optimal'
          : metaLength === 0
            ? 'Meta description is missing'
            : metaLength < 150
              ? `Meta description is too short (${metaLength} chars). Recommended: 150-160 characters.`
              : `Meta description is too long (${metaLength} chars). Recommended: 150-160 characters.`,
      },
      serpPreview,
      headings: {
        h1: h1Array,
        h2: h2Array,
        h3: h3Array,
        h4: h4Array,
        h5: h5Array,
        h6: h6Array,
        structure: headingStructure,
        issues: headingIssues,
      },
      images: {
        total: images.length,
        withAlt: imagesWithAlt,
        withoutAlt: imagesWithoutAlt,
        withTitle: imagesWithTitle,
        withoutTitle: imagesWithoutTitle,
        altTextTooLong,
        details: imageDetails,
      },
      content: {
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
        readabilityScore: this.calculateReadabilityScore(words.length, sentences.length),
        paragraphCount: paragraphs,
        keywordDensity,
        nGrams,
        topKeywords,
      },
      links: {
        internal: {
          count: internalLinks.length,
          links: internalLinks.slice(0, 50), // Limit to first 50 for performance
        },
        external: {
          count: externalLinks.length,
          links: externalLinks.slice(0, 50), // Limit to first 50 for performance
        },
        broken: {
          count: brokenLinks.length,
          links: brokenLinks.slice(0, 50), // Limit to first 50 for performance
        },
        total: allLinks.length,
      },
      crawledUrls: allUrls, // All URLs found on the page with their status codes
    };
  }

  private analyzePerformance($: any, html: string, loadTime: number) {
    const pageSize = Buffer.byteLength(html, 'utf8');

    // Image analysis
    const images = $('img');
    const imageSrcs = images.map((_: number, el: any) => $(el).attr('src')).get().filter(Boolean);

    // Estimate image sizes based on URL patterns (actual sizes would need separate HTTP requests)
    const oversizedImages = imageSrcs.slice(0, 10).map((src: any) => {
      const ext = src.split('.').pop()?.toLowerCase();
      let estimatedSize = 'Unknown';
      let severity: 'optimal' | 'warning' | 'critical' = 'optimal';

      // This is a simplified estimation - in production, fetch actual sizes
      if (src.includes('large') || src.includes('full')) {
        estimatedSize = '> 600KB';
        severity = 'critical';
      } else if (ext === 'png') {
        estimatedSize = '200-600KB';
        severity = 'warning';
      } else {
        estimatedSize = '< 200KB';
        severity = 'optimal';
      }

      return { src, estimatedSize, severity };
    });

    // Lazy loading check
    const lazyImages = images.filter((_: number, el: any) => {
      const $img = $(el);
      return $img.attr('loading') === 'lazy' || $img.attr('data-src') !== undefined;
    }).length;

    // Image formats
    const imageFormats = {
      webp: imageSrcs.filter((src: string) => src.includes('.webp')).length,
      jpeg: imageSrcs.filter((src: string) => src.match(/\.(jpg|jpeg)/i)).length,
      png: imageSrcs.filter((src: string) => src.includes('.png')).length,
      gif: imageSrcs.filter((src: string) => src.includes('.gif')).length,
      svg: imageSrcs.filter((src: string) => src.includes('.svg')).length,
    };

    return {
      pageSize,
      loadTime,
      lcp: parseFloat((loadTime * 0.8 / 1000).toFixed(2)), // Estimated LCP
      fcp: parseFloat((loadTime * 0.4 / 1000).toFixed(2)), // Estimated FCP
      imageStats: {
        totalImages: images.length,
        totalSize: 0, // Would need actual HTTP requests to get accurate size
        avgSize: 0,
        oversizedImages,
      },
      lazyLoading: {
        implemented: lazyImages > 0,
        imagesWithLazyLoad: lazyImages,
        recommendation: lazyImages === images.length
          ? 'All images have lazy loading'
          : `${images.length - lazyImages} images without lazy loading`,
      },
      imageFormats: {
        ...imageFormats,
        recommendation: imageFormats.webp > 0
          ? 'Using modern WebP format'
          : 'Consider using WebP format for better compression',
      },
    };
  }

  private analyzeMobileOptimization($: any) {
    const viewport = $('meta[name="viewport"]').attr('content') || '';
    const hasViewport = viewport.length > 0;
    const isOptimalViewport = viewport.includes('width=device-width');

    const imagesWithSrcset = $('img[srcset]').length;
    const totalImages = $('img').length;

    return {
      viewport: {
        hasViewportTag: hasViewport,
        content: viewport,
        isOptimal: isOptimalViewport,
      },
      responsiveImages: {
        imagesWithSrcset,
        totalImages,
        percentage: totalImages > 0 ? (imagesWithSrcset / totalImages) * 100 : 0,
      },
      touchElements: {
        hasProperSpacing: true, // Would need more complex analysis
        recommendation: 'Ensure touch targets are at least 48x48px',
      },
    };
  }

  private analyzeTechnicalSEO($: any, url: string) {
    const urlObj = new URL(url);
    const urlLength = url.length;
    const urlPath = urlObj.pathname;

    // Check if URL is clean (no query params, readable)
    const isClean = !urlPath.includes('?') && !urlPath.match(/[0-9]{6,}/);

    const canonicalTag = $('link[rel="canonical"]').attr('href') || '';
    const robotsMeta = $('meta[name="robots"]').attr('content') || '';
    const favicon = $('link[rel="icon"], link[rel="shortcut icon"]').attr('href') || '';
    const faviconType = $('link[rel="icon"]').attr('type') || '';

    return {
      url: {
        original: url,
        length: urlLength,
        isClean,
        hasKeywords: urlPath.split('/').some(segment => segment.length > 3),
        issues: [
          ...(urlLength > 100 ? ['URL is too long (> 100 characters)'] : []),
          ...(!isClean ? ['URL contains special characters or long numbers'] : []),
        ],
      },
      canonicalTag: {
        exists: !!canonicalTag,
        url: canonicalTag,
        recommendation: canonicalTag ? 'Canonical tag is present' : 'Add canonical tag to avoid duplicate content',
      },
      robotsMeta: {
        exists: !!robotsMeta,
        content: robotsMeta,
        isIndexable: !robotsMeta.includes('noindex'),
      },
      favicon: {
        exists: !!favicon,
        url: favicon,
        type: faviconType,
      },
    };
  }

  private analyzeStructuredData($: any, html: string) {
    const jsonLdScripts = $('script[type="application/ld+json"]');
    const jsonLd = jsonLdScripts.map((_: number, el: any) => {
      try {
        return JSON.parse($(el).html() || '{}');
      } catch {
        return null;
      }
    }).get().filter(Boolean);

    const schemaTypes = jsonLd.map((schema: any) => schema['@type']).filter(Boolean);

    return {
      hasSchema: jsonLd.length > 0,
      types: schemaTypes,
      jsonLd,
      microdata: [], // Would need more complex parsing
      recommendations: jsonLd.length === 0
        ? ['Add structured data (JSON-LD) for better SERP features']
        : ['Schema markup is implemented'],
    };
  }

  private analyzeSecurityCompliance($: any, url: string) {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';

    // Find social media links
    const socialLinks = {
      facebook: $('a[href*="facebook.com"]').attr('href') || null,
      instagram: $('a[href*="instagram.com"]').attr('href') || null,
      twitter: $('a[href*="twitter.com"], a[href*="x.com"]').attr('href') || null,
      linkedin: $('a[href*="linkedin.com"]').attr('href') || null,
      youtube: $('a[href*="youtube.com"]').attr('href') || null,
    };

    // Check for mixed content
    const insecureResources = $('img[src^="http:"], script[src^="http:"], link[href^="http:"]')
      .map((_: number, el: any) => $(el).attr('src') || $(el).attr('href'))
      .get()
      .filter(Boolean)
      .slice(0, 10);

    return {
      https: {
        isSecure: isHttps,
        protocol: urlObj.protocol,
      },
      mixedContent: {
        hasIssues: insecureResources.length > 0,
        insecureResources,
      },
      socialLinks,
    };
  }

  private analyzeIntegrationTags($: any, html: string) {
    // Google Analytics
    const gaMatches = html.match(/UA-\d+-\d+/g) || [];
    const ga4Matches = html.match(/G-[A-Z0-9]+/g) || [];
    const allGAIds = [...new Set([...gaMatches, ...ga4Matches])];

    // Google Tag Manager
    const gtmMatches = html.match(/GTM-[A-Z0-9]+/g) || [];

    // Facebook Pixel
    const fbMatches = html.match(/fbq\('init',\s*'(\d+)'\)/g) || [];

    // Microsoft Clarity
    const clarityMatches = html.match(/clarity\(['"]([a-z0-9]+)['"]\)/g) || [];

    return {
      googleAnalytics: {
        found: allGAIds.length > 0,
        ids: allGAIds,
      },
      googleTagManager: {
        found: gtmMatches.length > 0,
        ids: gtmMatches,
      },
      facebookPixel: {
        found: fbMatches.length > 0,
        ids: fbMatches,
      },
      microsoftClarity: {
        found: clarityMatches.length > 0,
        ids: clarityMatches,
      },
    };
  }

  private analyzeRawData($: any, html: string) {
    const scriptSrcCount = $('script[src]').length;
    const stylesheetsCount = $('link[rel="stylesheet"]').length;
    const imgCount = $('img[src]').length;
    const deferAsync = $('script[defer], script[async]').length;
    const resourceCount = scriptSrcCount + stylesheetsCount + imgCount + 1; // +1 for HTML
    return {
      htmlLength: html.length,
      scriptsCount: $('script').length,
      stylesheetsCount,
      inlineStylesCount: $('style').length,
      inlineScriptsCount: $('script:not([src])').length,
      domNodeCount: $('*').length,
      scriptSrcCount,
      deferAsyncScriptCount: deferAsync,
      resourceCount,
    };
  }

  private calculateReadabilityScore(wordCount: number, sentenceCount: number): number {
    if (sentenceCount === 0) return 0;

    // Simplified Flesch Reading Ease Score
    // Actual formula: 206.835 - 1.015(total words/total sentences) - 84.6(total syllables/total words)
    // This is a simplified version
    const avgWordsPerSentence = wordCount / sentenceCount;
    const score = 206.835 - (1.015 * avgWordsPerSentence);

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Calculate keyword density from page content
   * Returns top keywords sorted by frequency
   */
  private calculateKeywordDensity(text: string): { [key: number]: Array<{ keyword: string; count: number; density: number }> } {
    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
      'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once',
      'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
      'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
      'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should', 'now', 'also',
      'that', 'this', 'these', 'those', 'which', 'who', 'whom', 'what', 'be', 'been',
      'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'would',
      'could', 'might', 'must', 'shall', 'is', 'am', 'are', 'was', 'were', 'as', 'if',
      'it', 'its', 'he', 'she', 'his', 'her', 'they', 'them', 'their', 'we', 'us', 'our',
      'you', 'your', 'i', 'me', 'my', 'get', 'got', 'let', 'may', 'use', 'used',
    ]);

    // Clean and tokenize text
    const allWords = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 1); // Keep short words for N-grams

    if (allWords.length === 0) return { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

    const nGrams: { [key: number]: Array<{ keyword: string; count: number; density: number }> } = {};

    for (let n = 1; n <= 6; n++) {
      const freqMap = new Map<string, number>();
      for (let i = 0; i <= allWords.length - n; i++) {
        const grams = allWords.slice(i, i + n);

        // For 1-word, exclude stop words and very short words
        if (n === 1 && (stopWords.has(grams[0]) || grams[0].length <= 2)) continue;

        // For multi-word, at least one word should NOT be a stop word
        if (n > 1 && grams.every(g => stopWords.has(g))) continue;

        const phrase = grams.join(' ');
        freqMap.set(phrase, (freqMap.get(phrase) || 0) + 1);
      }

      const totalPossible = allWords.length - n + 1;
      nGrams[n] = Array.from(freqMap.entries())
        .map(([keyword, count]) => ({
          keyword,
          count,
          density: parseFloat(((count / totalPossible) * 100).toFixed(2)),
        }))
        .filter(item => item.count >= 2)
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);
    }

    return nGrams;
  }

  /**
   * Generate SERP preview data for both desktop and mobile
   * Desktop: Title ~60 chars, Description ~155 chars
   * Mobile: Title ~50-60 chars, Description ~120 chars
   */
  private generateSerpPreview(title: string, description: string, url: string): {
    desktop: { title: string; titleTruncated: boolean; url: string; description: string; descriptionTruncated: boolean };
    mobile: { title: string; titleTruncated: boolean; url: string; description: string; descriptionTruncated: boolean };
  } {
    // Desktop limits
    const desktopTitleLimit = 60;
    const desktopDescLimit = 155;

    // Mobile limits (slightly shorter)
    const mobileTitleLimit = 55;
    const mobileDescLimit = 120;

    // Format URL for SERP display
    let formattedUrl = url;
    try {
      const urlObj = new URL(url);
      // Google shows domain › path format
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0) {
        formattedUrl = `${urlObj.hostname} › ${pathParts.join(' › ')}`;
      } else {
        formattedUrl = urlObj.hostname;
      }
    } catch {
      formattedUrl = url;
    }

    // Truncate with ellipsis if needed
    const truncate = (text: string, limit: number): { text: string; truncated: boolean } => {
      if (text.length <= limit) {
        return { text, truncated: false };
      }
      // Find last space before limit to avoid cutting words
      const truncatedText = text.substring(0, limit);
      const lastSpace = truncatedText.lastIndexOf(' ');
      const finalText = lastSpace > limit * 0.7 ? truncatedText.substring(0, lastSpace) : truncatedText;
      return { text: finalText + '...', truncated: true };
    };

    const desktopTitle = truncate(title, desktopTitleLimit);
    const desktopDesc = truncate(description, desktopDescLimit);
    const mobileTitle = truncate(title, mobileTitleLimit);
    const mobileDesc = truncate(description, mobileDescLimit);

    return {
      desktop: {
        title: desktopTitle.text,
        titleTruncated: desktopTitle.truncated,
        url: formattedUrl,
        description: desktopDesc.text || 'No meta description provided. Google may auto-generate one from page content.',
        descriptionTruncated: desktopDesc.truncated,
      },
      mobile: {
        title: mobileTitle.text,
        titleTruncated: mobileTitle.truncated,
        url: formattedUrl,
        description: mobileDesc.text || 'No meta description provided.',
        descriptionTruncated: mobileDesc.truncated,
      },
    };
  }

  /**
   * Collect resource URLs and HTML snippets for actionable fixes (PageSpeed Insights style)
   */
  private collectResources($: any, html: string, baseUrl: string, brokenLinksData?: Array<{ url: string; anchorText: string; statusCode: number }>) {
    const baseUrlObj = baseUrl ? new URL(baseUrl) : null;

    // Helper to get HTML snippet (truncated for display)
    const getSnippet = (element: any, maxLength = 200): string => {
      try {
        const outer = $.html(element);
        if (!outer) return '';
        // Clean up and truncate
        let snippet = outer.replace(/\s+/g, ' ').trim();
        if (snippet.length > maxLength) {
          snippet = snippet.substring(0, maxLength) + '...';
        }
        return snippet;
      } catch {
        return '';
      }
    };

    // Collect scripts
    const scripts: Array<{ url: string; codeSnippet: string; hasDefer: boolean; hasAsync: boolean }> = [];
    $('script[src]').each((_: number, el: any) => {
      const $el = $(el);
      const src = $el.attr('src');
      if (src) {
        let fullUrl = src;
        if (baseUrlObj && !src.startsWith('http://') && !src.startsWith('https://')) {
          try {
            fullUrl = new URL(src, baseUrlObj.origin).href;
          } catch {
            fullUrl = src;
          }
        }
        scripts.push({
          url: fullUrl,
          codeSnippet: getSnippet(el),
          hasDefer: $el.attr('defer') !== undefined,
          hasAsync: $el.attr('async') !== undefined,
        });
      }
    });

    // Collect stylesheets
    const stylesheets: Array<{ url: string; codeSnippet: string }> = [];
    $('link[rel="stylesheet"]').each((_: number, el: any) => {
      const $el = $(el);
      const href = $el.attr('href');
      if (href) {
        let fullUrl = href;
        if (baseUrlObj && !href.startsWith('http://') && !href.startsWith('https://')) {
          try {
            fullUrl = new URL(href, baseUrlObj.origin).href;
          } catch {
            fullUrl = href;
          }
        }
        stylesheets.push({
          url: fullUrl,
          codeSnippet: getSnippet(el),
        });
      }
    });

    // Collect images (for optimization opportunities)
    const images: Array<{ url: string; codeSnippet: string; alt: string; width?: number; height?: number }> = [];
    $('img[src]').each((_: number, el: any) => {
      const $el = $(el);
      const src = $el.attr('src');
      if (src) {
        let fullUrl = src;
        if (baseUrlObj && !src.startsWith('http://') && !src.startsWith('https://')) {
          try {
            fullUrl = new URL(src, baseUrlObj.origin).href;
          } catch {
            fullUrl = src;
          }
        }
        images.push({
          url: fullUrl,
          codeSnippet: getSnippet(el),
          alt: $el.attr('alt') || '',
          width: $el.attr('width') ? parseInt($el.attr('width'), 10) : undefined,
          height: $el.attr('height') ? parseInt($el.attr('height'), 10) : undefined,
        });
      }
    });

    // Collect broken links with code snippets
    const brokenLinksWithSnippets: Array<{ url: string; codeSnippet: string; statusCode: number }> = [];
    if (brokenLinksData && brokenLinksData.length > 0) {
      brokenLinksData.slice(0, 20).forEach((link: any) => {
        let codeSnippet = '';

        // If element is stored, use it directly
        if (link.element) {
          try {
            const $linkEl = $(link.element);
            codeSnippet = $linkEl.prop('outerHTML') || '';
          } catch {
            // Fallback
          }
        }

        // If no snippet yet, try to find element in DOM
        if (!codeSnippet) {
          let linkElement = $(`a[href="${link.href || link.url}"]`).first();
          if (linkElement.length === 0 && link.url) {
            // Try with full URL
            linkElement = $(`a[href="${link.url}"]`).first();
          }
          if (linkElement.length === 0 && link.href) {
            // Try partial match
            const urlParts = (link.href || link.url).split('/');
            const lastPart = urlParts[urlParts.length - 1];
            if (lastPart) {
              linkElement = $(`a[href*="${lastPart}"]`).first();
            }
          }

          if (linkElement.length > 0) {
            try {
              codeSnippet = linkElement.prop('outerHTML') || linkElement.html() || '';
            } catch {
              // Fallback
            }
          }
        }

        // Final fallback
        if (!codeSnippet || codeSnippet.length < 10) {
          codeSnippet = `<a href="${link.url || link.href}">${link.anchorText || link.url || link.href}</a>`;
        }

        brokenLinksWithSnippets.push({
          url: link.url || link.href,
          codeSnippet: codeSnippet.length > 300 ? codeSnippet.substring(0, 300) + '...' : codeSnippet,
          statusCode: link.statusCode,
        });
      });
    }

    return {
      scripts: scripts.slice(0, 50), // Limit to 50 for performance
      stylesheets: stylesheets.slice(0, 50),
      images: images.slice(0, 100), // More images allowed
      brokenLinks: brokenLinksWithSnippets,
    };
  }
}
