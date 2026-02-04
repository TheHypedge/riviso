import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompetitorResearchService } from './competitor-research.service';
import { AnalyzeCompetitorDto, CompareWebsitesDto } from './dto';

@ApiTags('Competitor Research')
@Controller('competitor-research')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompetitorResearchController {
  private readonly logger = new Logger(CompetitorResearchController.name);

  constructor(private readonly competitorResearchService: CompetitorResearchService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analyze a competitor website',
    description: 'Fetches and analyzes a competitor website for SEO metrics including meta tags, keywords, schema, headings, links, images, and performance.',
  })
  @ApiResponse({
    status: 200,
    description: 'Competitor analysis completed successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid URL or website could not be reached',
  })
  async analyzeCompetitor(@Body() dto: AnalyzeCompetitorDto) {
    this.logger.log(`Analyzing competitor: ${dto.url}`);

    // If compareUrl is provided, do a comparison
    if (dto.compareUrl) {
      this.logger.log(`Comparing with: ${dto.compareUrl}`);
      return this.competitorResearchService.compareWebsites(dto.url, dto.compareUrl);
    }

    // Single competitor analysis
    return this.competitorResearchService.analyzeCompetitor(dto.url);
  }

  @Post('compare')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Compare two websites side by side',
    description: 'Analyzes two websites and provides a side-by-side comparison with winner insights for each metric.',
  })
  @ApiResponse({
    status: 200,
    description: 'Comparison completed successfully',
  })
  async compareWebsites(@Body() dto: CompareWebsitesDto) {
    this.logger.log(`Comparing: ${dto.url1} vs ${dto.url2}`);
    return this.competitorResearchService.compareWebsites(dto.url1, dto.url2);
  }
}
