# Off-Page SEO Audit Engine — Enterprise Parameter Framework

**Scope:** Off-page SEO only. No on-page or technical SEO.  
**Constraints:** Actionable, explainable, scalable. Every parameter has a defined extraction method. Output suitable for automation and API ingestion.

---

## 1. Authority & Trust Signals

### 1.1 Referring Domains

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Referring Domains |
| **Business Objective** | Count of unique domains linking to the target. Signals breadth of endorsement; used by search engines as a diversity proxy. |
| **Technical Definition** | `COUNT(DISTINCT source_domain) WHERE target_url IN (qualified_backlinks)` |
| **Data Sources** | Majestic (API), Ahrefs (API), Moz Link Explorer (API), Linkdex, GSC (limited, for discovery only). **Alternatives:** Serpstat, Semrush Backlink Analytics. |
| **Extraction Method** | 1. Fetch backlink index for target domain/URL from primary provider. 2. Normalize `source_domain` (e.g. strip www, resolve redirects to final domain). 3. Deduplicate by `(source_domain, target_url)`. 4. Count distinct `source_domain`. |
| **Normalization / Scoring** | Linear map to 0–100: `score = min(100, (count / K) * 100)`. Use tiered K (e.g. K=500 for local, K=5000 for national). Cap at 100. |
| **Risk Thresholds** | Green: ≥ threshold for niche (e.g. ≥50). Yellow: 10–49. Red: <10. Thresholds configurable per vertical. |
| **Update Frequency** | Weekly (typical index refresh). Daily if using live crawler. |
| **Dependencies** | Backlink index; domain normalization logic. |

```
# Pseudo-code
referring_domains = SET()
for b in backlinks:
    d = normalize_domain(b.source_url)
    referring_domains.add(d)
return len(referring_domains)
```

---

### 1.2 Domain Authority

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Domain Authority (DA) |
| **Business Objective** | Predictor of ability to rank. Used for prioritization and competitive comparison. |
| **Technical Definition** | Composite metric (0–100) derived from link graph: link volume, linking root domains, quality. |
| **Data Sources** | Moz API (DA), Ahrefs DR (Domain Rating), Majestic Trust Flow. **Alternatives:** Semrush Authority Score, proprietary model. |
| **Extraction Method** | 1. Call provider API: `GET /v1/url-metrics/domain?target=example.com`. 2. Use returned `domain_authority` or equivalent. 3. If unavailable: **fallback** — compute proxy from `log10(1 + referring_domains) * 10 + log10(1 + total_links) * 5`, capped 0–100, clearly labeled as "Estimated DA". |
| **Normalization / Scoring** | Use provider scale 0–100 directly. If using multiple providers, map to common scale (e.g. Ahrefs DR → DA-like) via percentile mapping table. |
| **Risk Thresholds** | Green: ≥40. Yellow: 20–39. Red: <20. Adjust by industry. |
| **Update Frequency** | Daily (provider-dependent). Cache 24h. |
| **Dependencies** | Third-party API; API key. Fallback uses referring domains + total links. |

---

### 1.3 Trust Score

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Trust Score |
| **Business Objective** | Measures quality of linking neighborhoods. Low trust suggests manipulative or spammy link sources. |
| **Technical Definition** | Score 0–100 aggregating trustworthiness of referring domains (e.g. Majestic Trust Flow–style). |
| **Data Sources** | Majestic (Trust Flow, Citation Flow), Moz Spam Score inverse, Ahrefs DR + linked domains quality. **Alternatives:** Proprietary trust model based on seed list. |
| **Extraction Method** | 1. For each referring domain, obtain trust metric from provider. 2. Aggregate: `trust_score = weighted_avg(trust_i, weight_i)` where `weight_i` = 1 or log(1 + links from domain i). 3. Normalize to 0–100. **Fallback:** Use `(1 - spam_score) * 100` if only spam score available. |
| **Normalization / Scoring** | `score = min(100, max(0, (aggregate_trust / max_expected_trust) * 100))`. |
| **Risk Thresholds** | Green: ≥60. Yellow: 30–59. Red: <30. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Trust/spam metrics per referring domain. |

---

### 1.4 Topical Relevance

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Topical Relevance |
| **Business Objective** | Links from topically related sites are valued higher. Reduces relevance mismatch risk. |
| **Technical Definition** | Score 0–100: share of backlinks from domains semantically related to target site topic. |
| **Data Sources** | Provider topical classification (e.g. Majestic Topical Trust Flow), custom taxonomy + referrer page content. **Alternatives:** Keyword overlap, shared categories in directory data. |
| **Extraction Method** | 1. Classify target site into 1–3 primary topics (manual or ML). 2. For each referrer, get topic labels or derive from page content/categories. 3. `relevant = count(links from matching_topic_domains)`, `total = count(all_links)`. 4. `topical_relevance = 100 * (relevant / max(1, total))`. |
| **Normalization / Scoring** | Direct percentage. Optional: boost score if high-authority relevance. |
| **Risk Thresholds** | Green: ≥70%. Yellow: 40–69%. Red: <40%. |
| **Update Frequency** | Weekly or per backlink refresh. |
| **Dependencies** | Topic taxonomy; referrer topic data or content fetch. |

---

