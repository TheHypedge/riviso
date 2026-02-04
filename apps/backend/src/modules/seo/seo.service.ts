import { Injectable, Logger, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  SeoAudit,
  SeoIssue,
  SeoIssueType,
  IssueSeverity,
  SeoMetrics,
  SeoRecommendation,
} from '@riviso/shared-types';
import { AnalyzeUrlDto } from './dto/analyze-url.dto';
import { WebScraperService, ScrapedSEOData } from './services/web-scraper.service';
import { buildTechnicalSeoReport } from './services/technical-seo-report.builder';
import { buildTechnicalSeoSummary } from './services/technical-seo-summary.builder';
import { buildTechnicalSeoAdvanced } from './services/technical-seo-advanced.builder';
import { mapEngineResponseToOffPageReport } from './services/off-page-engine-mapper';
import type { EngineOffPageResponse } from './services/off-page-engine-mapper';

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);

  constructor(
    private readonly webScraperService: WebScraperService,
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) { }

  /**
   * Run a comprehensive SEO audit using REAL web scraping
   */
  async runAudit(url: string, projectId: string): Promise<SeoAudit> {
    try {
      this.logger.log(`Running SEO audit for: ${url}`);

      // Scrape the page
      const scrapedData = await this.webScraperService.scrapePage(url);

      // Convert scraped data to audit format
      const issues = this.convertToIssues(scrapedData);
      const score = this.calculateSEOScore(scrapedData);
      const metrics = this.convertToMetrics(scrapedData);
      const recommendations = this.generateRecommendations(scrapedData);

      const audit: SeoAudit = {
        id: `audit-${Date.now()}`,
        projectId,
        url,
        score,
        issues,
        metrics,
        recommendations,
        createdAt: new Date().toISOString(),
      };

      return audit;
    } catch (error) {
      this.logger.error(`Error running audit for ${url}: ${error.message}`);
      throw new BadRequestException(`Failed to analyze ${url}: ${error.message}`);
    }
  }

  async getAudits(projectId: string): Promise<SeoAudit[]> {
    // Mock implementation - in production, fetch from database
    return [];
  }

  async getAuditDetails(id: string): Promise<SeoAudit> {
    // Mock implementation - in production, fetch from database
    throw new BadRequestException('Audit not found');
  }

  /**
   * Analyze any website URL with REAL scraping
   */
  async analyzeUrl(dto: AnalyzeUrlDto): Promise<any> {
    try {
      this.logger.log(`Analyzing URL: ${dto.url}`);

      // Scrape the page
      const scrapedData = await this.webScraperService.scrapePage(dto.url);

      // Calculate overall score
      const score = this.calculateSEOScore(scrapedData);

      // Extract domain from URL
      let domain = '';
      try {
        const urlObj = new URL(dto.url);
        domain = urlObj.hostname.replace(/^www\./, '');
      } catch (e) {
        domain = scrapedData.technical?.url?.original || dto.url;
      }

      // Build comprehensive analysis result
      return {
        url: dto.url,
        domain,
        score,

        // On-Page SEO Details
        onPageSEO: {
          title: scrapedData.onPageSEO.titleTag, // Map titleTag to title for frontend
          metaDescription: scrapedData.onPageSEO.metaDescription,
          headings: scrapedData.onPageSEO.headings,
          images: scrapedData.onPageSEO.images,
          content: scrapedData.onPageSEO.content,
          internalLinks: scrapedData.onPageSEO.links.internal, // Map links.internal to internalLinks
          externalLinks: scrapedData.onPageSEO.links.external, // Map links.external to externalLinks
          brokenLinks: scrapedData.onPageSEO.links.broken, // Map links.broken to brokenLinks
          crawledUrls: scrapedData.onPageSEO.crawledUrls, // All crawled URLs with status codes
          serpPreview: scrapedData.onPageSEO.serpPreview, // Google SERP preview (desktop/mobile)
        },

        // Performance Metrics
        performance: {
          ...scrapedData.performance,
          score: this.calculatePerformanceScore(scrapedData.performance),
        },

        // Mobile Optimization
        mobile: {
          ...scrapedData.mobile,
          score: this.calculateMobileScore(scrapedData.mobile),
        },

        // Technical SEO
        technical: {
          ...scrapedData.technical,
          score: this.calculateTechnicalScore(scrapedData.technical),
        },

        // Structured Data
        structuredData: scrapedData.structuredData,

        // Security & Compliance
        security: {
          ...scrapedData.security,
          score: this.calculateSecurityScore(scrapedData.security),
        },

        // Integration Tags
        integrations: scrapedData.integrations,

        // Issues (for quick view)
        issues: this.convertToIssues(scrapedData),

        // Recommendations (prioritized)
        recommendations: this.generateRecommendations(scrapedData),

        // Raw stats
        stats: {
          htmlSize: `${(scrapedData.rawData.htmlLength / 1024).toFixed(2)} KB`,
          scriptsCount: scrapedData.rawData.scriptsCount,
          stylesheetsCount: scrapedData.rawData.stylesheetsCount,
          totalResources: scrapedData.rawData.scriptsCount + scrapedData.rawData.stylesheetsCount,
          domNodeCount: scrapedData.rawData.domNodeCount,
        },

        // Technical SEO summary (6 decision-critical pillars)
        technicalSeo: buildTechnicalSeoSummary(scrapedData, dto.url),

        // Technical SEO advanced (hidden by default, available on request)
        technicalSeoAdvanced: buildTechnicalSeoAdvanced(scrapedData, dto.url),

        // Off-Page SEO: not included here. Fetched only when user clicks Off Page tab (POST /seo/off-page-crawl).

        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Error analyzing ${dto.url}: ${error.message}`);
      throw new BadRequestException(`Failed to analyze website: ${error.message}`);
    }
  }

  /**
   * Trigger Link Signals analysis via scraper engine. Called only when user clicks Link Signals tab.
   * Returns live data (no sample). Requires SCRAPER_ENGINE_URL (default http://localhost:8000).
   * Crawls the ENTIRE SITE starting from the provided URL (typically homepage).
   */
  async offPageCrawl(url: string) {
    let domain = '';
    let homepageUrl = url;

    try {
      const u = new URL(url);
      domain = u.hostname.replace(/^www\./, '');

      // Ensure we start from homepage for whole-site crawl
      // If user provided a subpage, use homepage as seed URL
      if (u.pathname !== '/' && u.pathname !== '') {
        homepageUrl = `${u.protocol}//${u.hostname}/`;
        this.logger.log(`Starting whole-site crawl from homepage: ${homepageUrl} (original URL: ${url})`);
      } else {
        this.logger.log(`Starting whole-site crawl from homepage: ${homepageUrl}`);
      }
    } catch {
      throw new BadRequestException('Invalid URL');
    }

    const base = this.config.get<string>('SCRAPER_ENGINE_URL') || 'http://localhost:8000';
    const endpoint = `${base.replace(/\/$/, '')}/off-page-analyze`;
    this.logger.log(`Link signals analysis: whole-site crawl for ${domain} starting from ${homepageUrl}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<EngineOffPageResponse>(endpoint, { url: homepageUrl, domain }, {
          timeout: 300_000, // 5 minutes for whole-site crawl (500 pages can take time)
          validateStatus: (s) => s >= 200 && s < 300,
        }),
      );
      this.logger.log(`Whole-site crawl completed: ${data.pages_crawled} pages, ${data.referring_domains} referring domains, ${data.total_backlinks} backlinks`);
      const offPageSeo = mapEngineResponseToOffPageReport(data);
      return { offPageSeo };
    } catch (e: any) {
      this.logger.warn(`Link signals engine unavailable: ${e?.message || e}`);
      throw new ServiceUnavailableException(
        'Link signals engine unavailable. Start the scraper engine (tools/scraper-engine) or set SCRAPER_ENGINE_URL.',
      );
    }
  }

  private calculateSEOScore(data: ScrapedSEOData): number {
    let score = 100;

    // Title tag (10 points)
    if (!data.onPageSEO.titleTag.isOptimal) score -= 10;

    // Meta description (10 points)
    if (!data.onPageSEO.metaDescription.isOptimal) score -= 10;

    // H1 tags (15 points)
    if (data.onPageSEO.headings.h1.length === 0) score -= 15;
    else if (data.onPageSEO.headings.h1.length > 1) score -= 8;

    // Images alt text (10 points)
    const altTextPercentage = (data.onPageSEO.images.withAlt / data.onPageSEO.images.total) * 100;
    if (altTextPercentage < 50) score -= 10;
    else if (altTextPercentage < 80) score -= 5;

    // Performance (20 points)
    if (data.performance.loadTime > 3000) score -= 20;
    else if (data.performance.loadTime > 2000) score -= 10;

    // HTTPS (10 points)
    if (!data.security.https.isSecure) score -= 10;

    // Mobile viewport (10 points)
    if (!data.mobile.viewport.hasViewportTag) score -= 10;

    // Canonical tag (5 points)
    if (!data.technical.canonicalTag.exists) score -= 5;

    // Favicon (5 points)
    if (!data.technical.favicon.exists) score -= 5;

    // Structured data (5 points)
    if (!data.structuredData.hasSchema) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  private calculatePerformanceScore(performance: any): number {
    let score = 100;
    if (performance.loadTime > 3000) score -= 40;
    else if (performance.loadTime > 2000) score -= 20;
    if (!performance.lazyLoading.implemented) score -= 20;
    if (performance.imageFormats.webp === 0) score -= 10;
    return Math.max(0, score);
  }

  private calculateMobileScore(mobile: any): number {
    let score = 100;
    if (!mobile.viewport.hasViewportTag) score -= 40;
    if (mobile.responsiveImages.percentage < 50) score -= 30;
    return Math.max(0, score);
  }

  private calculateTechnicalScore(technical: any): number {
    let score = 100;
    if (!technical.canonicalTag.exists) score -= 20;
    if (!technical.favicon.exists) score -= 10;
    if (!technical.url.isClean) score -= 15;
    if (technical.url.length > 100) score -= 10;
    return Math.max(0, score);
  }

  private calculateSecurityScore(security: any): number {
    let score = 100;
    if (!security.https.isSecure) score -= 50;
    if (security.mixedContent.hasIssues) score -= 30;
    return Math.max(0, score);
  }

  private convertToIssues(data: ScrapedSEOData): SeoIssue[] {
    const issues: SeoIssue[] = [];

    // Title issues
    if (!data.onPageSEO.titleTag.isOptimal) {
      issues.push({
        type: SeoIssueType.ON_PAGE,
        severity: IssueSeverity.HIGH,
        title: 'Title Tag Length Issue',
        description: data.onPageSEO.titleTag.recommendation,
        affectedPages: [data.technical.url.original],
        impact: 8,
      });
    }

    // Meta description issues
    if (!data.onPageSEO.metaDescription.isOptimal) {
      issues.push({
        type: SeoIssueType.ON_PAGE,
        severity: IssueSeverity.MEDIUM,
        title: 'Meta Description Issue',
        description: data.onPageSEO.metaDescription.recommendation,
        affectedPages: [data.technical.url.original],
        impact: 6,
      });
    }

    // H1 issues
    if (data.onPageSEO.headings.h1.length === 0) {
      issues.push({
        type: SeoIssueType.ON_PAGE,
        severity: IssueSeverity.CRITICAL,
        title: 'Missing H1 Tag',
        description: 'Page is missing an H1 tag, which is crucial for SEO',
        affectedPages: [data.technical.url.original],
        impact: 9,
      });
    } else if (data.onPageSEO.headings.h1.length > 1) {
      issues.push({
        type: SeoIssueType.ON_PAGE,
        severity: IssueSeverity.MEDIUM,
        title: 'Multiple H1 Tags',
        description: `Found ${data.onPageSEO.headings.h1.length} H1 tags. Should only have one per page.`,
        affectedPages: [data.technical.url.original],
        impact: 6,
      });
    }

    // Image alt text issues
    if (data.onPageSEO.images.withoutAlt > 0) {
      issues.push({
        type: SeoIssueType.ON_PAGE,
        severity: IssueSeverity.MEDIUM,
        title: 'Images Missing Alt Text',
        description: `${data.onPageSEO.images.withoutAlt} images are missing alt text`,
        affectedPages: [data.technical.url.original],
        impact: 5,
      });
    }

    // Performance issues
    if (data.performance.loadTime > 3000) {
      issues.push({
        type: SeoIssueType.PERFORMANCE,
        severity: IssueSeverity.CRITICAL,
        title: 'Slow Page Load Time',
        description: `Page loads in ${(data.performance.loadTime / 1000).toFixed(2)}s (should be under 3s)`,
        affectedPages: [data.technical.url.original],
        impact: 9,
      });
    }

    // HTTPS issues
    if (!data.security.https.isSecure) {
      issues.push({
        type: SeoIssueType.TECHNICAL,
        severity: IssueSeverity.CRITICAL,
        title: 'No HTTPS',
        description: 'Website is not using HTTPS, which is required for security and SEO',
        affectedPages: [data.technical.url.original],
        impact: 10,
      });
    }

    // Mobile issues
    if (!data.mobile.viewport.hasViewportTag) {
      issues.push({
        type: SeoIssueType.TECHNICAL,
        severity: IssueSeverity.HIGH,
        title: 'Missing Viewport Meta Tag',
        description: 'Page is missing viewport meta tag for mobile optimization',
        affectedPages: [data.technical.url.original],
        impact: 7,
      });
    }

    return issues;
  }

  private convertToMetrics(data: ScrapedSEOData): SeoMetrics {
    return {
      pageSpeed: Math.max(0, 100 - (data.performance.loadTime / 50)),
      mobileUsability: this.calculateMobileScore(data.mobile),
      coreWebVitals: {
        lcp: data.performance.loadTime / 1000,
        fid: 100,
        cls: 0.1,
      },
      indexability: {
        indexed: 1,
        blocked: 0,
        errors: data.onPageSEO.headings.issues.length,
      },
      backlinks: {
        total: 0, // Would need external API
        unique: 0,
        quality: 0,
      },
    };
  }

  private generateRecommendations(data: ScrapedSEOData): SeoRecommendation[] {
    const recommendations: SeoRecommendation[] = [];

    // Title optimization
    if (!data.onPageSEO.titleTag.isOptimal) {
      recommendations.push({
        id: 'rec-title',
        category: 'on-page',
        priority: 8,
        title: 'Optimize Title Tag',
        description: data.onPageSEO.titleTag.recommendation,
        effort: 'low',
        impact: 'high',
        actionItems: [
          'Keep title between 50-60 characters',
          'Include primary keyword near the beginning',
          'Make it compelling and descriptive',
          'Ensure each page has a unique title',
        ],
      });
    }

    // Performance optimization
    if (data.performance.loadTime > 2000) {
      recommendations.push({
        id: 'rec-performance',
        category: 'technical',
        priority: 9,
        title: 'Improve Page Load Speed',
        description: `Current load time: ${(data.performance.loadTime / 1000).toFixed(2)}s. Target: < 2s`,
        effort: 'medium',
        impact: 'high',
        actionItems: [
          'Compress and optimize images',
          'Enable browser caching',
          'Minify CSS and JavaScript',
          'Use a CDN for static assets',
          'Implement lazy loading for images',
        ],
      });
    }

    // Image optimization
    if (data.onPageSEO.images.withoutAlt > 0) {
      recommendations.push({
        id: 'rec-alt-text',
        category: 'on-page',
        priority: 6,
        title: 'Add Alt Text to Images',
        description: `${data.onPageSEO.images.withoutAlt} images are missing alt text`,
        effort: 'low',
        impact: 'medium',
        actionItems: [
          'Add descriptive alt text to all images',
          'Include relevant keywords naturally',
          'Keep alt text under 125 characters',
          'Describe the image content accurately',
        ],
      });
    }

    // HTTPS recommendation
    if (!data.security.https.isSecure) {
      recommendations.push({
        id: 'rec-https',
        category: 'technical',
        priority: 10,
        title: 'Implement HTTPS',
        description: 'Website must use HTTPS for security and SEO',
        effort: 'medium',
        impact: 'critical',
        actionItems: [
          'Purchase and install SSL certificate',
          'Update all internal links to HTTPS',
          'Set up 301 redirects from HTTP to HTTPS',
          'Update canonical tags',
        ],
      });
    }

    // Mobile optimization
    if (!data.mobile.viewport.hasViewportTag) {
      recommendations.push({
        id: 'rec-mobile',
        category: 'technical',
        priority: 7,
        title: 'Add Viewport Meta Tag',
        description: 'Essential for mobile optimization',
        effort: 'low',
        impact: 'high',
        actionItems: [
          'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
          'Test on multiple mobile devices',
          'Ensure responsive design',
        ],
      });
    }

    // Structured data
    if (!data.structuredData.hasSchema) {
      recommendations.push({
        id: 'rec-schema',
        category: 'on-page',
        priority: 5,
        title: 'Add Structured Data',
        description: 'Implement schema markup for better SERP features',
        effort: 'medium',
        impact: 'medium',
        actionItems: [
          'Add JSON-LD structured data',
          'Implement Organization schema',
          'Add relevant schemas (Article, Product, etc.)',
          'Test with Google Rich Results Tool',
        ],
      });
    }

    return recommendations.sort((a, b) => b.priority - a.priority);
  }
}
