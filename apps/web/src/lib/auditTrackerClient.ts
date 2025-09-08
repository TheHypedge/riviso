// Client-side audit tracking - calls API endpoints instead of direct database access

export interface AuditData {
  id: string
  userId?: string
  url: string
  toolType: string
  status: 'pending' | 'success' | 'error'
  performanceScore?: number
  seoScore?: number
  accessibilityScore?: number
  bestPracticesScore?: number
  device?: string
}

export class AuditTrackerClient {
  static async createAudit(auditData: Omit<AuditData, 'id' | 'status'>): Promise<string> {
    try {
      const response = await fetch('/api/audit/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditData),
      })

      if (!response.ok) {
        throw new Error('Failed to create audit record')
      }

      const result = await response.json()
      return result.auditId
    } catch (error) {
      console.error('Error creating audit record:', error)
      throw new Error('Failed to create audit record')
    }
  }

  static async updateAuditWithScores(
    auditId: string, 
    scores: {
      performanceScore?: number
      seoScore?: number
      accessibilityScore?: number
      bestPracticesScore?: number
    },
    status: 'success' | 'error' = 'success'
  ): Promise<void> {
    try {
      const response = await fetch('/api/audit/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditId,
          scores,
          status
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update audit record')
      }
    } catch (error) {
      console.error('Error updating audit with scores:', error)
      throw new Error('Failed to update audit record')
    }
  }

  static async updateAuditStatus(auditId: string, status: 'success' | 'error'): Promise<void> {
    try {
      const response = await fetch('/api/audit/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auditId,
          status
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update audit status')
      }
    } catch (error) {
      console.error('Error updating audit status:', error)
      throw new Error('Failed to update audit status')
    }
  }

  static async trackWebsiteAnalysis(
    url: string,
    userId?: string,
    toolType: string = 'website_analyzer'
  ): Promise<string> {
    return this.createAudit({
      userId,
      url,
      toolType,
      device: 'desktop'
    })
  }

  static async trackOnPageSEO(
    url: string,
    userId?: string
  ): Promise<string> {
    return this.createAudit({
      userId,
      url,
      toolType: 'onpage_seo',
      device: 'desktop'
    })
  }

  static async trackResourcesCheck(
    url: string,
    userId?: string
  ): Promise<string> {
    return this.createAudit({
      userId,
      url,
      toolType: 'resources_checker',
      device: 'desktop'
    })
  }

  static async trackDomainHistory(
    url: string,
    userId?: string
  ): Promise<string> {
    return this.createAudit({
      userId,
      url,
      toolType: 'domain_history',
      device: 'desktop'
    })
  }
}
