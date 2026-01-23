import { Module } from '@nestjs/common';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { WebScraperService } from './services/web-scraper.service';

@Module({
  controllers: [SeoController],
  providers: [SeoService, WebScraperService],
  exports: [SeoService, WebScraperService],
})
export class SeoModule {}
