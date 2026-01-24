/**
 * Meaning, how it's measured, and improvement tips for Technical SEO metrics.
 * Keyed by exact metric name from the API.
 */

export interface MetricInfo {
  meaning: string;
  howMeasured: string;
  improvementTips: string[];
}

const METRIC_INFO: Record<string, MetricInfo> = {
  'HTTP status code distribution (% 200)': {
    meaning: 'The share of URLs that return 200 (OK), 3xx (redirects), 4xx (client errors), or 5xx (server errors) when crawled. A healthy site has most URLs returning 200.',
    howMeasured: 'Requires crawling multiple URLs and recording each response status. Often derived from log files or crawl tools.',
    improvementTips: ['Fix 4xx/5xx errors. Use 301 redirects for moved content.', 'Ensure critical pages return 200.', 'Monitor server errors and fix quickly.'],
  },
  'Crawl depth (avg / median / max)': {
    meaning: 'How many clicks from the homepage it takes to reach a URL. Shallow depth helps crawlers discover and index pages faster.',
    howMeasured: 'Calculated during a full site crawl by counting path segments or link hops from the homepage.',
    improvementTips: ['Keep important pages within 3 clicks of the homepage.', 'Improve internal linking to deep pages.', 'Flatten site architecture where possible.'],
  },
  'Crawl budget efficiency (Indexed ÷ Crawled)': {
    meaning: 'The ratio of indexed URLs to crawled URLs. High efficiency means crawl budget is spent on pages that get indexed.',
    howMeasured: 'Requires crawl data and index data (e.g. from Search Console or log analysis).',
    improvementTips: ['Remove or noindex low-value pages.', 'Fix crawl traps and parameter-heavy URLs.', 'Consolidate thin or duplicate content.'],
  },
  'Blocked URLs by meta robots / X-Robots-Tag': {
    meaning: 'URLs blocked from indexing via meta robots or X-Robots-Tag. On this page, we count whether the current URL is blocked.',
    howMeasured: 'Checked via page-level meta robots noindex or X-Robots-Tag HTTP header.',
    improvementTips: ['Use noindex only for pages you do not want in search results.', 'Avoid accidentally noindexing important pages.', 'Use robots.txt for bulk blocking, meta/X-Robots for page-level control.'],
  },
  'Indexable vs non-indexable URL ratio': {
    meaning: 'The proportion of URLs that can be indexed (no noindex, not blocked) vs those that cannot. Ideally, important pages are indexable.',
    howMeasured: 'Determined by robots meta, canonical, and robots.txt rules during crawl.',
    improvementTips: ['Ensure key landing pages are indexable.', 'Noindex duplicates, pagination, and filters as appropriate.', 'Audit accidental noindex on important URLs.'],
  },
  'Canonicalized URL coverage': {
    meaning: 'The share of indexable URLs that have a correct canonical tag pointing to the preferred version. Reduces duplicate-content issues.',
    howMeasured: 'Presence and validity of the canonical link element on each page.',
    improvementTips: ['Add self-referencing canonicals on all important pages.', 'Point duplicates to the preferred URL.', 'Use absolute URLs and avoid canonical chains.'],
  },
  'URL depth distribution': {
    meaning: 'The number of path levels (e.g. /a/b/c = 3 levels). Deeper URLs can be harder for users and crawlers to reach.',
    howMeasured: 'Count of path segments in the URL, excluding domain and query string.',
    improvementTips: ['Keep important content within 2–3 levels.', 'Use descriptive, short paths.', 'Avoid unnecessarily deep hierarchies.'],
  },
  'Folder hierarchy consistency score': {
    meaning: 'How consistent and logical your URL structure is across the site. Consistent patterns aid crawlability and UX.',
    howMeasured: 'Analyzed from a sitemap or full crawl by comparing URL patterns across sections.',
    improvementTips: ['Use a clear, consistent folder structure (e.g. /blog/, /products/).', 'Avoid mixing conventions (e.g. IDs vs slugs) unpredictably.', 'Document and stick to URL conventions.'],
  },
  'Static vs dynamic URL ratio': {
    meaning: 'The share of static-looking URLs (e.g. /page) vs dynamic (e.g. /?id=123). Search engines handle both; consistency and crawlability matter.',
    howMeasured: 'Classification of URLs from a multi-URL sample (query params, path patterns).',
    improvementTips: ['Prefer clean, static-looking URLs where possible.', 'Use query parameters only when needed; consider rewrites.', 'Avoid excessive parameters that create crawl bloat.'],
  },
  'Internal link count per page (avg)': {
    meaning: 'Average number of internal links per page. Sufficient internal links help discovery, link equity flow, and crawl efficiency.',
    howMeasured: 'Count of internal links (same domain) on each page during crawl.',
    improvementTips: ['Add contextual internal links to key pages.', 'Link from high-authority pages to newer or deeper content.', 'Aim for a reasonable balance; avoid link stuffing.'],
  },
  'Broken internal links': {
    meaning: 'Internal links that return 4xx or 5xx. They hurt UX and waste crawl budget.',
    howMeasured: 'Each internal link is requested; responses 4xx/5xx are counted as broken.',
    improvementTips: ['Fix or remove broken links regularly.', 'Redirect moved URLs (301) when appropriate.', 'Use a broken-link checker in your workflow.'],
  },
  'LCP (75th percentile)': {
    meaning: 'Largest Contentful Paint—when the largest visible content element appears. Core Web Vitals metric; under 2.5s is good.',
    howMeasured: 'Typically measured with RUM or lab tools (e.g. Lighthouse). We estimate from page fetch time when lab data is unavailable.',
    improvementTips: ['Optimize images (format, size, lazy load).', 'Improve server response time and use a CDN.', 'Reduce render-blocking resources and critical path.'],
  },
  'TTFB (server response)': {
    meaning: 'Time to First Byte—when the first byte of the response arrives. Reflects server and network latency.',
    howMeasured: 'Measured from request start to first byte received. We estimate from fetch time when direct TTFB is unavailable.',
    improvementTips: ['Use a fast host and CDN.', 'Enable caching and optimize server-side code.', 'Consider edge compute for dynamic pages.'],
  },
  'FCP (First Contentful Paint)': {
    meaning: 'When the first text or image is painted. Affects perceived load speed.',
    howMeasured: 'Browser metrics (RUM or lab). We estimate from fetch time when unavailable.',
    improvementTips: ['Minimize render-blocking CSS/JS.', 'Optimize critical resources and fonts.', 'Use efficient caching.'],
  },
  'Fully Loaded Time': {
    meaning: 'When the page has fully loaded, including all assets. Affects UX and sometimes rankings.',
    howMeasured: 'Time from navigation start until load event (or similar). We use page fetch duration here.',
    improvementTips: ['Defer non-critical JS, optimize images.', 'Use lazy loading for below-the-fold content.', 'Reduce total requests and transfer size.'],
  },
  'Render-blocking resources count': {
    meaning: 'Number of CSS/JS resources that block rendering. Fewer typically means faster FCP/LCP.',
    howMeasured: 'Count of synchronous stylesheets and scripts that delay first paint.',
    improvementTips: ['Inline critical CSS, defer non-critical.', 'Use async/defer for non-critical JS.', 'Minimize and combine assets.'],
  },
  'Next-gen image usage (WebP/AVIF)': {
    meaning: 'Share of images served as WebP or AVIF. These formats usually offer better compression than JPEG/PNG.',
    howMeasured: 'Count of img/src or source elements pointing to .webp/.avif vs total images.',
    improvementTips: ['Serve WebP or AVIF with fallbacks for older browsers.', 'Use responsive images and correct sizing.', 'Prefer next-gen formats for photos and large graphics.'],
  },
  'HTTP request count': {
    meaning: 'Total number of HTTP requests (HTML, CSS, JS, images, etc.) to load the page. Fewer often means faster loads.',
    howMeasured: 'Count of script, link, img, and similar resource requests plus the document.',
    improvementTips: ['Combine and minify CSS/JS where possible.', 'Use sprites or SVGs for icons.', 'Lazy load below-the-fold images.'],
  },
  'File size distribution': {
    meaning: 'Size of the HTML document (and sometimes other key resources). Smaller documents can load faster.',
    howMeasured: 'Byte size of the HTML response. We report HTML size here.',
    improvementTips: ['Minify HTML and remove unnecessary markup.', 'Defer or remove unused inline scripts/styles.', 'Keep above-the-fold content lean.'],
  },
  'DOM size (node count)': {
    meaning: 'Number of DOM nodes. Very large DOMs can slow layout, especially on mobile.',
    howMeasured: 'Count of elements in the parsed document.',
    improvementTips: ['Avoid deeply nested or redundant markup.', 'Lazy load or paginate long lists.', 'Remove hidden or unused UI from the DOM.'],
  },
  'Deferred vs async script usage': {
    meaning: 'Whether scripts use defer or async to avoid blocking parsing and rendering.',
    howMeasured: 'Count of script tags with defer or async attributes.',
    improvementTips: ['Use defer for scripts that must run in order.', 'Use async for independent third-party scripts.', 'Avoid blocking scripts in the head when possible.'],
  },
  'Lazy-loaded content indexability': {
    meaning: 'Whether lazy-loaded content (e.g. images, below-fold sections) is visible to crawlers. Important for SEO.',
    howMeasured: 'Detection of loading="lazy", data-src, or similar patterns; crawlability often verified via testing tools.',
    improvementTips: ['Use native lazy loading (loading="lazy") with fallbacks.', 'Ensure lazy-loaded content is in the initial HTML or quickly loaded.', 'Test that key content is indexable.'],
  },
  'Canonical self-reference accuracy': {
    meaning: 'The page correctly points to itself (or the preferred URL) via the canonical tag. Prevents canonical errors.',
    howMeasured: 'Canonical link href is checked against the current URL.',
    improvementTips: ['Use self-referencing canonicals on the preferred URL.', 'Use absolute URLs; avoid typos or wrong domains.', 'Ensure canonical matches the indexed URL.'],
  },
  'Canonical chains & loops': {
    meaning: 'Chains (A→B→C) or loops (A→B→A) in canonical tags. Search engines may ignore or misapply them.',
    howMeasured: 'Crawl following canonical URLs and detect redirect chains or cycles.',
    improvementTips: ['Point canonicals directly to the final URL.', 'Avoid multi-hop canonical chains.', 'Audit canonicals if you use parameterized or alternate URLs.'],
  },
  'HTTPS coverage (%)': {
    meaning: 'Share of pages served over HTTPS. HTTPS is required for security and many modern features.',
    howMeasured: 'Protocol of the analyzed URL (and, in full audits, all crawled URLs).',
    improvementTips: ['Serve all pages over HTTPS.', 'Redirect HTTP to HTTPS (301).', 'Fix mixed content and update internal links.'],
  },
  'Mixed content issues': {
    meaning: 'Resources (e.g. images, scripts) loaded over HTTP on an HTTPS page. Browsers may block them and harm UX.',
    howMeasured: 'Scan for src/href pointing to http: on an https: page.',
    improvementTips: ['Use relative URLs or https: for all resources.', 'Update third-party embeds to HTTPS.', 'Rescan after changes to ensure no mixed content.'],
  },
  'Schema coverage (% pages with schema)': {
    meaning: 'Share of pages with structured data (JSON-LD, microdata). Helps rich results and understanding.',
    howMeasured: 'Presence of schema.org markup on the page.',
    improvementTips: ['Add Organization, WebPage, Article, or other relevant types.', 'Validate with Google Rich Results Test.', 'Keep schema accurate and avoid spammy markup.'],
  },
  'Mobile usability error count': {
    meaning: 'Number of mobile usability issues (e.g. viewport, tap targets). Fewer is better.',
    howMeasured: 'Checks for viewport meta, tap target size, font size, etc.',
    improvementTips: ['Use a responsive viewport meta tag.', 'Ensure tap targets are at least 48×48px.', 'Test on real devices and in Search Console.'],
  },
  'Viewport configuration accuracy': {
    meaning: 'Whether the viewport meta tag is set correctly for responsive design. Essential for mobile SEO.',
    howMeasured: 'Presence and validity of meta name="viewport".',
    improvementTips: ['Add <meta name="viewport" content="width=device-width, initial-scale=1">.', 'Avoid disabling user scaling without good reason.', 'Test layout at different viewport sizes.'],
  },
  '404 error rate': {
    meaning: 'Share of checked links that return 404. High rates hurt UX and can waste crawl budget.',
    howMeasured: 'Sample of internal/external links is requested; 404 responses are counted.',
    improvementTips: ['Fix or redirect broken links.', 'Implement a helpful custom 404 page.', 'Monitor 404s in Search Console and fix critical ones.'],
  },
};

