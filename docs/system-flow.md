# System Flows

> **Detailed documentation of user journeys, data flows, and system processes**

---

## 🚀 User Journeys

### 1. New User Onboarding

```
┌──────────────────────────────────────────────────────────┐
│ STEP 1: Registration                                     │
├──────────────────────────────────────────────────────────┤
│ User visits https://app.riviso.com                       │
│   ↓                                                       │
│ Clicks "Get Started" / "Sign Up"                         │
│   ↓                                                       │
│ Fills registration form:                                 │
│ • Full name                                              │
│ • Email address                                          │
│ • Password (min 8 chars, 1 uppercase, 1 number)         │
│ • Accepts Terms of Service                               │
│   ↓                                                       │
│ Frontend validates input                                 │
│   ↓                                                       │
│ POST /api/auth/register                                  │
│   ↓                                                       │
│ Backend:                                                  │
│ • Validates DTO (class-validator)                        │
│ • Checks if email already exists                         │
│ • Hashes password (bcrypt, cost 10)                      │
│ • Creates User entity                                    │
│ • Saves to PostgreSQL                                    │
│ • Sends welcome email (background job)                   │
│   ↓                                                       │
│ Returns { accessToken, refreshToken, user }              │
│   ↓                                                       │
│ Frontend stores token in localStorage                    │
│   ↓                                                       │
│ Redirects to /dashboard                                  │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ STEP 2: Project Setup                                    │
├──────────────────────────────────────────────────────────┤
│ User lands on empty dashboard                            │
│   ↓                                                       │
│ Sees "Create Your First Project" prompt                  │
│   ↓                                                       │
│ Clicks "Add Project"                                     │
│   ↓                                                       │
│ Fills project form:                                      │
│ • Website URL (e.g., https://example.com)               │
│ • Project name (e.g., "Main Website")                   │
│ • Industry (optional dropdown)                           │
│   ↓                                                       │
│ POST /api/projects                                       │
│   ↓                                                       │
│ Backend:                                                  │
│ • Validates URL format                                   │
│ • Creates Project entity                                 │
│ • Creates default Workspace (if first project)          │
│ • Associates with current user                           │
│ • Initiates background jobs:                            │
│   ├─→ Initial SEO audit                                  │
│   ├─→ Sitemap crawl                                      │
│   └─→ Meta data extraction                               │
│   ↓                                                       │
│ Returns { projectId, status: "processing" }              │
│   ↓                                                       │
│ Frontend shows "Setting up your project..." loader       │
│   ↓                                                       │
│ Polls GET /api/projects/:id/status every 5s             │
│   ↓                                                       │
│ When complete, redirects to project dashboard            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ STEP 3: First Insights                                   │
├──────────────────────────────────────────────────────────┤
│ User arrives at project dashboard                        │
│   ↓                                                       │
│ Dashboard fetches initial data:                          │
│ • GET /api/seo/insights/:projectId                       │
│ • GET /api/keywords/:projectId                           │
│ • GET /api/cro/insights/:projectId                       │
│   ↓                                                       │
│ Displays welcome tour (first-time only):                 │
│ 1. "Here's your SEO score (78/100)"                     │
│ 2. "These are your top keywords (5 shown)"              │
│ 3. "CRO opportunities detected (3 insights)"            │
│ 4. "Try asking AI: 'What are my top keywords?'"         │
│   ↓                                                       │
│ User explores each section                               │
│   ↓                                                       │
│ Onboarding complete ✓                                    │
└──────────────────────────────────────────────────────────┘
```

---

### 2. Daily User Journey

