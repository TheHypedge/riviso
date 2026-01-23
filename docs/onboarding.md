# Developer Onboarding Guide

> **Welcome to the Riviso platform! This guide will help you understand the codebase and start contributing quickly.**

---

## 🎯 Getting Started

### Day 1: Setup & Exploration

#### 1. Clone and Install

```bash
# Clone repository
git clone <repository-url>
cd riviso

# Install dependencies
npm install

# Set up environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env

# Edit .env files with your values
code apps/backend/.env
code apps/frontend/.env
```

#### 2. Start Infrastructure

```bash
# Start PostgreSQL, Redis, OpenSearch
docker-compose -f docker/docker-compose.yml up -d

# Verify services are running
docker ps
```

#### 3. Run Database Migrations

```bash
cd apps/backend
npm run migration:run
```

#### 4. Start Development Servers

```bash
# Terminal 1: Backend
cd apps/backend
npm run start:dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev
```

#### 5. Verify Everything Works

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Swagger Docs: http://localhost:4000/api/docs

---

### Day 2: Codebase Understanding

#### Read Core Documentation

1. [README.md](../README.md) - Product overview and quick start
2. [architecture.md](architecture.md) - System architecture
3. [system-flow.md](system-flow.md) - Data flows and user journeys
4. This file!

#### Explore the Monorepo Structure

```
riviso/
├── apps/
│   ├── backend/          # NestJS API (your main focus for backend)
│   └── frontend/         # Next.js app (your main focus for frontend)
├── packages/
│   ├── shared-types/     # TypeScript interfaces (used by both apps)
│   ├── ai-core/          # AI abstractions
│   └── ui-components/    # React components
└── docs/                 # You are here!
```

**Key Principle:** Monorepo = multiple apps sharing code

---

## 📂 Folder Responsibilities

### Backend Structure (`apps/backend/src/`)

```
src/
├── main.ts                    # Entry point - App bootstrap
├── app.module.ts              # Root module - Imports all modules
│
├── modules/                   # ⭐ FEATURE MODULES (most of your work)
│   ├── auth/                  # Authentication & authorization
│   │   ├── auth.controller.ts # REST endpoints
│   │   ├── auth.service.ts    # Business logic
│   │   ├── dto/               # Data Transfer Objects
│   │   ├── strategies/        # Passport strategies (JWT)
│   │   └── guards/            # Auth guards
│   │
│   ├── ai/                    # ⭐ AI Prompt System
│   │   ├── ai.controller.ts   # POST /ai/chat
│   │   ├── ai.service.ts      # Orchestrates AI flow
│   │   ├── dto/
│   │   │   └── ai-prompt.dto.ts
│   │   └── services/
│   │       ├── prompt-mapper.service.ts      # Intent analysis
│   │       ├── data-fetcher.service.ts       # Data retrieval
│   │       └── response-generator.service.ts # Response generation
│   │
│   ├── cro/                   # ⭐ CRO Intelligence Engine
│   │   ├── cro.controller.ts  # GET /cro/insights
│   │   ├── cro.service.ts     # Orchestration
│   │   └── services/
│   │       └── cro-engine.service.ts # 5 detection algorithms
│   │
│   ├── [other modules follow same pattern]
│   └── ...
│
├── infrastructure/            # DATA LAYER
│   ├── database/
│   │   ├── database.module.ts  # TypeORM config
│   │   ├── entities/           # Database entities
│   │   │   ├── user.entity.ts
│   │   │   ├── project.entity.ts
│   │   │   └── ...
│   │   └── repositories/       # Repository pattern
│   │       ├── base.repository.ts
│   │       └── ...
│   │
│   ├── redis/                 # Cache & Queue
│   │   ├── redis.module.ts
│   │   └── redis.service.ts
│   │
│   ├── opensearch/            # Search & Analytics
│   │   ├── opensearch.module.ts
│   │   └── opensearch.service.ts
│   │
│   └── vector-db/             # Vector database (interface)
│       ├── vector-db.interface.ts
│       ├── vector-db.module.ts
│       └── vector-db.service.ts
│
└── common/                    # SHARED UTILITIES
    ├── decorators/            # Custom decorators
    ├── filters/               # Exception filters
    │   └── http-exception.filter.ts
    ├── interceptors/          # Logging, transformation
    │   └── logging.interceptor.ts
    ├── guards/                # Auth guards
    └── pipes/                 # Validation pipes
```

