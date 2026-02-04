# System Architecture

> **Comprehensive architectural documentation for the Riviso Growth Intelligence Platform**

---

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Next.js Frontend                       │  │
│  │  • Server-Side Rendering (SSR)                          │  │
│  │  • App Router (file-based routing)                      │  │
│  │  • Tailwind CSS (styling)                               │  │
│  │  • React Components (UI)                                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS / REST API
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    NestJS Backend                        │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Controllers (REST endpoints)                      │ │  │
│  │  │  • AuthController                                  │ │  │
│  │  │  • UserController                                  │ │  │
│  │  │  • ProjectController                               │ │  │
│  │  │  • SeoController                                   │ │  │
│  │  │  • AiController  ← AI Prompt System               │ │  │
│  │  │  • CroController ← CRO Intelligence Engine        │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                           ↓                              │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Services (Business Logic)                         │ │  │
│  │  │  • AuthService (JWT, OAuth2)                       │ │  │
│  │  │  • AiService → PromptMapper → DataFetcher →       │ │  │
│  │  │               ResponseGenerator                    │ │  │
│  │  │  • CroService → CroEngine (5 algorithms)          │ │  │
│  │  │  • SeoService, SerpService, etc.                  │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │                           ↓                              │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │  Infrastructure Layer                              │ │  │
│  │  │  • DatabaseModule (TypeORM)                        │ │  │
│  │  │  • RedisModule (Cache/Queue)                       │ │  │
│  │  │  • OpenSearchModule (Search)                       │ │  │
│  │  │  • VectorDBModule (Interface)                      │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                              │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ PostgreSQL   │  │    Redis     │  │  OpenSearch  │        │
│  │              │  │              │  │              │        │
│  │ • Users      │  │ • Sessions   │  │ • Logs       │        │
│  │ • Workspaces │  │ • Cache      │  │ • Analytics  │        │
│  │ • Projects   │  │ • Jobs Queue │  │ • Search     │        │
│  │ • Pages      │  │              │  │              │        │
│  │ • Keywords   │  └──────────────┘  └──────────────┘        │
│  │ • Competitors│                                             │
│  │ • Insights   │                                             │
│  └──────────────┘                                             │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ OpenAI API   │  │ Google APIs  │  │  Vector DB   │        │
│  │ (GPT-4)      │  │ • Analytics  │  │ (Pinecone/   │        │
│  │              │  │ • Search Con.│  │  Weaviate)   │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Infrastructure Layers

### 1. Client Layer (Frontend)

**Technology:** Next.js 14 (React 18, TypeScript)

**Responsibilities:**
- Server-Side Rendering (SSR) for SEO and performance
- Client-side interactivity and state management
- User authentication and session handling
- API communication via Axios
- Real-time updates (WebSocket ready)

**Key Components:**
- **Pages:** File-based routing in `app/` directory
- **Layouts:** `DashboardLayout` with sidebar navigation
- **Components:** Reusable UI components (Button, Card, Badge)
- **Lib:** API client, authentication utilities

---

### 2. API Layer (Backend)

**Technology:** NestJS 10 (Node.js, TypeScript)

**Architecture Pattern:** Modular monolith with clear service boundaries

#### Module Structure

```typescript
apps/backend/src/
├── modules/              # Feature modules (domain-driven)
│   ├── auth/            # Authentication & authorization
│   ├── user/            # User management
│   ├── project/         # Project/Workspace CRUD
│   ├── seo/             # SEO analysis
│   │   └── services/
│   │       ├── technical-seo-summary.builder.ts  # 6 decision-critical pillars
│   │       ├── technical-seo-advanced.builder.ts # Hidden metrics
│   │       └── web-scraper.service.ts
│   ├── serp/            # SERP tracking
│   ├── competitor/      # Competitor analysis
│   ├── ai/              # AI Prompt System ⭐
│   │   └── services/
│   │       ├── prompt-mapper.service.ts
│   │       ├── data-fetcher.service.ts
│   │       └── response-generator.service.ts
│   ├── cro/             # CRO Intelligence Engine ⭐
│   │   └── services/
│   │       └── cro-engine.service.ts
│   ├── integrations/    # External API connections
│   ├── notifications/   # Email, Slack, etc.
│   └── health/          # Health checks
│
├── infrastructure/      # Data layer abstractions
│   ├── database/        # TypeORM + PostgreSQL
│   ├── redis/           # Redis client
│   ├── opensearch/      # OpenSearch client
│   └── vector-db/       # Vector DB interface
│
└── common/              # Shared utilities
    ├── decorators/      # Custom decorators
    ├── filters/         # Exception filters
    ├── interceptors/    # Logging, transformation
    └── guards/          # Auth guards
```