```
┌──────────────────────────────────────────────────────────┐
│ Morning Check-In (Executive User)                        │
├──────────────────────────────────────────────────────────┤
│ 8:00 AM - User logs in                                   │
│   ↓                                                       │
│ Dashboard loads with fresh data:                         │
│ • Organic traffic: 5,420 (+12.5% ↑)                     │
│ • Avg. rank: 12.5 (-3.2 ↓)                              │
│ • Keywords: 150 (+8 ↑)                                   │
│ • Conversions: 89 (+15.3% ↑)                            │
│   ↓                                                       │
│ Notices red badge: "2 critical CRO issues"               │
│   ↓                                                       │
│ Clicks "CRO Insights"                                    │
│   ↓                                                       │
│ Sees priority insight:                                   │
│ "High Traffic, Low Conversion on /pricing"              │
│ • 2,400 views/month                                      │
│ • Only 1.8% conversion                                   │
│ • $2,800 revenue opportunity                            │
│   ↓                                                       │
│ Expands AI recommendations:                              │
│ 1. Optimize CTA (+35% lift, 30 min)                     │
│ 2. Add trust signals (+28% lift, 2 hours)               │
│ 3. Clarify value prop (+22% lift, 45 min)               │
│   ↓                                                       │
│ Clicks checkbox on "Move CTA above fold"                 │
│   ↓                                                       │
│ Forwards to design team via Slack integration            │
│   ↓                                                       │
│ 8:15 AM - Quick check complete                           │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Weekly Deep Dive (SEO Specialist)                        │
├──────────────────────────────────────────────────────────┤
│ User navigates to "Keywords & SERP"                      │
│   ↓                                                       │
│ Filters: "Show only keywords that dropped"               │
│   ↓                                                       │
│ Sees "seo tools" dropped from #3 to #7                   │
│   ↓                                                       │
│ Clicks "View Details"                                    │
│   ↓                                                       │
│ Historical chart shows:                                  │
│ • Steady at #3 for 2 months                             │
│ • Sudden drop on Jan 15                                  │
│ • Correlated with Google algorithm update                │
│   ↓                                                       │
│ Opens AI Chat: "Why did 'seo tools' drop?"              │
│   ↓                                                       │
│ AI analyzes and responds:                                │
│ "Based on my analysis of your analytics data,            │
│  I've identified a 27.5% traffic drop on Jan 15.         │
│  Main factors:                                           │
│  1. Keyword ranking declines (2 keywords)                │
│  2. Core Web Vitals degraded (LCP: 4.2s)                │
│  3. Possible algorithm update                            │
│                                                          │
│  Recommendations:                                         │
│  1. Fix page speed issues immediately                    │
│  2. Update content to match current search intent        │
│  3. Analyze top-ranking competitors' recent changes"     │
│   ↓                                                       │
│ User creates action plan in project management tool      │
└──────────────────────────────────────────────────────────┘
```

---

## 📥 Data Ingestion Flows

### 1. SEO Audit Data Ingestion

```
┌──────────────────────────────────────────────────────────┐
│ Automated SEO Audit (Daily Cron Job)                     │
├──────────────────────────────────────────────────────────┤
│ 2:00 AM UTC - Cron triggers                              │
│   ↓                                                       │
│ For each active project:                                 │
│   ↓                                                       │
│ SeoService.runScheduledAudit(projectId)                 │
│   ↓                                                       │
│ Fetch project pages from database                        │
│   ↓                                                       │
│ For each page URL:                                       │
│   ├─→ Technical Analysis                                 │
│   │   ├─ Load page with Puppeteer                        │
│   │   ├─ Measure page speed (LCP, FID, CLS)             │
│   │   ├─ Check mobile responsiveness                     │
│   │   ├─ Verify SSL certificate                          │
│   │   └─ Check for JavaScript errors                     │
│   │                                                       │
│   ├─→ On-Page SEO Analysis                              │
│   │   ├─ Extract title tag (check length 50-60 chars)   │
│   │   ├─ Extract meta description (150-160 chars)       │
│   │   ├─ Count H1 tags (should be 1)                    │
│   │   ├─ Analyze heading hierarchy (H1→H2→H3)           │
│   │   ├─ Check image alt tags (missing = issue)         │
│   │   └─ Verify canonical URL                            │
│   │                                                       │
│   ├─→ Content Analysis                                   │
│   │   ├─ Count total words (min 300 recommended)        │
│   │   ├─ Calculate readability score (Flesch-Kincaid)   │
│   │   ├─ Check keyword density                           │
│   │   └─ Identify thin content                           │
│   │                                                       │
│   └─→ Link Analysis                                      │
│       ├─ Count internal links                            │
│       ├─ Count external links                            │
│       ├─ Find broken links (404 responses)               │
│       └─ Check for nofollow links                        │
│   ↓                                                       │
│ Aggregate results into audit report:                     │
│ {                                                        │
│   score: 78,                                            │
│   issues: [                                             │
│     {                                                   │
│       severity: 'critical',                            │
│       type: 'missing_meta_description',                │
│       affectedPages: 15,                               │
│       recommendation: 'Add meta descriptions...'        │
│     },                                                  │
│     ...                                                 │
│   ],                                                    │
│   passed: [...],                                        │
│   warnings: [...]                                       │
│ }                                                        │
│   ↓                                                       │
│ Create SeoAudit entity with JSONB report                 │
│   ↓                                                       │
│ Save to PostgreSQL                                       │
│   ↓                                                       │
│ Cache summary in Redis (24 hour TTL)                     │
│   ↓                                                       │
│ If critical issues detected:                             │
│   └─→ Queue notification job                             │
│       └─→ Send email alert to user                       │
│   ↓                                                       │
│ Log completion to OpenSearch                             │
│   ↓                                                       │
│ 2:45 AM - Audit complete                                 │
└──────────────────────────────────────────────────────────┘
```

