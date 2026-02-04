import type { ScrapedSEOData } from './web-scraper.service';
import type {
  TechnicalSeoCategory,
  TechnicalSeoMetric,
} from '@riviso/shared-types';

function m(
  name: string,
  value: string | number,
  opts?: { unit?: string; status?: TechnicalSeoMetric['status']; description?: string; estimated?: boolean },
): TechnicalSeoMetric {
  return {
    name,
    value,
    ...(opts?.unit && { unit: opts.unit }),
    ...(opts?.status && { status: opts.status }),
    ...(opts?.description && { description: opts.description }),
    ...(opts?.estimated && { estimated: true }),
  };
}

/**
 * Build Advanced Technical SEO Diagnostics
 * 
 * Contains all non-critical metrics that are hidden by default.
 * Only shown when user expands "Advanced Technical Diagnostics" section.
 * 
 * Categories:
 * - JavaScript & Rendering (detailed)
 * - International & Multilingual SEO
 * - Structured Data Diagnostics
 * - Log File Analysis
 * - XML Sitemaps & Discovery
 * - Server & Hosting Performance
 * - Automation & Monitoring
 */
export function buildTechnicalSeoAdvanced(
  data: ScrapedSEOData,
  analyzedUrl: string,
): TechnicalSeoCategory[] {
  const d = data;
  const tech = d.technical;
  const perf = d.performance;
  const mob = d.mobile;
  const sec = d.security;
  const links = d.onPageSEO.links;
  const struct = d.structuredData;
  const raw = d.rawData;

  return [
    // JavaScript & Rendering (Advanced)
    {
      id: 'javascript-rendering-advanced',
      title: 'JavaScript & Rendering',
      subtitle: 'Advanced Technical Layer',
      metrics: [
        m('JS-rendered content indexability', 'N/A', { status: 'info', description: 'Requires render test' }),
        m('DOM size (node count)', raw.domNodeCount, { status: 'info' }),
        m('JS dependency depth', 'N/A', { status: 'info', description: 'Requires dependency graph' }),
        m('Client-side vs server-side rendering ratio', 'N/A', { status: 'info', description: 'Requires render analysis' }),
        m('Deferred vs async script usage', raw.deferAsyncScriptCount > 0 ? `${raw.deferAsyncScriptCount} script(s)` : 'None', { status: raw.deferAsyncScriptCount > 0 ? 'pass' : 'info' }),
        m('Hydration delay', 'N/A', { status: 'info', description: 'Requires SPA detection' }),
        m('Rendered vs raw HTML parity', 'N/A', { status: 'info', description: 'Requires render comparison' }),
        m('SPA crawl compatibility score', 'N/A', { status: 'info', description: 'Requires SPA detection' }),
        m('Lazy-loaded content indexability', perf.lazyLoading.implemented ? 'Implemented' : 'Not detected', { status: perf.lazyLoading.implemented ? 'pass' : 'info' }),
      ],
    },
    // International & Multilingual SEO
    {
      id: 'international-multilingual',
      title: 'International & Multilingual SEO',
      subtitle: 'If Applicable',
      metrics: [
        m('hreflang tag completeness', 'N/A', { status: 'info', description: 'No hreflang on page' }),
        m('hreflang return tag accuracy', 'N/A', { status: 'info' }),
        m('Language-region mismatch count', 0, { status: 'pass' }),
        m('Default hreflang (x-default) usage', 'N/A', { status: 'info' }),
        m('Geo-targeting consistency', 'N/A', { status: 'info' }),
        m('International duplicate risk score', 'N/A', { status: 'info' }),
        m('Subfolder vs subdomain performance', 'N/A', { status: 'info' }),
      ],
    },
    // Structured Data Diagnostics
    {
      id: 'structured-data-diagnostics',
      title: 'Structured Data & Semantic SEO',
      subtitle: 'Schema Markup Analysis',
      metrics: [
        m('Schema coverage (% pages with schema)', struct.hasSchema ? '100%' : '0%', { status: struct.hasSchema ? 'pass' : 'warn' }),
        m('Schema validity error count', struct.hasSchema ? 0 : '—', { status: 'info' }),
        m('Rich result eligibility rate', struct.hasSchema ? '—' : '0%', { status: 'info' }),
        m('Schema type diversity', struct.types?.length ?? 0, { unit: 'types', status: struct.hasSchema ? 'info' : undefined }),
        m('Entity consistency score', 'N/A', { status: 'info' }),
        m('Knowledge graph alignment', 'N/A', { status: 'info' }),
        m('Breadcrumb schema accuracy', struct.types?.some((t: string) => /breadcrumb/i.test(t)) ? 'Present' : 'N/A', { status: 'info' }),
        m('FAQ / HowTo compliance', struct.types?.some((t: string) => /faq|howto/i.test(t)) ? 'Present' : 'N/A', { status: 'info' }),
      ],
    },
    // Log File Analysis
    {
      id: 'log-file-analysis',
      title: 'Log File Analysis',
      subtitle: 'Enterprise-Grade Insight',
      metrics: [
        m('Googlebot hit frequency', 'N/A', { status: 'info', description: 'Requires server logs' }),
        m('Crawl priority pages vs actual crawl rate', 'N/A', { status: 'info' }),
        m('Crawl waste URLs identified', 'N/A', { status: 'info' }),
        m('Bot response code patterns', 'N/A', { status: 'info' }),
        m('Crawl frequency vs update frequency', 'N/A', { status: 'info' }),
        m('Parameter crawl amplification', 'N/A', { status: 'info' }),
        m('JS resource crawl frequency', 'N/A', { status: 'info' }),
      ],
    },
    // XML Sitemaps & Discovery
    {
      id: 'xml-sitemaps-discovery',
      title: 'XML Sitemaps & Discovery',
      subtitle: undefined,
      metrics: [
        m('Sitemap index coverage', 'N/A', { status: 'info', description: 'Requires sitemap fetch' }),
        m('Sitemap freshness (lastmod accuracy)', 'N/A', { status: 'info' }),
        m('Indexed URLs from sitemap (%)', 'N/A', { status: 'info' }),
        m('Non-canonical URLs in sitemap', 'N/A', { status: 'info' }),
        m('Sitemap vs crawl gap', 'N/A', { status: 'info' }),
        m('Image / video sitemap validation', 'N/A', { status: 'info' }),
        m('News sitemap compliance', 'N/A', { status: 'info' }),
      ],
    },
    // Server & Hosting Performance
    {
      id: 'server-hosting-performance',
      title: 'Server & Hosting Performance',
      subtitle: undefined,
      metrics: [
        m('Server uptime %', 'N/A', { status: 'info', description: 'Requires monitoring' }),
        m('Response time variance', 'N/A', { status: 'info' }),
        m('Geographic latency distribution', 'N/A', { status: 'info' }),
        m('Load handling under traffic spikes', 'N/A', { status: 'info' }),
        m('Edge caching efficiency', 'N/A', { status: 'info' }),
        m('Hosting error frequency', 'N/A', { status: 'info' }),
      ],
    },
    // Automation & Monitoring
    {
      id: 'automation-monitoring',
      title: 'Automation & Monitoring Parameters',
      subtitle: undefined,
      metrics: [
        m('Threshold-based alerts', 'N/A', { status: 'info', description: 'Configure in monitoring' }),
        m('Regression detection', 'N/A', { status: 'info' }),
        m('Historical trend tracking', 'N/A', { status: 'info' }),
        m('Algorithm-impact sensitivity flags', 'N/A', { status: 'info' }),
        m('Page template-level diagnostics', 'N/A', { status: 'info' }),
        m('Pre-deployment technical checks', 'N/A', { status: 'info' }),
      ],
    },
    // Additional Crawl Metrics (Hidden)
    {
      id: 'crawl-budget-modeling',
      title: 'Crawl Budget Modeling',
      subtitle: 'Advanced Crawl Analysis',
      metrics: [
        m('Crawl budget efficiency (Indexed ÷ Crawled)', '—', { status: 'info', description: 'Requires crawl + index data' }),
        m('Parameterized URL crawl ratio', '—', { status: 'info', description: 'Requires multi-URL crawl' }),
        m('Faceted navigation crawl impact score', '—', { status: 'info', description: 'Requires site architecture analysis' }),
        m('Crawl waste percentage', 'N/A', { status: 'info', description: 'Requires crawl data' }),
        m('HTTP status code distribution (% 200)', '—', { status: 'info', description: 'Requires multi-URL crawl' }),
        m('Crawl depth (avg / median / max)', '—', { status: 'info', description: 'Requires site crawl' }),
        m('Soft 404 detection rate', 'N/A', { status: 'info', description: 'Requires crawl + index' }),
      ],
    },
    // Anchor Text Analysis (Hidden)
    {
      id: 'anchor-text-analysis',
      title: 'Anchor Text Analysis',
      subtitle: 'Internal Linking Patterns',
      metrics: [
        m('Anchor text diversity ratio', '—', { status: 'info', description: 'Requires link analysis' }),
        m('Over-optimization risk score (anchors)', '—', { status: 'info', description: 'Requires anchor analysis' }),
        m('Hub-and-spoke linkage density', '—', { status: 'info', description: 'Requires site crawl' }),
        m('Internal PageRank distribution', 'N/A', { status: 'info', description: 'Requires link graph' }),
      ],
    },
  ];
}
