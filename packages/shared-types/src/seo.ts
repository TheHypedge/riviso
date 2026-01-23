/**
 * SEO Analysis types
 */

export interface SeoAudit {
  id: string;
  projectId: string;
  url: string;
  score: number;
  issues: SeoIssue[];
  metrics: SeoMetrics;
  recommendations: SeoRecommendation[];
  createdAt: string;
}

export interface SeoIssue {
  type: SeoIssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  affectedPages: string[];
  impact: number;
}

export enum SeoIssueType {
  TECHNICAL = 'technical',
  ON_PAGE = 'on_page',
  CONTENT = 'content',
  PERFORMANCE = 'performance',
  MOBILE = 'mobile',
  SECURITY = 'security',
}

export enum IssueSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export interface SeoMetrics {
  pageSpeed: number;
  mobileUsability: number;
  coreWebVitals: {
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
  };
  indexability: {
    indexed: number;
    blocked: number;
    errors: number;
  };
  backlinks: {
    total: number;
    unique: number;
    quality: number;
  };
}

export interface SeoRecommendation {
  id: string;
  category: string;
  priority: number;
  title: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  actionItems: string[];
}

export interface PageSeoData {
  url: string;
  title: string;
  description: string;
  h1: string[];
  canonicalUrl?: string;
  metaRobots?: string;
  structuredData?: any;
  images: {
    total: number;
    withoutAlt: number;
  };
  links: {
    internal: number;
    external: number;
    broken: number;
  };
}
