import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createLlmProvider, type BaseLlmProvider } from '@riviso/ai-core';
import { LlmProvider as LlmProviderEnum } from '@riviso/shared-types';
import type { BuyerPersona, UserQuestion, QuestionType, IntentStage } from '@riviso/shared-types';
import {
  PERSONA_GENERATION_PROMPT,
  BEHAVIORAL_TRIGGERS_PROMPT,
  COPY_IMPROVEMENT_PROMPT,
  QUESTION_GENERATION_PROMPT,
  CONTENT_BRIEF_TITLE_PROMPT,
  CONTENT_OUTLINE_PROMPT,
  FAQ_GENERATION_PROMPT,
  TOPIC_CLUSTER_PROMPT,
  fillPromptTemplate,
  parseAiJsonResponse,
} from '../prompts/content-prompts';

export interface PersonaContext {
  industry: string;
  businessModel: string;
  content: {
    headings?: string[];
    bodyText?: string;
    pricing?: any;
  };
}

export interface AiGeneratedTrigger {
  name: string;
  description: string;
  effectiveness: number;
  implementation: string;
  example: string;
  aiGenerated?: boolean;
}

export interface CopyImprovement {
  headline: {
    current: string;
    improved: string;
    reasoning: string;
  };
  description: {
    current: string;
    improved: string;
    reasoning: string;
  };
  cta: {
    suggestion: string;
    reasoning: string;
  };
}

export interface ContentBriefTitle {
  title: string;
  reasoning: string;
}

export interface ContentOutline {
  introduction: {
    heading: string;
    keyPoints: string[];
  };
  sections: Array<{
    heading: string;
    keyPoints: string[];
    subsections?: Array<{
      heading: string;
      keyPoints: string[];
    }>;
  }>;
  conclusion: {
    heading: string;
    keyPoints: string[];
  };
}

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
}

export interface TopicCluster {
  synonyms: string[];
  subtopics: string[];
  relatedConcepts: string[];
  longTail: string[];
  contentSuggestions: Array<{
    title: string;
    type: string;
    targetKeywords: string[];
  }>;
}

export interface GeneratedQuestion {
  question: string;
  searchVolume: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

@Injectable()
export class ContentGeneratorService {
  private readonly logger = new Logger(ContentGeneratorService.name);
  private llmProvider: BaseLlmProvider;
  private isMockMode: boolean;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('OPENAI_API_KEY') || 'mock-key';
    this.isMockMode = apiKey === 'mock-key' || !apiKey;

    if (this.isMockMode) {
      this.logger.warn('Running in MOCK mode - no OpenAI API key configured');
    }

    this.llmProvider = createLlmProvider({
      provider: (this.configService.get('LLM_PROVIDER') as LlmProviderEnum) || LlmProviderEnum.OPENAI,
      model: this.configService.get('OPENAI_MODEL') || 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 2000,
      apiKey,
    });
  }

