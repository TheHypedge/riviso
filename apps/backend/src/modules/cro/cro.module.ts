import { Module } from '@nestjs/common';
import { CroController } from './cro.controller';
import { CroService } from './cro.service';
import { CroEngineService } from './services/cro-engine.service';

@Module({
  controllers: [CroController],
  providers: [CroService, CroEngineService],
  exports: [CroService],
})
export class CroModule {}
