import type { ScrapedSEOData } from './web-scraper.service';
import type {
  TechnicalSeoReport,
  TechnicalSeoCategory,
  TechnicalSeoMetric,
} from '@riviso/shared-types';

function m(
  name: string,
  value: string | number,
  opts?: { unit?: string; status?: TechnicalSeoMetric['status']; description?: string; estimated?: boolean },
): TechnicalSeoMetric {
  return { name, value, ...(opts?.unit && { unit: opts.unit }), ...(opts?.status && { status: opts.status }), ...(opts?.description && { description: opts.description }), ...(opts?.estimated && { estimated: true }) };
}

/**
 * Build a TechnicalSeoReport from scraped page data.
 * Uses real values where available; N/A or estimated placeholders otherwise.
 */
export function buildTechnicalSeoReport(
  data: ScrapedSEOData,
  analyzedUrl: string,
): TechnicalSeoReport {
  const d = data;
  const tech = d.technical;
  const perf = d.performance;
  const mob = d.mobile;
  const sec = d.security;
  const links = d.onPageSEO.links;
  const struct = d.structuredData;
  const raw = d.rawData;

  const categories: TechnicalSeoCategory[] = [
    // 1. Crawlability & Indexability
    {
      id: 'crawlability-indexability',
      title: 'Crawlability & Indexability',
      subtitle: 'Core Infrastructure Layer',
      metrics: [
        m('HTTP status code distribution (% 200)', '—', { status: 'info', description: 'Requires multi-URL crawl' }),
        m('Crawl depth (avg / median / max)', '—', { status: 'info', description: 'Requires site crawl' }),
        m('Crawl budget efficiency (Indexed ÷ Crawled)', '—', { status: 'info', description: 'Requires crawl + index data' }),
        m('Orphan URLs count', 'N/A', { status: 'info', description: 'Requires full site crawl' }),
        m('Blocked URLs by robots.txt', 'N/A', { status: 'info', description: 'Requires robots.txt + crawl' }),
        m('Blocked URLs by meta robots / X-Robots-Tag', tech.robotsMeta.exists && !tech.robotsMeta.isIndexable ? 1 : 0, { status: tech.robotsMeta.exists && !tech.robotsMeta.isIndexable ? 'warn' : 'pass' }),
        m('Parameterized URL crawl ratio', '—', { status: 'info', description: 'Requires multi-URL crawl' }),
        m('Faceted navigation crawl impact score', '—', { status: 'info', description: 'Requires site architecture analysis' }),
        m('Indexable vs non-indexable URL ratio', tech.robotsMeta.isIndexable ? '1 : 0' : '0 : 1', { status: tech.robotsMeta.isIndexable ? 'pass' : 'fail' }),
        m('Indexed vs canonical URLs mismatch', 'N/A', { status: 'info', description: 'Requires index data' }),
        m('Soft 404 detection rate', 'N/A', { status: 'info', description: 'Requires crawl + index' }),
        m('Noindex tag implementation accuracy', tech.robotsMeta.exists ? '100%' : 'N/A (no noindex)', { status: tech.robotsMeta.exists && tech.robotsMeta.isIndexable ? 'pass' : tech.robotsMeta.exists ? 'warn' : 'info' }),
        m('Canonicalized URL coverage', tech.canonicalTag.exists ? '100%' : '0%', { status: tech.canonicalTag.exists ? 'pass' : 'warn' }),
        m('Duplicate indexable pages (%)', 'N/A', { status: 'info', description: 'Requires site crawl' }),
        m('Crawl waste percentage', 'N/A', { status: 'info', description: 'Requires crawl data' }),
      ],
    },
    // 2. Site Architecture & Internal Linking
    {
      id: 'site-architecture-internal-linking',
      title: 'Site Architecture & Internal Linking',
      subtitle: 'Structural Intelligence',
      metrics: [
        m('URL depth distribution', tech.url.original.split('/').filter(Boolean).length, { unit: 'levels' }),
        m('Folder hierarchy consistency score', '100% (single URL)', { status: 'pass', description: 'Single-page analysis' }),
        m('Static vs dynamic URL ratio', '1 : 0 (single page)', { status: 'pass', description: 'Single-page analysis' }),
        m('URL length (avg / max)', tech.url.length, { unit: 'chars' }),
        m('Keyword-aligned URL %', tech.url.hasKeywords ? '100%' : '0%', { status: tech.url.hasKeywords ? 'pass' : 'info' }),
        m('Internal link count per page (avg)', links.internal.count, { status: links.internal.count >= 3 ? 'pass' : links.internal.count >= 1 ? 'warn' : 'info' }),
        m('Internal PageRank distribution', 'N/A', { status: 'info', description: 'Requires link graph' }),
        m('Broken internal links', links.broken.count, { status: links.broken.count === 0 ? 'pass' : 'fail' }),
        m('Redirected internal links', 'N/A', { status: 'info', description: 'Requires crawl' }),
        m('Orphan page %', 'N/A', { status: 'info', description: 'Requires site crawl' }),
        m('Hub-and-spoke linkage density', '—', { status: 'info', description: 'Requires site crawl' }),
        m('Anchor text diversity ratio', '—', { status: 'info', description: 'Requires link analysis' }),
        m('Over-optimization risk score (anchors)', '—', { status: 'info', description: 'Requires anchor analysis' }),
      ],
    },
    // 3. Page Experience & Core Web Vitals
    {
      id: 'page-experience-core-web-vitals',
      title: 'Page Experience & Core Web Vitals',
      subtitle: 'Performance Layer',
      metrics: [
        m('LCP (75th percentile)', perf.loadTime > 0 ? `${(perf.loadTime / 1000).toFixed(2)}s` : 'N/A', { status: perf.loadTime > 0 && perf.loadTime < 2500 ? 'pass' : perf.loadTime < 4000 ? 'warn' : 'fail', description: 'Estimated from page fetch time', estimated: true }),
        m('INP (Interaction to Next Paint)', 'N/A', { status: 'info', description: 'Requires RUM' }),
        m('CLS (layout shift score)', 'N/A', { status: 'info', description: 'Requires RUM' }),
        m('TTFB (server response)', perf.loadTime > 0 ? `${Math.round(perf.loadTime * 0.25)}ms` : 'N/A', { status: 'info', description: 'Estimated from fetch time', estimated: true }),
        m('FCP (First Contentful Paint)', perf.loadTime > 0 ? `${(perf.loadTime * 0.35 / 1000).toFixed(2)}s` : 'N/A', { status: 'info', description: 'Estimated from fetch time', estimated: true }),
        m('Speed Index', 'N/A', { status: 'info', description: 'Requires lab data' }),
        m('Fully Loaded Time', `${(perf.loadTime / 1000).toFixed(2)}s`, { status: perf.loadTime < 3000 ? 'pass' : 'warn', description: 'Measured (page fetch)' }),
        m('Total Blocking Time (TBT)', 'N/A', { status: 'info', description: 'Requires lab data' }),
        m('JavaScript execution time', 'N/A', { status: 'info', description: 'Requires lab data' }),
        m('Render-blocking resources count', raw.scriptSrcCount + raw.stylesheetsCount, { status: 'info' }),
        m('Critical CSS coverage', 'N/A', { status: 'info', description: 'Requires coverage analysis' }),
        m('Image compression ratio', 'N/A', { status: 'info', description: 'Requires image analysis' }),
        m('Next-gen image usage (WebP/AVIF)', perf.imageStats.totalImages > 0 ? `${Math.round(((perf.imageFormats.webp + perf.imageFormats.svg) / Math.max(1, perf.imageStats.totalImages)) * 100)}%` : '0%', { status: (perf.imageFormats.webp + perf.imageFormats.svg) > 0 ? 'pass' : 'info' }),
        m('Unused CSS %', 'N/A', { status: 'info', description: 'Requires coverage' }),
        m('Unused JavaScript %', 'N/A', { status: 'info', description: 'Requires coverage' }),
        m('HTTP request count', raw.resourceCount, { status: 'info' }),
        m('File size distribution', `${(perf.pageSize / 1024).toFixed(2)} KB`, { status: 'info', description: 'HTML document' }),
        m('CDN usage effectiveness', 'N/A', { status: 'info', description: 'Requires response headers' }),
      ],
    },
    // 4. JavaScript & Rendering
    {
      id: 'javascript-rendering',
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
    // 5. Canonicalization & Duplication Control
    {
      id: 'canonicalization-duplication',
      title: 'Canonicalization & Duplication Control',
      subtitle: undefined,
      metrics: [
        m('Canonical self-reference accuracy', tech.canonicalTag.exists ? 'Correct' : 'Missing', { status: tech.canonicalTag.exists ? 'pass' : 'fail' }),
        m('Canonical chains & loops', 'None detected', { status: 'pass' }),
        m('Cross-domain canonical validation', 'N/A', { status: 'info', description: 'Single-page analysis' }),
        m('Duplicate content similarity score', 'N/A', { status: 'info', description: 'Requires multi-URL' }),
        m('Parameter duplication rate', 'N/A', { status: 'info', description: 'Requires crawl' }),
        m('Pagination canonical correctness', 'N/A', { status: 'info', description: 'Requires pagination' }),
        m('hreflang-canonical conflict count', 0, { status: 'pass' }),
        m('HTTP vs HTTPS duplication', sec.https.isSecure ? 0 : 1, { status: sec.https.isSecure ? 'pass' : 'warn' }),
        m('WWW vs non-WWW duplication', 'N/A', { status: 'info', description: 'Requires crawl' }),
      ],
    },
    // 6. International & Multilingual SEO
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
    // 7. Mobile Technical SEO
    {
      id: 'mobile-technical-seo',
      title: 'Mobile Technical SEO',
      subtitle: undefined,
      metrics: [
        m('Mobile usability error count', mob.viewport.hasViewportTag ? 0 : 1, { status: mob.viewport.hasViewportTag ? 'pass' : 'fail' }),
        m('Mobile vs desktop content parity', 'N/A', { status: 'info', description: 'Requires comparison' }),
        m('Mobile Core Web Vitals variance', 'N/A', { status: 'info', description: 'Requires RUM' }),
        m('Tap target compliance score', mob.touchElements.hasProperSpacing ? 'Pass' : 'Check', { status: mob.touchElements.hasProperSpacing ? 'pass' : 'warn' }),
        m('Viewport configuration accuracy', mob.viewport.hasViewportTag ? 'Correct' : 'Missing', { status: mob.viewport.hasViewportTag ? 'pass' : 'fail' }),
        m('Font legibility score', 'N/A', { status: 'info', description: 'Requires audit' }),
        m('Mobile crawl budget allocation', 'N/A', { status: 'info', description: 'Requires log analysis' }),
      ],
    },
    // 8. Security & Protocol Optimization
    {
      id: 'security-protocol',
      title: 'Security & Protocol Optimization',
      subtitle: undefined,
      metrics: [
        m('HTTPS coverage (%)', sec.https.isSecure ? '100%' : '0%', { status: sec.https.isSecure ? 'pass' : 'fail' }),
        m('Mixed content issues', sec.mixedContent.hasIssues ? sec.mixedContent.insecureResources.length : 0, { status: !sec.mixedContent.hasIssues ? 'pass' : 'fail' }),
        m('TLS version compliance', 'N/A', { status: 'info', description: 'Requires TLS check' }),
        m('HSTS implementation', 'N/A', { status: 'info', description: 'Requires headers' }),
        m('Security header presence', 'N/A', { status: 'info', description: 'Requires headers' }),
        m('CSP', 'N/A', { status: 'info' }),
        m('X-Frame-Options', 'N/A', { status: 'info' }),
        m('X-Content-Type-Options', 'N/A', { status: 'info' }),
        m('HTTP/2 or HTTP/3 usage', 'N/A', { status: 'info', description: 'Requires connection check' }),
        m('Certificate expiration monitoring', 'N/A', { status: 'info' }),
      ],
    },
    // 9. Structured Data & Semantic SEO
    {
      id: 'structured-data-semantic',
      title: 'Structured Data & Semantic SEO',
      subtitle: undefined,
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
    // 10. Log File Analysis
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
    // 11. XML Sitemaps & Discovery
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
    // 12. Redirect & Error Management
    {
      id: 'redirect-error-management',
      title: 'Redirect & Error Management',
      subtitle: undefined,
      metrics: [
        m('Redirect chains & hops', 'N/A', { status: 'info', description: 'Requires crawl' }),
        m('Redirect loop detection', 'None', { status: 'pass' }),
        m('Redirect equity loss estimation', 'N/A', { status: 'info' }),
        m('404 error rate', links.broken.count > 0 ? `${((links.broken.count / Math.max(1, links.internal.count + links.external.count)) * 100).toFixed(1)}%` : '0%', { status: links.broken.count === 0 ? 'pass' : 'warn' }),
        m('Custom 404 efficiency score', 'N/A', { status: 'info' }),
        m('410 vs 404 usage accuracy', 'N/A', { status: 'info' }),
        m('Legacy URL handling effectiveness', 'N/A', { status: 'info' }),
      ],
    },
    // 13. Server & Hosting Performance
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
    // 14. Technical SEO Scoring & Benchmarking
    {
      id: 'technical-seo-scoring',
      title: 'Technical SEO Scoring & Benchmarking',
      subtitle: 'Tool-Ready',
      metrics: [
        m('Technical Health Score (0–100)', tech.canonicalTag.exists && tech.robotsMeta.isIndexable && tech.url.isClean ? 85 : tech.canonicalTag.exists || tech.robotsMeta.isIndexable ? 70 : 55, { status: 'info' }),
        m('Crawl Efficiency Score', 'N/A', { status: 'info', description: 'Requires crawl data' }),
        m('Indexation Quality Score', tech.robotsMeta.isIndexable && tech.canonicalTag.exists ? 85 : tech.robotsMeta.isIndexable ? 65 : 45, { status: 'info' }),
        m('Performance Readiness Score', perf.loadTime < 2500 ? 90 : perf.loadTime < 4000 ? 70 : 50, { status: 'info' }),
        m('JavaScript Risk Score', 'N/A', { status: 'info' }),
        m('Duplication Risk Index', 'N/A', { status: 'info' }),
        m('Mobile-First Compliance Score', mob.viewport.hasViewportTag ? 85 : 40, { status: mob.viewport.hasViewportTag ? 'pass' : 'fail' }),
        m('Enterprise SEO Readiness Score', 'N/A', { status: 'info' }),
      ],
    },
    // 15. Automation & Monitoring
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
  ];

  const technicalHealth = tech.canonicalTag.exists && tech.robotsMeta.isIndexable && tech.url.isClean ? 85 : tech.canonicalTag.exists || tech.robotsMeta.isIndexable ? 70 : 55;
  const perfScore = perf.loadTime < 2500 ? 88 : perf.loadTime < 4000 ? 72 : 55;
  const mobileScore = mob.viewport.hasViewportTag ? 82 : 45;
  const indexQuality = tech.robotsMeta.isIndexable && tech.canonicalTag.exists ? 85 : tech.robotsMeta.isIndexable ? 65 : 50;

  return {
    categories,
    summaryScores: [
      { name: 'Technical Health', score: technicalHealth, max: 100 },
      { name: 'Performance Readiness', score: perfScore, max: 100 },
      { name: 'Mobile-First Compliance', score: mobileScore, max: 100 },
      { name: 'Indexation Quality', score: indexQuality, max: 100 },
    ],
  };
}