### 1.5 Follow vs Nofollow Ratio

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Follow vs Nofollow Ratio |
| **Business Objective** | Balance of link equity (dofollow) vs. natural editorial (nofollow). Extreme skew may indicate manipulation. |
| **Technical Definition** | `follow_ratio = follow_links / total_links`, `nofollow_ratio = 1 - follow_ratio`. |
| **Data Sources** | Backlink index with `rel` attribute (dofollow/nofollow). All major backlink APIs. |
| **Extraction Method** | 1. Fetch backlinks with `rel` stored. 2. Count `follow` (default or explicit), `nofollow`. 3. `follow_ratio = follow / (follow + nofollow)`. Report both ratio and counts. |
| **Normalization / Scoring** | Use follow_ratio as 0–1; scale to 0–100: `score = follow_ratio * 100`. No single "ideal"; context-dependent. |
| **Risk Thresholds** | Green: 20–80% follow (natural spread). Yellow: 81–95% or 5–19%. Red: >95% or <5% follow. |
| **Update Frequency** | Weekly with backlink refresh. |
| **Dependencies** | Backlink index with `rel` per link. |

---

### 1.6 High-Authority Backlink Percentage

| Field | Specification |
|-------|---------------|
| **Parameter Name** | High-Authority Backlink Percentage |
| **Business Objective** | Share of links from strong domains. Concentrates authority and trust. |
| **Technical Definition** | `percentage = 100 * (links from domains with DA ≥ H) / total_links`. H = threshold (e.g. 50). |
| **Data Sources** | Backlink index + DA/DR per referring domain (Moz, Ahrefs, etc.). |
| **Extraction Method** | 1. For each referrer, get DA (or DR). 2. Set H (default 50). 3. Count links from domains with DA ≥ H. 4. `pct = 100 * count_high / total_links`. |
| **Normalization / Scoring** | Direct percentage 0–100. |
| **Risk Thresholds** | Green: ≥25%. Yellow: 10–24%. Red: <10%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | DA/DR per referring domain; backlink counts. |

---

## 2. Backlink Quality & Risk Control

### 2.1 Toxic Backlink Percentage

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Toxic Backlink Percentage |
| **Business Objective** | Share of links from domains likely to trigger algorithmic or manual penalty. Drives disavow decisions. |
| **Technical Definition** | `toxic_pct = 100 * (toxic_links / total_links)`. Toxic = link from domain flagged as spam/manipulative. |
| **Data Sources** | Moz Link Spam Score, Majestic toxicity flags, Ahrefs “potentially toxic” etc. **Alternatives:** Custom rules (spam TLDs, known PBN lists, redirect chains). |
| **Extraction Method** | 1. Fetch toxicity/spam flag per referring domain from provider. 2. Mark links from toxic domains. 3. `toxic_pct = 100 * toxic_links / total_links`. **Fallback:** Use `spam_score` per domain; threshold (e.g. >30) = toxic. |
| **Normalization / Scoring** | Report raw %. Inverse score: `health = max(0, 100 - toxic_pct)`. |
| **Risk Thresholds** | Green: <5%. Yellow: 5–15%. Red: >15%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Toxicity/spam data per domain. |

---

### 2.2 Spam Score

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Spam Score |
| **Business Objective** | Likelihood that a domain is used for spam. Informs prioritization of disavow and outreach. |
| **Technical Definition** | Per-domain metric 0–100 (or 0–17 for Moz) indicating spam likelihood. |
| **Data Sources** | Moz Spam Score API, Majestic, custom spam model. **Alternatives:** Use multiple blacklists + heuristics. |
| **Extraction Method** | 1. Resolve target domain. 2. Call provider for domain-level spam score. 3. Store and expose. **Aggregate for profile:** `avg_spam = avg(spam_score per referring domain)`, weighted by links. |
| **Normalization / Scoring** | Use provider scale. If 0–17 (Moz), map to 0–100: `score = (17 - raw) / 17 * 100`. |
| **Risk Thresholds** | Green: ≤30 (0–100 scale). Yellow: 31–60. Red: >60. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Spam score API. |

---

### 2.3 Link Neighborhood Risk

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Link Neighborhood Risk |
| **Business Objective** | Risk from linking to or being linked by domains that exhibit spammy behavior. |
| **Technical Definition** | Composite 0–100 risk score from (a) outbound links to spam domains, (b) inbound links from spam domains, (c) linking patterns (PBN-like). |
| **Data Sources** | Backlink index, spam/toxic flags, optional crawl of outbound links. |
| **Extraction Method** | 1. For each referrer: get spam/toxic flag. 2. `inbound_risk = weighted_avg(risk_i)` by links. 3. Optionally: fetch outbound links from target, count to known-bad domains. 4. `neighborhood_risk = 0.6 * inbound_risk + 0.4 * outbound_risk`. Normalize to 0–100. |
| **Normalization / Scoring** | `score = min(100, max(0, composite_risk))`. |
| **Risk Thresholds** | Green: <20. Yellow: 20–50. Red: >50. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Toxicity/spam data; optionally outbound link data. |

---

### 2.4 Indexed Backlink Ratio

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Indexed Backlink Ratio |
| **Business Objective** | Share of known backlinks that Google has indexed. Low ratio can indicate low-quality or devalued links. |
| **Technical Definition** | `ratio = indexed_backlinks / total_known_backlinks`. |
| **Data Sources** | Backlink index (total). Indexed count: Google Indexing API, `site:` checks, or third-party “indexed backlinks” metric. **Alternatives:** Bing index, sampling + extrapolation. |
| **Extraction Method** | 1. Get total backlinks from provider. 2. Get indexed count (API or estimated via `site:` sample). 3. `ratio = indexed / max(1, total)`. **Fallback:** Use provider’s “indexed” field if available; else mark “N/A” or “Estimated”. |
| **Normalization / Scoring** | Report as 0–1 or 0–100%. |
| **Risk Thresholds** | Green: ≥70%. Yellow: 40–69%. Red: <40%. |
| **Update Frequency** | Monthly (indexing checks costly). |
| **Dependencies** | Indexing data or provider metric. |

