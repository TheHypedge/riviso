# Link Signals Engine (Off-Page Analysis)

## Overview

The Link Signals engine provides **verified, enterprise-grade link analysis** based on actual site crawl data. Unlike traditional SEO tools that rely on third-party backlink indexes, Riviso's engine analyzes links discovered through crawling your site and provided referrer URLs.

## Core Philosophy

**Accuracy Over Completeness**: We only show metrics we can verify. No fake scores, no misleading data, no false confidence.

## Current Capabilities

### ✅ Verified Metrics (Category A)

These metrics are computed from actual crawl data:

1. **Detected Referring Domains**
   - Source: Site crawl - external domains linking to your site
   - Accuracy: 100% for discovered links
   - Limitation: Only shows domains found in crawl

2. **Detected Backlinks**
   - Source: Site crawl - total links from external domains
   - Accuracy: 100% for discovered links
   - Limitation: Requires referrer URLs to discover backlinks

3. **Follow vs Nofollow Ratio**
   - Source: Crawl data - detected `rel` attributes
   - Accuracy: 100% for discovered links
   - Limitation: Only for links found in crawl

4. **Link Hygiene Score (0-100)**
   - Source: Calculated from verifiable link issues
   - Factors:
     - Follow ratio (penalizes <10% or <20%)
     - Broken links (when integrated with on-page analysis)
     - Redirect chains (when integrated)
     - HTTP/HTTPS inconsistencies (when integrated)

### ⚠️ Estimated Metrics (Category B)

These metrics use heuristics and are clearly marked:

1. **Anchor Text Analysis**
   - Scope: Limited to detected backlinks
   - Accuracy: Depends on crawl coverage
   - Status: Clearly marked as "Estimated"

2. **Over-Optimization Warnings**
   - Source: Heuristic based on detected anchors
   - Accuracy: Indicative, not definitive
   - Status: Clearly marked as "Estimated"

### ❌ Unavailable Metrics (Category C - Removed)

These metrics require global backlink indexes or third-party data and have been **removed** from the UI:

- Domain Authority (DA)
- Trust Score
- Spam Score
- Toxicity %
- Competitive Authority Index
- Brand Authority Score
- Link Growth Velocity
- Brand Mentions
- Entity Authority
- Most advanced metrics

## Data Sources

### Primary: Whole-Site Crawl
- Riviso crawls your **entire site** starting from the homepage
- Follows all internal links to discover every page
- Analyzes all discovered backlinks across your site
- Comprehensive site-wide analysis (not just single URL)

### Secondary: Referrer URLs (Future)
- Google Search Console export integration
- Server log analysis
- Manual referrer URL submission via `/ingest-referrers`

## Limitations

### Current Limitations

1. **Whole-Site Crawl Scope**
   - Riviso crawls your entire site to discover backlinks
   - Only shows links discovered in whole-site crawl
   - Cannot show links from sites we haven't crawled
   - Add referrer URLs from Google Search Console to discover more

2. **No Historical Trends**
   - Requires multiple crawl snapshots
   - No link growth/velocity data yet
   - Coming in future updates

3. **No Competitive Benchmarking**
   - Requires competitor crawl data
   - Cannot compare to industry averages
   - Coming in future updates

4. **Limited Anchor Analysis**
   - Only analyzes anchors from discovered backlinks in crawl
   - Add referrer URLs from Google Search Console for more comprehensive analysis

### Why These Limitations Exist

Riviso prioritizes **accuracy and trust** over feature completeness. We believe it's better to show fewer, verified metrics than to display misleading or inaccurate data that could lead to poor decisions.

**Riviso is the complete solution** - we don't rely on or reference external tools. All analysis is done through our own whole-site crawl engine.

## Future Roadmap

### Phase 1: Enhanced Link Hygiene (Q1 2026)
- Integration with on-page analysis for broken link detection
- Redirect chain analysis
- HTTP/HTTPS consistency checks
- All based on Riviso's own analysis

### Phase 2: Google Search Console Integration (Q2 2026)
- Automatic import of referrer URLs from GSC
- Enhanced backlink discovery through GSC data
- Historical link data from GSC

### Phase 3: Enhanced Analysis (Q3 2026)
- Advanced anchor text classification (Riviso's own algorithms)
- Brand/keyword detection for anchor analysis
- Link quality heuristics
- Enhanced whole-site crawl coverage

### Phase 4: Historical Analysis (Q4 2026)
- Multiple whole-site crawl snapshots
- Link growth/velocity tracking
- Trend analysis
- All powered by Riviso's crawl engine

## API Endpoints

### POST `/off-page-analyze`
Analyzes a URL and returns verified link signals.

**Request:**
```json
{
  "url": "https://example.com",
  "domain": "example.com"
}
```

**Response:**
```json
{
  "demoData": false,
  "target_domain": "example.com",
  "referring_domains": 5,
  "total_backlinks": 12,
  "follow_count": 8,
  "nofollow_count": 4,
  "follow_pct": 66.7,
  "pages_crawled": 45
}
```

## Integration Guide

### Backend Integration

The backend automatically calls the scraper engine when users click the "Link Signals" tab:

```typescript
// apps/backend/src/modules/seo/seo.service.ts
async offPageCrawl(url: string) {
  const base = this.config.get<string>('SCRAPER_ENGINE_URL') || 'http://localhost:8000';
  const endpoint = `${base}/off-page-analyze`;
  // ... calls scraper engine
}
```

### Frontend Display

The frontend shows:
1. **Data Coverage Banner** - Always visible, explains limitations
2. **Link Hygiene Score** - Single verified score
3. **Link Discovery** - Verified metrics from crawl
4. **Link Hygiene** - Verifiable link quality issues
5. **Anchor Health** - Limited scope, clearly marked

## Best Practices

1. **Whole-Site Analysis**: Riviso automatically crawls your entire site - no need to provide individual URLs
2. **Provide Referrer URLs**: Export from Google Search Console and submit via `/ingest-referrers` to discover more backlinks
3. **Regular Crawls**: Run whole-site analysis periodically to track changes
4. **Focus on Verified Metrics**: Prioritize actions based on verified data, not estimates
5. **Understand Limitations**: Read the data coverage banner to understand what's available
6. **Riviso is Complete**: All analysis is done by Riviso - no need for external tools

## Troubleshooting

### "No backlinks detected"
- **Cause**: Crawl only included your site, no external referrers
- **Solution**: Provide referrer URLs from GSC or server logs

### "Engine unavailable"
- **Cause**: Scraper engine not running
- **Solution**: Run `npm run scraper:start` from repo root

### "N/A" values
- **Cause**: Metric requires data not available in crawl
- **Solution**: This is expected. See data coverage banner for details

## Support

For questions or issues:
1. Check this documentation
2. Review `/docs/metric-availability.md` for metric details
3. Check scraper engine logs: `tail -f tools/scraper-engine/logs/*.log`
