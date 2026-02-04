import { Module } from '@nestjs/common';
import { CompetitorResearchController } from './competitor-research.controller';
import { CompetitorResearchService } from './competitor-research.service';
import { SeoModule } from '../seo/seo.module';

@Module({
  imports: [SeoModule],
  controllers: [CompetitorResearchController],
  providers: [CompetitorResearchService],
  exports: [CompetitorResearchService],
})
export class CompetitorResearchModule {}
