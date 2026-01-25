import type {
  OffPageSeoReport,
  OffPageSeoCategory,
  OffPageSeoMetric,
} from '@riviso/shared-types';

/** Deterministic seed from domain for consistent demo values per URL. */
function seed(domain: string): number {
  let h = 0;
  for (let i = 0; i < domain.length; i++) {
    h = (h << 5) - h + domain.charCodeAt(i);
    h = h & 0xffff;
  }
  return Math.abs(h);
}

function om(
  name: string,
  value: string | number,
  opts?: {
    unit?: string;
    status?: OffPageSeoMetric['status'];
    description?: string;
    demo?: boolean;
  },
): OffPageSeoMetric {
  return {
    name,
    value,
    ...(opts?.unit && { unit: opts.unit }),
    status: opts?.status ?? 'info',
    ...(opts?.description && { description: opts.description }),
    requiresBacklinkData: !opts?.demo,
  };
}

/**
 * Build an Off-Page SEO report. Uses deterministic demo/sample data when
 * backlink APIs (Majestic, Ahrefs, Moz) are not integrated.
 */
export function buildOffPageSeoReport(domain: string): OffPageSeoReport {
  const s = seed(domain);
  const v = (min: number, max: number) => min + (s % (max - min + 1));
  const pct = (min: number, max: number) => v(min, max);

  const referringDomains = v(12, 180);
  const da = v(18, 52);
  const trustScore = v(35, 78);
  const topicalRelevance = pct(45, 85);
  const followPct = pct(55, 82);
  const highAuthPct = pct(8, 35);

  const toxicPct = pct(0, 8);
  const spamScore = v(8, 28);
  const neighborhoodRisk = v(10, 45);
  const indexedRatio = pct(62, 92);
  const editorialPct = pct(40, 75);
  const contextualPct = pct(35, 68);
  const suspiciousTldPct = pct(2, 14);

  const brandedPct = pct(22, 48);
  const exactMatchPct = pct(3, 18);
  const partialMatchPct = pct(18, 42);
  const genericPct = pct(12, 28);
  const nakedPct = pct(6, 22);
  const diversityScore = v(52, 88);
  const overOptRisk = v(15, 55);

  const newLinks30 = v(2, 24);
  const newLinks90 = v(8, 72);
  const lost30 = v(0, 8);
  const lost90 = v(2, 28);
  const netGrowth = newLinks90 - lost90;
  const churnPct = lost30 > 0 ? Math.min(12, Math.round((lost30 / (referringDomains + lost30)) * 100)) : 0;

  const linkedMentions = v(3, 45);
  const unlinkedMentions = v(8, 120);
  const mentionVel = (linkedMentions + unlinkedMentions) / 30;
  const sentiment = v(48, 78);
  const entityScore = v(25, 65);

  const infoPct = pct(28, 58);
  const commercialPct = pct(20, 45);
  const retentionPct = pct(78, 96);
  const relevanceScore = v(42, 78);

  const authGap = v(-12, 8);
  const rdGap = v(-25, 35);
  const exclusivePct = pct(38, 72);

  const brokenCount = v(0, 5);
  const redirectedPct = pct(8, 28);
  const canonicalPct = pct(85, 100);
  const httpsPct = pct(88, 100);
  const equityRetained = pct(82, 97);

  const citationConsistency = pct(82, 99);
  const napAccuracy = pct(90, 100);
  const reviewVel = (v(1, 15) / 30);
  const reviewSentiment = v(52, 82);
  const localRelevance = pct(25, 65);

  const categories: OffPageSeoCategory[] = [
    {
      id: 'authority-trust',
      title: 'Authority & Trust Signals',
      subtitle: 'Link-based authority and trust',
      metrics: [
        om('Referring Domains', referringDomains, { status: referringDomains >= 50 ? 'pass' : referringDomains >= 10 ? 'warn' : 'fail', demo: true }),
        om('Domain Authority (DA)', da, { status: da >= 40 ? 'pass' : da >= 20 ? 'warn' : 'fail', demo: true }),
        om('Trust Score', trustScore, { status: trustScore >= 60 ? 'pass' : trustScore >= 30 ? 'warn' : 'fail', demo: true }),
        om('Topical Relevance', `${topicalRelevance}%`, { status: topicalRelevance >= 70 ? 'pass' : topicalRelevance >= 40 ? 'warn' : 'fail', demo: true }),
        om('Follow vs Nofollow Ratio', `${followPct}% follow`, { status: followPct >= 20 && followPct <= 80 ? 'pass' : 'warn', demo: true }),
        om('High-Authority Backlink %', `${highAuthPct}%`, { status: highAuthPct >= 25 ? 'pass' : highAuthPct >= 10 ? 'warn' : 'fail', demo: true }),
      ],
    },
    {
      id: 'backlink-quality-risk',
      title: 'Backlink Quality & Risk Control',
      subtitle: 'Toxicity, spam, and neighborhood risk',
      metrics: [
        om('Toxic Backlink %', `${toxicPct}%`, { status: toxicPct < 5 ? 'pass' : toxicPct <= 15 ? 'warn' : 'fail', demo: true }),
        om('Spam Score', spamScore, { status: spamScore <= 30 ? 'pass' : spamScore <= 60 ? 'warn' : 'fail', demo: true }),
        om('Link Neighborhood Risk', neighborhoodRisk, { status: neighborhoodRisk < 20 ? 'pass' : neighborhoodRisk <= 50 ? 'warn' : 'fail', demo: true }),
        om('Indexed Backlink Ratio', `${indexedRatio}%`, { status: indexedRatio >= 70 ? 'pass' : indexedRatio >= 40 ? 'warn' : 'fail', demo: true }),
        om('Editorial vs Non-Editorial Ratio', `${editorialPct}% editorial`, { status: editorialPct >= 60 ? 'pass' : editorialPct >= 30 ? 'warn' : 'fail', demo: true }),
        om('Contextual Link %', `${contextualPct}%`, { status: contextualPct >= 50 ? 'pass' : contextualPct >= 20 ? 'warn' : 'fail', demo: true }),
        om('Suspicious TLD Ratio', `${suspiciousTldPct}%`, { status: suspiciousTldPct < 10 ? 'pass' : suspiciousTldPct <= 25 ? 'warn' : 'fail', demo: true }),
      ],
    },
    {
      id: 'anchor-text-health',
      title: 'Anchor Text Health',
      subtitle: 'Branded, exact, generic, diversity',
      metrics: [
        om('Branded Anchors %', `${brandedPct}%`, { status: brandedPct >= 30 ? 'pass' : brandedPct >= 10 ? 'warn' : 'fail', demo: true }),
        om('Exact-Match Anchors %', `${exactMatchPct}%`, { status: exactMatchPct < 10 ? 'pass' : exactMatchPct <= 25 ? 'warn' : 'fail', demo: true }),
        om('Partial-Match Anchors %', `${partialMatchPct}%`, { status: partialMatchPct >= 20 && partialMatchPct <= 50 ? 'pass' : 'warn', demo: true }),
        om('Generic Anchors %', `${genericPct}%`, { status: genericPct >= 15 && genericPct <= 40 ? 'pass' : 'warn', demo: true }),
        om('Naked URL %', `${nakedPct}%`, { status: nakedPct >= 5 && nakedPct <= 25 ? 'pass' : 'warn', demo: true }),
        om('Anchor Diversity Score', diversityScore, { status: diversityScore >= 70 ? 'pass' : diversityScore >= 40 ? 'warn' : 'fail', demo: true }),
        om('Over-Optimization Risk', overOptRisk, { status: overOptRisk < 20 ? 'pass' : overOptRisk <= 50 ? 'warn' : 'fail', demo: true }),
      ],
    },
    {
      id: 'link-growth-velocity',
      title: 'Link Growth & Velocity',
      subtitle: 'New, lost, net growth, churn',
      metrics: [
        om('New Links (30 / 90 days)', `${newLinks30} / ${newLinks90}`, { status: newLinks30 > 0 ? 'pass' : 'info', demo: true }),
        om('Lost Links (30 / 90 days)', `${lost30} / ${lost90}`, { status: lost30 <= 5 ? 'pass' : 'warn', demo: true }),
        om('Net Link Growth', netGrowth, { status: netGrowth > 0 ? 'pass' : netGrowth === 0 ? 'warn' : 'fail', demo: true }),
        om('Link Velocity Trend', netGrowth > 2 ? 'Up' : netGrowth >= -2 ? 'Flat' : 'Down', { status: netGrowth > 0 ? 'pass' : netGrowth >= -2 ? 'warn' : 'fail', demo: true }),
        om('Abnormal Spike Detection', newLinks30 > 15 ? 'Elevated' : 'Normal', { status: newLinks30 > 15 ? 'warn' : 'pass', demo: true }),
        om('Link Churn Rate', `${churnPct}%`, { status: churnPct < 5 ? 'pass' : churnPct <= 15 ? 'warn' : 'fail', demo: true }),
      ],
    },
    {
      id: 'brand-entity',
      title: 'Brand & Entity Signals',
      subtitle: 'Mentions, sentiment, entity authority',
      metrics: [
        om('Linked Brand Mentions', linkedMentions, { demo: true }),
        om('Unlinked Brand Mentions', unlinkedMentions, { demo: true }),
        om('Brand Mention Velocity', mentionVel.toFixed(2) + '/day', { demo: true }),
        om('Brand Sentiment Score', sentiment, { status: sentiment >= 60 ? 'pass' : sentiment >= 40 ? 'warn' : 'fail', demo: true }),
        om('Brand-to-Link Ratio', (linkedMentions / Math.max(1, unlinkedMentions)).toFixed(2), { demo: true }),
        om('Entity Authority Score', entityScore, { status: entityScore >= 50 ? 'pass' : entityScore >= 20 ? 'warn' : 'fail', demo: true }),
      ],
    },
    {
      id: 'content-driven-authority',
      title: 'Content-Driven Authority',
      subtitle: 'Informational vs commercial, retention',
      metrics: [
        om('Backlinks to Informational Content', `${infoPct}%`, { status: infoPct >= 30 ? 'pass' : infoPct >= 10 ? 'warn' : 'fail', demo: true }),
        om('Backlinks to Commercial Pages', `${commercialPct}%`, { demo: true }),
        om('Evergreen Link Retention', `${retentionPct}%`, { status: retentionPct >= 85 ? 'pass' : retentionPct >= 70 ? 'warn' : 'fail', demo: true }),
        om('Content-to-Link Relevance Score', relevanceScore, { status: relevanceScore >= 60 ? 'pass' : relevanceScore >= 40 ? 'warn' : 'fail', demo: true }),
      ],
    },
    {
      id: 'competitive-benchmarking',
      title: 'Competitive Benchmarking',
      subtitle: 'Vs. competitors',
      metrics: [
        om('Authority Gap vs Competitors', authGap >= 0 ? `+${authGap}` : authGap, { status: authGap > 0 ? 'pass' : authGap >= -10 ? 'warn' : 'fail', demo: true }),
        om('Referring Domain Gap', rdGap >= 0 ? `+${rdGap}` : rdGap, { status: rdGap > 0 ? 'pass' : 'warn', demo: true }),
        om('Link Quality Gap', authGap >= 0 ? 'Ahead' : 'Behind', { status: authGap >= 0 ? 'pass' : 'warn', demo: true }),
        om('Anchor Profile Comparison', 'Similar to peers', { status: 'info', demo: true }),
        om('Shared vs Exclusive Backlinks', `${exclusivePct}% exclusive`, { status: exclusivePct >= 60 ? 'pass' : exclusivePct >= 30 ? 'warn' : 'fail', demo: true }),
      ],
    },
    {
      id: 'technical-integrity-backlinks',
      title: 'Technical Integrity of Backlinks',
      subtitle: 'Broken, redirects, equity loss',
      metrics: [
        om('Broken Backlinks', brokenCount, { status: brokenCount < 2 ? 'pass' : brokenCount <= 5 ? 'warn' : 'fail', demo: true }),
        om('Redirected Backlinks', `${redirectedPct}%`, { status: redirectedPct < 20 ? 'pass' : redirectedPct <= 40 ? 'warn' : 'fail', demo: true }),
        om('Canonicalized Backlinks', `${canonicalPct}%`, { status: canonicalPct >= 90 ? 'pass' : canonicalPct >= 70 ? 'warn' : 'fail', demo: true }),
        om('HTTP vs HTTPS Accuracy', `${httpsPct}% HTTPS`, { status: httpsPct >= 95 ? 'pass' : httpsPct >= 80 ? 'warn' : 'fail', demo: true }),
        om('JavaScript-Blocked Backlinks', v(0, 4), { status: 'info', demo: true }),
        om('Link Equity Loss Estimation', `${100 - equityRetained}% loss`, { status: equityRetained >= 90 ? 'pass' : equityRetained >= 75 ? 'warn' : 'fail', demo: true }),
      ],
    },
    {
      id: 'local-offpage',
      title: 'Local Off-Page Signals',
      subtitle: 'Citations, NAP, reviews (conditional)',
      metrics: [
        om('Citation Consistency', `${citationConsistency}%`, { status: citationConsistency >= 95 ? 'pass' : citationConsistency >= 80 ? 'warn' : 'fail', demo: true }),
        om('NAP Accuracy', `${napAccuracy}%`, { status: napAccuracy >= 98 ? 'pass' : napAccuracy >= 90 ? 'warn' : 'fail', demo: true }),
        om('Review Velocity', reviewVel.toFixed(2) + '/day', { demo: true }),
        om('Review Sentiment', reviewSentiment, { status: reviewSentiment >= 60 ? 'pass' : 'warn', demo: true }),
        om('Local Backlink Relevance', `${localRelevance}%`, { status: localRelevance >= 40 ? 'pass' : localRelevance >= 20 ? 'warn' : 'fail', demo: true }),
      ],
    },
  ];

  const offpageScore = Math.min(100, Math.max(0, v(48, 78)));
  const trust = Math.min(100, trustScore + v(-5, 10));
  const risk = Math.min(100, Math.max(0, toxicPct * 3 + neighborhoodRisk / 2));
  const brand = Math.min(100, Math.round((sentiment + entityScore) / 2));
  const comp = Math.min(100, Math.max(0, 50 + authGap + rdGap / 5));

  return {
    categories,
    demoData: true,
    summaryScores: [
      { name: 'Off-Page SEO Score', score: offpageScore, max: 100 },
      { name: 'Link Trust Score', score: trust, max: 100 },
      { name: 'Link Risk Score', score: Math.max(0, 100 - risk), max: 100 },
      { name: 'Brand Authority Score', score: brand, max: 100 },
      { name: 'Competitive Authority Index', score: comp, max: 100 },
    ],
  };
}
