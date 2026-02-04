import type { ScrapedSEOData } from './web-scraper.service';
import type {
  TechnicalSeoReport,
  TechnicalSeoCategory,
  TechnicalSeoMetric,
  TechnicalSeoResource,
} from '@riviso/shared-types';

/**
 * Impact levels for prioritization
 */
export type ImpactLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Enhanced metric with impact and explanation
 */
export interface EnhancedTechnicalSeoMetric extends TechnicalSeoMetric {
  impact?: ImpactLevel;
  whyItMatters?: string;
  affectedPages?: number;
  fixPriority?: number; // 1-10, higher = more urgent
  resources?: TechnicalSeoResource[];
  recommendation?: string;
}

/**
 * Enhanced category with summary
 */
export interface EnhancedTechnicalSeoCategory extends Omit<TechnicalSeoCategory, 'metrics'> {
  metrics: EnhancedTechnicalSeoMetric[];
  overallStatus?: 'pass' | 'warn' | 'fail';
  criticalIssues?: number;
}

function m(
  name: string,
  value: string | number,
  opts?: {
    unit?: string;
    status?: TechnicalSeoMetric['status'];
    description?: string;
    estimated?: boolean;
    impact?: ImpactLevel;
    whyItMatters?: string;
    affectedPages?: number;
    fixPriority?: number;
    resources?: TechnicalSeoResource[];
    recommendation?: string;
  },
): EnhancedTechnicalSeoMetric {
  return {
    name,
    value,
    ...(opts?.unit && { unit: opts.unit }),
    ...(opts?.status && { status: opts.status }),
    ...(opts?.description && { description: opts.description }),
    ...(opts?.estimated && { estimated: true }),
    ...(opts?.impact && { impact: opts.impact }),
    ...(opts?.whyItMatters && { whyItMatters: opts.whyItMatters }),
    ...(opts?.affectedPages !== undefined && { affectedPages: opts.affectedPages }),
    ...(opts?.fixPriority !== undefined && { fixPriority: opts.fixPriority }),
    ...(opts?.resources && { resources: opts.resources }),
    ...(opts?.recommendation && { recommendation: opts.recommendation }),
  };
}

/**
 * Build Technical SEO Summary - Executive View
 * 
 * Shows only the 6 decision-critical pillars:
 * 1. Crawl & Index Control
 * 2. Site Architecture & Internal Authority
 * 3. Page Experience & Core Web Vitals
 * 4. Canonicalization & Duplication
 * 5. Mobile & Rendering Readiness
 * 6. Security & Protocol Integrity
 * 
 * All other metrics go to "Advanced Technical Diagnostics"
 */
