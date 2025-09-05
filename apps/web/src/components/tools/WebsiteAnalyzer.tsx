'use client'

import { useState } from 'react'
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
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WebsiteAnalysisResponse | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Convert simple domain to full URL
      let fullUrl = url.trim()
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `https://${fullUrl}`
      }

      // Call frontend API route (which will call backend)
      let response
      try {
        response = await fetch('/api/analyze-website', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: fullUrl }),
        })
      } catch (error) {
        // Fallback to original API route
        response = await fetch('/api/website-analyzer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: fullUrl }),
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
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-orange-100 rounded-lg mr-4">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Website Analyzer</h2>
            <p className="text-gray-600">Comprehensive website analysis with Google PageSpeed Insights</p>
          </div>
        </div>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <div className="flex space-x-4">
              <input
                type="text"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., example.com or https://example.com)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analyze Website
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
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
        <div className="space-y-6">
          {/* Website Preview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Website Preview</h3>
              <div className="flex items-center space-x-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-gray-600">Live Preview</span>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Desktop Preview */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Monitor className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Desktop View</span>
                </div>
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                  <div className="bg-gray-200 px-3 py-2 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600">
                      {result.website_info.url}
                    </div>
                  </div>
                  <div className="h-64 bg-white flex items-center justify-center">
                    <iframe
                      src={result.website_info.url}
                      className="w-full h-full border-0"
                      title="Desktop Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Preview */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Mobile View</span>
                </div>
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 max-w-xs mx-auto">
                  <div className="bg-gray-200 px-3 py-2 flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1 bg-white rounded px-2 py-1 text-xs text-gray-600 truncate">
                      {result.website_info.url}
                    </div>
                  </div>
                  <div className="h-64 bg-white flex items-center justify-center">
                    <iframe
                      src={result.website_info.url}
                      className="w-full h-full border-0"
                      title="Mobile Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Score */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Overall Website Score</h3>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Analysis Complete</span>
              </div>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(result.website_info.score).split(' ')[0]} mb-2`}>
                {result.website_info.score}
              </div>
              <div className="text-lg text-gray-600 mb-4">out of 100</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    result.website_info.score >= 90 ? 'bg-green-500' : 
                    result.website_info.score >= 70 ? 'bg-yellow-500' : 
                    result.website_info.score >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.website_info.score}%` }}
                />
              </div>
            </div>
          </div>

          {/* Performance Comparison */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Comparison</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mobile Performance */}
              {result.mobile_data && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Mobile Performance</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(result.mobile_data.performance_score).split(' ')[0]}`}>
                        {result.mobile_data.performance_score}
                        </div>
                        <div className="text-sm text-gray-600">Performance</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(result.mobile_data.accessibility_score).split(' ')[0]}`}>
                        {result.mobile_data.accessibility_score}
                        </div>
                        <div className="text-sm text-gray-600">Accessibility</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(result.mobile_data.best_practices_score).split(' ')[0]}`}>
                        {result.mobile_data.best_practices_score}
                        </div>
                        <div className="text-sm text-gray-600">Best Practices</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(result.mobile_data.seo_score).split(' ')[0]}`}>
                        {result.mobile_data.seo_score}
                        </div>
                        <div className="text-sm text-gray-600">SEO</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Performance */}
              {result.desktop_data && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Monitor className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Desktop Performance</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(result.desktop_data.performance_score).split(' ')[0]}`}>
                        {result.desktop_data.performance_score}
                        </div>
                        <div className="text-sm text-gray-600">Performance</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(result.desktop_data.accessibility_score).split(' ')[0]}`}>
                        {result.desktop_data.accessibility_score}
                        </div>
                        <div className="text-sm text-gray-600">Accessibility</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(result.desktop_data.best_practices_score).split(' ')[0]}`}>
                        {result.desktop_data.best_practices_score}
                        </div>
                        <div className="text-sm text-gray-600">Best Practices</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold ${getScoreColor(result.desktop_data.seo_score).split(' ')[0]}`}>
                        {result.desktop_data.seo_score}
                      </div>
                      <div className="text-sm text-gray-600">SEO</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Core Web Vitals */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Core Web Vitals</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Mobile Core Web Vitals */}
              {result.mobile_data && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">Mobile Core Web Vitals</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Largest Contentful Paint</div>
                          <div className="text-sm text-gray-600">Loading performance</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">{result.mobile_data.display_values.largest_contentful_paint}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getCoreWebVitalStatus(result.mobile_data.lcp_score).color}`}>
                          {getCoreWebVitalStatus(result.mobile_data.lcp_score).status}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Clock className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">First Input Delay</div>
                          <div className="text-sm text-gray-600">Interactivity</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">{result.mobile_data.display_values.first_input_delay}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getCoreWebVitalStatus(result.mobile_data.fid_score).color}`}>
                          {getCoreWebVitalStatus(result.mobile_data.fid_score).status}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Cumulative Layout Shift</div>
                          <div className="text-sm text-gray-600">Visual stability</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">{result.mobile_data.display_values.cumulative_layout_shift}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getCoreWebVitalStatus(result.mobile_data.cls_score).color}`}>
                          {getCoreWebVitalStatus(result.mobile_data.cls_score).status}
                        </div>
                      </div>
                    </div>
              </div>
            </div>
          )}

              {/* Desktop Core Web Vitals */}
              {result.desktop_data && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Monitor className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900">Desktop Core Web Vitals</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Largest Contentful Paint</div>
                          <div className="text-sm text-gray-600">Loading performance</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">{result.desktop_data.display_values.largest_contentful_paint}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getCoreWebVitalStatus(result.desktop_data.lcp_score).color}`}>
                          {getCoreWebVitalStatus(result.desktop_data.lcp_score).status}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Clock className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">First Input Delay</div>
                          <div className="text-sm text-gray-600">Interactivity</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">{result.desktop_data.display_values.first_input_delay}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getCoreWebVitalStatus(result.desktop_data.fid_score).color}`}>
                          {getCoreWebVitalStatus(result.desktop_data.fid_score).status}
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Cumulative Layout Shift</div>
                          <div className="text-sm text-gray-600">Visual stability</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg font-bold">{result.desktop_data.display_values.cumulative_layout_shift}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${getCoreWebVitalStatus(result.desktop_data.cls_score).color}`}>
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Optimization Opportunities</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mobile Opportunities */}
                {result.mobile_data?.opportunities?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Mobile Opportunities</h4>
                    </div>
                    <div className="space-y-3">
                      {result.mobile_data.opportunities.slice(0, 5).map((opportunity, index) => (
                        <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-orange-900">{opportunity.title}</h5>
                            <span className="text-sm font-mono text-orange-700">{opportunity.displayValue}</span>
                          </div>
                          <p className="text-sm text-orange-800 mb-2">{opportunity.description}</p>
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
                        <div key={index} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-orange-900">{opportunity.title}</h5>
                            <span className="text-sm font-mono text-orange-700">{opportunity.displayValue}</span>
                          </div>
                          <p className="text-sm text-orange-800 mb-2">{opportunity.description}</p>
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
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Diagnostics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mobile Diagnostics */}
                {result.mobile_data?.diagnostics?.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Mobile Diagnostics</h4>
                    </div>
                    <div className="space-y-3">
                      {result.mobile_data.diagnostics.slice(0, 5).map((diagnostic, index) => (
                        <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-blue-900">{diagnostic.title}</h5>
                            <span className="text-sm font-mono text-blue-700">{diagnostic.displayValue}</span>
                          </div>
                          <p className="text-sm text-blue-800">{diagnostic.description}</p>
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
                        <div key={index} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-blue-900">{diagnostic.title}</h5>
                            <span className="text-sm font-mono text-blue-700">{diagnostic.displayValue}</span>
                          </div>
                          <p className="text-sm text-blue-800">{diagnostic.description}</p>
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  result.mobile_data?.data_source === 'Google PageSpeed Insights API' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {result.mobile_data?.data_source || result.desktop_data?.data_source || 'Unknown'}
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
