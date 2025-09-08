'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'
import { 
  BarChart3, 
  Search, 
  Globe, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  User,
  Shield,
  Crown,
  Users,
  Home,
  Bell,
  HelpCircle,
  ArrowLeft,
  Database,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import logoImage from '@/assets/riviso.png'

// Import tool components
import ResourcesChecker from './tools/ResourcesChecker'
import DomainHistoryChecker from './tools/DomainHistoryChecker'
import OnPageSEO from './tools/OnPageSEO'
import WebsiteAnalyzer from './tools/WebsiteAnalyzer'
import GlobalSearchInput from './GlobalSearchInput'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  createdAt: string
  plan: 'free' | 'pro' | 'enterprise'
  auditsUsed: number
  auditsLimit: number
  role: 'super_admin' | 'admin' | 'manager' | 'user'
}

interface DashboardLayoutProps {
  user: User
  logout: () => void
  children?: React.ReactNode
}

type ToolType = 'overview' | 'resources-checker' | 'domain-history' | 'onpage-seo' | 'website-analyzer' | 'data-insights'

const tools = [
  {
    id: 'resources-checker' as ToolType,
    name: 'Resources Checker',
    description: 'Analyze website technologies and tools',
    icon: Search,
    color: 'text-blue-600 bg-blue-100',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'domain-history' as ToolType,
    name: 'Domain History Checker',
    description: 'Check domain registration and history',
    icon: Globe,
    color: 'text-green-600 bg-green-100',
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 'onpage-seo' as ToolType,
    name: 'On-Page SEO',
    description: 'Analyze on-page SEO elements',
    icon: FileText,
    color: 'text-purple-600 bg-purple-100',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    id: 'website-analyzer' as ToolType,
    name: 'Website Analyzer',
    description: 'Comprehensive website analysis',
    icon: BarChart3,
    color: 'text-orange-600 bg-orange-100',
    gradient: 'from-orange-500 to-orange-600'
  }
]

