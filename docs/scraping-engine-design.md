# Self-Hosted Scraping Engine — Design & Architecture

**Goal:** Build your own Python-based engine to scrape and collect data from the web **without** depending on third-party APIs or tools (Majestic, Ahrefs, Moz, etc.). All data comes from **your own crawls** and **your own processing**.

---

## 1. What You Can Do (No External APIs)

| Capability | How | Notes |
|------------|-----|--------|
| **On-page SEO** | Crawl page → parse HTML → extract title, meta, headings, images, links, content | Already partially in NestJS; Python engine can do the same or replace it. |
| **Internal links** | Extract `<a href>` same-domain; count, list, categorize | Full control. |
| **External links** | Extract `<a href>` other domains; count, list | Full control. |
| **Broken links** | HTTP HEAD/GET per link → 4xx/5xx = broken | Your crawler only. |
| **Link graph (crawled scope)** | For every URL you crawl, store *outbound* links. Build graph: `A → B`. | "Who links to whom" **only** among pages you’ve crawled. |
| **Referring domains (limited)** | Among **crawled** pages that link to your target: `COUNT(DISTINCT source_domain)`. | Requires a **discovery** step for "who links to us" (see below). |
| **Follow vs nofollow** | Parse `rel` on `<a>`; count dofollow vs nofollow | From your crawl only. |
| **Anchor text** | Extract anchor text per link | From your crawl only. |
| **Basic "trust" heuristics** | Your own rules: TLD allowlist/blocklist, domain age (WHOIS), etc. | No Moz/Majestic; you define the model. |
| **Estimated DA-like score** | e.g. `min(100, log10(1 + referring_domains) * 10 + log10(1 + total_links) * 5)` | Label clearly as **Estimated**; not comparable to Moz DA. |

---

## 2. What You Cannot Replicate (Without Web-Scale Infra)

| Capability | Why |
|------------|-----|
| **Full backlink index** | Ahrefs/Moz/Majestic crawl billions of pages. You only crawl what you explicitly fetch. |
| **"All" referring domains** | You only know referrers you’ve *discovered* (see below) and then crawled. |
| **True Domain Authority** | Built on proprietary link graphs over the whole web. You’d need a similar-scale index. |
| **Spam/toxic scores** | Providers use large ML models and historical data. You can use **heuristics** (TLD, patterns) but not equivalents. |

---

## 3. Discovering "Who Links to You" (Without Third-Party APIs)

To compute **your own** referring domains and backlinks, you must first **discover** pages that link to your site. Options (all under your control):

| Source | How | Pros | Cons |
|--------|-----|------|------|
| **1. Your own site crawl** | Crawl your sitemap + follow internal links. Extract *outbound* links. | Simple, no external data. | Only "you → others"; not "others → you". |
| **2. Referrer / access logs** | Parse server logs or reverse proxy logs for `Referer` header. | Real traffic; real referrers. | Need log access; only see referrers that send Referer. |
| **3. GSC "Links" export** | Use Google Search Console **Links** report → export "External links" / "Top linking sites". | Official Google data; high signal. | Manual export (or GSC API—still Google, but *your* GSC, not Ahrefs). |
| **4. Manual list** | Curate URLs (e.g. from manual research, outreach) that link to you. | Full control. | Manual effort. |
| **5. Custom "link:"-style discovery** | Use a **public search API** (e.g. Google Custom Search, Bing) to run `link:yourdomain.com` and collect URLs. | Discovers external referrers. | **Uses external APIs** (Google/Bing). If you strictly avoid *any* external APIs, skip this. |
| **6. Common Crawl** | Process Common Crawl index for pages containing your domain URL. | Huge scale; no *live* third-party backlink API. | Heavy processing; data is periodic, not real-time. |

**Recommendation:** Start with **(1) + (2) + (3) + (4)**. Crawl your site, ingest referrer logs and GSC exports, and optionally a manual list. Then crawl those discovered **referrer URLs** and extract links *to* your domain. That gives you a **self-hosted** "backlink" set and referring domains, without Ahrefs/Moz/Majestic.

---

## 4. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        SCRAPING ENGINE (Python)                          │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────┐   ┌────────────┐  │
│  │  Discovery  │   │   Crawler    │   │  Extractor  │   │  Storage   │  │
│  │ (URL seed   │──▶│ (async HTTP, │──▶│ (links,     │──▶│ (SQLite /  │  │
│  │  + logs +   │   │  robots.txt, │   │  meta, rel, │   │  JSON /    │  │
│  │  GSC list)  │   │  rate limit) │   │  anchors)   │   │  Postgres) │  │
│  └─────────────┘   └──────────────┘   └─────────────┘   └────────────┘  │
│         │                    │                │                  │      │
│         └────────────────────┴────────────────┴──────────────────┘      │
│                                      │                                   │
│                              ┌───────▼───────┐                          │
│                              │  Link Graph   │                          │
│                              │  + Metrics    │                          │
│                              │ (referring    │                          │
│                              │  domains,     │                          │
│                              │  follow %,    │                          │
│                              │  etc.)        │                          │
│                              └───────┬───────┘                          │
│                                      │                                   │
│  ┌───────────────────────────────────▼───────────────────────────────┐  │
│  │  API (FastAPI) — optional                                          │  │
│  │  POST /crawl   POST /ingest-referrers   GET /report/:domain         │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                        │
                        ┌───────────────▼───────────────┐
                        │  Riviso Backend (NestJS)      │
                        │  Calls engine or reads DB     │
                        │  → Off-Page / On-Page UI      │
                        └───────────────────────────────┘
