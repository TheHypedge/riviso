import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CroController } from './cro.controller';
import { CroService } from './cro.service';
import { CroEngineService } from './services/cro-engine.service';
import { CroIntelligenceService } from './services/cro-intelligence.service';
import { NicheDetectorService } from './services/niche-detector.service';
import { PersonaAnalyzerService } from './services/persona-analyzer.service';
import { UxAnalyzerService } from './services/ux-analyzer.service';
import { SeoModule } from '../seo/seo.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [HttpModule, SeoModule, AiModule],
  controllers: [CroController],
  providers: [
    CroService,
    CroEngineService,
    CroIntelligenceService,
    NicheDetectorService,
    PersonaAnalyzerService,
    UxAnalyzerService,
  ],
  exports: [CroService, CroIntelligenceService],
})
export class CroModule {}
