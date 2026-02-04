# Technical SEO Metrics Reference

**Date:** January 26, 2026  
**Purpose:** Complete reference for all Technical SEO metrics

---

## 📊 Visible Metrics (6 Pillars)

### 1. Crawl & Index Control

| Metric | Status Logic | Impact | Why It Matters |
|--------|------------|--------|----------------|
| **Indexable vs non-indexable ratio** | pass: 1:0, fail: 0:1 | critical if fail | Determines if pages can appear in search results |
| **Noindex correctness** | warn: blocked, pass: indexable | high if blocked | Important pages should be indexable |
| **Canonical coverage** | warn: 0%, pass: 100% | medium if missing | Prevents duplicate content issues |
| **Crawl errors (4xx/5xx)** | fail: >0, pass: 0 | high if present | Broken links waste crawl budget |
| **Orphan URLs** | info: N/A | low | Harder for search engines to discover |
| **Robots.txt blocking** | info: N/A | low | Incorrect rules can block important pages |

### 2. Site Architecture & Internal Authority

| Metric | Status Logic | Impact | Why It Matters |
|--------|------------|--------|----------------|
| **Average crawl depth** | warn: >3, pass: ≤3 | medium if deep | Pages within 3 clicks rank better |
| **Internal links per page** | fail: 0, warn: 1-2, pass: ≥3 | high if low | Helps distribute authority and crawlability |
| **Orphan pages** | info: N/A | low | Pages with no internal links are hard to discover |
| **Broken internal links** | fail: >0, pass: 0 | high if present | Wastes crawl budget, hurts UX |
| **URL structure consistency** | pass: good | low | Consistent patterns aid understanding |

### 3. Page Experience & Core Web Vitals

| Metric | Status Logic | Impact | Why It Matters |
|--------|------------|--------|----------------|
| **LCP (Largest Contentful Paint)** | pass: <2.5s, warn: 2.5-4s, fail: >4s | high if slow | Google ranking factor, user experience |
| **CLS (Cumulative Layout Shift)** | info: N/A | low | Measures visual stability |
| **INP (Interaction to Next Paint)** | info: N/A | low | Measures interactivity |
| **TTFB (Time to First Byte)** | pass: <800ms, warn: ≥800ms | medium if slow | Affects all Core Web Vitals |
| **Render-blocking resources** | warn: >5, pass: ≤5 | medium if high | Delays page display |
| **Mobile vs desktop performance** | info: N/A | low | Mobile-first indexing critical |

### 4. Canonicalization & Duplication

| Metric | Status Logic | Impact | Why It Matters |
|--------|------------|--------|----------------|
| **Canonical self-reference** | fail: missing, pass: correct | medium if missing | Prevents duplicate content issues |
| **HTTP vs HTTPS duplication** | fail: detected, pass: none | critical if present | HTTPS required for security and ranking |
| **WWW vs non-WWW duplication** | info: N/A | low | Should redirect to one preferred version |
| **Duplicate indexable pages** | info: N/A | low | Dilutes page authority |
| **Canonical mismatch issues** | pass: none | low | Canonicals should point to preferred version |

### 5. Mobile & Rendering Readiness

| Metric | Status Logic | Impact | Why It Matters |
|--------|------------|--------|----------------|
| **Mobile usability errors** | fail: >0, pass: 0 | critical if present | Mobile usability is ranking factor |
| **Viewport correctness** | fail: missing, pass: correct | critical if missing | Required for proper mobile rendering |
| **Tap target compliance** | warn: check, pass: pass | medium if fail | Touch targets should be 48x48px |
| **Mobile CWV variance** | info: N/A | low | Mobile CWV often differs from desktop |
| **JS rendering compatibility** | pass: pass | low | Search engines must render JS content |

### 6. Security & Protocol Integrity

| Metric | Status Logic | Impact | Why It Matters |
|--------|------------|--------|----------------|
| **HTTPS enabled** | fail: no, pass: yes | critical if no | Required for security, trust, ranking |
| **Mixed content issues** | fail: >0, pass: 0 | high if present | Breaks security, triggers warnings |
| **SSL validity** | fail: invalid, pass: valid | critical if invalid | Expired certificates break site access |
| **Redirect correctness** | fail: needs redirect, pass: correct | critical if fail | HTTP should redirect to HTTPS |

