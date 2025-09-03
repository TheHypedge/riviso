'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { User, Calendar, BarChart3, Settings, LogOut, Crown, Zap, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

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

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      fetchUserAudits()
    }
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchUserAudits = async () => {
    try {
      const response = await fetch(`/api/auth/audits?userId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setAudits(data.audits || [])
      }
    } catch (error) {
      console.error('Error fetching audits:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro': return 'text-purple-600 bg-purple-100'
      case 'enterprise': return 'text-blue-600 bg-blue-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro': return <Crown className="h-4 w-4" />
      case 'enterprise': return <Zap className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Link href="/" className="text-2xl font-bold text-primary-600">
                  RIVISO
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-600">
                        {user.firstName?.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <div className="py-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <User className="h-4 w-4 mr-3" />
                          Dashboard
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
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.firstName}! 👋
            </h1>
            <p className="text-gray-600">
              Here's an overview of your SEO audit dashboard
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Plan Status */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(user.plan)}`}>
                  {getPlanIcon(user.plan)}
                  <span className="ml-2 capitalize">{user.plan} Plan</span>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Current Plan</h3>
              <p className="text-gray-600 text-sm mb-4">
                {user.plan === 'free' && 'You have access to basic SEO audits'}
                {user.plan === 'pro' && 'You have access to advanced features and unlimited audits'}
                {user.plan === 'enterprise' && 'You have access to all features and priority support'}
              </p>
              {user.plan === 'free' && (
                <Link
                  href="/pricing"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Upgrade to Pro
                  <Zap className="h-4 w-4 ml-1" />
                </Link>
              )}
            </div>

            {/* Audits Used */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {audits.length}/{user.auditsLimit}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Audits Used</h3>
              <p className="text-gray-600 text-sm mb-4">
                {audits.length} of {user.auditsLimit} audits completed this month
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(audits.length / user.auditsLimit) * 100}%` }}
                />
              </div>
            </div>

            {/* Account Age */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold text-gray-900">
                  {Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Days Active</h3>
              <p className="text-gray-600 text-sm">
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Audits */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Audits</h3>
              <div className="space-y-3">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="text-sm text-gray-500 mt-2">Loading audits...</p>
                  </div>
                ) : audits.length > 0 ? (
                  audits.slice(0, 5).map((audit) => (
                    <div key={audit.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{audit.url}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(audit.createdAt).toLocaleDateString()} at {new Date(audit.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        audit.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : audit.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {audit.status.charAt(0).toUpperCase() + audit.status.slice(1)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No audits yet</p>
                    <Link
                      href="/"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Start Your First Audit
                      <Zap className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                )}
                {audits.length > 0 && (
                  <div className="text-center py-4">
                    <Link
                      href="/"
                      className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Start New Audit
                      <Zap className="h-4 w-4 ml-1" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Profile Information</p>
                    <p className="text-sm text-gray-500">Update your personal details</p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Edit
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Password & Security</p>
                    <p className="text-sm text-gray-500">Change your password</p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Change
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Billing & Subscription</p>
                    <p className="text-sm text-gray-500">Manage your subscription</p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Manage
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Notifications</p>
                    <p className="text-sm text-gray-500">Email and push notifications</p>
                  </div>
                  <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
