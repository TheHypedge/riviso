import type {
  OffPageSeoReport,
  OffPageSeoCategory,
  OffPageSeoMetric,
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
  opts?: { unit?: string; status?: OffPageSeoMetric['status']; description?: string },
): OffPageSeoMetric {
  return {
    name,
    value,
    ...(opts?.unit && { unit: opts.unit }),
    status: opts?.status ?? 'info',
    ...(opts?.description && { description: opts.description }),
    requiresBacklinkData: false,
  };
}

/**
 * Map scraper-engine /off-page-analyze response to OffPageSeoReport.
 * Uses live values where available; N/A for metrics the engine doesn't compute.
 */
export function mapEngineResponseToOffPageReport(
  res: EngineOffPageResponse,
): OffPageSeoReport {
  const rd = res.referring_domains;
  const da = res.estimated_da;
  const totalBacklinks = res.total_backlinks;
  const followPct = res.follow_pct;

  const followVsNofollowValue =
    totalBacklinks === 0
      ? 'No backlinks in crawl'
      : `${followPct.toFixed(1)}% follow`;
  const followVsNofollowStatus: OffPageSeoMetric['status'] =
    totalBacklinks === 0
      ? 'info'
      : followPct >= 20 && followPct <= 80
        ? 'pass'
        : 'warn';
  const followVsNofollowDesc =
    totalBacklinks === 0
      ? 'Crawl only included your site. Backlinks = links from other sites to you. Add referrer URLs (GSC, logs) via /ingest-referrers or crawl those pages.'
      : undefined;

  const categories: OffPageSeoCategory[] = [
    {
      id: 'authority-trust',
      title: 'Authority & Trust Signals',
      subtitle: 'Link-based authority and trust',
      metrics: [
        m('Referring Domains', rd, {
          status: rd >= 50 ? 'pass' : rd >= 10 ? 'warn' : 'fail',
        }),
        m('Domain Authority (DA)', Math.round(da * 10) / 10, {
          status: da >= 40 ? 'pass' : da >= 20 ? 'warn' : 'fail',
          description: 'Estimated from your crawl; not Moz/Ahrefs.',
        }),
        m('Trust Score', 'N/A', { status: 'info', description: 'Requires per-domain trust data.' }),
        m('Topical Relevance', 'N/A', { status: 'info', description: 'Requires topic classification.' }),
        m('Follow vs Nofollow Ratio', followVsNofollowValue, {
          status: followVsNofollowStatus,
          ...(followVsNofollowDesc && { description: followVsNofollowDesc }),
        }),
        m('High-Authority Backlink %', 'N/A', { status: 'info', description: 'Requires DA per referrer.' }),
      ],
    },
    {
      id: 'backlink-quality-risk',
      title: 'Backlink Quality & Risk Control',
      subtitle: 'Toxicity, spam, and neighborhood risk',
      metrics: [
        m('Toxic Backlink %', 'N/A', { status: 'info', description: 'Requires toxicity flags.' }),
        m('Spam Score', 'N/A', { status: 'info', description: 'Requires spam data.' }),
        m('Link Neighborhood Risk', 'N/A', { status: 'info', description: 'Requires referrer risk data.' }),
        m('Indexed Backlink Ratio', 'N/A', { status: 'info', description: 'Requires index data.' }),
        m('Editorial vs Non-Editorial Ratio', 'N/A', { status: 'info', description: 'Requires placement data.' }),
        m('Contextual Link %', 'N/A', { status: 'info', description: 'Requires source-page analysis.' }),
        m('Suspicious TLD Ratio', 'N/A', { status: 'info', description: 'Requires TLD classification.' }),
      ],
    },
    {
      id: 'anchor-text-health',
      title: 'Anchor Text Health',
      subtitle: 'Branded, exact, generic, diversity',
      metrics: [
        m('Branded Anchors %', 'N/A', { status: 'info', description: 'Requires anchor + brand list.' }),
        m('Exact-Match Anchors %', 'N/A', { status: 'info', description: 'Requires anchor + keywords.' }),
        m('Partial-Match Anchors %', 'N/A', { status: 'info' }),
        m('Generic Anchors %', 'N/A', { status: 'info' }),
        m('Naked URL %', 'N/A', { status: 'info' }),
        m('Anchor Diversity Score', 'N/A', { status: 'info' }),
        m('Over-Optimization Risk', 'N/A', { status: 'info' }),
      ],
    },
    {
      id: 'link-growth-velocity',
      title: 'Link Growth & Velocity',
      subtitle: 'New, lost, net growth, churn',
      metrics: [
        m('New Links (30 / 90 days)', 'N/A', { status: 'info', description: 'Requires historical crawl.' }),
        m('Lost Links (30 / 90 days)', 'N/A', { status: 'info' }),
        m('Net Link Growth', 'N/A', { status: 'info' }),
        m('Link Velocity Trend', 'N/A', { status: 'info' }),
        m('Abnormal Spike Detection', 'N/A', { status: 'info' }),
        m('Link Churn Rate', 'N/A', { status: 'info' }),
      ],
    },
    {
      id: 'brand-entity',
      title: 'Brand & Entity Signals',
      subtitle: 'Mentions, sentiment, entity authority',
      metrics: [
        m('Linked Brand Mentions', 'N/A', { status: 'info' }),
        m('Unlinked Brand Mentions', 'N/A', { status: 'info' }),
        m('Brand Mention Velocity', 'N/A', { status: 'info' }),
        m('Brand Sentiment Score', 'N/A', { status: 'info' }),
        m('Brand-to-Link Ratio', 'N/A', { status: 'info' }),
        m('Entity Authority Score', 'N/A', { status: 'info' }),
      ],
    },
    {
      id: 'content-driven-authority',
      title: 'Content-Driven Authority',
      subtitle: 'Informational vs commercial, retention',
      metrics: [
        m('Backlinks to Informational Content', 'N/A', { status: 'info' }),
        m('Backlinks to Commercial Pages', 'N/A', { status: 'info' }),
        m('Evergreen Link Retention', 'N/A', { status: 'info' }),
        m('Content-to-Link Relevance Score', 'N/A', { status: 'info' }),
      ],
    },
    {
      id: 'competitive-benchmarking',
      title: 'Competitive Benchmarking',
      subtitle: 'Vs. competitors',
      metrics: [
        m('Authority Gap vs Competitors', 'N/A', { status: 'info' }),
        m('Referring Domain Gap', 'N/A', { status: 'info' }),
        m('Link Quality Gap', 'N/A', { status: 'info' }),
        m('Anchor Profile Comparison', 'N/A', { status: 'info' }),
        m('Shared vs Exclusive Backlinks', 'N/A', { status: 'info' }),
      ],
    },
    {
      id: 'technical-integrity-backlinks',
      title: 'Technical Integrity of Backlinks',
      subtitle: 'Broken, redirects, equity loss',
      metrics: [
        m('Broken Backlinks', 'N/A', { status: 'info' }),
        m('Redirected Backlinks', 'N/A', { status: 'info' }),
        m('Canonicalized Backlinks', 'N/A', { status: 'info' }),
        m('HTTP vs HTTPS Accuracy', 'N/A', { status: 'info' }),
        m('JavaScript-Blocked Backlinks', 'N/A', { status: 'info' }),
        m('Link Equity Loss Estimation', 'N/A', { status: 'info' }),
      ],
    },
    {
      id: 'local-offpage',
      title: 'Local Off-Page Signals',
      subtitle: 'Citations, NAP, reviews (conditional)',
      metrics: [
        m('Citation Consistency', 'N/A', { status: 'info' }),
        m('NAP Accuracy', 'N/A', { status: 'info' }),
        m('Review Velocity', 'N/A', { status: 'info' }),
        m('Review Sentiment', 'N/A', { status: 'info' }),
        m('Local Backlink Relevance', 'N/A', { status: 'info' }),
      ],
    },
  ];

  const offpageScore = Math.min(100, Math.max(0, Math.round(da * 0.6 + (rd >= 10 ? 20 : rd >= 1 ? 10 : 0) + followPct * 0.2)));
  const trustScore = Math.min(100, Math.round(da * 0.8));
  const nofollowRatio = totalBacklinks > 0 ? res.nofollow_count / totalBacklinks : 0;
  const riskScore = Math.max(0, Math.min(100, 100 - Math.round(nofollowRatio * 30)));

  return {
    demoData: false,
    engineMeta: {
      pagesCrawled: res.pages_crawled,
      referringDomains: rd,
      totalBacklinks,
    },
    categories,
    summaryScores: [
      { name: 'Off-Page SEO Score', score: offpageScore, max: 100 },
      { name: 'Link Trust Score', score: trustScore, max: 100 },
      { name: 'Link Risk Score', score: riskScore, max: 100 },
      { name: 'Brand Authority Score', score: 0, max: 100 },
      { name: 'Competitive Authority Index', score: 0, max: 100 },
    ],
  };
}
