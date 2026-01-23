# Riviso - AI-Driven Growth Intelligence Platform

> **Production-ready SaaS platform for SEO analysis, competitor tracking, keyword monitoring, and AI-powered conversion rate optimization.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red.svg)](https://nestjs.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## 🎯 Product Overview

**Riviso** is an AI-first Growth Intelligence System that unifies:

- **First-party data** (website analytics, Google Analytics, Search Console)
- **Third-party data** (SERP rankings, competitor analysis)
- **AI insights** (natural language querying, CRO recommendations)

### Core Features

✅ **SEO Analysis** - Comprehensive site audits with actionable recommendations  
✅ **Keyword & SERP Tracking** - Real-time ranking monitoring and trend analysis  
✅ **Competitor Intelligence** - Track competitors and identify content gaps  
✅ **AI Chat Assistant** - Query your data using natural language  
✅ **CRO Intelligence Engine** - Automated conversion optimization recommendations  
✅ **Integration Hub** - Connect Google Analytics, Search Console, and more  

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.3
- **Styling:** Tailwind CSS 3.4
- **UI Components:** Lucide React (icons)
- **HTTP Client:** Axios
- **State Management:** React Hooks

### Backend
- **Framework:** NestJS 10
- **Language:** TypeScript 5.3
- **API Style:** REST (with Swagger documentation)
- **Authentication:** JWT + OAuth2
- **Validation:** class-validator
- **ORM:** TypeORM

### Data Layer
- **Primary Database:** PostgreSQL 15
- **Cache/Queue:** Redis 7
- **Search Engine:** OpenSearch 2.x (abstraction layer)
- **Vector Database:** Interface for Pinecone/Weaviate

### AI Layer
- **LLM Abstraction:** OpenAI / Anthropic interchangeable
- **Prompt Orchestration:** Custom orchestrator
- **Vector Storage:** Abstracted interface
- **Intelligence Engines:**
  - AI Prompt System (3 supported prompts)
  - CRO Intelligence Engine (5 detection algorithms)

### Infrastructure
- **Monorepo Tool:** NPM Workspaces
- **Package Manager:** NPM 10+
- **Containerization:** Docker + Docker Compose
- **Cloud-Ready:** AWS-compatible (no vendor lock-in)
- **CI/CD Ready:** GitHub Actions compatible

---

## 📁 Project Structure

```
riviso/
├── apps/
│   ├── backend/                    # NestJS API server
│   │   ├── src/
│   │   │   ├── modules/           # Feature modules
│   │   │   │   ├── ai/            # AI Prompt System
│   │   │   │   │   └── services/
│   │   │   │   │       ├── prompt-mapper.service.ts
│   │   │   │   │       ├── data-fetcher.service.ts
│   │   │   │   │       └── response-generator.service.ts
│   │   │   │   ├── cro/           # CRO Intelligence Engine
│   │   │   │   │   └── services/
│   │   │   │   │       └── cro-engine.service.ts
│   │   │   │   ├── auth/          # Authentication
│   │   │   │   ├── user/          # User management
│   │   │   │   ├── project/       # Project/Workspace
│   │   │   │   ├── seo/           # SEO analysis
│   │   │   │   ├── serp/          # SERP tracking
│   │   │   │   ├── competitor/    # Competitor analysis
│   │   │   │   └── integrations/  # External APIs
│   │   │   ├── infrastructure/    # Data layer
│   │   │   │   ├── database/      # TypeORM entities
│   │   │   │   ├── redis/         # Redis service
│   │   │   │   ├── opensearch/    # Search abstraction
│   │   │   │   └── vector-db/     # Vector DB interface
│   │   │   └── common/            # Shared utilities
│   │   └── ARCHITECTURE.md        # Backend architecture
│   │
│   └── frontend/                   # Next.js application
│       ├── src/
│       │   ├── app/               # App Router pages
│       │   │   ├── auth/          # Login/Register
│       │   │   └── dashboard/     # Main dashboard
│       │   │       ├── page.tsx   # Dashboard home
│       │   │       ├── seo/       # SEO overview
│       │   │       ├── keywords/  # Keywords & SERP
│       │   │       ├── competitors/ # Competitor analysis
│       │   │       ├── cro/       # CRO insights
│       │   │       ├── ai/        # AI chat interface
│       │   │       └── settings/  # Settings
│       │   ├── components/        # React components
│       │   └── lib/               # Utilities (api, auth)
│       └── FRONTEND_ARCHITECTURE.md
│
├── packages/
│   ├── shared-types/              # TypeScript interfaces
│   │   └── src/
│   │       ├── auth.ts
│   │       ├── user.ts
│   │       ├── project.ts
│   │       ├── seo.ts
│   │       ├── ai.ts
│   │       └── cro.ts
│   │
│   ├── ai-core/                   # AI abstractions
│   │   └── src/
│   │       ├── llm-provider.ts    # LLM interface
│   │       ├── prompt-orchestrator.ts
│   │       └── vector-store.ts
│   │
│   └── ui-components/             # Shared UI components
│       └── src/
│           ├── Button.tsx
│           ├── Card.tsx
│           └── Badge.tsx
│
├── docs/
│   ├── architecture.md            # System architecture
│   ├── system-flow.md             # Data flows
│   └── onboarding.md              # Developer guide
│
├── docker/
│   └── docker-compose.yml         # Local development setup
│
├── AI_SYSTEM_FLOW.md              # AI Prompt System docs
├── AI_IMPLEMENTATION_SUMMARY.md   # AI implementation
├── CRO_INTELLIGENCE_ENGINE.md     # CRO Engine docs
├── FRONTEND_STATUS.md             # Frontend status
├── README.md                      # This file
└── package.json                   # Root workspace config
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and NPM 10+
- **Docker** and Docker Compose
- **Git**

### 1. Clone the Repository

```bash
git clone <repository-url>
cd riviso
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install
```

### 3. Set Up Environment Variables

```bash
# Backend environment
cp apps/backend/.env.example apps/backend/.env

# Frontend environment
cp apps/frontend/.env.example apps/frontend/.env
```

**Edit the `.env` files with your configuration** (see [Environment Variables](#environment-variables) below).

### 4. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, OpenSearch
docker-compose -f docker/docker-compose.yml up -d
```

### 5. Run Database Migrations

```bash
cd apps/backend
npm run migration:run
```

### 6. Start Development Servers

```bash
# Terminal 1: Backend (http://localhost:4000)
cd apps/backend
npm run start:dev

# Terminal 2: Frontend (http://localhost:3000)
cd apps/frontend
npm run dev
```

### 7. Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **API Documentation:** http://localhost:4000/api/docs

---

## 🔐 Environment Variables

### Backend (`apps/backend/.env`)

```bash
# Application
NODE_ENV=development
PORT=4000

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=riviso
DATABASE_PASSWORD=your_secure_password
DATABASE_NAME=riviso_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Authentication
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRATION=30d

# OpenSearch
OPENSEARCH_NODE=http://localhost:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=admin

# Vector Database (Optional - Interface only)
VECTOR_DB_PROVIDER=pinecone  # or weaviate
VECTOR_DB_API_KEY=your_api_key
VECTOR_DB_ENVIRONMENT=us-east-1-aws
VECTOR_DB_INDEX=riviso-vectors

# AI/LLM Provider
LLM_PROVIDER=openai  # or anthropic
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4-turbo-preview
ANTHROPIC_API_KEY=your_anthropic_api_key
ANTHROPIC_MODEL=claude-3-sonnet-20240229

# External Integrations (Optional)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_secret
GOOGLE_ANALYTICS_API_KEY=
GOOGLE_SEARCH_CONSOLE_API_KEY=
```

### Frontend (`apps/frontend/.env.local`)

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Authentication
NEXT_PUBLIC_AUTH_COOKIE_NAME=riviso_token

# Feature Flags (Optional)
NEXT_PUBLIC_ENABLE_AI_CHAT=true
NEXT_PUBLIC_ENABLE_CRO_ENGINE=true
```

---

## 💻 Local Development

### Running Services Individually

```bash
# Backend only
cd apps/backend
npm run start:dev

# Frontend only
cd apps/frontend
npm run dev

# Build all packages
npm run build

# Run tests
npm run test
```

### Database Operations

```bash
cd apps/backend

# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert

# Seed database
npm run seed
```

### Code Quality

```bash
# Lint all packages
npm run lint

# Format code
npm run format

# Type check
npm run type-check
```

---

## 🤖 AI Architecture Overview

### AI Prompt System

The AI Prompt System allows users to query their data using natural language. It features:

1. **Intent Analysis** - Determines what the user is asking
2. **Data Fetching** - Queries relevant data sources
3. **Response Generation** - Creates intelligent responses with reasoning

**Supported Prompts:**
- "Why did my traffic drop?" (92% confidence)
- "Which pages have low CTR?" (89% confidence)
- "Which competitors outrank us?" (95% confidence)

**Architecture:**

```
User Query → PromptMapperService → DataFetcherService → ResponseGeneratorService
    ↓              ↓                      ↓                      ↓
  Intent      Data Sources         Fetch Data           AI Response
Analysis      Identified          (Analytics,           (with confidence
                                  SEO, Keywords)         & reasoning)
```

**Key Features:**
- ✅ Confidence scores (60-95%)
- ✅ Data source transparency (shows what data was used)
- ✅ AI reasoning (explains how conclusion was reached)
- ✅ Follow-up suggestions
- ✅ Mock data support (for testing)

**Documentation:** See [AI_SYSTEM_FLOW.md](AI_SYSTEM_FLOW.md) for complete details.

---

### CRO Intelligence Engine

The CRO Engine automatically analyzes pages and identifies conversion optimization opportunities using:

1. **Rule-Based Detection** - 5 algorithms identify issues
2. **Priority Scoring** - 0-100 score based on impact + traffic
3. **AI Recommendations** - Actionable suggestions with reasoning

**Detection Algorithms:**
1. High Traffic, Low Conversion (>1000 views, <2.5% CVR)
2. Intent Mismatch (traffic source vs. page type)
3. Poor Engagement (<30s on page, >55% bounce)
4. High Exit Rate (>60% for non-checkout pages)
5. Funnel Drop-Off (>40% drop between steps)

**Architecture:**

```
Page Data → CroEngineService
    ↓            ↓
Analytics   Rule-Based Detection
Data           ↓
          5 Algorithms Analyze
               ↓
        Issues Identified
               ↓
        Recommendations Generated
               ↓
        Priority Score Calculated
               ↓
        Projected Impact Estimated
```

**Key Features:**
- ✅ Priority scoring (0-100)
- ✅ AI-generated recommendations with reasoning
- ✅ Action items with time estimates
- ✅ Projected impact with confidence scores
- ✅ Real-world examples (before/after case studies)

**Documentation:** See [CRO_INTELLIGENCE_ENGINE.md](CRO_INTELLIGENCE_ENGINE.md) for complete details.

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [README.md](README.md) | This file - product overview and setup |
| [docs/architecture.md](docs/architecture.md) | System architecture and infrastructure |
| [docs/system-flow.md](docs/system-flow.md) | Data flows and user journeys |
| [docs/onboarding.md](docs/onboarding.md) | Developer onboarding guide |
| [AI_SYSTEM_FLOW.md](AI_SYSTEM_FLOW.md) | AI Prompt System architecture |
| [AI_IMPLEMENTATION_SUMMARY.md](AI_IMPLEMENTATION_SUMMARY.md) | AI implementation details |
| [CRO_INTELLIGENCE_ENGINE.md](CRO_INTELLIGENCE_ENGINE.md) | CRO Engine documentation |
| [FRONTEND_STATUS.md](FRONTEND_STATUS.md) | Frontend implementation status |
| [apps/backend/ARCHITECTURE.md](apps/backend/ARCHITECTURE.md) | Backend architecture details |

---

## 🧪 Testing

### Unit Tests

```bash
# Backend tests
cd apps/backend
npm run test

# Frontend tests
cd apps/frontend
npm run test
```

### E2E Tests

```bash
# Run E2E tests
npm run test:e2e
```

### API Testing

Use the Swagger UI at http://localhost:4000/api/docs to test API endpoints interactively.

---

## 🚢 Deployment

### Production Build

```bash
# Build all packages
npm run build

# Backend production build
cd apps/backend
npm run build

# Frontend production build
cd apps/frontend
npm run build
```

### Docker Deployment

```bash
# Build Docker images
docker-compose -f docker/docker-compose.prod.yml build

# Start production services
docker-compose -f docker/docker-compose.prod.yml up -d
```

### Environment Variables (Production)

Ensure all environment variables are properly configured for production:
- Use strong, unique secrets for JWT
- Configure SSL certificates
- Set appropriate CORS origins
- Enable rate limiting
- Configure monitoring and logging

---

## 🔒 Security

- **Authentication:** JWT-based with refresh tokens
- **Authorization:** Role-based access control (RBAC)
- **Data Encryption:** SSL/TLS in transit, encrypted at rest
- **API Security:** Rate limiting, CORS, helmet middleware
- **Input Validation:** class-validator on all DTOs
- **SQL Injection:** Protected via TypeORM parameterized queries
- **XSS Protection:** Content Security Policy headers

---

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl http://localhost:4000/health

# Database health
curl http://localhost:4000/health/db

# Redis health
curl http://localhost:4000/health/redis
```

### Metrics

- API response times
- Database query performance
- Cache hit rates
- AI query processing times
- CRO analysis performance

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **TypeScript:** Strict mode enabled
- **Linting:** ESLint with recommended rules
- **Formatting:** Prettier
- **Commits:** Conventional Commits format
- **Testing:** Minimum 80% coverage for new features

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Next.js team for the excellent React framework
- NestJS team for the robust backend framework
- OpenAI/Anthropic for AI capabilities
- All contributors to this project

---

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Email:** support@riviso.com

---

## 🗺️ Roadmap

### Phase 1 (Current - MVP)
- ✅ Core SEO analysis
- ✅ Keyword tracking
- ✅ Competitor analysis
- ✅ AI Prompt System (3 prompts)
- ✅ CRO Intelligence Engine (5 algorithms)
- ✅ Dashboard UI

### Phase 2 (Q2 2024)
- 🔄 Real Google Analytics integration
- 🔄 Real Search Console integration
- 🔄 Advanced AI prompts (10+ supported)
- 🔄 Enhanced CRO recommendations
- 🔄 A/B testing framework

### Phase 3 (Q3 2024)
- 📋 White-label solution
- 📋 API for third-party integrations
- 📋 Advanced reporting and exports
- 📋 Team collaboration features
- 📋 Custom alerts and notifications

### Phase 4 (Q4 2024)
- 📋 Machine learning models for predictions
- 📋 Automated SEO fixes
- 📋 Voice-based AI queries
- 📋 Mobile app (iOS/Android)

---

**Built with ❤️ by the Riviso Team**

**Star ⭐ this repo if you find it useful!**
