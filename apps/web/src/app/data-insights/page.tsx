'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Globe, 
  User, 
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

interface AuditData {
  id: string
  url: string
  tool_type: string
  created_at: string
  user_id?: string
  status: string
  performance_score?: number
  seo_score?: number
  accessibility_score?: number
  best_practices_score?: number
}

interface DataInsightsResponse {
  audits: AuditData[]
  total_count: number
  page: number
  per_page: number
  total_pages: number
}

export default function DataInsights() {
  const { user } = useAuth()
  const [audits, setAudits] = useState<AuditData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filterTool, setFilterTool] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toolTypes = [
    { value: 'all', label: 'All Tools' },
    { value: 'website_analyzer', label: 'Website Analyzer' },
    { value: 'onpage_seo', label: 'On-Page SEO' },
    { value: 'resources_checker', label: 'Resources Checker' },
    { value: 'domain_history', label: 'Domain History' }
  ]

  const fetchAudits = async () => {
    setLoading(true)
    setError('')
    
    try {
      console.log('🔍 Fetching audit data...', { user, page, filterTool, sortBy, sortOrder })
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20',
        tool_type: filterTool !== 'all' ? filterTool : '',
        sort_by: sortBy,
        sort_order: sortOrder
      })

      const apiUrl = `/api/audit/data-insights?${params}`
      console.log('📡 API URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      console.log('📊 Response status:', response.status)
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response not OK:', response.status, errorText)
        throw new Error(`Failed to fetch audit data: ${response.status} ${errorText}`)
      }

      const data: DataInsightsResponse = await response.json()
      console.log('📈 Audit data received:', data)
      console.log('📊 Audits array length:', data.audits?.length || 0)
      console.log('📊 Total count:', data.total_count)
      console.log('📊 Audits array:', data.audits)
      
      setAudits(data.audits || [])
      setTotalPages(data.total_pages || 1)
      setTotalCount(data.total_count || 0)
      
      console.log('✅ State updated - audits:', data.audits?.length || 0)
      console.log('✅ Current state after update:', { audits: data.audits?.length || 0, totalCount: data.total_count || 0 })
    } catch (err) {
      console.error('❌ Error fetching data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔄 useEffect triggered', { 
      user: user ? { id: user.id, email: user.email, role: user.role } : null, 
      userRole: user?.role, 
      isSuperAdmin: user?.role === 'super_admin',
      page,
      filterTool,
      sortBy,
      sortOrder,
      loading
    })
    
    // Add a small delay to ensure user is fully loaded
    if (loading) {
      console.log('⏳ Still loading, waiting...')
      return
    }
    
    if (user?.role === 'super_admin') {
      console.log('✅ User is super admin, fetching audits...')
      fetchAudits()
    } else {
      console.log('❌ User is not super admin or not logged in', { user, role: user?.role })
    }
  }, [user, page, filterTool, sortBy, sortOrder, loading])

  const toggleRowExpansion = (auditId: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(auditId)) {
      newExpanded.delete(auditId)
    } else {
      newExpanded.add(auditId)
    }
    setExpandedRows(newExpanded)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'website_analyzer':
        return <BarChart3 className="h-4 w-4 text-blue-600" />
      case 'onpage_seo':
        return <Search className="h-4 w-4 text-green-600" />
      case 'resources_checker':
        return <Filter className="h-4 w-4 text-purple-600" />
      case 'domain_history':
        return <Globe className="h-4 w-4 text-orange-600" />
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />
    }
  }

  const getToolLabel = (toolType: string) => {
    const tool = toolTypes.find(t => t.value === toolType)
    return tool ? tool.label : toolType
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    if (score >= 50) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">This page is only accessible to Super Administrators.</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Data Insights</h1>
                <p className="text-gray-600 mt-2">View all website analysis data and usage statistics</p>
                {/* Debug info */}
        <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-md">
          <p className="text-sm text-yellow-800">
            <strong>Debug Info:</strong> User: {user ? `${user.firstName} ${user.lastName}` : 'Not logged in'} | 
            Role: {user?.role || 'Unknown'} | 
            Is Super Admin: {user?.role === 'super_admin' ? 'Yes' : 'No'} | 
            Loading: {loading ? 'Yes' : 'No'} | 
            Audits Count: {audits.length}
          </p>
          <p className="text-sm text-yellow-800 mt-2">
            <strong>User Object:</strong> {user ? JSON.stringify(user, null, 2) : 'null'}
          </p>
          <p className="text-sm text-yellow-800 mt-2">
            <strong>LocalStorage Token:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('token') ? 'Present' : 'Not found') : 'SSR'}
          </p>
          <p className="text-sm text-yellow-800 mt-2">
            <strong>LocalStorage User:</strong> {typeof window !== 'undefined' ? (localStorage.getItem('user') ? 'Present' : 'Not found') : 'SSR'}
          </p>
        </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={fetchAudits}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => {
                    console.log('🧪 Manual test button clicked')
                    fetchAudits()
                  }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Fetch
                </button>
                <button
                  onClick={async () => {
                    console.log('🔐 Testing login...')
                    try {
                      const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: 'test@admin.com', password: 'admin123' })
                      })
                      const data = await response.json()
                      if (response.ok) {
                        console.log('✅ Login successful:', data.user)
                        localStorage.setItem('token', data.token)
                        localStorage.setItem('user', JSON.stringify(data.user))
                        window.location.reload()
                      } else {
                        console.error('❌ Login failed:', data.message)
                      }
                    } catch (error) {
                      console.error('❌ Login error:', error)
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Login Test
                </button>
                <button
                  onClick={async () => {
                    console.log('🧪 Direct API test...')
                    try {
                      const response = await fetch('/api/audit/data-insights')
                      const data = await response.json()
                      console.log('📊 Direct API response:', data)
                      console.log('📊 Audits count:', data.audits?.length || 0)
                      
                      // Update state directly
                      setAudits(data.audits || [])
                      setTotalCount(data.total_count || 0)
                      setTotalPages(data.total_pages || 1)
                      console.log('✅ State updated directly')
                    } catch (error) {
                      console.error('❌ Direct API error:', error)
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Direct API
                </button>
                <button
                  onClick={() => {
                    console.log('🧪 Setting test data...')
                    const testData = [
                      {
                        id: 'test-1',
                        url: 'https://test.com',
                        tool_type: 'website_analyzer',
                        created_at: new Date().toISOString(),
                        user_id: '1',
                        status: 'success',
                        performance_score: 85,
                        seo_score: 90,
                        accessibility_score: 80,
                        best_practices_score: 75
                      }
                    ]
                    setAudits(testData)
                    setTotalCount(1)
                    setTotalPages(1)
                    console.log('✅ Test data set:', testData)
                  }}
                  className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test Data
                </button>
                <button
                  onClick={() => {
                    console.log('🔄 Manual fetch triggered...')
                    console.log('Current user:', user)
                    console.log('Current loading:', loading)
                    if (user?.role === 'super_admin') {
                      fetchAudits()
                    } else {
                      console.log('❌ User is not super admin')
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Manual Fetch
                </button>
                <button
                  onClick={async () => {
                    console.log('🧪 Testing database...')
                    try {
                      const response = await fetch('/api/test-db')
                      const data = await response.json()
                      console.log('📊 Database test result:', data)
                    } catch (error) {
                      console.error('❌ Database test error:', error)
                    }
                  }}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Test DB
                </button>
                <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Audits</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCount.toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unique Websites</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Set(audits.map(a => a.url)).size}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Audits</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {audits.filter(a => {
                      const today = new Date().toDateString()
                      return new Date(a.created_at).toDateString() === today
                    }).length}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg. Score</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {audits.length > 0 
                      ? Math.round(audits.reduce((sum, a) => sum + (a.performance_score || 0), 0) / audits.length)
                      : 0
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Filter by Tool:</label>
                <select
                  value={filterTool}
                  onChange={(e) => setFilterTool(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {toolTypes.map(tool => (
                    <option key={tool.value} value={tool.value}>{tool.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="created_at">Date</option>
                  <option value="url">URL</option>
                  <option value="tool_type">Tool Type</option>
                  <option value="performance_score">Performance Score</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Order:</label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary-600" />
                <span className="ml-2 text-gray-600">Loading audit data...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Data</h3>
                  <p className="text-gray-600 mb-4">{error}</p>
                  <button
                    onClick={fetchAudits}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : audits.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Found</h3>
                  <p className="text-gray-600">No audit data available for the selected filters.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Website URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tool Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Scores
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {audits.map((audit) => (
                      <tr key={audit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                {audit.url}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {audit.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getToolIcon(audit.tool_type)}
                            <span className="ml-2 text-sm text-gray-900">
                              {getToolLabel(audit.tool_type)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600">
                                {audit.user_id === '1' ? 'AS' : audit.user_id?.slice(0, 2).toUpperCase() || 'GU'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {audit.user_id === '1' ? 'Akhilesh Soni' : `User ${audit.user_id}`}
                              </div>
                              <div className="text-sm text-gray-500">
                                {audit.user_id === '1' ? 'Super Admin' : 'User'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{formatDate(audit.created_at)}</div>
                            <div className="text-gray-500 text-xs">
                              {new Date(audit.created_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            {audit.performance_score !== undefined && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(audit.performance_score)}`}>
                                P: {audit.performance_score}
                              </span>
                            )}
                            {audit.seo_score !== undefined && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(audit.seo_score)}`}>
                                SEO: {audit.seo_score}
                              </span>
                            )}
                            {audit.accessibility_score !== undefined && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(audit.accessibility_score)}`}>
                                A: {audit.accessibility_score}
                              </span>
                            )}
                            {audit.best_practices_score !== undefined && (
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(audit.best_practices_score)}`}>
                                BP: {audit.best_practices_score}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            audit.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {audit.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleRowExpansion(audit.id)}
                              className="text-primary-600 hover:text-primary-900 flex items-center"
                            >
                              {expandedRows.has(audit.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                            <a
                              href={audit.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(page * 20, totalCount)}</span> of{' '}
                      <span className="font-medium">{totalCount}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i))
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === page
                                ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => setPage(Math.min(totalPages, page + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