**Key Features:**
- **Dependency Injection:** NestJS IoC container
- **Module Isolation:** Each module is self-contained
- **Interface-Based Design:** Abstractions for data layer
- **Middleware Pipeline:** Request → Guard → Interceptor → Controller → Service
- **Global Validation:** class-validator on all DTOs
- **API Versioning:** URI-based versioning (`/v1/`, `/v2/`)
- **Swagger Documentation:** Auto-generated API docs

---

### 3. Data Layer

#### PostgreSQL (Primary Database)

**Purpose:** Relational data storage

**Entities:**
```typescript
User
  ├── Workspace (1:N)
      ├── Project (1:N)
          ├── Page (1:N)
          │   ├── SeoAudit (1:N)
          │   ├── CroInsight (1:N)
          │   └── KeywordRanking (1:N)
          ├── Keyword (1:N)
          └── Competitor (1:N)
```

**Schema Highlights:**
- **Users:** Authentication, profile, settings
- **Workspaces:** Multi-tenancy support
- **Projects:** Website/domain tracking
- **Pages:** Individual page analytics
- **Keywords:** Ranking tracking over time
- **Competitors:** Competitor monitoring
- **SeoAudits:** Audit results with JSONB data
- **CroInsights:** CRO recommendations

**Indexes:**
- Unique constraints on `(project, url)` for pages
- Unique constraints on `(project, keyword)` for keywords
- Composite indexes for time-series queries

---

#### Redis (Cache & Queue)

**Purpose:** High-performance caching and job queue

**Use Cases:**
1. **Session Storage** - JWT token blacklisting
2. **API Response Cache** - Frequently accessed data
3. **Rate Limiting** - API throttling
4. **Job Queue** - Background tasks (BullMQ)
   - SEO audit processing
   - SERP data fetching
   - Email notifications
5. **Real-time Data** - WebSocket pub/sub

**Key Patterns:**
```typescript
// Cache pattern
const cachedData = await redis.get(`insights:${projectId}`);
if (cachedData) return JSON.parse(cachedData);

const freshData = await fetchFromDatabase();
await redis.setex(`insights:${projectId}`, 3600, JSON.stringify(freshData));
return freshData;
```

---

#### OpenSearch (Search & Analytics)

**Purpose:** Full-text search and log analytics

**Use Cases:**
1. **Log Aggregation** - Application logs
2. **Analytics Queries** - Fast aggregations
3. **Search Functionality** - Global search across projects
4. **SERP Data Storage** - Historical SERP data

**Index Structure:**
```json
{
  "serp-data-*": {
    "mappings": {
      "properties": {
        "keyword": { "type": "keyword" },
        "rank": { "type": "integer" },
        "url": { "type": "keyword" },
        "timestamp": { "type": "date" }
      }
    }
  }
}
```

---

#### Vector Database (Interface)

**Purpose:** Semantic search and embeddings

**Supported Providers:**
- Pinecone
- Weaviate
- (Extensible via interface)

**Use Cases:**
1. **AI Prompt History** - Semantic search through past queries
2. **Content Similarity** - Find similar pages/content
3. **Recommendation Engine** - Content-based recommendations

**Interface:**
```typescript
interface IVectorDBService {
  init(): Promise<void>;
  upsert(vectors: VectorData[]): Promise<void>;
  query(queryVector: number[], topK: number): Promise<VectorQueryResult[]>;
  delete(ids: string[]): Promise<void>;
}
```

---

### Technical SEO Analysis Philosophy

**Core Principle:** Decision-Critical Metrics Only