const DEFAULT_INFO: MetricInfo = {
  meaning: 'This metric reflects an aspect of technical SEO that affects crawlability, indexation, user experience, or performance.',
  howMeasured: 'Values are derived from the page analysis, crawl data, or external tools where noted. "N/A" or "—" indicate additional data (e.g. multi-URL crawl, RUM) is required.',
  improvementTips: ['Review the metric description and status.', 'Address any pass/fail or warning signals.', 'Re-run analysis after changes to track progress.'],
};

export function getMetricInfo(metricName: string): MetricInfo {
  return METRIC_INFO[metricName] ?? DEFAULT_INFO;
}

export type MetricLabel = 'Excellent' | 'Good' | 'Warning' | 'Needs improvement' | 'Info';

export function getMetricLabel(status: string | undefined, value?: string | number): MetricLabel {
  if (!status) return 'Info';
  switch (status) {
    case 'pass':
      if (value === 0 || value === '0' || value === '0%') return 'Excellent';
      if (value === 'Correct' || value === 'Implemented' || value === 'None' || value === 'None detected') return 'Excellent';
      if (typeof value === 'string' && (value === '100%' || value.endsWith('100%'))) return 'Excellent';
      return 'Good';
    case 'warn':
      return 'Warning';
    case 'fail':
      return 'Needs improvement';
    default:
      return 'Info';
  }
}

export function getMetricLabelClass(label: MetricLabel): string {
  switch (label) {
    case 'Excellent':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Good':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'Warning':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Needs improvement':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}
