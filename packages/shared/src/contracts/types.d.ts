// API Contract Types
// These types are generated from the FastAPI OpenAPI spec

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
  requestId?: string;
}

export interface AuditRequest {
  url: string;
  options?: {
    includeSitemap?: boolean;
    maxSitemapUrls?: number;
    ruleset?: string;
  };
}

export interface CreateAuditResponse {
  id: string;
  status: 'pending' | 'running';
  url: string;
  createdAt: string;
}

export interface RuleResult {
  id: string;
  name: string;
  description: string;
  category: 'on-page' | 'technical' | 'performance' | 'security';
  severity: 'error' | 'warning' | 'info';
  passed: boolean;
  score: number;
  evidence: Array<{
    type: 'text' | 'url' | 'code' | 'screenshot';
    content: string;
    location?: string;
  }>;
  recommendations: string[];
}

export interface AuditScores {
  overall: number;
  onPage: number;
  technical: number;
  performance: number;
  security: number;
}

export interface AuditMetadata {
  pageTitle?: string;
  pageDescription?: string;
  wordCount?: number;
  imageCount?: number;
  linkCount?: number;
  loadTime?: number;
  pageSize?: number;
}

export interface TopFix {
  ruleId: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  effort: 'low' | 'medium' | 'high';
}

export interface AuditResult {
  id: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  scores: AuditScores;
  rules: RuleResult[];
  topFixes: TopFix[];
  metadata: AuditMetadata;
}

export interface GetAuditResponse extends AuditResult {}

export interface AuditListItem {
  id: string;
  url: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  scores: {
    overall: number;
  };
}

export interface ListAuditsResponse {
  audits: AuditListItem[];
  total: number;
  page: number;
  limit: number;
}

// Health check types
export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'healthy' | 'unhealthy';
    queue: 'healthy' | 'unhealthy';
  };
}

// Configuration types
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// Utility types
export type AuditStatus = AuditResult['status'];
export type RuleCategory = RuleResult['category'];
export type RuleSeverity = RuleResult['severity'];
export type ImpactLevel = TopFix['impact'];
export type EffortLevel = TopFix['effort'];

