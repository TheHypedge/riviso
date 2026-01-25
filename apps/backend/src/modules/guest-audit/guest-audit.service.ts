import { Injectable, Logger, BadRequestException, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GuestAuditEntity } from '../../infrastructure/database/entities/guest-audit.entity';
import { SeoService } from '../seo/seo.service';
import { AnalyzeUrlDto } from '../seo/dto/analyze-url.dto';

@Injectable()
export class GuestAuditService {
  private readonly logger = new Logger(GuestAuditService.name);

  constructor(
    @Optional()
    @InjectRepository(GuestAuditEntity)
    private readonly guestAuditRepository: Repository<GuestAuditEntity> | null,
    private readonly seoService: SeoService,
  ) {
    // Repository may be null if database is not configured
    if (!this.guestAuditRepository) {
      this.logger.warn('GuestAuditRepository not available - audits will not be persisted');
    }
  }

  /**
   * Analyze a website URL for guest users and save the audit
   */
  async analyzeWebsiteForGuest(
    dto: AnalyzeUrlDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<any> {
    const startTime = Date.now();
    try {
      this.logger.log(`Guest audit requested for: ${dto.url} from ${ipAddress || 'unknown'}`);

      // Perform the analysis (on-page only) with timeout protection
      let analysisResult;
      try {
        analysisResult = await Promise.race([
          this.seoService.analyzeUrl({
            ...dto,
            includeCompetitors: false,
            includeBacklinks: false,
            includeKeywords: false,
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Analysis timeout after 90 seconds')), 90000)
          ),
        ]) as any;
      } catch (analysisError: any) {
        this.logger.error(`Analysis failed for ${dto.url}: ${analysisError.message}`);
        throw new BadRequestException(
          `Failed to analyze website: ${analysisError.message}. The website may be too large or unreachable.`
        );
      }

      // Extract domain
      let domain = '';
      try {
        const urlObj = new URL(dto.url);
        domain = urlObj.hostname.replace(/^www\./, '');
      } catch (e) {
        domain = analysisResult.domain || dto.url;
      }

      // Save to database (if available)
      if (this.guestAuditRepository) {
        try {
          const guestAudit = new GuestAuditEntity();
          guestAudit.url = dto.url;
          guestAudit.domain = domain;
          guestAudit.score = analysisResult.score;
          guestAudit.onPageSEO = analysisResult.onPageSEO || {};
          guestAudit.technical = analysisResult.technical || {};
          guestAudit.performance = analysisResult.performance || {};
          guestAudit.mobile = analysisResult.mobile || {};
          guestAudit.issues = analysisResult.issues || [];
          guestAudit.recommendations = analysisResult.recommendations || [];
          if (ipAddress) guestAudit.ipAddress = ipAddress;
          if (userAgent) guestAudit.userAgent = userAgent;

          await this.guestAuditRepository.save(guestAudit);
          this.logger.log(`Guest audit saved: ${guestAudit.id} for ${dto.url}`);
        } catch (dbError) {
          // If database is not available, log but continue
          this.logger.warn(`Failed to save guest audit to database: ${dbError.message}. Continuing without persistence.`);
        }
      } else {
        this.logger.log(`Guest audit performed for ${dto.url} (not persisted - database not configured)`);
      }

      const duration = Date.now() - startTime;
      this.logger.log(`Guest audit completed for ${dto.url} in ${duration}ms`);

      // Return only on-page SEO results (as requested)
      return {
        url: dto.url,
        domain,
        score: analysisResult.score,
        onPageSEO: analysisResult.onPageSEO,
        technical: analysisResult.technical,
        performance: analysisResult.performance,
        mobile: analysisResult.mobile,
        issues: analysisResult.issues,
        recommendations: analysisResult.recommendations,
        analyzedAt: new Date().toISOString(),
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Error analyzing website for guest (${duration}ms): ${error.message}`, error.stack);
      
      // Provide more helpful error messages
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Check for specific error types
      if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
        throw new BadRequestException(
          'The website analysis is taking longer than expected. This can happen with large websites. Please try again.'
        );
      }
      
      if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
        throw new BadRequestException(
          'Unable to reach the website. Please check that the URL is correct and the website is accessible.'
        );
      }
      
      if (error.message?.includes('ECONNREFUSED')) {
        throw new BadRequestException(
          'Unable to connect to the website. The server may be down or blocking requests.'
        );
      }
      
      throw new BadRequestException(
        `Failed to analyze ${dto.url}. ${error.message || 'Please try again or contact support if the issue persists.'}`
      );
    }
  }

  /**
   * Get all guest audits (for admin)
   */
  async getAllAudits(page: number = 1, limit: number = 50) {
    if (!this.guestAuditRepository) {
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
    try {
      const skip = (page - 1) * limit;
      const [data, total] = await this.guestAuditRepository.findAndCount({
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      return {
        data: data.map((audit) => ({
          id: audit.id,
          url: audit.url,
          domain: audit.domain,
          score: audit.score,
          createdAt: audit.createdAt,
          ipAddress: audit.ipAddress,
          userAgent: audit.userAgent,
        })),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.warn(`Database not available for guest audits: ${error.message}`);
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
  }

  /**
   * Get audit details by ID (for admin)
   */
  async getAuditById(id: string) {
    if (!this.guestAuditRepository) {
      throw new BadRequestException('Database not available');
    }
    try {
      const audit = await this.guestAuditRepository.findOne({ where: { id } });
      if (!audit) {
        throw new BadRequestException('Audit not found');
      }
      return audit;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.warn(`Database not available: ${error.message}`);
      throw new BadRequestException('Database not available');
    }
  }

  /**
   * Get statistics about guest audits
   */
  async getStatistics() {
    if (!this.guestAuditRepository) {
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
      };
    }
    try {
      const total = await this.guestAuditRepository.count();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayCount = await this.guestAuditRepository
        .createQueryBuilder('audit')
        .where('audit.createdAt >= :today', { today })
        .getCount();

      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      const weekCount = await this.guestAuditRepository
        .createQueryBuilder('audit')
        .where('audit.createdAt >= :thisWeek', { thisWeek })
        .getCount();

      return {
        total,
        today: todayCount,
        thisWeek: weekCount,
      };
    } catch (error) {
      this.logger.warn(`Database not available for statistics: ${error.message}`);
      return {
        total: 0,
        today: 0,
        thisWeek: 0,
      };
    }
  }
}
