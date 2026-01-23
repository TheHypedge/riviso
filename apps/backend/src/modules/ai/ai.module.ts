import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { PromptMapperService } from './services/prompt-mapper.service';
import { DataFetcherService } from './services/data-fetcher.service';
import { ResponseGeneratorService } from './services/response-generator.service';

@Module({
  controllers: [AiController],
  providers: [
    AiService,
    PromptMapperService,
    DataFetcherService,
    ResponseGeneratorService,
  ],
  exports: [AiService],
})
export class AiModule {}
