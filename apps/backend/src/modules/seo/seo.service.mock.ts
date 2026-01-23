import { Injectable, Logger } from '@nestjs/common';
import {
  SeoAudit,
  SeoIssue,
  SeoIssueType,
  IssueSeverity,
  SeoMetrics,
  SeoRecommendation,
} from '@riviso/shared-types';
import { AnalyzeUrlDto, UrlAnalysisResult } from './dto/analyze-url.dto';
import { WebScraperService, ScrapedSEOData } from './services/web-scraper.service';

@Injectable()
export class SeoService {
  private readonly logger = new Logger(SeoService.name);

  constructor(private readonly webScraperService: WebScraperService) {}
  /**
   * Run a comprehensive SEO audit
   * Mock implementation - replace with actual crawling and analysis
   */
  async runAudit(url: string, projectId: string): Promise<SeoAudit> {
    // Simulate audit processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    const audit: SeoAudit = {
      id: `audit-${Date.now()}`,
      projectId,
      url,
      score: 78,
      issues: this.generateMockIssues(),
      metrics: this.generateMockMetrics(),
      recommendations: this.generateMockRecommendations(),
      createdAt: new Date().toISOString(),
    };

    return audit;
  }

  async getAudits(projectId: string): Promise<SeoAudit[]> {
    // Mock implementation - return recent audits
    return [
      await this.runAudit('https://example.com', projectId),
    ];
  }

  async getAuditDetails(id: string): Promise<SeoAudit> {
    // Mock implementation
    return {
      id,
      projectId: 'project-123',
      url: 'https://example.com',
      score: 78,
      issues: this.generateMockIssues(),
      metrics: this.generateMockMetrics(),
      recommendations: this.generateMockRecommendations(),
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Analyze any website URL and return comprehensive metrics
   * Simulates real data fetching with realistic variations based on domain
   */
  async analyzeUrl(dto: AnalyzeUrlDto): Promise<UrlAnalysisResult> {
    // Simulate API call delay (2-4 seconds for realism)
    await new Promise(resolve => setTimeout(resolve, 2500));

    const domain = this.extractDomain(dto.url);
    
    // Generate realistic metrics based on domain characteristics
    const metrics = this.generateRealisticMetrics(domain);
    const topKeywords = this.generateTopKeywords(domain, dto.includeKeywords);
    const competitors = dto.includeCompetitors ? this.generateCompetitors(domain) : [];
    const technicalIssues = this.generateTechnicalIssues(domain);
    const recommendations = this.generateSmartRecommendations(metrics, technicalIssues);

    return {
      url: dto.url,
      domain,
      metrics,
      topKeywords,
      competitors,
      technicalIssues,
      recommendations,
      analyzedAt: new Date().toISOString(),
    };
  }

  private extractDomain(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
    }
  }

  private generateRealisticMetrics(domain: string): any {
    // Use domain name to seed variations (makes results consistent per domain)
    const seed = domain.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const random = (min: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return Math.floor(min + (x - Math.floor(x)) * (max - min));
    };

    // Determine if this looks like a major brand (heuristic)
    const isMajorBrand = domain.length < 10 && !domain.includes('-');
    const isEcommerce = domain.includes('shop') || domain.includes('store') || domain.includes('buy');
    
    const baseDA = isMajorBrand ? random(60, 90) : random(20, 65);
    const baseTraffic = isMajorBrand ? random(500000, 5000000) : isEcommerce ? random(50000, 500000) : random(1000, 100000);

    return {
      // SEO Metrics (0-100)
      domainAuthority: baseDA,
      pageAuthority: Math.min(baseDA + random(-10, 5), 100),
      trustFlow: random(baseDA - 20, baseDA + 10),
      citationFlow: random(baseDA - 15, baseDA + 15),
      
      // Traffic Metrics
      monthlyVisits: baseTraffic,
      avgVisitDuration: random(45, 300), // seconds
      bounceRate: random(35, 75), // percentage
      pagesPerSession: (random(15, 45) / 10), // 1.5 - 4.5
      
      // Ranking Metrics
      totalKeywords: random(baseTraffic / 100, baseTraffic / 50),
      top3Rankings: random(10, baseTraffic / 1000),
      top10Rankings: random(50, baseTraffic / 500),
      top100Rankings: random(200, baseTraffic / 200),
      
      // Performance Metrics
      loadTime: random(800, 3500), // ms
      mobileScore: random(60, 95),
      desktopScore: random(70, 98),
      
      // Backlink Metrics
      totalBacklinks: random(baseDA * 100, baseDA * 1000),
      referringDomains: random(baseDA * 5, baseDA * 50),
      
      // Social Signals
      socialShares: random(baseTraffic / 100, baseTraffic / 20),
    };
  }

  private generateTopKeywords(domain: string, include: boolean = true): any[] {
    if (!include) return [];

    const keywords = [
      { kw: `${domain} login`, vol: 12000, diff: 25 },
      { kw: `${domain} reviews`, vol: 8900, diff: 45 },
      { kw: `${domain} pricing`, vol: 5400, diff: 38 },
      { kw: `best ${domain.split('.')[0]} alternative`, vol: 3200, diff: 62 },
      { kw: `${domain.split('.')[0]} tutorial`, vol: 2800, diff: 32 },
      { kw: `how to use ${domain.split('.')[0]}`, vol: 2100, diff: 28 },
      { kw: `${domain.split('.')[0]} vs`, vol: 1900, diff: 55 },
      { kw: `${domain.split('.')[0]} free trial`, vol: 1600, diff: 48 },
      { kw: `${domain.split('.')[0]} features`, vol: 1200, diff: 35 },
      { kw: `${domain.split('.')[0]} support`, vol: 980, diff: 22 },
    ];

    return keywords.map((k, index) => ({
      keyword: k.kw,
      position: index + 1 + Math.floor(Math.random() * 3),
      searchVolume: k.vol,
      difficulty: k.diff,
      url: `https://${domain}/${k.kw.split(' ')[1] || ''}`,
    })).slice(0, 8);
  }

  private generateCompetitors(domain: string): any[] {
    const baseName = domain.split('.')[0];
    
    return [
      {
        domain: `${baseName}hub.com`,
        commonKeywords: Math.floor(Math.random() * 200) + 150,
        avgPosition: Math.floor(Math.random() * 10) + 5,
      },
      {
        domain: `${baseName}plus.com`,
        commonKeywords: Math.floor(Math.random() * 150) + 100,
        avgPosition: Math.floor(Math.random() * 8) + 8,
      },
      {
        domain: `try${baseName}.com`,
        commonKeywords: Math.floor(Math.random() * 100) + 80,
        avgPosition: Math.floor(Math.random() * 12) + 10,
      },
    ];
  }

  private generateTechnicalIssues(domain: string): any[] {
    const issues = [
      {
        severity: 'critical' as const,
        category: 'Performance',
        issue: 'Page load time exceeds 3 seconds',
        impact: 'Slow pages lose 40% of visitors before loading',
      },
      {
        severity: 'warning' as const,
        category: 'SEO',
        issue: 'Missing meta descriptions on 12 pages',
        impact: 'Reduced CTR in search results',
      },
      {
        severity: 'warning' as const,
        category: 'Mobile',
        issue: 'Text too small on mobile devices',
        impact: 'Poor mobile user experience',
      },
      {
        severity: 'info' as const,
        category: 'Content',
        issue: 'Some pages have thin content (<300 words)',
        impact: 'May not rank well for competitive keywords',
      },
    ];

    // Return 2-4 random issues
    const count = Math.floor(Math.random() * 3) + 2;
    return issues.slice(0, count);
  }

  private generateSmartRecommendations(metrics: any, issues: any[]): any[] {
    const recommendations = [];

    // Performance-based recommendations
    if (metrics.loadTime > 2000) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Performance',
        recommendation: 'Optimize page speed to under 2 seconds',
        estimatedImpact: '+15-25% improvement in rankings and user engagement',
      });
    }

    if (metrics.mobileScore < 80) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Mobile',
        recommendation: 'Improve mobile performance and usability',
        estimatedImpact: '+20-30% increase in mobile traffic',
      });
    }

    // SEO-based recommendations
    if (metrics.domainAuthority < 40) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'Link Building',
        recommendation: 'Build high-quality backlinks from authoritative domains',
        estimatedImpact: '+10-15 point increase in domain authority over 6 months',
      });
    }

    if (metrics.top3Rankings < 20) {
      recommendations.push({
        priority: 'high' as const,
        category: 'Content',
        recommendation: 'Optimize top-ranking content to reach top 3 positions',
        estimatedImpact: '+40-60% increase in organic clicks',
      });
    }

    // Conversion-based recommendations
    if (metrics.bounceRate > 60) {
      recommendations.push({
        priority: 'medium' as const,
        category: 'UX',
        recommendation: 'Reduce bounce rate by improving page relevance and CTAs',
        estimatedImpact: '+10-15% improvement in conversion rate',
      });
    }

    return recommendations.slice(0, 5);
  }

  private generateMockIssues(): SeoIssue[] {
    return [
      {
        type: SeoIssueType.TECHNICAL,
        severity: IssueSeverity.HIGH,
        title: 'Missing Meta Descriptions',
        description: '15 pages are missing meta descriptions',
        affectedPages: ['/about', '/contact', '/blog'],
        impact: 8,
      },
      {
        type: SeoIssueType.ON_PAGE,
        severity: IssueSeverity.MEDIUM,
        title: 'Duplicate H1 Tags',
        description: 'Multiple pages have duplicate H1 tags',
        affectedPages: ['/products', '/services'],
        impact: 6,
      },
      {
        type: SeoIssueType.PERFORMANCE,
        severity: IssueSeverity.CRITICAL,
        title: 'Slow Page Speed',
        description: 'Average page load time exceeds 3 seconds',
        affectedPages: ['/home', '/products'],
        impact: 9,
      },
    ];
  }

  private generateMockMetrics(): SeoMetrics {
    return {
      pageSpeed: 65,
      mobileUsability: 82,
      coreWebVitals: {
        lcp: 2.8,
        fid: 85,
        cls: 0.12,
      },
      indexability: {
        indexed: 145,
        blocked: 12,
        errors: 3,
      },
      backlinks: {
        total: 1240,
        unique: 380,
        quality: 72,
      },
    };
  }

  private generateMockRecommendations(): SeoRecommendation[] {
    return [
      {
        id: 'rec-1',
        category: 'technical',
        priority: 9,
        title: 'Improve Page Speed',
        description: 'Optimize images and enable compression',
        effort: 'medium',
        impact: 'high',
        actionItems: [
          'Compress and optimize all images',
          'Enable Gzip compression',
          'Minify CSS and JavaScript',
          'Implement lazy loading for images',
        ],
      },
      {
        id: 'rec-2',
        category: 'on-page',
        priority: 7,
        title: 'Add Missing Meta Descriptions',
        description: 'Write unique meta descriptions for all pages',
        effort: 'low',
        impact: 'medium',
        actionItems: [
          'Audit all pages without meta descriptions',
          'Write compelling, keyword-rich descriptions',
          'Keep descriptions between 150-160 characters',
        ],
      },
    ];
  }
}
