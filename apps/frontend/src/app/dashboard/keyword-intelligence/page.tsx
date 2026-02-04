'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import {
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  FileText,
  Lightbulb,
  BarChart3,
  MessageCircleQuestion,
  Layers,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Zap,
  Brain,
  Map,
  ListOrdered,
  Copy,
  Download,
  ExternalLink,
  Loader2,
  Globe,
  type LucideIcon,
} from 'lucide-react';

// Types
interface IntentClassification {
  stage: string;
  confidence: number;
  signals: string[];
  description: string;
}

interface CustomerContext {
  painPoints: string[];
  expectedOutcomes: string[];
  businessRelevance: string;
  buyerPersona: string;
  journeyStage: string;
}

interface OpportunityMetrics {
  overallScore: number;
  demandStrength: number;
  competitionLevel: number;
  contentGapScore: number;
  conversionPotential: number;
  priorityLevel: string;
  reasoning: string;
}

interface UserQuestion {
  question: string;
  type: string;
  searchVolume?: number;
  intent: string;
  priority: number;
}

interface QuestionCluster {
  type: string;
  questions: UserQuestion[];
  totalVolume: number;
  avgPriority: number;
}

interface KeywordInsight {
  keyword: string;
  intent: IntentClassification;
  customerContext: CustomerContext;
  opportunityScore: OpportunityMetrics;
  relatedQuestions: UserQuestion[];
}

interface ContentBrief {
  id: string;
  targetKeyword: string;
  title: string;
  intent: string;
  wordCountTarget: { min: number; max: number };
  outline: Array<{
    heading: string;
    level: string;
    keyPoints: string[];
    suggestedWordCount: number;
  }>;
  questionsToAnswer: string[];
  keywordsToInclude: string[];
  callToAction: string;
}

interface FAQItem {
  question: string;
  answer: string;
  keywords: string[];
  intent: string;
  priority: number;
}

interface FAQCollection {
  topic: string;
  items: FAQItem[];
  schemaMarkup: string;
}

interface EditorialItem {
  id: string;
  title: string;
  targetKeyword: string;
  contentType: string;
  intent: string;
  priority: number;
  scheduledDate?: string;
  projectedTraffic: number;
}

interface ContentGap {
  topic: string;
  currentCoverage: number;
  competitorCoverage: number;
  opportunity: string;
  suggestedContent: string;
}

interface AnalysisResponse {
  id: string;
  input: string;
  inputType: string;
  analyzedAt: string;
  primaryInsight: KeywordInsight;
  relatedInsights: KeywordInsight[];
  questionClusters: QuestionCluster[];
  contentBrief?: ContentBrief;
  faqCollection?: FAQCollection;
  editorialSuggestions?: EditorialItem[];
  overallOpportunity: OpportunityMetrics;
  competitorGaps: ContentGap[];
}

// Intent color mapping
const intentColors: Record<string, { bg: string; text: string; border: string; icon: LucideIcon }> = {
  informational: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Lightbulb },
  comparative: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: BarChart3 },
  transactional: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', icon: Target },
  problem_solution: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Zap },
  trust_driven: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: Users },
};

