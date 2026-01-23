import { Controller, Get, Post, Param, Body, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SeoService } from './seo.service';
import { AnalyzeUrlDto } from './dto/analyze-url.dto';

@ApiTags('SEO')
@Controller('seo')
export class SeoController {
  private readonly logger = new Logger(SeoController.name);
  
  constructor(private readonly seoService: SeoService) {}

  @Post('audit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Run SEO audit for a URL' })
  async runAudit(@Body('url') url: string, @Body('projectId') projectId: string) {
    return this.seoService.runAudit(url, projectId);
  }

  @Get('audits/:projectId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get SEO audits for project' })
  async getAudits(@Param('projectId') projectId: string) {
    return this.seoService.getAudits(projectId);
  }

  @Get('audit/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get specific audit details' })
  async getAuditDetails(@Param('id') id: string) {
    return this.seoService.getAuditDetails(id);
  }

  @Post('analyze-url')
  @ApiOperation({ summary: 'Analyze any website URL and get comprehensive metrics' })
  async analyzeUrl(@Body() dto: AnalyzeUrlDto) {
    this.logger.log(`Analyzing URL: ${dto.url}`);
    try {
      const result = await this.seoService.analyzeUrl(dto);
      this.logger.log(`Successfully analyzed: ${dto.url}`);
      return result;
    } catch (error) {
      this.logger.error(`Error analyzing ${dto.url}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
