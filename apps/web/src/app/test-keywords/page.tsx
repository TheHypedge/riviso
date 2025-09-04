'use client'

import { useState } from 'react'
import { Loader2, Target, AlertCircle, CheckCircle } from 'lucide-react'
import { KeywordsResponse } from '@/lib/keywords/types'

export default function TestKeywordsPage() {
  const [url, setUrl] = useState('https://example.com')
  const [keywords, setKeywords] = useState<KeywordsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeKeywords = async () => {
    if (!url.trim()) return
    
    setLoading(true)
    setError(null)
    setKeywords(null)
    
    try {
      const response = await fetch('/api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setKeywords(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze keywords')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Keywords Analysis Test</h1>
          <p className="text-lg text-gray-600">Test the production-grade On-Page Keywords Analysis feature</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL to analyze..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
            <button
              onClick={analyzeKeywords}
              disabled={loading || !url.trim()}
              className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Analyze
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Analysis Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {keywords && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Analysis Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{keywords.contentTokens}</div>
                  <div className="text-sm text-gray-600">Content Tokens</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{keywords.all.length}</div>
                  <div className="text-sm text-gray-600">Total Keywords</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{keywords.shortTail.length}</div>
                  <div className="text-sm text-gray-600">Short Tail</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{keywords.longTail.length}</div>
                  <div className="text-sm text-gray-600">Long Tail</div>
                </div>
              </div>
            </div>

            {/* Short Tail Keywords */}
            {keywords.shortTail.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Short Tail Keywords (1-2 words)</h2>
                <div className="space-y-3">
                  {keywords.shortTail.slice(0, 20).map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{keyword.keyword}</div>
                        <div className="text-sm text-gray-500">
                          {keyword.frequency} occurrences • {keyword.density}% density • Score: {keyword.score}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Positions: {keyword.positions.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {keyword.labels?.map((label, labelIndex) => (
                          <span
                            key={labelIndex}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              label === 'high' ? 'bg-red-100 text-red-800' :
                              label === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              label === 'good' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Long Tail Keywords */}
            {keywords.longTail.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Long Tail Keywords (3-4 words)</h2>
                <div className="space-y-3">
                  {keywords.longTail.slice(0, 20).map((keyword, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{keyword.keyword}</div>
                        <div className="text-sm text-gray-500">
                          {keyword.frequency} occurrences • {keyword.density}% density • Score: {keyword.score}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Positions: {keyword.positions.join(', ')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {keyword.labels?.map((label, labelIndex) => (
                          <span
                            key={labelIndex}
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              label === 'high' ? 'bg-red-100 text-red-800' :
                              label === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              label === 'good' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Diagnostics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Diagnostics</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-700">Source URL</div>
                  <div className="text-sm text-gray-900">{keywords.sourceUrl}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">HTTP Status</div>
                  <div className="text-sm text-gray-900">{keywords.diagnostics.httpStatus || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Content Size</div>
                  <div className="text-sm text-gray-900">{keywords.diagnostics.bytes ? `${keywords.diagnostics.bytes} bytes` : 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Stripped Tags</div>
                  <div className="text-sm text-gray-900">{keywords.diagnostics.strippedTagsCount}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Robots.txt</div>
                  <div className="text-sm text-gray-900">{keywords.diagnostics.robotsTxt || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700">Sitemap.xml</div>
                  <div className="text-sm text-gray-900">{keywords.diagnostics.sitemapXml || 'N/A'}</div>
                </div>
              </div>
              {keywords.diagnostics.warnings.length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Warnings</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {keywords.diagnostics.warnings.map((warning, index) => (
                      <li key={index} className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