---

### 2.5 Editorial vs Non-Editorial Links

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Editorial vs Non-Editorial Ratio |
| **Business Objective** | Editorial links (earned, in-content) are higher quality. Non-editorial (footers, widgets, profiles) carry less weight and can look manipulative if dominant. |
| **Technical Definition** | `editorial_ratio = editorial_links / total_links`. Editorial = in main content, not footer/sidebar/widget/profile. |
| **Data Sources** | Backlink index with placement (content vs. footer/sidebar/widget). **Alternatives:** URL path heuristics (e.g. /author/, /tag/), HTML structure crawl. |
| **Extraction Method** | 1. For each source URL, classify placement (editorial vs. non-editorial) via provider or crawl. 2. Count by type. 3. `editorial_ratio = editorial / total`. Report both ratio and counts. |
| **Normalization / Scoring** | `score = editorial_ratio * 100`. |
| **Risk Thresholds** | Green: ≥60% editorial. Yellow: 30–59%. Red: <30%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Placement or URL structure data. |

---

### 2.6 Contextual Link Percentage

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Contextual Link Percentage |
| **Business Objective** | Links within body content are typically stronger and more editorial than standalone (e.g. blogroll, footer). |
| **Technical Definition** | `contextual_pct = 100 * (links in main content) / total_links`. |
| **Data Sources** | Backlink index with “contextual” flag, or crawl of source page + DOM analysis. |
| **Extraction Method** | 1. For each backlink, determine if anchor is inside main content (e.g. article, main). 2. Count contextual vs. total. 3. `contextual_pct = 100 * contextual / total`. **Heuristic fallback:** Link in paragraph vs. list/footer vs. nav. |
| **Normalization / Scoring** | Direct percentage 0–100. |
| **Risk Thresholds** | Green: ≥50%. Yellow: 20–49%. Red: <20%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Source page crawl or provider metadata. |

---

### 2.7 Suspicious TLD Ratio

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Suspicious TLD Ratio |
| **Business Objective** | High share of links from TLDs commonly used in spam (e.g. .xyz, .top, .work) increases risk. |
| **Technical Definition** | `suspicious_pct = 100 * (links from suspicious_tlds) / total_links`. Suspicious TLD list configurable. |
| **Data Sources** | Backlink index. TLD list: maintain allowlist/blocklist (e.g. .com, .org, .edu = OK; .xyz, .top, .click = suspicious). |
| **Extraction Method** | 1. Extract TLD per referring domain. 2. Match against suspicious TLD list. 3. `suspicious_pct = 100 * count_suspicious / total`. **Fallback:** Use public “spam TLD” lists. |
| **Normalization / Scoring** | Report raw %. Health score: `100 - suspicious_pct`. |
| **Risk Thresholds** | Green: <10%. Yellow: 10–25%. Red: >25%. |
| **Update Frequency** | Weekly. TLD list: quarterly review. |
| **Dependencies** | TLD classification list. |

---

## 3. Anchor Text Health

### 3.1–3.7 Anchor Distribution & Diversity

| Parameter | Business Objective | Technical Definition | Data Sources | Extraction | Scoring (0–100) | Green / Yellow / Red | Update |
|-----------|--------------------|----------------------|--------------|------------|-----------------|----------------------|--------|
| **Branded anchors %** | Links with brand name reinforce brand authority. | `100 * (anchors containing brand) / total`. | Backlink API (anchor text). | Lowercase, tokenize; match brand list. | % as score. | ≥30 / 10–29 / <10 | Weekly |
| **Exact-match anchors %** | High exact-match % can trigger over-optimization. | `100 * (anchors = target keyword) / total`. | Same. | Normalize anchor; exact match vs. keyword set. | Inverse: `100 - min(100, exact_pct * 2)`. | <10 / 10–25 / >25 | Weekly |
| **Partial-match anchors %** | Partial relevance without over-optimization. | `100 * (anchors contain but ≠ keyword) / total`. | Same. | Substring match. | % as score. | 20–50 / 10–19 or 51–70 / <10 or >70 | Weekly |
| **Generic anchors %** | “Click here”, “read more” — natural but low relevance. | `100 * (anchor in generic_list) / total`. | Same. | Match against generic list. | % as score. | 15–40 / 5–14 or 41–60 / <5 or >60 | Weekly |
| **Naked URL %** | Links with URL as anchor. | `100 * (anchor = URL or domain) / total`. | Same. | Compare anchor to URL/domain. | % as score. | 5–25 / 1–4 or 26–50 / 0 or >50 | Weekly |
| **Anchor diversity score** | Variety reduces over-optimization risk. | `unique_anchors / total_links` or entropy-based. | Same. | Count distinct anchors; optional Shannon entropy. | `min(100, unique_ratio * 50 + entropy_norm * 50)`. | ≥70 / 40–69 / <40 | Weekly |
| **Over-optimization risk** | Composite of exact + partial dominance. | `risk = f(exact_pct, partial_pct, diversity)`. | Same. | `risk = 0.5 * exact_pct + 0.3 * (100 - diversity) + 0.2 * clip(partial_pct - 40, 0, 60)`. | `100 - min(100, risk)`. | <20 / 20–50 / >50 | Weekly |

**Generic anchor list (examples):** `["click here", "read more", "here", "this", "website", "link", "source", "learn more", "visit", "go"]`.

```
# Anchor diversity pseudo-code
anchors = [normalize(a) for a in anchor_texts]
unique = len(set(anchors))
total = len(anchors)
ratio = unique / max(1, total)
entropy = -sum(p * log2(p) for p in anchor_freqs)  # max when uniform
entropy_norm = entropy / log2(unique) if unique else 0
diversity_score = min(100, 50 * ratio + 50 * entropy_norm)
```

