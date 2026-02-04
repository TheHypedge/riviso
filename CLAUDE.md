# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Riviso is an AI-driven Growth Intelligence SaaS Platform built as a monorepo with NPM workspaces. It provides SEO analysis, Google Search Console integration, CRO intelligence, competitor research, and AI-powered insights.

## Architecture

```
apps/
├── backend/          # NestJS REST API (port 4000)
└── frontend/         # Next.js 14 app (port 3000)
packages/
├── shared-types/     # TypeScript interfaces shared between apps
├── ai-core/          # AI/LLM abstraction layer
└── ui-components/    # Shared React components
tools/
└── scraper-engine/   # Python web scraper (port 8000)
```

## Common Commands

```bash
# Development
npm run dev                 # Start both backend & frontend
npm run dev:backend         # Backend only (watch mode)
npm run dev:frontend        # Frontend only

# Building (must build packages first)
npm run build:packages      # Build shared packages
npm run build               # Build everything

# Testing (backend)
cd apps/backend
npm run test                # Run all tests
npm run test:watch          # Tests in watch mode
npm run test:cov            # Tests with coverage

# Linting
npm run lint                # Lint all workspaces

# Infrastructure
npm run docker:up           # Start PostgreSQL, Redis, OpenSearch
npm run docker:down         # Stop Docker services
```

## Key Development Patterns

### Backend (NestJS)

Modules are in `apps/backend/src/modules/`. Each module follows the pattern:
- `*.module.ts` - Module definition with imports/exports
- `*.controller.ts` - REST endpoints with `@Controller()` decorator
- `*.service.ts` - Business logic with `@Injectable()` decorator
- `dto/*.dto.ts` - Request/response validation with class-validator

Protected routes use `@UseGuards(JwtAuthGuard)` and `@ApiBearerAuth()`.

### Frontend (Next.js)

- Pages in `apps/frontend/src/app/` using App Router
- Components in `apps/frontend/src/components/`
- API client in `apps/frontend/src/lib/api.ts`
- Context providers in `apps/frontend/src/contexts/`

### Shared Types

All shared interfaces go in `packages/shared-types/src/`. After changes:
```bash
cd packages/shared-types && npm run build
```

## Database & Infrastructure

- **PostgreSQL**: Primary database (port 5432)
- **Redis**: Caching and job queues (port 6379)
- **OpenSearch**: Search and analytics (port 9200)

Database entities are in `apps/backend/src/infrastructure/database/entities/`.

## Environment Variables

Backend (`.env` in `apps/backend/`):
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `JWT_SECRET` - JWT signing key
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `OPENAI_API_KEY` - For AI features

Frontend (`.env.local` in `apps/frontend/`):
- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:4000)

## Module Structure Reference

Key backend modules:
- `auth/` - JWT authentication + Google OAuth
- `seo/` - Website SEO analysis (WebScraperService, TechnicalSeoBuilder)
- `search-console/` - Google Search Console data
- `integrations/` - External API connections
- `keyword-intelligence/` - Keyword analysis with intent classification
- `competitor-research/` - Competitor website analysis
- `ai/` - AI assistant with PromptMapper and ResponseGenerator
- `cro/` - Conversion rate optimization insights

## API Conventions

- All routes prefixed with `/v1/`
- Swagger documentation at `/api-docs`
- Standard response format with data wrapper
- Error responses include `message` and `statusCode`

## Testing

Backend uses Jest. Test files are co-located with source files as `*.spec.ts`.

```bash
# Run single test file
cd apps/backend
npm run test -- --testPathPattern=keyword-intelligence
```
