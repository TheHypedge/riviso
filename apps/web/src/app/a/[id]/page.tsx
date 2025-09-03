'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Loader2, 
  Download, 
  RefreshCw, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  ExternalLink, 
  Eye, 
  BarChart3, 
  Target, 
  Zap, 
  TrendingUp, 
  Plus,
  ArrowLeft,
  Star,
  Globe,
  Shield,
  Award,
  Calendar,
  Timer,
  Users,
  FileText,
  Settings,
  Smartphone,
  Monitor
} from 'lucide-react'
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
  top_keywords?: Array<{
    keyword: string
    volume: number
    difficulty: string
  }>
  on_page_keywords?: Array<{
    keyword: string
    frequency: number
    density: number
    position: string
  }>
  technical_audit?: {
    device_previews: {
      desktop: {
        responsive_score: number
        viewport_width: string
        viewport_height: string
        lcp: number
        fcp: number
        cls: number
        fid: number
        tti: number
        speed_index: number
      }
      tablet: {
        responsive_score: number
        viewport_width: string
        viewport_height: string
        lcp: number
        fcp: number
        cls: number
        fid: number
        tti: number
        speed_index: number
      }
      mobile: {
        responsive_score: number
        viewport_width: string
        viewport_height: string
        lcp: number
        fcp: number
        cls: number
        fid: number
        tti: number
        speed_index: number
      }
    }
    core_web_vitals: {
      lcp_score: number
      fcp_score: number
      cls_score: number
      fid_score: number
      tti_score: number
    }
    performance_metrics: {
      total_page_size: number
      total_requests: number
      image_optimization: number
      css_optimization: number
      js_optimization: number
      caching_score: number
      compression_score: number
      cdn_usage: boolean
    }
    accessibility_score: number
    seo_technical_score: number
    security_score: number
  }
  real_data?: boolean
  data_source?: string
  metadata?: {
    page_title?: string
    meta_description?: string
    h1_count?: number
    images_without_alt?: number
    internal_links?: number
    external_links?: number
    word_count?: number
    loading_time?: number
  }
}

