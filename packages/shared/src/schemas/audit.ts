/**
 * Zod schemas for SEO Audit Platform validation
 */

import { z } from 'zod'

// Audit request schema
export const AuditRequestSchema = z.object({
  url: z.string().url('Invalid URL format'),
  options: z.object({
    include_sitemap: z.boolean().optional().default(false),
    max_sitemap_urls: z.number().int().min(1).max(50).optional().default(5),
    timeout: z.number().int().min(30).max(600).optional().default(300),
    max_redirects: z.number().int().min(1).max(10).optional().default(5),
    user_agent: z.string().min(1).max(200).optional(),
  }).optional(),
})

// Audit status schema
export const AuditStatusSchema = z.enum(['pending', 'running', 'completed', 'failed'])

// Rule status schema
export const RuleStatusSchema = z.enum(['pass', 'fail', 'warning', 'error'])

// Impact level schema
export const ImpactLevelSchema = z.enum(['high', 'medium', 'low'])

// Audit scores schema
export const AuditScoresSchema = z.object({
  overall: z.number().int().min(0).max(100),
  on_page: z.number().int().min(0).max(100),
  technical: z.number().int().min(0).max(100),
  content: z.number().int().min(0).max(100),
})

// Rule result schema
export const RuleResultSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  status: RuleStatusSchema,
  score: z.number().int().min(0).max(100),
  message: z.string().min(1),
  evidence: z.string().optional(),
  weight: z.number().int().min(1).max(10),
})

// Top fix schema
export const TopFixSchema = z.object({
  rule_id: z.string().min(1),
  title: z.string().min(1),
  impact: ImpactLevelSchema,
  description: z.string().min(1),
})

// Page metadata schema
export const PageMetadataSchema = z.object({
  page_title: z.string().optional(),
  meta_description: z.string().optional(),
  h1_count: z.number().int().min(0),
  h2_count: z.number().int().min(0),
  h3_count: z.number().int().min(0),
  images_without_alt: z.number().int().min(0),
  internal_links: z.number().int().min(0),
  external_links: z.number().int().min(0),
  word_count: z.number().int().min(0),
  canonical_url: z.string().optional(),
  robots_meta: z.string().optional(),
})

// Audit response schema
export const AuditResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  status: AuditStatusSchema,
  created_at: z.string().datetime(),
  started_at: z.string().datetime().optional(),
  completed_at: z.string().datetime().optional(),
  options: z.object({
    include_sitemap: z.boolean().optional(),
    max_sitemap_urls: z.number().int().optional(),
    timeout: z.number().int().optional(),
    max_redirects: z.number().int().optional(),
    user_agent: z.string().optional(),
  }).optional(),
  scores: AuditScoresSchema.optional(),
  rules: z.array(RuleResultSchema).optional(),
  top_fixes: z.array(TopFixSchema).optional(),
  metadata: PageMetadataSchema.optional(),
  error_message: z.string().optional(),
  error_details: z.record(z.any()).optional(),
})

// Audit list response schema
export const AuditListResponseSchema = z.object({
  audits: z.array(AuditResponseSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  per_page: z.number().int().min(1).max(100),
})

// Health check response schema
export const HealthCheckResponseSchema = z.object({
  status: z.enum(['healthy', 'unhealthy']),
  timestamp: z.string().datetime(),
  service: z.string().min(1),
  version: z.string().min(1),
  environment: z.string().min(1),
  checks: z.record(z.any()).optional(),
})

// Error response schema
export const ErrorResponseSchema = z.object({
  detail: z.string().min(1),
  request_id: z.string().uuid().optional(),
  error_code: z.string().optional(),
  timestamp: z.string().datetime().optional(),
})

// Note: Type exports are handled in contracts/types.ts to avoid conflicts