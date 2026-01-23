import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createLlmProvider,
  PromptOrchestrator,
  PROMPT_TEMPLATES,
  getTemplateById,
} from '@riviso/ai-core';
import {
  AiPromptRequest,
  AiPromptResponse,
  AiChatSession,
  LlmProvider,
  PromptTemplate,
} from '@riviso/shared-types';
import { AiPromptDto } from './dto/ai-prompt.dto';
import { PromptMapperService } from './services/prompt-mapper.service';
import { DataFetcherService } from './services/data-fetcher.service';
import { ResponseGeneratorService } from './services/response-generator.service';

@Injectable()
export class AiService {
  private orchestrator: PromptOrchestrator;

  constructor(
    private configService: ConfigService,
    private promptMapper: PromptMapperService,
    private dataFetcher: DataFetcherService,
    private responseGenerator: ResponseGeneratorService,
  ) {
    // Initialize LLM provider
    const llmProvider = createLlmProvider({
      provider: this.configService.get('LLM_PROVIDER') as LlmProvider || LlmProvider.OPENAI,
      model: this.configService.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 2000,
      apiKey: this.configService.get('OPENAI_API_KEY') || 'mock-key',
    });

    this.orchestrator = new PromptOrchestrator(llmProvider);
  }

  async processPrompt(promptDto: AiPromptDto, userId: string): Promise<AiPromptResponse> {
    const startTime = Date.now();

    try {
      // Step 1: Analyze the user's prompt to determine intent
      const analysis = this.promptMapper.analyzePrompt(promptDto.message);

      // Step 2: Fetch relevant data based on intent
      const dataResult = await this.dataFetcher.fetchData(analysis.requiredDataSources);

      // Step 3: Generate intelligent response with the fetched data
      let aiResponse;
      
      switch (analysis.intent.type) {
        case 'traffic_analysis':
          aiResponse = this.responseGenerator.generateTrafficDropResponse(analysis, dataResult);
          break;
        
        case 'ctr_analysis':
          aiResponse = this.responseGenerator.generateLowCtrResponse(analysis, dataResult);
          break;
        
        case 'competitor_ranking':
          aiResponse = this.responseGenerator.generateCompetitorRankingResponse(analysis, dataResult);
          break;
        
        default:
          aiResponse = this.responseGenerator.generateGeneralResponse(promptDto.message);
      }

      const processingTime = Date.now() - startTime;

      return {
        message: aiResponse.answer,
        sessionId: promptDto.sessionId || `session-${Date.now()}`,
        confidence: aiResponse.confidence,
        reasoning: aiResponse.reasoning,
        dataUsed: aiResponse.dataUsed.map(d => ({
          source: d.source,
          type: d.type,
          summary: d.summary,
        })),
        suggestions: aiResponse.suggestions,
        metadata: {
          intentType: analysis.intent.type,
          intentConfidence: analysis.intent.confidence,
          dataSourcesQueried: dataResult.dataSources,
          totalRecords: dataResult.totalRecords,
          processingTime,
        },
      };
    } catch (error) {
      // Fallback to basic response if anything fails
      return {
        message: this.generateMockResponse(promptDto.message),
        sessionId: promptDto.sessionId || `session-${Date.now()}`,
        confidence: 0.5,
        dataUsed: [],
        suggestions: this.generateSuggestions(promptDto.message),
      };
    }
  }

  async getSessions(userId: string): Promise<AiChatSession[]> {
    // Mock implementation - in production, fetch from database
    return [
      {
        id: 'session-1',
        userId,
        projectId: 'project-123',
        title: 'SEO Analysis Discussion',
        messages: [],
        context: {
          workspaceId: `workspace-${userId}`,
          projectId: 'project-123',
          availableDataSources: ['seo', 'keywords'],
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }

  async getSession(sessionId: string): Promise<AiChatSession> {
    // Mock implementation
    return {
      id: sessionId,
      userId: 'user-123',
      projectId: 'project-123',
      title: 'Chat Session',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'What are my top ranking keywords?',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Based on your data, your top 3 ranking keywords are...',
          metadata: {
            tokensUsed: 150,
            dataSourcesQueried: ['keywords'],
          },
          createdAt: new Date().toISOString(),
        },
      ],
      context: {
        workspaceId: 'workspace-123',
        projectId: 'project-123',
        availableDataSources: ['seo', 'keywords', 'competitors'],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  getTemplates(): PromptTemplate[] {
    return PROMPT_TEMPLATES;
  }

  private generateMockResponse(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('keyword')) {
      return 'Based on your keyword data, I can see that you have 150 tracked keywords with an average ranking of 12.5. Your top-performing keywords are "seo tools" (rank 3), "keyword research" (rank 5), and "content optimization" (rank 8). Would you like me to analyze opportunities for improvement?';
    } else if (lowerMessage.includes('competitor')) {
      return 'Your main competitors are ranking well for several keywords you\'re targeting. Competitor1.com has 420 common keywords with you, while Competitor2.com shares 315 keywords. I recommend focusing on their content gaps and your unique strengths.';
    } else if (lowerMessage.includes('seo') || lowerMessage.includes('audit')) {
      return 'Your latest SEO audit shows a score of 78/100. The main areas for improvement are: page speed (critical priority), missing meta descriptions (high priority), and mobile usability (medium priority). Addressing these could significantly boost your organic visibility.';
    } else if (lowerMessage.includes('conversion') || lowerMessage.includes('cro')) {
      return 'I\'ve identified 3 high-impact CRO opportunities: 1) Your product page has high traffic but low conversion (2.1%) - consider adding trust signals and improving CTAs. 2) Cart abandonment rate is 68% - implement exit-intent popups. 3) Mobile bounce rate is elevated at 62% - optimize mobile UX.';
    }

    return 'I\'m here to help you analyze your SEO, keywords, competitors, and conversion data. You can ask me questions like: "What are my top keywords?", "How do I compare to competitors?", "What are my biggest SEO issues?", or "Where can I improve conversions?"';
  }

  private generateSuggestions(message: string): string[] {
    return [
      'Show me keyword opportunities',
      'Analyze competitor performance',
      'What are my top SEO issues?',
      'Find pages with low conversion rates',
    ];
  }
}
