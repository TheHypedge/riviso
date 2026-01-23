import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SerpService } from './serp.service';

@ApiTags('SERP & Keywords')
@Controller('serp')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SerpController {
  constructor(private readonly serpService: SerpService) {}

  @Post('keywords')
  @ApiOperation({ summary: 'Add keyword to track' })
  async addKeyword(
    @Body('keyword') keyword: string,
    @Body('projectId') projectId: string,
  ) {
    return this.serpService.addKeyword(keyword, projectId);
  }

  @Get('keywords/:projectId')
  @ApiOperation({ summary: 'Get tracked keywords for project' })
  async getKeywords(@Param('projectId') projectId: string) {
    return this.serpService.getKeywords(projectId);
  }

  @Get('rankings/:keywordId')
  @ApiOperation({ summary: 'Get ranking history for keyword' })
  async getRankings(@Param('keywordId') keywordId: string) {
    return this.serpService.getRankings(keywordId);
  }

  @Get('analysis/:keywordId')
  @ApiOperation({ summary: 'Get keyword analysis with SERP features' })
  async getKeywordAnalysis(@Param('keywordId') keywordId: string) {
    return this.serpService.getKeywordAnalysis(keywordId);
  }
}
