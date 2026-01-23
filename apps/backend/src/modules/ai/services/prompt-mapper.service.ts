import { Injectable } from '@nestjs/common';

/**
 * Intelligent Prompt-to-Data Mapper
 * Maps user prompts to specific data queries and analysis
 */

export interface PromptIntent {
  type: 'traffic_analysis' | 'ctr_analysis' | 'competitor_ranking' | 'general';
  confidence: number;
  keywords: string[];
  dataSources: string[];
}

export interface DataSource {
  name: string;
  type: 'analytics' | 'seo' | 'keywords' | 'competitors';
  query: string;
  relevance: number;
}

export interface PromptAnalysis {
  intent: PromptIntent;
  requiredDataSources: DataSource[];
  suggestedQueries: string[];
}

@Injectable()
export class PromptMapperService {
  /**
   * Analyze user prompt and determine intent
   */
  analyzePrompt(userPrompt: string): PromptAnalysis {
    const lowerPrompt = userPrompt.toLowerCase();

    // Traffic drop analysis
    if (this.isTrafficDropQuery(lowerPrompt)) {
      return this.mapTrafficDropIntent(userPrompt);
    }

    // Low CTR analysis
    if (this.isLowCtrQuery(lowerPrompt)) {
      return this.mapLowCtrIntent(userPrompt);
    }

    // Competitor ranking analysis
    if (this.isCompetitorRankingQuery(lowerPrompt)) {
      return this.mapCompetitorRankingIntent(userPrompt);
    }

    // General query
    return this.mapGeneralIntent(userPrompt);
  }

  /**
   * Check if query is about traffic drops
   */
  private isTrafficDropQuery(prompt: string): boolean {
    const trafficKeywords = ['traffic', 'visitors', 'visits', 'views'];
    const dropKeywords = ['drop', 'decrease', 'decline', 'fall', 'down', 'lost', 'losing'];
    
    return trafficKeywords.some(k => prompt.includes(k)) && 
           dropKeywords.some(k => prompt.includes(k));
  }

  /**
   * Check if query is about low CTR
   */
  private isLowCtrQuery(prompt: string): boolean {
    const ctrKeywords = ['ctr', 'click', 'click-through', 'click rate'];
    const lowKeywords = ['low', 'poor', 'bad', 'under', 'below'];
    
    return ctrKeywords.some(k => prompt.includes(k)) && 
           lowKeywords.some(k => prompt.includes(k));
  }

  /**
   * Check if query is about competitor rankings
   */
  private isCompetitorRankingQuery(prompt: string): boolean {
    const competitorKeywords = ['competitor', 'competition', 'rival', 'other sites'];
    const rankKeywords = ['outrank', 'rank', 'ranking', 'position', 'beat', 'better'];
    
    return competitorKeywords.some(k => prompt.includes(k)) && 
           rankKeywords.some(k => prompt.includes(k));
  }

  /**
   * Map traffic drop intent to data queries
   */
  private mapTrafficDropIntent(userPrompt: string): PromptAnalysis {
    return {
      intent: {
        type: 'traffic_analysis',
        confidence: 0.92,
        keywords: ['traffic', 'drop', 'analytics'],
        dataSources: ['analytics', 'seo', 'keywords'],
      },
      requiredDataSources: [
        {
          name: 'Google Analytics - Traffic Trend',
          type: 'analytics',
          query: 'SELECT date, sessions, users FROM analytics WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
          relevance: 1.0,
        },
        {
          name: 'SEO Audit - Recent Changes',
          type: 'seo',
          query: 'SELECT * FROM seo_audits WHERE audit_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
          relevance: 0.85,
        },
        {
          name: 'Keyword Rankings - Changes',
          type: 'keywords',
          query: 'SELECT keyword, previous_rank, current_rank FROM keyword_rankings WHERE rank_change < 0',
          relevance: 0.9,
        },
      ],
      suggestedQueries: [
        'Show me the exact dates when traffic dropped',
        'Which pages lost the most traffic?',
        'Did any keywords drop in rankings recently?',
      ],
    };
  }

  /**
   * Map low CTR intent to data queries
   */
  private mapLowCtrIntent(userPrompt: string): PromptAnalysis {
    return {
      intent: {
        type: 'ctr_analysis',
        confidence: 0.89,
        keywords: ['ctr', 'click-through', 'pages'],
        dataSources: ['seo', 'analytics'],
      },
      requiredDataSources: [
        {
          name: 'Search Console - CTR by Page',
          type: 'seo',
          query: 'SELECT page_url, impressions, clicks, ctr FROM search_console WHERE ctr < 0.02',
          relevance: 1.0,
        },
        {
          name: 'Page Metadata - Titles & Descriptions',
          type: 'seo',
          query: 'SELECT url, title, meta_description FROM pages WHERE ctr < 2.0',
          relevance: 0.95,
        },
        {
          name: 'Keyword Rankings - Low CTR Keywords',
          type: 'keywords',
          query: 'SELECT keyword, rank, ctr FROM keyword_rankings WHERE ctr < 0.03 AND rank <= 10',
          relevance: 0.88,
        },
      ],
      suggestedQueries: [
        'What are the common issues with these pages?',
        'Show me title and description examples',
        'How can I improve the meta descriptions?',
      ],
    };
  }

  /**
   * Map competitor ranking intent to data queries
   */
  private mapCompetitorRankingIntent(userPrompt: string): PromptAnalysis {
    return {
      intent: {
        type: 'competitor_ranking',
        confidence: 0.95,
        keywords: ['competitors', 'outrank', 'ranking'],
        dataSources: ['competitors', 'keywords'],
      },
      requiredDataSources: [
        {
          name: 'Competitor Rankings - Comparison',
          type: 'competitors',
          query: 'SELECT competitor_domain, keyword, competitor_rank, our_rank FROM competitor_rankings WHERE competitor_rank < our_rank',
          relevance: 1.0,
        },
        {
          name: 'Competitor Analysis - Domain Authority',
          type: 'competitors',
          query: 'SELECT domain, authority_score, total_keywords, common_keywords FROM competitors',
          relevance: 0.92,
        },
        {
          name: 'Content Gap Analysis',
          type: 'keywords',
          query: 'SELECT keyword, search_volume, competitors_ranking FROM keywords WHERE our_rank IS NULL',
          relevance: 0.87,
        },
      ],
      suggestedQueries: [
        'Which keywords do they rank for that we don\'t?',
        'What is their domain authority compared to ours?',
        'Show me the biggest content gaps',
      ],
    };
  }

  /**
   * Map general intent
   */
  private mapGeneralIntent(userPrompt: string): PromptAnalysis {
    return {
      intent: {
        type: 'general',
        confidence: 0.6,
        keywords: [],
        dataSources: ['seo', 'keywords', 'competitors', 'analytics'],
      },
      requiredDataSources: [],
      suggestedQueries: [
        'What are my top performing keywords?',
        'How is my SEO score?',
        'Show me my competitor analysis',
      ],
    };
  }
}
