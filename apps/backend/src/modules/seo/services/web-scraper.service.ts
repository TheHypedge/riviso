import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

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
    headings: {
      h1: string[];
      h2: string[];
      h3: string[];
      h4: string[];
      h5: string[];
      h6: string[];
      structure: string[];
      issues: string[];
    };
    images: {
      total: number;
      withAlt: number;
      withoutAlt: number;
      altTextTooLong: number;
      details: Array<{
        src: string;
        alt: string;
        altLength: number;
        hasAlt: boolean;
      }>;
    };
    content: {
      wordCount: number;
      sentenceCount: number;
      avgWordsPerSentence: number;
      readabilityScore: number;
      paragraphCount: number;
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
}

@Injectable()
export class WebScraperService {
  private readonly logger = new Logger(WebScraperService.name);

  async scrapePage(url: string): Promise<ScrapedSEOData> {
    try {
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
      const loadTime = Date.now() - startTime;
      const html = response.data;
      const $ = cheerio.load(html);

      this.logger.log(`Page loaded in ${loadTime}ms, analyzing...`);

      // Extract all SEO data
      const scrapedData: ScrapedSEOData = {
        onPageSEO: await this.analyzeOnPageSEO($, html, url),
        performance: this.analyzePerformance($, html, loadTime),
        mobile: this.analyzeMobileOptimization($),
        technical: this.analyzeTechnicalSEO($, url),
        structuredData: this.analyzeStructuredData($, html),
        security: this.analyzeSecurityCompliance($, url),
        integrations: this.analyzeIntegrationTags($, html),
        rawData: this.analyzeRawData($, html),
      };

      this.logger.log(`Scraping completed for: ${url}`);
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

    // Headings Analysis
    const h1Array = $('h1').map((_: number, el: any) => $(el).text().trim()).get();
    const h2Array = $('h2').map((_: number, el: any) => $(el).text().trim()).get();
    const h3Array = $('h3').map((_: number, el: any) => $(el).text().trim()).get();
    const h4Array = $('h4').map((_: number, el: any) => $(el).text().trim()).get();
    const h5Array = $('h5').map((_: number, el: any) => $(el).text().trim()).get();
    const h6Array = $('h6').map((_: number, el: any) => $(el).text().trim()).get();

    const headingIssues = [];
    if (h1Array.length === 0) headingIssues.push('No H1 tag found');
    if (h1Array.length > 1) headingIssues.push(`Multiple H1 tags found (${h1Array.length})`);

    // Links Analysis
    const allLinks = $('a[href]');
    const baseUrl = url ? new URL(url) : null;
    const internalLinks: Array<{ url: string; anchorText: string }> = [];
    const externalLinks: Array<{ url: string; anchorText: string }> = [];
    const brokenLinks: Array<{ url: string; anchorText: string; statusCode: number }> = [];

    // Function to check if a link is broken (404 or other error status)
    const checkLinkStatus = async (linkUrl: string): Promise<number | null> => {
      try {
        const response = await axios.head(linkUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RivisoBot/1.0; +https://riviso.com/bot)',
          },
          maxRedirects: 5,
          timeout: 5000,
          validateStatus: () => true, // Don't throw on any status
        });
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
          return response.status;
        } catch (e) {
          return null; // Could not check
        }
      }
    };

    // Collect all links first
    const linksToCheck: Array<{ fullUrl: string; href: string; anchorText: string }> = [];

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
          linksToCheck.push({ fullUrl, href, anchorText });
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

    // Check links in parallel batches (max 10 concurrent)
    const batchSize = 10;
    for (let i = 0; i < linksToCheck.length; i += batchSize) {
      const batch = linksToCheck.slice(i, i + batchSize);
      const batchPromises = batch.map(({ fullUrl, href, anchorText }) =>
        checkLinkStatus(fullUrl).then((statusCode) => {
          // Only include 404 Not Found errors
          if (statusCode === 404) {
            brokenLinks.push({ url: href, anchorText, statusCode: 404 });
          }
        }).catch(() => {
          // Don't add to broken links if check fails - only 404s are considered broken
        })
      );
      await Promise.allSettled(batchPromises);
    }

    // Check all URLs for status codes (for crawled pages view)
    for (let i = 0; i < urlsToCheck.length; i += batchSize) {
      const batch = urlsToCheck.slice(i, i + batchSize);
      const batchPromises = batch.map((urlToCheck) => {
        // Main page URL is always 200
        if (url && urlToCheck === url) {
          allUrls.push({ url: urlToCheck, statusCode: 200 });
          return Promise.resolve();
        }
        
        return checkLinkStatus(urlToCheck).then((statusCode) => {
          allUrls.push({ url: urlToCheck, statusCode: statusCode || null });
        }).catch(() => {
          allUrls.push({ url: urlToCheck, statusCode: null });
        });
      });
      await Promise.allSettled(batchPromises);
    }

    // Images Analysis
    const images = $('img');
    const imageDetails = images.map((_: number, el: any) => {
      const $img = $(el);
      const alt = $img.attr('alt') || '';
      return {
        src: $img.attr('src') || '',
        alt,
        altLength: alt.length,
        hasAlt: !!alt,
      };
    }).get();

    const imagesWithAlt = imageDetails.filter((img: any) => img.hasAlt).length;
    const imagesWithoutAlt = imageDetails.filter((img: any) => !img.hasAlt).length;
    const altTextTooLong = imageDetails.filter((img: any) => img.altLength > 100).length;

    // Content Analysis
    const bodyText = $('body').text();
    const words = bodyText.split(/\s+/).filter((word: string) => word.length > 0);
    const sentences = bodyText.split(/[.!?]+/).filter((s: string) => s.trim().length > 0);
    const paragraphs = $('p').length;

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
      headings: {
        h1: h1Array,
        h2: h2Array,
        h3: h3Array,
        h4: h4Array,
        h5: h5Array,
        h6: h6Array,
        structure: [
          `H1: ${h1Array.length}`,
          `H2: ${h2Array.length}`,
          `H3: ${h3Array.length}`,
          `H4: ${h4Array.length}`,
          `H5: ${h5Array.length}`,
          `H6: ${h6Array.length}`,
        ],
        issues: headingIssues,
      },
      images: {
        total: images.length,
        withAlt: imagesWithAlt,
        withoutAlt: imagesWithoutAlt,
        altTextTooLong,
        details: imageDetails,
      },
      content: {
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgWordsPerSentence: sentences.length > 0 ? words.length / sentences.length : 0,
        readabilityScore: this.calculateReadabilityScore(words.length, sentences.length),
        paragraphCount: paragraphs,
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
}
