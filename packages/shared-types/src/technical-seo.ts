/**
 * Technical SEO report types — 15 categories with granular metrics.
 * Used by analyze-url response and Website Analyzer Technical SEO tab.
 */

export type TechnicalSeoMetricStatus = 'pass' | 'warn' | 'fail' | 'info';

export interface TechnicalSeoMetric {
  name: string;
  value: string | number;
  unit?: string;
  status?: TechnicalSeoMetricStatus;
  description?: string;
  /** When true, value is derived/estimated (e.g. from fetch time) rather than measured. */
  estimated?: boolean;
}

export interface TechnicalSeoCategory {
  id: string;
  title: string;
  subtitle?: string;
  metrics: TechnicalSeoMetric[];
}

export interface TechnicalSeoReport {
  categories: TechnicalSeoCategory[];
  summaryScores?: Array<{ name: string; score: number; max: number }>;
}