---

### 2. SERP Data Ingestion

```
┌──────────────────────────────────────────────────────────┐
│ Keyword Rank Tracking (Daily)                            │
├──────────────────────────────────────────────────────────┤
│ 3:00 AM UTC - Cron triggers                              │
│   ↓                                                       │
│ For each project with active keywords:                   │
│   ↓                                                       │
│ SerpService.checkRankings(projectId)                    │
│   ↓                                                       │
│ Fetch all tracked keywords for project                   │
│   ↓                                                       │
│ For each keyword (batch of 10):                          │
│   ├─→ Check rate limit (don't exceed 100/day)           │
│   │                                                       │
│   ├─→ Fetch SERP data:                                   │
│   │   Option A: Google Search API (if configured)       │
│   │   Option B: Third-party SERP API (DataForSEO, etc.) │
│   │   Option C: Puppeteer scraping (fallback)           │
│   │                                                       │
│   ├─→ Parse SERP results:                                │
│   │   • Top 100 results                                  │
│   │   • Extract: URL, title, description, position      │
│   │   • Identify featured snippets                       │
│   │   • Note SERP features (images, videos, etc.)       │
│   │                                                       │
│   ├─→ Find project URL in results:                       │
│   │   • Search for domain match                          │
│   │   • Record position (1-100, or >100)                │
│   │   • Note if in featured snippet                      │
│   │                                                       │
│   ├─→ Calculate rank change:                             │
│   │   • Fetch previous rank from database                │
│   │   • Calculate delta: currentRank - previousRank     │
│   │   • Classify: improved (negative) / dropped (pos)   │
│   │                                                       │
│   └─→ Store results:                                     │
│       ├─ Create KeywordRanking entity                    │
│       ├─ Save to PostgreSQL                              │
│       ├─ Index in OpenSearch (for analytics)            │
│       └─ Update cache in Redis                           │
│   ↓                                                       │
│ Analyze aggregated results:                              │
│   ├─ Count keywords improved vs. dropped                 │
│   ├─ Calculate average rank change                       │
│   ├─ Identify significant changes (>5 positions)         │
│   └─ Detect potential algorithm updates                  │
│   ↓                                                       │
│ If significant changes detected:                         │
│   ├─→ Queue notification job                             │
│   │   ├─ Email: "5 keywords dropped significantly"      │
│   │   └─ Slack: "@channel Ranking alert!"               │
│   │                                                       │
│   └─→ Trigger CRO analysis                               │
│       └─ Check if traffic impacted                       │
│   ↓                                                       │
│ Log completion and metrics                               │
│   ↓                                                       │
│ 4:30 AM - Rank check complete                            │
└──────────────────────────────────────────────────────────┘
```

---

### 3. Analytics Data Ingestion

