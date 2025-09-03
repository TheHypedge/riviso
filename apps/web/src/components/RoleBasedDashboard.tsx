'use client'

import { UserRole, getUserPermissions, ROLE_DISPLAY_NAMES } from '@/lib/roles'
import { User, Calendar, BarChart3, Settings, LogOut, Crown, Zap, ChevronDown, Users, Shield, TrendingUp, FileText, DollarSign, Database, Globe } from 'lucide-react'
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

interface RoleBasedDashboardProps {
  user: User
  audits: Audit[]
  loading: boolean
  logout: () => void
}

export default function RoleBasedDashboard({ user, audits, loading, logout }: RoleBasedDashboardProps) {
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const permissions = getUserPermissions(user.role as UserRole)

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

  const renderSuperAdminDashboard = () => (
    <div className="space-y-8">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">1,247</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
          <p className="text-gray-600 text-sm">+12% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">8,432</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Audits</h3>
          <p className="text-gray-600 text-sm">+28% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <span className="text-2xl font-bold text-gray-900">$24,580</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Revenue</h3>
          <p className="text-gray-600 text-sm">+15% from last month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">94.2%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Uptime</h3>
          <p className="text-gray-600 text-sm">Last 30 days</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Management</h3>
          <div className="space-y-3">
            <Link href="/admin/users" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">User Management</p>
                <p className="text-sm text-gray-500">Manage all system users and roles</p>
              </div>
            </Link>
            <Link href="/dashboard" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">System Analytics</p>
                <p className="text-sm text-gray-500">View comprehensive system metrics</p>
              </div>
            </Link>
            <Link href="/dashboard" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <DollarSign className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Billing Management</p>
                <p className="text-sm text-gray-500">Manage subscriptions and payments</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">New user registration</p>
                <p className="text-sm text-gray-500">2 minutes ago</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                User
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">System backup completed</p>
                <p className="text-sm text-gray-500">1 hour ago</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                System
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAdminDashboard = () => (
    <div className="space-y-8">
      {/* Admin Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">247</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Members</h3>
          <p className="text-gray-600 text-sm">Active users in your organization</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">1,432</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Audits</h3>
          <p className="text-gray-600 text-sm">Audits completed this month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">87.3%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Performance</h3>
          <p className="text-gray-600 text-sm">Average audit score</p>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Management</h3>
          <div className="space-y-3">
            <Link href="/admin/users" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Users</p>
                <p className="text-sm text-gray-500">Add, edit, and manage team members</p>
              </div>
            </Link>
            <Link href="/dashboard" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <BarChart3 className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Audit Management</p>
                <p className="text-sm text-gray-500">View and manage all team audits</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics & Reports</h3>
          <div className="space-y-3">
            <Link href="/dashboard" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Team Analytics</p>
                <p className="text-sm text-gray-500">View team performance metrics</p>
              </div>
            </Link>
            <Link href="/dashboard" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <FileText className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Generate Reports</p>
                <p className="text-sm text-gray-500">Create detailed audit reports</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  const renderManagerDashboard = () => (
    <div className="space-y-8">
      {/* Manager Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">12</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Members</h3>
          <p className="text-gray-600 text-sm">Users under your management</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-green-600" />
            <span className="text-2xl font-bold text-gray-900">89</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Audits</h3>
          <p className="text-gray-600 text-sm">Audits completed this month</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold text-gray-900">92.1%</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Performance</h3>
          <p className="text-gray-600 text-sm">Average audit score</p>
        </div>
      </div>

      {/* Manager Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h3>
          <div className="space-y-3">
            <Link href="/dashboard" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Users className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">View Team</p>
                <p className="text-sm text-gray-500">See your team members and their activity</p>
              </div>
            </Link>
            <Link href="/dashboard" className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Team Analytics</p>
                <p className="text-sm text-gray-500">View team performance metrics</p>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Team Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">example.com audit completed</p>
                <p className="text-sm text-gray-500">By John Doe - 2 hours ago</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                Completed
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">mytaupe.com audit started</p>
                <p className="text-sm text-gray-500">By Jane Smith - 1 hour ago</p>
              </div>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                In Progress
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderUserDashboard = () => (
    <div className="space-y-8">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.plan)}`}>
              {getRoleIcon(user.plan)}
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

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900">
              {audits.length}/{permissions.auditLimit === -1 ? '∞' : permissions.auditLimit}
            </span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Audits Used</h3>
          <p className="text-gray-600 text-sm mb-4">
            {audits.length} of {permissions.auditLimit === -1 ? 'unlimited' : permissions.auditLimit} audits completed this month
          </p>
          {permissions.auditLimit !== -1 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(audits.length / permissions.auditLimit) * 100}%` }}
              />
            </div>
          )}
        </div>

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

      {/* User Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Profile Information</p>
                <p className="text-sm text-gray-500">Update your personal details</p>
              </div>
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Edit
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Password & Security</p>
                <p className="text-sm text-gray-500">Change your password</p>
              </div>
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Change
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Billing & Subscription</p>
                <p className="text-sm text-gray-500">Manage your subscription</p>
              </div>
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Manage
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notifications</p>
                <p className="text-sm text-gray-500">Email and push notifications</p>
              </div>
              <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderDashboard = () => {
    switch (user.role) {
      case 'super_admin':
        return renderSuperAdminDashboard()
      case 'admin':
        return renderAdminDashboard()
      case 'manager':
        return renderManagerDashboard()
      default:
        return renderUserDashboard()
    }
  }

  return (
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
                  <div className="text-left">
                    <span className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </span>
                    <div className="flex items-center space-x-1">
                      {getRoleIcon(user.role)}
                      <span className="text-xs text-gray-500">
                        {ROLE_DISPLAY_NAMES[user.role as UserRole]}
                      </span>
                    </div>
                  </div>
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
                      {permissions.canAccessAdminPanel && (
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Shield className="h-4 w-4 mr-3" />
                          Admin Panel
                        </Link>
                      )}
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
            Here's your {ROLE_DISPLAY_NAMES[user.role as UserRole]} dashboard overview
          </p>
        </div>

        {/* Role-based Dashboard Content */}
        {renderDashboard()}
      </div>
    </div>
  )
}
