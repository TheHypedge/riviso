'use client'

import React, { useState } from 'react'
import { Search, AlertCircle, CheckCircle, X } from 'lucide-react'
import { useGlobalSearch } from '@/contexts/GlobalSearchContext'
import { useAuth } from '@/contexts/AuthContext'
import { AuditUsageDisplay } from './AuditUsageDisplay'

interface GlobalSearchInputProps {
  className?: string
  showUsageDisplay?: boolean
}

export function GlobalSearchInput({ 
  className = '', 
  showUsageDisplay = true 
}: GlobalSearchInputProps) {
  const { globalUrl, setGlobalUrl, isValidUrl, validateUrl, clearGlobalUrl } = useGlobalSearch()
  const { user, auditUsage } = useAuth()
  const [error, setError] = useState('')

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setGlobalUrl(url)
    setError('')
    
    if (url && !validateUrl(url)) {
      setError('Please enter a valid URL (e.g., example.com)')
    }
  }

  const handleClear = () => {
    clearGlobalUrl()
    setError('')
  }

  const normalizeUrl = (url: string): string => {
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }
    return normalizedUrl
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Global URL Search</h3>
          <p className="text-sm text-gray-600">
            Enter a URL once and use it across all SEO tools
          </p>
        </div>
        {globalUrl && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Clear URL"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* URL Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            value={globalUrl}
            onChange={handleUrlChange}
            placeholder="Enter website URL (e.g., example.com)"
            className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors ${
              error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 
              isValidUrl ? 'border-green-300 focus:ring-green-500 focus:border-green-500' : 
              'border-gray-300'
            }`}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {globalUrl && (
              <>
                {isValidUrl ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center text-red-600 text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        )}

        {/* URL Preview */}
        {isValidUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center text-green-800 text-sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              <span className="font-medium">Ready to analyze:</span>
            </div>
            <div className="text-green-700 text-sm mt-1 font-mono">
              {normalizeUrl(globalUrl)}
            </div>
          </div>
        )}

        {/* Audit Usage Display */}
        {showUsageDisplay && user && auditUsage && (
          <div className="border-t border-gray-200 pt-4">
            <AuditUsageDisplay variant="compact" />
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalSearchInput
