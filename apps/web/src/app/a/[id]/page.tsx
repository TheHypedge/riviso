'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Loader2, Download, RefreshCw, AlertCircle, Clock, CheckCircle, XCircle, AlertTriangle, Info, ExternalLink, Eye, BarChart3, Target, Zap, TrendingUp, Plus } from 'lucide-react'
import { ScoreGauge } from '@/components/ScoreGauge'
import { RuleTable } from '@/components/RuleTable'
import { TopFixes } from '@/components/TopFixes'
import { Spinner } from '@/components/Spinner'

interface AuditResult {
  id: string
  url: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  created_at: string
  started_at?: string
  completed_at?: string
  options?: {
    include_sitemap?: boolean
    max_sitemap_urls?: number
  }
  scores: {
    overall: number
    on_page: number
    technical: number
    content?: number
  }
  rules: Array<{
    id: string
    name: string
    category: string
    status: 'pass' | 'fail' | 'warning'
    score: number
    message: string
    evidence?: string
    weight?: number
  }>
  top_fixes: Array<{
    rule_id: string
    title: string
    impact: 'high' | 'medium' | 'low'
    description: string
  }>
  metadata?: {
    page_title?: string
    meta_description?: string
    h1_count?: number
    images_without_alt?: number
    internal_links?: number
    external_links?: number
  }
  top_keywords?: Array<{
    rank: number
    keyword: string
    seo_clicks: number
    search_volume?: number
    difficulty?: number
  }>
  error_message?: string
  error_details?: string
}