**Architecture:**
```
Page Scraping
    ↓
WebScraperService.scrapePage()
    ↓
┌─────────────────────────────────────────────────┐
│ TECHNICAL SEO SUMMARY BUILDER                    │
│ (6 Decision-Critical Pillars)                    │
│                                                 │
│ 1. Crawl & Index Control                        │
│ 2. Site Architecture & Internal Authority       │
│ 3. Page Experience & Core Web Vitals           │
│ 4. Canonicalization & Duplication              │
│ 5. Mobile & Rendering Readiness                 │
│ 6. Security & Protocol Integrity                │
│                                                 │
│ Each metric includes:                           │
│ • Status (pass/warn/fail/info)                  │
│ • Impact level (low/medium/high/critical)      │
│ • "Why this matters" explanation                │
│ • Affected pages count                         │
│ • Fix priority (1-10)                           │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ TECHNICAL SEO ADVANCED BUILDER                   │
│ (Hidden by Default)                             │
│                                                 │
│ • JavaScript & Rendering (detailed)             │
│ • International & Multilingual SEO              │
│ • Structured Data Diagnostics                   │
│ • Log File Analysis                             │
│ • XML Sitemaps & Discovery                      │
│ • Server & Hosting Performance                  │
│ • Automation & Monitoring                      │
│ • Crawl Budget Modeling                         │
│ • Anchor Text Analysis                          │
└─────────────────────────────────────────────────┘
    ↓
API Response:
{
  technicalSeo: { categories: [...6 pillars...] },
  technicalSeoAdvanced: [...hidden categories...]
}
```

**Key Design Decisions:**
- ✅ Only metrics that change user action are visible by default
- ✅ Impact scoring guides prioritization
- ✅ "Why this matters" explanations for clarity
- ✅ Advanced metrics available but hidden
- ✅ AI references only visible metrics by default

---

## 🔄 Service Interactions

### Authentication Flow

```
User Login Request
    ↓
AuthController.login()
    ↓
AuthService.validateUser()
    ↓
UserRepository.findByEmail()
    ↓
bcrypt.compare(password, hashedPassword)
    ↓
JwtService.sign({ userId, email })
    ↓
Return { accessToken, refreshToken }
    ↓
Frontend stores token in localStorage
    ↓
Subsequent requests include:
    Authorization: Bearer <token>
    ↓
JwtAuthGuard validates token
    ↓
Request.user populated with user data
```

---

### SEO Analysis Flow

```
User requests SEO audit for URL
    ↓
SeoController.analyzeUrl()
    ↓
SeoService.runAudit()
    ↓
    ├─→ Technical checks (page speed, mobile, SSL)
    ├─→ On-page SEO (title, meta, headings)
    ├─→ Content analysis (word count, readability)
    └─→ Link analysis (internal, external)
    ↓
SeoAudit entity created with JSONB report
    ↓
Saved to PostgreSQL
    ↓
Cache results in Redis (1 hour TTL)
    ↓
Return audit results to frontend
    ↓
Frontend displays issues, recommendations, score
```

---

### SERP Tracking Flow

```
Cron job triggers keyword rank check
    ↓
SerpService.checkRankings()
    ↓
For each keyword:
    ├─→ Fetch SERP data from Google (or API)
    ├─→ Find project URL in results
    ├─→ Record rank position
    └─→ Calculate rank change (vs. previous)
    ↓
KeywordRanking entities created
    ↓
Saved to PostgreSQL
    ↓
Historical data indexed in OpenSearch
    ↓
If significant change:
    ├─→ NotificationService.send()
    └─→ Email/Slack alert to user
```

---

### Competitor Analysis Flow

```
User adds competitor domain
    ↓
CompetitorController.addCompetitor()
    ↓
CompetitorService.analyze()
    ↓
    ├─→ Fetch domain authority
    ├─→ Find common keywords
    ├─→ Identify ranking gaps
    └─→ Content gap analysis
    ↓
Competitor entity created
    ↓
Saved to PostgreSQL
    ↓
Background job scheduled (daily refresh)
    ↓
ComparisonReport generated
    ↓
Return insights to frontend
```

---

## 🤖 AI System Architecture

### AI Prompt System Flow

