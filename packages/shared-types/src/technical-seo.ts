/**
 * Technical SEO report types — 15 categories with granular metrics.
 * Used by analyze-url response and Website Analyzer Technical SEO tab.
 */

export type TechnicalSeoMetricStatus = 'pass' | 'warn' | 'fail' | 'info';

export interface TechnicalSeoResource {
  /** Resource URL (e.g., script src, stylesheet href, image src) */
  url: string;
  /** Resource size in bytes (if available) */
  size?: number;
  /** Estimated savings in bytes (if applicable) */
  estimatedSavings?: number;
  /** HTML/CSS/JS snippet where this resource is referenced */
  codeSnippet?: string;
  /** Line number or context where resource is found (optional) */
  context?: string;
  /** Resource type: 'script', 'stylesheet', 'image', 'font', etc. */
  type?: string;
}

export interface TechnicalSeoMetric {
  name: string;
  key?: string;
  value: string | number;
  unit?: string;
  status?: TechnicalSeoMetricStatus;
  description?: string;
  message?: string;
  /** When true, value is derived/estimated (e.g. from fetch time) rather than measured. */
  estimated?: boolean;
  /** Impact level for prioritization (optional, used in summary view) */
  impact?: 'low' | 'medium' | 'high' | 'critical';
  /** Explanation of why this metric matters (optional, used in summary view) */
  whyItMatters?: string;
  /** Number of pages affected (optional) */
  affectedPages?: number;
  /** Fix priority rank 1-10, higher = more urgent (optional) */
  fixPriority?: number;
  /** Resources associated with this metric (for actionable fixes) */
  resources?: TechnicalSeoResource[];
  /** Recommendation text for fixing this issue */
  recommendation?: string;
}

export interface TechnicalSeoCategory {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  metrics: TechnicalSeoMetric[];
  /** Overall status of this category (optional, used in summary view) */
  overallStatus?: 'pass' | 'warn' | 'fail';
  /** Number of critical issues in this category (optional) */
  criticalIssues?: number;
}

export interface TechnicalSeoReport {
  categories: TechnicalSeoCategory[];
  summaryScores?: Array<{ name: string; score: number; max: number }>;
}

/** Advanced Technical SEO diagnostics (hidden by default) - array of categories */
export type TechnicalSeoAdvanced = TechnicalSeoCategory[];