  /**
   * Generate AI-powered buyer persona
   */
  async generatePersona(context: PersonaContext): Promise<BuyerPersona> {
    try {
      const prompt = fillPromptTemplate(PERSONA_GENERATION_PROMPT, {
        industry: context.industry,
        businessModel: context.businessModel,
        content: JSON.stringify({
          headings: context.content.headings?.slice(0, 5),
          bodyPreview: context.content.bodyText?.slice(0, 500),
          hasPricing: !!context.content.pricing,
        }),
      });

      const response = await this.llmProvider.complete(
        [
          { role: 'system', content: 'You are an expert buyer persona consultant.' },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.6, maxTokens: 1500 }
      );

      const parsed = parseAiJsonResponse<BuyerPersona>(response.content);
      this.logger.log(`Generated AI persona: ${parsed.name} (${response.tokensUsed} tokens)`);
      return parsed;
    } catch (error) {
      this.logger.error(`Failed to generate persona: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate behavioral triggers specific to industry and business model
   */
  async generateBehavioralTriggers(context: {
    industry: string;
    businessModel: string;
    currentCtas: string[];
  }): Promise<AiGeneratedTrigger[]> {
    try {
      const prompt = fillPromptTemplate(BEHAVIORAL_TRIGGERS_PROMPT, {
        industry: context.industry,
        businessModel: context.businessModel,
        currentCtas: context.currentCtas.join(', '),
      });

      const response = await this.llmProvider.complete(
        [
          { role: 'system', content: 'You are a conversion rate optimization expert.' },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.5, maxTokens: 1500 }
      );

      const triggers = parseAiJsonResponse<AiGeneratedTrigger[]>(response.content);

      // Mark as AI-generated
      return triggers.map(t => ({ ...t, aiGenerated: true }));
    } catch (error) {
      this.logger.error(`Failed to generate behavioral triggers: ${error.message}`);

      // Fallback to basic triggers
      return this.getFallbackBehavioralTriggers(context.industry);
    }
  }

  /**
   * Generate copy improvements
   */
  async generateCopyImprovement(context: {
    currentHeadline: string;
    currentDescription: string;
    industry: string;
    businessModel: string;
    targetAudience?: string;
  }): Promise<CopyImprovement> {
    try {
      const prompt = fillPromptTemplate(COPY_IMPROVEMENT_PROMPT, {
        currentHeadline: context.currentHeadline || 'No headline',
        currentDescription: context.currentDescription || 'No description',
        industry: context.industry,
        businessModel: context.businessModel,
        targetAudience: context.targetAudience || 'General audience',
      });

      const response = await this.llmProvider.complete(
        [
          { role: 'system', content: 'You are a professional conversion copywriter.' },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.7, maxTokens: 1000 }
      );

      return parseAiJsonResponse<CopyImprovement>(response.content);
    } catch (error) {
      this.logger.error(`Failed to generate copy improvement: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate natural user questions
   */
  async generateQuestions(
    keyword: string,
    type: QuestionType,
    options?: { count?: number }
  ): Promise<GeneratedQuestion[]> {
    try {
      const prompt = fillPromptTemplate(QUESTION_GENERATION_PROMPT, {
        keyword,
        questionType: type.toUpperCase(),
      });

      const response = await this.llmProvider.complete(
        [
          { role: 'system', content: 'You are an SEO and search behavior expert.' },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.6, maxTokens: 1200 }
      );

      const questions = parseAiJsonResponse<GeneratedQuestion[]>(response.content);
      return questions.slice(0, options?.count || 8);
    } catch (error) {
      this.logger.error(`Failed to generate questions: ${error.message}`);

      // Fallback to basic template
      return this.getFallbackQuestions(keyword, type);
    }
  }

  /**
   * Generate content brief title
   */
  async generateContentTitle(
    keyword: string,
    intent: IntentStage,
    angle?: string
  ): Promise<string> {
    try {
      const prompt = fillPromptTemplate(CONTENT_BRIEF_TITLE_PROMPT, {
        keyword,
        intent,
        angle: angle || 'comprehensive guide',
        year: new Date().getFullYear().toString(),
      });

      const response = await this.llmProvider.complete(
        [
          { role: 'system', content: 'You are an SEO content strategist.' },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.7, maxTokens: 150 }
      );

      const result = parseAiJsonResponse<ContentBriefTitle>(response.content);
      return result.title;
    } catch (error) {
      this.logger.error(`Failed to generate title: ${error.message}`);
      return `${keyword}: Complete Guide (${new Date().getFullYear()})`;
    }
  }

  /**
   * Generate content outline
   */
  async generateContentOutline(
    keyword: string,
    intent: IntentStage,
    targetWordCount: number
  ): Promise<ContentOutline> {
    try {
      const prompt = fillPromptTemplate(CONTENT_OUTLINE_PROMPT, {
        keyword,
        intent,
        targetWordCount: targetWordCount.toString(),
      });

      const response = await this.llmProvider.complete(
        [
          { role: 'system', content: 'You are a content strategist.' },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.6, maxTokens: 2000 }
      );

      return parseAiJsonResponse<ContentOutline>(response.content);
    } catch (error) {
      this.logger.error(`Failed to generate outline: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate FAQ items
   */
  async generateFAQ(topic: string, count: number = 10): Promise<FAQItem[]> {
    try {
      const prompt = fillPromptTemplate(FAQ_GENERATION_PROMPT, {
        topic,
        count: count.toString(),
      });

      const response = await this.llmProvider.complete(
        [
          { role: 'system', content: 'You are an SEO and content expert.' },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.6, maxTokens: 2500 }
      );

      return parseAiJsonResponse<FAQItem[]>(response.content);
    } catch (error) {
      this.logger.error(`Failed to generate FAQ: ${error.message}`);

      // Fallback
      return this.getFallbackFAQ(topic, count);
    }
  }

  /**
   * Generate topic clusters
   */
  async generateTopicCluster(pillarKeyword: string): Promise<TopicCluster> {
    try {
      const prompt = fillPromptTemplate(TOPIC_CLUSTER_PROMPT, {
        pillarKeyword,
      });

      const response = await this.llmProvider.complete(
        [
          { role: 'system', content: 'You are a content strategist.' },
          { role: 'user', content: prompt },
        ],
        { temperature: 0.6, maxTokens: 1500 }
      );

      return parseAiJsonResponse<TopicCluster>(response.content);
    } catch (error) {
      this.logger.error(`Failed to generate topic cluster: ${error.message}`);
      throw error;
    }
  }

  /**
   * Fallback behavioral triggers
   */
  private getFallbackBehavioralTriggers(industry: string): AiGeneratedTrigger[] {
    return [
      {
        name: 'Social Proof',
        description: 'Leverage testimonials and user reviews',
        effectiveness: 85,
        implementation: `Display customer testimonials prominently on ${industry} pages`,
        example: 'Show real customer success stories',
        aiGenerated: false,
      },
      {
        name: 'Scarcity',
        description: 'Create urgency through limited availability',
        effectiveness: 80,
        implementation: 'Highlight limited-time offers or stock levels',
        example: 'Only 3 spots remaining this month',
        aiGenerated: false,
      },
    ];
  }

  /**
   * Fallback questions
   */
  private getFallbackQuestions(keyword: string, type: QuestionType): GeneratedQuestion[] {
    const templates: Record<QuestionType, string[]> = {
      what: [`What is ${keyword}?`, `What are the benefits of ${keyword}?`],
      why: [`Why is ${keyword} important?`, `Why use ${keyword}?`],
      how: [`How to use ${keyword}?`, `How does ${keyword} work?`],
      when: [`When to use ${keyword}?`, `When is ${keyword} needed?`],
      where: [`Where to find ${keyword}?`, `Where to learn ${keyword}?`],
      who: [`Who uses ${keyword}?`, `Who needs ${keyword}?`],
      can: [`Can ${keyword} help?`, `Can I learn ${keyword}?`],
      which: [`Which ${keyword} is best?`, `Which ${keyword} to choose?`],
      will: [`Will ${keyword} work?`, `Will ${keyword} improve results?`],
      is: [`Is ${keyword} worth it?`, `Is ${keyword} effective?`],
      comparison: [`${keyword} vs alternatives`, `Best ${keyword} comparison`],
      preposition: [`${keyword} for beginners`, `${keyword} for business`],
    };

    const questions = templates[type] || [`What is ${keyword}?`];

    return questions.map(q => ({
      question: q,
      searchVolume: 500,
      difficulty: 'medium' as const,
    }));
  }

  /**
   * Fallback FAQ
   */
  private getFallbackFAQ(topic: string, count: number): FAQItem[] {
    return [
      {
        question: `What is ${topic}?`,
        answer: `${topic} is a comprehensive approach that helps businesses achieve their goals through strategic implementation and best practices.`,
        category: 'General',
      },
      {
        question: `How does ${topic} work?`,
        answer: `${topic} works by systematically analyzing your current situation, identifying opportunities, and implementing proven strategies for success.`,
        category: 'Process',
      },
    ].slice(0, count);
  }
}