```
┌──────────────────────────────────────────────────────────┐
│ Google Analytics Integration (Real-time)                 │
├──────────────────────────────────────────────────────────┤
│ User connects Google Analytics                           │
│   ↓                                                       │
│ OAuth 2.0 flow:                                          │
│   ├─ User clicks "Connect Google Analytics"              │
│   ├─ Redirects to Google consent screen                  │
│   ├─ User authorizes access                              │
│   ├─ Google redirects back with auth code                │
│   ├─ Backend exchanges code for access token            │
│   └─ Store encrypted tokens in database                  │
│   ↓                                                       │
│ Initial data sync:                                       │
│   ├─→ Fetch last 90 days of data                        │
│   ├─→ Aggregate by day:                                  │
│   │   • Sessions                                         │
│   │   • Users                                            │
│   │   • Pageviews                                        │
│   │   • Bounce rate                                      │
│   │   • Avg. session duration                           │
│   │   • Conversions (if goals configured)               │
│   │                                                       │
│   ├─→ Store in PostgreSQL                                │
│   └─→ Index in OpenSearch for fast queries               │
│   ↓                                                       │
│ Scheduled sync (every 6 hours):                          │
│   ├─ Fetch data since last sync                         │
│   ├─ Update existing records                            │
│   ├─ Insert new records                                 │
│   └─ Invalidate Redis cache                             │
│   ↓                                                       │
│ Real-time metrics (WebSocket):                           │
│   ├─ Connect to Google Analytics Real-time API          │
│   ├─ Stream active users count                          │
│   ├─ Stream current page views                          │
│   └─ Push to frontend via WebSocket                     │
│   ↓                                                       │
│ Data ready for AI analysis and CRO engine               │
└──────────────────────────────────────────────────────────┘
```

---

## 🤖 AI Query Lifecycle

### Complete AI Query Flow

