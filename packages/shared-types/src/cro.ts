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

// ============================================================================
// CRO INTELLIGENCE PLATFORM - NICHE & INDUSTRY DETECTION
// ============================================================================

export interface NicheAnalysis {
  primaryIndustry: string;
  secondaryIndustries: string[];
  businessModel: BusinessModel;
  nicheConfidence: number;
  industrySignals: IndustrySignal[];
  competitivePosition: 'leader' | 'challenger' | 'niche_player' | 'emerging';
}

export type BusinessModel =
  | 'ecommerce'
  | 'saas'
  | 'marketplace'
  | 'lead_generation'
  | 'content_publisher'
  | 'subscription'
  | 'service_business'
  | 'affiliate'
  | 'freemium';

export interface IndustrySignal {
  signal: string;
  source: 'content' | 'structure' | 'keywords' | 'schema' | 'products';
  weight: number;
}

// ============================================================================
// AUDIENCE & PERSONA ANALYSIS
// ============================================================================

export interface AudienceAnalysis {
  primaryPersona: BuyerPersona;
  secondaryPersonas: BuyerPersona[];
  trafficSegments: TrafficSegment[];
  buyingStages: BuyingStageDistribution;
  psychographics: Psychographics;
}

export interface BuyerPersona {
  id: string;
  name: string;
  description: string;
  demographics: Demographics;
  goals: string[];
  painPoints: string[];
  objections: string[];
  decisionFactors: string[];
  preferredChannels: string[];
  contentPreferences: string[];
  buyingBehavior: BuyingBehavior;
}

export interface Demographics {
  ageRange?: string;
  gender?: 'male' | 'female' | 'all';
  incomeLevel?: 'low' | 'medium' | 'high' | 'premium';
  education?: string;
  occupation?: string;
  location?: string;
}

export interface BuyingBehavior {
  decisionSpeed: 'impulsive' | 'considered' | 'extended';
  priceSensitivity: 'low' | 'medium' | 'high';
  researchDepth: 'minimal' | 'moderate' | 'extensive';
  socialInfluence: 'low' | 'medium' | 'high';
}

export interface TrafficSegment {
  name: string;
  percentage: number;
  intent: CustomerIntent;
  conversionPotential: number;
}

export type CustomerIntent =
  | 'awareness'
  | 'consideration'
  | 'decision'
  | 'retention'
  | 'advocacy';

export interface BuyingStageDistribution {
  awareness: number;
  consideration: number;
  decision: number;
  retention: number;
}

export interface Psychographics {
  motivations: string[];
  fears: string[];
  values: string[];
  triggers: BehavioralTrigger[];
}

export interface BehavioralTrigger {
  trigger: string;
  type: 'urgency' | 'scarcity' | 'social_proof' | 'authority' | 'reciprocity' | 'commitment';
  effectiveness: number;
  recommendation: string;
}

// ============================================================================
// PAGE-LEVEL UX/UI/COPY ANALYSIS
// ============================================================================

export interface PageCroAnalysis {
  url: string;
  screenshotUrl?: string;
  analyzedAt: string;
  nicheAnalysis: NicheAnalysis;
  audienceAnalysis: AudienceAnalysis;
  uxAnalysis: UxAnalysis;
  uiAnalysis: UiAnalysis;
  copyAnalysis: CopyAnalysis;
  ctaAnalysis: CtaAnalysis;
  trustAnalysis: TrustAnalysis;
  navigationAnalysis: NavigationAnalysis;
  frictionAnalysis: FrictionAnalysis;
  overallScore: CroScore;
  recommendations: CroIntelligenceRecommendation[];
  abTestHypotheses: AbTestHypothesis[];
  benchmarkComparison?: BenchmarkComparison;
}

export interface UxAnalysis {
  score: number;
  pageFlow: 'clear' | 'confusing' | 'broken';
  cognitiveLoad: 'low' | 'optimal' | 'high';
  visualHierarchy: 'strong' | 'moderate' | 'weak';
  whitespaceUsage: 'good' | 'cramped' | 'sparse';
  mobileExperience: 'optimized' | 'acceptable' | 'poor';
  issues: UxIssue[];
}

export interface UxIssue {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  location: string;
  description: string;
  recommendation: string;
  expectedImpact: number;
}

export interface UiAnalysis {
  score: number;
  colorContrast: 'excellent' | 'good' | 'poor';
  typography: 'readable' | 'acceptable' | 'poor';
  imageQuality: 'high' | 'medium' | 'low';
  consistency: 'consistent' | 'inconsistent';
  brandAlignment: number;
  accessibilityScore: number;
  issues: UiIssue[];
}

