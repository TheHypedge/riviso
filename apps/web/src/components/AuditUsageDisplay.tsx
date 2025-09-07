'use client'

import React from 'react'
import { useAuth } from '../contexts/AuthContext'

interface AuditUsageDisplayProps {
  className?: string
  showLabel?: boolean
  variant?: 'default' | 'compact' | 'detailed'
}

export function AuditUsageDisplay({ 
  className = '', 
  showLabel = true, 
  variant = 'default' 
}: AuditUsageDisplayProps) {
  const { user, auditUsage } = useAuth()

  if (!user || !auditUsage) {
    return null
  }

  const { usedToday, remainingToday, dailyLimit, isUnlimited } = auditUsage

  if (isUnlimited) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span className="text-sm text-gray-600">Daily Audits:</span>
        )}
        <span className="text-sm font-medium text-green-600">
          Unlimited
        </span>
      </div>
    )
  }

  const getUsageColor = () => {
    if (remainingToday === null) return 'text-gray-600'
    if (remainingToday === 0) return 'text-red-600'
    if (remainingToday === 1) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getProgressColor = () => {
    if (remainingToday === 0) return 'bg-red-500'
    if (remainingToday === 1) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-xs text-gray-500">
          {usedToday}/{dailyLimit}
        </span>
        <div className="w-12 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getProgressColor()}`}
            style={{ width: `${(usedToday / dailyLimit) * 100}%` }}
          />
        </div>
      </div>
    )
  }

  if (variant === 'detailed') {
    return (
      <div className={`bg-gray-50 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Daily Audit Usage</span>
          <span className={`text-sm font-medium ${getUsageColor()}`}>
            {remainingToday} remaining
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full ${getProgressColor()}`}
            style={{ width: `${(usedToday / dailyLimit) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{usedToday} used today</span>
          <span>Limit: {dailyLimit}</span>
        </div>
      </div>
    )
  }

  // Default variant
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-gray-600">Daily Audits:</span>
      )}
      <span className={`text-sm font-medium ${getUsageColor()}`}>
        {remainingToday} remaining
      </span>
      <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${getProgressColor()}`}
          style={{ width: `${(usedToday / dailyLimit) * 100}%` }}
        />
      </div>
    </div>
  )
}

export default AuditUsageDisplay