**Navigation Tips:**
- **Adding a new endpoint?** → Look in `modules/`
- **Need database access?** → Check `infrastructure/database/`
- **Want to cache something?** → Use `infrastructure/redis/`
- **Need shared utilities?** → Add to `common/`

---

### Frontend Structure (`apps/frontend/src/`)

```
src/
├── app/                       # ⭐ NEXT.JS APP ROUTER
│   ├── layout.tsx             # Root layout (wraps everything)
│   ├── page.tsx               # Landing page (/)
│   ├── globals.css            # Global styles
│   │
│   ├── auth/                  # Authentication pages
│   │   ├── login/
│   │   │   └── page.tsx       # /auth/login
│   │   └── register/
│   │       └── page.tsx       # /auth/register
│   │
│   └── dashboard/             # Main dashboard area
│       ├── layout.tsx         # Dashboard layout (sidebar + header)
│       ├── page.tsx           # /dashboard (overview)
│       ├── seo/
│       │   └── page.tsx       # /dashboard/seo
│       ├── keywords/
│       │   └── page.tsx       # /dashboard/keywords
│       ├── competitors/
│       │   └── page.tsx       # /dashboard/competitors
│       ├── cro/
│       │   └── page.tsx       # ⭐ /dashboard/cro (CRO insights)
│       ├── ai/
│       │   └── page.tsx       # ⭐ /dashboard/ai (AI chat)
│       └── settings/
│           └── page.tsx       # /dashboard/settings
│
├── components/                # REACT COMPONENTS
│   ├── DashboardLayout.tsx    # Sidebar + header wrapper
│   ├── Navigation.tsx         # Nav menu (future)
│   └── [other components]
│
└── lib/                       # UTILITIES
    ├── api.ts                 # API client (axios)
    └── auth.ts                # Auth utilities
```

**Navigation Tips:**
- **Adding a new page?** → Create folder in `app/` with `page.tsx`
- **Need a reusable component?** → Add to `components/`
- **Making API calls?** → Use `lib/api.ts`
- **File-based routing:** `app/dashboard/seo/page.tsx` → `/dashboard/seo`

---

### Shared Packages (`packages/`)

```
packages/
├── shared-types/              # ⭐ TypeScript interfaces
│   └── src/
│       ├── index.ts           # Exports all types
│       ├── auth.ts            # Auth types
│       ├── user.ts            # User types
│       ├── project.ts         # Project types
│       ├── ai.ts              # AI types (Message, AiResponse, etc.)
│       ├── cro.ts             # CRO types (Insight, Recommendation)
│       └── ...
│
├── ai-core/                   # AI abstractions (for production use)
│   └── src/
│       ├── llm-provider.ts    # LLM interface
│       ├── prompt-orchestrator.ts
│       └── vector-store.ts
│
└── ui-components/             # Shared React components
    └── src/
        ├── Button.tsx
        ├── Card.tsx
        ├── Badge.tsx
        └── Spinner.tsx
```

**When to use shared packages:**
- **shared-types:** Always import types from here (both frontend & backend)
- **ai-core:** When integrating real LLM providers (OpenAI, Anthropic)
- **ui-components:** When building consistent UI across the app

---

## 🛠️ How to Add Features

### Adding a New Backend Module

**Example: Adding a "Reports" module**

#### Step 1: Create Module Structure

