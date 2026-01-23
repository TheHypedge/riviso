import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompetitorService } from './competitor.service';

@ApiTags('Competitors')
@Controller('competitors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompetitorController {
  constructor(private readonly competitorService: CompetitorService) {}

  @Post()
  @ApiOperation({ summary: 'Add competitor to track' })
  async addCompetitor(
    @Body('domain') domain: string,
    @Body('projectId') projectId: string,
  ) {
    return this.competitorService.addCompetitor(domain, projectId);
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Get tracked competitors' })
  async getCompetitors(@Param('projectId') projectId: string) {
    return this.competitorService.getCompetitors(projectId);
  }

  @Get(':projectId/comparison')
  @ApiOperation({ summary: 'Get competitor comparison analysis' })
  async getComparison(@Param('projectId') projectId: string) {
    return this.competitorService.getComparison(projectId);
  }

  @Get(':projectId/gaps')
  @ApiOperation({ summary: 'Get content gap analysis' })
  async getContentGaps(@Param('projectId') projectId: string) {
    return this.competitorService.getContentGaps(projectId);
  }
}
