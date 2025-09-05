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
    twitterCards: {
      present: boolean
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
      declared: string | null
      status: 'pass' | 'warn' | 'fail'
      recommendation: string
    }
  }
  score: {
    value: number
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
    return result?.onPage?.[analyzerName] || {
      status: 'fail' as const,
      recommendation: 'No data available'
    }
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
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: 'pass' | 'warn' | 'fail') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warn':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />
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
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
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

            {/* SEO Tests Grid */}
            {result.onPage && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Title Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.title?.status || 'fail')}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Meta Title</h3>
                  {getStatusIcon(result.onPage.title?.status || 'fail')}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Length:</strong> {result.onPage.title?.length || 0} characters
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Text:</strong> {result.onPage.title?.text || 'Not found'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {(result.onPage.title?.status || 'fail').toUpperCase()}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.title?.recommendation || 'No data available'}</p>
                </div>
              </div>

              {/* Meta Description Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.metaDescription?.status || 'fail')}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Meta Description</h3>
                  {getStatusIcon(result.onPage.metaDescription?.status || 'fail')}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Length:</strong> {result.onPage.metaDescription?.length || 0} characters
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Text:</strong> {result.onPage.metaDescription?.text || 'Not found'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Status:</strong> {(result.onPage.metaDescription?.status || 'fail').toUpperCase()}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.metaDescription?.recommendation || 'No data available'}</p>
                </div>
              </div>

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
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.canonical.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Canonical URL</h3>
                  {getStatusIcon(result.onPage.canonical.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Present:</strong> {result.onPage.canonical.present ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Absolute:</strong> {result.onPage.canonical.absolute ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Self-referencing:</strong> {result.onPage.canonical.selfReferencing ? 'Yes' : 'No'}
                  </p>
                  {result.onPage.canonical.href && (
                    <p className="text-sm text-gray-600 break-all">
                      <strong>URL:</strong> {result.onPage.canonical.href}
                    </p>
                  )}
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.canonical.recommendation}</p>
                </div>
              </div>

              {/* H1 Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.h1.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">H1 Tags</h3>
                  {getStatusIcon(result.onPage.h1.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Count:</strong> {result.onPage.h1.count}
                  </p>
                  {result.onPage.h1.texts.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Texts:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {result.onPage.h1.texts.map((text, index) => (
                          <li key={index} className="truncate">{text}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.h1.recommendation}</p>
                </div>
              </div>

              {/* Headings Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.headings.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Heading Structure</h3>
                  {getStatusIcon(result.onPage.headings.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>H2 Count:</strong> {result.onPage.headings.h2Count}
                  </p>
                  {result.onPage.headings.outlineGaps.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Outline Gaps:</strong>
                      <ul className="list-disc list-inside mt-1">
                        {result.onPage.headings.outlineGaps.map((gap, index) => (
                          <li key={index}>{gap}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.headings.recommendation}</p>
                </div>
              </div>

              {/* Open Graph Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.openGraph.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Open Graph</h3>
                  {getStatusIcon(result.onPage.openGraph.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Present:</strong> {result.onPage.openGraph.present ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Required Tags:</strong> {result.onPage.openGraph.required.length}/4
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Absolute Image:</strong> {result.onPage.openGraph.absoluteImage ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.openGraph.recommendation}</p>
                </div>
              </div>

              {/* Twitter Cards Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.twitterCards.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Twitter Cards</h3>
                  {getStatusIcon(result.onPage.twitterCards.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Present:</strong> {result.onPage.twitterCards.present ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.twitterCards.recommendation}</p>
                </div>
              </div>

              {/* Images Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.images.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Images</h3>
                  {getStatusIcon(result.onPage.images.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Total:</strong> {result.onPage.images.total}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Missing Alt:</strong> {result.onPage.images.missingAlt}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Large Images:</strong> {result.onPage.images.large.length}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.images.recommendation}</p>
                </div>
              </div>

              {/* Links Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.links.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Links</h3>
                  {getStatusIcon(result.onPage.links.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Total:</strong> {result.onPage.links.total}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Internal:</strong> {result.onPage.links.internal}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>External:</strong> {result.onPage.links.external}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Broken:</strong> {result.onPage.links.broken.length}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.links.recommendation}</p>
                </div>
              </div>

              {/* Structured Data Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.structuredData.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Structured Data</h3>
                  {getStatusIcon(result.onPage.structuredData.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Types Found:</strong> {result.onPage.structuredData.types.length}
                  </p>
                  {result.onPage.structuredData.types.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Types:</strong> {result.onPage.structuredData.types.join(', ')}
                    </div>
                  )}
                  {result.onPage.structuredData.errors.length > 0 && (
                    <div className="text-sm text-gray-600">
                      <strong>Errors:</strong> {result.onPage.structuredData.errors.length}
                    </div>
                  )}
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.structuredData.recommendation}</p>
                </div>
              </div>

              {/* Favicon Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.favicon.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Favicon</h3>
                  {getStatusIcon(result.onPage.favicon.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Present:</strong> {result.onPage.favicon.present ? 'Yes' : 'No'}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.favicon.recommendation}</p>
                </div>
              </div>

              {/* Language Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.language.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Language</h3>
                  {getStatusIcon(result.onPage.language.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>HTML Lang:</strong> {result.onPage.language.htmlLang || 'Not found'}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.language.recommendation}</p>
                </div>
              </div>

              {/* Charset Test */}
              <div className={`bg-white rounded-lg shadow-sm border p-6 ${getStatusColor(result.onPage.charset.status)}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Charset</h3>
                  {getStatusIcon(result.onPage.charset.status)}
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Declared:</strong> {result.onPage.charset.declared || 'Not found'}
                  </p>
                </div>
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{result.onPage.charset.recommendation}</p>
                </div>
              </div>
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
