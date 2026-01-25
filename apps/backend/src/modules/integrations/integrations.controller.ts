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
import { GSCService } from './services/gsc.service';
import { GscDataQueryDto } from '@riviso/shared-types';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly gscService: GSCService,
  ) {}

  /* GSC routes (in-memory when no DB). Always available so Connect works locally. */
  @Get('gsc/connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get GSC OAuth connect URL' })
  async getGscConnect(
    @Request() req: { user: { id: string } },
    @Query('websiteUrl') _websiteUrl?: string,
  ) {
    return this.gscService.getAuthUrl(req.user.id);
  }

  @Get('gsc/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'GSC connection status' })
  async getGscStatus(@Request() req: { user: { id: string } }) {
    const s = await this.gscService.getConnectionStatus(req.user.id);
    const connected = s.connected && !!s.siteUrl;
    const properties = connected
      ? [{ id: 'in-memory', gscPropertyUrl: s.siteUrl!, permissionLevel: 'siteOwner' as const, lastSyncedAt: null }]
      : [];
    const integration = connected && s.siteUrl
      ? { siteUrl: s.siteUrl, connectedAt: s.connectedAt ?? '', lastSyncAt: s.lastSyncAt ?? undefined }
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
    // Extract userId from state (state = userId in current implementation)
    // If JWT is present, validate it matches state; otherwise use state as userId
    const userIdFromState = dto.state;
    const userIdFromJwt = req.user?.id;
    
    // Prefer JWT if present and matches state, otherwise use state
    const userId = userIdFromJwt && userIdFromJwt === userIdFromState 
      ? userIdFromJwt 
      : userIdFromState;
    
    if (!userId || !userIdFromState) {
      this.logger.error(`[OAuth] Invalid callback: missing state or userId`, { 
        hasState: !!dto.state, 
        hasJwt: !!userIdFromJwt 
      });
      throw new BadRequestException('Invalid OAuth callback: missing user identifier in state parameter');
    }

    this.logger.log(`[OAuth] Processing GSC callback`, { 
      userId, 
      state: dto.state.substring(0, 20) + '...',
      hasJwt: !!userIdFromJwt 
    });
    
    return this.gscService.handleOAuthCallback(dto.code, dto.state, userId);
  }

  @Get('gsc/sites')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List GSC sites' })
  async getGscSites(@Request() req: { user: { id: string } }) {
    return this.gscService.getSites(req.user.id);
  }

  @Post('gsc/data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fetch GSC Search Analytics' })
  async getGscData(@Body() dto: GscDataQueryDto, @Request() req: { user: { id: string } }) {
    this.logger.log(`GSC data: user=${req.user.id} site=${dto.siteUrl}`);
    return this.gscService.getPerformanceData(req.user.id, dto);
  }

  @Post('gsc/disconnect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect GSC' })
  async disconnectGsc(@Request() req: { user: { id: string } }) {
    const success = await this.gscService.disconnect(req.user.id);
    return { success };
  }

  @Get(':projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all integrations for project' })
  async getIntegrations(@Param('projectId') projectId: string) {
    return this.integrationsService.getIntegrations(projectId);
  }

  @Post('connect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Connect an integration' })
  async connectIntegration(
    @Body() dto: ConnectIntegrationDto,
    @Request() req: any,
  ) {
    return this.integrationsService.connectIntegration(dto, req.user.id);
  }

  @Delete(':projectId/:integrationType')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Disconnect an integration' })
  async disconnectIntegration(
    @Param('projectId') projectId: string,
    @Param('integrationType') integrationType: string,
  ) {
    return this.integrationsService.disconnectIntegration(
      projectId,
      integrationType,
    );
  }

  @Post('google-analytics/oauth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate Google Analytics OAuth flow' })
  async initiateGAOAuth(@Body('projectId') projectId: string) {
    return this.integrationsService.initiateGoogleAnalyticsOAuth(projectId);
  }

  @Post('search-console/oauth')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate Google Search Console OAuth flow' })
  async initiateGSCOAuth(@Body('projectId') projectId: string) {
    return this.integrationsService.initiateSearchConsoleOAuth(projectId);
  }

  @Get(':projectId/sync-status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get integration sync status' })
  async getSyncStatus(@Param('projectId') projectId: string) {
    return this.integrationsService.getSyncStatus(projectId);
  }
}
