'use client'

import { useState, useEffect } from 'react'
import { FileText, Loader2, CheckCircle, AlertCircle, XCircle, Search, Image, Link as LinkIcon } from 'lucide-react'
import { useGlobalSearch } from '@/contexts/GlobalSearchContext'
import { useAuth } from '@/contexts/AuthContext'
import GlobalSearchInput from '../GlobalSearchInput'

interface OnPageResult {
  status: 'success' | 'error'
  url: string
  finalUrl?: string
  title?: string
  description?: string
  favicon?: string
  score?: number
  checks?: {
    title: { status: string; message: string; value?: string }
    description: { status: string; message: string; value?: string }
    metaRobots: { status: string; message: string; value?: string }
    canonical: { status: string; message: string; value?: string }
    headings: { status: string; message: string; value?: string }
    openGraph: { status: string; message: string; value?: string }
    twitter: { status: string; message: string; value?: string }
    images: { status: string; message: string; value?: string }
    links: { status: string; message: string; value?: string }
    hreflang: { status: string; message: string; value?: string }
    structuredData: { status: string; message: string; value?: string }
    favicon: { status: string; message: string; value?: string }
    language: { status: string; message: string; value?: string }
    charset: { status: string; message: string; value?: string }
  }
  error?: string
}

export default function OnPageSEO() {
  const { globalUrl, isValidUrl } = useGlobalSearch()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OnPageResult | null>(null)
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

      const response = await fetch(`/api/onpage?url=${encodeURIComponent(fullUrl)}&userId=${user?.id || ''}`)
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || 'An error occurred while analyzing the page')
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warn':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800'
      case 'warn':
        return 'bg-yellow-100 text-yellow-800'
      case 'fail':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCardBackgroundColor = (status: string) => {
    switch (status) {
      case 'warn': return 'bg-yellow-50'
      case 'fail': return 'bg-red-50'
      default: return 'bg-gray-50' // Default for pass and other statuses
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getRecommendation = (key: string, status: string, value?: string) => {
    const recommendations: Record<string, { pass: string; warn: string; fail: string }> = {
      title: {
        pass: "Great approach! You are using title tags properly with optimal length.",
        warn: "Recommendation: Title tag length should be 50-60 characters for optimal SEO.",
        fail: "Recommendation: Add a title tag with 50-60 characters to improve search visibility."
      },
      description: {
        pass: "Great approach! You are using meta descriptions properly with optimal length.",
        warn: "Recommendation: Meta description length should be 150-160 characters for better click-through rates.",
        fail: "Recommendation: Add a meta description with 150-160 characters to improve search snippets."
      },
      metaRobots: {
        pass: "Great approach! You are using meta robots tags properly for search engine control.",
        warn: "Recommendation: Review your meta robots tags to ensure proper indexing directives.",
        fail: "Recommendation: Add proper meta robots tags to control search engine crawling and indexing."
      },
      canonical: {
        pass: "Great approach! You are using canonical URLs properly to avoid duplicate content issues.",
        warn: "Recommendation: Ensure your canonical URL points to the preferred version of this page.",
        fail: "Recommendation: Add a canonical URL to prevent duplicate content penalties."
      },
      headings: {
        pass: "Great approach! You are using heading structure properly with good hierarchy.",
        warn: "Recommendation: Avoid skipping heading levels (e.g., H2 to H4). Use proper hierarchical structure H1-H6.",
        fail: "Recommendation: Add proper heading structure with H1-H6 tags in logical order."
      },
      openGraph: {
        pass: "Great approach! You are using Open Graph tags properly for social media sharing.",
        warn: "Recommendation: Complete your Open Graph tags with all recommended properties.",
        fail: "Recommendation: Add Open Graph meta tags to improve social media sharing appearance."
      },
      twitter: {
        pass: "Great approach! You are using Twitter Cards properly for enhanced social sharing.",
        warn: "Recommendation: Complete your Twitter Card implementation with all recommended tags.",
        fail: "Recommendation: Add Twitter Card meta tags to enhance your content's appearance on Twitter."
      },
      images: {
        pass: "Great approach! You are using images properly with alt text and optimized file sizes.",
        warn: "Recommendation: Add meaningful alt text to images and keep large assets under 300 KB.",
        fail: "Recommendation: Add alt text to all images and optimize file sizes for better performance."
      },
      links: {
        pass: "Great approach! You are using internal and external links properly for SEO value.",
        warn: "Recommendation: Review your link structure and ensure proper anchor text usage.",
        fail: "Recommendation: Add relevant internal and external links to improve page authority."
      },
      hreflang: {
        pass: "Great approach! You are using hreflang tags properly for international SEO.",
        warn: "Recommendation: Review your hreflang implementation for proper language targeting.",
        fail: "Recommendation: Add hreflang tags if you have multilingual content for better international targeting."
      },
      structuredData: {
        pass: "Great approach! You are using structured data properly to help search engines understand your content.",
        warn: "Recommendation: Complete your structured data implementation with all relevant schema types.",
        fail: "Recommendation: Add structured data markup to help search engines better understand your content."
      },
      favicon: {
        pass: "Great approach! You are using favicons properly for better brand recognition.",
        warn: "Recommendation: Ensure your favicon is properly sized and displays correctly across all devices.",
        fail: "Recommendation: Add a favicon to improve brand recognition and user experience."
      },
      language: {
        pass: "Great approach! You are using language attributes properly for accessibility and SEO.",
        warn: "Recommendation: Ensure your language attribute matches your content language.",
        fail: "Recommendation: Add a language attribute to your HTML tag for better accessibility and SEO."
      },
      charset: {
        pass: "Great approach! You are using charset declaration properly for proper text encoding.",
        warn: "Recommendation: Ensure your charset is declared early in the document head.",
        fail: "Recommendation: Add a charset declaration to ensure proper text encoding."
      }
    }

    const recommendation = recommendations[key]
    if (recommendation && status in recommendation) {
      return recommendation[status as keyof typeof recommendation]
    }
    return "Review this element for optimal SEO performance."
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
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">On-Page SEO Analysis</h2>
              <p className="text-sm text-gray-600">Analyze on-page SEO elements and optimization</p>
            </div>
          </div>

          {/* URL Input and Button */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                <span className="text-gray-900 font-mono text-sm truncate">
                  {globalUrl ? (globalUrl.startsWith('http') ? globalUrl : `https://${globalUrl}`) : 'No URL selected'}
                </span>
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
                  <FileText className="h-4 w-4 mr-2" />
                  Analyze SEO
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
          {/* SERP Preview */}
          {result.finalUrl && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">How Your Site Appears in Google Search Results</h3>
              
              {/* Desktop Preview */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Desktop View</h4>
                <div className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-center space-x-2 mb-2">
                    {result.favicon ? (
                      <img 
                        src={result.favicon} 
                        alt="Favicon" 
                        className="w-4 h-4"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'
                          }
                        }}
                      />
                    ) : null}
                    <img 
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTZMMCA4TDIuODI4IDUuMTcyTDggMTAuMzQ0TDEzLjE3MiA1LjE3MkwxNiA4TDggMTZaIiBmaWxsPSIjRkZCNzAwIi8+Cjwvc3ZnPgo=" 
                      alt="Broken favicon" 
                      className="w-4 h-4"
                      style={{ display: result.favicon ? 'none' : 'block' }}
                    />
                    <span className="text-sm text-blue-600 hover:underline cursor-pointer">
                      {result.finalUrl}
                    </span>
                    <span className="text-xs text-gray-500">▼</span>
                  </div>
                  <h2 className="text-xl text-blue-600 hover:underline cursor-pointer mb-1">
                    {result.title || 'No title found'}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {result.description || 'No description found'}
                  </p>
                </div>
              </div>

              {/* Mobile Preview */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Mobile View</h4>
                <div className="border border-gray-200 rounded-lg p-3 bg-white max-w-sm">
                  <div className="flex items-center space-x-2 mb-2">
                    {result.favicon ? (
                      <img 
                        src={result.favicon} 
                        alt="Favicon" 
                        className="w-3 h-3"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          if (e.currentTarget.nextElementSibling) {
                            (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block'
                          }
                        }}
                      />
                    ) : null}
                    <img 
                      src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTggMTZMMCA4TDIuODI4IDUuMTcyTDggMTAuMzQ0TDEzLjE3MiA1LjE3MkwxNiA4TDggMTZaIiBmaWxsPSIjRkZCNzAwIi8+Cjwvc3ZnPgo=" 
                      alt="Broken favicon" 
                      className="w-3 h-3"
                      style={{ display: result.favicon ? 'none' : 'block' }}
                    />
                    <span className="text-xs text-blue-600 hover:underline cursor-pointer truncate">
                      {result.finalUrl}
                    </span>
                  </div>
                  <h2 className="text-sm text-blue-600 hover:underline cursor-pointer mb-1 line-clamp-2">
                    {result.title || 'No title found'}
                  </h2>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {result.description || 'No description found'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Overall Score */}
          {result.score !== undefined && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Overall SEO Score</h3>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-gray-600">Analysis Complete</span>
                </div>
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${getScoreColor(result.score)} mb-2`}>
                  {result.score}
                </div>
                <div className="text-lg text-gray-600 mb-4">out of 100</div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      result.score >= 80 ? 'bg-green-500' : 
                      result.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO Checks */}
          {result.checks && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">SEO Analysis Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(result.checks).map(([key, check]) => (
                  <div key={key} className={`${getCardBackgroundColor(check.status)} rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow`}>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 capitalize text-sm">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(check.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                          {check.status}
                        </span>
                      </div>
                    </div>

                    {/* Current Status */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-700 mb-2">{check.message}</p>
                      {check.value && (
                        <div className="text-xs text-gray-600 bg-white p-3 rounded-lg border font-mono break-all">
                          {check.value}
                        </div>
                      )}
                    </div>

                    {/* Recommendation Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {check.status === 'pass' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900 mb-1">
                            {check.status === 'pass' ? 'Great Approach' : 'Recommendation'}
                          </p>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {getRecommendation(key, check.status, check.value)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!result && !loading && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-purple-900 mb-2">How to use On-Page SEO Analysis</h3>
          <ul className="text-purple-800 space-y-2">
            <li>• Enter any website URL to analyze its on-page SEO elements</li>
            <li>• Get a comprehensive score and detailed recommendations</li>
            <li>• See how your site appears in Google search results</li>
            <li>• Perfect for SEO optimization and competitive analysis</li>
          </ul>
        </div>
      )}
    </div>
  )
}
