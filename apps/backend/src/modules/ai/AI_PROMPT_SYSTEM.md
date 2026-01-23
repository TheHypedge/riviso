# AI Prompt System Documentation

## 🎯 Overview

The AI Prompt System is an intelligent interface that allows users to query their growth data using natural language. It features:

- **Prompt-to-Data Mapping**: Automatically determines what data to query based on user intent
- **Confidence Scoring**: Provides transparency about the reliability of AI responses
- **Data Source Tracking**: Shows users exactly what data was used to generate insights
- **Mock Data Support**: Fully functional with realistic mock data for testing

---

## 🏗️ Architecture

### System Flow

```
User Query
    ↓
[1] Intent Analysis (PromptMapperService)
    ↓
[2] Data Fetching (DataFetcherService)
    ↓
[3] Response Generation (ResponseGeneratorService)
    ↓
AI Response with Confidence & Data Sources
```

### Components

1. **PromptMapperService** (`services/prompt-mapper.service.ts`)
   - Analyzes user prompts to determine intent
   - Maps intents to required data sources
   - Returns confidence scores for intent classification

2. **DataFetcherService** (`services/data-fetcher.service.ts`)
   - Fetches data from multiple sources (Analytics, SEO, Keywords, Competitors)
   - Simulates database queries with mock data
   - Tracks query time and record counts

3. **ResponseGeneratorService** (`services/response-generator.service.ts`)
   - Generates intelligent responses based on fetched data
   - Calculates confidence scores
   - Provides reasoning and recommendations

4. **AiService** (`ai.service.ts`)
   - Orchestrates the entire flow
   - Handles API requests/responses
   - Falls back gracefully on errors

---

## 📊 Supported Prompts

### 1. Traffic Drop Analysis

**Example Prompts:**
- "Why did my traffic drop?"
- "What caused the traffic decrease?"
- "Why am I losing visitors?"

**Intent Type:** `traffic_analysis`

**Data Sources Used:**
- Google Analytics - Traffic Trend
- SEO Audit - Recent Changes
- Keyword Rankings - Changes

**Confidence:** 92%

**Response Includes:**
- Drop percentage and date
- Contributing factors (keyword losses, technical issues, algorithm updates)
- Recommended actions
- Projected impact

**Mock Data:**
```typescript
{
  timeline: [
    { date: '2024-01-01', sessions: 5420, users: 4200 },
    { date: '2024-01-15', sessions: 4120, users: 3200 }, // 27.5% drop
  ],
  keywords: [
    { keyword: 'seo tools', previousRank: 3, currentRank: 7, change: -4 },
  ],
  audits: [
    { date: '2024-01-15', changes: ['Core Web Vitals degraded'] },
  ],
}
```

---

### 2. Low CTR Analysis

**Example Prompts:**
- "Which pages have low CTR?"
- "Show me pages with low click-through rates"
- "Which pages aren't getting clicks?"

**Intent Type:** `ctr_analysis`

**Data Sources Used:**
- Search Console - CTR by Page
- Page Metadata - Titles & Descriptions
- Keyword Rankings - Low CTR Keywords

**Confidence:** 89%

**Response Includes:**
- Pages below average CTR
- Specific CTR metrics and impressions
- Root causes (missing meta descriptions, short titles)
- Optimization recommendations with examples
- Projected impact (additional clicks/month)

**Mock Data:**
```typescript
{
  pages: [
    {
      url: '/pricing',
      impressions: 8500,
      clicks: 120,
      ctr: 1.41,
      avgPosition: 5.2,
    },
  ],
  metadataIssues: [
    'Missing meta descriptions on 2 pages',
    'Title tags too short on 1 page',
  ],
}
```

---

### 3. Competitor Ranking Analysis

**Example Prompts:**
- "Which competitors outrank us?"
- "How do I compare to my competitors?"
- "Which competitors rank better than me?"

**Intent Type:** `competitor_ranking`

**Data Sources Used:**
- Competitor Rankings - Comparison
- Competitor Analysis - Domain Authority
- Content Gap Analysis

**Confidence:** 95%

**Response Includes:**
- Competitive landscape overview
- Domain authority comparison
- Specific keyword ranking gaps
- High-opportunity content gaps
- Strategic recommendations (quick wins, authority building, content strategy)
- Realistic timeline expectations

**Mock Data:**
```typescript
{
  comparisons: [
    {
      keyword: 'seo tools',
      competitorDomain: 'ahrefs.com',
      competitorRank: 1,
      ourRank: 7,
      gap: 6,
    },
  ],
  competitors: [
    {
      domain: 'ahrefs.com',
      authorityScore: 92,
      totalKeywords: 42000,
      commonKeywords: 420,
    },
  ],
  ourDomain: {
    authorityScore: 58,
    totalKeywords: 150,
  },
}
```