---

## 4. Link Growth & Velocity

### 4.1 New Links (30 / 90 Days)

| Field | Specification |
|-------|---------------|
| **Parameter Name** | New Links (30 / 90 days) |
| **Business Objective** | Growth in link acquisition. Sustainable positive trend is healthy. |
| **Technical Definition** | `new_30 = count(links first seen in last 30 days)`, `new_90` analogously. |
| **Data Sources** | Backlink index with first-seen date (Ahrefs, Majestic, Moz). |
| **Extraction Method** | 1. Filter backlinks by `first_seen >= (now - 30d)` and `(now - 90d)`. 2. Count. Report both 30 and 90. |
| **Normalization / Scoring** | No 0–100 scale; report raw counts. Optional velocity score: `min(100, new_30 / K * 100)` with K per niche. |
| **Risk Thresholds** | N/A for count. Use velocity trend (4.4) for traffic light. |
| **Update Frequency** | Daily for 30d; weekly for 90d. |
| **Dependencies** | First-seen date in index. |

---

### 4.2 Lost Links (30 / 90 Days)

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Lost Links (30 / 90 days) |
| **Business Objective** | Links no longer pointing to target. High churn may indicate quality or technical issues. |
| **Technical Definition** | `lost_30 = count(links last seen > 30 days ago, previously active)`. |
| **Data Sources** | Backlink index with last-seen or “lost” flag. |
| **Extraction Method** | 1. Identify links that were present in previous crawl but missing in current. 2. Count over 30d and 90d windows. |
| **Normalization / Scoring** | Raw counts. Churn rate (4.6) used for risk. |
| **Risk Thresholds** | N/A. Use churn rate. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Historical snapshots or last-seen dates. |

---

### 4.3 Net Link Growth

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Net Link Growth |
| **Business Objective** | Net change in backlink count. Positive = growth; negative = decline. |
| **Technical Definition** | `net = new_90 - lost_90` (or 30d). |
| **Data Sources** | Same as 4.1, 4.2. |
| **Extraction Method** | Compute `new` and `lost`; `net = new - lost`. |
| **Normalization / Scoring** | Report raw. Optional: `growth_score = 50 + clamp(net / K, -50, 50)` for 0–100. |
| **Risk Thresholds** | Green: net > 0. Yellow: net = 0. Red: net < 0 (configurable by baseline). |
| **Update Frequency** | Weekly. |
| **Dependencies** | New and lost counts. |

---

### 4.4 Link Velocity Trend

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Link Velocity Trend |
| **Business Objective** | Direction and consistency of growth. Stable or improving is preferred. |
| **Technical Definition** | Slope of `(date, cumulative_backlinks)` over last 90 days (or 4–12 weeks). |
| **Data Sources** | Historical backlink counts (own storage or provider history). |
| **Extraction Method** | 1. Get weekly snapshots of total backlinks. 2. Linear regression: `slope = regress(count, week)`. 3. `trend = "up" if slope > 0.05 * current_count, "flat" if |slope| small, "down" else`. |
| **Normalization / Scoring** | `score = 50 + 50 * tanh(slope / K)` mapped to 0–100. |
| **Risk Thresholds** | Green: up. Yellow: flat. Red: down. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Historical backlink data. |

---

### 4.5 Abnormal Spike Detection

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Abnormal Spike Detection |
| **Business Objective** | Sudden large increases may indicate paid links or spam; worth auditing. |
| **Technical Definition** | Boolean or score: growth in last 7–30 days exceeds `μ + k*σ` of historical weekly growth. |
| **Data Sources** | Weekly new-link counts. |
| **Extraction Method** | 1. Compute mean `μ` and std `σ` of weekly new-link counts (e.g. last 26 weeks). 2. `current = new_links_last_week`. 3. `spike = current > μ + 2*σ`. Report boolean + `(current - μ) / max(σ, 1)`. |
| **Normalization / Scoring** | 0 = no spike, 100 = extreme. `min(100, max(0, 50 + (z_score) * 20))`. |
| **Risk Thresholds** | Green: no spike. Yellow: 1–2σ above. Red: >2σ. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Historical new-link series. |

---

### 4.6 Link Churn Rate

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Link Churn Rate |
| **Business Objective** | High churn suggests unstable or low-quality link profile. |
| **Technical Definition** | `churn = lost_30 / (total_links_start_of_period)` or `lost_30 / (total_links + lost_30)`. |
| **Data Sources** | Backlink index, lost links. |
| **Extraction Method** | `churn = lost_30 / max(1, total_at_period_start)`. Report as %. |
| **Normalization / Scoring** | `churn_health = max(0, 100 - churn_pct * 2)`. |
| **Risk Thresholds** | Green: <5%. Yellow: 5–15%. Red: >15%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Lost links + total count. |

---

## 5. Brand & Entity Signals

### 5.1 Linked Brand Mentions

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Linked Brand Mentions |
| **Business Objective** | Brand mentions that include a link. Strong brand signal. |
| **Technical Definition** | Count of mentions of brand (or entity) that contain an outbound link to target. |
| **Data Sources** | Brand mention APIs (Mention, Brand24, etc.), custom crawl (News, Blogs), GSC. **Alternatives:** Serpstat, manual sampling. |
| **Extraction Method** | 1. Define brand (names, variants). 2. Search or ingest mention stream. 3. Filter mentions that include URL to target. 4. Deduplicate by (source, target_url). Count. |
| **Normalization / Scoring** | Raw count. Optional score: `min(100, count / K * 100)`. |
| **Risk Thresholds** | N/A. Use for trend and ratio (5.5). |
| **Update Frequency** | Weekly. |
| **Dependencies** | Brand list, mention data. |

