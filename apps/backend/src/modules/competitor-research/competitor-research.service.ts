import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { WebScraperService, ScrapedSEOData } from '../seo/services/web-scraper.service';

export interface CompetitorAnalysis {
  url: string;
  analyzedAt: string;

  // Basic page info
  metaTitle: string;
  metaDescription: string;
  h1Tag: string;
  pageSlug: string;

  // Content analysis
  pageContent: {
    wordCount: number;
    paragraphCount: number;
    readabilityScore: number;
  };

  // Keywords (n-grams: 1-6 words)
  keywords: {
    singleWord: Array<{ keyword: string; count: number; density: number }>;
    twoWords: Array<{ keyword: string; count: number; density: number }>;
    threeWords: Array<{ keyword: string; count: number; density: number }>;
    fourWords: Array<{ keyword: string; count: number; density: number }>;
    fiveWords: Array<{ keyword: string; count: number; density: number }>;
    sixWords: Array<{ keyword: string; count: number; density: number }>;
  };

  // Schema/Structured data
  schema: {
    exists: boolean;
    types: string[];
    data: any[];
  };

  // Heading structure
  headings: {
    structure: Array<{ tag: string; text: string; level: number }>;
    h1Count: number;
    h2Count: number;
    h3Count: number;
    h4Count: number;
    h5Count: number;
    h6Count: number;
    issues: string[];
  };

  // Links
  links: {
    internal: {
      count: number;
      links: Array<{ url: string; anchorText: string }>;
    };
    external: {
      count: number;
      links: Array<{ url: string; anchorText: string }>;
    };
    total: number;
  };

  // Images
  images: {
    total: number;
    withAlt: number;
    withoutAlt: number;
    withTitle: number;
    withoutTitle: number;
    duplicates: Array<{ src: string; count: number }>;
    withoutAltList: Array<{ src: string; alt: string; title: string }>;
    withoutTitleList: Array<{ src: string; alt: string; title: string }>;
    allImages: Array<{
      src: string;
      alt: string;
      title: string;
      hasAlt: boolean;
      hasTitle: boolean;
      width?: number;
      height?: number;
      estimatedSize?: string;
    }>;
  };

  // Performance
  performance: {
    lcp: number;
    fcp: number;
    loadTime: number;
    domSize: number;
    pageSize: number;
  };

  // Technical
  technical: {
    isHttps: boolean;
    hasCanonical: boolean;
    canonicalUrl: string;
    hasViewport: boolean;
    isIndexable: boolean;
  };
}

export interface ComparisonResult {
  website1: CompetitorAnalysis;
  website2: CompetitorAnalysis;
  comparison: {
    metaTitle: { winner: 'website1' | 'website2' | 'tie'; reason: string };
    metaDescription: { winner: 'website1' | 'website2' | 'tie'; reason: string };
    wordCount: { winner: 'website1' | 'website2' | 'tie'; reason: string };
    headingStructure: { winner: 'website1' | 'website2' | 'tie'; reason: string };
    imageOptimization: { winner: 'website1' | 'website2' | 'tie'; reason: string };
    performance: { winner: 'website1' | 'website2' | 'tie'; reason: string };
    schemaMarkup: { winner: 'website1' | 'website2' | 'tie'; reason: string };
    internalLinking: { winner: 'website1' | 'website2' | 'tie'; reason: string };
  };
}

@Injectable()
export class CompetitorResearchService {
  private readonly logger = new Logger(CompetitorResearchService.name);

  constructor(private readonly webScraperService: WebScraperService) {}