---

## 🔍 Intent Classification

### How Intent is Determined

The `PromptMapperService` uses keyword matching to classify user intent:

```typescript
// Traffic drop keywords
trafficKeywords = ['traffic', 'visitors', 'visits', 'views']
dropKeywords = ['drop', 'decrease', 'decline', 'fall', 'down', 'lost']

// CTR keywords
ctrKeywords = ['ctr', 'click', 'click-through', 'click rate']
lowKeywords = ['low', 'poor', 'bad', 'under', 'below']

// Competitor keywords
competitorKeywords = ['competitor', 'competition', 'rival', 'other sites']
rankKeywords = ['outrank', 'rank', 'ranking', 'position', 'beat', 'better']
```

### Intent Confidence Scores

| Intent Type | Base Confidence | Reasoning |
|-------------|----------------|-----------|
| `traffic_analysis` | 0.92 | Clear keyword matches + data correlation |
| `ctr_analysis` | 0.89 | Strong keyword matches + metadata issues |
| `competitor_ranking` | 0.95 | Comprehensive competitor data available |
| `general` | 0.60 | No specific intent detected |

---

## 📈 Confidence Scoring System

### How Confidence is Calculated

Confidence scores reflect the **reliability of the AI's analysis** based on:

1. **Intent Classification Confidence** (Base: 0.6 - 0.95)
   - How certain we are about what the user is asking

2. **Data Availability** (+0.1 per data source)
   - More data sources = higher confidence
   - Complete data = higher confidence

3. **Data Quality** (-0.05 to +0.1)
   - Missing data = lower confidence
   - Correlated data = higher confidence

**Example Calculation:**

```typescript
let confidence = 0.7; // Base for traffic analysis

// Add confidence based on data availability
if (timeline.length > 0) confidence += 0.1;    // Traffic data exists
if (keywords.length > 0) confidence += 0.1;     // Keyword data exists
if (audits.length > 0) confidence += 0.1;       // SEO audit data exists

// Cap at 99% (never claim 100% certainty)
confidence = Math.min(confidence, 0.99);

// Result: 0.92 (92% confident)
```

### Confidence Thresholds

| Score | Label | Meaning | Visual Indicator |
|-------|-------|---------|------------------|
| 90%+ | Very High | Strong data correlation, clear patterns | 🟢 Green |
| 75-89% | High | Good data support, reliable insights | 🟡 Yellow |
| 60-74% | Medium | Limited data, reasonable assumptions | 🟠 Orange |
| < 60% | Low | Insufficient data, general guidance | 🔴 Red |

---

## 🗄️ Data Source Tracking

Every AI response includes detailed information about what data was used:

```typescript
interface DataSourceUsage {
  source: string;        // e.g., "Google Analytics - Traffic Trend"
  type: string;          // e.g., "analytics", "seo", "keywords", "competitors"
  recordsUsed: number;   // Number of records queried
  confidence: number;    // Relevance of this data source (0-1)
  summary: string;       // Human-readable summary
}
```

### Example Data Usage Display (Frontend)

```tsx
<details>
  <summary>Data sources used (3)</summary>
  <div>
    ✓ Google Analytics - Traffic Trend — Analyzed 4 days of traffic data
    ✓ SEO Audit - Recent Changes — Reviewed 2 SEO audit results
    ✓ Keyword Rankings - Changes — Examined 2 keyword rankings
  </div>
</details>
```

---

## 🎨 Frontend Integration

### Message Interface

```typescript
interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;           // AI confidence score (0-1)
  reasoning?: string;            // How AI reached conclusion
  dataUsed?: DataSourceUsage[];  // Data sources consulted
  suggestions?: string[];        // Follow-up questions
  metadata?: {
    processingTime?: number;     // Query time in ms
  };
}
```

### UI Components

1. **Confidence Bar**
   - Visual progress bar showing confidence percentage
   - Color-coded (green = high, yellow = medium, orange = low)

2. **Reasoning Accordion**
   - Collapsible section explaining AI's thought process
   - Builds trust and transparency

3. **Data Sources List**
   - Expandable list of all data sources used
   - Shows record counts and summaries

4. **Follow-up Suggestions**
   - Clickable suggestion chips
   - Pre-fill input with suggested questions

---

## 🔧 Backend API

### Endpoint: POST `/api/ai/chat`

**Request:**
```json
{
  "message": "Why did my traffic drop?",
  "sessionId": "session-123",
  "workspaceId": "workspace-456",
  "projectId": "project-789"
}
```