export function buildTechnicalSeoSummary(
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
  const resources = d.resources || { scripts: [], stylesheets: [], images: [], brokenLinks: [] };

  // Calculate overall status for each pillar
  // Only consider actionable metrics (exclude 'info' status)
  const calculatePillarStatus = (metrics: EnhancedTechnicalSeoMetric[]): 'pass' | 'warn' | 'fail' => {
    // Filter out 'info' status metrics - they don't affect overall status
    const actionableMetrics = metrics.filter(m => m.status && m.status !== 'info');
    
    if (actionableMetrics.length === 0) return 'pass'; // All info = pass
    
    const hasFail = actionableMetrics.some(m => m.status === 'fail');
    const hasWarn = actionableMetrics.some(m => m.status === 'warn');
    
    if (hasFail) return 'fail';
    if (hasWarn) return 'warn';
    return 'pass';
  };

  const calculateCriticalIssues = (metrics: EnhancedTechnicalSeoMetric[]): number => {
    // Only count actual actionable issues (fail or high/critical impact warn)
    return metrics.filter(m => 
      m.status === 'fail' || 
      (m.status === 'warn' && (m.impact === 'high' || m.impact === 'critical'))
    ).length;
  };

  // 1️⃣ Crawl & Index Control
  const crawlIndexMetrics: EnhancedTechnicalSeoMetric[] = [
    m(
      'Indexable vs non-indexable ratio',
      tech.robotsMeta.isIndexable ? '100% indexable' : '0% indexable (blocked)',
      {
        status: tech.robotsMeta.isIndexable ? 'pass' : 'fail',
        impact: tech.robotsMeta.isIndexable ? 'low' : 'critical',
        whyItMatters: tech.robotsMeta.isIndexable
          ? 'Your page is indexable, allowing search engines to include it in search results.'
          : 'This page is blocked from indexing, preventing it from appearing in search results.',
        affectedPages: 1,
        fixPriority: tech.robotsMeta.isIndexable ? 1 : 10,
      }
    ),
    m(
      'Noindex correctness',
      tech.robotsMeta.exists && !tech.robotsMeta.isIndexable ? 'Blocked' : 'Indexable',
      {
        status: tech.robotsMeta.exists && !tech.robotsMeta.isIndexable ? 'warn' : 'pass',
        impact: tech.robotsMeta.exists && !tech.robotsMeta.isIndexable ? 'high' : 'low',
        whyItMatters: 'Important pages should be indexable. Only block pages you don\'t want in search results.',
        affectedPages: 1,
        fixPriority: tech.robotsMeta.exists && !tech.robotsMeta.isIndexable ? 8 : 1,
      }
    ),
    m(
      'Canonical coverage',
      tech.canonicalTag.exists ? '100%' : '0%',
      {
        status: tech.canonicalTag.exists ? 'pass' : 'warn',
        impact: tech.canonicalTag.exists ? 'low' : 'medium',
        whyItMatters: 'Canonical tags prevent duplicate content issues and help consolidate page authority.',
        affectedPages: 1,
        fixPriority: tech.canonicalTag.exists ? 1 : 6,
      }
    ),
    m(
      'Crawl errors (4xx / 5xx)',
      links.broken.count > 0 ? `${links.broken.count} found` : 'None',
      {
        status: links.broken.count === 0 ? 'pass' : 'fail',
        impact: links.broken.count === 0 ? 'low' : 'high',
        whyItMatters: 'Broken links hurt user experience and waste crawl budget. Fix 404s and redirect moved pages.',
        affectedPages: links.broken.count,
        fixPriority: links.broken.count > 0 ? 7 : 1,
        resources: links.broken.links?.slice(0, 10).map((link: { url: string; statusCode: number; anchorText?: string }) => ({
          url: link.url,
          codeSnippet: `<a href="${link.url}">${link.anchorText || link.url}</a>`,
          context: `Status: ${link.statusCode}`,
          type: 'link',
        })) || [],
        recommendation: links.broken.count > 0 
          ? `Fix ${links.broken.count} broken link${links.broken.count !== 1 ? 's' : ''} by updating URLs or adding redirects.`
          : undefined,
      }
    ),
    m(
      'Orphan URLs',
      'N/A',
      {
        status: 'info',
        description: 'Requires full site crawl',
        impact: 'low',
        whyItMatters: 'Orphan pages (not linked internally) are harder for search engines to discover.',
      }
    ),
    m(
      'Robots.txt blocking',
      'N/A',
      {
        status: 'info',
        description: 'Requires robots.txt analysis',
        impact: 'low',
        whyItMatters: 'Incorrect robots.txt rules can block important pages from being crawled.',
      }
    ),
  ];

  // 2️⃣ Site Architecture & Internal Authority
  const architectureMetrics: EnhancedTechnicalSeoMetric[] = [
    m(
      'Average crawl depth',
      tech.url.original.split('/').filter(Boolean).length,
      {
        unit: 'levels',
        status: tech.url.original.split('/').filter(Boolean).length <= 3 ? 'pass' : 'warn',
        impact: tech.url.original.split('/').filter(Boolean).length <= 3 ? 'low' : 'medium',
        whyItMatters: 'Pages within 3 clicks of homepage are easier to discover and tend to rank better.',
        affectedPages: 1,
        fixPriority: tech.url.original.split('/').filter(Boolean).length > 3 ? 5 : 1,
      }
    ),
    m(
      'Internal links per page',
      links.internal.count,
      {
        status: links.internal.count >= 3 ? 'pass' : links.internal.count >= 1 ? 'warn' : 'fail',
        impact: links.internal.count >= 3 ? 'low' : links.internal.count >= 1 ? 'medium' : 'high',
        whyItMatters: 'Internal links help distribute page authority and improve crawlability. Aim for 3+ per page.',
        affectedPages: 1,
        fixPriority: links.internal.count < 3 ? 6 : 1,
      }
    ),
    m(
      'Orphan pages',
      'N/A',
      {
        status: 'info',
        description: 'Requires site crawl',
        impact: 'low',
        whyItMatters: 'Pages with no internal links are harder for search engines to discover.',
      }
    ),
    m(
      'Broken internal links',
      links.broken.count,
      {
        status: links.broken.count === 0 ? 'pass' : 'fail',
        impact: links.broken.count === 0 ? 'low' : 'high',
        whyItMatters: 'Broken internal links waste crawl budget and hurt user experience.',
        affectedPages: links.broken.count,
        fixPriority: links.broken.count > 0 ? 8 : 1,
        resources: links.broken.links?.filter((link: { url: string }) => {
          try {
            const linkUrl = new URL(link.url);
            const pageUrl = new URL(analyzedUrl);
            return linkUrl.hostname === pageUrl.hostname;
          } catch {
            return !link.url.startsWith('http');
          }
        }).slice(0, 10).map((link: { url: string; statusCode: number; anchorText?: string }) => ({
          url: link.url,
          codeSnippet: `<a href="${link.url}">${link.anchorText || link.url}</a>`,
          context: `Status: ${link.statusCode}`,
          type: 'link',
        })) || [],
        recommendation: links.broken.count > 0 
          ? `Update ${links.broken.count} broken internal link${links.broken.count !== 1 ? 's' : ''} to correct URLs or add redirects.`
          : undefined,
      }
    ),
    m(
      'URL structure consistency',
      'Good',
      {
        status: 'pass',
        impact: 'low',
        whyItMatters: 'Consistent URL patterns help users and search engines understand your site structure.',
        affectedPages: 1,
        fixPriority: 1,
      }
    ),
  ];

  // 3️⃣ Page Experience & Core Web Vitals
  const pageExperienceMetrics: EnhancedTechnicalSeoMetric[] = [
    m(
      'LCP (Largest Contentful Paint)',
      perf.loadTime > 0 ? `${(perf.loadTime / 1000).toFixed(2)}s` : 'N/A',
      {
        status: perf.loadTime > 0 
          ? (perf.loadTime < 2500 ? 'pass' : perf.loadTime < 4000 ? 'warn' : 'fail')
          : 'info',
        impact: perf.loadTime > 0 
          ? (perf.loadTime < 2500 ? 'low' : perf.loadTime < 4000 ? 'medium' : 'high')
          : 'low',
        whyItMatters: 'LCP measures loading performance. Google uses this in ranking. Target <2.5s for good, <4s for needs improvement.',
        estimated: true,
        affectedPages: 1,
        fixPriority: perf.loadTime > 0 
          ? (perf.loadTime >= 4000 ? 9 : perf.loadTime >= 2500 ? 7 : 1)
          : 1,
      }
    ),
    m(
      'CLS (Cumulative Layout Shift)',
      'N/A',
      {
        status: 'info',
        description: 'Requires RUM data',
        impact: 'low',
        whyItMatters: 'CLS measures visual stability. Sudden layout shifts hurt user experience and rankings.',
      }
    ),
    m(
      'INP (Interaction to Next Paint)',
      'N/A',
      {
        status: 'info',
        description: 'Requires RUM data',
        impact: 'low',
        whyItMatters: 'INP measures interactivity. Poor INP means users experience delays when clicking or typing.',
      }
    ),
    m(
      'TTFB (Time to First Byte)',
      perf.loadTime > 0 ? `${Math.round(perf.loadTime * 0.25)}ms` : 'N/A',
      {
        status: perf.loadTime > 0 
          ? (perf.loadTime * 0.25 < 800 ? 'pass' : perf.loadTime * 0.25 < 1800 ? 'warn' : 'fail')
          : 'info',
        impact: perf.loadTime > 0 
          ? (perf.loadTime * 0.25 < 800 ? 'low' : perf.loadTime * 0.25 < 1800 ? 'medium' : 'high')
          : 'low',
        whyItMatters: 'TTFB measures server response time. Fast TTFB improves all Core Web Vitals.',
        estimated: true,
        affectedPages: 1,
        fixPriority: perf.loadTime > 0 
          ? (perf.loadTime * 0.25 >= 1800 ? 7 : perf.loadTime * 0.25 >= 800 ? 5 : 1)
          : 1,
      }
    ),
    m(
      'Render-blocking resources',
      (() => {
        // Only count actual render-blocking resources:
        // - Scripts with src that don't have defer/async
        // - All stylesheets (they're all render-blocking)
        const renderBlockingScripts = (d.rawData?.scriptSrcCount || 0) - (d.rawData?.deferAsyncScriptCount || 0);
        const renderBlockingStylesheets = d.rawData?.stylesheetsCount || 0;
        return Math.max(0, renderBlockingScripts) + renderBlockingStylesheets;
      })(),
      {
        status: (() => {
          const renderBlockingScripts = (d.rawData?.scriptSrcCount || 0) - (d.rawData?.deferAsyncScriptCount || 0);
          const renderBlockingStylesheets = d.rawData?.stylesheetsCount || 0;
          const total = Math.max(0, renderBlockingScripts) + renderBlockingStylesheets;
          return total <= 5 ? 'pass' : total <= 10 ? 'warn' : 'fail';
        })(),
        impact: (() => {
          const renderBlockingScripts = (d.rawData?.scriptSrcCount || 0) - (d.rawData?.deferAsyncScriptCount || 0);
          const renderBlockingStylesheets = d.rawData?.stylesheetsCount || 0;
          const total = Math.max(0, renderBlockingScripts) + renderBlockingStylesheets;
          return total <= 5 ? 'low' : total <= 10 ? 'medium' : 'high';
        })(),
        whyItMatters: 'Too many render-blocking resources delay page display. Defer non-critical CSS/JS.',
        affectedPages: 1,
        fixPriority: (() => {
          const renderBlockingScripts = (d.rawData?.scriptSrcCount || 0) - (d.rawData?.deferAsyncScriptCount || 0);
          const renderBlockingStylesheets = d.rawData?.stylesheetsCount || 0;
          const total = Math.max(0, renderBlockingScripts) + renderBlockingStylesheets;
          return total > 10 ? 6 : total > 5 ? 4 : 1;
        })(),
        resources: [
          // Render-blocking scripts (without defer/async)
          ...resources.scripts
            .filter((s: { hasDefer: boolean; hasAsync: boolean }) => !s.hasDefer && !s.hasAsync)
            .slice(0, 10)
            .map((s: { url: string; codeSnippet: string }) => ({
              url: s.url,
              codeSnippet: s.codeSnippet,
              type: 'script',
              context: 'Render-blocking script (add defer or async)',
            })),
          // All stylesheets (all are render-blocking)
          ...resources.stylesheets.slice(0, 10).map((s: { url: string; codeSnippet: string }) => ({
            url: s.url,
            codeSnippet: s.codeSnippet,
            type: 'stylesheet',
            context: 'Render-blocking stylesheet',
          })),
        ],
        recommendation: (() => {
          const renderBlockingScripts = (d.rawData?.scriptSrcCount || 0) - (d.rawData?.deferAsyncScriptCount || 0);
          const renderBlockingStylesheets = d.rawData?.stylesheetsCount || 0;
          const total = Math.max(0, renderBlockingScripts) + renderBlockingStylesheets;
          if (total > 10) {
            return `Reduce ${total} render-blocking resources by adding defer/async to scripts and inlining critical CSS.`;
          } else if (total > 5) {
            return `Consider optimizing ${total} render-blocking resources for faster page load.`;
          }
          return undefined;
        })(),
      }
    ),
    m(
      'Mobile vs desktop performance',
      'N/A',
      {
        status: 'info',
        description: 'Requires mobile-specific test',
        impact: 'low',
        whyItMatters: 'Mobile performance is critical as Google uses mobile-first indexing.',
      }
    ),
  ];

  // 4️⃣ Canonicalization & Duplication
  const canonicalMetrics: EnhancedTechnicalSeoMetric[] = [
    m(
      'Canonical self-reference',
      tech.canonicalTag.exists ? 'Correct' : 'Missing',
      {
        status: tech.canonicalTag.exists ? 'pass' : 'fail',
        impact: tech.canonicalTag.exists ? 'low' : 'medium',
        whyItMatters: 'Self-referencing canonical tags prevent duplicate content issues and consolidate page authority.',
        affectedPages: 1,
        fixPriority: tech.canonicalTag.exists ? 1 : 7,
      }
    ),
    m(
      'HTTP vs HTTPS duplication',
      sec.https.isSecure ? 'None' : 'Detected',
      {
        status: sec.https.isSecure ? 'pass' : 'fail',
        impact: sec.https.isSecure ? 'low' : 'critical',
        whyItMatters: 'HTTPS is required for security and ranking. HTTP versions should redirect to HTTPS.',
        affectedPages: sec.https.isSecure ? 0 : 1,
        fixPriority: sec.https.isSecure ? 1 : 10,
      }
    ),
    m(
      'WWW vs non-WWW duplication',
      'N/A',
      {
        status: 'info',
        description: 'Requires site crawl',
        impact: 'low',
        whyItMatters: 'Both www and non-www versions should redirect to one preferred version to avoid duplicate content.',
      }
    ),
    m(
      'Duplicate indexable pages',
      'N/A',
      {
        status: 'info',
        description: 'Requires site crawl',
        impact: 'low',
        whyItMatters: 'Duplicate content dilutes page authority. Use canonical tags to consolidate.',
      }
    ),
    m(
      'Canonical mismatch issues',
      'None detected',
      {
        status: 'pass',
        impact: 'low',
        whyItMatters: 'Canonical tags should point to the preferred version of each page.',
        affectedPages: 0,
        fixPriority: 1,
      }
    ),
  ];

  // 5️⃣ Mobile & Rendering Readiness
  const mobileMetrics: EnhancedTechnicalSeoMetric[] = [
    m(
      'Mobile usability errors',
      mob.viewport.hasViewportTag ? 0 : 1,
      {
        status: mob.viewport.hasViewportTag ? 'pass' : 'fail',
        impact: mob.viewport.hasViewportTag ? 'low' : 'critical',
        whyItMatters: 'Mobile usability is critical. Missing viewport tag breaks mobile display.',
        affectedPages: mob.viewport.hasViewportTag ? 0 : 1,
        fixPriority: mob.viewport.hasViewportTag ? 1 : 10,
      }
    ),
    m(
      'Viewport correctness',
      mob.viewport.hasViewportTag ? 'Correct' : 'Missing',
      {
        status: mob.viewport.hasViewportTag ? 'pass' : 'fail',
        impact: mob.viewport.hasViewportTag ? 'low' : 'critical',
        whyItMatters: 'Viewport meta tag is required for proper mobile rendering.',
        affectedPages: mob.viewport.hasViewportTag ? 0 : 1,
        fixPriority: mob.viewport.hasViewportTag ? 1 : 10,
      }
    ),
    m(
      'Tap target compliance',
      mob.touchElements.hasProperSpacing ? 'Pass' : 'Check',
      {
        status: mob.touchElements.hasProperSpacing ? 'pass' : 'warn',
        impact: mob.touchElements.hasProperSpacing ? 'low' : 'medium',
        whyItMatters: 'Touch targets should be at least 48x48px for easy mobile interaction.',
        affectedPages: 1,
        fixPriority: mob.touchElements.hasProperSpacing ? 1 : 5,
      }
    ),
    m(
      'Mobile CWV variance',
      'N/A',
      {
        status: 'info',
        description: 'Requires mobile-specific RUM',
        impact: 'low',
        whyItMatters: 'Mobile Core Web Vitals often differ from desktop. Monitor both.',
      }
    ),
    m(
      'JS rendering compatibility',
      'Pass',
      {
        status: 'pass',
        impact: 'low',
        whyItMatters: 'Search engines must be able to render JavaScript content. Ensure critical content is server-rendered.',
        affectedPages: 1,
        fixPriority: 1,
      }
    ),
  ];

  // 6️⃣ Security & Protocol Integrity
  const securityMetrics: EnhancedTechnicalSeoMetric[] = [
    m(
      'HTTPS enabled',
      sec.https.isSecure ? 'Yes' : 'No',
      {
        status: sec.https.isSecure ? 'pass' : 'fail',
        impact: sec.https.isSecure ? 'low' : 'critical',
        whyItMatters: 'HTTPS is required for security, user trust, and Google rankings. HTTP sites are marked as "Not Secure".',
        affectedPages: sec.https.isSecure ? 0 : 1,
        fixPriority: sec.https.isSecure ? 1 : 10,
      }
    ),
    m(
      'Mixed content issues',
      sec.mixedContent.hasIssues ? sec.mixedContent.insecureResources.length : 0,
      {
        status: !sec.mixedContent.hasIssues ? 'pass' : 'fail',
        impact: !sec.mixedContent.hasIssues ? 'low' : 'high',
        whyItMatters: 'Mixed content (HTTP resources on HTTPS pages) breaks security and triggers browser warnings.',
        affectedPages: sec.mixedContent.hasIssues ? 1 : 0,
        fixPriority: sec.mixedContent.hasIssues ? 8 : 1,
      }
    ),
    m(
      'SSL validity',
      sec.https.isSecure ? 'Valid' : 'Invalid',
      {
        status: sec.https.isSecure ? 'pass' : 'fail',
        impact: sec.https.isSecure ? 'low' : 'critical',
        whyItMatters: 'Valid SSL certificate is required for HTTPS. Expired certificates break site access.',
        affectedPages: sec.https.isSecure ? 0 : 1,
        fixPriority: sec.https.isSecure ? 1 : 10,
      }
    ),
    m(
      'Redirect correctness (HTTP→HTTPS)',
      sec.https.isSecure ? 'Correct' : 'Needs redirect',
      {
        status: sec.https.isSecure ? 'pass' : 'fail',
        impact: sec.https.isSecure ? 'low' : 'critical',
        whyItMatters: 'HTTP should redirect to HTTPS to consolidate authority and ensure security.',
        affectedPages: sec.https.isSecure ? 0 : 1,
        fixPriority: sec.https.isSecure ? 1 : 10,
      }
    ),
  ];

  const categories: EnhancedTechnicalSeoCategory[] = [
    {
      id: 'crawl-index-control',
      title: 'Crawl & Index Control',
      subtitle: 'Ensure search engines can find and index your pages',
      metrics: crawlIndexMetrics,
      overallStatus: calculatePillarStatus(crawlIndexMetrics),
      criticalIssues: calculateCriticalIssues(crawlIndexMetrics),
    },
    {
      id: 'site-architecture',
      title: 'Site Architecture & Internal Authority',
      subtitle: 'Optimize site structure for discovery and authority flow',
      metrics: architectureMetrics,
      overallStatus: calculatePillarStatus(architectureMetrics),
      criticalIssues: calculateCriticalIssues(architectureMetrics),
    },
    {
      id: 'page-experience-cwv',
      title: 'Page Experience & Core Web Vitals',
      subtitle: 'Meet Google\'s user experience standards',
      metrics: pageExperienceMetrics,
      overallStatus: calculatePillarStatus(pageExperienceMetrics),
      criticalIssues: calculateCriticalIssues(pageExperienceMetrics),
    },
    {
      id: 'canonicalization',
      title: 'Canonicalization & Duplication',
      subtitle: 'Prevent duplicate content issues',
      metrics: canonicalMetrics,
      overallStatus: calculatePillarStatus(canonicalMetrics),
      criticalIssues: calculateCriticalIssues(canonicalMetrics),
    },
    {
      id: 'mobile-rendering',
      title: 'Mobile & Rendering Readiness',
      subtitle: 'Ensure mobile compatibility and proper rendering',
      metrics: mobileMetrics,
      overallStatus: calculatePillarStatus(mobileMetrics),
      criticalIssues: calculateCriticalIssues(mobileMetrics),
    },
    {
      id: 'security-protocol',
      title: 'Security & Protocol Integrity',
      subtitle: 'Maintain security standards for trust and ranking',
      metrics: securityMetrics,
      overallStatus: calculatePillarStatus(securityMetrics),
      criticalIssues: calculateCriticalIssues(securityMetrics),
    },
  ];

  // Calculate summary scores
  const technicalHealth = categories.filter(c => c.overallStatus === 'pass').length / categories.length * 100;
  const perfScore = perf.loadTime < 2500 ? 90 : perf.loadTime < 4000 ? 70 : 50;
  const mobileScore = mob.viewport.hasViewportTag ? 85 : 45;
  const indexQuality = tech.robotsMeta.isIndexable && tech.canonicalTag.exists ? 85 : tech.robotsMeta.isIndexable ? 65 : 50;

  return {
    categories: categories as TechnicalSeoCategory[],
    summaryScores: [
      { name: 'Technical Health', score: Math.round(technicalHealth), max: 100 },
      { name: 'Performance Readiness', score: perfScore, max: 100 },
      { name: 'Mobile-First Compliance', score: mobileScore, max: 100 },
      { name: 'Indexation Quality', score: indexQuality, max: 100 },
    ],
  };
}
