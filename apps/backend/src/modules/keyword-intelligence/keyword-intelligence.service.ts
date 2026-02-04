import { Injectable, Logger } from '@nestjs/common';
import {
  KeywordIntelligenceRequest,
  KeywordIntelligenceResponse,
  KeywordInsight,
  IntentStage,
  IntentClassification,
  CustomerContext,
  OpportunityMetrics,
  InsightCard,
  IntentTree,
  DecisionDashboard,
  TopicCoverageMap,
} from '@riviso/shared-types';
import { QuestionGeneratorService } from './services/question-generator.service';
import { TopicAnalyzerService } from './services/topic-analyzer.service';
import { ContentBriefGeneratorService } from './services/content-brief-generator.service';
import { AnalyzeKeywordDto, InputType, AnalysisDepth } from './dto/keyword-intelligence.dto';

/**
 * Main Keyword Intelligence Service
 * Transforms keywords, topics, URLs, and content into actionable customer-intent insights
 */
@Injectable()
export class KeywordIntelligenceService {
  private readonly logger = new Logger(KeywordIntelligenceService.name);

  constructor(
    private readonly questionGenerator: QuestionGeneratorService,
    private readonly topicAnalyzer: TopicAnalyzerService,
    private readonly briefGenerator: ContentBriefGeneratorService,
  ) {}

  /**
   * Main analysis endpoint - processes any input type
   */
  async analyze(dto: AnalyzeKeywordDto): Promise<KeywordIntelligenceResponse> {
    this.logger.log(`Analyzing input: "${dto.input}" (type: ${dto.inputType})`);

    const startTime = Date.now();

    // Extract primary keyword based on input type
    const primaryKeyword = this.extractPrimaryKeyword(dto.input, dto.inputType);

    // Generate primary insight
    const primaryInsight = await this.generateKeywordInsight(primaryKeyword);

    // Generate related insights
    const relatedInsights = this.generateRelatedInsights(primaryKeyword);

    // Generate question clusters
    const questionClusters = dto.includeQuestions !== false
      ? await this.questionGenerator.generateQuestions(primaryKeyword)
      : [];

    // Generate topic map if requested
    const topicMap = dto.includeTopicMap
      ? this.topicAnalyzer.generateTopicMap(primaryKeyword, dto.depth)
      : undefined;

    // Generate content brief if requested (AI-powered)
    const contentBrief = dto.generateBrief
      ? await this.briefGenerator.generateContentBrief(primaryKeyword)
      : undefined;

    // Generate FAQ collection (AI-powered)
    const faqCollection = await this.briefGenerator.generateFAQCollection(primaryKeyword, 8);

    // Generate editorial suggestions
    const editorialSuggestions = this.briefGenerator.generateEditorialPlan(primaryKeyword, 5, 2).contentItems;

    // Calculate overall opportunity
    const overallOpportunity = this.calculateOverallOpportunity(primaryInsight, questionClusters);

    // Identify competitor gaps
    const topicCluster = this.topicAnalyzer.buildTopicCluster(primaryKeyword);
    const competitorGaps = topicCluster.gapAnalysis;

    const processingTime = Date.now() - startTime;
    this.logger.log(`Analysis completed in ${processingTime}ms`);

    return {
      id: `analysis-${Date.now()}`,
      input: dto.input,
      inputType: dto.inputType,
      analyzedAt: new Date().toISOString(),
      primaryInsight,
      relatedInsights,
      questionClusters,
      topicMap,
      contentBrief,
      faqCollection,
      editorialSuggestions,
      overallOpportunity,
      competitorGaps,
    };
  }

