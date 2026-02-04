/**
 * Keyword Intelligence Platform Types
 * Transforms keywords, topics, URLs, and content into actionable customer-intent insights
 */

// ============================================================================
// INTENT STAGES
// ============================================================================

export enum IntentStage {
  INFORMATIONAL = 'informational',     // User is learning/researching
  COMPARATIVE = 'comparative',          // User is comparing options
  TRANSACTIONAL = 'transactional',      // User is ready to act/buy
  PROBLEM_SOLUTION = 'problem_solution', // User has a specific problem
  TRUST_DRIVEN = 'trust_driven',         // User needs validation/proof
}

export interface IntentClassification {
  stage: IntentStage;
  confidence: number;
  signals: string[];
  description: string;
}

// ============================================================================
// KEYWORD INSIGHT
// ============================================================================

export interface KeywordInsight {
  keyword: string;
  intent: IntentClassification;
  customerContext: CustomerContext;
  opportunityScore: OpportunityMetrics;
  relatedQuestions: UserQuestion[];
  topicCluster?: TopicCluster;
}

export interface CustomerContext {
  painPoints: string[];
  expectedOutcomes: string[];
  businessRelevance: string;
  buyerPersona: string;
  journeyStage: string;
}

export interface OpportunityMetrics {
  overallScore: number; // 0-100
  demandStrength: number;
  competitionLevel: number;
  contentGapScore: number;
  conversionPotential: number;
  priorityLevel: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
}

// ============================================================================
// USER QUESTIONS (Answer The Public style)
// ============================================================================

export interface UserQuestion {
  question: string;
  type: QuestionType;
  searchVolume?: number;
  intent: IntentStage;
  priority: number;
}

export enum QuestionType {
  WHAT = 'what',
  WHY = 'why',
  HOW = 'how',
  WHEN = 'when',
  WHERE = 'where',
  WHO = 'who',
  CAN = 'can',
  WHICH = 'which',
  WILL = 'will',
  IS = 'is',
  COMPARISON = 'comparison',  // vs, or, compared to
  PREPOSITION = 'preposition', // for, with, without, near
}

export interface QuestionCluster {
  type: QuestionType;
  questions: UserQuestion[];
  totalVolume: number;
  avgPriority: number;
}

// ============================================================================
// TOPIC CLUSTERS & SEMANTIC ANALYSIS
// ============================================================================

export interface TopicCluster {
  id: string;
  name: string;
  pillarKeyword: string;
  clusterKeywords: ClusterKeyword[];
  semanticRelevance: number;
  contentCoverage: number;
  gapAnalysis: KeywordContentGap[];
}

export interface ClusterKeyword {
  keyword: string;
  relationship: 'synonym' | 'subtopic' | 'related' | 'modifier' | 'long_tail';
  volume: number;
  difficulty: number;
  covered: boolean;
}

export interface KeywordContentGap {
  topic: string;
  currentCoverage: number;
  competitorCoverage: number;
  opportunity: string;
  suggestedContent: string;
}

// ============================================================================
// CONTENT BRIEF GENERATION
// ============================================================================

export interface ContentBrief {
  id: string;
  targetKeyword: string;
  title: string;
  intent: IntentStage;
  wordCountTarget: { min: number; max: number };
  outline: ContentOutlineItem[];
  questionsToAnswer: string[];
  keywordsToInclude: string[];
  competitorInsights: CompetitorContentInsight[];
  callToAction: string;
  createdAt: string;
}

export interface ContentOutlineItem {
  heading: string;
  level: 'h1' | 'h2' | 'h3';
  keyPoints: string[];
  suggestedWordCount: number;
}

export interface CompetitorContentInsight {
  competitorDomain: string;
  contentTitle: string;
  wordCount: number;
  headings: string[];
  uniqueAngles: string[];
}

// ============================================================================
// EDITORIAL PLAN
// ============================================================================

