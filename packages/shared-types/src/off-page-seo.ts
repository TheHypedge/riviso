/**
 * Link Signals report types (formerly Off-Page SEO).
 * Only includes verified metrics from site crawl and link analysis.
 * No fake metrics, no misleading scores, enterprise-grade accuracy.
 */

export type LinkSignalMetricStatus = 'pass' | 'warn' | 'fail' | 'info';

export type MetricVerification = 'verified' | 'estimated' | 'unavailable';

export interface LinkSignalMetric {
  name: string;
  key?: string;
  value: string | number;
  unit?: string;
  status?: LinkSignalMetricStatus;
  description?: string;
  message?: string;
  /** Verification level: verified (from crawl), estimated (heuristic), unavailable (requires global index) */
  verification?: MetricVerification;
  /** Explanation of data source and limitations */
  dataSource?: string;
}

export interface LinkSignalCategory {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  metrics: LinkSignalMetric[];
}

export interface LinkSignalReport {
  categories: LinkSignalCategory[];
  summaryScores?: Array<{ name: string; score: number; max: number }>;
  /** When true, values are sample/demo data. Connect backlink APIs for live metrics. */
  demoData?: boolean;
  /** Present when data comes from scraper engine. Use to show engine status and verify it ran. */
  engineMeta?: {
    pagesCrawled: number;
    referringDomains: number;
    totalBacklinks: number;
  };
  /** Link summary for quick stats display */
  summary?: {
    totalLinks: number;
    internalLinks: number;
    externalLinks: number;
    uniqueDomains: number;
  };
  /** Data coverage explanation - always visible to users */
  dataCoverage?: {
    scope: string;
    limitations: string[];
    futureRoadmap?: string[];
  };
}

// Legacy type aliases for backward compatibility during migration
export type OffPageSeoMetricStatus = LinkSignalMetricStatus;
export type OffPageSeoMetric = LinkSignalMetric;
export type OffPageSeoCategory = LinkSignalCategory;
export type OffPageSeoReport = LinkSignalReport;