```
User Query: "Why did my traffic drop?"
    ↓
AiController.chat()
    ↓
AiService.processPrompt()
    ↓
┌─────────────────────────────────────────────────┐
│ STEP 1: Intent Analysis                        │
│ PromptMapperService.analyzePrompt()            │
│                                                 │
│ Input: "Why did my traffic drop?"              │
│ ↓                                               │
│ Keyword Matching:                               │
│ • "traffic" ∈ trafficKeywords                   │
│ • "drop" ∈ dropKeywords                         │
│ ↓                                               │
│ Output:                                         │
│ {                                               │
│   intent: "traffic_analysis",                  │
│   confidence: 0.92,                            │
│   requiredDataSources: [                       │
│     "Google Analytics - Traffic Trend",        │
│     "SEO Audit - Recent Changes",              │
│     "Keyword Rankings - Changes"               │
│   ]                                             │
│ }                                               │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ STEP 2: Data Fetching                          │
│ DataFetcherService.fetchData()                 │
│                                                 │
│ Parallel Queries:                               │
│ ├─→ Analytics DB:                               │
│ │   SELECT date, sessions FROM analytics       │
│ │   WHERE date >= NOW() - INTERVAL '30 days'   │
│ │   Result: 4 records                          │
│ │                                               │
│ ├─→ SEO Audits DB:                             │
│ │   SELECT * FROM seo_audits                   │
│ │   WHERE audit_date >= NOW() - INTERVAL '30d' │
│ │   Result: 2 records                          │
│ │                                               │
│ └─→ Keywords DB:                               │
│     SELECT keyword, previous_rank, current_rank│
│     FROM keyword_rankings                       │
│     WHERE rank_change < 0                      │
│     Result: 2 records                          │
│                                                 │
│ Output:                                         │
│ {                                               │
│   data: [ ...fetchedData ],                    │
│   totalRecords: 8,                             │
│   totalQueryTime: 145ms                        │
│ }                                               │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ STEP 3: Response Generation                    │
│ ResponseGeneratorService.generateResponse()    │
│                                                 │
│ Analysis:                                       │
│ • Extract drop date: Jan 15, 2024              │
│ • Calculate drop %: -27.5%                     │
│ • Identify keyword losses: 2 keywords          │
│ • Find technical issues: Core Web Vitals       │
│                                                 │
│ Confidence Calculation:                         │
│ Base: 0.7 (traffic analysis)                   │
│ +0.1 (timeline data exists)                    │
│ +0.1 (keyword data exists)                     │
│ +0.1 (audit data exists)                       │
│ = 0.92 (92% confident)                         │
│                                                 │
│ Output:                                         │
│ {                                               │
│   answer: "Based on my analysis...",           │
│   confidence: 0.92,                            │
│   reasoning: "I analyzed 4 days...",           │
│   dataUsed: [                                  │
│     { source: "Analytics", records: 4 },       │
│     { source: "SEO", records: 2 },             │
│     { source: "Keywords", records: 2 }         │
│   ],                                            │
│   suggestions: [ ... ]                         │
│ }                                               │
└─────────────────────────────────────────────────┘
    ↓
AiService returns complete response
    ↓
AiController sends JSON to frontend
    ↓
Frontend displays:
    • AI message bubble
    • Confidence bar (92% green)
    • Reasoning accordion
    • Data sources list
    • Follow-up suggestions
```

**Key Components:**

1. **PromptMapperService** (220 lines)
   - Intent classification using keyword matching
   - Maps intents to required data sources
   - Returns confidence scores

2. **DataFetcherService** (270 lines)
   - Fetches data from multiple sources in parallel
   - Simulates database queries (mock data)
   - Tracks query times and record counts

3. **ResponseGeneratorService** (510 lines)
   - Generates intelligent responses
   - Calculates confidence based on data availability
   - Provides transparent reasoning
   - Includes actionable recommendations

---

### CRO Intelligence Engine Logic

