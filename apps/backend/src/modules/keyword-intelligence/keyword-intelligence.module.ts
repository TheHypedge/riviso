import { Module } from '@nestjs/common';
import { KeywordIntelligenceController } from './keyword-intelligence.controller';
import { KeywordIntelligenceService } from './keyword-intelligence.service';
import { QuestionGeneratorService } from './services/question-generator.service';
import { TopicAnalyzerService } from './services/topic-analyzer.service';
import { ContentBriefGeneratorService } from './services/content-brief-generator.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [KeywordIntelligenceController],
  providers: [
    KeywordIntelligenceService,
    QuestionGeneratorService,
    TopicAnalyzerService,
    ContentBriefGeneratorService,
  ],
  exports: [KeywordIntelligenceService],
})
export class KeywordIntelligenceModule {}
