// Shared audit storage - in production, use a real database
export interface Audit {
  id: string
  userId: string
  url: string
  status: 'pending' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
  score?: number
  device?: 'mobile' | 'desktop'
}

export const audits: Audit[] = []
