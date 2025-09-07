'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useGlobalSearch } from '@/contexts/GlobalSearchContext'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Search, 
  Globe, 
  FileText,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react'
import GlobalSearchInput from './GlobalSearchInput'
import AuditUsageDisplay from './AuditUsageDisplay'

interface Audit {
  id: string
  userId: string
  url: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  score?: number
  device?: 'mobile' | 'desktop'
}

const tools = [
  {
    id: 'resources-checker',
    name: 'Resources Checker',
    description: 'Analyze website technologies and tools',
    icon: Search,
    color: 'text-blue-600 bg-blue-100',
    gradient: 'from-blue-500 to-blue-600',
    path: '/dashboard/resources-checker'
  },
  {
    id: 'domain-history',
    name: 'Domain History Checker',
    description: 'Check domain registration and history',
    icon: Globe,
    color: 'text-green-600 bg-green-100',
    gradient: 'from-green-500 to-green-600',
    path: '/dashboard/domain-history'
  },
  {
    id: 'onpage-seo',
    name: 'On-Page SEO',
    description: 'Analyze on-page SEO elements',
    icon: FileText,
    color: 'text-purple-600 bg-purple-100',
    gradient: 'from-purple-500 to-purple-600',
    path: '/dashboard/onpage-seo'
  },
  {
    id: 'website-analyzer',
    name: 'Website Analyzer',
    description: 'Comprehensive website analysis',
    icon: BarChart3,
    color: 'text-orange-600 bg-orange-100',
    gradient: 'from-orange-500 to-orange-600',
    path: '/dashboard/website-analyzer'
  }
]

export default function DashboardOverview() {
  const { user, auditUsage } = useAuth()
  const { globalUrl, isValidUrl } = useGlobalSearch()
  const router = useRouter()
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchUserAudits()
    }
  }, [user])

  const fetchUserAudits = async () => {
    if (!user?.id) return

    try {
      const response = await fetch(`/api/auth/audits?userId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setAudits(data.audits || [])
      }
    } catch (error) {
      console.error('Error fetching user audits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToolClick = (toolPath: string) => {
    // Track tool click event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'tool_click', {
        tool_name: toolPath.split('/').pop(),
        page_location: window.location.href,
        custom_parameter_1: 'seo_tool'
      })
    }
    router.push(toolPath as any)
  }

  const recentAudits = audits.slice(0, 3)
  const completedAudits = audits.filter(audit => audit.status === 'completed').length

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-6 lg:p-8 border border-primary-200">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
            <TrendingUp className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Welcome to RIVISO Dashboard
            </h1>
            <p className="text-base lg:text-xl text-gray-700">
              Enter a URL below and choose a tool from the sidebar to start analyzing websites and improving your SEO performance.
            </p>
          </div>
        </div>
      </div>

      {/* Global Search */}
      <div className="px-4 lg:px-0">
        <GlobalSearchInput />
      </div>

      {/* Quick Stats - One Line */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8 w-full sm:w-auto">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 sm:flex-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Audits</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{audits.length}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 sm:flex-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{completedAudits}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 sm:flex-none">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Remaining Today</p>
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {auditUsage?.remainingToday ?? '∞'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SEO Tools Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">SEO Analysis Tools</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon
            return (
              <button
                key={tool.id}
                onClick={() => handleToolClick(tool.path)}
                className="group p-3 lg:p-6 bg-gray-50 hover:bg-white border border-gray-200 hover:border-primary-300 rounded-xl transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex flex-col items-center text-center lg:text-left lg:items-start">
                  <div className={`w-8 h-8 lg:w-12 lg:h-12 ${tool.color} rounded-xl flex items-center justify-center mb-2 lg:mb-4 mx-auto lg:mx-0 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4 lg:h-6 lg:w-6" />
                  </div>
                  <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-1 lg:mb-2 group-hover:text-primary-600 transition-colors">
                    {tool.name}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4 leading-relaxed">
                    {tool.description}
                  </p>
                  <div className="flex items-center text-primary-600 text-xs lg:text-sm font-medium group-hover:text-primary-700">
                    <span>Get Started</span>
                    <ArrowRight className="h-3 w-3 lg:h-4 lg:w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Audits */}
      {recentAudits.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Audits</h2>
          <div className="space-y-3">
            {recentAudits.map((audit) => (
              <div key={audit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    audit.status === 'completed' ? 'bg-green-500' : 
                    audit.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {audit.url}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(audit.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 capitalize">
                    {audit.status}
                  </p>
                  {audit.score && (
                    <p className="text-xs text-gray-500">
                      Score: {audit.score}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
