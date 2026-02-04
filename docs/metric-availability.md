# Metric Availability & Verification Guide

## Overview

This document classifies every metric in Riviso by verification level and data source. Use this to understand what metrics are reliable, what's estimated, and what's unavailable.

## Verification Levels

### ✅ Verified
- Computed from actual crawl data
- 100% accurate for discovered links
- Can be independently verified
- **Safe to use for decision-making**

### ⚠️ Estimated
- Uses heuristics or limited data
- Accuracy depends on data coverage
- Should be used with caution
- **Use for guidance, not definitive decisions**

### ❌ Unavailable
- Requires global backlink index
- Requires third-party APIs
- Requires historical data not yet collected
- **Removed from UI to prevent confusion**

---

## Link Signals Metrics

### Link Discovery Category

| Metric | Verification | Data Source | Accuracy | Notes |
|--------|-------------|-------------|----------|-------|
| Detected Referring Domains | ✅ Verified | Site crawl | 100% for discovered | Only shows domains found in crawl |
| Detected Backlinks | ✅ Verified | Site crawl | 100% for discovered | Requires referrer URLs to discover |
| Crawl Source | ✅ Verified | Scraper engine | 100% | Shows pages crawled count |

### Link Hygiene Category

| Metric | Verification | Data Source | Accuracy | Notes |
|--------|-------------|-------------|----------|-------|
| Follow vs Nofollow Ratio | ✅ Verified | Crawl data (rel attributes) | 100% for discovered | Only for links found in crawl |
| Broken Outbound Links | ❌ Unavailable | On-page analysis (future) | N/A | Coming soon |
| Redirected Links | ❌ Unavailable | On-page analysis (future) | N/A | Coming soon |
| HTTP vs HTTPS Inconsistencies | ❌ Unavailable | On-page analysis (future) | N/A | Coming soon |

### Anchor Health Category

| Metric | Verification | Data Source | Accuracy | Notes |
|--------|-------------|-------------|----------|-------|
| Anchor Text Analysis | ⚠️ Estimated | Detected backlinks only | Depends on coverage | Limited to discovered links |
| Over-Optimization Warning | ⚠️ Estimated | Heuristic | Indicative | Not definitive |

### Scoring

| Score | Verification | Components | Accuracy | Notes |
|-------|-------------|-------------|----------|-------|
| Link Hygiene Score | ✅ Verified | Follow ratio, broken links, redirects, HTTP/HTTPS | 100% for verifiable factors | Only includes factors we can verify |

---

## Removed Metrics (Previously Shown as N/A)

These metrics have been **completely removed** from the UI because they cannot be computed without global backlink indexes:

### Authority & Trust
- ❌ Domain Authority (DA) - Requires global backlink index (not available)
- ❌ Trust Score - Requires global backlink index (not available)
- ❌ Topical Relevance - Requires topic classification engine
- ❌ High-Authority Backlink % - Requires DA per referrer

### Quality & Risk
- ❌ Toxic Backlink % - Requires toxicity database
- ❌ Spam Score - Requires spam detection engine
- ❌ Link Neighborhood Risk - Requires referrer risk database
- ❌ Indexed Backlink Ratio - Requires index status data
- ❌ Editorial vs Non-Editorial - Requires placement analysis
- ❌ Contextual Link % - Requires source-page analysis
- ❌ Suspicious TLD Ratio - Requires TLD classification

### Anchor Text (Advanced)
- ❌ Branded Anchors % - Requires brand list + comprehensive anchor data
- ❌ Exact-Match Anchors % - Requires keyword list + comprehensive data
- ❌ Partial-Match Anchors % - Requires comprehensive anchor data
- ❌ Generic Anchors % - Requires comprehensive anchor data
- ❌ Naked URL % - Requires comprehensive anchor data
- ❌ Anchor Diversity Score - Requires comprehensive anchor data
- ❌ Over-Optimization Risk (detailed) - Requires comprehensive anchor data

### Growth & Velocity
- ❌ New Links (30/90 days) - Requires historical crawl snapshots
- ❌ Lost Links (30/90 days) - Requires historical crawl snapshots
- ❌ Net Link Growth - Requires historical crawl snapshots
- ❌ Link Velocity Trend - Requires historical crawl snapshots
- ❌ Abnormal Spike Detection - Requires historical crawl snapshots
- ❌ Link Churn Rate - Requires historical crawl snapshots

