import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';
import { ConnectIntegrationDto } from './dto/connect-integration.dto';
import { GoogleSearchConsoleService as GSCService } from './services/gsc.service';
import { GscDataQueryDto } from '@riviso/shared-types';
import { OAuthConfig } from '../../common/config/oauth.config';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly gscService: GSCService,
    private readonly oauthConfig: OAuthConfig,
  ) {
    // Log OAuth configuration on startup for debugging
    try {
      const redirectUri = this.oauthConfig.getRedirectUri();
      this.logger.log(`[OAuth Config] Redirect URI configured: ${redirectUri}`);
      this.logger.warn(`[OAuth Config] ⚠️  Make sure this EXACT URI is in Google Cloud Console: ${redirectUri}`);
    } catch (error) {
      this.logger.error(`[OAuth Config] Configuration error: ${error.message}`);
    }
  }

  @Get('gsc/connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Google Search Console OAuth authorization URL' })
  async getGscConnect(@Request() req: { user: { id: string } }) {
    this.logger.log(`GSC connect requested by user: ${req.user.id}`);
    
    // Log the redirect URI for debugging
    const redirectUri = this.oauthConfig.getRedirectUri();
    this.logger.log(`[DEBUG] Redirect URI being used: ${redirectUri}`);
    this.logger.warn(`[DEBUG] Make sure this EXACT URI is in Google Cloud Console: ${redirectUri}`);
    
    try {
      const result = await this.gscService.getAuthUrl(req.user.id);
      return result;
    } catch (error) {
      this.logger.error(`Failed to generate GSC auth URL: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('gsc/oauth-config')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get OAuth configuration for debugging (shows redirect URI)' })
  async getOAuthConfig() {
    try {
      const redirectUri = this.oauthConfig.getRedirectUri();
      const clientId = this.oauthConfig.getClientId();
      const frontendUrl = this.oauthConfig.getFrontendUrl();
      
      return {
        redirectUri,
        clientId: clientId.substring(0, 20) + '...', // Partial for security
        frontendUrl,
        message: `Add this EXACT redirect URI to Google Cloud Console: ${redirectUri}`,
        instructions: [
          '1. Go to https://console.cloud.google.com/apis/credentials',
          `2. Click on your OAuth 2.0 Client ID (starts with: ${clientId.substring(0, 20)}...)`,
          '3. Scroll to "Authorized redirect URIs"',
          '4. Click "+ ADD URI"',
          `5. Paste: ${redirectUri}`,
          '6. Click "SAVE"',
          '7. Try connecting again',
        ],
      };
    } catch (error) {
      throw new BadRequestException(`OAuth configuration error: ${error.message}`);
    }
  }

  @Get('gsc/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Google Search Console connection status' })
  async getGscStatus(@Request() req: { user: { id: string } }) {
    const status = await this.gscService.getConnectionStatus(req.user.id);
    const connected = !!status && !!status.siteUrl;
    
    // Fetch all sites/properties if connected
    let properties: any[] = [];
    if (connected) {
      try {
        const sites = await this.gscService.getSites(req.user.id);
        properties = sites.map(site => ({
          id: site.siteUrl,
          gscPropertyUrl: site.siteUrl,
          permissionLevel: site.permissionLevel,
          lastSyncedAt: null,
        }));
      } catch (error) {
        this.logger.warn(`Failed to fetch GSC sites for status: ${error.message}`);
        // If we have a connection but can't fetch sites, still return connected status
        // with the stored siteUrl as a fallback
        if (status.siteUrl) {
          properties = [{
            id: status.siteUrl,
            gscPropertyUrl: status.siteUrl,
            permissionLevel: 'owner',
            lastSyncedAt: null,
          }];
        }
      }
    }
    
    const integration = status
      ? { connected: true, connectedAt: status.connectedAt, lastSyncAt: status.lastSyncAt ?? undefined }
      : undefined;
    return { connected, properties, integration };
  }

  @Post('gsc/callback')
  @ApiOperation({ summary: 'Handle GSC OAuth callback (public - state contains userId for security)' })
  // No JWT guard - this is a public OAuth callback endpoint
  // Security: userId is extracted from state parameter
  async handleGscCallback(
    @Body() dto: { code: string; state: string },
    @Request() req: { user?: { id: string } },
  ) {
    this.logger.log(`[OAuth Callback] Received callback with state: ${dto.state.substring(0, 20)}...`);
    
    // Derive userId from state (state contains userId for security)
    // Prefer JWT user if available (more secure), otherwise use state
    const userId = req.user?.id || dto.state;
    
    if (!userId) {
      this.logger.error('[OAuth Callback] No userId found in state or JWT');
      throw new BadRequestException('Invalid OAuth state parameter');
    }

    this.logger.log(`[OAuth Callback] Processing callback for user: ${userId}`);

    try {
      const connection = await this.gscService.handleOAuthCallback(dto.code, dto.state, userId);
      this.logger.log(`[OAuth Callback] Successfully connected GSC for user: ${userId}`);
      return {
        success: true,
        connection,
        message: 'Google Search Console connected successfully',
      };
    } catch (error) {
      this.logger.error(`[OAuth Callback] Failed to handle callback: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Get('gsc/sites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Google Search Console sites' })
  async getGscSites(@Request() req: { user: { id: string } }) {
    return this.gscService.getSites(req.user.id);
  }

  @Get('gsc/data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get Google Search Console performance data' })
  async getGscData(
    @Request() req: { user: { id: string } },
    @Query() query: GscDataQueryDto,
  ) {
    this.logger.log(`[GSC Data] Request from user ${req.user.id} for property: ${query.siteUrl}`);
    this.logger.log(`[GSC Data] Date range: ${query.startDate} to ${query.endDate}`);
    
    try {
      const data = await this.gscService.getPerformanceData(req.user.id, query);
      this.logger.log(`[GSC Data] Successfully returned data with ${data.totalClicks} clicks`);
      return data;
    } catch (error: any) {
      this.logger.error(`[GSC Data] Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @Post('gsc/disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect Google Search Console' })
  async disconnectGsc(@Request() req: { user: { id: string } }) {
    await this.gscService.disconnect(req.user.id);
    return { success: true, message: 'Google Search Console disconnected' };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all integrations for user' })
  async getIntegrations(@Request() req: { user: { id: string } }) {
    // Use a default project ID or get from user context
    // For now, using userId as projectId for compatibility
    return this.integrationsService.getIntegrations(req.user.id);
  }

  @Post('connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect an integration' })
  async connectIntegration(
    @Body() dto: ConnectIntegrationDto,
    @Request() req: { user: { id: string } },
  ) {
    return this.integrationsService.connectIntegration(dto, req.user.id);
  }

  @Delete(':type')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect an integration' })
  async disconnectIntegration(
    @Param('type') type: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.integrationsService.disconnectIntegration(req.user.id, type);
  }

  @Post('ga/oauth/initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate Google Analytics OAuth flow' })
  async initiateGAOAuth(@Request() req: { user: { id: string } }) {
    // TODO: Implement GA OAuth
    throw new BadRequestException('Google Analytics OAuth not yet implemented');
  }

  @Post('gsc/oauth/initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate Google Search Console OAuth flow' })
  async initiateGSCOAuth(@Request() req: { user: { id: string } }) {
    return this.getGscConnect(req);
  }

  @Get('sync/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get integration sync status' })
  async getSyncStatus(@Request() req: { user: { id: string } }) {
    // TODO: Implement sync status
    return { syncing: false, lastSync: null };
  }
}