  /**
   * Generate a decision dashboard for strategic planning
   */
  async generateDashboard(keyword: string): Promise<DecisionDashboard> {
    const insight = await this.generateKeywordInsight(keyword);
    const questionClusters = await this.questionGenerator.generateQuestions(keyword);
    const topicCluster = this.topicAnalyzer.buildTopicCluster(keyword);

    // Generate quick wins
    const quickWins = this.generateQuickWins(keyword, questionClusters);

    // Generate strategic opportunities
    const strategicOpportunities = this.generateStrategicOpportunities(keyword, topicCluster);

    // Generate content gap cards
    const contentGaps = topicCluster.gapAnalysis.map((gap, idx) => ({
      id: `gap-${idx}`,
      type: 'gap' as const,
      title: gap.topic,
      description: gap.opportunity,
      metrics: {
        currentCoverage: `${gap.currentCoverage}%`,
        competitorCoverage: `${Math.round(gap.competitorCoverage)}%`,
      },
      priority: 10 - idx,
      actionLabel: 'Create Content',
    }));

    // Generate trending topics
    const trendingTopics = this.generateTrendingCards(keyword);

    // Build intent tree
    const intentTree = this.buildIntentTree(keyword, questionClusters);

    // Topic health map
    const topicHealth: TopicCoverageMap = {
      clusters: topicCluster.clusterKeywords
        .reduce((acc, kw) => {
          const existing = acc.find(c => c.topic === kw.relationship);
          if (existing) {
            existing.contentCount++;
            existing.plannedCoverage += kw.covered ? 20 : 0;
          } else {
            acc.push({
              topic: kw.relationship,
              currentCoverage: kw.covered ? 50 : 0,
              plannedCoverage: kw.covered ? 20 : 0,
              contentCount: 1,
            });
          }
          return acc;
        }, [] as TopicCoverageMap['clusters']),
    };

    return {
      quickWins,
      strategicOpportunities,
      contentGaps,
      trendingTopics,
      intentTree,
      topicHealth,
    };
  }