---

### 5.2 Unlinked Brand Mentions

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Unlinked Brand Mentions |
| **Business Objective** | Citation without link. Conversion opportunity (reach out for link). |
| **Technical Definition** | Count of brand mentions without a link to target. |
| **Data Sources** | Same as 5.1. |
| **Extraction Method** | Same pipeline; filter mentions without target URL. Count. |
| **Normalization / Scoring** | Raw count. |
| **Risk Thresholds** | N/A. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Same as 5.1. |

---

### 5.3 Brand Mention Velocity

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Brand Mention Velocity |
| **Business Objective** | Rate of new mentions (linked + unlinked). Indicates brand momentum. |
| **Technical Definition** | `velocity = new_mentions_last_30d / 30` (per day). |
| **Data Sources** | Mention time series. |
| **Extraction Method** | Count new mentions in last 30 days; divide by 30. |
| **Normalization / Scoring** | Report as rate. Optional score via tiered benchmarks. |
| **Risk Thresholds** | N/A. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Mention history. |

---

### 5.4 Brand Sentiment Score

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Brand Sentiment Score |
| **Business Objective** | Positive sentiment supports trust; negative may need reputation management. |
| **Technical Definition** | Aggregated sentiment of mentions (e.g. -1 to +1 or 0–100). |
| **Data Sources** | Mention APIs with sentiment, or NLP on mention text. |
| **Extraction Method** | 1. Get sentiment per mention (API or model). 2. Aggregate: `avg_sentiment` or weighted by domain authority. 3. Map to 0–100: `50 + 50 * avg_sentiment`. |
| **Normalization / Scoring** | 0–100. |
| **Risk Thresholds** | Green: ≥60. Yellow: 40–59. Red: <40. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Sentiment API or model. |

---

### 5.5 Brand-to-Link Ratio

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Brand-to-Link Ratio |
| **Business Objective** | Ratio of linked to unlinked mentions. High unlinked = opportunity. |
| **Technical Definition** | `ratio = linked_mentions / max(1, unlinked_mentions)` or `linked / (linked + unlinked)`. |
| **Data Sources** | 5.1, 5.2. |
| **Extraction Method** | Compute from linked and unlinked counts. |
| **Normalization / Scoring** | Report ratio or linked %. |
| **Risk Thresholds** | N/A. Use for prioritization. |
| **Update Frequency** | Weekly. |
| **Dependencies** | 5.1, 5.2. |

---

### 5.6 Entity Authority Score

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Entity Authority Score |
| **Business Objective** | Strength of target as an entity (brand, organization) in knowledge graph / reference ecosystem. |
| **Technical Definition** | Composite 0–100 from Wikipedia, Wikidata, knowledge panels, citations, brand volume. |
| **Data Sources** | Wikidata, Wikipedia API, provider entity metrics. **Alternatives:** Custom graph from mentions + links. |
| **Extraction Method** | 1. Resolve target to entity (Wikidata, etc.). 2. Use provider entity score or compute from existence + citations + link volume. 3. Normalize to 0–100. **Fallback:** Use brand mention volume + linked share as proxy. |
| **Normalization / Scoring** | 0–100. |
| **Risk Thresholds** | Green: ≥50. Yellow: 20–49. Red: <20. |
| **Update Frequency** | Monthly. |
| **Dependencies** | Entity resolution; external entity data. |

---

## 6. Content-Driven Authority

### 6.1 Backlinks to Informational Content

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Backlinks to Informational Content |
| **Business Objective** | Links to blog, guides, resources build topical authority. |
| **Technical Definition** | Count (or %) of backlinks whose target URL is classified as informational (e.g. /blog/, /guide/, /resources/). |
| **Data Sources** | Backlink index (target URL); URL path or CMS section. |
| **Extraction Method** | 1. Classify target URLs (informational vs. commercial vs. other) via path rules or tags. 2. Count links to informational. Report count and % of total. |
| **Normalization / Scoring** | `score = min(100, 100 * informational_links / total)`. |
| **Risk Thresholds** | Green: ≥30%. Yellow: 10–29%. Red: <10%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | URL taxonomy. |

---

### 6.2 Backlinks to Commercial Pages

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Backlinks to Commercial Pages |
| **Business Objective** | Links to product, pricing, offers support conversions and commercial relevance. |
| **Technical Definition** | Count (%) of backlinks to commercial URLs. |
| **Data Sources** | Same as 6.1. |
| **Extraction Method** | Same; filter commercial. |
| **Normalization / Scoring** | % as score. |
| **Risk Thresholds** | Context-dependent. Balance with 6.1. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Same as 6.1. |

---

### 6.3 Evergreen Link Retention

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Evergreen Link Retention |
| **Business Objective** | Links that persist over time indicate durable value. |
| **Technical Definition** | `retention = (links still present after 12 months) / (links that existed 12 months ago)`. |
| **Data Sources** | Historical backlink snapshots. |
| **Extraction Method** | 1. Snapshot from 12 months ago. 2. Current snapshot. 3. `retained = count(still present)`, `base = count(12mo ago)`. 4. `retention = retained / max(1, base)`. |
| **Normalization / Scoring** | 0–1 or 0–100%. |
| **Risk Thresholds** | Green: ≥85%. Yellow: 70–84%. Red: <70%. |
| **Update Frequency** | Monthly. |
| **Dependencies** | Historical backlink data. |

---