```
┌──────────────────────────────────────────────────────────┐
│ USER INITIATES QUERY                                     │
├──────────────────────────────────────────────────────────┤
│ User types: "Why did my traffic drop?"                   │
│   ↓                                                       │
│ Frontend sends:                                          │
│ POST /api/ai/chat                                        │
│ {                                                        │
│   "message": "Why did my traffic drop?",                │
│   "sessionId": "session-123",                           │
│   "projectId": "project-456"                            │
│ }                                                        │
└──────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────┐
│ BACKEND RECEIVES REQUEST                                 │
├──────────────────────────────────────────────────────────┤
│ AiController.chat()                                      │
│   ↓                                                       │
│ Validates:                                               │
│ • JWT token (authentication)                             │
│ • User has access to projectId (authorization)          │
│ • Message is not empty                                   │
│ • Rate limit not exceeded (100/hour)                     │
│   ↓                                                       │
│ Extracts userId from JWT                                 │
│   ↓                                                       │
│ Calls AiService.processPrompt(dto, userId)              │
└──────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 1: INTENT ANALYSIS                                  │
├──────────────────────────────────────────────────────────┤
│ PromptMapperService.analyzePrompt()                     │
│   ↓                                                       │
│ Keyword matching:                                        │
│ • "traffic" matches trafficKeywords ✓                    │
│ • "drop" matches dropKeywords ✓                          │
│   ↓                                                       │
│ Calls: mapTrafficDropIntent()                            │
│   ↓                                                       │
│ Returns:                                                 │
│ {                                                        │
│   intent: {                                             │
│     type: "traffic_analysis",                          │
│     confidence: 0.92,                                   │
│     keywords: ["traffic", "drop", "analytics"],        │
│     dataSources: ["analytics", "seo", "keywords"]      │
│   },                                                    │
│   requiredDataSources: [                                │
│     {                                                   │
│       name: "Google Analytics - Traffic Trend",        │
│       type: "analytics",                               │
│       query: "SELECT date, sessions, users...",        │
│       relevance: 1.0                                   │
│     },                                                  │
│     {                                                   │
│       name: "SEO Audit - Recent Changes",              │
│       type: "seo",                                     │
│       query: "SELECT * FROM seo_audits...",            │
│       relevance: 0.85                                  │
│     },                                                  │
│     {                                                   │
│       name: "Keyword Rankings - Changes",              │
│       type: "keywords",                                │
│       query: "SELECT keyword, previous_rank...",       │
│       relevance: 0.9                                   │
│     }                                                   │
│   ]                                                     │
│ }                                                        │
│   ↓                                                       │
│ Processing time: 15ms                                    │
└──────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 2: DATA FETCHING                                    │
├──────────────────────────────────────────────────────────┤
│ DataFetcherService.fetchData(dataSources)              │
│   ↓                                                       │
│ Parallel data fetching (Promise.all):                   │
│   ↓                                                       │
│ Query 1: Analytics (52ms)                                │
│ ├─ SELECT date, sessions, users                         │
│ ├─ FROM analytics                                        │
│ ├─ WHERE project_id = 'project-456'                     │
│ ├─ AND date >= NOW() - INTERVAL '30 days'               │
│ ├─ ORDER BY date DESC                                    │
│ └─ Result: 4 records                                     │
│   {                                                      │
│     timeline: [                                         │
│       { date: '2024-01-01', sessions: 5420, users: 4200 },│
│       { date: '2024-01-08', sessions: 5680, users: 4350 },│
│       { date: '2024-01-15', sessions: 4120, users: 3200 },│
│       { date: '2024-01-22', sessions: 4050, users: 3150 } │
│     ],                                                   │
│     summary: {                                          │
│       dropDate: '2024-01-15',                          │
│       dropPercentage: -27.5                            │
│     }                                                    │
│   }                                                      │
│   ↓                                                       │
│ Query 2: SEO Audits (48ms)                               │
│ ├─ SELECT * FROM seo_audits                             │
│ ├─ WHERE project_id = 'project-456'                     │
│ ├─ AND audit_date >= NOW() - INTERVAL '30 days'         │
│ ├─ ORDER BY audit_date DESC                             │
│ └─ Result: 2 records                                     │
│   {                                                      │
│     audits: [                                           │
│       {                                                 │
│         date: '2024-01-15',                            │
│         changes: [                                     │
│           'Core Web Vitals degraded',                 │
│           'LCP increased to 4.2s'                     │
│         ],                                             │
│         score: 72                                      │
│       },                                                │
│       {                                                 │
│         date: '2024-01-08',                            │
│         changes: ['Added new pages'],                  │
│         score: 78                                      │
│       }                                                 │
│     ]                                                    │
│   }                                                      │
│   ↓                                                       │
│ Query 3: Keyword Rankings (45ms)                         │
│ ├─ SELECT keyword, previous_rank, current_rank,         │
│ ├─        rank_change, search_volume                    │
│ ├─ FROM keyword_rankings                                │
│ ├─ WHERE project_id = 'project-456'                     │
│ ├─ AND rank_change < 0                                  │
│ ├─ AND updated_at >= NOW() - INTERVAL '30 days'         │
│ └─ Result: 2 records                                     │
│   {                                                      │
│     keywords: [                                         │
│       {                                                 │
│         keyword: 'seo tools',                          │
│         previousRank: 3,                               │
│         currentRank: 7,                                │
│         change: -4,                                    │
│         searchVolume: 8100                             │
│       },                                                │
│       {                                                 │
│         keyword: 'keyword research',                   │
│         previousRank: 5,                               │
│         currentRank: 8,                                │
│         change: -3,                                    │
│         searchVolume: 12000                            │
│       }                                                 │
│     ]                                                    │
│   }                                                      │
│   ↓                                                       │
│ All queries complete: 145ms total                        │
│   ↓                                                       │
│ Returns:                                                 │
│ {                                                        │
│   data: [ analyticsData, seoData, keywordData ],       │
│   totalRecords: 8,                                      │
│   totalQueryTime: 145,                                  │
│   dataSources: [                                        │
│     "Google Analytics - Traffic Trend",                │
│     "SEO Audit - Recent Changes",                      │
│     "Keyword Rankings - Changes"                       │
│   ]                                                      │
│ }                                                        │
└──────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────┐
│ STEP 3: RESPONSE GENERATION                              │
├──────────────────────────────────────────────────────────┤
│ ResponseGeneratorService.generateTrafficDropResponse()  │
│   ↓                                                       │
│ Extract key metrics:                                     │
│ • Drop date: Jan 15, 2024                               │
│ • Drop percentage: -27.5%                               │
│ • Keywords affected: 2                                   │
│ • Avg rank loss: -3.5 positions                         │
│ • Technical issues: Core Web Vitals degraded            │
│   ↓                                                       │
│ Calculate confidence:                                    │
│ Base: 0.7 (traffic analysis intent)                     │
│ +0.1 (timeline data exists: 4 records)                  │
│ +0.1 (keyword data exists: 2 records)                   │
│ +0.1 (audit data exists: 2 records)                     │
│ = 1.0, capped at 0.99 → 92% confidence                  │
│   ↓                                                       │
│ Generate detailed answer:                                │
│ "Based on my analysis of your analytics data,            │
│  I've identified a significant traffic drop of 27.5%     │
│  that occurred around January 15, 2024.                  │
│                                                          │
│  Main Contributing Factors:                              │
│                                                          │
│  1. Keyword Ranking Declines (High Impact)               │
│     - 2 keywords lost rankings around the same time      │
│     - Average rank loss: 3.5 positions                   │
│     - Top affected: 'seo tools' (Rank 3 → 7)            │
│                                                          │
│  2. Technical Performance Issues (Medium Impact)         │
│     - Core Web Vitals degraded                          │
│     - LCP increased to 4.2s                             │
│                                                          │
│  3. Potential Algorithm Update (Uncertain)               │
│     - Timing suggests possible Google update             │
│                                                          │
│  Recommended Actions:                                    │
│  1. Focus on recovering rankings for top keywords        │
│  2. Address technical performance issues immediately     │
│  3. Analyze competitors' recent content changes          │
│  4. Review site changes made before Jan 15"              │
│   ↓                                                       │
│ Generate reasoning:                                      │
│ "I analyzed 4 days of traffic data, 2 keyword            │
│  rankings, and 2 SEO audits. The correlation between     │
│  the traffic drop date (2024-01-15) and keyword          │
│  ranking losses strongly suggests a ranking-related      │
│  cause. My confidence is 92% based on the strength       │
│  of this correlation and the completeness of the data."  │
│   ↓                                                       │
│ Map data sources:                                        │
│ [                                                        │
│   {                                                      │
│     source: "Google Analytics - Traffic Trend",         │
│     type: "analytics",                                  │
│     summary: "Analyzed 4 days of traffic data"          │
│   },                                                     │
│   {                                                      │
│     source: "SEO Audit - Recent Changes",               │
│     type: "seo",                                        │
│     summary: "Reviewed 2 SEO audit results"             │
│   },                                                     │
│   {                                                      │
│     source: "Keyword Rankings - Changes",               │
│     type: "keywords",                                   │
│     summary: "Examined 2 keyword rankings"              │
│   }                                                      │
│ ]                                                        │
│   ↓                                                       │
│ Generate follow-up suggestions:                          │
│ [                                                        │
│   "Show me which pages lost the most traffic",          │
│   "What did my competitors do differently?",            │
│   "How can I recover these keyword rankings?"           │
│ ]                                                        │
│   ↓                                                       │
│ Processing time: 85ms                                    │
└──────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────┐
│ BACKEND RETURNS RESPONSE                                 │
├──────────────────────────────────────────────────────────┤
│ {                                                        │
│   "message": "Based on my analysis...",                 │
│   "sessionId": "session-123",                           │
│   "confidence": 0.92,                                   │
│   "reasoning": "I analyzed 4 days...",                  │
│   "dataUsed": [ ... ],                                  │
│   "suggestions": [ ... ],                               │
│   "metadata": {                                         │
│     "intentType": "traffic_analysis",                   │
│     "intentConfidence": 0.92,                           │
│     "dataSourcesQueried": [                            │
│       "analytics", "seo", "keywords"                   │
│     ],                                                  │
│     "totalRecords": 8,                                  │
│     "processingTime": 1523                              │
│   }                                                      │
│ }                                                        │
│   ↓                                                       │
│ Total response time: 1523ms                              │
└──────────────────────────────────────────────────────────┘
           ↓
┌──────────────────────────────────────────────────────────┐
│ FRONTEND DISPLAYS RESPONSE                               │
├──────────────────────────────────────────────────────────┤
│ • AI message bubble (gray background)                    │
│ • Sparkles icon + "AI Assistant"                        │
│ • Confidence: 92% (green progress bar)                   │
│ • Formatted answer with markdown                         │
│   ↓                                                       │
│ Expandable sections:                                     │
│ • [▼] How I reached this conclusion                      │
│   → Shows reasoning text                                 │
│ • [▼] Data sources used (3)                              │
│   → Lists all 3 data sources with checkmarks            │
│   ↓                                                       │
│ Follow-up suggestion chips (clickable)                   │
│   ↓                                                       │
│ User can:                                                │
│ • Ask follow-up question                                 │
│ • Click suggestion to auto-fill input                    │
│ • Share response with team                               │
│ • Export to PDF                                          │
└──────────────────────────────────────────────────────────┘
```

