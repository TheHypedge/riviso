'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Loader2, 
  AlertCircle, 
  Calendar,
  Globe,
  Shield,
  Server,
  Mail,
  Phone,
  MapPin,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface DomainInfo {
  domain: string
  status: string
  registered: boolean
  registrationDate?: string
  expirationDate?: string
  lastUpdated?: string
  registrar?: {
    name: string
    url?: string
    whoisServer?: string
  }
  registrant?: {
    name: string
    organization?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    country?: string
    zipCode?: string
  }
  adminContact?: {
    name: string
    organization?: string
    email?: string
    phone?: string
  }
  techContact?: {
    name: string
    organization?: string
    email?: string
    phone?: string
  }
  nameservers?: string[]
  dnsRecords?: {
    type: string
    name: string
    value: string
    ttl?: number
    priority?: number
  }[]
  ipAddress?: string
  domainStatus?: string[]
  rawWhois?: string
  similarDomains?: string[]
}

export default function DomainHistoryChecker() {
  const [domain, setDomain] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [domainInfo, setDomainInfo] = useState<DomainInfo | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'dates', 'registrar']))

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch {
      return dateString
    }
  }

  const checkDomain = async () => {
    if (!domain.trim()) {
      setError('Please enter a domain name')
      return
    }

    setIsLoading(true)
    setError('')
    setDomainInfo(null)

    try {
      const response = await fetch('/api/domain-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domain: domain.trim() }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to fetch domain information')
      }

      const data = await response.json()
      setDomainInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while checking the domain')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkDomain()
    }
  }

  const SectionHeader = ({ title, section, icon: Icon }: { title: string, section: string, icon: any }) => (
    <button
      onClick={() => toggleSection(section)}
      className="flex items-center justify-between w-full p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
    >
      <div className="flex items-center space-x-2">
        <Icon className="h-5 w-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {expandedSections.has(section) ? (
        <ChevronUp className="h-5 w-5 text-gray-600" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-600" />
      )}
    </button>
  )

  const InfoRow = ({ label, value, copyable = false }: { label: string, value: string | undefined, copyable?: boolean }) => {
    if (!value || value === 'N/A') return null
    
    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-sm font-medium text-gray-600 w-1/3">{label}</span>
        <div className="flex items-center space-x-2 w-2/3">
          <span className="text-sm text-gray-900 break-all">{value}</span>
          {copyable && (
            <button
              onClick={() => copyToClipboard(value)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <img src="/riviso.png" alt="RIVISO" className="h-8 w-auto" onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNjM2NkY3Ii8+Cjx0ZXh0IHg9IjUwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UklWSVNPPC90ZXh0Pgo8L3N2Zz4K'
                }} />
                <span className="text-xl font-bold text-gray-900">RIVISO</span>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link href="/features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/services" className="text-gray-600 hover:text-gray-900">Services</Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              <Link href="/resources-checker" className="text-gray-600 hover:text-gray-900">Resources Checker</Link>
              <Link href="/domain-history-checker" className="text-blue-600 font-medium">Domain History</Link>
              <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Start Free Audit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Domain History Checker</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get comprehensive domain information including registration details, ownership history, 
            DNS records, and more - just like who.is
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter domain name (e.g., example.com)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={checkDomain}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
              <span>{isLoading ? 'Checking...' : 'Check Domain'}</span>
            </button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}
        </div>

        {/* Domain Information */}
        {domainInfo && (
          <div className="space-y-6">
            {/* Domain Header */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{domainInfo.domain}</h2>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        {domainInfo.registered ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : domainInfo.status === 'available' ? (
                          <XCircle className="h-5 w-5 text-blue-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-gray-500" />
                        )}
                        <span className={`text-sm font-medium ${
                          domainInfo.registered ? 'text-green-700' : 
                          domainInfo.status === 'available' ? 'text-blue-700' : 
                          'text-gray-700'
                        }`}>
                          {domainInfo.registered ? 'Registered' : 
                           domainInfo.status === 'available' ? 'Available for Registration' : 
                           'Status Unknown'}
                        </span>
                      </div>
                      {domainInfo.ipAddress && (
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">{domainInfo.ipAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => checkDomain()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Refresh data"
                  >
                    <RefreshCw className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Basic Information */}
              <div className="border-b border-gray-200">
                <SectionHeader title="Basic Information" section="basic" icon={Globe} />
                {expandedSections.has('basic') && (
                  <div className="p-6 space-y-4">
                    <InfoRow label="Domain" value={domainInfo.domain} />
                    <InfoRow 
                      label="Status" 
                      value={
                        domainInfo.registered ? 'Registered' : 
                        domainInfo.status === 'available' ? 'Available for Registration' : 
                        domainInfo.status || 'Unknown'
                      } 
                    />
                    <InfoRow label="IP Address" value={domainInfo.ipAddress} copyable />
                    {domainInfo.domainStatus && domainInfo.domainStatus.length > 0 && (
                      <div className="py-2">
                        <span className="text-sm font-medium text-gray-600">Domain Status</span>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {domainInfo.domainStatus.map((status, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {status}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Important Dates */}
              <div className="border-b border-gray-200">
                <SectionHeader title="Important Dates" section="dates" icon={Calendar} />
                {expandedSections.has('dates') && (
                  <div className="p-6 space-y-4">
                    {domainInfo.registered ? (
                      <>
                        <InfoRow label="Registration Date" value={formatDate(domainInfo.registrationDate)} />
                        <InfoRow label="Expiration Date" value={formatDate(domainInfo.expirationDate)} />
                        <InfoRow label="Last Updated" value={formatDate(domainInfo.lastUpdated)} />
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                          {domainInfo.status === 'available' 
                            ? 'This domain is available for registration' 
                            : 'Registration information not available'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Registrar Information */}
              <div className="border-b border-gray-200">
                <SectionHeader title="Registrar Information" section="registrar" icon={Building} />
                {expandedSections.has('registrar') && (
                  domainInfo.registrar ? (
                    <div className="p-6 space-y-4">
                      <InfoRow label="Registrar" value={domainInfo.registrar.name} />
                      <InfoRow label="Registrar URL" value={domainInfo.registrar.url} copyable />
                      <InfoRow label="WHOIS Server" value={domainInfo.registrar.whoisServer} copyable />
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        {domainInfo.status === 'available' 
                          ? 'No registrar information available for unregistered domain' 
                          : 'Registrar information not available'}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Registrant Contact */}
              {domainInfo.registrant && (
                <div className="border-b border-gray-200">
                  <SectionHeader title="Registrant Contact" section="registrant" icon={Shield} />
                  {expandedSections.has('registrant') && (
                    <div className="p-6 space-y-4">
                      <InfoRow label="Name" value={domainInfo.registrant.name} />
                      <InfoRow label="Organization" value={domainInfo.registrant.organization} />
                      <InfoRow label="Email" value={domainInfo.registrant.email} copyable />
                      <InfoRow label="Phone" value={domainInfo.registrant.phone} copyable />
                      <InfoRow label="Address" value={domainInfo.registrant.address} />
                      <InfoRow label="City" value={domainInfo.registrant.city} />
                      <InfoRow label="State" value={domainInfo.registrant.state} />
                      <InfoRow label="Country" value={domainInfo.registrant.country} />
                      <InfoRow label="ZIP Code" value={domainInfo.registrant.zipCode} />
                    </div>
                  )}
                </div>
              )}

              {/* Admin Contact */}
              {domainInfo.adminContact && (
                <div className="border-b border-gray-200">
                  <SectionHeader title="Admin Contact" section="admin" icon={Mail} />
                  {expandedSections.has('admin') && (
                    <div className="p-6 space-y-4">
                      <InfoRow label="Name" value={domainInfo.adminContact.name} />
                      <InfoRow label="Organization" value={domainInfo.adminContact.organization} />
                      <InfoRow label="Email" value={domainInfo.adminContact.email} copyable />
                      <InfoRow label="Phone" value={domainInfo.adminContact.phone} copyable />
                    </div>
                  )}
                </div>
              )}

              {/* Technical Contact */}
              {domainInfo.techContact && (
                <div className="border-b border-gray-200">
                  <SectionHeader title="Technical Contact" section="tech" icon={Server} />
                  {expandedSections.has('tech') && (
                    <div className="p-6 space-y-4">
                      <InfoRow label="Name" value={domainInfo.techContact.name} />
                      <InfoRow label="Organization" value={domainInfo.techContact.organization} />
                      <InfoRow label="Email" value={domainInfo.techContact.email} copyable />
                      <InfoRow label="Phone" value={domainInfo.techContact.phone} copyable />
                    </div>
                  )}
                </div>
              )}

              {/* Nameservers */}
              {domainInfo.nameservers && domainInfo.nameservers.length > 0 && (
                <div className="border-b border-gray-200">
                  <SectionHeader title="Nameservers" section="nameservers" icon={Server} />
                  {expandedSections.has('nameservers') && (
                    <div className="p-6">
                      <div className="space-y-2">
                        {domainInfo.nameservers.map((nameserver, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                            <span className="text-sm text-gray-900 font-mono">{nameserver}</span>
                            <button
                              onClick={() => copyToClipboard(nameserver)}
                              className="p-1 hover:bg-gray-100 rounded transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* DNS Records */}
              {domainInfo.dnsRecords && domainInfo.dnsRecords.length > 0 && (
                <div className="border-b border-gray-200">
                  <SectionHeader title="DNS Records" section="dns" icon={Globe} />
                  {expandedSections.has('dns') && (
                    <div className="p-6">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TTL</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {domainInfo.dnsRecords.map((record, index) => (
                              <tr key={index}>
                                <td className="px-4 py-3 text-sm text-gray-900 font-mono">{record.type}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-mono">{record.name}</td>
                                <td className="px-4 py-3 text-sm text-gray-900 font-mono break-all">{record.value}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{record.ttl || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-900">{record.priority || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Similar Domains */}
              {domainInfo.similarDomains && domainInfo.similarDomains.length > 0 && (
                <div className="border-b border-gray-200">
                  <SectionHeader title="Similar Domains" section="similar" icon={ExternalLink} />
                  {expandedSections.has('similar') && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {domainInfo.similarDomains.map((similarDomain, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-sm text-gray-900 font-mono">{similarDomain}</span>
                            <button
                              onClick={() => copyToClipboard(similarDomain)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Copy to clipboard"
                            >
                              <Copy className="h-4 w-4 text-gray-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Raw WHOIS Data */}
              {domainInfo.rawWhois && (
                <div>
                  <SectionHeader title="Raw WHOIS Data" section="raw" icon={FileText} />
                  {expandedSections.has('raw') && (
                    <div className="p-6">
                      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                        <pre className="whitespace-pre-wrap">{domainInfo.rawWhois}</pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-16 bg-white rounded-lg shadow-sm border p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">What You Get</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Registration History</h3>
              <p className="text-gray-600">Complete domain registration timeline with creation, expiration, and update dates</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Ownership Details</h3>
              <p className="text-gray-600">Registrant, admin, and technical contact information with full contact details</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Server className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">DNS Records</h3>
              <p className="text-gray-600">Complete DNS configuration including A, AAAA, MX, NS, and CNAME records</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Building className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Registrar Info</h3>
              <p className="text-gray-600">Registrar details, WHOIS server information, and domain status</p>
            </div>
            <div className="text-center">
              <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ExternalLink className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Similar Domains</h3>
              <p className="text-gray-600">Discover similar domain names and potential alternatives</p>
            </div>
            <div className="text-center">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Raw WHOIS Data</h3>
              <p className="text-gray-600">Complete raw WHOIS response for technical analysis and verification</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/riviso.png" alt="RIVISO" className="h-8 w-auto" onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiB2aWV3Qm94PSIwIDAgMTAwIDQwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjNjM2NkY3Ii8+Cjx0ZXh0IHg9IjUwIiB5PSIyNSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UklWSVNPPC90ZXh0Pgo8L3N2Zz4K'
                }} />
                <span className="text-xl font-bold">RIVISO</span>
              </div>
              <p className="text-gray-400">Advanced SEO analysis and website optimization tools for better online presence.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Tools</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">SEO Audit</Link></li>
                <li><Link href="/resources-checker" className="text-gray-400 hover:text-white transition-colors">Resources Checker</Link></li>
                <li><Link href="/domain-history-checker" className="text-gray-400 hover:text-white transition-colors">Domain History</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/services" className="text-gray-400 hover:text-white transition-colors">Services</Link></li>
                <li><Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms-conditions" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/refund-cancellation" className="text-gray-400 hover:text-white transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RIVISO. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