### 6.4 Content-to-Link Relevance Score

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Content-to-Link Relevance Score |
| **Business Objective** | Links from pages topically related to target page content are stronger. |
| **Technical Definition** | Score 0–100: aggregate relevance of referring page content to target page. |
| **Data Sources** | Referrer page content (crawl or provider), target metadata. |
| **Extraction Method** | 1. Get referrer page text (or topics). 2. Get target page topics. 3. Compute similarity (e.g. TF-IDF, embeddings). 4. `score = avg(relevance per link)` or weighted by link count. Map to 0–100. |
| **Normalization / Scoring** | 0–100. |
| **Risk Thresholds** | Green: ≥60. Yellow: 40–59. Red: <40. |
| **Update Frequency** | Weekly (costly). Monthly acceptable. |
| **Dependencies** | Content fetch; similarity model. |

---

## 7. Competitive Benchmarking

### 7.1 Authority Gap vs Competitors

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Authority Gap vs Competitors |
| **Business Objective** | Compare own DA/DR to competitor set. Drives strategy. |
| **Technical Definition** | `gap = own_DA - avg(competitor_DA)` or `own_DA - min(competitor_DA)`. |
| **Data Sources** | DA/DR for target + competitor domains (Moz, Ahrefs). |
| **Extraction Method** | 1. Fetch DA for target and each competitor. 2. Compute avg (or min) competitor DA. 3. `gap = own - competitor_avg`. Report gap and percentile. |
| **Normalization / Scoring** | `score = 50 + clamp(gap, -50, 50)` → 0–100. |
| **Risk Thresholds** | Green: gap > 0. Yellow: -10 to 0. Red: < -10. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Competitor list; DA API. |

---

### 7.2 Referring Domain Gap

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Referring Domain Gap |
| **Business Objective** | Compare breadth of link acquisition vs. competitors. |
| **Technical Definition** | `gap = own_referring_domains - avg(competitor_referring_domains)`. |
| **Data Sources** | Backlink index for target + competitors. |
| **Extraction Method** | Same as 1.1 for each domain; compute gap. |
| **Normalization / Scoring** | Use `log10(1 + referring_domains)` for scale; then gap. |
| **Risk Thresholds** | Green: positive. Yellow: near 0. Red: negative. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Competitor list; referring domain counts. |

---

### 7.3 Link Quality Gap

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Link Quality Gap |
| **Business Objective** | Compare composite link quality (trust, authority, toxicity) vs. competitors. |
| **Technical Definition** | `gap = own_quality_score - avg(competitor_quality_score)`. Quality = f(trust, DA, toxicity). |
| **Data Sources** | Trust, DA, toxicity for target + competitors. |
| **Extraction Method** | 1. Compute quality score per domain (e.g. `0.4*DA + 0.4*trust - 0.2*toxic_pct`). 2. Compare. |
| **Normalization / Scoring** | 0–100 per domain; report gap. |
| **Risk Thresholds** | Green: positive. Yellow: -5 to 0. Red: < -5. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Quality components; competitor data. |

---

### 7.4 Anchor Profile Comparison

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Anchor Profile Comparison |
| **Business Objective** | Compare anchor mix (branded, exact, generic) vs. competitors to avoid over-optimization. |
| **Technical Definition** | Vector (branded%, exact%, generic%, …) for target vs. competitors; distance or similarity. |
| **Data Sources** | Anchor distribution per domain. |
| **Extraction Method** | 1. Compute distribution for target and each competitor. 2. `similarity = cos_sim(target_vec, competitor_vec)`. 3. Report avg similarity, or distance to “healthy” profile. |
| **Normalization / Scoring** | Similarity 0–1 or distance; optional 0–100 score. |
| **Risk Thresholds** | N/A. Use for insight. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Anchor data for competitors. |

---

### 7.5 Shared vs Exclusive Backlinks

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Shared vs Exclusive Backlinks |
| **Business Objective** | Exclusive links differentiate; shared links indicate overlapping visibility. |
| **Technical Definition** | `exclusive = links only to target`, `shared = links to target and ≥1 competitor`. Report counts and %. |
| **Data Sources** | Backlink index for target + competitors. |
| **Extraction Method** | 1. For each target backlink, check if referrer also links to competitors. 2. Classify shared vs. exclusive. 3. Count and report %. |
| **Normalization / Scoring** | `exclusive_pct = 100 * exclusive / total`. Score = exclusive_pct. |
| **Risk Thresholds** | Green: ≥60% exclusive. Yellow: 30–59%. Red: <30%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Competitor backlink data. |

---

## 8. Technical Integrity of Backlinks

### 8.1 Broken Backlinks

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Broken Backlinks |
| **Business Objective** | Links from pages that return 4xx/5xx or are unreachable lose value and signal neglect. |
| **Technical Definition** | Count of backlinks whose source URL returns non-2xx/3xx. |
| **Data Sources** | Backlink index; HTTP check (HEAD/GET) of source URL. |
| **Extraction Method** | 1. Sample or full fetch of source URLs. 2. Record status. 3. Count broken. **Fallback:** Use provider “broken” flag if available. |
| **Normalization / Scoring** | `broken_pct = 100 * broken / total`. Health = `max(0, 100 - broken_pct * 2)`. |
| **Risk Thresholds** | Green: <2%. Yellow: 2–5%. Red: >5%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | HTTP checks or provider data. |

---

### 8.2 Redirected Backlinks

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Redirected Backlinks |
| **Business Objective** | Source URLs that redirect (301/302) may pass reduced equity; chains reduce it further. |
| **Technical Definition** | Count (%) of backlinks where source URL redirects before resolving. |
| **Data Sources** | HTTP follow redirects; record final URL and redirect count. |
| **Extraction Method** | 1. Request source URL, follow redirects. 2. Count 301/302 response. 3. `redirected_pct = 100 * redirected / total`. |
| **Normalization / Scoring** | Report %. Lower is better. |
| **Risk Thresholds** | Green: <20%. Yellow: 20–40%. Red: >40%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | HTTP client. |

