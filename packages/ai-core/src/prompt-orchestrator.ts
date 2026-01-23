import { BaseLlmProvider, LlmMessage } from './llm-provider';
import { PromptTemplate } from '@riviso/shared-types';

/**
 * Orchestrates prompt execution with context injection and data retrieval
 */

export interface PromptContext {
  workspaceId: string;
  projectId?: string;
  userId: string;
  dataSourcesAvailable: string[];
}

export interface OrchestrationResult {
  response: string;
  dataReferences: any[];
  tokensUsed: number;
  processingTime: number;
}

export class PromptOrchestrator {
  private llmProvider: BaseLlmProvider;

  constructor(llmProvider: BaseLlmProvider) {
    this.llmProvider = llmProvider;
  }

  /**
   * Execute a user prompt with context and data retrieval
   */
  async execute(
    userMessage: string,
    context: PromptContext,
    history: LlmMessage[] = []
  ): Promise<OrchestrationResult> {
    const startTime = Date.now();

    // Step 1: Analyze the user's intent
    const intent = await this.analyzeIntent(userMessage);

    // Step 2: Retrieve relevant data based on intent
    const relevantData = await this.retrieveRelevantData(intent, context);

    // Step 3: Construct enhanced prompt with context
    const enhancedMessages = this.constructMessages(
      userMessage,
      relevantData,
      context,
      history
    );

    // Step 4: Get LLM response
    const response = await this.llmProvider.complete(enhancedMessages);

    const processingTime = Date.now() - startTime;

    return {
      response: response.content,
      dataReferences: relevantData,
      tokensUsed: response.tokensUsed,
      processingTime,
    };
  }

  /**
   * Analyze user intent to determine what data to retrieve
   */
  private async analyzeIntent(message: string): Promise<string> {
    // Mock implementation - in production, use LLM or classification
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('keyword') || lowerMessage.includes('rank')) {
      return 'keyword_analysis';
    } else if (lowerMessage.includes('competitor')) {
      return 'competitor_analysis';
    } else if (lowerMessage.includes('seo') || lowerMessage.includes('audit')) {
      return 'seo_analysis';
    } else if (lowerMessage.includes('conversion') || lowerMessage.includes('cro')) {
      return 'cro_analysis';
    }

    return 'general';
  }

  /**
   * Retrieve relevant data from various sources
   */
  private async retrieveRelevantData(
    intent: string,
    context: PromptContext
  ): Promise<any[]> {
    // Mock implementation - in production, query actual databases
    const mockData: { [key: string]: any[] } = {
      keyword_analysis: [
        {
          source: 'keyword_db',
          summary: 'Top 5 keywords with rankings',
          data: { keywords: ['keyword1', 'keyword2'] },
        },
      ],
      competitor_analysis: [
        {
          source: 'competitor_db',
          summary: 'Competitor overview',
          data: { competitors: ['competitor.com'] },
        },
      ],
      seo_analysis: [
        {
          source: 'seo_db',
          summary: 'Recent SEO audit results',
          data: { score: 85, issues: 3 },
        },
      ],
      cro_analysis: [
        {
          source: 'analytics_db',
          summary: 'Conversion funnel data',
          data: { conversionRate: 2.5 },
        },
      ],
    };

    return mockData[intent] || [];
  }

  /**
   * Construct messages with system prompt and context
   */
  private constructMessages(
    userMessage: string,
    data: any[],
    context: PromptContext,
    history: LlmMessage[]
  ): LlmMessage[] {
    const systemPrompt = this.buildSystemPrompt(context, data);

    return [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];
  }

  /**
   * Build system prompt with context and data
   */
  private buildSystemPrompt(context: PromptContext, data: any[]): string {
    let prompt = `You are an AI assistant for a Growth Intelligence platform. 
You help users understand their SEO, keyword rankings, competitors, and conversion optimization.

Available data sources: ${context.dataSourcesAvailable.join(', ')}
Project ID: ${context.projectId || 'Not selected'}
`;

    if (data.length > 0) {
      prompt += '\n\nRelevant data:\n';
      data.forEach(item => {
        prompt += `- ${item.source}: ${item.summary}\n`;
        prompt += `  Data: ${JSON.stringify(item.data)}\n`;
      });
    }

    prompt += '\n\nProvide clear, actionable insights based on the available data.';

    return prompt;
  }

  /**
   * Apply a prompt template with variables
   */
  async applyTemplate(
    template: PromptTemplate,
    variables: { [key: string]: string },
    context: PromptContext
  ): Promise<OrchestrationResult> {
    let filledTemplate = template.template;

    // Replace variables in template
    Object.keys(variables).forEach(key => {
      const placeholder = `{{${key}}}`;
      filledTemplate = filledTemplate.replace(
        new RegExp(placeholder, 'g'),
        variables[key]
      );
    });

    return this.execute(filledTemplate, context);
  }
}
