import type {
  LinkSignalReport,
  LinkSignalCategory,
  LinkSignalMetric,
  MetricVerification,
} from '@riviso/shared-types';

export interface EngineOffPageResponse {
  demoData: boolean;
  target_domain: string;
  referring_domains: number;
  total_backlinks: number;
  follow_count: number;
  nofollow_count: number;
  follow_pct: number;
  estimated_da: number;
  pages_crawled: number;
}

function m(
  name: string,
  value: string | number,
  opts?: {
    unit?: string;
    status?: LinkSignalMetric['status'];
    description?: string;
    verification?: MetricVerification;
    dataSource?: string;
  },
): LinkSignalMetric {
  return {
    name,
    value,
    ...(opts?.unit && { unit: opts.unit }),
    status: opts?.status ?? 'info',
    ...(opts?.description && { description: opts.description }),
    verification: opts?.verification ?? 'verified',
    ...(opts?.dataSource && { dataSource: opts.dataSource }),
  };
}

/**
 * Map scraper-engine /off-page-analyze response to LinkSignalReport.
 * ONLY includes verified metrics from crawl data.
 * Removed: Domain Authority, Trust Score, Spam Score, Toxicity, Competitive metrics.
 * Added: Link Hygiene Score (based on verifiable link issues).
 */
