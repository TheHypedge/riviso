import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GscOAuthService } from './services/gsc-oauth.service';
import { GscPropertyService } from './services/gsc-property.service';
import { GscDataService } from './services/gsc-data.service';
import { SelectGscPropertyDto } from './dto/gsc-property.dto';
import { GscDataQueryDto } from '@riviso/shared-types';

@ApiTags('Integrations')
@Controller('integrations/gsc')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GscController {
  private readonly logger = new Logger(GscController.name);

  constructor(
    private readonly gscOAuth: GscOAuthService,
    private readonly gscProperty: GscPropertyService,
    private readonly gscData: GscDataService,
  ) {}

  @Get('connect')
  @ApiOperation({ summary: 'Get GSC OAuth connect URL' })
  getConnect(
    @Request() req: { user: { id: string } },
    @Query('websiteUrl') websiteUrl?: string,
  ): { authUrl: string } {
    const url = this.gscOAuth.getConnectUrl(req.user.id, websiteUrl ?? '');
    return { authUrl: url };
  }

  @Get('status')
  @ApiOperation({ summary: 'GSC connection status' })
  async getStatus(@Request() req: { user: { id: string } }) {
    const props = await this.gscProperty.getProperties(req.user.id);
    const connected = props.length > 0;
    const properties = props.map((p) => ({
      id: p.id,
      gscPropertyUrl: p.gscPropertyUrl,
      permissionLevel: p.permissionLevel,
      lastSyncedAt: p.lastSyncedAt,
    }));
    const integration =
      connected && props[0]
        ? {
            siteUrl: props[0].gscPropertyUrl,
            connectedAt: props[0].createdAt,
            lastSyncAt: props[0].lastSyncedAt ?? undefined,
          }
        : undefined;
    return { connected, properties, integration };
  }

  @Get('sites')
  @ApiOperation({ summary: 'List GSC sites for user' })
  async getSites(@Request() req: { user: { id: string } }) {
    const props = await this.gscProperty.getProperties(req.user.id);
    if (props.length === 0) {
      return { sites: [], message: 'No GSC property linked. Connect GSC first.' };
    }
    const sites = props.map((p) => ({
      siteUrl: p.gscPropertyUrl,
      permissionLevel: p.permissionLevel,
    }));
    return { sites };
  }

  @Post('property')
  @ApiOperation({ summary: 'Select and persist GSC property' })
  async selectProperty(
    @Body() dto: SelectGscPropertyDto,
    @Request() req: { user: { id: string } },
  ) {
    const { id } = await this.gscProperty.saveProperty(
      req.user.id,
      dto.googleAccountId,
      dto.propertyUrl,
      'siteOwner',
      dto.websiteId ?? null,
    );
    return { success: true, propertyId: id };
  }

  @Post('data')
  @ApiOperation({ summary: 'Fetch GSC Search Analytics' })
  async getData(@Body() dto: GscDataQueryDto, @Request() req: { user: { id: string } }) {
    this.logger.log(`GSC data requested: user=${req.user.id} site=${dto.siteUrl}`);
    return this.gscData.getSearchAnalytics(req.user.id, dto);
  }

  @Post('disconnect')
  @ApiOperation({ summary: 'Disconnect GSC' })
  async disconnect(@Request() req: { user: { id: string } }) {
    await this.gscOAuth.disconnect(req.user.id);
    return { success: true };
  }
}