export default function DashboardLayout({ user, logout, children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // Determine active tool based on current path
  const getActiveTool = (): ToolType => {
    if (pathname === '/dashboard') return 'overview'
    if (pathname === '/dashboard/resources-checker') return 'resources-checker'
    if (pathname === '/dashboard/domain-history') return 'domain-history'
    if (pathname === '/dashboard/onpage-seo') return 'onpage-seo'
    if (pathname === '/dashboard/website-analyzer') return 'website-analyzer'
    if (pathname === '/data-insights') return 'data-insights'
    return 'overview'
  }

  const activeTool = getActiveTool()

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false)
    }
    return () => {
      // Cleanup if needed
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown) {
        const target = event.target as HTMLElement
        if (!target.closest('[data-dropdown]')) {
          setShowUserDropdown(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showUserDropdown])

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin': return <Crown className="h-4 w-4" />
      case 'admin': return <Shield className="h-4 w-4" />
      case 'manager': return <Users className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'text-purple-600 bg-purple-100'
      case 'admin': return 'text-blue-600 bg-blue-100'
      case 'manager': return 'text-green-600 bg-green-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'text-purple-600 bg-purple-100'
      case 'pro': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const renderTool = () => {
    switch (activeTool) {
      case 'resources-checker':
        return <ResourcesChecker />
      case 'domain-history':
        return <DomainHistoryChecker />
      case 'onpage-seo':
        return <OnPageSEO />
      case 'website-analyzer':
        return <WebsiteAnalyzer />
      case 'data-insights':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Database className="h-8 w-8 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Data Insights</h2>
            <p className="text-gray-600 mb-6">Redirecting to Data Insights page...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        )
      case 'overview':
      default:
        return (
          <div className="max-w-6xl mx-auto px-4 lg:px-0">
            <div className="text-center py-6 lg:py-12">
              {/* Mobile-optimized welcome section */}
              <div className="w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-6">
                <Home className="h-8 w-8 lg:h-12 lg:w-12 text-white" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 lg:mb-4">Welcome to RIVISO Dashboard</h2>
              <p className="text-base lg:text-xl text-gray-600 mb-6 lg:mb-8 max-w-2xl mx-auto px-4">
                Enter a URL below and choose a tool from the sidebar to start analyzing websites and improving your SEO performance.
              </p>
              
              {/* Global Search Input - Mobile optimized */}
              <div className="mb-8 lg:mb-12 px-4">
                <GlobalSearchInput />
              </div>
              
              {/* Mobile-optimized tool grid - 2x2 for mobile, 4 columns for desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 max-w-4xl mx-auto">
                {tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <button
                      key={tool.id}
                      onClick={() => router.push(`/dashboard/${tool.id}` as any)}
                      className="group p-3 lg:p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                    >
                      <div className={`w-8 h-8 lg:w-12 lg:h-12 bg-gradient-to-br ${tool.gradient} rounded-lg flex items-center justify-center mb-2 lg:mb-4 group-hover:scale-110 transition-transform duration-300 mx-auto lg:mx-0`}>
                        <Icon className="h-4 w-4 lg:h-6 lg:w-6 text-white" />
                      </div>
                      <h3 className="text-sm lg:text-lg font-semibold text-gray-900 mb-1 lg:mb-2 text-center lg:text-left">{tool.name}</h3>
                      <p className="text-xs lg:text-sm text-gray-600 leading-relaxed text-center lg:text-left">{tool.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            {activeTool !== 'overview' && (
              <button
                onClick={() => router.push('/dashboard')}
                className="group flex items-center space-x-1 px-2 py-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm font-medium">Back</span>
              </button>
            )}
            <div className="flex items-center">
              <Image 
                src={logoImage} 
                alt="RIVISO" 
                width={28} 
                height={28} 
                className="mr-2 rounded-lg shadow-lg"
              />
              <span className="text-lg font-bold text-primary-600">RIVISO</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <div className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          fixed lg:relative
          inset-y-0 left-0 z-50
          w-72 lg:w-64 
          bg-white shadow-xl lg:shadow-lg 
          transform transition-transform duration-300 ease-in-out
          flex flex-col
        `}>
          {/* Logo Section - Only show on mobile */}
          <div className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Image 
                src={logoImage} 
                alt="RIVISO" 
                width={32} 
                height={32} 
                className="mr-3 rounded-lg shadow-lg"
              />
              <span className="text-xl font-bold text-primary-600">RIVISO</span>
            </div>
          </div>

          {/* User Info Section */}
          <div className="px-4 py-3 lg:py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-sm lg:text-lg font-bold text-white">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <div className="flex flex-wrap items-center gap-1 mt-1 lg:mt-2">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1 capitalize">{user.role.replace('_', ' ')}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(user.plan)}`}>
                    {user.plan} Plan
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {user.auditsUsed}/{user.auditsLimit} audits used
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2">
              SEO Tools
            </div>
            
            {/* Overview Button */}
            <button
              onClick={() => {
                router.push('/dashboard')
                setIsMobileMenuOpen(false)
              }}
              className={`w-full flex items-center px-3 py-3 lg:py-3 text-left rounded-xl transition-all duration-200 ${
                activeTool === 'overview'
                  ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <div className="p-2 rounded-lg bg-gray-100 mr-3">
                <Home className="h-4 w-4 lg:h-5 lg:w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Dashboard Overview</p>
                <p className="text-xs text-gray-500">Quick start and navigation</p>
              </div>
            </button>

            {/* Tool Buttons */}
            {tools.map((tool) => {
              const Icon = tool.icon
              const getToolPath = (toolId: string) => {
                switch (toolId) {
                  case 'resources-checker': return '/dashboard/resources-checker'
                  case 'domain-history': return '/dashboard/domain-history'
                  case 'onpage-seo': return '/dashboard/onpage-seo'
                  case 'website-analyzer': return '/dashboard/website-analyzer'
                  default: return '/dashboard'
                }
              }
              
              return (
                <button
                  key={tool.id}
                  onClick={() => {
                    router.push(getToolPath(tool.id))
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-3 text-left rounded-xl transition-all duration-200 group ${
                    activeTool === tool.id
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border border-primary-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-colors ${
                    activeTool === tool.id ? tool.color : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{tool.name}</p>
                    <p className="text-xs text-gray-500 truncate">{tool.description}</p>
                  </div>
                </button>
              )
            })}

            {/* Data Insights Section - Only for Super Admin */}
            {user.role === 'super_admin' && (
              <>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-2 mt-6">
                  Admin Tools
                </div>
                
                <button
                  onClick={() => {
                    router.push('/data-insights')
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center px-3 py-3 text-left rounded-xl transition-all duration-200 group ${
                    activeTool === 'data-insights'
                      ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className={`p-2 rounded-lg mr-3 transition-colors ${
                    activeTool === 'data-insights' ? 'text-purple-600 bg-purple-100' : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <Database className="h-4 w-4 lg:h-5 lg:w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Data Insights</p>
                    <p className="text-xs text-gray-500 truncate">View all audit data and analytics</p>
                  </div>
                  <div className="flex items-center">
                    <Crown className="h-3 w-3 text-purple-500" />
                  </div>
                </button>
              </>
            )}
          </nav>

          {/* Bottom Section */}
          <div className="px-3 py-4 border-t border-gray-200 space-y-1">
            {/* Help & Support */}
            <button className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <HelpCircle className="h-5 w-5 mr-3" />
              <span className="text-sm font-medium">Help & Support</span>
            </button>

            {/* Settings Dropdown */}
            <div className="relative" data-dropdown>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5 mr-3" />
                <span className="text-sm font-medium">Settings</span>
                <ChevronDown className="h-4 w-4 ml-auto" />
              </button>
              
              {showUserDropdown && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2">
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <User className="h-4 w-4 mr-3" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserDropdown(false)}
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    Account Settings
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={() => {
                      logout()
                      setShowUserDropdown(false)
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Desktop Header */}
          <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
            <div className="pl-0 pr-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {activeTool !== 'overview' && (
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="group flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                      <span className="text-sm font-medium">Back to Dashboard</span>
                    </button>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {activeTool === 'overview' ? 'Dashboard Overview' : tools.find(tool => tool.id === activeTool)?.name}
                    </h1>
                    <p className="text-gray-600">
                      {activeTool === 'overview' ? 'Welcome to your SEO analysis dashboard' : tools.find(tool => tool.id === activeTool)?.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                    <Bell className="h-5 w-5" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.plan} Plan • {user.auditsUsed}/{user.auditsLimit} audits used
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-sm font-bold text-white">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Tool Content */}
          <main className="p-3 lg:pl-0 lg:pr-6 lg:py-6 min-h-screen">
            {activeTool === 'overview' ? children : renderTool()}
          </main>
        </div>
      </div>
    </div>
  )
}
