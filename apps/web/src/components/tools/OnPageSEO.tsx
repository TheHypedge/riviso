'use client'

import { useState } from 'react'
import { FileText, Loader2, CheckCircle, AlertCircle, XCircle, Search, Image, Link as LinkIcon } from 'lucide-react'

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
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OnPageResult | null>(null)
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

      const response = await fetch(`/api/onpage?url=${encodeURIComponent(fullUrl)}`)
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-3 bg-purple-100 rounded-lg mr-4">
            <FileText className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">On-Page SEO Analysis</h2>
            <p className="text-gray-600">Analyze on-page SEO elements and optimization</p>
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
                    <FileText className="h-4 w-4 mr-2" />
                    Analyze SEO
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Analysis Results</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(result.checks).map(([key, check]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}>
                        {check.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{check.message}</p>
                    {check.value && (
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded font-mono">
                        {check.value}
                      </div>
                    )}
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
