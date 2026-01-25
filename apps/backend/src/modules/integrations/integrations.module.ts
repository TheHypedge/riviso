import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { GoogleSearchConsoleService } from './services/google-search-console.service';
import { GSCService } from './services/gsc.service';
import { OAuthConfig } from '../../common/config/oauth.config';
import { GscConnectionStore } from './services/gsc-connection.store';

@Module({
  imports: [ConfigModule],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    GoogleAnalyticsService,
    GoogleSearchConsoleService,
    GSCService,
    OAuthConfig,
    GscConnectionStore, // Add persistent storage for GSC connections
  ],
  exports: [IntegrationsService, OAuthConfig, GSCService], // Export GSCService for SearchConsoleModule
})
export class IntegrationsModule {}
