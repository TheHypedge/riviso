'use client'

import { useState } from 'react'
import { Search, CheckCircle, AlertTriangle, XCircle, Loader2, ExternalLink, Info } from 'lucide-react'
import Link from 'next/link'

interface OnPageResult {
  url: string
  finalUrl: string
  http: {
    status: number
    redirects: number
  }
  onPage: {
    title: {
      present: boolean
      length: number
      text: string
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    metaDescription: {
      present: boolean
      length: number
      text: string
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    metaRobots: {
      content: string | null
      indexable: boolean
      followable: boolean
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    canonical: {
      present: boolean
      href: string | null
      absolute: boolean
      selfReferencing: boolean
      duplicates: string[]
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    h1: {
      count: number
      texts: string[]
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    headings: {
      h2Count: number
      outlineGaps: string[]
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    openGraph: {
      present: boolean
      required: string[]
      absoluteImage: boolean
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    twitter: {
      present: boolean
      required: string[]
      absoluteImage: boolean
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    images: {
      total: number
      missingAlt: number
      large: Array<{ src: string; sizeKB: number }>
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    links: {
      total: number
      internal: number
      external: number
      nofollow: number
      sponsored: number
      ugc: number
      broken: string[]
      mixedContent: number
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    hreflang: {
      count: number
      invalids: string[]
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    structuredData: {
      types: string[]
      errors: string[]
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    favicon: {
      present: boolean
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    language: {
      htmlLang: string | null
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
    charset: {
      present: boolean
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
  }
  score: {
    value: number
    breakdown: Record<string, number>
    weights: Record<string, number>
  }
  version: string
}

export default function OnPageOptimizationPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OnPageResult | null>(null)
  const [error, setError] = useState('')

  // Helper function to safely get analyzer data
  const getAnalyzerData = (analyzerName: keyof OnPageResult['onPage']) => {
    if (!result || !result.onPage || !result.onPage[analyzerName]) {
      return {
        status: 'fail' as const,
        recommendation: 'No data available'
      }
    }
    return result.onPage[analyzerName]
  }

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`/api/onpage?url=${encodeURIComponent(url)}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during analysis')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: 'pass' | 'warn' | 'fail') => {
    switch (status) {
      case 'pass':
        return 'border-green-200 bg-green-50'
      case 'warn':
        return 'border-yellow-200 bg-yellow-50'
      case 'fail':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  const getStatusIcon = (status: 'pass' | 'warn' | 'fail') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'warn':
        return <AlertTriangle className="w-6 h-6 text-yellow-600" />
      case 'fail':
        return <XCircle className="w-6 h-6 text-red-600" />
      default:
        return <Info className="w-6 h-6 text-gray-600" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-orange-600">
                RIVISO
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/features" className="text-gray-700 hover:text-orange-600">
                Features
              </Link>
              <Link href="/services" className="text-gray-700 hover:text-orange-600">
                Services
              </Link>
              <Link href="/pricing" className="text-gray-700 hover:text-orange-600">
                Pricing
              </Link>
              <Link
                href="/"
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
              >
                Start Free Audit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            On-Page SEO Optimization
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Analyze your website's on-page SEO elements including meta tags, headings, images, 
            structured data, and more. Get actionable recommendations to improve your search rankings.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter website URL (e.g., https://example.com)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Overall Score */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Overall Score</h2>
                <div className={`text-4xl font-bold ${getScoreColor(result.score?.value || 0)}`}>
                  {result.score?.value || 0}/100
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full ${
                    (result.score?.value || 0) >= 80 ? 'bg-green-500' : 
                    (result.score?.value || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${result.score?.value || 0}%` }}
                />
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>URL:</strong> {result.url || 'N/A'}</p>
                <p><strong>Final URL:</strong> {result.finalUrl || 'N/A'}</p>
                <p><strong>HTTP Status:</strong> {result.http?.status || 'N/A'}</p>
                <p><strong>Redirects:</strong> {result.http?.redirects || 0}</p>
              </div>
            </div>

            {/* Google SERP Result Preview */}
            {result.onPage && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">How Your Site Appears in Google Search Results</h2>
                
                {/* Desktop View */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                    </svg>
                    Desktop View
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                    <div className="max-w-4xl">
                      {/* Google Search Header */}
                      <div className="flex items-center mb-4 pb-4 border-b border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-sm">G</span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-full px-4 py-2">
                              <span className="text-gray-600">{(result.onPage.title as any)?.text || 'Page Title'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-4">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>
                      </div>

                      {/* Search Result */}
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-4 h-4 mt-1 flex-shrink-0">
                            {result?.finalUrl ? (
                              <img 
                                src={`${result.finalUrl}/favicon.ico`} 
                                alt="Site favicon" 
                                className="w-4 h-4"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling.style.display = 'block'
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-4 h-4 bg-gray-300 rounded-sm"
                              style={{ display: result?.finalUrl ? 'none' : 'block' }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-blue-600 text-xl leading-tight hover:underline cursor-pointer mb-1">
                              {(result.onPage.title as any)?.text || 'Page Title'}
                            </div>
                            <div className="text-green-700 text-sm mb-2">
                              {result?.finalUrl || 'URL not available'}
                            </div>
                            <div className="text-gray-600 text-sm leading-relaxed">
                              {(result.onPage.metaDescription as any)?.text || 'No description available'}
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>📅 {new Date().toLocaleDateString()}</span>
                              <span>🔗 {result?.finalUrl || 'URL'}</span>
                              <span>📊 SEO Score: {result?.score?.value || 0}/100</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile View */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.666.804 4.348A1 1 0 0113 21H7a1 1 0 01-.985-1.986l.804-4.348L6.22 15H4a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                    </svg>
                    Mobile View
                  </h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm max-w-sm mx-auto">
                    <div className="space-y-3">
                      {/* Mobile Search Header */}
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-xs">G</span>
                        </div>
                        <div className="flex-1 bg-gray-100 rounded-full px-3 py-1">
                          <span className="text-gray-600 text-sm">{(result.onPage.title as any)?.text || 'Page Title'}</span>
                        </div>
                      </div>

                      {/* Mobile Search Result */}
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <div className="w-3 h-3 mt-1 flex-shrink-0">
                            {result?.finalUrl ? (
                              <img 
                                src={`${result.finalUrl}/favicon.ico`} 
                                alt="Site favicon" 
                                className="w-3 h-3"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling.style.display = 'block'
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-3 h-3 bg-gray-300 rounded-sm"
                              style={{ display: result?.finalUrl ? 'none' : 'block' }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-blue-600 text-sm leading-tight hover:underline cursor-pointer mb-1">
                              {(result.onPage.title as any)?.text || 'Page Title'}
                            </div>
                            <div className="text-green-700 text-xs mb-1">
                              {result?.finalUrl || 'URL not available'}
                            </div>
                            <div className="text-gray-600 text-xs leading-relaxed">
                              {(result.onPage.metaDescription as any)?.text || 'No description available'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO Analysis Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Analysis Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{result?.score?.value || 0}</div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {Object.values(result.onPage).filter((check: any) => check.status === 'pass').length}
                      </div>
                      <div className="text-sm text-gray-600">Passed Checks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {Object.values(result.onPage).filter((check: any) => check.status === 'fail').length}
                      </div>
                      <div className="text-sm text-gray-600">Failed Checks</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed SEO Tests Grid */}
            {result.onPage && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed SEO Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Title Test */}
                {(() => {
                  const data = getAnalyzerData('title')
                  const titleText = (data as any).text || 'No title found'
                  const titleLength = (data as any).length || 0
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Meta Title</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>Length:</strong> {titleLength} characters
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Status:</strong> {data.status.toUpperCase()}
                          </p>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          <strong>Text:</strong> {titleText}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Meta Description Test */}
                {(() => {
                  const data = getAnalyzerData('metaDescription')
                  const descriptionText = (data as any).text || 'No description found'
                  const descriptionLength = (data as any).length || 0
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Meta Description</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            <strong>Length:</strong> {descriptionLength} characters
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Status:</strong> {data.status.toUpperCase()}
                          </p>
                        </div>
                        
                        <p className="text-sm text-gray-600">
                          <strong>Text:</strong> {descriptionText}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Meta Robots Test */}
                {(() => {
                  const data = getAnalyzerData('metaRobots')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Meta Robots</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Indexable:</strong> {(data as any).indexable ? 'Yes' : 'No'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Followable:</strong> {(data as any).followable ? 'Yes' : 'No'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Content:</strong> {(data as any).content || 'Not found'}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Canonical Test */}
                {(() => {
                  const data = getAnalyzerData('canonical')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Canonical URL</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Present:</strong> {(data as any).present ? 'Yes' : 'No'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Absolute:</strong> {(data as any).absolute ? 'Yes' : 'No'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Self-referencing:</strong> {(data as any).selfReferencing ? 'Yes' : 'No'}
                        </p>
                        {(data as any).href && (
                          <p className="text-sm text-gray-600 break-all">
                            <strong>URL:</strong> {(data as any).href}
                          </p>
                        )}
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* H1 Test */}
                {(() => {
                  const data = getAnalyzerData('h1')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">H1 Tags</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Count:</strong> {(data as any).count || 0}
                        </p>
                        {(data as any).texts?.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <strong>Texts:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {(data as any).texts.map((text: string, index: number) => (
                                <li key={index} className="truncate">{text}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Headings Test */}
                {(() => {
                  const data = getAnalyzerData('headings')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Heading Structure</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>H2 Count:</strong> {(data as any).h2Count || 0}
                        </p>
                        {(data as any).outlineGaps?.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <strong>Outline Gaps:</strong>
                            <ul className="list-disc list-inside mt-1">
                              {(data as any).outlineGaps.map((gap: string, index: number) => (
                                <li key={index}>{gap}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Open Graph Test */}
                {(() => {
                  const data = getAnalyzerData('openGraph')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Open Graph</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Present:</strong> {(data as any).present ? 'Yes' : 'No'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Required Tags:</strong> {(data as any).required?.length || 0}/4
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Absolute Image:</strong> {(data as any).absoluteImage ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Twitter Cards Test */}
                {(() => {
                  const data = getAnalyzerData('twitter')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Twitter Cards</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Present:</strong> {(data as any).present ? 'Yes' : 'No'}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Required Tags:</strong> {(data as any).required?.length || 0}/4
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Absolute Image:</strong> {(data as any).absoluteImage ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Images Test */}
                {(() => {
                  const data = getAnalyzerData('images')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Total:</strong> {(data as any).total || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Missing Alt:</strong> {(data as any).missingAlt || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Large Images:</strong> {(data as any).large?.length || 0}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Links Test */}
                {(() => {
                  const data = getAnalyzerData('links')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Links</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Total:</strong> {(data as any).total || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Internal:</strong> {(data as any).internal || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>External:</strong> {(data as any).external || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Broken:</strong> {(data as any).broken?.length || 0}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Hreflang Test */}
                {(() => {
                  const data = getAnalyzerData('hreflang')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Hreflang</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Count:</strong> {(data as any).count || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Invalid:</strong> {(data as any).invalids?.length || 0}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Structured Data Test */}
                {(() => {
                  const data = getAnalyzerData('structuredData')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Structured Data</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Types Found:</strong> {(data as any).types?.length || 0}
                        </p>
                        {(data as any).types?.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <strong>Types:</strong> {(data as any).types.join(', ')}
                          </div>
                        )}
                        {(data as any).errors?.length > 0 && (
                          <div className="text-sm text-gray-600">
                            <strong>Errors:</strong> {(data as any).errors.length}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Favicon Test */}
                {(() => {
                  const data = getAnalyzerData('favicon')
                  const faviconUrl = result?.finalUrl ? `${result.finalUrl}/favicon.ico` : null
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Favicon</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">
                          <strong>Present:</strong> {(data as any).present ? 'Yes' : 'No'}
                        </p>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600"><strong>Preview:</strong></span>
                          <div className="w-8 h-8 border border-gray-300 rounded flex items-center justify-center bg-gray-50">
                            {faviconUrl ? (
                              <img 
                                src={faviconUrl} 
                                alt="Favicon" 
                                className="w-6 h-6"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none'
                                  e.currentTarget.nextElementSibling.style.display = 'block'
                                }}
                              />
                            ) : null}
                            <div 
                              className="w-6 h-6 text-gray-400 flex items-center justify-center"
                              style={{ display: faviconUrl ? 'none' : 'block' }}
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Language Test */}
                {(() => {
                  const data = getAnalyzerData('language')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Language</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>HTML Lang:</strong> {(data as any).htmlLang || 'Not set'}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}

                {/* Charset Test */}
                {(() => {
                  const data = getAnalyzerData('charset')
                  return (
                    <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(data.status)}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Charset</h3>
                        {getStatusIcon(data.status)}
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <strong>Present:</strong> {(data as any).present ? 'Yes' : 'No'}
                        </p>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{data.recommendation}</p>
                      </div>
                    </div>
                  )
                })()}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}