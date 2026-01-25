import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SeoController } from './seo.controller';
import { SeoService } from './seo.service';
import { WebScraperService } from './services/web-scraper.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 120_000,
      maxRedirects: 5,
    }),
  ],
  controllers: [SeoController],
  providers: [SeoService, WebScraperService],
  exports: [SeoService, WebScraperService],
})
export class SeoModule {}
