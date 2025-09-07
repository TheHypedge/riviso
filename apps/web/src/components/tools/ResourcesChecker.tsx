'use client'

import { useState, useEffect } from 'react'
import { Search, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { useGlobalSearch } from '@/contexts/GlobalSearchContext'
import { useAuth } from '@/contexts/AuthContext'
import GlobalSearchInput from '../GlobalSearchInput'

interface Tool {
  id: string
  name: string
  category: string
  description: string
  confidence: number
  detection_methods: string[]
  evidence: string[]
}

interface ResourcesCheckerResponse {
  status: 'success' | 'error'
  tools_detected: number
  tools: Tool[]
  error?: string
}

export default function ResourcesChecker() {
  const { globalUrl, isValidUrl } = useGlobalSearch()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ResourcesCheckerResponse | null>(null)
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

      const response = await fetch('/api/resources-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fullUrl, userId: user?.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.message || 'An error occurred while analyzing the website')
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'CMS': 'bg-blue-100 text-blue-800',
      'Analytics': 'bg-green-100 text-green-800',
      'E-commerce': 'bg-purple-100 text-purple-800',
      'JavaScript Framework': 'bg-yellow-100 text-yellow-800',
      'SEO': 'bg-orange-100 text-orange-800',
      'Miscellaneous': 'bg-gray-100 text-gray-800',
      'Programming Language': 'bg-indigo-100 text-indigo-800',
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 70) return 'text-yellow-600'
    return 'text-red-600'
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
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Resources Checker</h2>
              <p className="text-sm text-gray-600">Analyze website technologies and tools</p>
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
                  <Search className="h-4 w-4 mr-2" />
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
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analysis Summary</h3>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Analysis Complete</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-primary-600">{result.tools_detected}</div>
                <div className="text-sm text-gray-600">Tools Detected</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.tools.filter(tool => tool.confidence >= 90).length}
                </div>
                <div className="text-sm text-gray-600">High Confidence</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {new Set(result.tools.map(tool => tool.category)).size}
                </div>
                <div className="text-sm text-gray-600">Categories</div>
              </div>
            </div>
          </div>

          {/* Tools List */}
          {result.tools.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Tools</h3>
              <div className="space-y-4">
                {result.tools.map((tool, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-medium text-gray-900">{tool.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(tool.category)}`}>
                            {tool.category}
                          </span>
                          <span className={`text-sm font-medium ${getConfidenceColor(tool.confidence)}`}>
                            {tool.confidence}% confidence
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{tool.description}</p>
                        
                        {/* Detection Methods */}
                        <div className="mb-3">
                          <h5 className="text-sm font-medium text-gray-700 mb-1">Detection Methods:</h5>
                          <div className="flex flex-wrap gap-2">
                            {tool.detection_methods.map((method, methodIndex) => (
                              <span key={methodIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Evidence */}
                        {tool.evidence.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-1">Evidence:</h5>
                            <div className="space-y-1">
                              {tool.evidence.slice(0, 3).map((evidence, evidenceIndex) => (
                                <div key={evidenceIndex} className="text-xs text-gray-600 bg-gray-50 p-2 rounded font-mono">
                                  {evidence}
                                </div>
                              ))}
                              {tool.evidence.length > 3 && (
                                <div className="text-xs text-gray-500">
                                  +{tool.evidence.length - 3} more evidence items
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Tools Detected</h3>
              <p className="text-gray-600">
                No technologies or tools were detected on this website. This could mean the site uses custom solutions or has minimal external dependencies.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!result && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">How to use Resources Checker</h3>
          <ul className="text-blue-800 space-y-2">
            <li>• Enter any website URL to analyze its technologies and tools</li>
            <li>• We'll detect CMS platforms, analytics tools, frameworks, and more</li>
            <li>• Results include confidence levels and detection evidence</li>
            <li>• Perfect for competitive analysis and technology research</li>
          </ul>
        </div>
      )}
    </div>
  )
}