export default function AuditDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [audit, setAudit] = useState<AuditResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [activeDevice, setActiveDevice] = useState<'mobile' | 'desktop'>('mobile')

  const auditId = params.id as string

  const fetchAudit = async () => {
    try {
      setRefreshing(true)
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
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (auditId) {
        fetchAudit()
      }
  }, [auditId])

  const handleRefresh = () => {
    fetchAudit()
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting PDF...')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100'
      case 'running': return 'text-warning-600 bg-warning-100'
      case 'failed': return 'text-error-600 bg-error-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'running': return <Loader2 className="h-4 w-4 animate-spin" />
      case 'failed': return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    })
  }

  const getAnalysisTime = () => {
    if (audit?.completed_at && audit?.started_at) {
      const startTime = new Date(audit.started_at).getTime()
      const endTime = new Date(audit.completed_at).getTime()
      const duration = endTime - startTime
      
      if (duration < 1000) {
        return `${duration}ms`
      } else if (duration < 60000) {
        return `${Math.round(duration / 1000)}s`
      } else {
        const minutes = Math.floor(duration / 60000)
        const seconds = Math.round((duration % 60000) / 1000)
        return `${minutes}m ${seconds}s`
      }
    }
    return 'N/A'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <a href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">RIVISO</a>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="/features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                  <a href="/services" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Services</a>
                  <a href="/pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                  <a href="/" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
                    Start Free Audit
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-600">Loading audit results...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !audit) {
    return (
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <a href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">RIVISO</a>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  <a href="/features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                  <a href="/services" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Services</a>
                  <a href="/pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                  <a href="/" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
                    Start Free Audit
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Audit Not Found</h2>
            <p className="text-gray-600 mb-4">{error || 'The requested audit could not be found.'}</p>
            <button
              onClick={() => router.push('/')}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Start New Audit
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <a href="/" className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition-colors">RIVISO</a>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="/features" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="/services" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Services</a>
                <a href="/pricing" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Pricing</a>
                <a href="/" className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700">
                  Start Free Audit
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center mb-6 space-y-4 lg:space-y-0">
            <button
              onClick={() => router.push('/')}
              className="flex items-center text-primary-600 hover:text-primary-700 transition-colors self-start"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Home
            </button>
            <div className="flex-1">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">RIVISO Analytics Report</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-base md:text-lg font-medium text-gray-700 break-all">{audit.url}</span>
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(audit.status)} self-start`}>
                      {getStatusIcon(audit.status)}
                      <span className="ml-2 capitalize">{audit.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-primary-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Audit Date</p>
                  <p className="text-lg font-semibold text-gray-900">{formatDate(audit.created_at)}</p>
                </div>
          </div>
        </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center">
                <Timer className="h-8 w-8 text-success-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Analysis Time</p>
                  <p className="text-lg font-semibold text-gray-900">{getAnalysisTime()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center">
                <FileText className="h-8 w-8 text-warning-600 mr-3" />
                    <div>
                  <p className="text-sm text-gray-600">Rules Checked</p>
                  <p className="text-lg font-semibold text-gray-900">{audit.rules.length}</p>
                  </div>
                      </div>
                    </div>
                    
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center">
                <Shield className="h-8 w-8 text-info-600 mr-3" />
                    <div>
                  <p className="text-sm text-gray-600">Security Score</p>
                  <p className="text-lg font-semibold text-gray-900">{audit.scores.technical}</p>
                  </div>
                </div>
              </div>
                    </div>
                  </div>
      </section>

      {/* Main Content */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 md:space-y-12">


          {/* Score Overview */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Audit Summary</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                                <div className="mb-4">
              <ScoreGauge
                title="Overall Score"
                score={audit.scores.overall}
                color="primary"
              />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Overall Performance</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {audit.scores.overall >= 80 ? 'Excellent' : 
                   audit.scores.overall >= 60 ? 'Good' : 
                   audit.scores.overall >= 40 ? 'Fair' : 'Needs Improvement'}
                </p>
                </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                                <div className="mb-4">
              <ScoreGauge
                title="On-Page SEO"
                score={audit.scores.on_page}
                color="success"
              />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">On-Page SEO</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {audit.scores.on_page >= 80 ? 'Excellent' : 
                   audit.scores.on_page >= 60 ? 'Good' : 
                   audit.scores.on_page >= 40 ? 'Fair' : 'Needs Improvement'}
                </p>
                  </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                <div className="mb-4">
              <ScoreGauge
                title="Technical SEO"
                score={audit.scores.technical}
                color="warning"
              />
              </div>
                <h3 className="text-lg font-semibold text-gray-900">Technical SEO</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {audit.scores.technical >= 80 ? 'Excellent' : 
                   audit.scores.technical >= 60 ? 'Good' : 
                   audit.scores.technical >= 40 ? 'Fair' : 'Needs Improvement'}
                </p>
            </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
                                <div className="mb-4">
                  <ScoreGauge
                    title="Content Quality"
                    score={audit.scores.content || 0}
                    color="error"
                  />
                          </div>
                <h3 className="text-lg font-semibold text-gray-900">Content Quality</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {(audit.scores.content || 0) >= 80 ? 'Excellent' : 
                   (audit.scores.content || 0) >= 60 ? 'Good' : 
                   (audit.scores.content || 0) >= 40 ? 'Fair' : 'Needs Improvement'}
                </p>
                        </div>
                          </div>
                        </div>

          {/* Performance Analysis Section */}
          {audit.technical_audit && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 space-y-2 sm:space-y-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">Performance Analysis</h2>
                {audit.real_data && audit.data_source && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Real Data
                    </div>
                    <div className="text-sm text-gray-500">
                      Source: {audit.data_source}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Device View Selector */}
              <div className="mb-6 md:mb-8">
                <div className="flex items-center justify-center mb-4 md:mb-6">
                  <div className="bg-gray-100 rounded-lg p-1 flex w-full max-w-xs">
                    <button
                      onClick={() => setActiveDevice('mobile')}
                      className={`flex items-center justify-center flex-1 px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeDevice === 'mobile'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Smartphone className="h-4 w-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Mobile</span>
                      <span className="sm:hidden">M</span>
                    </button>
                    <button
                      onClick={() => setActiveDevice('desktop')}
                      className={`flex items-center justify-center flex-1 px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeDevice === 'desktop'
                          ? 'bg-white text-primary-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Monitor className="h-4 w-4 mr-1 md:mr-2" />
                      <span className="hidden sm:inline">Desktop</span>
                      <span className="sm:hidden">D</span>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Core Web Vitals */}
              <div className="mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Core Web Vitals</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                  {/* LCP */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray="219.8"
                          strokeDashoffset={219.8 - (audit.technical_audit.core_web_vitals.lcp_score * 2.198)}
                          className={`${audit.technical_audit.core_web_vitals.lcp_score >= 90 ? 'text-success-500' : audit.technical_audit.core_web_vitals.lcp_score >= 50 ? 'text-warning-500' : 'text-error-500'}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{audit.technical_audit.core_web_vitals.lcp_score}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">LCP</div>
                    <div className="text-xs text-gray-500 mb-2">Largest Contentful Paint</div>
                    <div className="text-lg font-bold text-gray-900">
                      {audit.technical_audit.device_previews[activeDevice].lcp}s
                    </div>
                    <div className={`text-xs font-medium ${
                      audit.technical_audit.core_web_vitals.lcp_score >= 90 ? 'text-success-600' : 
                      audit.technical_audit.core_web_vitals.lcp_score >= 50 ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {audit.technical_audit.core_web_vitals.lcp_score >= 90 ? 'Good' : 
                       audit.technical_audit.core_web_vitals.lcp_score >= 50 ? 'Needs Improvement' : 'Poor'}
                      </div>
                    </div>
                    
                  {/* FCP */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray="219.8"
                          strokeDashoffset={219.8 - (audit.technical_audit.core_web_vitals.fcp_score * 2.198)}
                          className={`${audit.technical_audit.core_web_vitals.fcp_score >= 90 ? 'text-success-500' : audit.technical_audit.core_web_vitals.fcp_score >= 50 ? 'text-warning-500' : 'text-error-500'}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{audit.technical_audit.core_web_vitals.fcp_score}</span>
                              </div>
                              </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">FCP</div>
                    <div className="text-xs text-gray-500 mb-2">First Contentful Paint</div>
                    <div className="text-lg font-bold text-gray-900">
                      {audit.technical_audit.device_previews[activeDevice].fcp}s
                    </div>
                    <div className={`text-xs font-medium ${
                      audit.technical_audit.core_web_vitals.fcp_score >= 90 ? 'text-success-600' : 
                      audit.technical_audit.core_web_vitals.fcp_score >= 50 ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {audit.technical_audit.core_web_vitals.fcp_score >= 90 ? 'Good' : 
                       audit.technical_audit.core_web_vitals.fcp_score >= 50 ? 'Needs Improvement' : 'Poor'}
                            </div>
                          </div>

                  {/* CLS */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray="219.8"
                          strokeDashoffset={219.8 - (audit.technical_audit.core_web_vitals.cls_score * 2.198)}
                          className={`${audit.technical_audit.core_web_vitals.cls_score >= 90 ? 'text-success-500' : audit.technical_audit.core_web_vitals.cls_score >= 50 ? 'text-warning-500' : 'text-error-500'}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{audit.technical_audit.core_web_vitals.cls_score}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">CLS</div>
                    <div className="text-xs text-gray-500 mb-2">Cumulative Layout Shift</div>
                    <div className="text-lg font-bold text-gray-900">
                      {audit.technical_audit.device_previews[activeDevice].cls}
                    </div>
                    <div className={`text-xs font-medium ${
                      audit.technical_audit.core_web_vitals.cls_score >= 90 ? 'text-success-600' : 
                      audit.technical_audit.core_web_vitals.cls_score >= 50 ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {audit.technical_audit.core_web_vitals.cls_score >= 90 ? 'Good' : 
                       audit.technical_audit.core_web_vitals.cls_score >= 50 ? 'Needs Improvement' : 'Poor'}
                    </div>
            </div>

                  {/* FID */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray="219.8"
                          strokeDashoffset={219.8 - (audit.technical_audit.core_web_vitals.fid_score * 2.198)}
                          className={`${audit.technical_audit.core_web_vitals.fid_score >= 90 ? 'text-success-500' : audit.technical_audit.core_web_vitals.fid_score >= 50 ? 'text-warning-500' : 'text-error-500'}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{audit.technical_audit.core_web_vitals.fid_score}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">FID</div>
                    <div className="text-xs text-gray-500 mb-2">First Input Delay</div>
                    <div className="text-lg font-bold text-gray-900">
                      {audit.technical_audit.device_previews[activeDevice].fid}ms
                    </div>
                    <div className={`text-xs font-medium ${
                      audit.technical_audit.core_web_vitals.fid_score >= 90 ? 'text-success-600' : 
                      audit.technical_audit.core_web_vitals.fid_score >= 50 ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {audit.technical_audit.core_web_vitals.fid_score >= 90 ? 'Good' : 
                       audit.technical_audit.core_web_vitals.fid_score >= 50 ? 'Needs Improvement' : 'Poor'}
                    </div>
                  </div>

                  {/* TTI */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          className="text-gray-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="35"
                          stroke="currentColor"
                          strokeWidth="6"
                          fill="none"
                          strokeDasharray="219.8"
                          strokeDashoffset={219.8 - (audit.technical_audit.core_web_vitals.tti_score * 2.198)}
                          className={`${audit.technical_audit.core_web_vitals.tti_score >= 90 ? 'text-success-500' : audit.technical_audit.core_web_vitals.tti_score >= 50 ? 'text-warning-500' : 'text-error-500'}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-900">{audit.technical_audit.core_web_vitals.tti_score}</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-700 mb-1">TTI</div>
                    <div className="text-xs text-gray-500 mb-2">Time to Interactive</div>
                    <div className="text-lg font-bold text-gray-900">
                      {audit.technical_audit.device_previews[activeDevice].tti}s
                    </div>
                    <div className={`text-xs font-medium ${
                      audit.technical_audit.core_web_vitals.tti_score >= 90 ? 'text-success-600' : 
                      audit.technical_audit.core_web_vitals.tti_score >= 50 ? 'text-warning-600' : 'text-error-600'
                    }`}>
                      {audit.technical_audit.core_web_vitals.tti_score >= 90 ? 'Good' : 
                       audit.technical_audit.core_web_vitals.tti_score >= 50 ? 'Needs Improvement' : 'Poor'}
                    </div>
                  </div>
                </div>
            </div>

              {/* Performance Metrics */}
            <div className="mb-6 md:mb-8">
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Performance Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-6 w-6 text-primary-600" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{audit.technical_audit.performance_metrics.total_page_size} KB</span>
                    </div>
                    <div className="text-sm font-medium text-gray-700">Total Page Size</div>
                    <div className="text-xs text-gray-500 mt-1">All resources combined</div>
            </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
                        <Zap className="h-6 w-6 text-success-600" />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{audit.technical_audit.performance_metrics.total_requests}</span>
                    </div>
                    <div className="text-sm font-medium text-gray-700">Total Requests</div>
                    <div className="text-xs text-gray-500 mt-1">HTTP requests made</div>
            </div>

                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-warning-100 rounded-lg flex items-center justify-center">
                        <Settings className="h-6 w-6 text-warning-600" />
                          </div>
                      <span className="text-2xl font-bold text-gray-900">{audit.technical_audit.performance_metrics.image_optimization}%</span>
                        </div>
                    <div className="text-sm font-medium text-gray-700">Image Optimization</div>
                    <div className="text-xs text-gray-500 mt-1">Compression & format</div>
                      </div>
                  
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-info-100 rounded-lg flex items-center justify-center">
                        <Shield className="h-6 w-6 text-info-600" />
                        </div>
                      <span className="text-2xl font-bold text-gray-900">{audit.technical_audit.performance_metrics.caching_score}%</span>
                      </div>
                    <div className="text-sm font-medium text-gray-700">Caching Score</div>
                    <div className="text-xs text-gray-500 mt-1">Browser caching</div>
                    </div>
                </div>
              </div>

              {/* Additional Scores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                  <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-success-600">{audit.technical_audit.accessibility_score}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">Accessibility Score</div>
                  <div className="text-sm text-gray-600">WCAG compliance</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary-600">{audit.technical_audit.seo_technical_score}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">SEO Technical Score</div>
                  <div className="text-sm text-gray-600">Technical SEO factors</div>
                </div>
                
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 text-center">
                  <div className="w-16 h-16 bg-info-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-info-600">{audit.technical_audit.security_score}</span>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 mb-1">Security Score</div>
                  <div className="text-sm text-gray-600">HTTPS & security headers</div>
                </div>
              </div>
                      </div>
                    )}

          {/* Rule Statistics */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Rule Statistics</h2>
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-lg border border-gray-100">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-4 md:mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-full mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-success-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {audit.rules.filter(rule => rule.status === 'pass').length}
              </div>
                  <div className="text-sm text-gray-600">Passed</div>
            </div>

                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-error-100 rounded-full mx-auto mb-3">
                    <XCircle className="h-6 w-6 text-error-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {audit.rules.filter(rule => rule.status === 'fail').length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-full mx-auto mb-3">
                    <AlertTriangle className="h-6 w-6 text-warning-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {audit.rules.filter(rule => rule.status === 'warning').length}
                  </div>
                  <div className="text-sm text-gray-600">Warnings</div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-info-100 rounded-full mx-auto mb-3">
                    <Info className="h-6 w-6 text-info-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{audit.rules.length}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4 md:pt-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Category Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {['on_page', 'technical', 'content'].map(category => {
                    const categoryRules = audit.rules.filter(rule => rule.category === category)
                    const passedCount = categoryRules.filter(rule => rule.status === 'pass').length
                    const avgScore = categoryRules.length > 0 
                      ? Math.round(categoryRules.reduce((sum, rule) => sum + rule.score, 0) / categoryRules.length)
                      : 0
                    
                    return (
                      <div key={category} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 capitalize">{category.replace('_', ' ')}</h4>
                          <span className="text-sm text-gray-600">{passedCount}/{categoryRules.length} passed</span>
                        </div>
                        <div className="text-2xl font-bold text-primary-600">{avgScore}</div>
                        <div className="text-sm text-gray-600">avg score</div>
                      </div>
                    )
                  })}
                  </div>
                </div>
              </div>
            </div>

          {/* Top Fixes */}
          {audit.top_fixes && audit.top_fixes.length > 0 && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Top Fixes</h2>
              <TopFixes fixes={audit.top_fixes} />
                </div>
          )}

                    {/* Top Keywords */}
          {audit.top_keywords && audit.top_keywords.length > 0 && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Top Targeting Keywords</h2>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden relative">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Keyword Opportunities</h3>
                  <p className="text-sm text-gray-600">High-value keywords for your domain</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Search Volume</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opportunity</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {audit.top_keywords.map((keyword, index) => (
                        <tr key={index} className={`hover:bg-gray-50 ${index >= 3 ? 'blur-sm' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Target className="h-4 w-4 text-primary-600 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{keyword.keyword}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{keyword.volume.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              keyword.difficulty === 'low' ? 'bg-success-100 text-success-800' :
                              keyword.difficulty === 'medium' ? 'bg-warning-100 text-warning-800' :
                              'bg-error-100 text-error-800'
                            }`}>
                              {keyword.difficulty}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                              keyword.difficulty === 'low' ? 'text-success-600' :
                              keyword.difficulty === 'medium' ? 'text-warning-600' :
                              'text-error-600'
                        }`}>
                              {keyword.difficulty === 'low' ? 'High' :
                               keyword.difficulty === 'medium' ? 'Medium' : 'Low'}
                        </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                      </div>
                
                {/* Pro Overlay for blurred results */}
                {audit.top_keywords.length > 3 && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-white/95 flex items-center justify-center">
                    <div className="text-center bg-white rounded-xl shadow-2xl p-8 border border-gray-200 max-w-md mx-4">
                      <div className="mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">View Full Insights with PRO</h3>
                        <p className="text-gray-600 mb-6">
                          Unlock all {audit.top_keywords.length} keyword opportunities with detailed analytics, 
                          competitor insights, and advanced SEO recommendations.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <button className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-700 hover:to-secondary-600 transition-all duration-200 transform hover:scale-105">
                          Get PRO Access
                        </button>
                        <p className="text-xs text-gray-500">
                          Starting from ₹799/month • Cancel anytime
                        </p>
                      </div>
                    </div>
                        </div>
                      )}
                    </div>
                  </div>
          )}

          {/* On-Page Keywords Analysis */}
          {audit.on_page_keywords && audit.on_page_keywords.length > 0 && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">On-Page Keywords Analysis</h2>
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Keywords Found on Page</h3>
                  <p className="text-sm text-gray-600">Keywords extracted from {audit.url} ordered by frequency (most to least used)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Density (%)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Positions Found</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {audit.on_page_keywords.map((keyword, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                index === 1 ? 'bg-gray-100 text-gray-800' :
                                index === 2 ? 'bg-orange-100 text-orange-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {index + 1}
                        </span>
                      </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Target className="h-4 w-4 text-primary-600 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{keyword.keyword}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-bold text-gray-900">{keyword.frequency}</span>
                              <span className="ml-1 text-xs text-gray-500">times</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${
                                keyword.density >= 3.0 ? 'text-error-600' :
                                keyword.density >= 2.0 ? 'text-warning-600' :
                                keyword.density >= 1.0 ? 'text-success-600' :
                                'text-gray-600'
                              }`}>
                                {keyword.density}%
                              </span>
                              <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                keyword.density >= 3.0 ? 'bg-error-100 text-error-800' :
                                keyword.density >= 2.0 ? 'bg-warning-100 text-warning-800' :
                                keyword.density >= 1.0 ? 'bg-success-100 text-success-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {keyword.density >= 3.0 ? 'High' :
                                 keyword.density >= 2.0 ? 'Medium' :
                                 keyword.density >= 1.0 ? 'Good' : 'Low'}
                        </span>
                      </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {keyword.position.split(', ').map((pos, posIndex) => (
                                <span key={posIndex} className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                  {pos}
                        </span>
                              ))}
                      </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>
                
                {/* Analysis Summary */}
                <div className="px-4 md:px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{audit.on_page_keywords.length}</div>
                      <div className="text-sm text-gray-600">Total Keywords</div>
                  </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {audit.on_page_keywords.reduce((sum, kw) => sum + kw.frequency, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Occurrences</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(audit.on_page_keywords.reduce((sum, kw) => sum + kw.density, 0) / audit.on_page_keywords.length * 10) / 10}%
                      </div>
                      <div className="text-sm text-gray-600">Avg Density</div>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            )}






          {/* Detailed Rules */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-6">Detailed Analysis</h2>
            <RuleTable rules={audit.rules} />
      </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-2xl font-bold mb-4">RIVISO</h3>
              <p className="text-gray-400 mb-6 max-w-md">
                India's leading all-in-one SEO platform. Transform your website's search performance 
                with comprehensive analytics and actionable insights.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/services" className="hover:text-white transition-colors">Website Audit</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">Competitor Analysis</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">Keyword Research</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">On-Page SEO</a></li>
                <li><a href="/services" className="hover:text-white transition-colors">DA/PA Analysis</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="/pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-conditions" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/refund-cancellation" className="hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RIVISO. All rights reserved. Made with ❤️ in India.</p>
          </div>
      </div>
      </footer>
    </div>
  )
}