### Brand & Entity
- ❌ Linked Brand Mentions - Requires brand monitoring
- ❌ Unlinked Brand Mentions - Requires brand monitoring
- ❌ Brand Mention Velocity - Requires brand monitoring
- ❌ Brand Sentiment Score - Requires sentiment analysis
- ❌ Brand-to-Link Ratio - Requires brand monitoring
- ❌ Entity Authority Score - Requires entity recognition

### Content-Driven
- ❌ Backlinks to Informational Content - Requires content classification
- ❌ Backlinks to Commercial Pages - Requires content classification
- ❌ Evergreen Link Retention - Requires historical data
- ❌ Content-to-Link Relevance Score - Requires content analysis

### Competitive
- ❌ Authority Gap vs Competitors - Requires competitor crawl data
- ❌ Referring Domain Gap - Requires competitor crawl data
- ❌ Link Quality Gap - Requires competitor analysis
- ❌ Anchor Profile Comparison - Requires competitor data
- ❌ Shared vs Exclusive Backlinks - Requires competitor crawl data

### Technical Integrity (Advanced)
- ❌ Broken Backlinks - Requires backlink discovery + status checks
- ❌ Redirected Backlinks - Requires backlink discovery + redirect tracking
- ❌ Canonicalized Backlinks - Requires backlink discovery + canonical analysis
- ❌ HTTP vs HTTPS Accuracy - Requires backlink discovery + protocol checks
- ❌ JavaScript-Blocked Backlinks - Requires render testing
- ❌ Link Equity Loss Estimation - Requires comprehensive link analysis

### Local SEO
- ❌ Citation Consistency - Requires local business data
- ❌ NAP Accuracy - Requires local business data
- ❌ Review Velocity - Requires review platform integration
- ❌ Review Sentiment - Requires review platform integration
- ❌ Local Backlink Relevance - Requires local business data

---

## Future Metric Roadmap

### Q1 2026: Enhanced Link Hygiene
- ✅ Broken Outbound Links (from on-page analysis)
- ✅ Redirected Links (from on-page analysis)
- ✅ HTTP vs HTTPS Inconsistencies (from on-page analysis)

### Q2 2026: Google Search Console Integration
- ✅ GSC Referrer URLs (automatic import)
- ✅ Historical Link Data (from GSC)
- ✅ Indexed Backlink Ratio (from GSC)

### Q3 2026: Enhanced Analysis
- ✅ Advanced anchor text classification
- ✅ Brand/keyword detection for anchor analysis
- ✅ Link quality heuristics
- ✅ Enhanced crawl coverage and discovery

### Q4 2026: Historical Analysis
- ✅ Link Growth Velocity (from multiple snapshots)
- ✅ New/Lost Links (from historical comparison)
- ✅ Link Churn Rate (from historical comparison)

---

## Decision Framework

### When to Trust a Metric
✅ **Trust if:**
- Verification badge shows "✓ Verified"
- Data source is "Site crawl" or "Crawl data"
- Metric is in "Link Discovery" or "Link Hygiene" category

### When to Use with Caution
⚠️ **Use cautiously if:**
- Verification badge shows "~ Estimated"
- Data source mentions "Limited scope" or "Heuristic"
- Metric is in "Anchor Health" category

### When to Ignore
❌ **Ignore if:**
- Metric shows "N/A Unavailable"
- Verification badge shows "N/A Unavailable"
- Metric is not displayed (removed from UI)

---

## AI Integration Rules

The AI system follows these rules when discussing link signals:

1. **Never reference removed metrics**: DA, Trust Score, Spam Score, etc.
2. **Focus on verified data**: Emphasize what we know for certain
3. **Explain limitations**: Always mention data coverage when relevant
4. **Actionable insights**: Focus on what can be improved with available data

### Example AI Responses

❌ **Bad**: "Your Domain Authority is low at 20. You need to build more high-authority backlinks."

✅ **Good**: "Limited link coverage detected - only 2 referring domains found in crawl. Focus on acquiring editorial links from topical sources. Add referrer URLs from Google Search Console to discover more backlinks."

---

## Summary

- **Verified Metrics**: 5 metrics (Referring Domains, Backlinks, Follow Ratio, Crawl Source, Link Hygiene Score)
- **Estimated Metrics**: 2 metrics (Anchor Analysis, Over-Optimization Warning)
- **Removed Metrics**: 50+ metrics (all requiring global indexes)

**Current Focus**: Accuracy and trust over feature completeness.

**Riviso is the Complete Solution**: All analysis is done through Riviso's whole-site crawl engine. No external tools or third-party APIs required.
