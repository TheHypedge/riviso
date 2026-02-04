import 'dotenv/config';
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { WebScraperService } from './services/web-scraper.service';
import { WebsiteCrawlService } from './services/website-crawl.service';
import { WebsiteAnalysisEntity } from '../../infrastructure/database/entities/website-analysis.entity';
import { CrawlJobEntity } from '../../infrastructure/database/entities/crawl-job.entity';

const useDb = !!process.env.DATABASE_URL;

@Module({
  imports: [
    HttpModule.register({
      timeout: 120_000,
      maxRedirects: 5,
    }),
    ...(useDb ? [TypeOrmModule.forFeature([WebsiteAnalysisEntity, CrawlJobEntity])] : []),
    ConfigModule,
  ],
  controllers: [SeoController],
  providers: [
    SeoService,
    WebScraperService,
    ...(useDb ? [WebsiteCrawlService] : []),
  ],
  exports: [SeoService, WebScraperService, ...(useDb ? [WebsiteCrawlService] : [])],
})
export class SeoModule { }