---

## ⚠️ Error Handling & Fallbacks

### 1. API Error Handling

```typescript
// Global Exception Filter
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    // Determine error type and status
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    // Log error (production: send to error tracking service)
    logger.error({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: exception,
      user: request.user?.id,
      requestBody: request.body,
    });

    // Send user-friendly response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.getUserFriendlyMessage(exception),
      ...(process.env.NODE_ENV === 'development' && {
        debug: exception.stack,
      }),
    });
  }

  private getUserFriendlyMessage(exception: unknown): string {
    if (exception instanceof ValidationError) {
      return 'Invalid input data. Please check your request.';
    }
    if (exception instanceof UnauthorizedException) {
      return 'Please log in to continue.';
    }
    if (exception instanceof NotFoundException) {
      return 'The requested resource was not found.';
    }
    return 'An unexpected error occurred. Please try again.';
  }
}
```

---

### 2. AI Query Fallbacks

```
AI Query Error Handling Flow:
    ↓
┌─────────────────────────────────────────┐
│ Intent Analysis Fails                   │
├─────────────────────────────────────────┤
│ • Timeout after 5 seconds               │
│ • Invalid query format                  │
│ • Unknown intent                        │
│   ↓                                      │
│ Fallback:                               │
│ • Return "general" intent               │
│ • Provide guidance message              │
│ • Show suggested queries                │
│ • Log error for improvement             │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Data Fetching Fails                     │
├─────────────────────────────────────────┤
│ • Database timeout                      │
│ • No data found                         │
│ • Partial data retrieval                │
│   ↓                                      │
│ Fallback:                               │
│ • Continue with available data          │
│ • Lower confidence score                │
│ • Note missing data sources             │
│ • Provide limited insights              │
└─────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────┐
│ Response Generation Fails               │
├─────────────────────────────────────────┤
│ • LLM API error                         │
│ • Timeout                               │
│ • Rate limit exceeded                   │
│   ↓                                      │
│ Fallback:                               │
│ • Use pre-generated template            │
│ • Fill template with actual data        │
│ • Return with lower confidence          │
│ • Log error for monitoring              │
└─────────────────────────────────────────┘
```

