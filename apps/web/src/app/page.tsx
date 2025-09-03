'use client'

import { useState } from 'react'
import { Search, Loader2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const validateUrl = (inputUrl: string): boolean => {
    try {
      const urlObj = new URL(inputUrl)
      return ['http:', 'https:'].includes(urlObj.protocol)
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    if (!validateUrl(url)) {
      setError('Please enter a valid URL (including http:// or https://)')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/audit/audits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          options: {
            include_sitemap: true,
            max_sitemap_urls: 5,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to start audit')
      }

      const audit = await response.json()
      router.push(`/a/${audit.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            RIVISO - Advanced SEO Analytics
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get comprehensive SEO insights and analytics for your website. Analyze on-page optimization, 
            technical performance, and get actionable recommendations with advanced reporting.
          </p>
        </div>

        <div className="card p-8 max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="input pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-error-600 bg-error-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-3 text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Starting Audit...
                </>
              ) : (
                'Start RIVISO Analysis'
              )}
            </button>
          </form>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Advanced Analytics
            </h3>
            <p className="text-gray-600">
              Get detailed insights into on-page SEO, technical performance, and optimization opportunities with advanced analytics.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-success-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-success-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Actionable Recommendations
            </h3>
            <p className="text-gray-600">
              Receive prioritized fixes and best practices to improve your website's search rankings.
            </p>
          </div>

          <div className="text-center">
            <div className="bg-warning-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="h-8 w-8 text-warning-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fast & Reliable
            </h3>
            <p className="text-gray-600">
              Get results in minutes with our optimized crawling and analysis engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
