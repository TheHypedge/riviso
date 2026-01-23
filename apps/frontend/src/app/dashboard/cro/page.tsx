'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Target, TrendingUp, AlertCircle, CheckCircle2, XCircle, 
  TrendingDown, Zap, Clock, DollarSign, Eye, MousePointer,
  ExternalLink, ChevronDown, ChevronUp, Lightbulb, BarChart3
} from 'lucide-react';

interface Insight {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  pageUrl: string;
  description: string;
  currentMetrics: {
    pageViews: number;
    conversionRate: number;
    bounceRate?: number;
    exitRate?: number;
    avgTimeOnPage?: number;
  };
  projectedImpact: {
    conversionIncrease: number;
    additionalConversions: number;
    confidence: number;
    potentialRevenue?: number;
  };
  recommendations: Recommendation[];
  priorityScore: number;
}

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  reasoning: string;
  effort: 'low' | 'medium' | 'high';
  expectedImpact: 'low' | 'medium' | 'high';
  expectedLift: number;
  confidence: number;
  actionItems: Array<{
    task: string;
    priority: string;
    estimatedTime: string;
  }>;
  examples?: Array<{
    before: string;
    after: string;
    result: string;
  }>;
}

// Mock data from CRO Intelligence Engine
const mockInsights: Insight[] = [
  {
    id: '1',
    priority: 'critical',
    title: 'High Traffic, Low Conversion Rate',
    pageUrl: '/products/premium-plan',
    description: 'This page receives 2,400 monthly visits but only converts at 1.8%',
    currentMetrics: {
      pageViews: 2400,
      conversionRate: 1.8,
      bounceRate: 58,
      avgTimeOnPage: 45,
    },
    projectedImpact: {
      conversionIncrease: 65,
      additionalConversions: 28,
      confidence: 82,
      potentialRevenue: 2800,
    },
    priorityScore: 89,
    recommendations: [
      {
        id: 'rec-1',
        category: 'CTA Optimization',
        title: 'Optimize Call-to-Action',
        description: 'Improve CTA visibility, copy, and placement to drive more conversions',
        reasoning: 'With 2,400 monthly visitors, even a small CTA improvement can yield 24 additional conversions per month. Studies show that prominent, benefit-driven CTAs increase conversion by 28-45%.',
        effort: 'low',
        expectedImpact: 'high',
        expectedLift: 35,
        confidence: 82,
        actionItems: [
          { task: 'Move primary CTA above the fold', priority: 'high', estimatedTime: '30 minutes' },
          { task: 'Use action-oriented copy (e.g., "Start Free Trial")', priority: 'high', estimatedTime: '15 minutes' },
          { task: 'Increase button size to minimum 48px height', priority: 'medium', estimatedTime: '15 minutes' },
        ],
        examples: [
          {
            before: 'Generic "Submit" button in footer',
            after: 'Prominent "Get Your Free Analysis" button above fold',
            result: '+42% conversion rate increase',
          },
        ],
      },
      {
        id: 'rec-2',
        category: 'Trust Signals',
        title: 'Add Trust Signals',
        description: 'Include social proof, testimonials, and security badges to build credibility',
        reasoning: 'Your page lacks trust indicators. Research shows pages with social proof elements convert 34% better.',
        effort: 'medium',
        expectedImpact: 'high',
        expectedLift: 28,
        confidence: 78,
        actionItems: [
          { task: 'Add 3-5 customer testimonials with photos', priority: 'high', estimatedTime: '2 hours' },
          { task: 'Display customer count or "Used by X companies"', priority: 'high', estimatedTime: '1 hour' },
          { task: 'Add security badges (SSL, payment providers)', priority: 'medium', estimatedTime: '30 minutes' },
        ],
      },
    ],
  },
  {
    id: '2',
    priority: 'high',
    title: 'High Cart Abandonment Rate',
    pageUrl: '/checkout',
    description: '68% of users abandon cart at checkout page',
    currentMetrics: {
      pageViews: 1200,
      conversionRate: 32,
      exitRate: 68,
      avgTimeOnPage: 120,
    },
    projectedImpact: {
      conversionIncrease: 45,
      additionalConversions: 137,
      confidence: 85,
      potentialRevenue: 13700,
    },
    priorityScore: 85,
    recommendations: [
      {
        id: 'rec-3',
        category: 'Form Optimization',
        title: 'Reduce Form Friction',
        description: 'Simplify the form to reduce abandonment',
        reasoning: '68% drop-off at checkout is significantly above the 40% benchmark. Form optimization can recover 30-40% of these lost conversions.',
        effort: 'medium',
        expectedImpact: 'high',
        expectedLift: 35,
        confidence: 85,
        actionItems: [
          { task: 'Remove non-essential form fields (aim for <5 fields)', priority: 'high', estimatedTime: '1 hour' },
          { task: 'Add progress indicator showing remaining steps', priority: 'high', estimatedTime: '2 hours' },
          { task: 'Implement auto-fill for common fields', priority: 'medium', estimatedTime: '3 hours' },
        ],
      },
    ],
  },
  {
    id: '3',
    priority: 'medium',
    title: 'User Intent Mismatch Detected',
    pageUrl: '/blog/ultimate-guide',
    description: 'Users arriving with informational intent on a content page (72% bounce rate)',
    currentMetrics: {
      pageViews: 3500,
      conversionRate: 1.0,
      bounceRate: 72,
      avgTimeOnPage: 25,
    },
    projectedImpact: {
      conversionIncrease: 32,
      additionalConversions: 11,
      confidence: 70,
      potentialRevenue: 1100,
    },
    priorityScore: 68,
    recommendations: [
      {
        id: 'rec-4',
        category: 'Copy Optimization',
        title: 'Align Page Content with User Intent',
        description: 'Adjust messaging to match what users are looking for when they arrive',
        reasoning: '72% bounce rate indicates users aren\'t finding what they expected. Aligning content with informational intent can reduce bounce by 35%.',
        effort: 'medium',
        expectedImpact: 'medium',
        expectedLift: 25,
        confidence: 70,
        actionItems: [
          { task: 'Audit top landing keywords and ensure page content matches', priority: 'high', estimatedTime: '1 hour' },
          { task: 'Update headline to directly address search intent', priority: 'high', estimatedTime: '30 minutes' },
        ],
      },
    ],
  },
];

