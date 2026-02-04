import { Controller, Post, Get, Body, Query, UseGuards, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KeywordIntelligenceService } from './keyword-intelligence.service';
import { ContentBriefGeneratorService } from './services/content-brief-generator.service';
import { QuestionGeneratorService } from './services/question-generator.service';
import { TopicAnalyzerService } from './services/topic-analyzer.service';
import {
  AnalyzeKeywordDto,
  GenerateBriefDto,
  GenerateFaqDto,
  GenerateEditorialPlanDto,
} from './dto/keyword-intelligence.dto';

@ApiTags('Keyword Intelligence')
@Controller('keyword-intelligence')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class KeywordIntelligenceController {
  private readonly logger = new Logger(KeywordIntelligenceController.name);

  constructor(
    private readonly keywordIntelligenceService: KeywordIntelligenceService,
    private readonly briefGenerator: ContentBriefGeneratorService,
    private readonly questionGenerator: QuestionGeneratorService,
    private readonly topicAnalyzer: TopicAnalyzerService,
  ) {}

  @Post('analyze')
  @ApiOperation({
    summary: 'Analyze keyword, topic, URL, or content',
    description: 'Comprehensive analysis returning customer intent insights, questions, topic clusters, and opportunity scoring',
  })
  @ApiResponse({ status: 200, description: 'Analysis completed successfully' })
  async analyze(@Body() dto: AnalyzeKeywordDto) {
    this.logger.log(`Analyzing: ${dto.input} (type: ${dto.inputType})`);
    return this.keywordIntelligenceService.analyze(dto);
  }

  @Get('dashboard')
  @ApiOperation({
    summary: 'Get decision dashboard for a keyword',
    description: 'Returns quick wins, strategic opportunities, content gaps, and intent tree for strategic planning',
  })
  @ApiResponse({ status: 200, description: 'Dashboard data retrieved successfully' })
  async getDashboard(@Query('keyword') keyword: string) {
    if (!keyword) {
      return { error: 'Keyword parameter is required' };
    }
    return this.keywordIntelligenceService.generateDashboard(keyword);
  }

  @Post('questions')
  @ApiOperation({
    summary: 'Generate user questions for a keyword',
    description: 'Generates question clusters similar to Answer The Public with intent classification',
  })
  @ApiResponse({ status: 200, description: 'Questions generated successfully' })
  async generateQuestions(@Body('keyword') keyword: string) {
    if (!keyword) {
      return { error: 'Keyword is required' };
    }
    return this.questionGenerator.generateQuestions(keyword);
  }

  @Post('topic-cluster')
  @ApiOperation({
    summary: 'Build a topic cluster',
    description: 'Creates a semantic topic cluster with related keywords and content gaps',
  })
  @ApiResponse({ status: 200, description: 'Topic cluster built successfully' })
  async buildTopicCluster(@Body('keyword') keyword: string) {
    if (!keyword) {
      return { error: 'Keyword is required' };
    }
    return this.topicAnalyzer.buildTopicCluster(keyword);
  }

  @Post('topic-map')
  @ApiOperation({
    summary: 'Generate topic map visualization data',
    description: 'Creates hierarchical topic map for visualization',
  })
  @ApiResponse({ status: 200, description: 'Topic map generated successfully' })
  async generateTopicMap(
    @Body('keyword') keyword: string,
    @Body('depth') depth?: 'quick' | 'standard' | 'deep',
  ) {
    if (!keyword) {
      return { error: 'Keyword is required' };
    }
    return this.topicAnalyzer.generateTopicMap(keyword, depth || 'standard');
  }

  @Post('content-brief')
  @ApiOperation({
    summary: 'Generate content brief',
    description: 'Creates a comprehensive content brief with outline, competitor insights, and recommendations',
  })
  @ApiResponse({ status: 200, description: 'Content brief generated successfully' })
  async generateContentBrief(@Body() dto: GenerateBriefDto) {
    return this.briefGenerator.generateContentBrief(dto.keyword, dto.angle);
  }

  @Post('faq')
  @ApiOperation({
    summary: 'Generate FAQ collection',
    description: 'Creates FAQ items with schema markup ready for implementation',
  })
  @ApiResponse({ status: 200, description: 'FAQ collection generated successfully' })
  async generateFAQ(@Body() dto: GenerateFaqDto) {
    return this.briefGenerator.generateFAQCollection(dto.topic, dto.maxItems);
  }

  @Post('editorial-plan')
  @ApiOperation({
    summary: 'Generate editorial plan',
    description: 'Creates a content calendar with prioritized topics and projected impact',
  })
  @ApiResponse({ status: 200, description: 'Editorial plan generated successfully' })
  async generateEditorialPlan(@Body() dto: GenerateEditorialPlanDto) {
    return this.briefGenerator.generateEditorialPlan(
      dto.topic,
      dto.itemCount,
      dto.timeframeWeeks,
    );
  }
}
