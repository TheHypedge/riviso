import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConnectIntegrationDto } from './dto/connect-integration.dto';
import { GoogleAnalyticsService } from './services/google-analytics.service';
import { GoogleSearchConsoleService } from './services/google-search-console.service';

@Injectable()
export class IntegrationsService {
  constructor(
    private configService: ConfigService,
    private googleAnalyticsService: GoogleAnalyticsService,
    private googleSearchConsoleService: GoogleSearchConsoleService,
  ) {}

  /**
   * Get all integrations for a project
   */
  async getIntegrations(projectId: string) {
    // Mock implementation - in production, fetch from database
    return {
      projectId,
      integrations: [
        {
          type: 'google_analytics',
          name: 'Google Analytics',
          connected: false,
          lastSync: null,
          status: 'not_connected',
          config: null,
        },
        {
          type: 'google_search_console',
          name: 'Google Search Console',
          connected: false,
          lastSync: null,
          status: 'not_connected',
          config: null,
        },
        {
          type: 'openai',
          name: 'OpenAI',
          connected: true,
          lastSync: new Date().toISOString(),
          status: 'active',
          config: {
            model: 'gpt-4-turbo-preview',
          },
        },
      ],
    };
  }

  /**
   * Connect an integration
   */
  async connectIntegration(dto: ConnectIntegrationDto, userId: string) {
    const { projectId, integrationType, credentials } = dto;

    // Validate integration type
    const validTypes = [
      'google_analytics',
      'google_search_console',
      'openai',
      'anthropic',
    ];

    if (!validTypes.includes(integrationType)) {
      throw new BadRequestException('Invalid integration type');
    }

    // Mock implementation - in production, store credentials securely
    return {
      success: true,
      integration: {
        projectId,
        type: integrationType,
        connected: true,
        connectedAt: new Date().toISOString(),
        connectedBy: userId,
      },
    };
  }

  /**
   * Disconnect an integration
   */
  async disconnectIntegration(projectId: string, integrationType: string) {
    // Mock implementation - in production, remove from database
    return {
      success: true,
      message: `${integrationType} disconnected successfully`,
    };
  }

  /**
   * Initiate Google Analytics OAuth flow
   */
  async initiateGoogleAnalyticsOAuth(projectId: string) {
    return this.googleAnalyticsService.initiateOAuth(projectId);
  }

  /**
   * Initiate Google Search Console OAuth flow
   */
  async initiateSearchConsoleOAuth(projectId: string) {
    return this.googleSearchConsoleService.initiateOAuth(projectId);
  }

  /**
   * Get sync status for all integrations
   */
  async getSyncStatus(projectId: string) {
    // Mock implementation
    return {
      projectId,
      syncStatus: {
        google_analytics: {
          lastSync: new Date(Date.now() - 3600000).toISOString(),
          status: 'success',
          recordsSynced: 1250,
          nextSync: new Date(Date.now() + 3600000).toISOString(),
        },
        google_search_console: {
          lastSync: new Date(Date.now() - 7200000).toISOString(),
          status: 'success',
          recordsSynced: 3420,
          nextSync: new Date(Date.now() + 1800000).toISOString(),
        },
      },
    };
  }
}
