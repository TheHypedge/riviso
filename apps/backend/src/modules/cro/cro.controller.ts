import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CroService } from './cro.service';

@ApiTags('CRO (Conversion Rate Optimization)')
@Controller('cro')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CroController {
  constructor(private readonly croService: CroService) {}

  @Get('insights/:projectId')
  @ApiOperation({ summary: 'Get CRO insights for project' })
  async getInsights(@Param('projectId') projectId: string) {
    return this.croService.getInsights(projectId);
  }

  @Get('dashboard/:projectId')
  @ApiOperation({ summary: 'Get CRO dashboard data' })
  async getDashboard(@Param('projectId') projectId: string) {
    return this.croService.getDashboard(projectId);
  }

  @Post('analyze')
  @ApiOperation({ summary: 'Analyze page for CRO opportunities' })
  async analyzePage(
    @Body('pageUrl') pageUrl: string,
    @Body('projectId') projectId: string,
  ) {
    return this.croService.analyzePage(pageUrl, projectId);
  }

  @Get('recommendations/:insightId')
  @ApiOperation({ summary: 'Get detailed recommendations for insight' })
  async getRecommendations(@Param('insightId') insightId: string) {
    return this.croService.getRecommendations(insightId);
  }
}
