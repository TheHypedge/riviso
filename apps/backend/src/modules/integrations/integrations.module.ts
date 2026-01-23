import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsService } from './integrations.service';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { GoogleSearchConsoleService as GoogleSearchConsoleServiceOld } from './services/google-search-console.service';
import { GSCService } from './services/gsc.service';

@Module({
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    GoogleAnalyticsService,
    GoogleSearchConsoleServiceOld,
    GSCService,
  ],
  exports: [IntegrationsService, GSCService],
})
export class IntegrationsModule {}