```bash
cd apps/backend/src/modules
mkdir -p reports/dto reports/services
touch reports/reports.module.ts
touch reports/reports.controller.ts
touch reports/reports.service.ts
touch reports/dto/create-report.dto.ts
```

#### Step 2: Create DTO

```typescript
// dto/create-report.dto.ts
import { IsString, IsEnum } from 'class-validator';

export enum ReportType {
  SEO = 'seo',
  KEYWORD = 'keyword',
  COMPETITOR = 'competitor',
}

export class CreateReportDto {
  @IsString()
  projectId: string;

  @IsEnum(ReportType)
  type: ReportType;
}
```

#### Step 3: Create Service

```typescript
// reports.service.ts
import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  async createReport(dto: CreateReportDto) {
    // Business logic here
    return {
      id: 'report-123',
      projectId: dto.projectId,
      type: dto.type,
      generatedAt: new Date(),
      status: 'processing',
    };
  }

  async getReport(reportId: string) {
    // Fetch from database
    return {
      id: reportId,
      status: 'completed',
      data: { /* report data */ },
    };
  }
}
```

#### Step 4: Create Controller

```typescript
// reports.controller.ts
import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller({ path: 'reports', version: '1' })
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(@Body() dto: CreateReportDto) {
    return this.reportsService.createReport(dto);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.reportsService.getReport(id);
  }
}
```

#### Step 5: Create Module

```typescript
// reports.module.ts
import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService], // Export if other modules need it
})
export class ReportsModule {}
```

#### Step 6: Import in App Module

```typescript
// src/app.module.ts
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    // ... other modules
    ReportsModule, // Add here
  ],
})
export class AppModule {}
```

#### Step 7: Test

```bash
# Start backend
npm run start:dev

# Test with curl
curl -X POST http://localhost:4000/api/v1/reports \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"proj-123","type":"seo"}'

# Or use Swagger UI
open http://localhost:4000/api/docs
```

---

### Adding a New Frontend Page

**Example: Adding a "Reports" dashboard page**

#### Step 1: Create Page File

```bash
cd apps/frontend/src/app/dashboard
mkdir -p reports
touch reports/page.tsx
```

#### Step 2: Create Page Component

```typescript
// reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface Report {
  id: string;
  type: string;
  status: string;
  generatedAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const response = await apiClient.get('/reports');
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports</h1>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No reports generated yet.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">
            Generate Report
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="p-4 bg-white border rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{report.type} Report</h3>
                  <p className="text-sm text-gray-600">
                    Generated: {new Date(report.generatedAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  report.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {report.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Step 3: Add to Navigation

```typescript
// components/DashboardLayout.tsx (or Navigation.tsx)

const navItems = [
  // ... existing items
  {
    name: 'Reports',
    href: '/dashboard/reports',
    icon: FileText, // from lucide-react
  },
];
```

#### Step 4: Test

```bash
# Visit the new page
open http://localhost:3000/dashboard/reports
```

---

## 🤖 Extending AI Prompts

### Adding a New AI Prompt Type

**Example: Adding "Which pages need content updates?"**

#### Step 1: Add Intent Keywords

```typescript
// apps/backend/src/modules/ai/services/prompt-mapper.service.ts

private readonly contentKeywords = [
  'content',
  'update',
  'refresh',
  'outdated',
  'stale',
  'old',
];

