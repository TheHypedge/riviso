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
      setError('Please enter a valid domain with extension (e.g., example.com, mysite.org)')
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
    <div className={`bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
            <Search className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Global URL Search</h3>
            <p className="text-sm text-gray-600">
              Enter a URL once and use it across all SEO tools
            </p>
          </div>
        </div>
        {globalUrl && (
          <button
            onClick={handleClear}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-110"
            title="Clear URL"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* URL Input */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`h-5 w-5 transition-colors ${
              error ? 'text-red-400' : 
              isValidUrl ? 'text-green-500' : 
              'text-gray-400 group-focus-within:text-primary-500'
            }`} />
          </div>
          <input
            type="url"
            value={globalUrl}
            onChange={handleUrlChange}
            placeholder="Enter domain with extension (e.g., example.com)"
            className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white focus:ring-4 focus:ring-primary-100 focus:border-primary-500 transition-all duration-200 text-gray-900 placeholder-gray-500 ${
              error ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : 
              isValidUrl ? 'border-green-300 focus:ring-green-100 focus:border-green-500' : 
              'border-gray-200 hover:border-gray-300'
            }`}
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            {globalUrl && (
              <>
                {isValidUrl ? (
                  <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
            <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full mr-3">
              <AlertCircle className="h-4 w-4 text-red-600" />
            </div>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* URL Preview */}
        {isValidUrl && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center text-green-800 text-sm mb-2">
              <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full mr-3">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-semibold">Ready to analyze</span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-green-100">
              <div className="text-green-700 text-sm font-mono break-all">
                {normalizeUrl(globalUrl)}
              </div>
            </div>
          </div>
        )}

        {/* Audit Usage Display */}
        {showUsageDisplay && user && auditUsage && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <AuditUsageDisplay variant="compact" />
          </div>
        )}
      </div>
    </div>
  )
}

export default GlobalSearchInput