  private extractPrimaryKeyword(input: string, inputType: InputType): string {
    switch (inputType) {
      case InputType.URL:
        // Extract meaningful keywords from URL
        const urlParts = input.replace(/https?:\/\//, '').split('/');
        const slug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || '';
        return slug.replace(/-/g, ' ').replace(/_/g, ' ').trim() || input;

      case InputType.CONTENT:
        // Extract main topic from content (simplified)
        const words = input.toLowerCase().split(/\s+/);
        const wordFreq = words.reduce((acc, word) => {
          if (word.length > 4) acc[word] = (acc[word] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topWords = Object.entries(wordFreq)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([word]) => word);
        return topWords.join(' ') || input.substring(0, 50);

      case InputType.TOPIC:
      case InputType.KEYWORD:
      default:
        return input.toLowerCase().trim();
    }
  }

  private async generateKeywordInsight(keyword: string): Promise<KeywordInsight> {
    const intent = this.classifyIntent(keyword);
    const customerContext = this.analyzeCustomerContext(keyword, intent);
    const opportunityScore = this.calculateOpportunityScore(keyword, intent);
    const questionClusters = await this.questionGenerator.generateQuestions(keyword);

    // Get top questions from clusters
    const relatedQuestions = questionClusters
      .flatMap(cluster => cluster.questions)
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);

    const topicCluster = this.topicAnalyzer.buildTopicCluster(keyword);

    return {
      keyword,
      intent,
      customerContext,
      opportunityScore,
      relatedQuestions,
      topicCluster,
    };
  }

  private generateRelatedInsights(keyword: string): KeywordInsight[] {
    const relatedKeywords = [
      `${keyword} tools`,
      `best ${keyword}`,
      `${keyword} for beginners`,
      `how to ${keyword}`,
      `${keyword} strategy`,
    ];

    return relatedKeywords.slice(0, 3).map(kw => ({
      keyword: kw,
      intent: this.classifyIntent(kw),
      customerContext: this.analyzeCustomerContext(kw, this.classifyIntent(kw)),
      opportunityScore: this.calculateOpportunityScore(kw, this.classifyIntent(kw)),
      relatedQuestions: [],
    }));
  }

  private classifyIntent(keyword: string): IntentClassification {
    const lower = keyword.toLowerCase();
    const signals: string[] = [];
    let stage = IntentStage.INFORMATIONAL;
    let confidence = 0.7;

    // Transactional signals
    if (lower.includes('buy') || lower.includes('price') || lower.includes('discount') || lower.includes('deal')) {
      stage = IntentStage.TRANSACTIONAL;
      signals.push('Purchase-intent keywords detected');
      confidence = 0.9;
    }
    // Comparative signals
    else if (lower.includes('vs') || lower.includes('compare') || lower.includes('best') || lower.includes('top')) {
      stage = IntentStage.COMPARATIVE;
      signals.push('Comparison-intent keywords detected');
      confidence = 0.85;
    }
    // Problem-solution signals
    else if (lower.includes('how to') || lower.includes('fix') || lower.includes('solve') || lower.includes('guide')) {
      stage = IntentStage.PROBLEM_SOLUTION;
      signals.push('Problem-solving intent detected');
      confidence = 0.88;
    }
    // Trust-driven signals
    else if (lower.includes('review') || lower.includes('reliable') || lower.includes('worth') || lower.includes('safe')) {
      stage = IntentStage.TRUST_DRIVEN;
      signals.push('Trust-validation intent detected');
      confidence = 0.82;
    }
    // Default informational
    else {
      signals.push('General informational query');
      confidence = 0.75;
    }

    const descriptions: Record<IntentStage, string> = {
      [IntentStage.INFORMATIONAL]: 'User is researching and learning about the topic',
      [IntentStage.COMPARATIVE]: 'User is comparing options before making a decision',
      [IntentStage.TRANSACTIONAL]: 'User is ready to take action or make a purchase',
      [IntentStage.PROBLEM_SOLUTION]: 'User has a specific problem and needs a solution',
      [IntentStage.TRUST_DRIVEN]: 'User needs validation and social proof before proceeding',
    };

    return {
      stage,
      confidence,
      signals,
      description: descriptions[stage],
    };
  }

  private analyzeCustomerContext(keyword: string, intent: IntentClassification): CustomerContext {
    const painPoints = this.identifyPainPoints(keyword, intent.stage);
    const expectedOutcomes = this.identifyExpectedOutcomes(keyword, intent.stage);

    return {
      painPoints,
      expectedOutcomes,
      businessRelevance: this.generateBusinessRelevance(keyword, intent.stage),
      buyerPersona: this.identifyBuyerPersona(keyword),
      journeyStage: this.mapToJourneyStage(intent.stage),
    };
  }

  private identifyPainPoints(keyword: string, intent: IntentStage): string[] {
    const basePainPoints = [
      `Difficulty understanding ${keyword}`,
      `Lack of expertise in ${keyword}`,
      `Time constraints for ${keyword}`,
      `Budget limitations for ${keyword}`,
    ];

    const intentSpecificPainPoints: Record<IntentStage, string[]> = {
      [IntentStage.INFORMATIONAL]: [
        `Information overload about ${keyword}`,
        `Conflicting advice on ${keyword}`,
      ],
      [IntentStage.COMPARATIVE]: [
        `Too many ${keyword} options to choose from`,
        `Difficulty differentiating ${keyword} solutions`,
      ],
      [IntentStage.TRANSACTIONAL]: [
        `Uncertainty about ROI of ${keyword}`,
        `Fear of making wrong ${keyword} choice`,
      ],
      [IntentStage.PROBLEM_SOLUTION]: [
        `Urgent ${keyword} problems affecting business`,
        `Previous failed attempts at ${keyword}`,
      ],
      [IntentStage.TRUST_DRIVEN]: [
        `Past negative experiences with ${keyword}`,
        `Skepticism about ${keyword} claims`,
      ],
    };

    return [...basePainPoints.slice(0, 2), ...intentSpecificPainPoints[intent]];
  }

  private identifyExpectedOutcomes(keyword: string, intent: IntentStage): string[] {
    const outcomeTemplates: Record<IntentStage, string[]> = {
      [IntentStage.INFORMATIONAL]: [
        `Clear understanding of ${keyword}`,
        `Knowledge to make informed decisions`,
        `Ability to evaluate ${keyword} options`,
      ],
      [IntentStage.COMPARATIVE]: [
        `Confident selection of best ${keyword}`,
        `Clear differentiation between options`,
        `Data-driven decision making`,
      ],
      [IntentStage.TRANSACTIONAL]: [
        `Successful ${keyword} implementation`,
        `Measurable ROI from ${keyword}`,
        `Quick time-to-value`,
      ],
      [IntentStage.PROBLEM_SOLUTION]: [
        `Solved ${keyword} challenges`,
        `Step-by-step action plan`,
        `Immediate improvements`,
      ],
      [IntentStage.TRUST_DRIVEN]: [
        `Confidence in ${keyword} choice`,
        `Risk mitigation through validation`,
        `Peace of mind from social proof`,
      ],
    };

    return outcomeTemplates[intent];
  }

  private generateBusinessRelevance(keyword: string, intent: IntentStage): string {
    const relevanceMap: Record<IntentStage, string> = {
      [IntentStage.INFORMATIONAL]: `Establishes thought leadership in ${keyword}, builds brand awareness, and nurtures prospects in early buying stages`,
      [IntentStage.COMPARATIVE]: `Captures high-intent traffic actively evaluating ${keyword} solutions, directly influences purchase decisions`,
      [IntentStage.TRANSACTIONAL]: `Directly drives conversions and revenue from ${keyword}-related purchases, highest commercial value`,
      [IntentStage.PROBLEM_SOLUTION]: `Demonstrates expertise and builds trust by solving real ${keyword} problems, creates qualified leads`,
      [IntentStage.TRUST_DRIVEN]: `Converts hesitant prospects into customers by addressing ${keyword} concerns, reduces sales friction`,
    };

    return relevanceMap[intent];
  }

  private identifyBuyerPersona(keyword: string): string {
    const words = keyword.toLowerCase();
    if (words.includes('enterprise') || words.includes('business') || words.includes('corporate')) {
      return 'Enterprise Decision Maker';
    }
    if (words.includes('small business') || words.includes('startup') || words.includes('smb')) {
      return 'Small Business Owner';
    }
    if (words.includes('beginner') || words.includes('basics') || words.includes('learn')) {
      return 'Early-Stage Learner';
    }
    if (words.includes('advanced') || words.includes('expert') || words.includes('pro')) {
      return 'Advanced Practitioner';
    }
    return 'General Business Professional';
  }

  private mapToJourneyStage(intent: IntentStage): string {
    const journeyMap: Record<IntentStage, string> = {
      [IntentStage.INFORMATIONAL]: 'Awareness Stage',
      [IntentStage.COMPARATIVE]: 'Consideration Stage',
      [IntentStage.TRANSACTIONAL]: 'Decision Stage',
      [IntentStage.PROBLEM_SOLUTION]: 'Problem Recognition',
      [IntentStage.TRUST_DRIVEN]: 'Validation Stage',
    };
    return journeyMap[intent];
  }

  private calculateOpportunityScore(keyword: string, intent: IntentClassification): OpportunityMetrics {
    // Simulated opportunity calculation
    const demandStrength = 50 + Math.random() * 40;
    const competitionLevel = 30 + Math.random() * 50;
    const contentGapScore = 40 + Math.random() * 50;
    const conversionPotential = this.getIntentConversionPotential(intent.stage);

    const overallScore = Math.round(
      (demandStrength * 0.3 + (100 - competitionLevel) * 0.25 + contentGapScore * 0.25 + conversionPotential * 0.2)
    );

    let priorityLevel: OpportunityMetrics['priorityLevel'];
    if (overallScore >= 80) priorityLevel = 'critical';
    else if (overallScore >= 65) priorityLevel = 'high';
    else if (overallScore >= 45) priorityLevel = 'medium';
    else priorityLevel = 'low';

    return {
      overallScore,
      demandStrength: Math.round(demandStrength),
      competitionLevel: Math.round(competitionLevel),
      contentGapScore: Math.round(contentGapScore),
      conversionPotential: Math.round(conversionPotential),
      priorityLevel,
      reasoning: this.generateOpportunityReasoning(overallScore, demandStrength, competitionLevel, contentGapScore),
    };
  }

  private getIntentConversionPotential(intent: IntentStage): number {
    const potentialMap: Record<IntentStage, number> = {
      [IntentStage.TRANSACTIONAL]: 90,
      [IntentStage.COMPARATIVE]: 75,
      [IntentStage.TRUST_DRIVEN]: 70,
      [IntentStage.PROBLEM_SOLUTION]: 65,
      [IntentStage.INFORMATIONAL]: 40,
    };
    return potentialMap[intent];
  }

  private generateOpportunityReasoning(overall: number, demand: number, competition: number, gap: number): string {
    const parts: string[] = [];

    if (demand > 70) parts.push('strong search demand');
    else if (demand > 50) parts.push('moderate search demand');
    else parts.push('limited search demand');

    if (competition < 40) parts.push('low competition');
    else if (competition < 60) parts.push('moderate competition');
    else parts.push('high competition');

    if (gap > 60) parts.push('significant content gaps to fill');
    else if (gap > 40) parts.push('some content opportunities');

    return `This keyword shows ${parts.join(', ')}. ${overall >= 70 ? 'High priority opportunity.' : overall >= 50 ? 'Worth pursuing with focused effort.' : 'Consider as part of broader strategy.'}`;
  }

  private calculateOverallOpportunity(insight: KeywordInsight, questionClusters: any[]): OpportunityMetrics {
    const baseScore = insight.opportunityScore.overallScore;
    const questionBonus = Math.min(10, questionClusters.length * 2);

    return {
      ...insight.opportunityScore,
      overallScore: Math.min(100, baseScore + questionBonus),
      reasoning: `${insight.opportunityScore.reasoning} Additionally, ${questionClusters.length} question clusters identified for content expansion.`,
    };
  }

  private generateQuickWins(keyword: string, questionClusters: any[]): InsightCard[] {
    const wins: InsightCard[] = [];

    // High-volume questions
    const topQuestions = questionClusters
      .flatMap(c => c.questions)
      .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0))
      .slice(0, 3);

    topQuestions.forEach((q, idx) => {
      wins.push({
        id: `quick-win-${idx}`,
        type: 'opportunity',
        title: 'Answer High-Volume Question',
        description: q.question,
        metrics: {
          searchVolume: q.searchVolume || 0,
          priority: q.priority,
        },
        intent: q.intent,
        priority: 10 - idx,
        actionLabel: 'Create FAQ',
      });
    });

    // Add easy content opportunity
    wins.push({
      id: 'quick-win-content',
      type: 'action',
      title: 'Create Beginner Guide',
      description: `Create a comprehensive beginner's guide to ${keyword}`,
      metrics: {
        estimatedTraffic: '500-1000/mo',
        difficulty: 'Low',
      },
      priority: 7,
      actionLabel: 'Generate Brief',
    });

    return wins;
  }

  private generateStrategicOpportunities(keyword: string, topicCluster: any): InsightCard[] {
    const opportunities: InsightCard[] = [];

    // Topic authority opportunity
    opportunities.push({
      id: 'strategic-1',
      type: 'opportunity',
      title: 'Build Topic Authority',
      description: `Create a content hub around "${keyword}" with ${topicCluster.clusterKeywords.length} supporting articles`,
      metrics: {
        keywordsCovered: topicCluster.clusterKeywords.length,
        contentGap: `${100 - topicCluster.contentCoverage}%`,
      },
      priority: 9,
      actionLabel: 'View Plan',
    });

    // Comparison content opportunity
    opportunities.push({
      id: 'strategic-2',
      type: 'opportunity',
      title: 'Comparison Content Strategy',
      description: `Capture comparative search intent with "best ${keyword}" and "${keyword} vs" content`,
      metrics: {
        intent: 'Comparative',
        conversionRate: 'High',
      },
      intent: IntentStage.COMPARATIVE,
      priority: 8,
      actionLabel: 'Create Comparison',
    });

    return opportunities;
  }

  private generateTrendingCards(keyword: string): InsightCard[] {
    return [
      {
        id: 'trend-1',
        type: 'trend',
        title: 'Rising Search Interest',
        description: `"${keyword} automation" seeing 45% increase in searches`,
        metrics: {
          growth: '+45%',
          trend: 'Rising',
        },
        priority: 8,
        actionLabel: 'Explore',
      },
      {
        id: 'trend-2',
        type: 'trend',
        title: 'New Question Trend',
        description: `"How to ${keyword} with AI" is emerging as a trending query`,
        metrics: {
          growth: '+32%',
          trend: 'Emerging',
        },
        priority: 7,
        actionLabel: 'Explore',
      },
    ];
  }