**Response:**
```json
{
  "message": "Based on my analysis of your analytics data...",
  "sessionId": "session-123",
  "confidence": 0.92,
  "reasoning": "I analyzed 4 days of traffic data, 2 keyword rankings...",
  "dataUsed": [
    {
      "source": "Google Analytics - Traffic Trend",
      "type": "analytics",
      "summary": "Analyzed 4 days of traffic data"
    },
    {
      "source": "Keyword Rankings - Changes",
      "type": "keywords",
      "summary": "Examined 2 keyword rankings"
    }
  ],
  "suggestions": [
    "Show me which pages lost the most traffic",
    "What did my competitors do differently?"
  ],
  "metadata": {
    "intentType": "traffic_analysis",
    "intentConfidence": 0.92,
    "dataSourcesQueried": ["analytics", "seo", "keywords"],
    "totalRecords": 6,
    "processingTime": 1523
  }
}
```

---

## 🧪 Testing Prompts

Use these test prompts to see the system in action:

### Traffic Analysis
```
User: "Why did my traffic drop?"
Expected: Traffic drop analysis with 92% confidence
```

### CTR Analysis
```
User: "Which pages have low CTR?"
Expected: CTR analysis with 89% confidence
```

### Competitor Analysis
```
User: "Which competitors outrank us?"
Expected: Competitor ranking analysis with 95% confidence
```

### General Query
```
User: "What can you do?"
Expected: General guidance with 60% confidence
```

---

## 📊 Mock Data Sources

### Analytics Data
- **Timeline**: 4 data points (30 days)
- **Traffic Drop**: 27.5% on Jan 15, 2024
- **Sessions**: 4,000 - 5,600 range

### SEO Data
- **Pages**: 3 pages with CTR data
- **Average CTR**: 1.48%
- **Metadata Issues**: 2 missing descriptions

### Keyword Data
- **Tracked Keywords**: 150
- **Dropped Keywords**: 2
- **Average Rank Loss**: 3.5 positions

### Competitor Data
- **Competitors**: 3 (ahrefs, semrush, moz)
- **Authority Gap**: 34 points (92 vs 58)
- **Common Keywords**: 420

---

## 🚀 Future Enhancements

### Phase 2 (Real Data Integration)
- [ ] Connect to actual Google Analytics API
- [ ] Integrate with Search Console
- [ ] Query real database for keywords/competitors
- [ ] Store chat history in PostgreSQL

### Phase 3 (Advanced AI Features)
- [ ] Integrate real LLM (OpenAI GPT-4 / Anthropic Claude)
- [ ] Implement semantic search for better intent detection
- [ ] Add streaming responses for better UX
- [ ] Support multi-turn conversations with context

### Phase 4 (Visualization)
- [ ] Generate charts automatically
- [ ] Create data tables in responses
- [ ] Export insights as PDF reports

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Replace mock data with real database queries
- [ ] Add rate limiting to AI endpoints
- [ ] Implement proper error handling for LLM failures
- [ ] Add logging for all AI queries
- [ ] Set up monitoring for response times
- [ ] Configure API key management (OpenAI/Anthropic)
- [ ] Add user authentication checks
- [ ] Implement cost tracking for LLM usage
- [ ] Add abuse prevention (prompt injection detection)
- [ ] Test with diverse user queries

---

## 📚 Code Examples

### Adding a New Prompt Type

1. **Add Intent Detection** (`prompt-mapper.service.ts`):
```typescript
private isBounceRateQuery(prompt: string): boolean {
  const bounceKeywords = ['bounce', 'bounce rate', 'exit'];
  return bounceKeywords.some(k => prompt.includes(k));
}
```

2. **Map to Data Sources**:
```typescript
private mapBounceRateIntent(userPrompt: string): PromptAnalysis {
  return {
    intent: {
      type: 'bounce_rate_analysis',
      confidence: 0.88,
      keywords: ['bounce', 'rate', 'exit'],
      dataSources: ['analytics', 'seo'],
    },
    requiredDataSources: [
      {
        name: 'Google Analytics - Bounce Rate by Page',
        type: 'analytics',
        query: 'SELECT page_url, bounce_rate FROM pages ORDER BY bounce_rate DESC',
        relevance: 1.0,
      },
    ],
    suggestedQueries: ['What causes high bounce rate?'],
  };
}
```

3. **Generate Response** (`response-generator.service.ts`):
```typescript
generateBounceRateResponse(
  analysis: PromptAnalysis,
  dataResult: DataFetchResult
): AiResponse {
  // ... implementation
}
```

---

**The AI Prompt System is ready for testing!** 🚀

Test it at: http://localhost:3000/dashboard/ai
