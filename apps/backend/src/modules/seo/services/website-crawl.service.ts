import { Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { WebsiteAnalysisEntity } from '../../../infrastructure/database/entities/website-analysis.entity';
import { CrawlJobEntity } from '../../../infrastructure/database/entities/crawl-job.entity';
import { SeoService } from '../seo.service';
import { mapEngineResponseToOffPageReport } from './off-page-engine-mapper';
import type { EngineOffPageResponse } from './off-page-engine-mapper';

export interface CrawlProgress {
  jobId: string;
  status: string;
  progress: number;
  currentStep: string;
  metadata: {
    totalPages: number;
    pagesCrawled: number;
    linksDiscovered: number;
    estimatedTimeRemaining?: number;
  };
}

@Injectable()
export class WebsiteCrawlService {
  private readonly logger = new Logger(WebsiteCrawlService.name);
  private readonly activeCrawls = new Map<string, Promise<void>>();

  constructor(
    @Optional()
    @InjectRepository(WebsiteAnalysisEntity)
    private readonly analysisRepo: Repository<WebsiteAnalysisEntity> | null,
    @Optional()
    @InjectRepository(CrawlJobEntity)
    private readonly jobRepo: Repository<CrawlJobEntity> | null,
    private readonly seoService: SeoService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Clean up old failed jobs on startup
    this.cleanupOldJobs().catch((err) => {
      this.logger.warn(`Failed to cleanup old jobs: ${err.message}`);
    });
  }

  /**
   * Clean up old failed/queued jobs (older than 1 hour)
   */
  private async cleanupOldJobs(): Promise<void> {
    if (!this.jobRepo) return;
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    await this.jobRepo
      .createQueryBuilder()
      .delete()
      .where('status IN (:...statuses)', { statuses: ['failed', 'cancelled'] })
      .andWhere('createdAt < :oneHourAgo', { oneHourAgo })
      .execute();
  }

  /**
   * Start a background crawl job
   * Returns job ID immediately, crawl runs in background
   */
  async startCrawl(websiteUrl: string, forceReCrawl: boolean = false): Promise<{ jobId: string; message: string }> {
    // Check if there's an active crawl
    if (!forceReCrawl && this.jobRepo) {
      const activeJob = await this.jobRepo.findOne({
        where: {
          websiteUrl,
          status: In(['queued', 'crawling', 'processing']),
        },
        order: { createdAt: 'DESC' },
      });
      if (activeJob) {
        return {
          jobId: activeJob.id,
          message: 'Crawl already in progress',
        };
      }
    }

    // Create new crawl job
    const job = this.jobRepo!.create({
      websiteUrl,
      domain: this.extractDomain(websiteUrl),
      status: 'queued',
      progress: 0,
      currentStep: 'Initializing crawl...',
      metadata: {
        totalPages: 0,
        pagesCrawled: 0,
        linksDiscovered: 0,
      },
    });
    const savedJob = await this.jobRepo!.save(job);

    // Start background crawl (don't await)
    this.runCrawlInBackground(savedJob.id, websiteUrl).catch((error) => {
      this.logger.error(`Background crawl failed for job ${savedJob.id}: ${error.message}`, error.stack);
    });

    return {
      jobId: savedJob.id,
      message: 'Crawl started successfully',
    };
  }

  /**
   * Get crawl job status
   */
  async getCrawlStatus(jobId: string): Promise<CrawlProgress | null> {
    if (!this.jobRepo) {
      throw new Error('Database not configured');
    }
    const job = await this.jobRepo.findOne({ where: { id: jobId } });
    if (!job) return null;

    return {
      jobId: job.id,
      status: job.status,
      progress: job.progress,
      currentStep: job.currentStep || 'Processing...',
      metadata: job.metadata || {
        totalPages: 0,
        pagesCrawled: 0,
        linksDiscovered: 0,
      },
    };
  }

  /**
   * Get the latest completed analysis for a website
   */
  async getLatestAnalysis(websiteUrl: string): Promise<WebsiteAnalysisEntity | null> {
    if (!this.analysisRepo) {
      return null;
    }
    return this.analysisRepo.findOne({
      where: { websiteUrl, status: 'completed' },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find analysis by ID
   */
  async getAnalysisById(analysisId: string): Promise<WebsiteAnalysisEntity | null> {
    if (!this.analysisRepo) {
      return null;
    }
    return this.analysisRepo.findOne({ where: { id: analysisId } });
  }

  /**
   * Get historical analyses for comparison
   */
  async getHistoricalAnalyses(websiteUrl: string, limit: number = 10): Promise<WebsiteAnalysisEntity[]> {
    if (!this.analysisRepo) {
      return [];
    }
    return this.analysisRepo.find({
      where: { websiteUrl },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Compare two analyses and return differences
   */
  async compareAnalyses(
    currentAnalysisId: string,
    previousAnalysisId: string,
  ): Promise<{
    seoScoreChange: number;
    metricsChanges: Record<string, { current: number; previous: number; change: number; changePercent: number }>;
    newIssues: string[];
    resolvedIssues: string[];
    recommendations: string[];
  }> {
    if (!this.analysisRepo) {
      throw new Error('Database not configured');
    }
    const current = await this.analysisRepo.findOne({ where: { id: currentAnalysisId } });
    const previous = await this.analysisRepo.findOne({ where: { id: previousAnalysisId } });

    if (!current || !previous) {
      throw new Error('One or both analyses not found');
    }

    const seoScoreChange = (current.seoScore || 0) - (previous.seoScore || 0);

    const metricsChanges: Record<string, { current: number; previous: number; change: number; changePercent: number }> = {};

    // Compare on-page metrics
    if (current.onPageSeo && previous.onPageSeo) {
      const metrics = ['h1Count', 'h2H3Count', 'internalLinks', 'externalLinks'];
      for (const metric of metrics) {
        const currentVal = current.onPageSeo[metric] || 0;
        const previousVal = previous.onPageSeo[metric] || 0;
        const change = currentVal - previousVal;
        const changePercent = previousVal > 0 ? (change / previousVal) * 100 : (currentVal > 0 ? 100 : 0);
        metricsChanges[metric] = {
          current: currentVal,
          previous: previousVal,
          change,
          changePercent,
        };
      }
    }

    // Compare technical SEO issues (simplified)
    const newIssues: string[] = [];
    const resolvedIssues: string[] = [];
    const recommendations: string[] = [];

    // Generate recommendations based on changes
    if (seoScoreChange < 0) {
      recommendations.push(`SEO score decreased by ${Math.abs(seoScoreChange).toFixed(1)} points. Review recent changes.`);
    } else if (seoScoreChange > 0) {
      recommendations.push(`SEO score improved by ${seoScoreChange.toFixed(1)} points. Keep up the good work!`);
    }

    if (metricsChanges.internalLinks?.change < -10) {
      recommendations.push('Internal links decreased significantly. Check for broken links or removed pages.');
    }

    if (metricsChanges.h1Count?.change < 0) {
      recommendations.push('H1 tags decreased. Ensure all pages have proper H1 tags.');
    }

    return {
      seoScoreChange,
      metricsChanges,
      newIssues,
      resolvedIssues,
      recommendations,
    };
  }

  /**
   * Run crawl in background with progress updates
   */
  private async runCrawlInBackground(jobId: string, websiteUrl: string): Promise<void> {
    const startTime = Date.now();
    try {
      if (!this.jobRepo || !this.analysisRepo) {
        throw new Error('Database not configured');
      }

      // Update job status
      await this.jobRepo.update(jobId, {
        status: 'crawling',
        startedAt: new Date(),
      });
      await this.updateProgress(jobId, 5, 'Starting website analysis...');

      // Step 1: On-page SEO analysis (10-30%)
      await this.updateProgress(jobId, 10, 'Analyzing on-page SEO...');
      const onPageResult = await this.seoService.analyzeUrl({ url: websiteUrl });
      await this.updateProgress(jobId, 30, 'On-page analysis completed', {
        pagesCrawled: 1,
        linksDiscovered: ((onPageResult.onPageSEO?.internalLinks?.count || 0) + (onPageResult.onPageSEO?.externalLinks?.count || 0)),
      });

      // Step 2: Technical SEO analysis (30-50%)
      await this.updateProgress(jobId, 35, 'Analyzing technical SEO...');
      // Technical SEO is part of analyzeUrl, so we already have it
      await this.updateProgress(jobId, 50, 'Technical SEO analysis completed');

      // Step 3: Link signals analysis (50-90%)
      await this.updateProgress(jobId, 55, 'Crawling site for link analysis...');
      let linkSignals = null;
      let pagesCrawled = 1;
      try {
        const linkResult = await this.seoService.offPageCrawl(websiteUrl);
        linkSignals = linkResult.offPageSeo;
        pagesCrawled = linkSignals?.engineMeta?.pagesCrawled || 1;
        await this.updateProgress(jobId, 85, 'Link signals analysis completed', {
          totalPages: pagesCrawled,
          pagesCrawled,
          linksDiscovered: linkSignals?.engineMeta?.totalBacklinks || 0,
        });
      } catch (error: any) {
        this.logger.warn(`Link signals analysis failed: ${error.message}`);
        await this.updateProgress(jobId, 85, 'Link signals analysis skipped (engine unavailable)');
      }

      // Step 4: Save to database (90-100%)
      await this.updateProgress(jobId, 90, 'Saving analysis results...');
      const analysis = this.analysisRepo.create({
        websiteUrl,
        domain: this.extractDomain(websiteUrl),
        status: 'completed',
        seoScore: onPageResult.score || 0,
        onPageSeo: {
          h1Count: onPageResult.onPageSEO?.headings?.h1?.length || 0,
          h2H3Count: ((onPageResult.onPageSEO?.headings?.h2?.length || 0) + (onPageResult.onPageSEO?.headings?.h3?.length || 0)),
          internalLinks: onPageResult.onPageSEO?.internalLinks?.count || 0,
          externalLinks: onPageResult.onPageSEO?.externalLinks?.count || 0,
          title: onPageResult.onPageSEO?.title || '',
          description: onPageResult.onPageSEO?.metaDescription || '',
        },
        technicalSeo: onPageResult.technicalSeo || null,
        linkSignals: linkSignals || null,
        crawlMetadata: {
          pagesCrawled: pagesCrawled,
          crawlDuration: Date.now() - startTime,
          startedAt: new Date(startTime),
          completedAt: new Date(),
        },
        rawData: {
          onPageResult,
          linkResult: linkSignals ? { offPageSeo: linkSignals } : null,
        },
      });

      const savedAnalysis = await this.analysisRepo.save(analysis);
      // TypeORM save returns the entity with id
      let analysisId: string;
      if (Array.isArray(savedAnalysis)) {
        if (!savedAnalysis[0]?.id) {
          throw new Error('Failed to save analysis - no ID returned');
        }
        analysisId = savedAnalysis[0].id;
      } else {
        if (!savedAnalysis?.id) {
          throw new Error('Failed to save analysis - no ID returned');
        }
        analysisId = savedAnalysis.id;
      }

      // Mark job as completed
      await this.jobRepo!.update(jobId, {
        status: 'completed',
        progress: 100,
        completedAt: new Date(),
        analysisId,
      });
      await this.updateProgress(jobId, 100, 'Analysis completed successfully');

      this.logger.log(`Crawl completed for ${websiteUrl} in ${Date.now() - startTime}ms`);
    } catch (error: any) {
      this.logger.error(`Crawl failed for ${websiteUrl}: ${error.message}`, error.stack);
      if (this.jobRepo) {
        await this.jobRepo.update(jobId, {
          status: 'failed',
          errorMessage: error.message || 'Unknown error',
          completedAt: new Date(),
        });
      }
      throw error;
    }
  }

  /**
   * Update crawl progress
   */
  private async updateProgress(
    jobId: string,
    progress: number,
    currentStep: string,
    metadata?: any,
  ): Promise<void> {
    if (!this.jobRepo) return;
    const updateData: any = { progress };
    if (currentStep) updateData.currentStep = currentStep;
    if (metadata) updateData.metadata = metadata;
    await this.jobRepo.update(jobId, updateData);
  }

  /**
   * Extract domain from URL
   */
  private extractDomain(url: string): string {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }
}
