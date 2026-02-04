'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useWebsite } from '@/contexts/WebsiteContext';
import {
  Zap,
  Search,
  Loader2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Users,
  Target,
  Eye,
  Type,
  MousePointerClick,
  Shield,
  Navigation,
  XCircle,
  Building2,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  FlaskConical,
  BarChart3,
  FileText,
  Award,
  Clock,
  Layers,
  Sparkles,
  Globe
} from 'lucide-react';
import api from '@/lib/api';
import type {
  PageCroAnalysis,
  CroExecutiveReport,
  CroIntelligenceRecommendation,
  AbTestHypothesis,
  CroCategory
} from '@riviso/shared-types';

type TabType = 'analysis' | 'recommendations' | 'ab-tests' | 'report';

export default function CroIntelligencePage() {
  const { selectedWebsite } = useWebsite();
  const [customUrl, setCustomUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PageCroAnalysis | null>(null);
  const [report, setReport] = useState<CroExecutiveReport | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('analysis');
  const [expandedRecs, setExpandedRecs] = useState<Set<string>>(new Set());
  const [useCustomUrl, setUseCustomUrl] = useState(false);

  const handleAnalyze = async () => {
    const urlToAnalyze = useCustomUrl ? customUrl : selectedWebsite?.url;

    if (!urlToAnalyze?.trim()) {
      setError(useCustomUrl ? 'Please enter a URL to analyze' : 'Please select a website from the sidebar');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysis(null);
    setReport(null);

    try {
      // Get full analysis - send as websiteId (which accepts URL)
      const analysisResponse = await api.post('/v1/cro/intelligence/analyze', {
        websiteId: urlToAnalyze
      });
      setAnalysis(analysisResponse.data);

      // Get executive report
      const reportResponse = await api.post('/v1/cro/intelligence/report', {
        websiteId: urlToAnalyze
      });
      setReport(reportResponse.data);
    } catch (err: any) {
      console.error('CRO Analysis error:', err);
      setError(err.response?.data?.message || 'Failed to analyze page. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecExpanded = (id: string) => {
    setExpandedRecs(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return 'text-green-600 bg-green-50 border-green-200';
      case 'B': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'D': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'F': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getCategoryIcon = (category: CroCategory) => {
    switch (category) {
      case 'copy_optimization': return <Type className="w-4 h-4" />;
      case 'design_ux': return <Layers className="w-4 h-4" />;
      case 'cta_optimization': return <MousePointerClick className="w-4 h-4" />;
      case 'form_optimization': return <FileText className="w-4 h-4" />;
      case 'trust_signals': return <Shield className="w-4 h-4" />;
      case 'page_speed': return <Zap className="w-4 h-4" />;
      case 'mobile_optimization': return <Eye className="w-4 h-4" />;
      case 'technical': return <BarChart3 className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: CroCategory) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEffortBadge = (effort: string) => {
    switch (effort) {
      case 'low': return <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">Low Effort</span>;
      case 'medium': return <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">Medium Effort</span>;
      case 'high': return <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">High Effort</span>;
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">CRO Intelligence</h1>
              <p className="text-sm text-slate-500">Conversion Rate Optimization Analysis</p>
            </div>
          </div>
          <p className="text-slate-600 mt-2 max-w-2xl">
            Analyze your website for conversion optimization opportunities. Get niche detection, persona analysis,
            UX/UI audits, copy recommendations, and A/B test hypotheses.
          </p>
        </div>

        {/* Website Selection / URL Input */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-slate-700">
              {selectedWebsite ? 'Analyzing Website' : 'Website URL'}
            </label>
            {selectedWebsite && (
              <button
                onClick={() => setUseCustomUrl(!useCustomUrl)}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                {useCustomUrl ? 'Use Selected Website' : 'Analyze Different URL'}
              </button>
            )}
          </div>

          {!selectedWebsite ? (
            <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-100">
              <Globe className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-sm text-slate-600 mb-2">No website selected</p>
              <p className="text-xs text-slate-500">
                Please select a website from the sidebar or enter a custom URL below
              </p>
            </div>
          ) : !useCustomUrl ? (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{selectedWebsite.name}</p>
                    <p className="text-xs text-slate-500">{selectedWebsite.url}</p>
                  </div>
                </div>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : null}

          {(useCustomUrl || !selectedWebsite) && (
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-indigo-200"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Analyze
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}
        </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
              <Zap className="absolute inset-0 m-auto w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">Analyzing Your Page</p>
              <p className="text-sm text-slate-500 mt-1">Detecting niche, analyzing UX, and generating recommendations...</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <>
          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="border-b border-slate-200">
              <nav className="flex -mb-px">
                {[
                  { id: 'analysis', label: 'Analysis', icon: BarChart3 },
                  { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
                  { id: 'ab-tests', label: 'A/B Tests', icon: FlaskConical },
                  { id: 'report', label: 'Executive Report', icon: FileText },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Analysis Tab */}
              {activeTab === 'analysis' && (
                <div className="space-y-8">
                  {/* Overall Score */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 text-center">
                        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full border-4 ${getGradeColor(analysis.overallScore.grade)} text-4xl font-bold mb-4`}>
                          {analysis.overallScore.grade}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Overall CRO Score</h3>
                        <p className="text-3xl font-bold text-indigo-600 mt-2">{analysis.overallScore.overall}/100</p>
                        <p className="text-sm text-slate-500 mt-1 capitalize">
                          {analysis.overallScore.benchmarkComparison} industry average
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Score Breakdown</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(analysis.overallScore.components).map(([key, value]) => (
                          <div key={key} className="bg-slate-50 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-slate-700 capitalize">{key}</span>
                              <span className="text-sm font-bold text-slate-900">{value}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getScoreColor(value)}`}
                                style={{ width: `${value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Niche & Audience */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Niche Detection */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Building2 className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Niche Detection</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Primary Industry</p>
                          <p className="text-lg font-semibold text-slate-900">{analysis.nicheAnalysis.primaryIndustry}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Business Model</p>
                          <p className="text-lg font-semibold text-slate-900 capitalize">
                            {analysis.nicheAnalysis.businessModel.replace(/_/g, ' ')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Confidence</p>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-purple-500"
                                style={{ width: `${analysis.nicheAnalysis.nicheConfidence}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{analysis.nicheAnalysis.nicheConfidence}%</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500 mb-1">Competitive Position</p>
                          <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                            {analysis.nicheAnalysis.competitivePosition.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Primary Persona */}
                    <div className="bg-slate-50 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Primary Audience</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{analysis.audienceAnalysis.primaryPersona.name}</p>
                          <p className="text-sm text-slate-600 mt-1">{analysis.audienceAnalysis.primaryPersona.description}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Key Pain Points</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.audienceAnalysis.primaryPersona.painPoints.slice(0, 3).map((point, idx) => (
                              <span key={idx} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                                {point}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-700 mb-2">Goals</p>
                          <div className="flex flex-wrap gap-2">
                            {analysis.audienceAnalysis.primaryPersona.goals.slice(0, 3).map((goal, idx) => (
                              <span key={idx} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                                {goal}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Analysis Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Eye className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">UX</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{analysis.uxAnalysis.score}%</p>
                      <p className="text-xs text-slate-500 capitalize">{analysis.uxAnalysis.pageFlow} flow</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Type className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Copy</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{analysis.copyAnalysis.score}%</p>
                      <p className="text-xs text-slate-500">Clarity: {analysis.copyAnalysis.clarity}%</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MousePointerClick className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">CTAs</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{analysis.ctaAnalysis.score}%</p>
                      <p className="text-xs text-slate-500">{analysis.ctaAnalysis.ctaCount} found</p>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-700">Trust</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{analysis.trustAnalysis.score}%</p>
                      <p className="text-xs text-slate-500">Credibility: {analysis.trustAnalysis.credibilityScore}%</p>
                    </div>
                  </div>

                  {/* Friction Analysis */}
                  {analysis.frictionAnalysis.frictionPoints.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-red-900">Friction Points</h3>
                          <p className="text-sm text-red-700">
                            Overall friction: <span className="font-semibold capitalize">{analysis.frictionAnalysis.overallFriction}</span>
                          </p>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {analysis.frictionAnalysis.frictionPoints.slice(0, 3).map((point, idx) => (
                          <div key={idx} className="bg-white rounded-xl p-4 border border-red-100">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-slate-900">{point.description}</p>
                                <p className="text-sm text-slate-600 mt-1">{point.solution}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                point.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                point.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {point.severity}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommendations Tab */}
              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">
                      Prioritized Recommendations ({analysis.recommendations.length})
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <TrendingUp className="w-4 h-4" />
                      Sorted by expected impact
                    </div>
                  </div>

                  {analysis.recommendations.map((rec, idx) => (
                    <div key={rec.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleRecExpanded(rec.id)}
                        className="w-full p-4 flex items-start gap-4 text-left hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getCategoryIcon(rec.category)}
                            <span className="text-xs font-medium text-slate-500">{getCategoryLabel(rec.category)}</span>
                          </div>
                          <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">{rec.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            {getEffortBadge(rec.effort)}
                            <span className="text-lg font-bold text-green-600">+{rec.expectedConversionLift}%</span>
                          </div>
                          {expandedRecs.has(rec.id) ? (
                            <ChevronDown className="w-5 h-5 text-slate-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {expandedRecs.has(rec.id) && (
                        <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                            <div>
                              <h5 className="text-sm font-semibold text-slate-700 mb-2">Rationale</h5>
                              <p className="text-sm text-slate-600">{rec.rationale}</p>

                              <h5 className="text-sm font-semibold text-slate-700 mt-4 mb-2">Customer Psychology</h5>
                              <p className="text-sm text-slate-600">{rec.customerPsychology}</p>

                              <h5 className="text-sm font-semibold text-slate-700 mt-4 mb-2">Industry Context</h5>
                              <p className="text-sm text-slate-600">{rec.nicheContext}</p>
                            </div>
                            <div>
                              <h5 className="text-sm font-semibold text-slate-700 mb-2">Implementation Steps</h5>
                              <ol className="space-y-2">
                                {rec.implementation.steps.map((step, stepIdx) => (
                                  <li key={stepIdx} className="flex items-start gap-2 text-sm text-slate-600">
                                    <span className="flex-shrink-0 w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs font-bold">
                                      {stepIdx + 1}
                                    </span>
                                    {step}
                                  </li>
                                ))}
                              </ol>

                              <div className="mt-4 flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-600">{rec.implementation.estimatedTime}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Target className="w-4 h-4 text-slate-400" />
                                  <span className="text-slate-600">{rec.confidence}% confidence</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* A/B Tests Tab */}
              {activeTab === 'ab-tests' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900">A/B Test Hypotheses</h3>
                    <p className="text-sm text-slate-500">Ready-to-run experiments based on analysis</p>
                  </div>

                  {analysis.abTestHypotheses.map((hypothesis) => (
                    <div key={hypothesis.id} className="bg-white border border-slate-200 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <FlaskConical className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <span className="text-xs font-medium text-purple-600 uppercase tracking-wider">
                              Priority {hypothesis.priority} | {hypothesis.testType.replace('_', '/')} Test
                            </span>
                            <h4 className="font-semibold text-slate-900 mt-0.5">{hypothesis.metric}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-600">+{hypothesis.expectedLift}%</p>
                          <p className="text-xs text-slate-500">{hypothesis.confidence}% confidence</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-4 mb-4">
                        <p className="text-sm font-medium text-slate-700 mb-1">Hypothesis</p>
                        <p className="text-slate-600">{hypothesis.hypothesis}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {hypothesis.variants.map((variant, idx) => (
                          <div key={idx} className={`rounded-xl p-4 ${idx === 0 ? 'bg-slate-100' : 'bg-indigo-50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                              {idx === 0 ? (
                                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-xs font-medium rounded-full">Control</span>
                              ) : (
                                <span className="px-2 py-0.5 bg-indigo-200 text-indigo-700 text-xs font-medium rounded-full">Variant</span>
                              )}
                              <span className="font-medium text-slate-900">{variant.name}</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-2">{variant.description}</p>
                            <p className="text-xs text-slate-500">Expected: {variant.expectedOutcome}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span>Sample size: {hypothesis.sampleSizeRequired.toLocaleString()}</span>
                          <span>Duration: {hypothesis.estimatedDuration}</span>
                        </div>
                        <button className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          Create Test
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Executive Report Tab */}
              {activeTab === 'report' && report && (
                <div className="space-y-8">
                  {/* Executive Summary */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Award className="w-5 h-5 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">Executive Summary</h3>
                    </div>
                    <h4 className="text-xl font-bold text-indigo-900 mb-3">{report.executiveSummary.headline}</h4>
                    <p className="text-slate-700 mb-4">{report.executiveSummary.currentState}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Key Opportunities</p>
                        <ul className="space-y-1">
                          {report.executiveSummary.keyOpportunities.map((opp, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700 mb-2">Urgent Actions</p>
                        <ul className="space-y-1">
                          {report.executiveSummary.urgentActions.map((action, idx) => (
                            <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
                              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-4 p-4 bg-white rounded-xl border border-indigo-100">
                      <p className="text-sm font-medium text-slate-700 mb-1">Projected Impact</p>
                      <p className="text-lg font-semibold text-indigo-600">{report.executiveSummary.projectedImpact}</p>
                    </div>
                  </div>

                  {/* Critical Findings */}
                  {report.criticalFindings.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Critical Findings</h3>
                      <div className="space-y-3">
                        {report.criticalFindings.map((finding, idx) => (
                          <div key={idx} className="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-red-900">{finding.finding}</p>
                                <p className="text-sm text-red-700 mt-1">Estimated Loss: {finding.estimatedLoss}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                finding.urgency === 'immediate' ? 'bg-red-200 text-red-800' :
                                finding.urgency === 'this_week' ? 'bg-orange-200 text-orange-800' :
                                'bg-yellow-200 text-yellow-800'
                              }`}>
                                {finding.urgency.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="mt-3 flex items-center gap-2 text-sm">
                              <ArrowRight className="w-4 h-4 text-red-600" />
                              <span className="text-red-700">{finding.solution}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Wins */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Wins</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {report.quickWins.map((win, idx) => (
                        <div key={idx} className="bg-green-50 border border-green-200 rounded-xl p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-green-900">{win.title}</h4>
                            <span className="text-lg font-bold text-green-600">+{win.expectedLift}%</span>
                          </div>
                          <p className="text-sm text-green-700 mb-3">{win.description}</p>
                          <div className="flex items-center gap-4 text-xs text-green-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {win.timeToImplement}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Implementation Roadmap */}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Implementation Roadmap</h3>
                    <div className="relative">
                      {report.implementationRoadmap.phases.map((phase, idx) => (
                        <div key={idx} className="flex gap-4 mb-6 last:mb-0">
                          <div className="flex flex-col items-center">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                              {phase.phase}
                            </div>
                            {idx < report.implementationRoadmap.phases.length - 1 && (
                              <div className="w-0.5 flex-1 bg-indigo-200 mt-2" />
                            )}
                          </div>
                          <div className="flex-1 pb-6">
                            <div className="bg-white border border-slate-200 rounded-xl p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-slate-900">{phase.name}</h4>
                                <span className="text-sm text-slate-500">{phase.duration}</span>
                              </div>
                              <p className="text-sm text-slate-600 mb-3">{phase.objectives[0]}</p>
                              <div className="flex flex-wrap gap-2">
                                {phase.deliverables.slice(0, 3).map((del, delIdx) => (
                                  <span key={delIdx} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                                    {del}
                                  </span>
                                ))}
                              </div>
                              <p className="text-xs text-green-600 mt-3 font-medium">{phase.expectedResults}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-slate-100 rounded-xl p-4 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Total Timeline</span>
                        <span className="text-lg font-bold text-slate-900">{report.implementationRoadmap.totalTimeline}</span>
                      </div>
                    </div>
                  </div>

                  {/* Projected Results */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <h3 className="text-lg font-bold text-green-900 mb-4">Projected Results</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white rounded-xl p-4 text-center">
                        <p className="text-sm text-slate-600 mb-1">Target Conversion Rate</p>
                        <p className="text-2xl font-bold text-green-600">{report.projectedResults.conversionRateTarget.toFixed(1)}%</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <p className="text-sm text-slate-600 mb-1">Revenue Increase</p>
                        <p className="text-2xl font-bold text-green-600">{report.projectedResults.revenueIncrease}</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 text-center">
                        <p className="text-sm text-slate-600 mb-1">Timeline</p>
                        <p className="text-2xl font-bold text-green-600">{report.projectedResults.timeline}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {!loading && !analysis && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Analyze Any Page</h3>
            <p className="text-slate-600 mb-6">
              Enter a URL above to get comprehensive CRO analysis including niche detection,
              persona identification, UX audits, and actionable recommendations.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Niche Detection', 'Persona Analysis', 'UX Audit', 'Copy Analysis', 'A/B Test Ideas'].map((feature) => (
                <span key={feature} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-sm">
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      </div>
    </DashboardLayout>
  );
}
