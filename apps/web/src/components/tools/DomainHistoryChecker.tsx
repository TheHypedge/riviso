'use client'

import { useState, useEffect } from 'react'
import { Globe, Loader2, CheckCircle, AlertCircle, Calendar, Shield, Server } from 'lucide-react'
import { useGlobalSearch } from '@/contexts/GlobalSearchContext'
import { useAuth } from '@/contexts/AuthContext'
import GlobalSearchInput from '../GlobalSearchInput'
import { AuditTrackerClient } from '@/lib/auditTrackerClient'

interface DomainHistoryResponse {
  status: 'success' | 'error'
  domain: string
  registration_date?: string
  expiration_date?: string
  registrar?: string
  nameservers?: string[]
  domain_status?: string | string[]
  error?: string
}

export default function DomainHistoryChecker() {
  const { globalUrl, isValidUrl } = useGlobalSearch()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DomainHistoryResponse | null>(null)
  const [error, setError] = useState('')

  // Remove auto-analysis - user must click analyze button

  const handleAnalysis = async () => {
    if (!globalUrl || !isValidUrl) return

    setLoading(true)
    setError('')
    setResult(null)

    // Track the audit
    let auditId: string | null = null
    try {
      auditId = await AuditTrackerClient.trackDomainHistory(globalUrl, user?.id)
    } catch (error) {
      console.error('Failed to track audit:', error)
    }

    try {
      // Extract domain from global URL
      let cleanDomain = globalUrl.trim().toLowerCase()
      cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')

      const response = await fetch('/api/domain-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: cleanDomain, userId: user?.id }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        
        // Update audit as successful
        if (auditId) {
          try {
            await AuditTrackerClient.updateAuditStatus(auditId, 'success')
          } catch (error) {
            console.error('Failed to update audit status:', error)
          }
        }
      } else {
        setError(data.message || 'An error occurred while checking domain history')
        
        // Update audit as failed
        if (auditId) {
          try {
            await AuditTrackerClient.updateAuditStatus(auditId, 'error')
          } catch (error) {
            console.error('Failed to update audit status:', error)
          }
        }
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.')
      
      // Update audit as failed
      if (auditId) {
        try {
          await AuditTrackerClient.updateAuditStatus(auditId, 'error')
        } catch (error) {
          console.error('Failed to update audit status:', error)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilExpiration = (expirationDate: string) => {
    const expDate = new Date(expirationDate)
    const today = new Date()
    const diffTime = expDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getExpirationStatus = (expirationDate: string) => {
    const days = getDaysUntilExpiration(expirationDate)
    if (days < 0) return { status: 'expired', color: 'text-red-600 bg-red-100' }
    if (days < 30) return { status: 'expiring soon', color: 'text-orange-600 bg-orange-100' }
    if (days < 90) return { status: 'expiring', color: 'text-yellow-600 bg-yellow-100' }
    return { status: 'active', color: 'text-green-600 bg-green-100' }
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
            <div className="p-2 bg-green-100 rounded-lg">
              <Globe className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Domain History Checker</h2>
              <p className="text-sm text-gray-600">Check domain registration and history details</p>
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
                  <Globe className="h-4 w-4 mr-2" />
                  Check Domain
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
          {/* Domain Info */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Domain Information</h3>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-gray-600">Domain Found</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Domain</h4>
                <p className="text-lg font-mono text-gray-900">{result.domain}</p>
              </div>
              {result.registrar && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Registrar</h4>
                  <p className="text-lg text-gray-900">{result.registrar}</p>
                </div>
              )}
            </div>
          </div>

          {/* Registration Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.registration_date && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Registration Date</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {formatDate(result.registration_date)}
                </p>
                <p className="text-sm text-gray-600">
                  {Math.floor((Date.now() - new Date(result.registration_date).getTime()) / (1000 * 60 * 60 * 24 * 365))} years old
                </p>
              </div>
            )}

            {result.expiration_date && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Expiration Date</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-2">
                  {formatDate(result.expiration_date)}
                </p>
                {(() => {
                  const expStatus = getExpirationStatus(result.expiration_date!)
                  return (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${expStatus.color}`}>
                      {expStatus.status}
                    </span>
                  )
                })()}
              </div>
            )}
          </div>

          {/* Nameservers */}
          {result.nameservers && result.nameservers.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Server className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Nameservers</h3>
              </div>
              <div className="space-y-2">
                {result.nameservers.map((nameserver, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                    <code className="text-sm text-gray-900 font-mono">{nameserver}</code>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Domain Status */}
          {result.domain_status && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Domain Status</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(result.domain_status) ? (
                  result.domain_status.map((status, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                      {status.replace(/_/g, ' ').toLowerCase()}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                    {result.domain_status.replace(/_/g, ' ').toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!result && !loading && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-green-900 mb-2">How to use Domain History Checker</h3>
          <ul className="text-green-800 space-y-2">
            <li>• Enter any domain name to check its registration details</li>
            <li>• View registration date, expiration date, and registrar information</li>
            <li>• Check nameservers and domain status</li>
            <li>• Perfect for domain research and due diligence</li>
          </ul>
        </div>
      )}
    </div>
  )
}