export interface EditorialPlan {
  id: string;
  name: string;
  dateRange: { start: string; end: string };
  contentItems: EditorialItem[];
  topicCoverage: TopicCoverageMap;
  projectedImpact: KeywordProjectedImpact;
}

export interface EditorialItem {
  id: string;
  title: string;
  targetKeyword: string;
  contentType: 'blog' | 'guide' | 'comparison' | 'tutorial' | 'faq' | 'case_study';
  intent: IntentStage;
  priority: number;
  scheduledDate?: string;
  status: 'planned' | 'in_progress' | 'review' | 'published';
  projectedTraffic: number;
  brief?: ContentBrief;
}

export interface TopicCoverageMap {
  clusters: Array<{
    topic: string;
    currentCoverage: number;
    plannedCoverage: number;
    contentCount: number;
  }>;
}

export interface KeywordProjectedImpact {
  estimatedTraffic: number;
  keywordsCovered: number;
  intentDistribution: Record<IntentStage, number>;
  topicAuthority: number;
}

// ============================================================================
// FAQ GENERATION
// ============================================================================

export interface FAQItem {
  question: string;
  answer: string;
  keywords: string[];
  intent: IntentStage;
  schemaReady: boolean;
  priority: number;
}

export interface FAQCollection {
  topic: string;
  items: FAQItem[];
  schemaMarkup: string;
  lastUpdated: string;
}

// ============================================================================
// TOPIC MAP (Visualization Data)
// ============================================================================

export interface TopicMapNode {
  id: string;
  label: string;
  type: 'pillar' | 'cluster' | 'keyword' | 'question';
  volume?: number;
  intent?: IntentStage;
  covered: boolean;
  children?: TopicMapNode[];
}

export interface TopicMap {
  rootTopic: string;
  nodes: TopicMapNode[];
  connections: Array<{
    source: string;
    target: string;
    strength: number;
  }>;
  metrics: {
    totalNodes: number;
    coveredNodes: number;
    avgVolume: number;
    intentDistribution: Record<IntentStage, number>;
  };
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface KeywordIntelligenceRequest {
  input: string; // keyword, topic, URL, or content
  inputType: 'keyword' | 'topic' | 'url' | 'content';
  options?: {
    includeQuestions?: boolean;
    includeTopicMap?: boolean;
    generateBrief?: boolean;
    competitorAnalysis?: boolean;
    depth?: 'quick' | 'standard' | 'deep';
  };
}

export interface KeywordIntelligenceResponse {
  id: string;
  input: string;
  inputType: string;
  analyzedAt: string;

  // Core Insights
  primaryInsight: KeywordInsight;
  relatedInsights: KeywordInsight[];

  // Questions & Topics
  questionClusters: QuestionCluster[];
  topicMap?: TopicMap;

  // Action Items
  contentBrief?: ContentBrief;
  faqCollection?: FAQCollection;
  editorialSuggestions?: EditorialItem[];

  // Metrics
  overallOpportunity: OpportunityMetrics;
  competitorGaps: KeywordContentGap[];
}

// ============================================================================
// DASHBOARD WIDGETS
// ============================================================================

export interface InsightCard {
  id: string;
  type: 'opportunity' | 'question' | 'gap' | 'trend' | 'action';
  title: string;
  description: string;
  metrics: Record<string, number | string>;
  intent?: IntentStage;
  priority: number;
  actionLabel?: string;
  actionTarget?: string;
}

export interface IntentTree {
  stages: Array<{
    stage: IntentStage;
    keywords: string[];
    questions: string[];
    contentNeeded: string[];
    coverage: number;
  }>;
}

export interface DecisionDashboard {
  quickWins: InsightCard[];
  strategicOpportunities: InsightCard[];
  contentGaps: InsightCard[];
  trendingTopics: InsightCard[];
  intentTree: IntentTree;
  topicHealth: TopicCoverageMap;
}
