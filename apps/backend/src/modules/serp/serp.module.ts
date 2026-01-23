import { Module } from '@nestjs/common';
import { SerpController } from './serp.controller';
import { SerpService } from './serp.service';

@Module({
  controllers: [SerpController],
  providers: [SerpService],
  exports: [SerpService],
})
export class SerpModule {}
