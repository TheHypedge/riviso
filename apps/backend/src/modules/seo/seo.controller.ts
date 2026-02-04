import { Controller, Get, Post, Param, Body, Query, UseGuards, Logger, Optional } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SeoService } from './seo.service';
import { WebsiteCrawlService } from './services/website-crawl.service';
import { AnalyzeUrlDto } from './dto/analyze-url.dto';
import { OffPageCrawlDto } from './dto/off-page-crawl.dto';

@ApiTags('SEO')
@Controller('seo')
export class SeoController {
  private readonly logger = new Logger(SeoController.name);

  constructor(
    private readonly seoService: SeoService,
    @Optional() private readonly websiteCrawlService: WebsiteCrawlService,
  ) { }

  @Post('audit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run SEO audit for a URL' })
  async runAudit(@Body('url') url: string, @Body('projectId') projectId: string) {
    return this.seoService.runAudit(url, projectId);
  }

  @Get('audits/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SEO audits for project' })
  async getAudits(@Param('projectId') projectId: string) {
    return this.seoService.getAudits(projectId);
  }

  @Get('audit/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific audit details' })
  async getAuditDetails(@Param('id') id: string) {
    return this.seoService.getAuditDetails(id);
  }

  @Post('analyze-url')
  @ApiOperation({ summary: 'Analyze any website URL and get comprehensive metrics' })
  async analyzeUrl(@Body() dto: AnalyzeUrlDto) {
    this.logger.log(`Analyzing URL: ${dto.url}`);
    try {
      const result = await this.seoService.analyzeUrl(dto);
      this.logger.log(`Successfully analyzed: ${dto.url}`);
      return result;
    } catch (error) {
      this.logger.error(`Error analyzing ${dto.url}: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('off-page-crawl')
  @ApiOperation({ summary: 'Run Off-Page analysis via scraper engine. Triggered only when user clicks Off Page tab.' })
  async offPageCrawl(@Body() dto: OffPageCrawlDto) {
    this.logger.log(`Off-page crawl requested: ${dto.url}`);
    return this.seoService.offPageCrawl(dto.url);
  }

  @Post('start-crawl')
  @ApiOperation({ summary: 'Start a background website crawl. Returns job ID immediately.' })
  async startCrawl(@Body() dto: { url: string; forceReCrawl?: boolean }) {
    if (!this.websiteCrawlService) {
      return { error: 'Database not configured. Crawl service unavailable.' };
    }
    this.logger.log(`Crawl requested for: ${dto.url}, forceReCrawl: ${dto.forceReCrawl || false}`);
    return this.websiteCrawlService.startCrawl(dto.url, dto.forceReCrawl || false);
  }

  @Get('crawl-status/:jobId')
  @ApiOperation({ summary: 'Get crawl job status and progress' })
  async getCrawlStatus(@Param('jobId') jobId: string) {
    if (!this.websiteCrawlService) {
      return { error: 'Database not configured. Crawl service unavailable.' };
    }
    const status = await this.websiteCrawlService.getCrawlStatus(jobId);
    if (!status) {
      return { error: 'Job not found' };
    }
    return status;
  }

  @Get('latest-analysis')
  @ApiOperation({ summary: 'Get the latest completed analysis for a website' })
  async getLatestAnalysis(@Query('url') url: string) {
    if (!url) {
      return { error: 'URL parameter is required' };
    }
    if (!this.websiteCrawlService) {
      return { error: 'Database not configured. Analysis service unavailable.' };
    }
    const analysis = await this.websiteCrawlService.getLatestAnalysis(url);
    if (!analysis) {
      return { message: 'No analysis found for this website' };
    }
    return analysis;
  }

  @Get('historical-analyses')
  @ApiOperation({ summary: 'Get historical analyses for a website (for comparison)' })
  async getHistoricalAnalyses(@Query('url') url: string, @Query('limit') limit?: string) {
    if (!url) {
      return { error: 'URL parameter is required' };
    }
    if (!this.websiteCrawlService) {
      return { error: 'Database not configured. Analysis service unavailable.' };
    }
    const analyses = await this.websiteCrawlService.getHistoricalAnalyses(url, limit ? parseInt(limit) : 10);
    return { analyses, count: analyses.length };
  }

  @Get('compare-analyses')
  @ApiOperation({ summary: 'Compare two analyses and return differences' })
  async compareAnalyses(
    @Query('currentId') currentId: string,
    @Query('previousId') previousId: string,
  ) {
    if (!currentId || !previousId) {
      return { error: 'Both currentId and previousId are required' };
    }
    if (!this.websiteCrawlService) {
      return { error: 'Database not configured. Analysis service unavailable.' };
    }
    return this.websiteCrawlService.compareAnalyses(currentId, previousId);
  }
}
