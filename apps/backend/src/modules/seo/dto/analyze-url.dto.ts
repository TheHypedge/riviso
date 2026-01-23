import { IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class AnalyzeUrlDto {
  @IsUrl({}, { message: 'Please provide a valid URL' })
  url: string;

  @IsOptional()
  @IsBoolean()
  includeCompetitors?: boolean;

  @IsOptional()
  @IsBoolean()
  includeBacklinks?: boolean;

  @IsOptional()
  @IsBoolean()
  includeKeywords?: boolean;
}

export interface UrlAnalysisResult {
  url: string;
  domain: string;
  metrics: {
    // SEO Metrics
    domainAuthority: number;
    pageAuthority: number;
    trustFlow: number;
    citationFlow: number;
    
    // Traffic Metrics
    monthlyVisits: number;
    avgVisitDuration: number; // in seconds
    bounceRate: number;
    pagesPerSession: number;
    
    // Ranking Metrics
    totalKeywords: number;
    top3Rankings: number;
    top10Rankings: number;
    top100Rankings: number;
    
    // Performance Metrics
    loadTime: number; // in ms
    mobileScore: number;
    desktopScore: number;
    
    // Backlink Metrics
    totalBacklinks: number;
    referringDomains: number;
    
    // Social Signals
    socialShares: number;
  };
  
  topKeywords: Array<{
    keyword: string;
    position: number;
    searchVolume: number;
    difficulty: number;
    url: string;
  }>;
  
  competitors: Array<{
    domain: string;
    commonKeywords: number;
    avgPosition: number;
  }>;
  
  technicalIssues: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: string;
    issue: string;
    impact: string;
  }>;
  
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    recommendation: string;
    estimatedImpact: string;
  }>;
  
  analyzedAt: string;
}