  /**
   * Analyze a single competitor website
   */
  async analyzeCompetitor(url: string): Promise<CompetitorAnalysis> {
    this.logger.log(`Analyzing competitor: ${url}`);

    try {
      // Normalize URL
      const normalizedUrl = this.normalizeUrl(url);

      // Scrape the page using existing service
      const scraped = await this.webScraperService.scrapePage(normalizedUrl);

      // Transform scraped data into competitor analysis format
      return this.transformToCompetitorAnalysis(normalizedUrl, scraped);
    } catch (error: any) {
      this.logger.error(`Failed to analyze competitor ${url}: ${error.message}`);

      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new BadRequestException(
          `Unable to reach the website. Please check if the URL is correct and the website is accessible.`,
        );
      }

      if (error.response?.status === 403) {
        throw new BadRequestException(
          `Access denied by the website. The site may be blocking automated requests.`,
        );
      }

      if (error.response?.status === 404) {
        throw new BadRequestException(
          `Page not found. Please check if the URL is correct.`,
        );
      }

      throw new BadRequestException(
        `Failed to analyze the website: ${error.message}`,
      );
    }
  }

  /**
   * Compare two websites side by side
   */
  async compareWebsites(url1: string, url2: string): Promise<ComparisonResult> {
    this.logger.log(`Comparing websites: ${url1} vs ${url2}`);

    // Analyze both websites in parallel
    const [website1, website2] = await Promise.all([
      this.analyzeCompetitor(url1),
      this.analyzeCompetitor(url2),
    ]);

    // Generate comparison insights
    const comparison = this.generateComparison(website1, website2);

    return {
      website1,
      website2,
      comparison,
    };
  }

  private normalizeUrl(url: string): string {
    let normalized = url.trim();
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      normalized = `https://${normalized}`;
    }
    return normalized;
  }

  private transformToCompetitorAnalysis(url: string, scraped: ScrapedSEOData): CompetitorAnalysis {
    const urlObj = new URL(url);

    // Find duplicate images
    const imageSrcCounts = new Map<string, number>();
    scraped.onPageSEO.images.details.forEach((img) => {
      const src = img.src;
      if (src) {
        imageSrcCounts.set(src, (imageSrcCounts.get(src) || 0) + 1);
      }
    });
    const duplicateImages = Array.from(imageSrcCounts.entries())
      .filter(([_, count]) => count > 1)
      .map(([src, count]) => ({ src, count }))
      .sort((a, b) => b.count - a.count);

    // Get images without alt
    const imagesWithoutAlt = scraped.onPageSEO.images.details.filter((img) => !img.hasAlt);
    const imagesWithoutTitle = scraped.onPageSEO.images.details.filter((img) => !img.hasTitle);

    return {
      url,
      analyzedAt: new Date().toISOString(),

      // Basic page info
      metaTitle: scraped.onPageSEO.titleTag.content,
      metaDescription: scraped.onPageSEO.metaDescription.content,
      h1Tag: scraped.onPageSEO.headings.h1[0] || '',
      pageSlug: urlObj.pathname,

      // Content analysis
      pageContent: {
        wordCount: scraped.onPageSEO.content.wordCount,
        paragraphCount: scraped.onPageSEO.content.paragraphCount,
        readabilityScore: scraped.onPageSEO.content.readabilityScore,
      },

      // Keywords (n-grams)
      keywords: {
        singleWord: scraped.onPageSEO.content.nGrams[1] || [],
        twoWords: scraped.onPageSEO.content.nGrams[2] || [],
        threeWords: scraped.onPageSEO.content.nGrams[3] || [],
        fourWords: scraped.onPageSEO.content.nGrams[4] || [],
        fiveWords: scraped.onPageSEO.content.nGrams[5] || [],
        sixWords: scraped.onPageSEO.content.nGrams[6] || [],
      },

      // Schema
      schema: {
        exists: scraped.structuredData.hasSchema,
        types: scraped.structuredData.types,
        data: scraped.structuredData.jsonLd,
      },

      // Headings
      headings: {
        structure: scraped.onPageSEO.headings.structure,
        h1Count: scraped.onPageSEO.headings.h1.length,
        h2Count: scraped.onPageSEO.headings.h2.length,
        h3Count: scraped.onPageSEO.headings.h3.length,
        h4Count: scraped.onPageSEO.headings.h4.length,
        h5Count: scraped.onPageSEO.headings.h5.length,
        h6Count: scraped.onPageSEO.headings.h6.length,
        issues: scraped.onPageSEO.headings.issues,
      },

      // Links
      links: {
        internal: scraped.onPageSEO.links.internal,
        external: scraped.onPageSEO.links.external,
        total: scraped.onPageSEO.links.total,
      },

      // Images
      images: {
        total: scraped.onPageSEO.images.total,
        withAlt: scraped.onPageSEO.images.withAlt,
        withoutAlt: scraped.onPageSEO.images.withoutAlt,
        withTitle: scraped.onPageSEO.images.withTitle,
        withoutTitle: scraped.onPageSEO.images.withoutTitle,
        duplicates: duplicateImages,
        withoutAltList: imagesWithoutAlt.map((img) => ({
          src: img.src,
          alt: img.alt,
          title: img.title,
        })),
        withoutTitleList: imagesWithoutTitle.map((img) => ({
          src: img.src,
          alt: img.alt,
          title: img.title,
        })),
        allImages: scraped.resources.images.map((img) => ({
          src: img.url,
          alt: img.alt,
          title: '',
          hasAlt: !!img.alt,
          hasTitle: false,
          width: img.width,
          height: img.height,
          estimatedSize: img.width && img.height
            ? this.estimateImageSize(img.width, img.height)
            : undefined,
        })),
      },

      // Performance
      performance: {
        lcp: scraped.performance.lcp,
        fcp: scraped.performance.fcp,
        loadTime: scraped.performance.loadTime,
        domSize: scraped.rawData.domNodeCount,
        pageSize: scraped.performance.pageSize,
      },

      // Technical
      technical: {
        isHttps: scraped.security.https.isSecure,
        hasCanonical: scraped.technical.canonicalTag.exists,
        canonicalUrl: scraped.technical.canonicalTag.url,
        hasViewport: scraped.mobile.viewport.hasViewportTag,
        isIndexable: scraped.technical.robotsMeta.isIndexable,
      },
    };
  }

  private estimateImageSize(width: number, height: number): string {
    // Rough estimate: 24 bits per pixel for uncompressed, assume ~10% for compressed JPEG
    const pixels = width * height;
    const estimatedBytes = pixels * 3 * 0.1; // 3 bytes per pixel * 10% compression

    if (estimatedBytes < 1024) return `~${Math.round(estimatedBytes)} B`;
    if (estimatedBytes < 1024 * 1024) return `~${Math.round(estimatedBytes / 1024)} KB`;
    return `~${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  private generateComparison(w1: CompetitorAnalysis, w2: CompetitorAnalysis): ComparisonResult['comparison'] {
    return {
      metaTitle: this.compareMetaTitle(w1, w2),
      metaDescription: this.compareMetaDescription(w1, w2),
      wordCount: this.compareWordCount(w1, w2),
      headingStructure: this.compareHeadingStructure(w1, w2),
      imageOptimization: this.compareImageOptimization(w1, w2),
      performance: this.comparePerformance(w1, w2),
      schemaMarkup: this.compareSchemaMarkup(w1, w2),
      internalLinking: this.compareInternalLinking(w1, w2),
    };
  }

  private compareMetaTitle(w1: CompetitorAnalysis, w2: CompetitorAnalysis) {
    const len1 = w1.metaTitle.length;
    const len2 = w2.metaTitle.length;
    const optimal = (len: number) => len >= 50 && len <= 60;

    if (optimal(len1) && !optimal(len2)) {
      return { winner: 'website1' as const, reason: `Website 1 has optimal title length (${len1} chars)` };
    }
    if (optimal(len2) && !optimal(len1)) {
      return { winner: 'website2' as const, reason: `Website 2 has optimal title length (${len2} chars)` };
    }
    if (!w1.metaTitle && w2.metaTitle) {
      return { winner: 'website2' as const, reason: 'Website 1 is missing a title tag' };
    }
    if (w1.metaTitle && !w2.metaTitle) {
      return { winner: 'website1' as const, reason: 'Website 2 is missing a title tag' };
    }
    return { winner: 'tie' as const, reason: 'Both have similar title optimization' };
  }

  private compareMetaDescription(w1: CompetitorAnalysis, w2: CompetitorAnalysis) {
    const len1 = w1.metaDescription.length;
    const len2 = w2.metaDescription.length;
    const optimal = (len: number) => len >= 150 && len <= 160;

    if (optimal(len1) && !optimal(len2)) {
      return { winner: 'website1' as const, reason: `Website 1 has optimal description length (${len1} chars)` };
    }
    if (optimal(len2) && !optimal(len1)) {
      return { winner: 'website2' as const, reason: `Website 2 has optimal description length (${len2} chars)` };
    }
    if (!w1.metaDescription && w2.metaDescription) {
      return { winner: 'website2' as const, reason: 'Website 1 is missing a meta description' };
    }
    if (w1.metaDescription && !w2.metaDescription) {
      return { winner: 'website1' as const, reason: 'Website 2 is missing a meta description' };
    }
    return { winner: 'tie' as const, reason: 'Both have similar description optimization' };
  }

  private compareWordCount(w1: CompetitorAnalysis, w2: CompetitorAnalysis) {
    const wc1 = w1.pageContent.wordCount;
    const wc2 = w2.pageContent.wordCount;
    const minGood = 300;

    if (wc1 >= minGood && wc2 < minGood) {
      return { winner: 'website1' as const, reason: `Website 1 has more substantial content (${wc1} vs ${wc2} words)` };
    }
    if (wc2 >= minGood && wc1 < minGood) {
      return { winner: 'website2' as const, reason: `Website 2 has more substantial content (${wc2} vs ${wc1} words)` };
    }
    if (wc1 > wc2 * 1.5) {
      return { winner: 'website1' as const, reason: `Website 1 has significantly more content (${wc1} vs ${wc2} words)` };
    }
    if (wc2 > wc1 * 1.5) {
      return { winner: 'website2' as const, reason: `Website 2 has significantly more content (${wc2} vs ${wc1} words)` };
    }
    return { winner: 'tie' as const, reason: `Similar content length (${wc1} vs ${wc2} words)` };
  }

  private compareHeadingStructure(w1: CompetitorAnalysis, w2: CompetitorAnalysis) {
    const issues1 = w1.headings.issues.length;
    const issues2 = w2.headings.issues.length;
    const hasProperH1_1 = w1.headings.h1Count === 1;
    const hasProperH1_2 = w2.headings.h1Count === 1;

    if (hasProperH1_1 && !hasProperH1_2) {
      return { winner: 'website1' as const, reason: 'Website 1 has proper H1 structure' };
    }
    if (hasProperH1_2 && !hasProperH1_1) {
      return { winner: 'website2' as const, reason: 'Website 2 has proper H1 structure' };
    }
    if (issues1 < issues2) {
      return { winner: 'website1' as const, reason: 'Website 1 has fewer heading structure issues' };
    }
    if (issues2 < issues1) {
      return { winner: 'website2' as const, reason: 'Website 2 has fewer heading structure issues' };
    }
    return { winner: 'tie' as const, reason: 'Similar heading structure' };
  }

  private compareImageOptimization(w1: CompetitorAnalysis, w2: CompetitorAnalysis) {
    const pct1 = w1.images.total > 0 ? (w1.images.withAlt / w1.images.total) * 100 : 100;
    const pct2 = w2.images.total > 0 ? (w2.images.withAlt / w2.images.total) * 100 : 100;

    if (pct1 > pct2 + 10) {
      return { winner: 'website1' as const, reason: `Website 1 has better image alt text coverage (${pct1.toFixed(0)}% vs ${pct2.toFixed(0)}%)` };
    }
    if (pct2 > pct1 + 10) {
      return { winner: 'website2' as const, reason: `Website 2 has better image alt text coverage (${pct2.toFixed(0)}% vs ${pct1.toFixed(0)}%)` };
    }
    return { winner: 'tie' as const, reason: 'Similar image optimization' };
  }

  private comparePerformance(w1: CompetitorAnalysis, w2: CompetitorAnalysis) {
    const lcp1 = w1.performance.lcp;
    const lcp2 = w2.performance.lcp;

    if (lcp1 < lcp2 * 0.8) {
      return { winner: 'website1' as const, reason: `Website 1 loads faster (LCP: ${lcp1}s vs ${lcp2}s)` };
    }
    if (lcp2 < lcp1 * 0.8) {
      return { winner: 'website2' as const, reason: `Website 2 loads faster (LCP: ${lcp2}s vs ${lcp1}s)` };
    }
    return { winner: 'tie' as const, reason: 'Similar performance' };
  }

  private compareSchemaMarkup(w1: CompetitorAnalysis, w2: CompetitorAnalysis) {
    if (w1.schema.exists && !w2.schema.exists) {
      return { winner: 'website1' as const, reason: `Website 1 has schema markup (${w1.schema.types.join(', ')})` };
    }
    if (w2.schema.exists && !w1.schema.exists) {
      return { winner: 'website2' as const, reason: `Website 2 has schema markup (${w2.schema.types.join(', ')})` };
    }
    if (w1.schema.types.length > w2.schema.types.length) {
      return { winner: 'website1' as const, reason: `Website 1 has more schema types (${w1.schema.types.length} vs ${w2.schema.types.length})` };
    }
    if (w2.schema.types.length > w1.schema.types.length) {
      return { winner: 'website2' as const, reason: `Website 2 has more schema types (${w2.schema.types.length} vs ${w1.schema.types.length})` };
    }
    return { winner: 'tie' as const, reason: 'Similar schema implementation' };
  }

  private compareInternalLinking(w1: CompetitorAnalysis, w2: CompetitorAnalysis) {
    const links1 = w1.links.internal.count;
    const links2 = w2.links.internal.count;

    if (links1 > links2 * 1.5 && links1 >= 10) {
      return { winner: 'website1' as const, reason: `Website 1 has stronger internal linking (${links1} vs ${links2} links)` };
    }
    if (links2 > links1 * 1.5 && links2 >= 10) {
      return { winner: 'website2' as const, reason: `Website 2 has stronger internal linking (${links2} vs ${links1} links)` };
    }
    return { winner: 'tie' as const, reason: 'Similar internal linking' };
  }
}
