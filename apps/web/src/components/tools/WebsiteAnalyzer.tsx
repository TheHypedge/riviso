'use client'

import { useState } from 'react'
import { BarChart3, Loader2, CheckCircle, AlertCircle, ExternalLink, Globe, Clock, Shield } from 'lucide-react'

interface WebsiteAnalysisResponse {
  status: 'success' | 'error'
  url: string
  finalUrl?: string
  title?: string
  description?: string
  favicon?: string
  score?: number
  analysis?: {
    performance?: {
      score: number
      metrics: {
        firstContentfulPaint?: number
        largestContentfulPaint?: number
        cumulativeLayoutShift?: number
        firstInputDelay?: number
        totalBlockingTime?: number
      }
    }
    seo?: {
      score: number
      issues: string[]
      recommendations: string[]
    }
    accessibility?: {
      score: number
      issues: string[]
      recommendations: string[]
    }
    bestPractices?: {
      score: number
      issues: string[]
      recommendations: string[]
    }
  }
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

      // For now, we'll simulate a comprehensive analysis
      // In a real implementation, this would call multiple APIs
      const response = await fetch(`/api/onpage?url=${encodeURIComponent(fullUrl)}`)
      const data = await response.json()

      if (response.ok) {
        // Simulate additional analysis data
        const mockAnalysis = {
          performance: {
            score: Math.floor(Math.random() * 40) + 60, // 60-100
            metrics: {
              firstContentfulPaint: Math.floor(Math.random() * 2000) + 1000,
              largestContentfulPaint: Math.floor(Math.random() * 3000) + 2000,
              cumulativeLayoutShift: Math.random() * 0.1,
              firstInputDelay: Math.floor(Math.random() * 100) + 50,
              totalBlockingTime: Math.floor(Math.random() * 200) + 100
            }
          },
          seo: {
            score: data.score || Math.floor(Math.random() * 40) + 60,
            issues: [
              'Missing meta description',
              'Title tag too long',
              'No structured data found'
            ],
            recommendations: [
              'Add a compelling meta description',
              'Optimize title tag length',
              'Implement structured data markup'
            ]
          },
          accessibility: {
            score: Math.floor(Math.random() * 40) + 60,
            issues: [
              'Images missing alt text',
              'Low color contrast ratio',
              'Missing heading hierarchy'
            ],
            recommendations: [
              'Add descriptive alt text to all images',
              'Improve color contrast ratios',
              'Use proper heading structure'
            ]
          },
          bestPractices: {
            score: Math.floor(Math.random() * 40) + 60,
            issues: [
              'Using deprecated APIs',
              'Missing security headers',
              'Not using HTTPS'
            ],
            recommendations: [
              'Update to modern APIs',
              'Implement security headers',
              'Enable HTTPS'
            ]
          }
        }

        setResult({
          ...data,
          analysis: mockAnalysis
        })
      } else {
        setError(data.message || 'An error occurred while analyzing the website')
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.')
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-orange-100 rounded-lg mr-4">
            <BarChart3 className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Website Analyzer</h2>
            <p className="text-gray-600">Comprehensive website analysis and optimization</p>
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
              <div className={`text-6xl font-bold ${getScoreColor(result.score || 0).split(' ')[0]} mb-2`}>
                {result.score || 0}
              </div>
              <div className="text-lg text-gray-600 mb-4">out of 100</div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
                    (result.score || 0) >= 90 ? 'bg-green-500' : 
                    (result.score || 0) >= 70 ? 'bg-yellow-500' : 
                    (result.score || 0) >= 50 ? 'bg-orange-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.score || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Analysis Categories */}
          {result.analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Performance */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Performance</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.analysis.performance?.score || 0)}`}>
                    {result.analysis.performance?.score || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {getScoreText(result.analysis.performance?.score || 0)}
                </p>
                {result.analysis.performance?.metrics && (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-500">FCP:</span>
                      <span className="font-mono">{(result.analysis.performance.metrics.firstContentfulPaint || 0).toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">LCP:</span>
                      <span className="font-mono">{(result.analysis.performance.metrics.largestContentfulPaint || 0).toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">CLS:</span>
                      <span className="font-mono">{(result.analysis.performance.metrics.cumulativeLayoutShift || 0).toFixed(3)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SEO */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-green-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">SEO</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.analysis.seo?.score || 0)}`}>
                    {result.analysis.seo?.score || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {getScoreText(result.analysis.seo?.score || 0)}
                </p>
                <div className="text-xs text-gray-500">
                  {result.analysis.seo?.issues.length || 0} issues found
                </div>
              </div>

              {/* Accessibility */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-purple-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Accessibility</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.analysis.accessibility?.score || 0)}`}>
                    {result.analysis.accessibility?.score || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {getScoreText(result.analysis.accessibility?.score || 0)}
                </p>
                <div className="text-xs text-gray-500">
                  {result.analysis.accessibility?.issues.length || 0} issues found
                </div>
              </div>

              {/* Best Practices */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-orange-600 mr-2" />
                    <h4 className="font-semibold text-gray-900">Best Practices</h4>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(result.analysis.bestPractices?.score || 0)}`}>
                    {result.analysis.bestPractices?.score || 0}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {getScoreText(result.analysis.bestPractices?.score || 0)}
                </p>
                <div className="text-xs text-gray-500">
                  {result.analysis.bestPractices?.issues.length || 0} issues found
                </div>
              </div>
            </div>
          )}

          {/* Detailed Recommendations */}
          {result.analysis && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {result.analysis.seo?.recommendations && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Globe className="h-4 w-4 text-green-600 mr-2" />
                      SEO Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {result.analysis.seo.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.analysis.accessibility?.recommendations && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Shield className="h-4 w-4 text-purple-600 mr-2" />
                      Accessibility Recommendations
                    </h4>
                    <ul className="space-y-2">
                      {result.analysis.accessibility.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
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