export default function AuditDetailPage() {
  const params = useParams()
  const auditId = params.id as string
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Helper functions for statistics
  const getRuleStats = () => {
    if (!audit?.rules) return { total: 0, passed: 0, failed: 0, warnings: 0 }
    
    const total = audit.rules.length
    const passed = audit.rules.filter(r => r.status === 'pass').length
    const failed = audit.rules.filter(r => r.status === 'fail').length
    const warnings = audit.rules.filter(r => r.status === 'warning').length
    
    return { total, passed, failed, warnings }
  }

  const getCategoryStats = () => {
    if (!audit?.rules) return {}
    
    const categories = audit.rules.reduce((acc, rule) => {
      if (!acc[rule.category]) {
        acc[rule.category] = { total: 0, passed: 0, failed: 0, score: 0 }
      }
      acc[rule.category].total++
      if (rule.status === 'pass') acc[rule.category].passed++
      if (rule.status === 'fail') acc[rule.category].failed++
      acc[rule.category].score += rule.score
      return acc
    }, {} as Record<string, { total: number; passed: number; failed: number; score: number }>)

    // Calculate average scores
    Object.keys(categories).forEach(category => {
      categories[category].score = Math.round(categories[category].score / categories[category].total)
    })

    return categories
  }

  const getAuditDuration = () => {
    if (!audit?.started_at || !audit?.completed_at) return null
    
    const start = new Date(audit.started_at)
    const end = new Date(audit.completed_at)
    const duration = end.getTime() - start.getTime()
    
    if (duration < 1000) return `${duration}ms`
    return `${Math.round(duration / 1000)}s`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const fetchAudit = async () => {
    try {
      const response = await fetch(`/api/audit/audits/${auditId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch audit')
      }
      const data = await response.json()
      setAudit(data)
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAudit()
    
    // Poll for updates if audit is still running
    const interval = setInterval(() => {
      if (audit?.status === 'pending' || audit?.status === 'running') {
        fetchAudit()
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [auditId, audit?.status])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchAudit()
  }

  const handleExportPDF = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Audit</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={handleRefresh} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!audit) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Audit Not Found</h2>
          <p className="text-gray-600">The requested audit could not be found.</p>
        </div>
      </div>
    )
  }

  const isCompleted = audit.status === 'completed'
  const isRunning = audit.status === 'running' || audit.status === 'pending'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">RIVISO Analytics Report</h1>
              <p className="text-gray-600 mt-1">{audit.url}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn-outline"
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </button>
              {isCompleted && (
                <button onClick={handleExportPDF} className="btn-primary">
                  <Download className="h-4 w-4" />
                  <span className="ml-2">Export PDF</span>
                </button>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isCompleted ? 'bg-success-500' : 
              isRunning ? 'bg-warning-500 animate-pulse' : 
              'bg-error-500'
            }`} />
            <span className="text-sm font-medium text-gray-700 capitalize">
              {audit.status}
            </span>
            {isRunning && (
              <span className="text-sm text-gray-500">
                This may take a few minutes...
              </span>
            )}
          </div>
        </div>

        {isRunning ? (
          <div className="text-center py-12">
            <Spinner size="lg" />
            <h2 className="text-xl font-semibold text-gray-900 mt-4">
              RIVISO is Analyzing Your Website
            </h2>
            <p className="text-gray-600 mt-2">
              We're crawling your site and running comprehensive SEO analytics and checks...
            </p>
          </div>
        ) : isCompleted ? (
          <>
            {/* Audit Summary */}
            <div className="card p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="h-6 w-6 mr-2 text-primary-600" />
                  Audit Summary
                </h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {getAuditDuration()}
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1" />
                    {formatDate(audit.created_at)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{audit.scores.overall}</div>
                  <div className="text-sm text-gray-500">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success-600">{audit.scores.on_page}</div>
                  <div className="text-sm text-gray-500">On-Page SEO</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning-600">{audit.scores.technical}</div>
                  <div className="text-sm text-gray-500">Technical SEO</div>
                </div>
                {audit.scores.content && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-info-600">{audit.scores.content}</div>
                    <div className="text-sm text-gray-500">Content Quality</div>
                  </div>
                )}
              </div>
            </div>

            {/* Rule Statistics */}
            <div className="card p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2 text-primary-600" />
                Rule Statistics
              </h3>
              {(() => {
                const stats = getRuleStats()
                const categoryStats = getCategoryStats()
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Overall Performance</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                          <div className="flex items-center">
                            <CheckCircle className="h-5 w-5 text-success-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Passed</span>
                          </div>
                          <span className="text-lg font-bold text-success-600">{stats.passed}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-error-50 rounded-lg">
                          <div className="flex items-center">
                            <XCircle className="h-5 w-5 text-error-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Failed</span>
                          </div>
                          <span className="text-lg font-bold text-error-600">{stats.failed}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                          <div className="flex items-center">
                            <AlertTriangle className="h-5 w-5 text-warning-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Warnings</span>
                          </div>
                          <span className="text-lg font-bold text-warning-600">{stats.warnings}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <Info className="h-5 w-5 text-gray-600 mr-2" />
                            <span className="text-sm font-medium text-gray-700">Total</span>
                          </div>
                          <span className="text-lg font-bold text-gray-600">{stats.total}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Category Breakdown</h4>
                      <div className="space-y-3">
                        {Object.entries(categoryStats).map(([category, stats]) => (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <div className="text-sm font-medium text-gray-700 capitalize">
                                {category.replace('_', ' ')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {stats.passed}/{stats.total} passed
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-gray-900">{stats.score}</div>
                              <div className="text-xs text-gray-500">avg score</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Scores Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <ScoreGauge
                title="Overall Score"
                score={audit.scores.overall}
                color="primary"
              />
              <ScoreGauge
                title="On-Page SEO"
                score={audit.scores.on_page}
                color="success"
              />
              <ScoreGauge
                title="Technical SEO"
                score={audit.scores.technical}
                color="warning"
              />
            </div>

            {/* Top Fixes */}
            <div className="mb-8">
              <TopFixes fixes={audit.top_fixes} />
            </div>

            {/* Top Keywords */}
            {audit.top_keywords && audit.top_keywords.length > 0 && (
              <div className="card p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary-600" />
                    Top Keywords
                  </h3>
                  <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    VIEW ALL ORGANIC KEYWORDS →
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Organic Keywords</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">SEO Clicks</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Search Volume</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Difficulty</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {audit.top_keywords.slice(0, 10).map((keyword, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                            {keyword.rank}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {keyword.keyword}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {keyword.seo_clicks}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {keyword.search_volume ? keyword.search_volume.toLocaleString() : 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {keyword.difficulty ? `${keyword.difficulty}%` : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <button className="inline-flex items-center px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
                              <Plus className="h-3 w-3 mr-1" />
                              ADD
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {audit.top_keywords.length > 10 && (
                  <div className="mt-4 text-center">
                    <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      VIEW ALL ORGANIC KEYWORDS →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Rules Table */}
            <div className="mb-8">
              <RuleTable rules={audit.rules} />
            </div>

            {/* Detailed Rule Analysis */}
            <div className="card p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="h-5 w-5 mr-2 text-primary-600" />
                Detailed Rule Analysis
              </h3>
              <div className="space-y-4">
                {audit.rules.map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        {rule.status === 'pass' && <CheckCircle className="h-5 w-5 text-success-600 mr-2" />}
                        {rule.status === 'fail' && <XCircle className="h-5 w-5 text-error-600 mr-2" />}
                        {rule.status === 'warning' && <AlertTriangle className="h-5 w-5 text-warning-600 mr-2" />}
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{rule.name}</h4>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span className="capitalize">{rule.category}</span>
                            <span>•</span>
                            <span>Weight: {rule.weight || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          rule.score >= 80 ? 'text-success-600' : 
                          rule.score >= 60 ? 'text-warning-600' : 'text-error-600'
                        }`}>
                          {rule.score}
                        </div>
                        <div className="text-xs text-gray-500">score</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{rule.message}</p>
                    {rule.evidence && (
                      <div className="bg-gray-50 rounded p-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">Evidence:</div>
                        <div className="text-sm text-gray-700 font-mono">{rule.evidence}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Configuration */}
            {audit.options && (
              <div className="card p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Info className="h-5 w-5 mr-2 text-primary-600" />
                  Audit Configuration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Audit Settings</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Include Sitemap</span>
                        <span className={`text-sm font-medium ${
                          audit.options.include_sitemap ? 'text-success-600' : 'text-gray-500'
                        }`}>
                          {audit.options.include_sitemap ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {audit.options.max_sitemap_urls && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Max Sitemap URLs</span>
                          <span className="text-sm font-medium text-gray-900">
                            {audit.options.max_sitemap_urls}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Audit Timeline</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Started</span>
                        <span className="text-sm font-medium text-gray-900">
                          {audit.started_at ? formatDate(audit.started_at) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Completed</span>
                        <span className="text-sm font-medium text-gray-900">
                          {audit.completed_at ? formatDate(audit.completed_at) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Duration</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getAuditDuration() || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Performance Insights */}
            <div className="card p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
                Performance Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {Math.round((getRuleStats().passed / getRuleStats().total) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getRuleStats().passed} of {getRuleStats().total} checks passed
                  </div>
                </div>
                <div className="text-center p-4 bg-warning-50 rounded-lg">
                  <div className="text-2xl font-bold text-warning-600 mb-1">
                    {audit.top_fixes.length}
                  </div>
                  <div className="text-sm text-gray-600">Priority Fixes</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {audit.top_fixes.filter(f => f.impact === 'high').length} high impact
                  </div>
                </div>
                <div className="text-center p-4 bg-success-50 rounded-lg">
                  <div className="text-2xl font-bold text-success-600 mb-1">
                    {audit.scores.overall}
                  </div>
                  <div className="text-sm text-gray-600">Overall Grade</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {audit.scores.overall >= 90 ? 'Excellent' : 
                     audit.scores.overall >= 80 ? 'Good' : 
                     audit.scores.overall >= 70 ? 'Fair' : 'Needs Improvement'}
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Page Analysis
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Page Title</dt>
                  <dd className="text-sm text-gray-900 truncate">
                    {audit.metadata?.page_title || 'Not found'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Meta Description</dt>
                  <dd className="text-sm text-gray-900 truncate">
                    {audit.metadata?.meta_description || 'Not found'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">H1 Tags</dt>
                  <dd className="text-sm text-gray-900">
                    {audit.metadata?.h1_count || 'N/A'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Images without Alt</dt>
                  <dd className="text-sm text-gray-900">
                    {audit.metadata?.images_without_alt || 'N/A'}
                  </dd>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Audit Failed
            </h2>
            <p className="text-gray-600">
              There was an error processing your audit. Please try again.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
