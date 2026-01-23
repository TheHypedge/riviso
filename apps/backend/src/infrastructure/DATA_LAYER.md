# Data Layer Architecture

## Complete Infrastructure Stack

```
apps/backend/src/infrastructure/
├── database/                    # PostgreSQL with TypeORM
│   ├── database.module.ts
│   ├── entities/
│   │   ├── user.entity.ts      ✅ (in modules/user/)
│   │   ├── project.entity.ts   ✅ (in modules/project/)
│   │   ├── workspace.entity.ts ✅ NEW
│   │   ├── page.entity.ts      ✅ NEW
│   │   ├── keyword.entity.ts   ✅ NEW
│   │   ├── keyword-ranking.entity.ts ✅ NEW
│   │   ├── competitor.entity.ts ✅ NEW
│   │   ├── seo-audit.entity.ts ✅ NEW
│   │   ├── cro-insight.entity.ts ✅ NEW
│   │   └── index.ts
│   └── repositories/
│       ├── base.repository.ts         ✅ NEW
│       ├── workspace.repository.ts    ✅ NEW
│       ├── keyword.repository.ts      ✅ NEW
│       ├── page.repository.ts         ✅ NEW
│       └── index.ts
│
├── redis/                       # Redis for caching & queues
│   ├── redis.module.ts          ✅
│   └── redis.service.ts         ✅
│
├── opensearch/                  # OpenSearch for analytics
│   ├── opensearch.module.ts     ✅ NEW
│   └── opensearch.service.ts    ✅ NEW
│
└── vector-db/                   # Vector DB abstraction
    ├── vector-db.module.ts      ✅ NEW
    ├── vector-db.service.ts     ✅ NEW
    └── vector-db.interface.ts   ✅ NEW
```

---

## 📊 Entity Definitions

### 1. UserEntity
```typescript
@Entity('users')
class UserEntity {
  id: UUID
  email: string (unique)
  name: string
  password: string (hashed)
  role: enum (admin, user, viewer)
  avatar?: string
  createdAt: Date
  updatedAt: Date
}
```

### 2. WorkspaceEntity ✅ NEW
```typescript
@Entity('workspaces')
class WorkspaceEntity {
  id: UUID
  name: string
  slug: string (unique)
  ownerId: UUID
  settings: JSONB {
    timezone, currency, notifications
  }
  members: JSONB [{
    userId, role, joinedAt
  }]
  createdAt: Date
  updatedAt: Date
}
```

### 3. ProjectEntity
```typescript
@Entity('projects')
class ProjectEntity {
  id: UUID
  workspaceId: UUID
  name: string
  domain: string
  status: enum (active, inactive, pending, archived)
  integrations: JSONB {
    googleAnalytics?, googleSearchConsole?
  }
  metadata: JSONB {
    industry?, targetCountry?, competitors?
  }
  createdAt: Date
  updatedAt: Date
}
```

### 4. PageEntity ✅ NEW
```typescript
@Entity('pages')
@Index(['projectId', 'url'])
class PageEntity {
  id: UUID
  projectId: UUID (indexed)
  url: text
  title?: string
  description?: text
  h1?: string
  wordCount: number
  
  seoMetrics: JSONB {
    score, titleLength, descriptionLength,
    hasH1, hasMetaDescription, images, links
  }
  
  performanceMetrics: JSONB {
    loadTime, FCP, LCP, TTI, CLS
  }
  
  analyticsMetrics: JSONB {
    pageViews, uniqueVisitors, avgTimeOnPage,
    bounceRate, exitRate, conversions, conversionRate
  }
  
  lastCrawledAt?: Date
  lastAnalyzedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### 5. KeywordEntity ✅ NEW
```typescript
@Entity('keywords')
@Index(['projectId', 'keyword'])
class KeywordEntity {
  id: UUID
  projectId: UUID (indexed)
  keyword: string (indexed)
  searchVolume: number
  difficulty: decimal(5,2)
  cpc: decimal(10,2)
  intent: enum (informational, navigational, commercial, transactional)
  tracked: boolean
  tags: string[]
  
  currentRanking: JSONB {
    rank, url, previousRank, change,
    searchEngine, device, location, checkedAt
  }
  
  serpFeatures: JSONB [{
    type, position, present
  }]
  
  lastCheckedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### 6. KeywordRankingEntity ✅ NEW
```typescript
@Entity('keyword_rankings')
@Index(['keywordId', 'checkedAt'])
class KeywordRankingEntity {
  id: UUID
  keywordId: UUID (indexed)
  projectId: UUID
  rank: number
  previousRank?: number
  url: text
  searchEngine: enum (google, bing, yahoo)
  device: enum (desktop, mobile, tablet)
  location: string
  serpFeatures?: JSONB
  checkedAt: Date (indexed)
  createdAt: Date
}
```

### 7. CompetitorEntity ✅ NEW
```typescript
@Entity('competitors')
@Index(['projectId', 'domain'])
class CompetitorEntity {
  id: UUID
  projectId: UUID (indexed)
  domain: string
  name: string
  tracked: boolean
  
  metrics: JSONB {
    estimatedTraffic, totalKeywords, commonKeywords,
    averageRank, backlinks, domainAuthority, lastUpdated
  }
  
  rankDistribution: JSONB {
    top3, top10, top20, top50, top100
  }
  
  topKeywords: JSONB [{
    keyword, rank, searchVolume, url
  }]
  
  lastAnalyzedAt?: Date
  createdAt: Date
  updatedAt: Date
}
```

### 8. SeoAuditEntity ✅ NEW
```typescript
@Entity('seo_audits')
@Index(['projectId', 'createdAt'])
class SeoAuditEntity {
  id: UUID
  projectId: UUID (indexed)
  url: text
  score: decimal(5,2)
  
  issues: JSONB [{
    type, severity, title, description,
    affectedPages, impact
  }]
  
  metrics: JSONB {
    pageSpeed, mobileUsability, coreWebVitals,
    indexability, backlinks
  }
  
  recommendations: JSONB [{
    id, category, priority, title, description,
    effort, impact, actionItems
  }]
  
  createdAt: Date
}
```

### 9. CroInsightEntity ✅ NEW
```typescript
@Entity('cro_insights')
@Index(['projectId', 'status'])
class CroInsightEntity {
  id: UUID
  projectId: UUID (indexed)
  pageUrl: text
  type: enum (high_traffic_low_conversion, high_bounce_rate, etc.)
  priority: enum (critical, high, medium, low)
  title: string
  description: text
  
  currentMetrics: JSONB {
    url, pageViews, uniqueVisitors, avgTimeOnPage,
    bounceRate, exitRate, conversions, conversionRate, revenue?
  }
  
  projectedImpact: JSONB {
    conversionRateIncrease, additionalConversions,
    potentialRevenue?, confidence
  }
  
  recommendations: JSONB[]
  
  status: enum (new, in_progress, implemented, testing, dismissed)
  createdAt: Date
  updatedAt: Date
}
```

---

## 🗄️ Repository Pattern

### Base Repository Interface
```typescript
interface IBaseRepository<T> {
  findAll(options?): Promise<T[]>
  findById(id: string): Promise<T | null>
  findOne(where): Promise<T | null>
  create(data: Partial<T>): Promise<T>
  update(id: string, data: Partial<T>): Promise<T>
  delete(id: string): Promise<boolean>
  count(where?): Promise<number>
}
```

### Workspace Repository
```typescript
interface IWorkspaceRepository extends IBaseRepository<WorkspaceEntity> {
  findByOwnerId(ownerId: string): Promise<WorkspaceEntity[]>
  findBySlug(slug: string): Promise<WorkspaceEntity | null>
  addMember(workspaceId, userId, role): Promise<WorkspaceEntity>
  removeMember(workspaceId, userId): Promise<WorkspaceEntity>
}
```

### Keyword Repository
```typescript
interface IKeywordRepository extends IBaseRepository<KeywordEntity> {
  findByProjectId(projectId: string): Promise<KeywordEntity[]>
  findTrackedByProjectId(projectId: string): Promise<KeywordEntity[]>
  findByKeyword(projectId, keyword): Promise<KeywordEntity | null>
  updateRanking(keywordId, ranking): Promise<KeywordEntity>
  getTopRankingKeywords(projectId, limit): Promise<KeywordEntity[]>
}
```

### Page Repository
```typescript
interface IPageRepository extends IBaseRepository<PageEntity> {
  findByProjectId(projectId: string): Promise<PageEntity[]>
  findByUrl(projectId, url): Promise<PageEntity | null>
  updateAnalytics(pageId, metrics): Promise<PageEntity>
  getHighTrafficPages(projectId, limit): Promise<PageEntity[]>
  getLowConversionPages(projectId, threshold): Promise<PageEntity[]>
}
```

---

## 🔴 Redis Service

### Features
- **Caching**: API response caching
- **Session Management**: User sessions, AI chat state
- **Job Queues**: Background task processing
- **Rate Limiting**: API rate limit tracking

### Methods
```typescript
class RedisService {
  get(key: string): Promise<string | null>
  set(key: string, value: string, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  exists(key: string): Promise<boolean>
  setJson<T>(key: string, value: T, ttl?: number): Promise<void>
  getJson<T>(key: string): Promise<T | null>
}
```

### Usage Examples
```typescript
// Cache API response
await redisService.setJson('project:123:stats', stats, 3600);

// Store session
await redisService.setJson('session:abc', sessionData, 86400);

// Rate limiting
const key = `ratelimit:${userId}:${Date.now()}`;
await redisService.set(key, '1', 60);
```

---

## 🔍 OpenSearch Service

### Features
- **Full-Text Search**: Search across pages, keywords, competitors
- **Analytics**: Time-series data aggregation
- **Log Storage**: Application logs and audit trails

### Methods
```typescript
class OpenSearchService {
  index(index, id, document): Promise<any>
  search(index, query): Promise<any>
  get(index, id): Promise<any>
  delete(index, id): Promise<boolean>
  createIndex(index, mappings): Promise<void>
  bulkIndex(index, documents): Promise<any>
  aggregate(index, aggregations): Promise<any>
}
```

### Index Schemas

**Pages Index**:
```json
{
  "mappings": {
    "properties": {
      "projectId": { "type": "keyword" },
      "url": { "type": "text" },
      "title": { "type": "text" },
      "content": { "type": "text" },
      "seoScore": { "type": "integer" },
      "pageViews": { "type": "integer" },
      "timestamp": { "type": "date" }
    }
  }
}
```

**Keywords Index**:
```json
{
  "mappings": {
    "properties": {
      "projectId": { "type": "keyword" },
      "keyword": { "type": "text" },
      "rank": { "type": "integer" },
      "searchVolume": { "type": "integer" },
      "timestamp": { "type": "date" }
    }
  }
}
```

---

## 🧠 Vector Database Interface

### Purpose
- **Semantic Search**: Find similar content by meaning
- **AI Context**: Retrieve relevant data for AI prompts
- **Knowledge Base**: Store and query embeddings

### Interface
```typescript
interface IVectorDatabase {
  connect(): Promise<void>
  disconnect(): Promise<void>
  upsert(documents: VectorDocument[]): Promise<void>
  search(query: VectorSearchQuery): Promise<VectorSearchResult[]>
  get(id: string): Promise<VectorDocument | null>
  delete(ids: string[]): Promise<void>
  deleteByFilter(filter): Promise<void>
  getStats(): Promise<{ totalDocuments, dimensions }>
}
```

### VectorDocument Structure
```typescript
interface VectorDocument {
  id: string
  content: string
  embedding?: number[]  // 1536 dimensions for OpenAI
  metadata: {
    source: string
    projectId?: string
    type?: string
    createdAt?: string
  }
}
```

### Usage Examples
```typescript
// Store SEO knowledge
await vectorDb.storeWithEmbedding(
  "How to optimize meta descriptions...",
  { source: 'seo_guide', type: 'documentation' }
);

// Semantic search
const results = await vectorDb.semanticSearch(
  "best practices for page speed",
  5
);
```

---

## 🔧 Database Configuration

### Environment Variables
```env
# PostgreSQL
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=riviso
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_SSL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# OpenSearch
OPENSEARCH_HOST=localhost
OPENSEARCH_PORT=9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=admin

# Vector DB
VECTOR_DB_PROVIDER=pinecone
PINECONE_API_KEY=
PINECONE_INDEX_NAME=riviso-embeddings
```

---

## 📋 Database Indexes

### Primary Indexes
- All `id` fields (UUID primary keys)
- `projectId` fields (foreign keys)
- `userId` fields (foreign keys)

### Composite Indexes
- `(projectId, keyword)` on keywords
- `(projectId, url)` on pages
- `(projectId, domain)` on competitors
- `(keywordId, checkedAt)` on keyword_rankings

### JSONB Indexes (GIN)
```sql
CREATE INDEX idx_page_seo_metrics ON pages USING GIN (seo_metrics);
CREATE INDEX idx_keyword_current_ranking ON keywords USING GIN (current_ranking);
```

---

## 🚀 Usage in Services

### Example: Keyword Service
```typescript
@Injectable()
class KeywordService {
  constructor(
    private keywordRepository: KeywordRepository,
    private redisService: RedisService,
    private openSearchService: OpenSearchService,
  ) {}

  async getKeywords(projectId: string) {
    // Try cache first
    const cached = await this.redisService.getJson(`keywords:${projectId}`);
    if (cached) return cached;

    // Query database
    const keywords = await this.keywordRepository.findByProjectId(projectId);

    // Cache result
    await this.redisService.setJson(`keywords:${projectId}`, keywords, 300);

    // Index in OpenSearch for analytics
    await this.openSearchService.bulkIndex('keywords', keywords);

    return keywords;
  }
}
```

---

## 📊 Data Flow Example

**Keyword Ranking Update Flow**:
```
1. SERP API → Fetch ranking data
2. KeywordRepository → Update keyword entity
3. KeywordRankingEntity → Store historical snapshot
4. Redis → Cache updated ranking
5. OpenSearch → Index for analytics
6. Vector DB → Update embeddings (if content changed)
```

---

## ✅ What's Ready

✅ 9 TypeORM entities defined
✅ Base repository pattern
✅ 3 specialized repositories (Workspace, Keyword, Page)
✅ Redis service with JSON support
✅ OpenSearch service with full API
✅ Vector DB abstraction interface
✅ All entities registered in DatabaseModule
✅ Env-based configuration
✅ Index strategy defined

## 🔜 Next Steps for Production

1. Implement remaining repositories
2. Add database migrations
3. Set up connection pooling
4. Implement query optimization
5. Add database seeding scripts
6. Set up backup strategies
7. Configure replication (if needed)

---

**The data layer is now fully scaffolded and ready for integration with business logic!**