const priorityColors: Record<string, { bg: string; text: string }> = {
  critical: { bg: 'bg-red-100', text: 'text-red-700' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  low: { bg: 'bg-slate-100', text: 'text-slate-600' },
};

export default function KeywordIntelligencePage() {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'keyword' | 'topic' | 'url' | 'content'>('keyword');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'questions' | 'content' | 'plan'>('insights');
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data } = await api.post('/v1/keyword-intelligence/analyze', {
        input: input.trim(),
        inputType,
        includeQuestions: true,
        includeTopicMap: true,
        generateBrief: true,
        competitorAnalysis: true,
        depth: 'standard',
      });
      setAnalysis(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to analyze. Please try again.');
      console.error('Analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl">
                <Brain className="w-6 h-6 text-white" />
              </div>
              Keyword Intelligence Platform
            </h1>
            <p className="text-slate-500 mt-1">
              Transform keywords into actionable customer-intent insights
            </p>
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Input Type Selector */}
              <div className="flex gap-2">
                {(['keyword', 'topic', 'url', 'content'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setInputType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      inputType === type
                        ? 'bg-white text-violet-700'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type={inputType === 'url' ? 'url' : 'text'}
                  placeholder={
                    inputType === 'keyword' ? 'Enter a keyword (e.g., "project management")' :
                    inputType === 'topic' ? 'Enter a topic (e.g., "digital marketing")' :
                    inputType === 'url' ? 'Enter a URL to analyze' :
                    'Paste content to extract insights...'
                  }
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              </div>

              {/* Analyze Button */}
              <button
                onClick={handleAnalyze}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-white text-violet-700 rounded-xl font-bold hover:bg-violet-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-100">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {analysis && (
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 border-b border-slate-200 pb-2">
              {[
                { id: 'insights', label: 'Intent Insights', icon: Brain },
                { id: 'questions', label: 'User Questions', icon: MessageCircleQuestion },
                { id: 'content', label: 'Content Tools', icon: FileText },
                { id: 'plan', label: 'Editorial Plan', icon: ListOrdered },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'insights' && (
              <InsightsTab analysis={analysis} />
            )}
            {activeTab === 'questions' && (
              <QuestionsTab clusters={analysis.questionClusters} />
            )}
            {activeTab === 'content' && (
              <ContentToolsTab brief={analysis.contentBrief} faq={analysis.faqCollection} />
            )}
            {activeTab === 'plan' && (
              <EditorialPlanTab items={analysis.editorialSuggestions || []} gaps={analysis.competitorGaps} />
            )}
          </div>
        )}

        {/* Empty State */}
        {!analysis && !loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Brain className="w-10 h-10 text-violet-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Discover Customer Intent</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-2">
              Enter a keyword, topic, URL, or paste content to unlock deep insights about your audience&apos;s search intent, pain points, and content opportunities.
            </p>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { icon: Target, label: 'Intent Classification', desc: 'Understand buyer journey stages' },
                { icon: MessageCircleQuestion, label: 'User Questions', desc: 'Discover what people ask' },
                { icon: FileText, label: 'Content Briefs', desc: 'AI-generated outlines' },
                { icon: Map, label: 'Topic Maps', desc: 'Visualize content clusters' },
              ].map((feature, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left">
                  <feature.icon className="w-6 h-6 text-violet-600 mb-2" />
                  <div className="font-semibold text-slate-900 text-sm">{feature.label}</div>
                  <div className="text-xs text-slate-500">{feature.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

// Insights Tab Component
function InsightsTab({ analysis }: { analysis: AnalysisResponse }) {
  const { primaryInsight, overallOpportunity, relatedInsights, competitorGaps } = analysis;
  const intentConfig = intentColors[primaryInsight.intent.stage] || intentColors.informational;
  const IntentIcon = intentConfig.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Insight Card */}
      <div className="lg:col-span-2 space-y-6">
        {/* Primary Intent Card */}
        <div className={`rounded-2xl border-2 ${intentConfig.border} ${intentConfig.bg} p-6`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${intentConfig.text} bg-white`}>
                <IntentIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-medium text-slate-500 uppercase tracking-wide">Primary Intent</div>
                <div className={`text-2xl font-bold ${intentConfig.text} capitalize`}>
                  {primaryInsight.intent.stage.replace('_', ' ')}
                </div>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${intentConfig.bg} ${intentConfig.text} border ${intentConfig.border}`}>
              {Math.round(primaryInsight.intent.confidence * 100)}% confidence
            </div>
          </div>
          <p className="text-slate-700 mb-4">{primaryInsight.intent.description}</p>
          <div className="flex flex-wrap gap-2">
            {primaryInsight.intent.signals.map((signal, idx) => (
              <span key={idx} className="px-3 py-1 bg-white rounded-lg text-sm text-slate-600 border border-slate-200">
                {signal}
              </span>
            ))}
          </div>
        </div>

        {/* Customer Context */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            Customer Context
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pain Points */}
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Pain Points</div>
              <div className="space-y-2">
                {primaryInsight.customerContext.painPoints.map((pain, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    {pain}
                  </div>
                ))}
              </div>
            </div>
            {/* Expected Outcomes */}
            <div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Expected Outcomes</div>
              <div className="space-y-2">
                {primaryInsight.customerContext.expectedOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    {outcome}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 p-4 bg-violet-50 rounded-xl border border-violet-100">
            <div className="text-sm font-semibold text-violet-700 mb-1">Business Relevance</div>
            <p className="text-sm text-slate-700">{primaryInsight.customerContext.businessRelevance}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500">Buyer Persona</div>
              <div className="font-semibold text-slate-900">{primaryInsight.customerContext.buyerPersona}</div>
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
              <div className="text-xs text-slate-500">Journey Stage</div>
              <div className="font-semibold text-slate-900">{primaryInsight.customerContext.journeyStage}</div>
            </div>
          </div>
        </div>

        {/* Content Gaps */}
        {competitorGaps.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-600" />
              Content Gaps vs Competitors
            </h3>
            <div className="space-y-4">
              {competitorGaps.map((gap, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-slate-900">{gap.topic}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">You: {gap.currentCoverage}%</span>
                      <span className="text-xs text-red-600">Competitors: {Math.round(gap.competitorCoverage)}%</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{gap.opportunity}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span className="text-slate-700">{gap.suggestedContent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Opportunity Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-violet-600" />
            Opportunity Score
          </h3>
          <div className="text-center mb-4">
            <div className="text-5xl font-black text-violet-600">{overallOpportunity.overallScore}</div>
            <div className="text-sm text-slate-500">out of 100</div>
          </div>
          <div className={`text-center mb-6 px-3 py-1 rounded-full text-sm font-bold mx-auto w-fit ${priorityColors[overallOpportunity.priorityLevel]?.bg || 'bg-slate-100'} ${priorityColors[overallOpportunity.priorityLevel]?.text || 'text-slate-600'}`}>
            {overallOpportunity.priorityLevel.toUpperCase()} PRIORITY
          </div>
          <div className="space-y-3">
            {[
              { label: 'Demand Strength', value: overallOpportunity.demandStrength, color: 'bg-blue-500' },
              { label: 'Competition Level', value: 100 - overallOpportunity.competitionLevel, color: 'bg-green-500' },
              { label: 'Content Gap', value: overallOpportunity.contentGapScore, color: 'bg-amber-500' },
              { label: 'Conversion Potential', value: overallOpportunity.conversionPotential, color: 'bg-violet-500' },
            ].map((metric, idx) => (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{metric.label}</span>
                  <span className="font-semibold text-slate-900">{metric.value}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${metric.color} rounded-full`} style={{ width: `${metric.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-600">{overallOpportunity.reasoning}</p>
        </div>

        {/* Related Insights */}
        {relatedInsights.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-600" />
              Related Keywords
            </h3>
            <div className="space-y-3">
              {relatedInsights.map((insight, idx) => {
                const config = intentColors[insight.intent.stage] || intentColors.informational;
                return (
                  <div key={idx} className={`p-3 rounded-xl border ${config.border} ${config.bg}`}>
                    <div className="font-semibold text-slate-900 text-sm">{insight.keyword}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium ${config.text} capitalize`}>
                        {insight.intent.stage.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-500">Score: {insight.opportunityScore.overallScore}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Questions Tab Component
function QuestionsTab({ clusters }: { clusters: QuestionCluster[] }) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(clusters[0]?.type || null);

  const questionTypeLabels: Record<string, { label: string; description: string }> = {
    what: { label: 'What Questions', description: 'Definition and explanation queries' },
    why: { label: 'Why Questions', description: 'Reasoning and motivation queries' },
    how: { label: 'How Questions', description: 'Process and method queries' },
    when: { label: 'When Questions', description: 'Timing and scheduling queries' },
    where: { label: 'Where Questions', description: 'Location and source queries' },
    who: { label: 'Who Questions', description: 'People and authority queries' },
    can: { label: 'Can Questions', description: 'Possibility and capability queries' },
    which: { label: 'Which Questions', description: 'Selection and choice queries' },
    will: { label: 'Will Questions', description: 'Future and prediction queries' },
    is: { label: 'Is/Are Questions', description: 'Validation and confirmation queries' },
    comparison: { label: 'Comparison Questions', description: 'Versus and alternative queries' },
    preposition: { label: 'Preposition Questions', description: 'Context and modifier queries' },
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
          <MessageCircleQuestion className="w-5 h-5 text-violet-600" />
          User Question Clusters
        </h3>
        <p className="text-slate-500 mb-6">
          Real questions people ask, classified by type and intent. Use these to create FAQ content, answer boxes, and comprehensive guides.
        </p>

        {/* Cluster Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {clusters.map((cluster) => {
            const config = questionTypeLabels[cluster.type] || { label: cluster.type, description: '' };
            return (
              <button
                key={cluster.type}
                onClick={() => setExpandedCluster(expandedCluster === cluster.type ? null : cluster.type)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  expandedCluster === cluster.type
                    ? 'border-violet-300 bg-violet-50'
                    : 'border-slate-200 bg-slate-50 hover:border-violet-200'
                }`}
              >
                <div className="text-sm font-bold text-slate-900 capitalize">{cluster.type}</div>
                <div className="text-xs text-slate-500 mt-1">{cluster.questions.length} questions</div>
                <div className="text-xs text-violet-600 mt-1">{cluster.totalVolume.toLocaleString()} vol</div>
              </button>
            );
          })}
        </div>

        {/* Expanded Cluster */}
        {clusters.map((cluster) => {
          if (expandedCluster !== cluster.type) return null;
          const config = questionTypeLabels[cluster.type] || { label: cluster.type, description: '' };

          return (
            <div key={cluster.type} className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
                <h4 className="font-bold text-slate-900">{config.label}</h4>
                <p className="text-sm text-slate-500">{config.description}</p>
              </div>
              <div className="divide-y divide-slate-100">
                {cluster.questions.map((q, idx) => {
                  const intentConfig = intentColors[q.intent] || intentColors.informational;
                  return (
                    <div key={idx} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{q.question}</div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${intentConfig.bg} ${intentConfig.text} capitalize`}>
                              {q.intent.replace('_', ' ')}
                            </span>
                            {q.searchVolume && (
                              <span className="text-xs text-slate-500">
                                {q.searchVolume.toLocaleString()} searches/mo
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <div className="text-xs text-slate-500">Priority</div>
                            <div className="font-bold text-slate-900">{q.priority}</div>
                          </div>
                          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title="Copy question">
                            <Copy className="w-4 h-4 text-slate-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Export Section */}
      <div className="bg-violet-50 rounded-2xl border border-violet-100 p-6 flex items-center justify-between">
        <div>
          <h4 className="font-bold text-violet-900">Export All Questions</h4>
          <p className="text-sm text-violet-700">Download as CSV or JSON for your content team</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white rounded-lg text-violet-700 font-semibold text-sm border border-violet-200 hover:bg-violet-100 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button className="px-4 py-2 bg-white rounded-lg text-violet-700 font-semibold text-sm border border-violet-200 hover:bg-violet-100 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            JSON
          </button>
        </div>
      </div>
    </div>
  );
}

// Content Tools Tab Component
function ContentToolsTab({ brief, faq }: { brief?: ContentBrief; faq?: FAQCollection }) {
  const [showSchema, setShowSchema] = useState(false);
  const [expandedOutline, setExpandedOutline] = useState<number | null>(0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Content Brief */}
      {brief && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Content Brief
            </h3>
            <p className="text-violet-100 text-sm mt-1">{brief.targetKeyword}</p>
          </div>
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Suggested Title</div>
              <div className="text-lg font-bold text-slate-900">{brief.title}</div>
            </div>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">Intent</div>
                <div className="font-semibold text-slate-900 capitalize">{brief.intent.replace('_', ' ')}</div>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="text-xs text-slate-500">Word Count</div>
                <div className="font-semibold text-slate-900">{brief.wordCountTarget.min}-{brief.wordCountTarget.max}</div>
              </div>
            </div>

            {/* Outline */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Content Outline</div>
              <div className="space-y-2">
                {brief.outline.map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedOutline(expandedOutline === idx ? null : idx)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-mono font-bold ${
                          item.level === 'h1' ? 'text-violet-600' :
                          item.level === 'h2' ? 'text-blue-600' : 'text-slate-500'
                        }`}>
                          {item.level.toUpperCase()}
                        </span>
                        <span className="font-medium text-slate-900 text-sm text-left">{item.heading}</span>
                      </div>
                      {expandedOutline === idx ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {expandedOutline === idx && (
                      <div className="px-4 py-3 border-t border-slate-100">
                        <div className="text-xs text-slate-500 mb-2">~{item.suggestedWordCount} words</div>
                        <ul className="space-y-1">
                          {item.keyPoints.map((point, pIdx) => (
                            <li key={pIdx} className="flex items-start gap-2 text-sm text-slate-700">
                              <span className="text-violet-500 mt-1">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Keywords */}
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Keywords to Include</div>
              <div className="flex flex-wrap gap-2">
                {brief.keywordsToInclude.slice(0, 8).map((kw, idx) => (
                  <span key={idx} className="px-2 py-1 bg-violet-50 text-violet-700 text-xs rounded-lg border border-violet-100">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="text-xs font-semibold text-green-700 mb-1">Call to Action</div>
              <p className="text-sm text-slate-700">{brief.callToAction}</p>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Collection */}
      {faq && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageCircleQuestion className="w-5 h-5" />
              FAQ Collection
            </h3>
            <p className="text-amber-100 text-sm mt-1">{faq.items.length} schema-ready FAQs for {faq.topic}</p>
          </div>
          <div className="p-6 space-y-4">
            {faq.items.slice(0, 6).map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold text-xs shrink-0">
                    Q
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{item.question}</div>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2">{item.answer}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.keywords.slice(0, 3).map((kw, kIdx) => (
                        <span key={kIdx} className="px-2 py-0.5 bg-white text-slate-500 text-xs rounded border border-slate-200">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Schema Toggle */}
            <button
              onClick={() => setShowSchema(!showSchema)}
              className="w-full px-4 py-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-colors flex items-center justify-center gap-2"
            >
              {showSchema ? 'Hide' : 'Show'} Schema Markup
              {showSchema ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            {showSchema && (
              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-lg text-xs overflow-x-auto max-h-64">
                  {faq.schemaMarkup}
                </pre>
                <button className="absolute top-2 right-2 p-2 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                  <Copy className="w-4 h-4 text-slate-300" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Editorial Plan Tab Component
function EditorialPlanTab({ items, gaps }: { items: EditorialItem[]; gaps: ContentGap[] }) {
  const contentTypeColors: Record<string, { bg: string; text: string }> = {
    blog: { bg: 'bg-blue-100', text: 'text-blue-700' },
    guide: { bg: 'bg-green-100', text: 'text-green-700' },
    comparison: { bg: 'bg-purple-100', text: 'text-purple-700' },
    tutorial: { bg: 'bg-amber-100', text: 'text-amber-700' },
    faq: { bg: 'bg-rose-100', text: 'text-rose-700' },
    case_study: { bg: 'bg-cyan-100', text: 'text-cyan-700' },
  };

  const totalTraffic = items.reduce((sum, item) => sum + item.projectedTraffic, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-slate-900">{items.length}</div>
          <div className="text-sm text-slate-500">Content Pieces</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-green-600">{totalTraffic.toLocaleString()}</div>
          <div className="text-sm text-slate-500">Projected Monthly Traffic</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-violet-600">{gaps.length}</div>
          <div className="text-sm text-slate-500">Content Gaps</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-2xl font-bold text-amber-600">
            {new Set(items.map(i => i.intent)).size}
          </div>
          <div className="text-sm text-slate-500">Intent Stages Covered</div>
        </div>
      </div>

      {/* Content Calendar */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-violet-600" />
            Editorial Calendar
          </h3>
          <button className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Plan
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {items.map((item, idx) => {
            const typeConfig = contentTypeColors[item.contentType] || { bg: 'bg-slate-100', text: 'text-slate-600' };
            const intentConfig = intentColors[item.intent] || intentColors.informational;

            return (
              <div key={item.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-700 font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{item.title}</div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeConfig.bg} ${typeConfig.text}`}>
                          {item.contentType.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${intentConfig.bg} ${intentConfig.text} capitalize`}>
                          {item.intent.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          Target: {item.targetKeyword}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {item.scheduledDate && (
                      <div className="text-sm font-medium text-slate-900">{item.scheduledDate}</div>
                    )}
                    <div className="text-xs text-green-600">+{item.projectedTraffic.toLocaleString()} visits/mo</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gap Opportunities */}
      {gaps.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-600" />
              Content Gap Opportunities
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Topics where competitors have content but you don&apos;t
            </p>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {gaps.map((gap, idx) => (
              <div key={idx} className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-100">
                <div className="flex items-start justify-between mb-3">
                  <div className="font-semibold text-slate-900">{gap.topic}</div>
                  <div className="text-xs text-red-600 font-medium">
                    {Math.round(gap.competitorCoverage - gap.currentCoverage)}% gap
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">{gap.opportunity}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-slate-700">{gap.suggestedContent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
