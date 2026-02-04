import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WebsiteService } from './website.service';
import { CreateWebsiteDto } from './dto/create-website.dto';
import { StartVerificationDto, MapGscPropertyDto } from './dto/verify-website.dto';

@ApiTags('websites')
@Controller('v1/websites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WebsiteController {
  constructor(private readonly websiteService: WebsiteService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new website' })
  @ApiResponse({ status: 201, description: 'Website created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid URL or limit exceeded' })
  async createWebsite(
    @Request() req: { user: { id: string } },
    @Body() dto: CreateWebsiteDto,
  ) {
    return this.websiteService.createWebsite(
      req.user.id,
      dto.url,
      dto.name,
      dto.workspaceId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get user\'s websites' })
  @ApiResponse({ status: 200, description: 'List of websites' })
  async getWebsites(
    @Request() req: { user: { id: string } },
    @Body('workspaceId') workspaceId?: string,
  ) {
    return this.websiteService.getUserWebsites(req.user.id, workspaceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get website by ID' })
  @ApiResponse({ status: 200, description: 'Website details' })
  @ApiResponse({ status: 404, description: 'Website not found' })
  async getWebsite(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.websiteService.getWebsiteById(id, req.user.id);
  }

  @Post(':id/verification/start')
  @ApiOperation({ summary: 'Start website verification' })
  @ApiResponse({ status: 200, description: 'Verification started' })
  async startVerification(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: StartVerificationDto,
  ) {
    return this.websiteService.startVerification(id, req.user.id, dto.method);
  }

  @Post(':id/verification/verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verify website ownership' })
  @ApiResponse({ status: 200, description: 'Verification result' })
  async verifyWebsite(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    return this.websiteService.verifyWebsite(id, req.user.id);
  }

  @Post(':id/gsc-property')
  @ApiOperation({ summary: 'Map GSC property to website' })
  @ApiResponse({ status: 200, description: 'GSC property mapped' })
  async mapGscProperty(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: MapGscPropertyDto,
  ) {
    return this.websiteService.mapGscProperty(id, req.user.id, dto.gscPropertyUrl);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete website' })
  @ApiResponse({ status: 204, description: 'Website deleted' })
  async deleteWebsite(
    @Request() req: { user: { id: string } },
    @Param('id') id: string,
  ) {
    await this.websiteService.deleteWebsite(id, req.user.id);
  }
}
