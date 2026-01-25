/**
 * Meaning, how it's measured, and improvement tips for Off-Page SEO metrics.
 * Keyed by exact metric name from the API. See docs/off-page-seo-audit-framework.md.
 */

export interface MetricResource {
  label: string;
  url: string;
}

export interface MetricInfo {
  meaning: string;
  howMeasured: string;
  improvementTips: string[];
  /** Data sources (APIs, crawlers) used to compute this metric. */
  dataSources?: string;
  /** Risk thresholds: Good / Warning / Needs improvement rules. */
  riskThresholds?: string;
  /** How to verify accuracy (e.g. compare with Ahrefs/Moz). */
  howToVerify?: string;
  /** External resources / links for further reading. */
  resources?: MetricResource[];
}

/** Shared resources for verifying off-page metrics. */
const BACKLINK_RESOURCES: MetricResource[] = [
  { label: 'Ahrefs Backlink Checker', url: 'https://ahrefs.com/backlink-checker' },
  { label: 'Moz Link Explorer', url: 'https://moz.com/link-explorer' },
  { label: 'Majestic Site Explorer', url: 'https://majestic.com/reports/site-explorer' },
];

const METRIC_INFO: Record<string, MetricInfo> = {
  'Referring Domains': {
    meaning: 'Count of unique domains linking to your site. Signals breadth of endorsement; search engines use it as a diversity proxy.',
    howMeasured: 'Backlink index from Majestic, Ahrefs, or Moz. Distinct source domains are counted after normalizing (e.g. strip www, resolve redirects).',
    improvementTips: ['Earn links from diverse, relevant sites.', 'Focus on quality over quantity.', 'Avoid PBNs and link schemes.'],
    dataSources: 'Majestic, Ahrefs, Moz Link Explorer, Serpstat, Semrush Backlink Analytics.',
    riskThresholds: 'Good: ≥50 | Warning: 10–49 | Needs improvement: <10 (adjust by niche).',
    howToVerify: 'Enter your domain in Ahrefs Site Explorer or Moz Link Explorer and compare "Referring domains" / "Linking domains".',
    resources: BACKLINK_RESOURCES,
  },
  'Domain Authority (DA)': {
    meaning: 'Composite 0–100 score predicting ability to rank. Used for prioritization and competitive comparison.',
    howMeasured: 'From Moz, Ahrefs DR, or Majestic. Derived from link volume, linking root domains, and quality. Fallback: proxy from referring domains + total links.',
    improvementTips: ['Build quality backlinks over time.', 'Improve topical relevance and trust.', 'Disavow toxic links when appropriate.'],
    dataSources: 'Moz API (DA), Ahrefs DR, Majestic Trust Flow, Semrush Authority Score.',
    riskThresholds: 'Good: ≥40 | Warning: 20–39 | Needs improvement: <20.',
    howToVerify: 'Check Moz Link Explorer (DA) or Ahrefs (DR) for your domain. Values may differ slightly between tools.',
    resources: BACKLINK_RESOURCES,
  },
  'Trust Score': {
    meaning: 'Aggregate trustworthiness of referring domains. Low trust suggests spammy or manipulative link sources.',
    howMeasured: 'Weighted average of trust metrics (e.g. Majestic Trust Flow) per referring domain, normalized to 0–100.',
    improvementTips: ['Earn links from established, reputable sites.', 'Avoid low-trust directories and link farms.', 'Monitor and disavow toxic links.'],
    dataSources: 'Majestic Trust Flow, Moz Spam Score (inverse), Ahrefs DR + linked domains quality.',
    riskThresholds: 'Good: ≥60 | Warning: 30–59 | Needs improvement: <30.',
    howToVerify: 'Use Majestic for Trust Flow. Compare link profile quality in Ahrefs or Moz.',
    resources: BACKLINK_RESOURCES,
  },
  'Topical Relevance': {
    meaning: 'Share of backlinks from topically related domains. Related links are valued higher and reduce relevance mismatch risk.',
    howMeasured: 'Target and referrers are classified by topic; percentage of links from matching topics is computed.',
    improvementTips: ['Pursue links from sites in your niche.', 'Create content that attracts relevant publishers.', 'Avoid off-topic link building.'],
    dataSources: 'Majestic Topical Trust Flow, custom taxonomy + referrer content, keyword overlap.',
    riskThresholds: 'Good: ≥70% | Warning: 40–69% | Needs improvement: <40%.',
    howToVerify: 'Audit referrers in Ahrefs/Moz; manually check if linking sites are topically relevant.',
    resources: BACKLINK_RESOURCES,
  },
  'Follow vs Nofollow Ratio': {
    meaning: 'Balance of dofollow (link equity) vs nofollow links. Extreme skew may indicate manipulation.',
    howMeasured: 'Backlink index stores rel per link. Counts of follow and nofollow are used to compute the ratio.',
    improvementTips: ['Aim for a natural mix; no single ideal.', 'Avoid 100% dofollow or 100% nofollow.', 'Nofollow from strong sites still adds value.'],
    dataSources: 'Backlink index with rel attribute (Ahrefs, Majestic, Moz).',
    riskThresholds: 'Good: 20–80% follow | Warning: 81–95% or 5–19% | Needs improvement: >95% or <5%.',
    howToVerify: 'In Ahrefs or Moz, filter backlinks by dofollow vs nofollow and compare ratios.',
    resources: BACKLINK_RESOURCES,
  },
  'High-Authority Backlink %': {
    meaning: 'Share of links from domains with DA ≥ threshold (e.g. 50). Concentrates authority and trust.',
    howMeasured: 'DA/DR per referring domain; count links from domains above threshold; report as % of total.',
    improvementTips: ['Prioritize outreach to higher-DA sites.', 'Create link-worthy content.', 'Build relationships with authoritative publishers.'],
    dataSources: 'Backlink index + DA/DR per referring domain (Moz, Ahrefs).',
    riskThresholds: 'Good: ≥25% | Warning: 10–24% | Needs improvement: <10%.',
    howToVerify: 'Export referrers from Ahrefs/Moz, filter by DA/DR ≥ 50, and compute % of total links.',
    resources: BACKLINK_RESOURCES,
  },
  'Toxic Backlink %': {
    meaning: 'Share of links from domains likely to trigger algorithmic or manual penalty. Drives disavow decisions.',
    howMeasured: 'Toxicity/spam flags per referring domain from provider; percentage of links from toxic domains.',
    improvementTips: ['Audit and disavow toxic links.', 'Avoid buying links or participating in link schemes.', 'Monitor link profile regularly.'],
    dataSources: 'Moz Spam Score, Majestic toxicity flags, Ahrefs "potentially toxic", custom rules.',
    riskThresholds: 'Good: <5% | Warning: 5–15% | Needs improvement: >15%.',
    howToVerify: 'Use Moz Link Spam or Ahrefs toxicity flags; audit "toxic" referrers and compare counts.',
    resources: BACKLINK_RESOURCES,
  },
  'Spam Score': {
    meaning: 'Likelihood a domain is used for spam. Informs disavow prioritization and outreach.',
    howMeasured: 'Per-domain metric from Moz or similar (0–100 or 0–17). Aggregate for profile via weighted average.',
    improvementTips: ['Disavow links from high-spam domains.', 'Avoid link exchange networks and low-quality directories.', 'Focus on editorial, earned links.'],
    dataSources: 'Moz Spam Score API, Majestic, custom spam model.',
    riskThresholds: 'Good: ≤30 (0–100 scale) | Warning: 31–60 | Needs improvement: >60.',
    howToVerify: 'Check Moz Spam Score for your domain; review spam score of top referrers in Link Explorer.',
    resources: BACKLINK_RESOURCES,
  },
  'Link Neighborhood Risk': {
    meaning: 'Risk from linking to or being linked by spammy domains. Composite of inbound and optional outbound risk.',
    howMeasured: 'Weighted risk from referrer spam/toxic flags; optionally from target’s outbound links to bad domains.',
    improvementTips: ['Clean up outbound links to spammy sites.', 'Disavow high-risk inbound links.', 'Monitor linking neighborhood over time.'],
    dataSources: 'Backlink index, spam/toxic flags, optional outbound crawl.',
    riskThresholds: 'Good: <20 | Warning: 20–50 | Needs improvement: >50.',
    howToVerify: 'Audit referrers for spam signals; check your outbound links to low-quality domains.',
    resources: BACKLINK_RESOURCES,
  },
  'Indexed Backlink Ratio': {
    meaning: 'Share of known backlinks that Google has indexed. Low ratio can indicate low-quality or devalued links.',
    howMeasured: 'Total backlinks from provider vs. indexed count (API, site: checks, or provider metric).',
    improvementTips: ['Ensure linking pages are indexable.', 'Fix technical issues on source pages.', 'Prioritize links from quality, crawlable sites.'],
    dataSources: 'Backlink index; Google Indexing API, site: checks, or provider "indexed" metric.',
    riskThresholds: 'Good: ≥70% | Warning: 40–69% | Needs improvement: <40%.',
    howToVerify: 'Compare "Indexed" vs "Total" in Ahrefs/Moz; or sample backlinks and check site: in Google.',
    resources: BACKLINK_RESOURCES,
  },
  'Editorial vs Non-Editorial Ratio': {
    meaning: 'Editorial links (in-content, earned) are higher quality. Non-editorial (footer, widget, profile) can look manipulative if dominant.',
    howMeasured: 'Placement classification per source URL; ratio of editorial to total links.',
    improvementTips: ['Pursue in-content, editorial links.', 'Limit footer/widget/profile link reliance.', 'Create content that earns natural citations.'],
    dataSources: 'Backlink index with placement (content vs footer/sidebar/widget); URL path heuristics.',
    riskThresholds: 'Good: ≥60% editorial | Warning: 30–59% | Needs improvement: <30%.',
    howToVerify: 'Manually review sample of referrer URLs; check if links are in main content vs footer/sidebar.',
    resources: BACKLINK_RESOURCES,
  },
  'Contextual Link %': {
    meaning: 'Links within body content are typically stronger than standalone (blogroll, footer).',
    howMeasured: 'Per backlink, determine if anchor is in main content (e.g. article, main); report % contextual.',
    improvementTips: ['Secure links within article body where relevant.', 'Avoid link-only footers or sidebars.', 'Offer unique, citable content.'],
    dataSources: 'Backlink index with "contextual" flag, or crawl of source page + DOM analysis.',
    riskThresholds: 'Good: ≥50% | Warning: 20–49% | Needs improvement: <20%.',
    howToVerify: 'Sample referrer pages; check if link is inside <article> / <main> vs footer/nav.',
    resources: BACKLINK_RESOURCES,
  },
  'Suspicious TLD Ratio': {
    meaning: 'Share of links from TLDs commonly used in spam (e.g. .xyz, .top). High share increases risk.',
    howMeasured: 'TLD per referring domain vs. configurable suspicious list; percentage of links from those TLDs.',
    improvementTips: ['Disavow links from spammy TLDs.', 'Avoid building links on suspicious TLDs.', 'Focus on mainstream TLDs when acquiring links.'],
    dataSources: 'Backlink index; configurable TLD allowlist/blocklist.',
    riskThresholds: 'Good: <10% | Warning: 10–25% | Needs improvement: >25%.',
    howToVerify: 'Export referrers, group by TLD; compare % from .xyz, .top, .work, etc.',
    resources: BACKLINK_RESOURCES,
  },
  'Branded Anchors %': {
    meaning: 'Links with your brand name in the anchor. Reinforces brand authority.',
    howMeasured: 'Anchor text per link; match against brand list; report % of total.',
    improvementTips: ['Build brand awareness to earn branded links.', 'Use consistent brand name across channels.', 'Natural branded anchors come with recognition.'],
    dataSources: 'Backlink API (anchor text); brand list.',
    riskThresholds: 'Good: ≥30% | Warning: 10–29% | Needs improvement: <10%.',
    howToVerify: 'Export anchor text from Ahrefs/Moz; count anchors containing your brand; compute % of total.',
    resources: BACKLINK_RESOURCES,
  },
  'Exact-Match Anchors %': {
    meaning: 'Anchors that exactly match target keywords. High % can trigger over-optimization.',
    howMeasured: 'Exact match of normalized anchor vs. keyword set; report % of total.',
    improvementTips: ['Keep exact-match share low (<10% typically).', 'Diversify anchor text naturally.', 'Avoid exact-match-focused link building.'],
    dataSources: 'Backlink API (anchor text); keyword set.',
    riskThresholds: 'Good: <10% | Warning: 10–25% | Needs improvement: >25%.',
    howToVerify: 'Export anchors from Ahrefs/Moz; count exact matches to target keywords; compute %.',
    resources: BACKLINK_RESOURCES,
  },
  'Partial-Match Anchors %': {
    meaning: 'Anchors that contain but do not exactly match keywords. Partial relevance without over-optimization.',
    howMeasured: 'Substring match of anchor vs. keywords; report % of total.',
    improvementTips: ['Aim for a natural mix of partial-match anchors.', 'Use varied phrasing in outreach.', 'Avoid forcing keyword-heavy anchors.'],
    dataSources: 'Backlink API (anchor text); keyword set.',
    riskThresholds: 'Good: 20–50% | Warning: 10–19% or 51–70% | Needs improvement: <10% or >70%.',
    howToVerify: 'Same as exact-match; use substring match instead of exact.',
    resources: BACKLINK_RESOURCES,
  },
  'Generic Anchors %': {
    meaning: '"Click here", "read more", etc. Natural but low relevance.',
    howMeasured: 'Match anchors against a generic phrase list; report % of total.',
    improvementTips: ['Some generic anchors are fine.', 'Balance with branded and relevant anchors.', 'Avoid exclusively generic anchors.'],
    dataSources: 'Backlink API (anchor text); generic phrase list.',
    riskThresholds: 'Good: 15–40% | Warning: 5–14% or 41–60% | Needs improvement: <5% or >60%.',
    howToVerify: 'Export anchors; match vs generic list (e.g. "click here", "read more"); compute %.',
    resources: BACKLINK_RESOURCES,
  },
  'Naked URL %': {
    meaning: 'Links where the anchor is the URL or domain. Common in citations.',
    howMeasured: 'Compare anchor to URL/domain; report % of total.',
    improvementTips: ['Naked URLs are natural in many contexts.', 'Aim for a balanced mix with other types.', 'No need to eliminate naked URLs.'],
    dataSources: 'Backlink API (anchor text, target URL).',
    riskThresholds: 'Good: 5–25% | Warning: 1–4% or 26–50% | Needs improvement: 0% or >50%.',
    howToVerify: 'Export anchors; count those equal to URL or domain; compute %.',
    resources: BACKLINK_RESOURCES,
  },
  'Anchor Diversity Score': {
    meaning: 'Variety in anchor text. Reduces over-optimization risk.',
    howMeasured: 'Unique anchors / total links or entropy-based score; normalized to 0–100.',
    improvementTips: ['Diversify anchor text naturally.', 'Avoid repeating same anchor across many links.', 'Let publishers choose anchor text.'],
    dataSources: 'Backlink API (anchor text).',
    riskThresholds: 'Good: ≥70 | Warning: 40–69 | Needs improvement: <40.',
    howToVerify: 'Export anchors; compute unique/total or entropy; map to 0–100.',
    resources: BACKLINK_RESOURCES,
  },
  'Over-Optimization Risk': {
    meaning: 'Composite risk from exact- and partial-match dominance. High risk may trigger filters.',
    howMeasured: 'Formula combining exact-match %, partial-match %, and diversity score; inverted to 0–100 health.',
    improvementTips: ['Reduce exact-match anchor focus.', 'Increase diversity and branded anchors.', 'Audit anchor profile periodically.'],
    dataSources: 'Backlink API (anchor text); exact/partial/diversity inputs.',
    riskThresholds: 'Good: <20 | Warning: 20–50 | Needs improvement: >50.',
    howToVerify: 'Derived from exact-match %, partial-match %, and diversity; verify those inputs first.',
    resources: BACKLINK_RESOURCES,
  },
  'New Links (30 / 90 days)': {
    meaning: 'Count of links first seen in the last 30 or 90 days. Indicates growth in link acquisition.',
    howMeasured: 'Backlink index with first-seen date; filter and count over each window.',
    improvementTips: ['Maintain steady, sustainable link growth.', 'Create link-worthy content regularly.', 'Build relationships for ongoing links.'],
    dataSources: 'Ahrefs, Majestic, Moz (first-seen date per backlink).',
    riskThresholds: 'N/A (use velocity trend for traffic light).',
    howToVerify: 'In Ahrefs/Moz, filter backlinks by "First seen" in last 30/90 days; compare counts.',
    resources: BACKLINK_RESOURCES,
  },
  'Lost Links (30 / 90 days)': {
    meaning: 'Links that no longer point to you. High churn may indicate quality or technical issues.',
    howMeasured: 'Links present in prior crawl but missing in current; count over 30d/90d.',
    improvementTips: ['Monitor lost links and fix root causes.', 'Update or reclaim broken placements.', 'Maintain content that stays relevant.'],
    dataSources: 'Backlink index with last-seen or "lost" flag; historical snapshots.',
    riskThresholds: 'N/A (use churn rate).',
    howToVerify: 'Use provider "Lost links" report (Ahrefs, Moz) or compare historical exports.',
    resources: BACKLINK_RESOURCES,
  },
  'Net Link Growth': {
    meaning: 'Net change in backlink count (new − lost). Positive = growth; negative = decline.',
    howMeasured: 'new_90 − lost_90 (or 30d); report raw number.',
    improvementTips: ['Aim for positive net growth over time.', 'Address high churn if net turns negative.', 'Balance velocity with quality.'],
    dataSources: 'Same as New/Lost links.',
    riskThresholds: 'Good: net > 0 | Warning: net = 0 | Needs improvement: net < 0.',
    howToVerify: 'Subtract lost from new (30d or 90d) in Ahrefs/Moz; compare with our value.',
    resources: BACKLINK_RESOURCES,
  },
  'Link Velocity Trend': {
    meaning: 'Direction and consistency of growth. Stable or improving is preferred.',
    howMeasured: 'Slope of cumulative backlinks over 90 days; classified as up, flat, or down.',
    improvementTips: ['Avoid sudden spikes that look unnatural.', 'Build links consistently over time.', 'Track trend and adjust strategy.'],
    dataSources: 'Historical backlink counts (provider or own storage).',
    riskThresholds: 'Good: Up | Warning: Flat | Needs improvement: Down.',
    howToVerify: 'Plot backlink count over time in Ahrefs/Moz; check slope and trend.',
    resources: BACKLINK_RESOURCES,
  },
  'Abnormal Spike Detection': {
    meaning: 'Sudden large increases may indicate paid links or spam; worth auditing.',
    howMeasured: 'Weekly new-link counts; flag when current > μ + 2σ of historical growth.',
    improvementTips: ['Investigate spikes; ensure they’re legitimate.', 'Avoid bulk link purchases or link bursts.', 'Prefer gradual, organic growth.'],
    dataSources: 'Weekly new-link time series.',
    riskThresholds: 'Good: No spike | Warning: 1–2σ above | Needs improvement: >2σ.',
    howToVerify: 'Review weekly new-link chart; identify outliers vs. typical growth.',
    resources: BACKLINK_RESOURCES,
  },
  'Link Churn Rate': {
    meaning: 'Rate at which links are lost. High churn suggests unstable or low-quality profile.',
    howMeasured: 'lost_30 / total_links_at_period_start; report as %.',
    improvementTips: ['Reduce churn by maintaining link quality.', 'Fix technical issues on your site.', 'Keep linked content updated and live.'],
    dataSources: 'Lost links + total count (backlink index).',
    riskThresholds: 'Good: <5% | Warning: 5–15% | Needs improvement: >15%.',
    howToVerify: 'lost_30 ÷ total at period start; compare with provider churn metrics.',
    resources: BACKLINK_RESOURCES,
  },
  'Linked Brand Mentions': {
    meaning: 'Brand mentions that include a link to you. Strong brand signal.',
    howMeasured: 'Mention APIs or crawl; filter mentions containing target URL; deduplicate and count.',
    improvementTips: ['Build brand awareness to earn cited mentions.', 'Outreach to convert unlinked into linked.', 'Create quotable, referenceable content.'],
  },
  'Unlinked Brand Mentions': {
    meaning: 'Brand mentions without a link. Conversion opportunity (reach out for link).',
    howMeasured: 'Same as linked mentions; filter those without target URL.',
    improvementTips: ['Identify unlinked mentions and request links.', 'Make it easy to link (e.g. press kit).', 'Build relationships with citing publishers.'],
  },
  'Brand Mention Velocity': {
    meaning: 'Rate of new mentions (linked + unlinked). Indicates brand momentum.',
    howMeasured: 'New mentions in last 30 days / 30; report as per-day rate.',
    improvementTips: ['Increase PR and content marketing.', 'Engage on social and in communities.', 'Launch campaigns that generate mention volume.'],
  },
  'Brand Sentiment Score': {
    meaning: 'Aggregated sentiment of mentions. Positive supports trust; negative may need reputation management.',
    howMeasured: 'Sentiment per mention (API or NLP); aggregate; map to 0–100.',
    improvementTips: ['Monitor sentiment and address negatives.', 'Encourage happy customers to leave reviews.', 'Respond professionally to criticism.'],
  },
  'Brand-to-Link Ratio': {
    meaning: 'Ratio of linked to unlinked mentions. High unlinked = opportunity.',
    howMeasured: 'linked_mentions / unlinked_mentions (or linked %).',
    improvementTips: ['Convert unlinked mentions to links where appropriate.', 'Improve linkability of brand assets.', 'Track ratio over time.'],
  },
  'Entity Authority Score': {
    meaning: 'Strength of your brand/entity in knowledge graph and reference ecosystem.',
    howMeasured: 'Wikidata, Wikipedia, knowledge panels, citations; composite 0–100. Fallback: brand volume + linked share.',
    improvementTips: ['Build Wikipedia presence if notable.', 'Ensure consistent entity data across the web.', 'Earn citations from reputable sources.'],
  },
  'Backlinks to Informational Content': {
    meaning: 'Links to blog, guides, resources. Builds topical authority.',
    howMeasured: 'Classify target URLs (informational vs commercial); count links to informational; report count and %.',
    improvementTips: ['Create valuable informational content.', 'Promote guides and resources for links.', 'Update evergreen content to retain links.'],
  },
  'Backlinks to Commercial Pages': {
    meaning: 'Links to product, pricing, offers. Supports conversions and commercial relevance.',
    howMeasured: 'Same classification; count links to commercial URLs.',
    improvementTips: ['Earn links to key commercial pages.', 'Use data, tools, or unique angles.', 'Partner with relevant publishers.'],
  },
  'Evergreen Link Retention': {
    meaning: 'Share of links that persist over 12+ months. Indicates durable value.',
    howMeasured: 'Links still present after 12 months / links that existed 12 months ago.',
    improvementTips: ['Create evergreen content that stays relevant.', 'Maintain linked pages (no 404s, redirects).', 'Update content to keep it valuable.'],
  },
  'Content-to-Link Relevance Score': {
    meaning: 'Aggregate relevance of referring page content to target page. Related content strengthens links.',
    howMeasured: 'Topic/similarity between referrer and target per link; average or weighted score 0–100.',
    improvementTips: ['Pursue links from topically relevant pages.', 'Create content that fits referrer context.', 'Avoid off-topic link placement.'],
  },
  'Authority Gap vs Competitors': {
    meaning: 'Your DA minus competitor average. Positive = ahead; negative = behind.',
    howMeasured: 'DA for target and competitors; compute gap vs. average (or min).',
    improvementTips: ['Build more quality links than competitors.', 'Focus on gaps in their link profiles.', 'Track competitor link acquisition.'],
  },
  'Referring Domain Gap': {
    meaning: 'Your referring domains minus competitor average. Breadth comparison.',
    howMeasured: 'Referring domain count for target and competitors; compute gap.',
    improvementTips: ['Expand link acquisition across diverse domains.', 'Target sites competitors haven’t.', 'Balance breadth with quality.'],
  },
  'Link Quality Gap': {
    meaning: 'Your composite link quality vs. competitors (trust, authority, toxicity).',
    howMeasured: 'Quality score per domain from trust, DA, toxicity; compare target to competitor average.',
    improvementTips: ['Improve quality of new links.', 'Clean up toxic links.', 'Benchmark and close quality gaps.'],
  },
  'Anchor Profile Comparison': {
    meaning: 'Similarity of your anchor mix (branded, exact, generic) vs. competitors.',
    howMeasured: 'Anchor distribution vectors; cosine similarity or distance to "healthy" profile.',
    improvementTips: ['Avoid over-optimization vs. competitors.', 'Diversify if you’re more concentrated.', 'Use benchmarks to inform strategy.'],
  },
  'Shared vs Exclusive Backlinks': {
    meaning: 'Exclusive links differentiate; shared links indicate overlapping visibility.',
    howMeasured: 'For each backlink, check if referrer also links to competitors; count exclusive vs. shared; report %.',
    improvementTips: ['Build exclusive links competitors don’t have.', 'Target unique publishers and niches.', 'Create differentiated, link-worthy assets.'],
  },
  'Broken Backlinks': {
    meaning: 'Links from pages that return 4xx/5xx or are unreachable. Lose value and signal neglect.',
    howMeasured: 'HTTP check of source URL per backlink; count non-2xx/3xx.',
    improvementTips: ['Contact webmasters to fix or restore links.', 'Use redirects if you moved content.', 'Monitor and reclaim where possible.'],
  },
  'Redirected Backlinks': {
    meaning: 'Source URLs that redirect. May pass reduced equity; chains reduce it further.',
    howMeasured: 'Request source URL, follow redirects; count 301/302 responses.',
    improvementTips: ['Prefer direct links over redirects when possible.', 'Avoid redirect chains on your side.', 'Reach out if critical links redirect away.'],
  },
  'Canonicalized Backlinks': {
    meaning: 'Share of backlinks pointing to canonical URL. Links to duplicates may be consolidated.',
    howMeasured: 'Resolve canonical per target URL; classify backlinks as to canonical vs. not; report %.',
    improvementTips: ['Ensure important pages have correct canonicals.', 'Redirect duplicates to canonical.', 'Audit canonical coverage.'],
  },
  'HTTP vs HTTPS Accuracy': {
    meaning: 'Share of links from/to HTTPS. HTTP sources can trigger mixed content issues.',
    howMeasured: 'Scheme of source and target URL per backlink; report % HTTPS.',
    improvementTips: ['Serve site over HTTPS; redirect HTTP.', 'Update internal links to HTTPS.', 'Encourage referrers to use HTTPS URLs.'],
  },
  'JavaScript-Blocked Backlinks': {
    meaning: 'Links only in JS-rendered content. May not be seen by all crawlers.',
    howMeasured: 'Crawl source with and without JS; flag links present only in rendered DOM.',
    improvementTips: ['Prefer links in static HTML where possible.', 'Ensure key links aren’t JS-only.', 'Test crawlability of important referrers.'],
  },
  'Link Equity Loss Estimation': {
    meaning: 'Estimated PageRank/equity loss from redirects, nofollow, broken links.',
    howMeasured: 'Per-link loss factor (0 for follow 2xx, <1 for nofollow/redirect, 1 for broken); weighted sum.',
    improvementTips: ['Fix broken links and reclaim equity.', 'Prefer dofollow where natural.', 'Minimize redirect chains.'],
  },
  'Citation Consistency': {
    meaning: 'Uniformity of NAP (name, address, phone) across directories and citations.',
    howMeasured: 'Compare citations to canonical NAP; report % matching.',
    improvementTips: ['Use one canonical NAP everywhere.', 'Update inconsistent listings.', 'Audit directories regularly.'],
  },
  'NAP Accuracy': {
    meaning: 'Share of citations with correct, complete NAP. Ensures users and engines resolve the right entity.',
    howMeasured: 'Validate each citation against canonical; report % correct.',
    improvementTips: ['Fix incorrect NAP in directories.', 'Claim and update GMB and key listings.', 'Remove duplicate or wrong listings.'],
  },
  'Review Velocity': {
    meaning: 'Rate of new reviews. Indicates engagement and fresh feedback.',
    howMeasured: 'New reviews in last 30 days / 30; report per-day rate.',
    improvementTips: ['Encourage reviews from customers.', 'Make leaving reviews easy.', 'Respond to reviews consistently.'],
  },
  'Review Sentiment': {
    meaning: 'Average sentiment of reviews. Positive supports local SEO and trust.',
    howMeasured: 'Aggregate sentiment per review; map to 0–100.',
    improvementTips: ['Address negative reviews professionally.', 'Improve service to improve sentiment.', 'Highlight positive feedback.'],
  },
  'Local Backlink Relevance': {
    meaning: 'Share of backlinks from local or locally relevant sources.',
    howMeasured: 'Classify referrers by geo/topic; report % local or locally relevant.',
    improvementTips: ['Build links from local businesses and directories.', 'Create local content and partnerships.', 'Participate in local citations.'],
  },
};

