/**
 * CRO (Conversion Rate Optimization) types
 */

export interface CroInsight {
  id: string;
  projectId: string;
  pageUrl: string;
  type: CroInsightType;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  currentMetrics: PageMetrics;
  projectedImpact: ProjectedImpact;
  recommendations: CroRecommendation[];
  status: InsightStatus;
  createdAt: string;
  updatedAt: string;
}

export enum CroInsightType {
  HIGH_TRAFFIC_LOW_CONVERSION = 'high_traffic_low_conversion',
  HIGH_BOUNCE_RATE = 'high_bounce_rate',
  POOR_ENGAGEMENT = 'poor_engagement',
  FUNNEL_DROP_OFF = 'funnel_drop_off',
  SLOW_PAGE_SPEED = 'slow_page_speed',
  MOBILE_ISSUES = 'mobile_issues',
  FORM_ABANDONMENT = 'form_abandonment',
  INTENT_MISMATCH = 'intent_mismatch',
  HIGH_EXIT_RATE = 'high_exit_rate',
}

export interface PageMetrics {
  url: string;
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
  bounceRate: number;
  exitRate: number;
  conversions: number;
  conversionRate: number;
  revenue?: number;
}

export interface ProjectedImpact {
  conversionRateIncrease: number; // percentage
  additionalConversions: number;
  potentialRevenue?: number;
  confidence: number; // 0-100
}

export interface CroRecommendation {
  id: string;
  category: CroCategory;
  title: string;
  description: string;
  reasoning: string;
  actionItems: ActionItem[];
  effort: 'low' | 'medium' | 'high';
  expectedImpact: 'low' | 'medium' | 'high';
  examples?: CroExample[];
  aiGenerated: boolean;
}

export enum CroCategory {
  COPY_OPTIMIZATION = 'copy_optimization',
  DESIGN_UX = 'design_ux',
  CTA_OPTIMIZATION = 'cta_optimization',
  FORM_OPTIMIZATION = 'form_optimization',
  TRUST_SIGNALS = 'trust_signals',
  PAGE_SPEED = 'page_speed',
  MOBILE_OPTIMIZATION = 'mobile_optimization',
  PERSONALIZATION = 'personalization',
  TECHNICAL = 'technical',
}

export interface ActionItem {
  id: string;
  description: string;
  completed: boolean;
  assignee?: string;
  dueDate?: string;
}

export interface CroExample {
  title: string;
  description: string;
  beforeUrl?: string;
  afterUrl?: string;
  impact?: string;
}

export enum InsightStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  IMPLEMENTED = 'implemented',
  TESTING = 'testing',
  DISMISSED = 'dismissed',
}

export interface CroDashboard {
  projectId: string;
  summary: CroSummary;
  topOpportunities: CroInsight[];
  recentTests: CroTest[];
  impactAnalysis: ImpactAnalysis;
}

export interface CroSummary {
  totalInsights: number;
  criticalIssues: number;
  averageConversionRate: number;
  projectedLift: number;
  implementedRecommendations: number;
}

export interface CroTest {
  id: string;
  name: string;
  type: 'a_b' | 'multivariate';
  status: 'running' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  variants: TestVariant[];
  winner?: string;
}

export interface TestVariant {
  id: string;
  name: string;
  conversionRate: number;
  visitors: number;
  conversions: number;
  isControl: boolean;
}

export interface ImpactAnalysis {
  totalPotentialLift: number;
  quickWins: CroInsight[];
  longTermOpportunities: CroInsight[];
  estimatedROI: number;
}