analyzePrompt(userMessage: string): IntentAnalysis {
  const lowerMessage = userMessage.toLowerCase();

  // Existing checks...

  // NEW: Content update intent
  if (
    this.containsKeywords(lowerMessage, this.contentKeywords) &&
    this.containsKeywords(lowerMessage, ['pages', 'page', 'articles'])
  ) {
    return this.mapContentUpdateIntent(lowerMessage);
  }

  // ...
}
```

#### Step 2: Create Intent Mapper

```typescript
private mapContentUpdateIntent(message: string): IntentAnalysis {
  return {
    type: 'content_update_analysis',
    confidence: 0.87,
    keywords: ['content', 'update', 'pages'],
    dataSources: ['seo', 'analytics'],
    requiredDataSources: [
      {
        name: 'SEO Audit - Content Freshness',
        type: 'seo',
        query: 'Get pages with last modified > 6 months ago',
        relevance: 1.0,
      },
      {
        name: 'Analytics - Page Performance',
        type: 'analytics',
        query: 'Get traffic trends for old content pages',
        relevance: 0.8,
      },
    ],
  };
}
```

#### Step 3: Add Data Fetcher Logic

```typescript
// apps/backend/src/modules/ai/services/data-fetcher.service.ts

async fetchData(dataSources: DataSource[]): Promise<FetchResult> {
  const results = await Promise.all(
    dataSources.map(async (source) => {
      switch (source.type) {
        // Existing cases...

        case 'seo':
          if (source.query.includes('Content Freshness')) {
            return this.fetchContentFreshnessData();
          }
          // ...
      }
    })
  );

  // ...
}

private async fetchContentFreshnessData() {
  // Mock data (replace with real DB query)
  return {
    source: 'SEO Audit - Content Freshness',
    type: 'seo',
    data: {
      outdatedPages: [
        {
          url: '/blog/seo-guide-2022',
          lastModified: '2022-03-15',
          monthsSinceUpdate: 24,
          currentTraffic: 450,
          trafficTrend: 'declining',
        },
        {
          url: '/features/keyword-tool',
          lastModified: '2022-08-20',
          monthsSinceUpdate: 18,
          currentTraffic: 890,
          trafficTrend: 'stable',
        },
      ],
    },
    recordCount: 2,
    queryTime: 45,
  };
}
```

#### Step 4: Add Response Generator Logic

```typescript
// apps/backend/src/modules/ai/services/response-generator.service.ts

generateResponse(
  intent: IntentAnalysis,
  fetchedData: FetchResult[]
): AiResponse {
  switch (intent.type) {
    // Existing cases...

    case 'content_update_analysis':
      return this.generateContentUpdateResponse(fetchedData, intent);

    // ...
  }
}

private generateContentUpdateResponse(
  data: FetchResult[],
  intent: IntentAnalysis
): AiResponse {
  const contentData = data.find(d => d.type === 'seo')?.data;
  const outdatedPages = contentData?.outdatedPages || [];

  const answer = `
Based on my analysis, I've identified ${outdatedPages.length} pages that need content updates:

**High Priority:**
1. ${outdatedPages[0].url}
   - Last updated: ${outdatedPages[0].monthsSinceUpdate} months ago
   - Current traffic: ${outdatedPages[0].currentTraffic} visits/month
   - Trend: ${outdatedPages[0].trafficTrend}

2. ${outdatedPages[1].url}
   - Last updated: ${outdatedPages[1].monthsSinceUpdate} months ago
   - Current traffic: ${outdatedPages[1].currentTraffic} visits/month
   - Trend: ${outdatedPages[1].trafficTrend}

**Recommendations:**
1. Update statistics and examples to current year
2. Add new sections covering recent industry changes
3. Refresh meta descriptions to improve CTR
4. Consider republishing with new publish date

Regular content updates can improve rankings by 15-40% for aging content.
  `.trim();

  const confidence = this.calculateConfidence(intent, data);

  return {
    answer,
    confidence,
    reasoning: `I analyzed ${outdatedPages.length} pages from your SEO audit. Confidence is ${Math.round(confidence * 100)}% based on content age data and traffic trends.`,
    dataUsed: data.map(d => ({
      source: d.source,
      type: d.type,
      summary: `Analyzed ${d.recordCount} records`,
    })),
    suggestions: [
      'Which page should I prioritize first?',
      'Show me content update ROI',
      'What topics are trending in my industry?',
    ],
  };
}
```

#### Step 5: Test the New Prompt

```bash
# Start backend
cd apps/backend
npm run start:dev

