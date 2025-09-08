import { auditQueries } from './database'

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

export class AuditTracker {
  static async createAudit(auditData: Omit<AuditData, 'id' | 'status'>): Promise<string> {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()
    
    try {
      auditQueries.create.run(
        id,
        auditData.userId || null,
        auditData.url,
        auditData.toolType,
        'pending',
        now,
        auditData.device || 'mobile'
      )
      
      return id
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
    const now = new Date().toISOString()
    
    try {
      auditQueries.updateWithScores.run(
        status,
        now,
        scores.performanceScore || null,
        scores.seoScore || null,
        scores.accessibilityScore || null,
        scores.bestPracticesScore || null,
        auditId
      )
    } catch (error) {
      console.error('Error updating audit with scores:', error)
      throw new Error('Failed to update audit record')
    }
  }

  static async updateAuditStatus(auditId: string, status: 'success' | 'error'): Promise<void> {
    const now = new Date().toISOString()
    
    try {
      auditQueries.updateStatus.run(status, now, null, auditId)
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
