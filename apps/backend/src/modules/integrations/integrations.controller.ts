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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationsService } from './integrations.service';
import { ConnectIntegrationDto } from './dto/connect-integration.dto';
import { GSCService } from './services/gsc.service';
import { GscDataQueryDto } from '@riviso/shared-types';

@ApiTags('Integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class IntegrationsController {
  private readonly logger = new Logger(IntegrationsController.name);

  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly gscService: GSCService,
  ) {}

  @Get(':projectId')
  @ApiOperation({ summary: 'Get all integrations for project' })
  async getIntegrations(@Param('projectId') projectId: string) {
    return this.integrationsService.getIntegrations(projectId);
  }

  @Post('connect')
  @ApiOperation({ summary: 'Connect an integration' })
  async connectIntegration(
    @Body() dto: ConnectIntegrationDto,
    @Request() req: any,
  ) {
    return this.integrationsService.connectIntegration(dto, req.user.id);
  }

  @Delete(':projectId/:integrationType')
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
  @ApiOperation({ summary: 'Initiate Google Analytics OAuth flow' })
  async initiateGAOAuth(@Body('projectId') projectId: string) {
    return this.integrationsService.initiateGoogleAnalyticsOAuth(projectId);
  }

  @Post('search-console/oauth')
  @ApiOperation({ summary: 'Initiate Google Search Console OAuth flow' })
  async initiateGSCOAuth(@Body('projectId') projectId: string) {
    return this.integrationsService.initiateSearchConsoleOAuth(projectId);
  }

  @Get(':projectId/sync-status')
  @ApiOperation({ summary: 'Get integration sync status' })
  async getSyncStatus(@Param('projectId') projectId: string) {
    return this.integrationsService.getSyncStatus(projectId);
  }

  // Google Search Console Endpoints
  
  @Get('gsc/auth-url')
  @ApiOperation({ summary: 'Get GSC OAuth authorization URL' })
  async getGSCAuthUrl(@Request() req: any) {
    return this.gscService.getAuthUrl(req.user.id);
  }

  @Post('gsc/callback')
  @ApiOperation({ summary: 'Handle GSC OAuth callback' })
  async handleGSCCallback(@Body() dto: { code: string; state: string }, @Request() req: any) {
    return this.gscService.handleOAuthCallback(dto.code, dto.state, req.user.id);
  }

  @Get('gsc/status')
  @ApiOperation({ summary: 'Check GSC connection status' })
  async getGSCStatus(@Request() req: any) {
    return this.gscService.getConnectionStatus(req.user.id);
  }

  @Post('gsc/data')
  @ApiOperation({ summary: 'Fetch GSC data' })
  async getGSCData(@Body() dto: GscDataQueryDto, @Request() req: any) {
    this.logger.log(`Fetching GSC data for user ${req.user.id}, site ${dto.siteUrl}`);
    return this.gscService.getPerformanceData(req.user.id, dto);
  }

  @Get('gsc/sites')
  @ApiOperation({ summary: 'Get list of GSC sites' })
  async getGSCSites(@Request() req: any) {
    return this.gscService.getSites(req.user.id);
  }

  @Delete('gsc/disconnect')
  @ApiOperation({ summary: 'Disconnect Google Search Console' })
  async disconnectGSC(@Request() req: any) {
    const success = await this.gscService.disconnect(req.user.id);
    return { success };
  }
}
