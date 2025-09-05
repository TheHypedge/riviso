'use client'

import { useState } from 'react'
import { BarChart3, Loader2, CheckCircle, AlertCircle, ExternalLink, Globe, Clock, Shield, Smartphone, Monitor, Eye } from 'lucide-react'

interface PageSpeedData {
  status: 'success' | 'error'
  url: string
  strategy: 'mobile' | 'desktop'
  scores: {
    performance: number
    accessibility: number
    bestPractices: number
    seo: number
  }
  metrics: {
    firstContentfulPaint: number
    largestContentfulPaint: number
    cumulativeLayoutShift: number
    firstInputDelay: number
    totalBlockingTime: number
    speedIndex: number
    interactive: number
  }
  displayValues: {
    firstContentfulPaint: string
    largestContentfulPaint: string
    cumulativeLayoutShift: string
    firstInputDelay: string
    totalBlockingTime: string
    speedIndex: string
    interactive: string
  }
  error?: string
}

interface WebsiteAnalysisResponse {
  status: 'success' | 'error'
  url: string
  finalUrl?: string
  title?: string
  description?: string
  favicon?: string
  score?: number
  mobileData?: PageSpeedData
  desktopData?: PageSpeedData
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

      // Check if Google PageSpeed API key is configured
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PAGESPEED_API_KEY
      if (!apiKey || apiKey === 'your_api_key_here') {
        setError('Google PageSpeed Insights API key not configured. Please contact support.')
        return
      }

