'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { UserRole, hasPermission, ROLE_DISPLAY_NAMES } from '../../lib/roles'
import { Users, Shield, BarChart3, Settings, Crown, User, ChevronDown, LogOut, TrendingUp, DollarSign, Database, Globe, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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

  if (!user || !hasPermission(user.role as UserRole, 'canAccessAdminPanel')) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
            <Link href="/dashboard" className="text-primary-600 hover:text-primary-700 font-medium">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    )
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
                <span className="ml-4 text-sm text-gray-500">Admin Panel</span>
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
                        <Link
                          href="/admin"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          <Shield className="h-4 w-4 mr-3" />
                          Admin Panel
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
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Manage your RIVISO system and users
            </p>
          </div>

          {/* Admin Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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

          {/* Admin Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* User Management */}
            {hasPermission(user.role as UserRole, 'canManageUsers') && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <Users className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Manage all system users, roles, and permissions
                </p>
                <div className="space-y-2">
                  <Link href="/admin/users" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">View All Users</p>
                    <p className="text-sm text-gray-500">Browse and manage user accounts</p>
                  </Link>
                  <Link href="/admin/users" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">Create New User</p>
                    <p className="text-sm text-gray-500">Add new users to the system</p>
                  </Link>
                </div>
              </div>
            )}

            {/* Role Management */}
            {hasPermission(user.role as UserRole, 'canManageRoles') && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Role Management</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Configure user roles and permissions
                </p>
                <div className="space-y-2">
                  <Link href="/admin/users" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">Manage Roles</p>
                    <p className="text-sm text-gray-500">Configure role permissions</p>
                  </Link>
                  <Link href="/admin/users" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">Assign Roles</p>
                    <p className="text-sm text-gray-500">Change user roles and permissions</p>
                  </Link>
                </div>
              </div>
            )}

            {/* Analytics */}
            {hasPermission(user.role as UserRole, 'canViewAnalytics') && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Analytics</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  View comprehensive system analytics and reports
                </p>
                <div className="space-y-2">
                  <Link href="/dashboard" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">System Analytics</p>
                    <p className="text-sm text-gray-500">View detailed system metrics</p>
                  </Link>
                  <Link href="/dashboard" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">Generate Reports</p>
                    <p className="text-sm text-gray-500">Create custom reports</p>
                  </Link>
                </div>
              </div>
            )}

            {/* Audit Management */}
            {hasPermission(user.role as UserRole, 'canManageAudits') && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <BarChart3 className="h-6 w-6 text-orange-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Audit Management</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Manage and monitor all system audits
                </p>
                <div className="space-y-2">
                  <Link href="/dashboard" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">View All Audits</p>
                    <p className="text-sm text-gray-500">Monitor all system audits</p>
                  </Link>
                  <Link href="/dashboard" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">Export Data</p>
                    <p className="text-sm text-gray-500">Export audit data and reports</p>
                  </Link>
                </div>
              </div>
            )}

            {/* Billing Management */}
            {hasPermission(user.role as UserRole, 'canManageBilling') && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-6 w-6 text-yellow-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">Billing Management</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  Manage subscriptions, payments, and billing
                </p>
                <div className="space-y-2">
                  <Link href="/dashboard" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">Billing Overview</p>
                    <p className="text-sm text-gray-500">View revenue and subscriptions</p>
                  </Link>
                  <Link href="/dashboard" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <p className="font-medium text-gray-900">Manage Subscriptions</p>
                    <p className="text-sm text-gray-500">Handle user subscriptions</p>
                  </Link>
                </div>
              </div>
            )}

            {/* System Settings */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <div className="flex items-center mb-4">
                <Settings className="h-6 w-6 text-gray-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">System Settings</h3>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Configure system-wide settings and preferences
              </p>
              <div className="space-y-2">
                <Link href="/dashboard" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-gray-900">General Settings</p>
                  <p className="text-sm text-gray-500">Configure system preferences</p>
                </Link>
                <Link href="/dashboard" className="block w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <p className="font-medium text-gray-900">Security Settings</p>
                  <p className="text-sm text-gray-500">Manage security configurations</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent System Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">New user registration</p>
                    <p className="text-sm text-gray-500">john.doe@example.com - 2 minutes ago</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    User
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">System backup completed</p>
                    <p className="text-sm text-gray-500">Automated backup - 1 hour ago</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                    System
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Role updated for user</p>
                    <p className="text-sm text-gray-500">jane.smith@example.com - 3 hours ago</p>
                  </div>
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                    Admin
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
