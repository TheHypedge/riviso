'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
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
  Users
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import logoImage from '@/assets/riviso.png'

// Import tool components
import ResourcesChecker from './tools/ResourcesChecker'
import DomainHistoryChecker from './tools/DomainHistoryChecker'
import OnPageSEO from './tools/OnPageSEO'
import WebsiteAnalyzer from './tools/WebsiteAnalyzer'

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
}

type ToolType = 'resources-checker' | 'domain-history' | 'onpage-seo' | 'website-analyzer'

const tools = [
  {
    id: 'resources-checker' as ToolType,
    name: 'Resources Checker',
    description: 'Analyze website technologies and tools',
    icon: Search,
    color: 'text-blue-600 bg-blue-100'
  },
  {
    id: 'domain-history' as ToolType,
    name: 'Domain History Checker',
    description: 'Check domain registration and history',
    icon: Globe,
    color: 'text-green-600 bg-green-100'
  },
  {
    id: 'onpage-seo' as ToolType,
    name: 'On-Page SEO',
    description: 'Analyze on-page SEO elements',
    icon: FileText,
    color: 'text-purple-600 bg-purple-100'
  },
  {
    id: 'website-analyzer' as ToolType,
    name: 'Website Analyzer',
    description: 'Comprehensive website analysis',
    icon: BarChart3,
    color: 'text-orange-600 bg-orange-100'
  }
]

export default function DashboardLayout({ user, logout }: DashboardLayoutProps) {
  const [activeTool, setActiveTool] = useState<ToolType>('resources-checker')
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
      default:
        return <ResourcesChecker />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
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
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 p-2 rounded-lg"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0`}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200">
              <Image 
                src={logoImage} 
                alt="RIVISO" 
                width={32} 
                height={32} 
                className="mr-3 rounded-lg shadow-lg"
              />
              <span className="text-xl font-bold text-primary-600">RIVISO</span>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-600">
                    {user.firstName?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center space-x-1">
                    {getRoleIcon(user.role)}
                    <span className="text-xs text-gray-500 capitalize">
                      {user.role.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tools Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                SEO Tools
              </div>
              {tools.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={() => {
                      setActiveTool(tool.id)
                      setIsMobileMenuOpen(false)
                    }}
                    className={`w-full flex items-center px-3 py-3 text-left rounded-lg transition-colors ${
                      activeTool === tool.id
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`p-2 rounded-lg mr-3 ${tool.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{tool.name}</p>
                      <p className="text-xs text-gray-500 truncate">{tool.description}</p>
                    </div>
                  </button>
                )
              })}
            </nav>

            {/* User Dropdown */}
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-full flex items-center px-3 py-2 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Settings className="h-5 w-5 mr-3" />
                  <span className="text-sm font-medium">Settings</span>
                  <ChevronDown className="h-4 w-4 ml-auto" />
                </button>
                
                {showUserDropdown && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="py-1">
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
                      <hr className="my-1" />
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
                  </div>
                )}
              </div>
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
        <div className="flex-1 lg:ml-64">
          {/* Desktop Header */}
          <header className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {tools.find(tool => tool.id === activeTool)?.name}
                  </h1>
                  <p className="text-gray-600">
                    {tools.find(tool => tool.id === activeTool)?.description}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user.plan} Plan • {user.auditsUsed}/{user.auditsLimit} audits used
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {user.firstName?.charAt(0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Tool Content */}
          <main className="p-6">
            {renderTool()}
          </main>
        </div>
      </div>
    </div>
  )
}