export default function CROPage() {
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

  const criticalCount = mockInsights.filter(i => i.priority === 'critical').length;
  const avgConversionRate = 2.5;
  const totalProjectedLift = mockInsights.reduce((sum, i) => sum + i.projectedImpact.conversionIncrease, 0) / mockInsights.length;
  const totalPotentialRevenue = mockInsights.reduce((sum, i) => sum + (i.projectedImpact.potentialRevenue || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">CRO Intelligence</h1>
            <p className="mt-1 text-gray-600">AI-powered conversion rate optimization insights</p>
          </div>
          <button className="btn btn-primary">
            <Target className="w-4 h-4" />
            Analyze New Page
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Total</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{mockInsights.length}</h3>
            <p className="text-sm text-gray-600 mt-1">Active Insights</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <span className="badge badge-danger">{criticalCount}</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{criticalCount}</h3>
            <p className="text-sm text-gray-600 mt-1">Critical Issues</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-sm font-medium text-green-600">+{totalProjectedLift.toFixed(0)}%</div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{avgConversionRate}%</h3>
            <p className="text-sm text-gray-600 mt-1">Avg. Conversion Rate</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Potential</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">${(totalPotentialRevenue / 1000).toFixed(1)}k</h3>
            <p className="text-sm text-gray-600 mt-1">Revenue Opportunity</p>
          </div>
        </div>

        {/* Insights List */}
        <div className="space-y-4">
          {mockInsights.map((insight) => (
            <div key={insight.id} className="card overflow-hidden">
              {/* Insight Header */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <PriorityBadge priority={insight.priority} />
                      <span className="text-xs font-medium text-gray-500">
                        Priority Score: {insight.priorityScore}/100
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                    <a
                      href={insight.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                    >
                      {insight.pageUrl}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <button
                    onClick={() => setExpandedInsight(expandedInsight === insight.id ? null : insight.id)}
                    className="btn btn-ghost btn-sm ml-4"
                  >
                    {expandedInsight === insight.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Current Metrics */}
              <div className="px-6 py-4 bg-gray-50 border-y border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricItem
                    icon={<Eye className="w-4 h-4" />}
                    label="Page Views"
                    value={insight.currentMetrics.pageViews.toLocaleString()}
                  />
                  <MetricItem
                    icon={<MousePointer className="w-4 h-4" />}
                    label="Conversion Rate"
                    value={`${insight.currentMetrics.conversionRate}%`}
                    trend="down"
                  />
                  {insight.currentMetrics.bounceRate && (
                    <MetricItem
                      icon={<TrendingDown className="w-4 h-4" />}
                      label="Bounce Rate"
                      value={`${insight.currentMetrics.bounceRate}%`}
                      trend="up"
                    />
                  )}
                  {insight.currentMetrics.avgTimeOnPage && (
                    <MetricItem
                      icon={<Clock className="w-4 h-4" />}
                      label="Avg. Time"
                      value={`${insight.currentMetrics.avgTimeOnPage}s`}
                    />
                  )}
                </div>
              </div>

              {/* Projected Impact */}
              <div className="px-6 py-4 bg-green-50 border-b border-green-100">
                <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Projected Impact
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-green-700">Conv. Increase</div>
                    <div className="text-lg font-bold text-green-900">+{insight.projectedImpact.conversionIncrease}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-green-700">Add'l Conversions</div>
                    <div className="text-lg font-bold text-green-900">+{insight.projectedImpact.additionalConversions}</div>
                  </div>
                  {insight.projectedImpact.potentialRevenue && (
                    <div>
                      <div className="text-xs text-green-700">Potential Revenue</div>
                      <div className="text-lg font-bold text-green-900">${insight.projectedImpact.potentialRevenue.toLocaleString()}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-green-700">Confidence</div>
                    <div className="text-lg font-bold text-green-900">{insight.projectedImpact.confidence}%</div>
                  </div>
                </div>
              </div>

              {/* Recommendations (Expandable) */}
              {expandedInsight === insight.id && (
                <div className="p-6 space-y-4">
                  <h4 className="text-md font-semibold text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    AI-Generated Recommendations ({insight.recommendations.length})
                  </h4>

                  {insight.recommendations.map((rec) => (
                    <div key={rec.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* Recommendation Header */}
                      <div className="p-4 bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded font-medium">
                                {rec.category}
                              </span>
                              <EffortImpactBadge effort={rec.effort} impact={rec.expectedImpact} />
                            </div>
                            <h5 className="font-semibold text-gray-900">{rec.title}</h5>
                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                          </div>
                          <button
                            onClick={() => setExpandedRec(expandedRec === rec.id ? null : rec.id)}
                            className="btn btn-ghost btn-sm ml-4"
                          >
                            {expandedRec === rec.id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Expected Lift */}
                        <div className="mt-3 flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="font-medium text-green-600">+{rec.expectedLift}% lift</span>
                          </div>
                          <div className="text-gray-500">
                            {rec.confidence}% confident
                          </div>
                        </div>
                      </div>

                      {/* Recommendation Details (Expandable) */}
                      {expandedRec === rec.id && (
                        <div className="p-4 space-y-4 bg-white">
                          {/* AI Reasoning */}
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h6 className="text-sm font-semibold text-blue-900 mb-2">AI Analysis</h6>
                            <p className="text-sm text-blue-800">{rec.reasoning}</p>
                          </div>

                          {/* Action Items */}
                          <div>
                            <h6 className="text-sm font-semibold text-gray-900 mb-2">Action Items</h6>
                            <div className="space-y-2">
                              {rec.actionItems.map((item, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                  <input
                                    type="checkbox"
                                    className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                  />
                                  <div className="flex-1">
                                    <div className="text-sm text-gray-900">{item.task}</div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                      <span className={`px-2 py-0.5 rounded ${
                                        item.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {item.priority} priority
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {item.estimatedTime}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Examples */}
                          {rec.examples && rec.examples.length > 0 && (
                            <div>
                              <h6 className="text-sm font-semibold text-gray-900 mb-2">Real-World Examples</h6>
                              {rec.examples.map((example, idx) => (
                                <div key={idx} className="bg-green-50 p-4 rounded-lg border border-green-100">
                                  <div className="grid md:grid-cols-2 gap-4 mb-2">
                                    <div>
                                      <div className="text-xs font-medium text-green-700 mb-1">Before</div>
                                      <div className="text-sm text-gray-800">{example.before}</div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-medium text-green-700 mb-1">After</div>
                                      <div className="text-sm text-gray-800">{example.after}</div>
                                    </div>
                                  </div>
                                  <div className="text-sm font-semibold text-green-900 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Result: {example.result}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const configs = {
    critical: { bg: 'bg-red-100', text: 'text-red-700', icon: <XCircle className="w-4 h-4" /> },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', icon: <AlertCircle className="w-4 h-4" /> },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <AlertCircle className="w-4 h-4" /> },
    low: { bg: 'bg-blue-100', text: 'text-blue-700', icon: <CheckCircle2 className="w-4 h-4" /> },
  };
  
  const config = configs[priority as keyof typeof configs] || configs.low;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.icon}
      {priority.toUpperCase()}
    </span>
  );
}

function MetricItem({ 
  icon, 
  label, 
  value, 
  trend 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  trend?: 'up' | 'down'; 
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="p-2 bg-white rounded">
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`text-sm font-semibold ${
          trend === 'down' ? 'text-red-600' : 
          trend === 'up' ? 'text-orange-600' : 
          'text-gray-900'
        }`}>
          {value}
        </div>
      </div>
    </div>
  );
}

function EffortImpactBadge({ effort, impact }: { effort: string; impact: string }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className={`px-2 py-0.5 rounded ${
        effort === 'low' ? 'bg-green-100 text-green-700' :
        effort === 'medium' ? 'bg-yellow-100 text-yellow-700' :
        'bg-red-100 text-red-700'
      }`}>
        {effort} effort
      </span>
      <span className="text-gray-400">•</span>
      <span className={`px-2 py-0.5 rounded ${
        impact === 'high' ? 'bg-purple-100 text-purple-700' :
        impact === 'medium' ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-700'
      }`}>
        {impact} impact
      </span>
    </div>
  );
}
