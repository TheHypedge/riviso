import { Controller, Get, Post, Param, Body, UseGuards, Logger, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CroService } from './cro.service';
import { CroIntelligenceService } from './services/cro-intelligence.service';
import { WebScraperService } from '../seo/services/web-scraper.service';
import { PageCroAnalysis, CroExecutiveReport } from '@riviso/shared-types';
import { AnalyzePageIntelligenceDto } from './dto';

@ApiTags('CRO (Conversion Rate Optimization)')
@Controller('cro')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CroController {
  private readonly logger = new Logger(CroController.name);

  constructor(
    private readonly croService: CroService,
    private readonly croIntelligenceService: CroIntelligenceService,
    private readonly webScraperService: WebScraperService,
  ) {}

  /**
   * Helper to resolve URL from either direct URL or websiteId
   */
  private resolveUrl(dto: AnalyzePageIntelligenceDto): string {
    const url = dto.url || dto.websiteId;

    if (!url || url.trim() === '') {
      throw new BadRequestException('Please provide a URL to analyze');
    }

    const trimmedUrl = url.trim();

    // Ensure URL has protocol
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      return `https://${trimmedUrl}`;
    }

    return trimmedUrl;
  }

  @Get('insights/:projectId')
  @ApiOperation({ summary: 'Get CRO insights for project' })
  async getInsights(@Param('projectId') projectId: string) {
    return this.croService.getInsights(projectId);
  }

  @Get('dashboard/:projectId')
  @ApiOperation({ summary: 'Get CRO dashboard data' })
  async getDashboard(@Param('projectId') projectId: string) {
    return this.croService.getDashboard(projectId);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze page for CRO opportunities' })
  async analyzePage(
    @Body('pageUrl') pageUrl: string,
    @Body('projectId') projectId: string,
  ) {
    return this.croService.analyzePage(pageUrl, projectId);
  }

  @Get('recommendations/:insightId')
  @ApiOperation({ summary: 'Get detailed recommendations for insight' })
  async getRecommendations(@Param('insightId') insightId: string) {
    return this.croService.getRecommendations(insightId);
  }

  // ============================================================================
  // CRO INTELLIGENCE PLATFORM ENDPOINTS
  // ============================================================================

  @Post('intelligence/analyze')
  @ApiOperation({
    summary: 'Analyze page for CRO intelligence',
    description: 'Complete CRO analysis including niche detection, persona analysis, UX/UI/Copy/Trust/Navigation/Friction analysis, and recommendations',
  })
  async analyzePageIntelligence(
    @Body() dto: AnalyzePageIntelligenceDto,
  ): Promise<PageCroAnalysis> {
    const url = this.resolveUrl(dto);
    this.logger.log(`Starting CRO Intelligence analysis for: ${url}`);

    // Scrape the page content
    const scrapedData = await this.webScraperService.scrapePage(url);

    // Perform comprehensive CRO analysis
    const analysis = await this.croIntelligenceService.analyzePageForCro(url, scrapedData);

    return analysis;
  }

  @Post('intelligence/report')
  @ApiOperation({
    summary: 'Generate executive CRO report',
    description: 'Generate a comprehensive executive-ready CRO report from analysis',
  })
  async generateExecutiveReport(
    @Body() dto: AnalyzePageIntelligenceDto,
  ): Promise<CroExecutiveReport> {
    const url = this.resolveUrl(dto);
    this.logger.log(`Generating executive CRO report for: ${url}`);

    // Scrape the page content
    const scrapedData = await this.webScraperService.scrapePage(url);

    // Perform comprehensive CRO analysis
    const analysis = await this.croIntelligenceService.analyzePageForCro(url, scrapedData);

    // Generate executive report
    const report = this.croIntelligenceService.generateExecutiveReport(analysis);

    return report;
  }

  @Get('intelligence/niche/:url')
  @ApiOperation({
    summary: 'Detect website niche and business model',
    description: 'Analyze a URL to detect industry, business model, and confidence scores',
  })
  async detectNiche(@Param('url') url: string) {
    this.logger.log(`Detecting niche for: ${url}`);

    const decodedUrl = decodeURIComponent(url);
    const scrapedData = await this.webScraperService.scrapePage(decodedUrl);
    const analysis = await this.croIntelligenceService.analyzePageForCro(decodedUrl, scrapedData);

    return {
      nicheAnalysis: analysis.nicheAnalysis,
      audienceAnalysis: analysis.audienceAnalysis,
    };
  }

  @Get('intelligence/benchmarks/:industry')
  @ApiOperation({
    summary: 'Get industry benchmarks',
    description: 'Get CRO benchmarks for a specific industry',
  })
  async getIndustryBenchmarks(@Param('industry') industry: string) {
    // Industry-specific benchmarks
    const benchmarks: Record<string, any> = {
      'ecommerce': {
        avgConversionRate: 2.5,
        avgBounceRate: 45,
        avgTimeOnPage: 180,
        topPatterns: ['Free shipping messaging', 'Urgency countdown timers', 'Customer reviews', 'Trust badges'],
      },
      'saas': {
        avgConversionRate: 3.0,
        avgBounceRate: 40,
        avgTimeOnPage: 240,
        topPatterns: ['Free trial CTAs', 'Demo videos', 'Feature comparison tables', 'Pricing tiers'],
      },
      'professional-services': {
        avgConversionRate: 4.5,
        avgBounceRate: 50,
        avgTimeOnPage: 120,
        topPatterns: ['Client testimonials', 'Case study callouts', 'Consultation forms', 'Certifications'],
      },
      'healthcare': {
        avgConversionRate: 3.2,
        avgBounceRate: 55,
        avgTimeOnPage: 150,
        topPatterns: ['HIPAA compliance badges', 'Provider credentials', 'Patient testimonials', 'Easy scheduling'],
      },
      'education': {
        avgConversionRate: 3.8,
        avgBounceRate: 42,
        avgTimeOnPage: 200,
        topPatterns: ['Course previews', 'Student testimonials', 'Outcome statistics', 'Instructor credibility'],
      },
    };

    const normalizedIndustry = industry.toLowerCase().replace(/[^a-z]/g, '-');
    return benchmarks[normalizedIndustry] || {
      avgConversionRate: 2.8,
      avgBounceRate: 50,
      avgTimeOnPage: 150,
      topPatterns: ['Clear value propositions', 'Trust signals', 'Strong CTAs', 'Social proof'],
    };
  }
}