---

### 8.3 Canonicalized Backlinks

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Canonicalized Backlinks |
| **Business Objective** | Links to canonical URL accumulate equity; links to duplicates may be consolidated. |
| **Technical Definition** | Count (%) of backlinks pointing to the canonical URL vs. alternates. |
| **Data Sources** | Backlink index (target URL); canonical tags. |
| **Extraction Method** | 1. For each target URL, resolve canonical. 2. Classify backlinks as to canonical vs. non-canonical. 3. Report %. |
| **Normalization / Scoring** | `canonical_pct = 100 * to_canonical / total`. |
| **Risk Thresholds** | Green: ≥90%. Yellow: 70–89%. Red: <70%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Canonical resolution. |

---

### 8.4 HTTP vs HTTPS Accuracy

| Field | Specification |
|-------|---------------|
| **Parameter Name** | HTTP vs HTTPS Accuracy |
| **Business Objective** | Links should point to HTTPS where available. HTTP sources can trigger mixed content. |
| **Technical Definition** | % of backlinks from HTTPS pages; % of links pointing to HTTPS target. |
| **Data Sources** | Backlink index; scheme of source and target URL. |
| **Extraction Method** | 1. Parse scheme for source and target. 2. Count HTTPS-to-HTTPS, HTTP-to-HTTPS, etc. 3. Report %. |
| **Normalization / Scoring** | `score = 100 * (links from HTTPS) / total` and same for target. |
| **Risk Thresholds** | Green: ≥95% HTTPS. Yellow: 80–94%. Red: <80%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | URL scheme. |

---

### 8.5 JavaScript-Blocked Backlinks

| Field | Specification |
|-------|---------------|
| **Parameter Name** | JavaScript-Blocked Backlinks |
| **Business Objective** | Links only in JS may not be seen by all crawlers; detect crawlability risk. |
| **Technical Definition** | Count (%) of backlinks where link exists only in JS-rendered content. |
| **Data Sources** | Crawl with and without JS; or provider “crawlability” metadata. |
| **Extraction Method** | 1. Fetch source HTML. 2. Extract links from raw HTML vs. rendered DOM. 3. If link only in DOM: JS-blocked. **Fallback:** N/A or provider flag. |
| **Normalization / Scoring** | `blocked_pct = 100 * js_only / total`. Health = `100 - blocked_pct`. |
| **Risk Thresholds** | Green: <10%. Yellow: 10–30%. Red: >30%. |
| **Update Frequency** | Monthly (crawl cost). |
| **Dependencies** | Headless crawl or provider. |

---

### 8.6 Link Equity Loss Estimation

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Link Equity Loss Estimation |
| **Business Objective** | Quantify potential PageRank/equity loss from redirects, nofollow, broken links. |
| **Technical Definition** | `loss = Σ (weight_i * loss_factor_i)` where loss_factor = 0 for follow 2xx, <1 for redirect/nofollow, 1 for broken. |
| **Data Sources** | Backlink list + attributes (nofollow, status, redirect). |
| **Extraction Method** | 1. Per link: `loss_factor = 0 if follow and 2xx; 0.15 if nofollow; 0.3 if redirect; 1 if broken`. 2. Weight by domain authority or link strength. 3. `total_loss = sum(weight * loss_factor)`. Report as % of “potential” equity. |
| **Normalization / Scoring** | `equity_retained = 100 * (1 - loss_ratio)`. |
| **Risk Thresholds** | Green: ≥90%. Yellow: 75–89%. Red: <75%. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Status, nofollow, redirect flags; weights. |

---

## 9. Local Off-Page Signals (Conditional)

### 9.1 Citation Consistency

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Citation Consistency |
| **Business Objective** | Same NAP across directories and sites strengthens local SEO. |
| **Technical Definition** | Score 0–100: uniformity of name, address, phone across citations. |
| **Data Sources** | Local citations (Google Business, Yelp, directories, own crawl). |
| **Extraction Method** | 1. Define canonical NAP. 2. Fetch citations. 3. Compare name/address/phone (normalized). 4. `consistency = 100 * matching_citations / total`. |
| **Normalization / Scoring** | 0–100. |
| **Risk Thresholds** | Green: ≥95%. Yellow: 80–94%. Red: <80%. |
| **Update Frequency** | Monthly. |
| **Dependencies** | Citation list; NAP normalization. |

---

### 9.2 NAP Accuracy

| Field | Specification |
|-------|---------------|
| **Parameter Name** | NAP Accuracy |
| **Business Objective** | Correct NAP ensures users and search engines resolve the right entity. |
| **Technical Definition** | % of citations with correct, complete NAP. |
| **Data Sources** | Same as 9.1. |
| **Extraction Method** | Validate each citation against canonical; count correct. Report %. |
| **Normalization / Scoring** | 0–100. |
| **Risk Thresholds** | Green: ≥98%. Yellow: 90–97%. Red: <90%. |
| **Update Frequency** | Monthly. |
| **Dependencies** | Same as 9.1. |

---

### 9.3–9.5 Review Velocity, Sentiment, Local Backlink Relevance

