'use client'

import { useState } from 'react'
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink,
  Globe,
  Settings,
  BarChart3,
  Shield,
  Zap,
  Code,
  Database,
  Tag,
  Layers,
  Activity
} from 'lucide-react'

interface DetectedTool {
  id: string
  name: string
  category: string
  description: string
  confidence: number
  detection_methods: string[]
  evidence: string[]
}

interface ToolDetectionResult {
  status: 'success' | 'error'
  tools_detected: number
  tools: DetectedTool[]
  error?: string
}

export default function ResourcesChecker() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ToolDetectionResult | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Convert simple domain to full URL if needed
      let fullUrl = url.trim()
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = `https://${fullUrl}`
      }
      
      console.log('Submitting URL for analysis:', fullUrl)
      const response = await fetch('/api/resources-checker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: fullUrl }),
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.log('Error response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to analyze website`)
      }

      const data = await response.json()
      console.log('Analysis result:', data)
      setResult(data)
    } catch (err) {
      console.error('Analysis error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'analytics':
        return <BarChart3 className="h-5 w-5" />
      case 'cms':
        return <Database className="h-5 w-5" />
      case 'e-commerce':
        return <Activity className="h-5 w-5" />
      case 'javascript framework':
        return <Code className="h-5 w-5" />
      case 'page builder':
        return <Layers className="h-5 w-5" />
      case 'seo':
        return <Search className="h-5 w-5" />
      case 'tag management':
        return <Tag className="h-5 w-5" />
      case 'font script':
        return <Zap className="h-5 w-5" />
      case 'advertising':
        return <BarChart3 className="h-5 w-5" />
      default:
        return <Settings className="h-5 w-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'analytics':
        return 'bg-blue-100 text-blue-800'
      case 'cms':
        return 'bg-green-100 text-green-800'
      case 'e-commerce':
        return 'bg-purple-100 text-purple-800'
      case 'javascript framework':
        return 'bg-yellow-100 text-yellow-800'
      case 'page builder':
        return 'bg-pink-100 text-pink-800'
      case 'seo':
        return 'bg-orange-100 text-orange-800'
      case 'tag management':
        return 'bg-indigo-100 text-indigo-800'
      case 'font script':
        return 'bg-teal-100 text-teal-800'
      case 'advertising':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800'
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-20 lg:py-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-100 rounded-full opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-100 rounded-full opacity-20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-8">
              <Globe className="h-4 w-4 mr-2" />
              India's #1 Website Resources Checker
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Discover Website
              <span className="text-primary-600 block">Technologies</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Analyze any website to discover the tools, platforms, and technologies it uses. 
              Get instant insights about analytics, CMS, frameworks, and more.
            </p>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-12">
              <div className="flex gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter domain (e.g., example.com)"
                    className="w-full px-6 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-lg"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg font-semibold shadow-lg"
                >
                  {loading ? (
                    <Loader2 className="h-6 w-6 animate-spin" />
                  ) : (
                    <Search className="h-6 w-6" />
                  )}
                  {loading ? 'Analyzing...' : 'Analyze →'}
                </button>
              </div>
            </form>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="bg-primary-100 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-600">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Comprehensive Detection</h3>
                <p className="text-gray-600 text-sm">Identifies analytics, CMS, frameworks, e-commerce platforms, and more using advanced fingerprinting techniques.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="bg-primary-100 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-600">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Analysis</h3>
                <p className="text-gray-600 text-sm">Get instant results in seconds. No waiting for complex SEO audits - just the tools you need to know about.</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="bg-primary-100 rounded-xl w-12 h-12 flex items-center justify-center mx-auto mb-4 text-primary-600">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Detailed Insights</h3>
                <p className="text-gray-600 text-sm">See confidence scores, detection methods, and evidence for each tool found on the website.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Analysis Failed</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Analysis Complete</h3>
                <p className="text-gray-600">
                  Found <span className="font-semibold text-blue-600">{result.tools_detected}</span> tools and platforms on{' '}
                  <span className="font-semibold">{url}</span>
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{result.tools_detected}</div>
                  <div className="text-sm text-gray-600">Total Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {result.tools.filter(t => t.category === 'Analytics').length}
                  </div>
                  <div className="text-sm text-gray-600">Analytics</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {result.tools.filter(t => t.category === 'CMS').length}
                  </div>
                  <div className="text-sm text-gray-600">CMS</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {result.tools.filter(t => t.category === 'JavaScript Framework').length}
                  </div>
                  <div className="text-sm text-gray-600">Frameworks</div>
                </div>
              </div>
            </div>

            {/* Tools List */}
            {result.tools.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Detected Tools & Platforms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {result.tools.map((tool, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${getCategoryColor(tool.category)}`}>
                            {getCategoryIcon(tool.category)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                            <p className="text-sm text-gray-600">{tool.category}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(tool.confidence)}`}>
                          {tool.confidence}%
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
                      
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Detection Methods:</h5>
                          <div className="flex flex-wrap gap-1">
                            {tool.detection_methods.map((method, methodIndex) => (
                              <span key={methodIndex} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                {method}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        {tool.evidence && tool.evidence.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Evidence:</h5>
                            <div className="space-y-1">
                              {tool.evidence.slice(0, 2).map((evidence, evidenceIndex) => (
                                <div key={evidenceIndex} className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                                  <code className="break-all">{evidence}</code>
                                </div>
                              ))}
                              {tool.evidence.length > 2 && (
                                <div className="text-xs text-gray-400">
                                  +{tool.evidence.length - 2} more evidence items
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Tools Found */}
            {result.tools.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Settings className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tools Detected</h3>
                <p className="text-gray-600">
                  Our analysis didn't find any detectable tools or platforms on this website. 
                  This could mean the site uses custom solutions or has minimal third-party integrations.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive Detection</h3>
            <p className="text-gray-600">
              Identifies analytics, CMS, frameworks, e-commerce platforms, and more using advanced fingerprinting techniques.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Fast Analysis</h3>
            <p className="text-gray-600">
              Get instant results in seconds. No waiting for complex SEO audits - just the tools you need to know about.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Insights</h3>
            <p className="text-gray-600">
              See confidence scores, detection methods, and evidence for each tool found on the website.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