  private buildIntentTree(keyword: string, questionClusters: any[]): IntentTree {
    const stages = Object.values(IntentStage).map(stage => {
      const stageQuestions = questionClusters
        .flatMap(c => c.questions)
        .filter(q => q.intent === stage)
        .map(q => q.question)
        .slice(0, 5);

      const stageKeywords = this.getKeywordsForIntent(keyword, stage);
      const contentNeeded = this.getContentNeededForIntent(keyword, stage);
      const coverage = Math.floor(30 + Math.random() * 50);

      return {
        stage,
        keywords: stageKeywords,
        questions: stageQuestions,
        contentNeeded,
        coverage,
      };
    });

    return { stages };
  }

  private getKeywordsForIntent(keyword: string, intent: IntentStage): string[] {
    const templates: Record<IntentStage, string[]> = {
      [IntentStage.INFORMATIONAL]: [
        `what is ${keyword}`,
        `${keyword} explained`,
        `${keyword} guide`,
      ],
      [IntentStage.COMPARATIVE]: [
        `best ${keyword}`,
        `${keyword} vs`,
        `top ${keyword}`,
      ],
      [IntentStage.TRANSACTIONAL]: [
        `buy ${keyword}`,
        `${keyword} pricing`,
        `${keyword} discount`,
      ],
      [IntentStage.PROBLEM_SOLUTION]: [
        `how to ${keyword}`,
        `${keyword} tips`,
        `fix ${keyword}`,
      ],
      [IntentStage.TRUST_DRIVEN]: [
        `${keyword} review`,
        `is ${keyword} worth it`,
        `${keyword} case study`,
      ],
    };
    return templates[intent];
  }

  private getContentNeededForIntent(keyword: string, intent: IntentStage): string[] {
    const templates: Record<IntentStage, string[]> = {
      [IntentStage.INFORMATIONAL]: ['Educational guide', 'Glossary page', 'Overview article'],
      [IntentStage.COMPARATIVE]: ['Comparison page', 'Top 10 list', 'Feature matrix'],
      [IntentStage.TRANSACTIONAL]: ['Pricing page', 'Product page', 'Landing page'],
      [IntentStage.PROBLEM_SOLUTION]: ['How-to tutorial', 'Step-by-step guide', 'Video tutorial'],
      [IntentStage.TRUST_DRIVEN]: ['Case study', 'Review roundup', 'Customer testimonials'],
    };
    return templates[intent];
  }
}