```
Page Analytics Data
    ↓
CroController.getInsights()
    ↓
CroService.getInsights()
    ↓
CroEngineService.analyzePage()
    ↓
┌─────────────────────────────────────────────────┐
│ RULE-BASED DETECTION                           │
│                                                 │
│ Rule 1: High Traffic, Low Conversion           │
│ ├─ isHighTraffic = pageViews > 1000            │
│ ├─ isLowConversion = conversionRate < 2.5%     │
│ └─ If both: ISSUE DETECTED                     │
│                                                 │
│ Rule 2: Intent Mismatch                        │
│ ├─ Check: userIntent vs. pageType              │
│ ├─ Check: trafficSource vs. bounceRate         │
│ └─ If mismatch: ISSUE DETECTED                 │
│                                                 │
│ Rule 3: Poor Engagement                        │
│ ├─ Check: avgTimeOnPage < 30s                  │
│ ├─ Check: bounceRate > 55%                     │
│ └─ If both: ISSUE DETECTED                     │
│                                                 │
│ Rule 4: High Exit Rate                         │
│ ├─ Check: exitRate > 60%                       │
│ └─ If true: ISSUE DETECTED                     │
│                                                 │
│ Rule 5: Funnel Drop-Off                        │
│ ├─ Calculate: dropOff between steps            │
│ ├─ Check: dropOff > 40%                        │
│ └─ If true: ISSUE DETECTED                     │
└─────────────────────────────────────────────────┘
    ↓
Issues Identified
    ↓
┌─────────────────────────────────────────────────┐
│ RECOMMENDATION GENERATION                       │
│                                                 │
│ For each issue:                                 │
│ ├─→ Generate 1-3 recommendations                │
│ ├─→ Add AI reasoning                           │
│ ├─→ Create action items with time estimates    │
│ ├─→ Calculate expected lift                    │
│ ├─→ Assign confidence score                    │
│ └─→ Add real-world examples                    │
│                                                 │
│ Example Recommendation:                         │
│ {                                               │
│   category: "CTA Optimization",                │
│   title: "Optimize Call-to-Action",            │
│   reasoning: "With 2,400 visitors...",         │
│   actionItems: [                                │
│     {                                           │
│       task: "Move CTA above fold",             │
│       priority: "high",                        │
│       estimatedTime: "30 minutes"              │
│     }                                           │
│   ],                                            │
│   effort: "low",                                │
│   expectedImpact: "high",                      │
│   expectedLift: 35,  // percentage             │
│   confidence: 82     // 0-100                  │
│ }                                               │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ PRIORITY SCORING                                │
│                                                 │
│ Formula:                                        │
│ priorityScore = impactScore + trafficScore     │
│                                                 │
│ impactScore = (gap / 100) × 50                 │
│ trafficScore = (traffic / 5000) × 50           │
│                                                 │
│ Example:                                        │
│ • Gap: 70% below benchmark                     │
│ • Traffic: 5000 views/month                    │
│ • Impact: 35 points                            │
│ • Traffic: 50 points                           │
│ • Total: 85/100 (HIGH PRIORITY)                │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ PROJECTED IMPACT CALCULATION                    │
│                                                 │
│ Aggregate lift with diminishing returns:        │
│ Rec 1: 35% × 1.0 = 35%                         │
│ Rec 2: 28% × 0.9 = 25.2%                       │
│ Rec 3: 22% × 0.8 = 17.6%                       │
│ Total: 77.8% (capped at 80%)                   │
│                                                 │
│ Calculate new conversion rate:                  │
│ 1.8% × 1.778 = 3.2%                           │
│                                                 │
│ Calculate additional conversions:               │
│ (1850 visitors × 3.2%) - 43 = 16 new/month    │
│                                                 │
│ Estimate revenue:                               │
│ 16 conversions × $100 avg = $1,600/month       │
└─────────────────────────────────────────────────┘
    ↓
Complete CRO Analysis Result
    ↓
Return to CroController
    ↓
Send JSON to frontend
    ↓
Frontend displays:
    • Priority badge (CRITICAL/HIGH/MEDIUM/LOW)
    • Current metrics cards
    • Projected impact (green card)
    • Expandable recommendations
    • Action items with checkboxes
    • Real-world examples
```

**Key Components:**

1. **CroEngineService** (620 lines)
   - 5 rule-based detection algorithms
   - Priority scoring (0-100)
   - Recommendation generation
   - Impact calculation with diminishing returns

2. **Detection Thresholds:**
   - High traffic: >1000 views/month
   - Low conversion: <2.5%
   - Poor engagement: <30s on page
   - High bounce: >55%
   - High exit: >60%
   - Funnel drop-off: >40%