---

### 3. Frontend Error States

```typescript
// React Error Boundary
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log to error tracking service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <AlertCircle className="error-icon" />
          <h2>Something went wrong</h2>
          <p>We've been notified and are working on it.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

### 4. Retry Logic

```typescript
// Exponential backoff for failed requests
async function fetchWithRetry(
  url: string,
  options: RequestOptions,
  maxRetries = 3
): Promise<Response> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok) {
        return response;
      }

      // Don't retry client errors (4xx)
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`Client error: ${response.status}`);
      }

      // Retry server errors (5xx)
      lastError = new Error(`Server error: ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    // Exponential backoff: 1s, 2s, 4s
    const delay = Math.pow(2, i) * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  throw lastError;
}
```

---

## 🔄 State Management

### Frontend State Flow

```
┌─────────────────────────────────────────┐
│ Authentication State                    │
├─────────────────────────────────────────┤
│ localStorage:                           │
│ • accessToken                           │
│ • refreshToken                          │
│ • user: { id, email, name }             │
│   ↓                                      │
│ On app load:                            │
│ • Read from localStorage                │
│ • Validate token expiry                 │
│ • If expired, refresh                   │
│ • If refresh fails, redirect to login   │
│   ↓                                      │
│ On route change:                        │
│ • Check if route requires auth          │
│ • Validate token                        │
│ • Redirect if unauthorized              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ Data Caching Strategy                   │
├─────────────────────────────────────────┤
│ Layer 1: Component State (React)        │
│ • Immediate UI updates                  │
│ • Optimistic updates                    │
│                                         │
│ Layer 2: SWR/React Query (Future)       │
│ • Automatic revalidation                │
│ • Background refetch                    │
│ • Dedupe requests                       │
│                                         │
│ Layer 3: Backend Redis Cache            │
│ • Shared across users                   │
│ • 1-60 minute TTL                       │
│                                         │
│ Layer 4: Database (Source of Truth)     │
│ • PostgreSQL                            │
│ • Persistent storage                    │
└─────────────────────────────────────────┘
```

---

**This completes the system flow documentation. All major user journeys, data flows, AI processes, and error handling patterns are documented.**
