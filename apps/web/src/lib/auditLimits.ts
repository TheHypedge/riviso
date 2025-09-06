import { dailyAuditUsageQueries, userQueries } from './database'

const DAILY_AUDIT_LIMIT = 3

export interface AuditLimitResult {
  canCreateAudit: boolean
  remainingAudits: number
  dailyLimit: number
  usedToday: number
  message?: string
}

/**
 * Check if a user can create a new audit based on daily limits
 */
export function checkDailyAuditLimit(userId: string): AuditLimitResult {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const now = new Date().toISOString()
  
  // Get user info to check if they have unlimited audits
  const user = userQueries.findById.get(userId)
  if (!user) {
    return {
      canCreateAudit: false,
      remainingAudits: 0,
      dailyLimit: DAILY_AUDIT_LIMIT,
      usedToday: 0,
      message: 'User not found'
    }
  }
  
  // Super admin and enterprise users have unlimited audits
  if (user.role === 'super_admin' || user.plan === 'enterprise') {
    return {
      canCreateAudit: true,
      remainingAudits: -1, // Unlimited
      dailyLimit: -1,
      usedToday: 0
    }
  }
  
  // Check today's usage
  const todayUsage = dailyAuditUsageQueries.getTodayUsage.get(userId, today)
  const usedToday = todayUsage?.auditCount || 0
  
  const canCreateAudit = usedToday < DAILY_AUDIT_LIMIT
  const remainingAudits = Math.max(0, DAILY_AUDIT_LIMIT - usedToday)
  
  return {
    canCreateAudit,
    remainingAudits,
    dailyLimit: DAILY_AUDIT_LIMIT,
    usedToday,
    message: canCreateAudit ? undefined : `Daily audit limit of ${DAILY_AUDIT_LIMIT} reached. Try again tomorrow.`
  }
}

/**
 * Record a new audit usage for a user
 */
export function recordAuditUsage(userId: string): boolean {
  const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
  const now = new Date().toISOString()
  
  // Get user info to check if they have unlimited audits
  const user = userQueries.findById.get(userId)
  if (!user) {
    return false
  }
  
  // Super admin and enterprise users don't need tracking
  if (user.role === 'super_admin' || user.plan === 'enterprise') {
    return true
  }
  
  // Check if today's usage record exists
  const existingUsage = dailyAuditUsageQueries.findByUserAndDate.get(userId, today)
  
  if (existingUsage) {
    // Increment existing record
    dailyAuditUsageQueries.incrementAuditCount.run(now, userId, today)
  } else {
    // Create new record for today
    const usageId = `usage_${userId}_${today}_${Date.now()}`
    dailyAuditUsageQueries.create.run(usageId, userId, today, 1, now, now)
  }
  
  return true
}

/**
 * Get user's audit usage statistics
 */
export function getAuditUsageStats(userId: string): {
  usedToday: number
  remainingToday: number
  dailyLimit: number
  isUnlimited: boolean
} {
  const today = new Date().toISOString().split('T')[0]
  const user = userQueries.findById.get(userId)
  
  if (!user) {
    return {
      usedToday: 0,
      remainingToday: 0,
      dailyLimit: DAILY_AUDIT_LIMIT,
      isUnlimited: false
    }
  }
  
  // Super admin and enterprise users have unlimited audits
  if (user.role === 'super_admin' || user.plan === 'enterprise') {
    return {
      usedToday: 0,
      remainingToday: -1, // Unlimited
      dailyLimit: -1,
      isUnlimited: true
    }
  }
  
  const todayUsage = dailyAuditUsageQueries.getTodayUsage.get(userId, today)
  const usedToday = todayUsage?.auditCount || 0
  const remainingToday = Math.max(0, DAILY_AUDIT_LIMIT - usedToday)
  
  return {
    usedToday,
    remainingToday,
    dailyLimit: DAILY_AUDIT_LIMIT,
    isUnlimited: false
  }
}

/**
 * Clean up old daily usage records (older than 30 days)
 */
export function cleanupOldUsageRecords(): void {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0]
  
  dailyAuditUsageQueries.resetDailyUsage.run(cutoffDate)
}