3. **Confidence Scoring:**
   - Based on data availability
   - Correlation strength
   - Historical accuracy

---

## 🔐 Security Architecture

### Authentication & Authorization

```
┌─────────────────────────────────────────────────┐
│ Authentication Flow                             │
│                                                 │
│ 1. User Login                                   │
│    ├─→ Email + Password                         │
│    ├─→ bcrypt.compare()                         │
│    └─→ JWT signed (access + refresh)            │
│                                                 │
│ 2. JWT Structure                                │
│    {                                            │
│      "sub": "user-id",                          │
│      "email": "user@example.com",               │
│      "roles": ["user"],                         │
│      "iat": 1234567890,                         │
│      "exp": 1234567890 + 7days                  │
│    }                                            │
│                                                 │
│ 3. Request Authorization                        │
│    ├─→ Bearer token in Authorization header     │
│    ├─→ JwtAuthGuard validates signature         │
│    ├─→ Expiration checked                       │
│    └─→ User object attached to request          │
│                                                 │
│ 4. Refresh Token Flow                           │
│    ├─→ Access token expires                     │
│    ├─→ Frontend sends refresh token             │
│    ├─→ New access token issued                  │
│    └─→ Continue session seamlessly              │
└─────────────────────────────────────────────────┘
```

### Data Security

- **Encryption at Rest:** PostgreSQL with pgcrypto
- **Encryption in Transit:** TLS 1.3
- **Password Hashing:** bcrypt (cost factor: 10)
- **SQL Injection:** TypeORM parameterized queries
- **XSS Protection:** Content Security Policy headers
- **CSRF Protection:** SameSite cookies

---

## 📊 Performance Optimizations

### Caching Strategy

```typescript
// Multi-layer caching
1. Browser Cache (Static assets)
   └─→ Next.js automatic optimization

2. CDN Cache (Edge caching)
   └─→ CloudFront or similar

3. Application Cache (Redis)
   └─→ API responses (1-60 minutes TTL)

4. Database Query Cache
   └─→ PostgreSQL query cache
```

### Database Optimizations

- **Indexes:** Strategic indexes on high-query columns
- **Connection Pooling:** Max 20 connections
- **Query Optimization:** N+1 query prevention
- **Pagination:** Cursor-based for large datasets

### API Optimizations

- **Rate Limiting:** 100 requests/minute per user
- **Compression:** gzip/brotli for responses
- **Batch Endpoints:** Multiple operations in one request
- **Background Jobs:** Long-running tasks in queues

---

## 🔧 Configuration Management

### Environment-Based Configuration

```typescript
// Config hierarchy
1. Default values (code)
2. .env file (local development)
3. Environment variables (production)
4. Cloud config service (future)

// Example
@Injectable()
export class AppConfigService {
  get databaseConfig() {
    return {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
    };
  }
}
```

---

## 📈 Scalability Considerations

### Horizontal Scaling

- **Stateless Backend:** No server-side sessions (JWT)
- **Load Balancer:** Distribute traffic across instances
- **Database Replication:** Read replicas for queries
- **Redis Cluster:** Distributed caching

### Vertical Scaling

- **Database:** Increase CPU/RAM as needed
- **Redis:** Memory optimization
- **Node.js:** Multi-core utilization (cluster mode)

### Microservices Migration Path

```
Current: Modular Monolith
    ↓
Step 1: Extract AI Service (if needed)
    ↓
Step 2: Extract CRO Engine (if needed)
    ↓
Step 3: Extract Analytics Service (if needed)
    ↓
Future: Full Microservices (if justified by scale)
```

---

## 🎯 Architecture Principles

1. **Separation of Concerns** - Clear boundaries between layers
2. **Domain-Driven Design** - Business logic organized by domain
3. **SOLID Principles** - Clean, maintainable code
4. **Interface-Based Design** - Easy to swap implementations
5. **Fail Fast** - Validation at boundaries
6. **Explicit over Implicit** - Clear, readable code
7. **Testability** - Easy to unit test and mock

---

**This architecture is designed for growth, maintainability, and production readiness.**