```

---

## 5. Technology Stack

| Layer | Tech | Purpose |
|-------|------|---------|
| **HTTP** | `httpx` (async) | Fetch HTML; follow redirects; control timeouts, headers. |
| **Parsing** | `BeautifulSoup4` + `lxml` | Extract links, meta, headings. Fast, reliable. |
| **Concurrency** | `asyncio` + `asyncio.Semaphore` | Rate-limited concurrent requests. |
| **Robots** | `urllib.robotparser` or `reppy` | Respect robots.txt. |
| **Storage** | SQLite (default) or PostgreSQL | Store raw pages, link graph, derived metrics. |
| **API** | FastAPI + Uvicorn | Optional HTTP API for crawl jobs and report retrieval. |
| **Queue** | In-memory `asyncio.Queue` or Redis | Crawl queue; Redis if you scale to multiple workers. |
| **JS rendering** | Playwright (optional) | Only when you need to execute JS (e.g. SPA). |

**Python:** 3.11+

---

## 6. Core Modules

### 6.1 Crawler (`crawler.py`)

- **Input:** Seed URLs, optional `target_domain` (your site), politeness delay, max pages per domain.
- **Logic:**
  - Fetch robots.txt per domain; skip disallowed paths.
  - GET each URL; parse HTML; push discovered same-domain URLs into queue (BFS).
  - Optionally follow external links **only** if they’re in a "referrer" allowlist (e.g. from GSC or logs).
- **Output:** Raw HTML + final URL (after redirects) per fetched page.

### 6.2 Extractor (`extractor.py`)

- **Input:** Raw HTML, page URL, target domain.
- **Output:**
  - **Links:** `[{ "href", "anchor", "rel", "is_internal", "is_nofollow" }]`
  - **Meta:** title, description, canonical.
  - **Headings:** h1–h6, structure.
  - **Images:** src, alt.

### 6.3 Link Graph & Metrics (`graph.py`)

- **Input:** Extracted links from all crawled pages + which pages were "referrers" (link to target).
- **Output:**
  - **Link graph:** `(source_url, target_url, anchor, rel)`.
  - **Referring domains:** `COUNT(DISTINCT source_domain)` where source links to target domain.
  - **Follow vs nofollow:** counts and ratios.
  - **Anchor text distribution:** branded, exact-match, generic (using your own rules).

### 6.4 Storage (`storage.py`)

- **Schema (minimal):**
  - `pages`: url, domain, html_size, fetched_at, status_code.
  - `links`: source_url, target_url, anchor, rel, is_internal.
  - `metrics`: domain, referring_domains, total_backlinks, follow_pct, updated_at.

### 6.5 API (`api.py`)

- **Endpoints:**
  - `POST /crawl` — Body: `{ "seed_urls": [...], "target_domain": "example.com", "max_pages": 500 }`. Enqueue crawl; return job id.
  - `GET /crawl/:job_id` — Status + progress.
  - `GET /report/:domain` — Aggregated metrics (referring domains, follow %, etc.) from last completed crawl for that domain.
  - `POST /ingest-referrers` — Body: `{ "domain": "example.com", "urls": [...] }`. Add URLs to "referrers to crawl" list.

---

## 7. Data Flow (No External APIs)

1. **Discovery:** You provide seed URLs + referrer list (from logs, GSC export, or manual list). No third-party backlink API.
2. **Crawl:** Engine fetches only those URLs (and same-domain links from your site). Respects robots.txt and rate limits.
3. **Extract:** Links, meta, anchors, rel. All from your crawl.
4. **Store:** Raw data + link graph in your DB.
5. **Compute:** Referring domains, follow %, etc., from your link graph.
6. **Serve:** API returns metrics; NestJS backend can call it or read from shared DB. Frontend shows "your own data" instead of sample or Ahrefs/Moz.

---

## 8. Deploying the Engine

- **Standalone:** Run `uvicorn api:app` in `tools/scraper-engine`. NestJS calls `POST /crawl` and `GET /report/:domain` over HTTP.
- **Same host:** Engine and NestJS on same server; use `localhost` or internal network.
- **Docker:** Optional `Dockerfile` for the Python engine; orchestrate with `docker-compose` alongside NestJS, Postgres, Redis.

---

## 9. What Remains "Estimated" or Heuristic

Even with your own engine, these will be **estimates** or **heuristics** (document them clearly in the UI):

- **Domain Authority–like score:** Formula from your referring domains + total links; label "Estimated".
- **Trust / spam:** Your own TLD lists, simple rules. Not comparable to Moz/Majestic.
- **Topical relevance:** Optional keyword overlap or simple classifiers on page text; no external taxonomy.

---

## 10. Summary

- **Build:** A Python-based crawler + extractor + link graph + optional FastAPI.
- **Data sources:** Only your crawls, your logs, your GSC exports, and manual referrer lists. **No Majestic, Ahrefs, Moz, or other backlink APIs.**
- **Output:** Referring domains (from discovered referrers), follow/nofollow, anchor stats, and derived metrics you can feed into the Off-Page UI, with clear labeling where values are estimated or heuristic.

The `tools/scraper-engine` package in this repo provides a working starter implementation of this design.