# Test with curl
curl -X POST http://localhost:4000/api/v1/ai/chat \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Which pages need content updates?",
    "sessionId": "test-123",
    "projectId": "proj-456"
  }'

# Or use the frontend
open http://localhost:3000/dashboard/ai
# Type: "Which pages need content updates?"
```

---

## 📋 Best Practices & Coding Conventions

### TypeScript Standards

```typescript
// ✅ GOOD: Strong typing
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

function getUser(id: string): Promise<User> {
  return userRepository.findOne({ where: { id } });
}

// ❌ BAD: Any types
function getUser(id: any): Promise<any> {
  return userRepository.findOne({ where: { id } });
}
```

### Naming Conventions

```typescript
// Files: kebab-case
// user-profile.service.ts
// create-project.dto.ts

// Classes: PascalCase
class UserProfileService {}
class CreateProjectDto {}

// Functions/Variables: camelCase
const fetchUserData = async () => {};
const isAuthenticated = true;

// Constants: SCREAMING_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = process.env.API_URL;

// Interfaces: PascalCase (no "I" prefix)
interface UserProfile {} // ✅ GOOD
interface IUserProfile {} // ❌ Avoid
```

### Error Handling

```typescript
// ✅ GOOD: Specific error types
import { NotFoundException, BadRequestException } from '@nestjs/common';

async getProject(id: string) {
  const project = await this.projectRepository.findOne({ where: { id } });

  if (!project) {
    throw new NotFoundException(`Project with ID ${id} not found`);
  }

  return project;
}

// ❌ BAD: Generic errors
async getProject(id: string) {
  const project = await this.projectRepository.findOne({ where: { id } });

  if (!project) {
    throw new Error('Not found'); // Too generic
  }

  return project;
}
```

### Async/Await Best Practices

```typescript
// ✅ GOOD: Parallel execution
async function fetchDashboardData(projectId: string) {
  const [seoData, keywordData, analyticsData] = await Promise.all([
    this.seoService.getInsights(projectId),
    this.serpService.getKeywords(projectId),
    this.analyticsService.getStats(projectId),
  ]);

  return { seoData, keywordData, analyticsData };
}

