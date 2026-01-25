/**
 * Off-Page SEO report types — 10 categories per audit framework.
 * Used by analyze-url response and Website Analyzer Off-Page SEO tab.
 */

export type OffPageSeoMetricStatus = 'pass' | 'warn' | 'fail' | 'info';

export interface OffPageSeoMetric {
  name: string;
  value: string | number;
  unit?: string;
  status?: OffPageSeoMetricStatus;
  description?: string;
  /** When true, value requires backlink data (e.g. Majestic, Ahrefs). */
  requiresBacklinkData?: boolean;
}

export interface OffPageSeoCategory {
  id: string;
  title: string;
  subtitle?: string;
  metrics: OffPageSeoMetric[];
}

export interface OffPageSeoReport {
  categories: OffPageSeoCategory[];
  summaryScores?: Array<{ name: string; score: number; max: number }>;
  /** When true, values are sample/demo data. Connect backlink APIs for live metrics. */
  demoData?: boolean;
  /** Present when data comes from scraper engine. Use to show engine status and verify it ran. */
  engineMeta?: {
    pagesCrawled: number;
    referringDomains: number;
    totalBacklinks: number;
  };
}