const DEFAULT_INFO: MetricInfo = {
  meaning: 'This off-page metric reflects link-based authority, risk, or brand signals. Values require backlink or mention data from providers like Majestic, Ahrefs, or Moz.',
  howMeasured: 'Backlink index, mention APIs, or competitive data. "N/A" or "—" indicate data is not yet available; integrate APIs to populate.',
  improvementTips: ['Integrate a backlink API (Majestic, Ahrefs, Moz) to enable this metric.', 'Review the audit framework for extraction details.', 'Once data is available, act on recommendations.'],
  dataSources: 'Majestic, Ahrefs, Moz Link Explorer; mention/brand APIs where applicable.',
  riskThresholds: 'Good / Warning / Needs improvement thresholds depend on metric; see framework.',
  howToVerify: 'Compare this metric in Ahrefs Backlink Checker, Moz Link Explorer, or Majestic Site Explorer for the same domain.',
  resources: BACKLINK_RESOURCES,
};

export function getOffPageMetricInfo(metricName: string): MetricInfo {
  return METRIC_INFO[metricName] ?? DEFAULT_INFO;
}

export type MetricLabel = 'Excellent' | 'Good' | 'Warning' | 'Needs improvement' | 'Info';

export function getOffPageMetricLabel(status: string | undefined, _value?: string | number): MetricLabel {
  if (!status) return 'Info';
  switch (status) {
    case 'pass':
      return 'Good';
    case 'warn':
      return 'Warning';
    case 'fail':
      return 'Needs improvement';
    default:
      return 'Info';
  }
}

export function getOffPageMetricLabelClass(label: MetricLabel): string {
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