// ❌ BAD: Sequential execution (slower)
async function fetchDashboardData(projectId: string) {
  const seoData = await this.seoService.getInsights(projectId);
  const keywordData = await this.serpService.getKeywords(projectId);
  const analyticsData = await this.analyticsService.getStats(projectId);

  return { seoData, keywordData, analyticsData };
}
```

### Component Organization (React)

```typescript
// ✅ GOOD: Clear structure
export default function DashboardPage() {
  // 1. Hooks
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. Effects
  useEffect(() => {
    fetchData();
  }, []);

  // 3. Event handlers
  async function fetchData() {
    // ...
  }

  function handleRefresh() {
    // ...
  }

  // 4. Render helpers
  function renderEmptyState() {
    return <div>No data</div>;
  }

  // 5. Main render
  if (loading) return <LoadingSpinner />;
  if (!data) return renderEmptyState();

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Comments & Documentation

```typescript
// ✅ GOOD: Explain WHY, not WHAT
// Using exponential backoff to avoid overwhelming the API
// during transient failures. Max 3 retries with 1s, 2s, 4s delays.
const delay = Math.pow(2, attempt) * 1000;

// ❌ BAD: Obvious comments
// Increment i by 1
i++;

// Set user to null
user = null;
```

### Environment Variables

```typescript
// ✅ GOOD: Centralized config
@Injectable()
export class ConfigService {
  get jwtSecret(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is required but not set');
    }
    return secret;
  }
}

// ❌ BAD: Direct access everywhere
const secret = process.env.JWT_SECRET; // Scattered throughout code
```

---

## 🔍 Debugging Tips

### Backend Debugging

```bash
# Enable debug logging
export DEBUG=*

# Run with inspect mode
npm run start:debug

# Connect Chrome DevTools
open chrome://inspect
```

### Database Query Debugging

```typescript
// Enable TypeORM logging in database.module.ts
TypeOrmModule.forRoot({
  // ...
  logging: true, // Shows all SQL queries
  logger: 'advanced-console',
});
```

### API Request Debugging

```bash
# Use curl with verbose output
curl -v http://localhost:4000/api/v1/projects

# Or use httpie
http localhost:4000/api/v1/projects Authorization:"Bearer TOKEN"

# Or Postman / Insomnia
```

### Frontend Debugging

```typescript
// React Developer Tools (Chrome extension)
// - Inspect component tree
// - View props/state
// - Profile performance

// Console logging (temporary only!)
console.log('Data:', data);
console.table(users); // Nice table format
console.trace(); // Stack trace
```

---

## 🎓 Learning Resources

### NestJS
- Official Docs: https://docs.nestjs.com
- Video Course: https://www.udemy.com/course/nestjs-zero-to-hero/

### Next.js
- Official Docs: https://nextjs.org/docs
- App Router Guide: https://nextjs.org/docs/app

### TypeScript
- Official Handbook: https://www.typescriptlang.org/docs/
- Type Challenges: https://github.com/type-challenges/type-challenges

### TypeORM
- Official Docs: https://typeorm.io/

### Tailwind CSS
- Official Docs: https://tailwindcss.com/docs

---

## 🚀 Next Steps

### Your First Contribution

1. **Pick a small task** from GitHub Issues labeled `good-first-issue`
2. **Create a branch** `git checkout -b feature/your-feature-name`
3. **Make your changes** following the patterns in this guide
4. **Test locally** ensure everything works
5. **Commit** with a clear message: `feat: add reports module`
6. **Push** `git push origin feature/your-feature-name`
7. **Open a Pull Request** with description

### What to Work On

**Easy:**
- Add new UI components
- Improve loading states
- Add form validations
- Write unit tests

**Medium:**
- Add new API endpoints
- Create new dashboard pages
- Extend existing services
- Add new database entities

**Advanced:**
- Implement new AI prompts
- Add CRO detection algorithms
- Create complex data aggregations
- Optimize performance

---

## 💬 Getting Help

### When You're Stuck

1. **Read the docs** (this file and linked docs)
2. **Search the codebase** for similar examples
3. **Check Swagger docs** http://localhost:4000/api/docs
4. **Ask the team** on Slack/Discord
5. **Open a discussion** on GitHub Discussions

### Common Questions

**Q: Where do I add a new API endpoint?**
A: In the appropriate module's controller file (e.g., `modules/projects/project.controller.ts`)

**Q: How do I access the database?**
A: Inject the repository via dependency injection in your service

**Q: Where do shared types go?**
A: In `packages/shared-types/src/`

**Q: How do I add authentication to an endpoint?**
A: Add `@UseGuards(JwtAuthGuard)` decorator

**Q: Frontend not showing latest backend changes?**
A: Check the API URL in `.env.local` and restart both servers

---

## ✅ Onboarding Checklist

- [ ] Repository cloned
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Docker services running
- [ ] Database migrated
- [ ] Backend started successfully
- [ ] Frontend started successfully
- [ ] Can log in to the app
- [ ] Read README.md
- [ ] Read architecture.md
- [ ] Read system-flow.md
- [ ] Read this file (onboarding.md)
- [ ] Explored backend modules
- [ ] Explored frontend pages
- [ ] Tested API in Swagger UI
- [ ] Tried AI chat interface
- [ ] Viewed CRO insights page
- [ ] Made first code change
- [ ] Successfully ran tests
- [ ] Opened first PR

---

**Welcome to the team! You're ready to build amazing features. 🚀**

If you have questions or suggestions to improve this guide, please submit a PR!
