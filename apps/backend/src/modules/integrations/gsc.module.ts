import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  GoogleAccountEntity,
  GoogleTokenEntity,
  GSCPropertyEntity,
  GSCSyncLogEntity,
  WebsiteEntity,
} from '../../infrastructure/database/entities';
import {
  GoogleAccountRepository,
  GoogleTokenRepository,
  GSCPropertyRepository,
  GSCSyncLogRepository,
} from '../../infrastructure/database/repositories';
import { GscApiClient } from './services/gsc-api.client';
import { GscOAuthService } from './services/gsc-oauth.service';
import { GscPropertyService } from './services/gsc-property.service';
import { GscDataService } from './services/gsc-data.service';
import { GscSyncService } from './services/gsc-sync.service';
import { GscOAuthController } from './gsc-oauth.controller';
import { GscController } from './gsc.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WebsiteEntity,
      GoogleAccountEntity,
      GoogleTokenEntity,
      GSCPropertyEntity,
      GSCSyncLogEntity,
    ]),
  ],
  controllers: [GscOAuthController, GscController],
  providers: [
    GoogleAccountRepository,
    GoogleTokenRepository,
    GSCPropertyRepository,
    GSCSyncLogRepository,
    GscApiClient,
    GscOAuthService,
    GscPropertyService,
    GscDataService,
    GscSyncService,
  ],
  exports: [GscOAuthService, GscPropertyService, GscDataService],
})
export class GscModule {}