| Parameter | Business Objective | Technical Definition | Data Sources | Extraction | Scoring | Green / Yellow / Red | Update |
|-----------|--------------------|----------------------|--------------|------------|---------|----------------------|--------|
| **Review velocity** | Rate of new reviews. | `new_reviews_30d / 30`. | GMB, review APIs. | Count new reviews; rate per day. | Raw rate. | N/A | Weekly |
| **Review sentiment** | Avg sentiment of reviews. | Mean sentiment −1 to +1 or 0–100. | Same. | Aggregate per site/location. | 0–100. | ≥60 / 40–59 / <40 | Weekly |
| **Local backlink relevance** | % of backlinks from local or locally relevant sources. | `100 * local_relevant_links / total`. | Backlink index + geo/topical tags. | Classify local (geo, niche); count. | 0–100. | ≥40 / 20–39 / <20 | Weekly |

---

## 10. Composite Scores (Tool-Level)

### 10.1 Overall Off-Page SEO Score

```
# Deterministic composite (weights configurable)
offpage_score = (
  0.20 * authority_component +   # DA, referring domains, trust
  0.25 * quality_component +     # toxic %, spam, editorial %
  0.15 * anchor_component +      # diversity, over-opt risk
  0.15 * growth_component +      # net growth, velocity, churn
  0.10 * brand_component +       # linked mentions, entity
  0.10 * technical_component +   # broken, redirect, equity loss
  0.05 * competitive_component   # authority gap, exclusivity
)
# Each component 0–100. Result clamped 0–100.
```

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Overall Off-Page SEO Score |
| **Business Objective** | Single metric for off-page health. |
| **Technical Definition** | Weighted sum of sub-scores (above). |
| **Data Sources** | All underlying metrics. |
| **Extraction Method** | Compute each component; aggregate with weights. **Fallback:** If a component missing, use 50 (neutral) or omit and renormalize weights. |
| **Normalization / Scoring** | 0–100. |
| **Risk Thresholds** | Green: ≥70. Yellow: 50–69. Red: <50. |
| **Update Frequency** | Weekly. |
| **Dependencies** | All category metrics. |

---

### 10.2 Link Trust Score

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Link Trust Score |
| **Technical Definition** | `trust = 0.4 * trust_score + 0.3 * (100 - toxic_pct) + 0.2 * high_DA_pct + 0.1 * (100 - spam_score)`. |
| **Data Sources** | 1.3, 2.1, 1.6, 2.2. |
| **Extraction Method** | Compute sub-metrics; weighted sum. |
| **Normalization / Scoring** | 0–100. |
| **Risk Thresholds** | Green: ≥60. Yellow: 40–59. Red: <40. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Trust, toxic, high-DA, spam. |

---

### 10.3 Link Risk Score

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Link Risk Score |
| **Technical Definition** | `risk = 0.35 * toxic_pct + 0.25 * over_optimization_risk + 0.20 * neighborhood_risk + 0.20 * (suspicious_TLD_pct + equity_loss_pct) / 2`. Invert for “health”: `100 - min(100, risk)`. |
| **Data Sources** | 2.1, 3.7, 2.3, 2.7, 8.6. |
| **Extraction Method** | Same. |
| **Normalization / Scoring** | 0–100 (risk or health). |
| **Risk Thresholds** | Green: risk <25. Yellow: 25–50. Red: >50. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Underlying risk metrics. |

---

### 10.4 Brand Authority Score

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Brand Authority Score |
| **Technical Definition** | `brand = 0.35 * entity_authority + 0.30 * (linked_mentions / max(1, total_links)) * 100 + 0.20 * sentiment + 0.15 * mention_velocity_norm`. |
| **Data Sources** | 5.1, 5.4, 5.3, 5.6. |
| **Extraction Method** | Compute and aggregate. |
| **Normalization / Scoring** | 0–100. |
| **Risk Thresholds** | Green: ≥50. Yellow: 25–49. Red: <25. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Brand metrics. |

---

### 10.5 Competitive Authority Index

| Field | Specification |
|-------|---------------|
| **Parameter Name** | Competitive Authority Index |
| **Technical Definition** | `index = 50 + 0.4 * authority_gap_norm + 0.3 * referring_domain_gap_norm + 0.3 * exclusive_pct`. Gaps normalized to roughly −50..+50. |
| **Data Sources** | 7.1, 7.2, 7.5. |
| **Extraction Method** | Compute gaps and exclusive %; aggregate. |
| **Normalization / Scoring** | 0–100. |
| **Risk Thresholds** | Green: ≥55. Yellow: 45–54. Red: <45. |
| **Update Frequency** | Weekly. |
| **Dependencies** | Competitor data. |

---

## Fallback Logic Summary

| Scenario | Fallback |
|----------|----------|
| Primary backlink API down | Use secondary provider (Ahrefs → Majestic → Moz). |
| DA unavailable | Estimate from `log10(1 + referring_domains) * 10 + log10(1 + links) * 5`, cap 100; label “Estimated”. |
| Spam/trust unavailable | Use `(1 - toxic_pct) * 100` if toxic from another source; else omit or use 50. |
| Historical backlinks missing | Growth/churn/retention → “N/A”; skip velocity/spike. |
| Competitor data missing | Competitive metrics → “N/A”; exclude from composite. |
| Sentiment unavailable | Brand sentiment → “N/A”; Brand Authority uses remaining components, renormalize. |

---

## API & Automation Notes

- **Output:** JSON per domain/URL with each parameter, value, unit, score (0–100 where applicable), traffic-light, `last_updated`, `data_source`, `estimated` (bool).
- **Idempotency:** Use `domain` + `date` as cache key.
- **Rate limits:** Honor provider limits; queue jobs; exponential backoff.
- **Validation:** Sanity checks (e.g. total links ≥ referring domains; percentages 0–100).
- **Explainability:** Store and expose `formula_id` and `inputs` (e.g. `{ "referring_domains": 120, "K": 500 }`) for each score.

---

*End of Off-Page SEO Audit Framework.*