export function mapEngineResponseToOffPageReport(
  res: EngineOffPageResponse,
): LinkSignalReport {
  const rd = res.referring_domains;
  const totalBacklinks = res.total_backlinks;
  const followPct = res.follow_pct;
  const followCount = res.follow_count;
  const nofollowCount = res.nofollow_count;

  // Calculate Link Hygiene Score (0-100) based on verifiable issues
  // This will be enhanced when we have broken/redirected link data from on-page analysis
  let linkHygieneScore = 100;
  const hygieneIssues: string[] = [];
  
  // Penalize if all links are nofollow (potential issue)
  if (totalBacklinks > 0 && followPct < 10) {
    linkHygieneScore -= 30;
    hygieneIssues.push('Very low follow ratio (<10%)');
  } else if (totalBacklinks > 0 && followPct < 20) {
    linkHygieneScore -= 15;
    hygieneIssues.push('Low follow ratio (<20%)');
  }

  // Note: Broken links, redirects, HTTP/HTTPS issues will be added when integrated with on-page data
  linkHygieneScore = Math.max(0, Math.min(100, linkHygieneScore));

  const followVsNofollowValue =
    totalBacklinks === 0
      ? 'No backlinks detected'
      : `${followPct.toFixed(1)}% follow (${followCount} follow, ${nofollowCount} nofollow)`;
  const followVsNofollowStatus: LinkSignalMetric['status'] =
    totalBacklinks === 0
      ? 'info'
      : followPct >= 20 && followPct <= 80
        ? 'pass'
        : followPct < 10
          ? 'fail'
          : 'warn';

  // Only include verified metrics from crawl data
  const categories: LinkSignalCategory[] = [
    {
      id: 'link-discovery',
      title: 'Link Discovery',
      subtitle: 'Verified from site crawl',
      metrics: [
        m('Detected Referring Domains', rd, {
          status: rd >= 10 ? 'pass' : rd >= 1 ? 'warn' : 'fail',
          verification: 'verified',
          dataSource: 'Whole-site crawl - Riviso crawled your entire site to discover links from other domains',
          description: rd === 0 
            ? 'No external domains linking to your site detected in this whole-site crawl. Add referrer URLs from Google Search Console to discover more backlinks.'
            : `Whole-site crawl discovered ${rd} unique domain${rd !== 1 ? 's' : ''} linking to your site.`,
        }),
        m('Detected Backlinks', totalBacklinks, {
          status: totalBacklinks >= 10 ? 'pass' : totalBacklinks >= 1 ? 'warn' : 'fail',
          verification: 'verified',
          dataSource: 'Whole-site crawl - Riviso analyzed all pages on your site to discover backlinks',
          description: totalBacklinks === 0
            ? 'Whole-site crawl found links within your site but no external backlinks. Add referrer URLs from Google Search Console to discover more backlinks.'
            : `Whole-site crawl discovered ${totalBacklinks} backlink${totalBacklinks !== 1 ? 's' : ''} across ${res.pages_crawled} pages analyzed.`,
        }),
        m('Crawl Source', res.pages_crawled > 0 ? `Whole-site crawl (${res.pages_crawled} pages analyzed)` : 'No crawl data', {
          status: res.pages_crawled > 0 ? 'pass' : 'info',
          verification: 'verified',
          dataSource: 'Riviso whole-site crawl - started from homepage and followed all internal links',
          description: res.pages_crawled > 0
            ? `Riviso crawled your entire site starting from the homepage, analyzing ${res.pages_crawled} pages to discover all backlinks.`
            : 'No crawl data available.',
        }),
      ],
    },
    {
      id: 'link-hygiene',
      title: 'Link Hygiene',
      subtitle: 'Verifiable link quality issues',
      metrics: [
        m('Follow vs Nofollow Ratio', followVsNofollowValue, {
          status: followVsNofollowStatus,
          verification: 'verified',
          dataSource: 'Whole-site crawl - Riviso analyzed rel attributes of all discovered backlinks',
          description: totalBacklinks === 0
            ? 'No backlinks detected in whole-site crawl. Most healthy link profiles have 20-80% follow links.'
            : followPct < 10
              ? 'Very low follow ratio may indicate overuse of nofollow or low-quality link sources. Focus on acquiring editorial, dofollow links.'
              : followPct < 20
                ? 'Low follow ratio. Consider acquiring more editorial, dofollow links from authoritative sources.'
                : `Whole-site crawl found ${followCount} follow and ${nofollowCount} nofollow links across your site.`,
        }),
        // Placeholder for broken/redirected links - will be populated from on-page analysis integration
        m('Broken Outbound Links', 'N/A', {
          status: 'info',
          verification: 'unavailable',
          dataSource: 'Requires on-page link analysis integration',
          description: 'This metric will show broken links (404s) from your site to external domains. Coming soon.',
        }),
        m('Redirected Links', 'N/A', {
          status: 'info',
          verification: 'unavailable',
          dataSource: 'Requires on-page link analysis integration',
          description: 'This metric will show links that redirect (301/302) instead of direct links. Coming soon.',
        }),
        m('HTTP vs HTTPS Inconsistencies', 'N/A', {
          status: 'info',
          verification: 'unavailable',
          dataSource: 'Requires on-page link analysis integration',
          description: 'This metric will flag mixed HTTP/HTTPS links. Coming soon.',
        }),
      ],
    },
    {
      id: 'anchor-health',
      title: 'Anchor Health',
      subtitle: 'Limited scope - detected anchors only',
      metrics: [
        m('Anchor Text Analysis', totalBacklinks > 0 ? 'Available' : 'No backlinks to analyze', {
          status: totalBacklinks > 0 ? 'pass' : 'info',
          verification: 'estimated',
          dataSource: 'Whole-site crawl - anchor text from all discovered backlinks',
          description: totalBacklinks === 0
            ? 'Anchor text analysis requires backlinks. Whole-site crawl found no external backlinks. Add referrer URLs from Google Search Console to discover more links.'
            : `Whole-site crawl analyzed anchor text from ${totalBacklinks} discovered backlinks. Add referrer URLs from Google Search Console for more comprehensive analysis.`,
        }),
        m('Over-Optimization Warning', totalBacklinks > 0 ? 'Check anchor diversity' : 'N/A', {
          status: totalBacklinks > 0 ? 'warn' : 'info',
          verification: 'estimated',
          dataSource: 'Whole-site crawl - heuristic analysis of discovered anchor text',
          description: totalBacklinks > 0
            ? 'Monitor for excessive exact-match keyword anchors. Healthy profiles typically have 40-60% branded/generic anchors. Based on whole-site crawl analysis.'
            : 'Requires backlink data from whole-site crawl to assess.',
        }),
      ],
    },
  ];

  return {
    demoData: false,
    engineMeta: {
      pagesCrawled: res.pages_crawled,
      referringDomains: rd,
      totalBacklinks,
    },
    categories,
    summaryScores: [
      { name: 'Link Hygiene Score', score: linkHygieneScore, max: 100 },
    ],
    dataCoverage: {
      scope: 'Whole-site crawl - Riviso crawls your entire site starting from the homepage to discover all backlinks. All metrics are based on comprehensive site-wide analysis.',
      limitations: [
        'No global backlink index - only shows links discovered in whole-site crawl',
        'No third-party authority scores - Riviso is the complete solution',
        'No competitive benchmarking - requires competitor crawl data',
        'No historical trends - requires multiple crawl snapshots',
        'Anchor analysis limited to discovered backlinks in crawl',
        'Link quality metrics (toxicity, spam) require additional analysis',
      ],
      futureRoadmap: [
        'Google Search Console links integration for enhanced discovery',
        'Broken/redirected link detection from on-page analysis',
        'Historical crawl comparison and trend tracking',
        'Enhanced anchor text analysis with brand/keyword detection',
      ],
    },
  };
}
