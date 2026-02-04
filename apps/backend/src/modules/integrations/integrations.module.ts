import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { GoogleSearchConsoleService } from './services/google-search-console.service';
import { GSCService } from './services/gsc.service';
import { OAuthConfig } from '../../common/config/oauth.config';
import { GscConnectionStore } from './services/gsc-connection.store';
// Database-backed GSC services
import { GscOAuthService } from './services/gsc-oauth.service';
import { GscPropertyService } from './services/gsc-property.service';
import { GscApiClient } from './services/gsc-api.client';
import {
  GoogleAccountEntity,
  GoogleTokenEntity,
  GSCPropertyEntity,
} from '../../infrastructure/database/entities';
import {
  GoogleAccountRepository,
  GoogleTokenRepository,
  GSCPropertyRepository,
} from '../../infrastructure/database/repositories';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      GoogleAccountEntity,
      GoogleTokenEntity,
      GSCPropertyEntity,
    ]),
  ],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    GoogleAnalyticsService,
    GoogleSearchConsoleService,
    GSCService,
    OAuthConfig,
    GscConnectionStore,
    // Database-backed providers
    GoogleAccountRepository,
    GoogleTokenRepository,
    GSCPropertyRepository,
    GscApiClient,
    GscOAuthService,
    GscPropertyService,
  ],
  exports: [IntegrationsService, OAuthConfig, GSCService, GscOAuthService, GscPropertyService, GSCPropertyRepository],
})
export class IntegrationsModule {}
