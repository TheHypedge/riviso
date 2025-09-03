'use client'

import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { User, Calendar, BarChart3, Settings, LogOut, Crown, Zap } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, logout } = useAuth()

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
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Logout</span>
                </button>
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
                  {user.auditsUsed}/{user.auditsLimit}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Audits Used</h3>
              <p className="text-gray-600 text-sm mb-4">
                {user.auditsUsed} of {user.auditsLimit} audits completed this month
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(user.auditsUsed / user.auditsLimit) * 100}%` }}
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
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">example.com</p>
                    <p className="text-sm text-gray-500">2 hours ago</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">mytaupe.com</p>
                    <p className="text-sm text-gray-500">1 day ago</p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    Completed
                  </span>
                </div>
                <div className="text-center py-4">
                  <Link
                    href="/"
                    className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Start New Audit
                    <Zap className="h-4 w-4 ml-1" />
                  </Link>
                </div>
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