export interface UiIssue {
  type: string;
  element: string;
  currentState: string;
  recommendedState: string;
  priority: 'high' | 'medium' | 'low';
}

export interface CopyAnalysis {
  score: number;
  clarity: number;
  persuasiveness: number;
  emotionalAppeal: number;
  benefitFocus: number;
  valueProposition: ValuePropositionAnalysis;
  headlines: HeadlineAnalysis;
  bodyContent: BodyContentAnalysis;
  tone: string;
  readingLevel: string;
  issues: CopyIssue[];
}

export interface ValuePropositionAnalysis {
  exists: boolean;
  clarity: number;
  uniqueness: number;
  placement: 'above_fold' | 'below_fold' | 'missing';
  suggestion?: string;
}

export interface HeadlineAnalysis {
  mainHeadline?: string;
  score: number;
  emotionalTriggers: string[];
  powerWords: string[];
  improvements: string[];
}

export interface BodyContentAnalysis {
  wordCount: number;
  scanability: number;
  bulletPoints: boolean;
  subheadings: boolean;
  shortParagraphs: boolean;
  issues: string[];
}

export interface CopyIssue {
  location: string;
  currentCopy: string;
  problem: string;
  suggestedCopy: string;
  rationale: string;
  expectedLift: number;
}

export interface CtaAnalysis {
  score: number;
  primaryCta?: CtaElement;
  secondaryCtas: CtaElement[];
  ctaCount: number;
  placement: 'optimal' | 'suboptimal' | 'missing';
  visibility: 'high' | 'medium' | 'low';
  urgency: 'strong' | 'moderate' | 'weak' | 'none';
  issues: CtaIssue[];
}

export interface CtaElement {
  text: string;
  location: string;
  color: string;
  size: 'large' | 'medium' | 'small';
  contrast: 'high' | 'medium' | 'low';
  actionOriented: boolean;
  valueProposition: boolean;
}

export interface CtaIssue {
  currentCta: string;
  problem: string;
  suggestedCta: string;
  rationale: string;
  expectedLift: number;
}

export interface TrustAnalysis {
  score: number;
  trustSignals: TrustSignal[];
  missingSignals: string[];
  socialProof: SocialProofAnalysis;
  securityIndicators: SecurityIndicator[];
  credibilityScore: number;
}

export interface TrustSignal {
  type: 'testimonial' | 'review' | 'badge' | 'certification' | 'guarantee' | 'social_count' | 'case_study' | 'client_logo';
  present: boolean;
  location?: string;
  effectiveness: number;
}

export interface SocialProofAnalysis {
  hasTestimonials: boolean;
  testimonialCount: number;
  hasReviews: boolean;
  reviewScore?: number;
  hasClientLogos: boolean;
  hasCaseStudies: boolean;
  hasSocialCounts: boolean;
  recommendations: string[];
}

export interface SecurityIndicator {
  type: 'ssl' | 'payment_badge' | 'privacy_policy' | 'money_back' | 'secure_checkout';
  present: boolean;
  visible: boolean;
}

export interface NavigationAnalysis {
  score: number;
  clarity: 'clear' | 'confusing' | 'overwhelming';
  depth: number;
  mobileOptimized: boolean;
  searchPresent: boolean;
  breadcrumbs: boolean;
  stickyHeader: boolean;
  issues: NavigationIssue[];
}

export interface NavigationIssue {
  type: string;
  description: string;
  recommendation: string;
}

export interface FrictionAnalysis {
  overallFriction: 'low' | 'medium' | 'high';
  frictionPoints: FrictionPoint[];
  conversionKillers: string[];
  dropOffRisks: DropOffRisk[];
}

export interface FrictionPoint {
  type: 'form' | 'navigation' | 'content' | 'technical' | 'trust' | 'price';
  location: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  solution: string;
  expectedImpact: number;
}

export interface DropOffRisk {
  stage: string;
  risk: number;
  causes: string[];
  mitigations: string[];
}

// ============================================================================
// CRO SCORING & RECOMMENDATIONS
// ============================================================================

export interface CroScore {
  overall: number;
  components: {
    ux: number;
    ui: number;
    copy: number;
    cta: number;
    trust: number;
    navigation: number;
    friction: number;
  };
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  benchmarkComparison: 'above' | 'at' | 'below';
}