      // Fetch PageSpeed data directly from Google API
      const [mobileResponse, desktopResponse] = await Promise.all([
        fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&key=${apiKey}&strategy=mobile`),
        fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(fullUrl)}&key=${apiKey}&strategy=desktop`)
      ])

      if (!mobileResponse.ok || !desktopResponse.ok) {
        const errorText = await mobileResponse.text()
        setError(`Failed to fetch PageSpeed data: ${errorText}`)
        return
      }

      const mobileData = await mobileResponse.json()
      const desktopData = await desktopResponse.json()

      // Process PageSpeed data from Google API
      const processPageSpeedData = (data: any, strategy: 'mobile' | 'desktop') => {
        if (!data || data.error) return null
        
        const lighthouse = data.lighthouseResult
        const audits = lighthouse.audits
        
        return {
          status: 'success' as const,
          url: fullUrl,
          strategy: strategy,
          scores: {
            performance: Math.round(lighthouse.categories.performance.score * 100),
            accessibility: Math.round(lighthouse.categories.accessibility.score * 100),
            bestPractices: Math.round(lighthouse.categories['best-practices'].score * 100),
            seo: Math.round(lighthouse.categories.seo.score * 100)
          },
          metrics: {
            firstContentfulPaint: audits['first-contentful-paint']?.numericValue || 0,
            largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || 0,
            cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || 0,
            firstInputDelay: audits['max-potential-fid']?.numericValue || 0,
            totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
            speedIndex: audits['speed-index']?.numericValue || 0,
            interactive: audits['interactive']?.numericValue || 0
          },
          displayValues: {
            firstContentfulPaint: audits['first-contentful-paint']?.displayValue || 'N/A',
            largestContentfulPaint: audits['largest-contentful-paint']?.displayValue || 'N/A',
            cumulativeLayoutShift: audits['cumulative-layout-shift']?.displayValue || 'N/A',
            firstInputDelay: audits['max-potential-fid']?.displayValue || 'N/A',
            totalBlockingTime: audits['total-blocking-time']?.displayValue || 'N/A',
            speedIndex: audits['speed-index']?.displayValue || 'N/A',
            interactive: audits['interactive']?.displayValue || 'N/A'
          }
        }
      }

      const processedMobileData = processPageSpeedData(mobileData, 'mobile')
      const processedDesktopData = processPageSpeedData(desktopData, 'desktop')

      // Calculate overall score
      const overallScore = processedMobileData && processedDesktopData ? 
        Math.round((processedMobileData.scores.performance + processedDesktopData.scores.performance) / 2) : 
        (processedMobileData?.scores.performance || processedDesktopData?.scores.performance || 0)

      setResult({
        status: 'success',
        url: fullUrl,
        finalUrl: mobileData.lighthouseResult?.finalUrl || fullUrl,
        title: mobileData.lighthouseResult?.configSettings?.formFactor || 'Website Analysis',
        description: `Performance analysis for ${fullUrl}`,
        favicon: `https://www.google.com/s2/favicons?domain=${new URL(fullUrl).hostname}`,
        score: overallScore,
        mobileData: processedMobileData || undefined,
        desktopData: processedDesktopData || undefined
      })
    } catch (err) {
      setError('Failed to analyze website. Please check the URL and try again.')
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
                      {result.url}
                    </div>
                  </div>
                  <div className="h-64 bg-white flex items-center justify-center">
                    <iframe
                      src={result.url}
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
                      {result.url}
                    </div>
                  </div>
                  <div className="h-64 bg-white flex items-center justify-center">
                    <iframe
                      src={result.url}
                      className="w-full h-full border-0"
                      title="Mobile Preview"
                      sandbox="allow-scripts allow-same-origin"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile vs Desktop Performance */}
          {(result.mobileData || result.desktopData) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Comparison</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mobile Performance */}
                {result.mobileData && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Mobile Performance</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(result.mobileData.scores.performance).split(' ')[0]}`}>
                          {result.mobileData.scores.performance}
                        </div>
                        <div className="text-sm text-gray-600">Performance</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(result.mobileData.scores.accessibility).split(' ')[0]}`}>
                          {result.mobileData.scores.accessibility}
                        </div>
                        <div className="text-sm text-gray-600">Accessibility</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(result.mobileData.scores.bestPractices).split(' ')[0]}`}>
                          {result.mobileData.scores.bestPractices}
                        </div>
                        <div className="text-sm text-gray-600">Best Practices</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(result.mobileData.scores.seo).split(' ')[0]}`}>
                          {result.mobileData.scores.seo}
                        </div>
                        <div className="text-sm text-gray-600">SEO</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">First Contentful Paint:</span>
                        <span className="font-mono">{result.mobileData.displayValues.firstContentfulPaint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Largest Contentful Paint:</span>
                        <span className="font-mono">{result.mobileData.displayValues.largestContentfulPaint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cumulative Layout Shift:</span>
                        <span className="font-mono">{result.mobileData.displayValues.cumulativeLayoutShift}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Performance */}
                {result.desktopData && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Monitor className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Desktop Performance</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(result.desktopData.scores.performance).split(' ')[0]}`}>
                          {result.desktopData.scores.performance}
                        </div>
                        <div className="text-sm text-gray-600">Performance</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(result.desktopData.scores.accessibility).split(' ')[0]}`}>
                          {result.desktopData.scores.accessibility}
                        </div>
                        <div className="text-sm text-gray-600">Accessibility</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(result.desktopData.scores.bestPractices).split(' ')[0]}`}>
                          {result.desktopData.scores.bestPractices}
                        </div>
                        <div className="text-sm text-gray-600">Best Practices</div>
                      </div>
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className={`text-2xl font-bold ${getScoreColor(result.desktopData.scores.seo).split(' ')[0]}`}>
                          {result.desktopData.scores.seo}
                        </div>
                        <div className="text-sm text-gray-600">SEO</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">First Contentful Paint:</span>
                        <span className="font-mono">{result.desktopData.displayValues.firstContentfulPaint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Largest Contentful Paint:</span>
                        <span className="font-mono">{result.desktopData.displayValues.largestContentfulPaint}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cumulative Layout Shift:</span>
                        <span className="font-mono">{result.desktopData.displayValues.cumulativeLayoutShift}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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

          {/* Detailed Performance Metrics */}
          {(result.mobileData || result.desktopData) && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Detailed Performance Metrics</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Mobile Metrics */}
                {result.mobileData && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Mobile Metrics</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">First Contentful Paint</span>
                        <span className="text-sm font-mono text-gray-900">{result.mobileData.displayValues.firstContentfulPaint}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Largest Contentful Paint</span>
                        <span className="text-sm font-mono text-gray-900">{result.mobileData.displayValues.largestContentfulPaint}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Cumulative Layout Shift</span>
                        <span className="text-sm font-mono text-gray-900">{result.mobileData.displayValues.cumulativeLayoutShift}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">First Input Delay</span>
                        <span className="text-sm font-mono text-gray-900">{result.mobileData.displayValues.firstInputDelay}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Total Blocking Time</span>
                        <span className="text-sm font-mono text-gray-900">{result.mobileData.displayValues.totalBlockingTime}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Desktop Metrics */}
                {result.desktopData && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <Monitor className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Desktop Metrics</h4>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">First Contentful Paint</span>
                        <span className="text-sm font-mono text-gray-900">{result.desktopData.displayValues.firstContentfulPaint}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Largest Contentful Paint</span>
                        <span className="text-sm font-mono text-gray-900">{result.desktopData.displayValues.largestContentfulPaint}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Cumulative Layout Shift</span>
                        <span className="text-sm font-mono text-gray-900">{result.desktopData.displayValues.cumulativeLayoutShift}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">First Input Delay</span>
                        <span className="text-sm font-mono text-gray-900">{result.desktopData.displayValues.firstInputDelay}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">Total Blocking Time</span>
                        <span className="text-sm font-mono text-gray-900">{result.desktopData.displayValues.totalBlockingTime}</span>
                      </div>
                    </div>
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
