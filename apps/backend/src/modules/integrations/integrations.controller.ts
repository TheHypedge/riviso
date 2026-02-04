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
import { GscOAuthService } from './services/gsc-oauth.service';
import { GscPropertyService } from './services/gsc-property.service';
import { GscDataQueryDto } from '@riviso/shared-types';
import { OAuthConfig } from '../../common/config/oauth.config';
import { GSCPropertyRepository } from '../../infrastructure/database/repositories/gsc-property.repository';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly gscService: GSCService,
    private readonly oauthConfig: OAuthConfig,
    private readonly gscOAuthService: GscOAuthService,
    private readonly gscPropertyService: GscPropertyService,
    private readonly gscPropertyRepo: GSCPropertyRepository,
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
  async getGscStatus(@Request() req: { user: { id: string; email?: string } }) {
    this.logger.log(`[GSC Status] Checking status for user: ${req.user.id}`);

    try {
      // Get properties from database
      const dbProperties = await this.gscPropertyRepo.findByUserId(req.user.id);
      const connected = dbProperties.length > 0;

      const properties = dbProperties.map(prop => ({
        id: prop.id,
        gscPropertyUrl: prop.gscPropertyUrl,
        permissionLevel: prop.permissionLevel,
        lastSyncedAt: prop.lastSyncedAt?.toISOString() || null,
        googleAccountId: prop.googleAccountId,
      }));

      const integration = connected && dbProperties[0]
        ? {
            connected: true,
            connectedAt: dbProperties[0].createdAt?.toISOString(),
            siteUrl: dbProperties[0].gscPropertyUrl,
          }
        : undefined;

      return { connected, properties, integration };
    } catch (error: any) {
      this.logger.warn(`[GSC Status] Error checking status: ${error.message}`);
      // Fallback to file-based service for backward compatibility
      const status = await this.gscService.getConnectionStatus(req.user.id, req.user.email);
      const connected = !!status && !!status.siteUrl;
      return {
        connected,
        properties: connected ? [{
          id: status.siteUrl,
          gscPropertyUrl: status.siteUrl,
          permissionLevel: 'owner',
          lastSyncedAt: null,
        }] : [],
        integration: status ? { connected: true, connectedAt: status.connectedAt } : undefined,
      };
    }
  }

  @Post('gsc/callback')
  @ApiOperation({ summary: 'Handle GSC OAuth callback (public - state contains userId for security)' })
  // No JWT guard - this is a public OAuth callback endpoint
  // Security: userId is extracted from state parameter
  async handleGscCallback(
    @Body() dto: { code: string; state: string; email?: string },
    @Request() req: { user?: { id: string; email?: string } },
  ) {
    this.logger.log(`[OAuth Callback] Received callback with state: ${dto.state?.substring(0, 20) || 'missing'}...`);

    // Validate required parameters
    if (!dto.code) {
      throw new BadRequestException(
        'Authorization was cancelled or failed. Please try connecting again.',
      );
    }

    if (!dto.state) {
      throw new BadRequestException(
        'Invalid connection request. Please go back to Settings and try connecting again.',
      );
    }

    // Derive userId from state (state contains userId for security)
    // Prefer JWT user if available (more secure), otherwise use state
    const userId = req.user?.id || dto.state;
    // Get email from JWT, dto, or decode from state if it contains email
    const userEmail = req.user?.email || dto.email;

    this.logger.log(`[OAuth Callback] Processing callback for user: ${userId}, email: ${userEmail || 'not provided'}`);

    try {
      // Use the database-backed OAuth service
      const result = await this.gscOAuthService.handleCallback(dto.code, dto.state);
      const { sites, googleAccountId, email } = result;

      this.logger.log(`[OAuth Callback] Successfully authenticated GSC for user: ${userId}, found ${sites.length} properties`);

      // Return sites for property selection
      return {
        success: true,
        requiresPropertySelection: sites.length > 0,
        googleAccountId,
        email,
        sites: sites.map(s => ({
          siteUrl: s.siteUrl,
          permissionLevel: s.permissionLevel,
        })),
        message: sites.length > 1
          ? 'Please select a Google Search Console property to connect'
          : 'Google Search Console connected successfully',
      };
    } catch (error: any) {
      this.logger.error(`[OAuth Callback] Failed to handle callback: ${error.message}`, error.stack);
      // Re-throw with user-friendly message if not already a handled exception
      if (error instanceof BadRequestException || error.status === 400 || error.status === 401) {
        throw error;
      }
      throw new BadRequestException(
        'Something went wrong while connecting to Google Search Console. Please try again.',
      );
    }
  }

  @Post('gsc/select-property')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Select a GSC property to connect' })
  async selectGscProperty(
    @Body() dto: { googleAccountId: string; siteUrl: string; permissionLevel?: string },
    @Request() req: { user: { id: string } },
  ) {
    this.logger.log(`[GSC Property] User ${req.user.id} selecting property: ${dto.siteUrl}`);

    if (!dto.googleAccountId) {
      throw new BadRequestException(
        'Google account not found. Please try connecting again from Settings.',
      );
    }

    if (!dto.siteUrl) {
      throw new BadRequestException(
        'Please select a property to connect.',
      );
    }

    try {
      // Save the selected property to database
      const result = await this.gscPropertyService.saveProperty(
        req.user.id,
        dto.googleAccountId,
        dto.siteUrl,
        dto.permissionLevel || 'siteOwner',
        null, // websiteId - can be linked later
      );

      this.logger.log(`[GSC Property] Property saved: ${dto.siteUrl} for user ${req.user.id}`);

      return {
        success: true,
        propertyId: result.id,
        siteUrl: dto.siteUrl,
        message: 'Google Search Console connected successfully! You can now view your search analytics.',
      };
    } catch (error: any) {
      this.logger.error(`[GSC Property] Failed to save property: ${error.message}`, error.stack);
      throw new BadRequestException(
        'Unable to save the connection. Please try again or contact support if the problem persists.',
      );
    }
  }

  @Get('gsc/validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Validate GSC connection is working' })
  async validateGscConnection(@Request() req: { user: { id: string } }) {
    this.logger.log(`[GSC Validate] Validating connection for user: ${req.user.id}`);

    try {
      // Check if user has GSC properties
      const properties = await this.gscPropertyRepo.findByUserId(req.user.id);

      if (!properties || properties.length === 0) {
        return {
          valid: false,
          message: 'Google Search Console is not connected. Please connect your account in Settings.',
          needsReconnect: true,
        };
      }

      // Try to get a valid access token for the first property
      const property = properties[0];
      try {
        await this.gscPropertyService.getAccessTokenForProperty(property.id);
        return {
          valid: true,
          message: 'Google Search Console connection is active.',
          properties: properties.map(p => ({
            id: p.id,
            siteUrl: p.gscPropertyUrl,
            permissionLevel: p.permissionLevel,
          })),
        };
      } catch (tokenError: any) {
        this.logger.warn(`[GSC Validate] Token validation failed: ${tokenError.message}`);
        return {
          valid: false,
          message: 'Your Google Search Console connection has expired. Please reconnect.',
          needsReconnect: true,
        };
      }
    } catch (error: any) {
      this.logger.error(`[GSC Validate] Validation error: ${error.message}`);
      return {
        valid: false,
        message: 'Unable to validate connection. Please try again.',
        needsReconnect: false,
      };
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
    this.logger.log(`[GSC Disconnect] Disconnecting GSC for user: ${req.user.id}`);

    let disconnected = false;

    // Disconnect from database-backed storage
    try {
      await this.gscOAuthService.disconnect(req.user.id);
      this.logger.log(`[GSC Disconnect] Database tokens cleared for user: ${req.user.id}`);
      disconnected = true;
    } catch (dbError: any) {
      this.logger.warn(`[GSC Disconnect] Database disconnect warning: ${dbError.message}`);
    }

    // Also delete GSC properties from database
    try {
      const deleted = await this.gscPropertyRepo.deleteByUserId(req.user.id);
      this.logger.log(`[GSC Disconnect] Deleted ${deleted} GSC properties for user: ${req.user.id}`);
      if (deleted > 0) disconnected = true;
    } catch (propError: any) {
      this.logger.warn(`[GSC Disconnect] Property delete warning: ${propError.message}`);
    }

    // Also disconnect from file-based storage (legacy)
    try {
      await this.gscService.disconnect(req.user.id);
      this.logger.log(`[GSC Disconnect] File-based connection cleared for user: ${req.user.id}`);
      disconnected = true;
    } catch (fileError: any) {
      this.logger.warn(`[GSC Disconnect] File-based disconnect warning: ${fileError.message}`);
    }

    return {
      success: true,
      message: 'Google Search Console has been disconnected. You can reconnect anytime.',
    };
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