---

## 🔬 Advanced Metrics (Hidden by Default)

### JavaScript & Rendering
- JS-rendered content indexability
- DOM size (node count)
- JS dependency depth
- Client-side vs server-side rendering ratio
- Deferred vs async script usage
- Hydration delay
- Rendered vs raw HTML parity
- SPA crawl compatibility score
- Lazy-loaded content indexability

### International & Multilingual SEO
- hreflang tag completeness
- hreflang return tag accuracy
- Language-region mismatch count
- Default hreflang (x-default) usage
- Geo-targeting consistency
- International duplicate risk score
- Subfolder vs subdomain performance

### Structured Data & Semantic SEO
- Schema coverage (% pages with schema)
- Schema validity error count
- Rich result eligibility rate
- Schema type diversity
- Entity consistency score
- Knowledge graph alignment
- Breadcrumb schema accuracy
- FAQ / HowTo compliance

### Log File Analysis
- Googlebot hit frequency
- Crawl priority pages vs actual crawl rate
- Crawl waste URLs identified
- Bot response code patterns
- Crawl frequency vs update frequency
- Parameter crawl amplification
- JS resource crawl frequency

### XML Sitemaps & Discovery
- Sitemap index coverage
- Sitemap freshness (lastmod accuracy)
- Indexed URLs from sitemap (%)
- Non-canonical URLs in sitemap
- Sitemap vs crawl gap
- Image / video sitemap validation
- News sitemap compliance

### Server & Hosting Performance
- Server uptime %
- Response time variance
- Geographic latency distribution
- Load handling under traffic spikes
- Edge caching efficiency
- Hosting error frequency

### Automation & Monitoring
- Threshold-based alerts
- Regression detection
- Historical trend tracking
- Algorithm-impact sensitivity flags
- Page template-level diagnostics
- Pre-deployment technical checks

### Crawl Budget Modeling
- Crawl budget efficiency (Indexed ÷ Crawled)
- Parameterized URL crawl ratio
- Faceted navigation crawl impact score
- Crawl waste percentage
- HTTP status code distribution (% 200)
- Crawl depth (avg / median / max)
- Soft 404 detection rate

### Anchor Text Analysis
- Anchor text diversity ratio
- Over-optimization risk score (anchors)
- Hub-and-spoke linkage density
- Internal PageRank distribution

---

## 🎯 Decision Framework

### When to Show a Metric (Default View)

✅ **Show if:**
- Directly impacts Google rankings
- Affects user experience significantly
- Can be fixed with clear action
- Has measurable business impact
- Is a known ranking factor

❌ **Hide if:**
- Requires specialized knowledge to interpret
- Low impact on rankings
- Requires additional data sources (logs, crawl)
- Engineering diagnostic only
- Nice-to-have optimization

### Impact Level Guidelines

- **Critical:** Blocks indexing, breaks functionality, security issue
- **High:** Significantly impacts rankings, major UX issue
- **Medium:** Moderate impact, should fix but not urgent
- **Low:** Minor impact, optimization opportunity

### Fix Priority Guidelines

- **10:** Security issue, blocks indexing
- **8-9:** High-impact ranking factor, major UX issue
- **6-7:** Moderate impact, should fix soon
- **4-5:** Low-medium impact, fix when possible
- **1-3:** Minor optimization, low priority

---

## 📚 Data Sources

### Real-Time (Available Immediately)
- Page scraping
- HTTP headers
- HTML analysis
- Meta tags
- Performance timing

### Requires Full Crawl
- Orphan pages
- Internal link graph
- URL structure consistency
- Duplicate content detection

### Requires Log Files
- Googlebot frequency
- Crawl patterns
- Bot response codes
- Crawl waste analysis

### Requires Index Data
- Indexed vs crawled ratio
- Indexation quality
- Search Console data

---

**Last Updated:** January 26, 2026
