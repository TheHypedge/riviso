import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
  Ip,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GuestAuditService } from './guest-audit.service';
import { AnalyzeUrlDto } from '../seo/dto/analyze-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Guest Audit')
@Controller('guest-audit')
export class GuestAuditController {
  private readonly logger = new Logger(GuestAuditController.name);

  constructor(private readonly guestAuditService: GuestAuditService) {}

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze a website URL (public endpoint for guest users)' })
  async analyzeWebsite(
    @Body() dto: AnalyzeUrlDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    this.logger.log(`Guest audit request from ${ipAddress} for ${dto.url}`);
    try {
      return await this.guestAuditService.analyzeWebsiteForGuest(dto, ipAddress, userAgent);
    } catch (error: any) {
      this.logger.error(`Guest audit failed for ${dto.url}: ${error.message}`);
      // Re-throw to let the global exception filter handle it
      throw error;
    }
  }

  @Get('audits')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all guest audits (admin only)' })
  async getAllAudits(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Request() req: any,
  ) {
    // TODO: Add admin role check
    return this.guestAuditService.getAllAudits(parseInt(page), parseInt(limit));
  }

  @Get('audits/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get guest audit details by ID (admin only)' })
  async getAuditById(@Param('id') id: string) {
    return this.guestAuditService.getAuditById(id);
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get guest audit statistics (admin only)' })
  async getStatistics() {
    return this.guestAuditService.getStatistics();
  }
}
