/**
 * TypeScript type definitions for SEO Audit Platform
 */

export interface AuditRequest {
  url: string
  options?: AuditOptions
}

export interface AuditOptions {
  include_sitemap?: boolean
  max_sitemap_urls?: number
  timeout?: number
  max_redirects?: number
  user_agent?: string
}

export interface AuditResponse {
  id: string
  url: string
  status: AuditStatus
  created_at: string
  started_at?: string
  completed_at?: string
  options?: AuditOptions
  scores?: AuditScores
  rules?: RuleResult[]
  top_fixes?: TopFix[]
  metadata?: PageMetadata
  error_message?: string
  error_details?: Record<string, any>
}

export type AuditStatus = 'pending' | 'running' | 'completed' | 'failed'

export interface AuditScores {
  overall: number
  on_page: number
  technical: number
  content: number
}

export interface RuleResult {
  id: string
  name: string
  category: string
  status: RuleStatus
  score: number
  message: string
  evidence?: string
  weight: number
}

export type RuleStatus = 'pass' | 'fail' | 'warning' | 'error'

export interface TopFix {
  rule_id: string
  title: string
  impact: ImpactLevel
  description: string
}

export type ImpactLevel = 'high' | 'medium' | 'low'

export interface PageMetadata {
  page_title?: string
  meta_description?: string
  h1_count: number
  h2_count: number
  h3_count: number
  images_without_alt: number
  internal_links: number
  external_links: number
  word_count: number
  canonical_url?: string
  robots_meta?: string
}

export interface AuditListResponse {
  audits: AuditResponse[]
  total: number
  page: number
  per_page: number
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  service: string
  version: string
  environment: string
  checks?: Record<string, any>
}

export interface ErrorResponse {
  detail: string
  request_id?: string
  error_code?: string
  timestamp?: string
}