export interface CroIntelligenceRecommendation {
  id: string;
  priority: number;
  category: CroCategory;
  title: string;
  description: string;
  rationale: string;
  customerPsychology: string;
  nicheContext: string;
  expectedConversionLift: number;
  confidence: number;
  effort: 'low' | 'medium' | 'high';
  implementation: ImplementationGuide;
  beforeAfter?: BeforeAfterExample;
}

export interface ImplementationGuide {
  steps: string[];
  copyChanges?: CopyChange[];
  designChanges?: DesignChange[];
  technicalChanges?: string[];
  estimatedTime: string;
  requiredSkills: string[];
}

export interface CopyChange {
  location: string;
  before: string;
  after: string;
  rationale: string;
}

export interface DesignChange {
  element: string;
  change: string;
  wireframeGuidance: string;
}

export interface BeforeAfterExample {
  description: string;
  beforeState: string;
  afterState: string;
  resultMetric: string;
  sourceIndustry?: string;
}

// ============================================================================
// A/B TESTING HYPOTHESES
// ============================================================================

export interface AbTestHypothesis {
  id: string;
  hypothesis: string;
  metric: string;
  expectedLift: number;
  confidence: number;
  priority: number;
  testType: 'a_b' | 'multivariate' | 'bandit';
  variants: TestVariantDesign[];
  sampleSizeRequired: number;
  estimatedDuration: string;
  rationale: string;
}

export interface TestVariantDesign {
  name: string;
  description: string;
  changes: string[];
  expectedOutcome: string;
}

// ============================================================================
// COMPETITOR BENCHMARKING
// ============================================================================

export interface BenchmarkComparison {
  industryAverage: IndustryBenchmark;
  topPerformers: CompetitorBenchmark[];
  gaps: BenchmarkGap[];
  opportunities: string[];
}

export interface IndustryBenchmark {
  industry: string;
  avgConversionRate: number;
  avgBounceRate: number;
  avgTimeOnPage: number;
  avgPageSpeed: number;
  commonPatterns: string[];
}

export interface CompetitorBenchmark {
  domain: string;
  strengths: string[];
  weaknesses: string[];
  conversionTactics: string[];
  trustStrategies: string[];
  uniqueApproaches: string[];
}

export interface BenchmarkGap {
  area: string;
  yourScore: number;
  industryAverage: number;
  topPerformerScore: number;
  opportunity: string;
  recommendation: string;
}

// ============================================================================
// EXECUTIVE REPORT
// ============================================================================

export interface CroExecutiveReport {
  id: string;
  generatedAt: string;
  website: string;
  executiveSummary: ExecutiveSummary;
  nicheAnalysis: NicheAnalysis;
  audienceInsights: AudienceAnalysis;
  performanceOverview: PerformanceOverview;
  criticalFindings: CriticalFinding[];
  prioritizedRecommendations: CroIntelligenceRecommendation[];
  quickWins: QuickWin[];
  strategicInitiatives: StrategicInitiative[];
  implementationRoadmap: ImplementationRoadmap;
  projectedResults: ProjectedResults;
}

export interface ExecutiveSummary {
  headline: string;
  currentState: string;
  keyOpportunities: string[];
  projectedImpact: string;
  urgentActions: string[];
}

export interface PerformanceOverview {
  currentConversionRate: number;
  industryBenchmark: number;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  trendDirection: 'improving' | 'stable' | 'declining';
  keyMetrics: Record<string, number>;
}

export interface CriticalFinding {
  finding: string;
  impact: 'revenue_loss' | 'user_drop_off' | 'trust_erosion' | 'competitive_disadvantage';
  estimatedLoss: string;
  urgency: 'immediate' | 'this_week' | 'this_month';
  solution: string;
}

export interface QuickWin {
  title: string;
  description: string;
  expectedLift: number;
  implementation: string;
  timeToImplement: string;
}

export interface StrategicInitiative {
  title: string;
  description: string;
  expectedLift: number;
  timeline: string;
  resources: string[];
  dependencies: string[];
}

export interface ImplementationRoadmap {
  phases: RoadmapPhase[];
  totalTimeline: string;
  resourceRequirements: string[];
}

export interface RoadmapPhase {
  phase: number;
  name: string;
  duration: string;
  objectives: string[];
  deliverables: string[];
  expectedResults: string;
}

export interface ProjectedResults {
  conversionRateTarget: number;
  revenueIncrease: string;
  timeline: string;
  assumptions: string[];
  riskFactors: string[];
}
