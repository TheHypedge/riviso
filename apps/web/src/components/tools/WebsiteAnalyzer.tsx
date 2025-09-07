'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink, 
  Globe, 
  Clock, 
  Shield, 
  Smartphone, 
  Monitor, 
  Eye,
  Zap,
  TrendingUp,
  Target,
  Award,
  AlertTriangle,
  Info,
  ArrowRight,
  Download,
  RefreshCw
} from 'lucide-react'
import { useGlobalSearch } from '@/contexts/GlobalSearchContext'
import { useAuth } from '@/contexts/AuthContext'
import GlobalSearchInput from '../GlobalSearchInput'

// Circular Progress Component
const CircularProgress = ({ score, size = 120, strokeWidth = 8, label }: { 
  score: number, 
  size?: number, 
  strokeWidth?: number, 
  label: string 
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10B981' // green
    if (score >= 50) return '#F59E0B' // yellow
    return '#EF4444' // red
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getScoreColor(score)}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-in-out"
          />
        </svg>
        {/* Score text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">{score}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600 mt-2">{label}</span>
    </div>
  )
}

interface PageSpeedData {
  status: 'success' | 'error'
  url: string
  performance_score: number
  accessibility_score: number
  best_practices_score: number
  seo_score: number
  first_contentful_paint: number
  largest_contentful_paint: number
  cumulative_layout_shift: number
  first_input_delay: number
  time_to_interactive: number
  total_blocking_time: number
  speed_index: number
  first_meaningful_paint: number
  lcp_score: number
  fcp_score: number
  cls_score: number
  fid_score: number
  display_values: {
    first_contentful_paint: string
    largest_contentful_paint: string
    cumulative_layout_shift: string
    first_input_delay: string
    total_blocking_time: string
    speed_index: string
    time_to_interactive: string
    first_meaningful_paint: string
  }
  resource_metrics: {
    total_byte_weight: number
    unused_css_rules: number
    unused_javascript: number
    render_blocking_resources: number
    efficient_animated_content: number
  }
  opportunities: Array<{
    id: string
    title: string
    description: string
    score: number
    numericValue: number
    displayValue: string
    wastedMs: number
  }>
  diagnostics: Array<{
    id: string
    title: string
    description: string
    score: number
    displayValue: string
  }>
  strategy: string
  data_source: string
  fetch_time: string
  final_url: string
  requested_url: string
}

interface WebsiteAnalysisResponse {
  status: 'success' | 'error'
  website_info: {
  url: string
    final_url: string
    title: string
    description: string
    favicon: string
    score: number
  }
  mobile_data: PageSpeedData
  desktop_data: PageSpeedData
  analysis_timestamp: string
  error?: string
}

export default function WebsiteAnalyzer() {
  const { globalUrl, isValidUrl } = useGlobalSearch()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WebsiteAnalysisResponse | null>(null)
  const [error, setError] = useState('')

  // Auto-run analysis when global URL is valid
  useEffect(() => {
    if (isValidUrl && globalUrl) {
      handleAnalysis()
    }
  }, [globalUrl, isValidUrl])

  const handleAnalysis = async () => {
    if (!globalUrl || !isValidUrl) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Convert simple domain to full URL
      let fullUrl = globalUrl.trim()
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `https://${fullUrl}`
      }

              // Call frontend API route (which will call backend)
        let response
        try {
          response = await fetch(`/api/analyze-website?_t=${Date.now()}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
            body: JSON.stringify({ url: fullUrl, userId: user?.id }),
          })
        } catch (error) {
          // Fallback to original API route
          response = await fetch(`/api/website-analyzer?_t=${Date.now()}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
            },
            body: JSON.stringify({ url: fullUrl, userId: user?.id }),
          })
        }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to analyze website')
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze website. Please check the URL and try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    if (score >= 50) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getScoreText = (score: number) => {
    if (score >= 90) return 'Excellent'
    if (score >= 70) return 'Good'
    if (score >= 50) return 'Needs Improvement'
    return 'Poor'
  }

  const getCoreWebVitalStatus = (score: number) => {
    if (score >= 0.9) return { status: 'Good', color: 'text-green-600 bg-green-100' }
    if (score >= 0.5) return { status: 'Needs Improvement', color: 'text-yellow-600 bg-yellow-100' }
    return { status: 'Poor', color: 'text-red-600 bg-red-100' }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${Math.round(ms)} ms`
    return `${(ms / 1000).toFixed(2)} s`
  }

  return (
    <div className="space-y-6">
      {/* Global Search Input */}
      <GlobalSearchInput />

      {/* Compact Header with URL Input */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Header Info */}
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Website Analyzer</h2>
              <p className="text-sm text-gray-600">Comprehensive website analysis</p>
            </div>
          </div>

          {/* URL Input and Button */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {globalUrl ? (
                  <a
                    href={globalUrl.startsWith('http') ? globalUrl : `https://${globalUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-mono text-sm truncate hover:underline transition-colors"
                  >
                    {globalUrl.startsWith('http') ? globalUrl : `https://${globalUrl}`}
                  </a>
                ) : (
                  <span className="text-gray-500 font-mono text-sm">
                    No URL selected
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleAnalysis}
              disabled={loading || !isValidUrl}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-sm font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {!globalUrl && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
              <p className="text-sm text-amber-800">Please enter a URL in the global search above to start analyzing.</p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analyzing Website</h3>
              <p className="text-gray-600 mb-4">Fetching real-time data from Google PageSpeed Insights...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
              </div>
              <p className="text-sm text-gray-500">This may take 10-30 seconds for comprehensive analysis</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Compact Website Preview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Website Preview</h3>
              <a
                href={result.website_info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors group text-sm"
              >
                <Eye className="h-4 w-4 group-hover:scale-110 transition-transform" />
                <span>Live Preview</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Desktop Preview */}
              <a
                href={result.website_info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="bg-gray-200 px-3 py-2 flex items-center space-x-2">
                  <Monitor className="h-3 w-3 text-gray-600" />
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600 truncate">
                    {result.website_info.url}
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="h-32 bg-white flex items-center justify-center relative">
                  <iframe
                    src={result.website_info.url}
                    className="w-full h-full border-0 pointer-events-none"
                    title="Desktop Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-blue-500 group-hover:bg-opacity-10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg">
                      <ExternalLink className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                </div>
              </a>

              {/* Mobile Preview */}
              <a
                href={result.website_info.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:border-blue-300 hover:shadow-md transition-all duration-200 group max-w-xs mx-auto md:mx-0"
              >
                <div className="bg-gray-200 px-3 py-2 flex items-center space-x-2">
                  <Smartphone className="h-3 w-3 text-gray-600" />
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600 truncate">
                    {result.website_info.url}
                  </div>
                  <ExternalLink className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <div className="h-32 bg-white flex items-center justify-center relative">
                  <iframe
                    src={result.website_info.url}
                    className="w-full h-full border-0 pointer-events-none"
                    title="Mobile Preview"
                    sandbox="allow-scripts allow-same-origin"
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-blue-500 group-hover:bg-opacity-10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-1.5 shadow-lg">
                      <ExternalLink className="h-3 w-3 text-blue-600" />
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Overall Score & Performance */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Scores</h3>
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">Complete</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overall Score */}
              <div className="text-center">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Score</h4>
                <CircularProgress 
                  score={result.website_info.score || 0} 
                  size={100}
                  strokeWidth={8}
                  label="Overall"
                />
              </div>

              {/* Mobile Performance */}
              {result.mobile_data && (
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 mr-1 text-blue-600" />
                    Mobile
                  </h4>
                  <CircularProgress 
                    score={result.mobile_data.performance_score || 0} 
                    size={100}
                    strokeWidth={8}
                    label="Mobile"
                  />
                </div>
              )}

              {/* Desktop Performance */}
              {result.desktop_data && (
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center justify-center">
                    <Monitor className="h-4 w-4 mr-1 text-green-600" />
                    Desktop
                  </h4>
                  <CircularProgress 
                    score={result.desktop_data.performance_score || 0} 
                    size={100}
                    strokeWidth={8}
                    label="Desktop"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Core Web Vitals */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Core Web Vitals</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mobile Core Web Vitals */}
              {result.mobile_data && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Mobile</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">LCP</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">{result.mobile_data.display_values.largest_contentful_paint}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getCoreWebVitalStatus(result.mobile_data.lcp_score).color}`}>
                          {getCoreWebVitalStatus(result.mobile_data.lcp_score).status}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">FID</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">{result.mobile_data.display_values.first_input_delay}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getCoreWebVitalStatus(result.mobile_data.fid_score).color}`}>
                          {getCoreWebVitalStatus(result.mobile_data.fid_score).status}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">CLS</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">{result.mobile_data.display_values.cumulative_layout_shift}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getCoreWebVitalStatus(result.mobile_data.cls_score).color}`}>
                          {getCoreWebVitalStatus(result.mobile_data.cls_score).status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Core Web Vitals */}
              {result.desktop_data && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 mb-3">
                    <Monitor className="h-4 w-4 text-green-600" />
                    <h4 className="font-medium text-gray-900">Desktop</h4>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">LCP</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">{result.desktop_data.display_values.largest_contentful_paint}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getCoreWebVitalStatus(result.desktop_data.lcp_score).color}`}>
                          {getCoreWebVitalStatus(result.desktop_data.lcp_score).status}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-900">FID</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">{result.desktop_data.display_values.first_input_delay}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getCoreWebVitalStatus(result.desktop_data.fid_score).color}`}>
                          {getCoreWebVitalStatus(result.desktop_data.fid_score).status}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-900">CLS</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold">{result.desktop_data.display_values.cumulative_layout_shift}</div>
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getCoreWebVitalStatus(result.desktop_data.cls_score).color}`}>
                          {getCoreWebVitalStatus(result.desktop_data.cls_score).status}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Performance Metrics */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Performance Metrics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mobile Metrics */}
              {result.mobile_data && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Mobile Metrics</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">First Contentful Paint</span>
                      <span className="text-sm font-mono text-gray-900">{result.mobile_data.display_values.first_contentful_paint}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Largest Contentful Paint</span>
                      <span className="text-sm font-mono text-gray-900">{result.mobile_data.display_values.largest_contentful_paint}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Cumulative Layout Shift</span>
                      <span className="text-sm font-mono text-gray-900">{result.mobile_data.display_values.cumulative_layout_shift}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">First Input Delay</span>
                      <span className="text-sm font-mono text-gray-900">{result.mobile_data.display_values.first_input_delay}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Total Blocking Time</span>
                      <span className="text-sm font-mono text-gray-900">{result.mobile_data.display_values.total_blocking_time}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Speed Index</span>
                      <span className="text-sm font-mono text-gray-900">{result.mobile_data.display_values.speed_index}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Time to Interactive</span>
                      <span className="text-sm font-mono text-gray-900">{result.mobile_data.display_values.time_to_interactive}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">First Meaningful Paint</span>
                      <span className="text-sm font-mono text-gray-900">{result.mobile_data.display_values.first_meaningful_paint}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Metrics */}
              {result.desktop_data && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Monitor className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Desktop Metrics</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">First Contentful Paint</span>
                      <span className="text-sm font-mono text-gray-900">{result.desktop_data.display_values.first_contentful_paint}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Largest Contentful Paint</span>
                      <span className="text-sm font-mono text-gray-900">{result.desktop_data.display_values.largest_contentful_paint}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Cumulative Layout Shift</span>
                      <span className="text-sm font-mono text-gray-900">{result.desktop_data.display_values.cumulative_layout_shift}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">First Input Delay</span>
                      <span className="text-sm font-mono text-gray-900">{result.desktop_data.display_values.first_input_delay}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Total Blocking Time</span>
                      <span className="text-sm font-mono text-gray-900">{result.desktop_data.display_values.total_blocking_time}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Speed Index</span>
                      <span className="text-sm font-mono text-gray-900">{result.desktop_data.display_values.speed_index}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Time to Interactive</span>
                      <span className="text-sm font-mono text-gray-900">{result.desktop_data.display_values.time_to_interactive}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">First Meaningful Paint</span>
                      <span className="text-sm font-mono text-gray-900">{result.desktop_data.display_values.first_meaningful_paint}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resource Metrics */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Resource Analysis</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mobile Resources */}
              {result.mobile_data && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Mobile Resources</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Total Byte Weight</span>
                      <span className="text-sm font-mono text-gray-900">{formatBytes(result.mobile_data?.resource_metrics?.total_byte_weight || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Unused CSS Rules</span>
                      <span className="text-sm font-mono text-gray-900">{formatBytes(result.mobile_data?.resource_metrics?.unused_css_rules || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Unused JavaScript</span>
                      <span className="text-sm font-mono text-gray-900">{formatBytes(result.mobile_data?.resource_metrics?.unused_javascript || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Render Blocking Resources</span>
                      <span className="text-sm font-mono text-gray-900">{result.mobile_data?.resource_metrics?.render_blocking_resources || 0} ms</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Desktop Resources */}
              {result.desktop_data && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Monitor className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Desktop Resources</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Total Byte Weight</span>
                      <span className="text-sm font-mono text-gray-900">{formatBytes(result.desktop_data?.resource_metrics?.total_byte_weight || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Unused CSS Rules</span>
                      <span className="text-sm font-mono text-gray-900">{formatBytes(result.desktop_data?.resource_metrics?.unused_css_rules || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Unused JavaScript</span>
                      <span className="text-sm font-mono text-gray-900">{formatBytes(result.desktop_data?.resource_metrics?.unused_javascript || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Render Blocking Resources</span>
                      <span className="text-sm font-mono text-gray-900">{result.desktop_data?.resource_metrics?.render_blocking_resources || 0} ms</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Opportunities */}
          {(result.mobile_data?.opportunities?.length > 0 || result.desktop_data?.opportunities?.length > 0) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Optimization Opportunities</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Mobile Opportunities */}
                {result.mobile_data?.opportunities?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Mobile Opportunities</h4>
                    </div>
                    <div className="space-y-3">
                      {result.mobile_data.opportunities.slice(0, 5).map((opportunity, index) => (
                        <div key={index} className="p-3 lg:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                            <h5 className="font-medium text-orange-900 text-sm lg:text-base break-words">{opportunity.title}</h5>
                            <span className="text-xs lg:text-sm font-mono text-orange-700 whitespace-nowrap">{opportunity.displayValue}</span>
                          </div>
                          <p className="text-xs lg:text-sm text-orange-800 mb-2 break-words leading-relaxed">{opportunity.description}</p>
                          {opportunity.wastedMs > 0 && (
                            <div className="text-xs text-orange-600">
                              Potential savings: {formatTime(opportunity.wastedMs)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desktop Opportunities */}
                {result.desktop_data?.opportunities?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Monitor className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Desktop Opportunities</h4>
                    </div>
                    <div className="space-y-3">
                      {result.desktop_data.opportunities.slice(0, 5).map((opportunity, index) => (
                        <div key={index} className="p-3 lg:p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                            <h5 className="font-medium text-orange-900 text-sm lg:text-base break-words">{opportunity.title}</h5>
                            <span className="text-xs lg:text-sm font-mono text-orange-700 whitespace-nowrap">{opportunity.displayValue}</span>
                          </div>
                          <p className="text-xs lg:text-sm text-orange-800 mb-2 break-words leading-relaxed">{opportunity.description}</p>
                          {opportunity.wastedMs > 0 && (
                            <div className="text-xs text-orange-600">
                              Potential savings: {formatTime(opportunity.wastedMs)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Diagnostics */}
          {(result.mobile_data?.diagnostics?.length > 0 || result.desktop_data?.diagnostics?.length > 0) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Diagnostics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                {/* Mobile Diagnostics */}
                {result.mobile_data?.diagnostics?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Mobile Diagnostics</h4>
                    </div>
                    <div className="space-y-3">
                      {result.mobile_data.diagnostics.slice(0, 5).map((diagnostic, index) => (
                        <div key={index} className="p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                            <h5 className="font-medium text-blue-900 text-sm lg:text-base break-words">{diagnostic.title}</h5>
                            <span className="text-xs lg:text-sm font-mono text-blue-700 whitespace-nowrap">{diagnostic.displayValue}</span>
                          </div>
                          <p className="text-xs lg:text-sm text-blue-800 break-words leading-relaxed">{diagnostic.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Desktop Diagnostics */}
                {result.desktop_data?.diagnostics?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Monitor className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Desktop Diagnostics</h4>
                    </div>
                    <div className="space-y-3">
                      {result.desktop_data.diagnostics.slice(0, 5).map((diagnostic, index) => (
                        <div key={index} className="p-3 lg:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                            <h5 className="font-medium text-blue-900 text-sm lg:text-base break-words">{diagnostic.title}</h5>
                            <span className="text-xs lg:text-sm font-mono text-blue-700 whitespace-nowrap">{diagnostic.displayValue}</span>
                          </div>
                          <p className="text-xs lg:text-sm text-blue-800 break-words leading-relaxed">{diagnostic.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analysis Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Analysis Time:</span>
                <span className="font-mono">{new Date(result.analysis_timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Data Source:</span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Advanced SEO Analysis Engine
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <ExternalLink className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">Final URL:</span>
                <span className="font-mono truncate">{result.website_info.final_url}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!result && !loading && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-orange-900 mb-2">How to use Website Analyzer</h3>
          <ul className="text-orange-800 space-y-2">
            <li>• Enter any website URL for comprehensive analysis</li>
            <li>• Get performance, SEO, accessibility, and best practices scores</li>
            <li>• Receive detailed recommendations for improvement</li>
            <li>• Perfect for website optimization and competitive analysis</li>
          </ul>
        </div>
      )}
    </div>
  )
}
