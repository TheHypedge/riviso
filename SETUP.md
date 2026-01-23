# Riviso - Quick Setup Guide

## What Has Been Built

✅ **Complete Monorepo Structure** with apps, packages, docs, and Docker configs
✅ **Backend API** - NestJS with 8 core modules (Auth, User, Project, SEO, SERP, Competitor, AI, CRO)
✅ **Frontend Application** - Next.js 14 with App Router, 9 complete pages
✅ **Shared Packages** - TypeScript types, AI core, and UI components
✅ **AI Integration** - LLM provider abstraction with OpenAI/Anthropic support
✅ **Docker Configuration** - PostgreSQL, Redis, OpenSearch, and application containers
✅ **Comprehensive Documentation** - README, architecture, system flows, and onboarding

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment File

Create a `.env` file in the root directory with these **minimum** settings:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=riviso
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=change-this-to-a-random-secret-key
JWT_EXPIRATION=7d

# Backend/Frontend URLs
BACKEND_PORT=4000
BACKEND_URL=http://localhost:4000/api
CORS_ORIGIN=http://localhost:3000

# AI (Optional - for AI assistant to work)
LLM_PROVIDER=openai
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and OpenSearch
npm run docker:up

# Wait 10-15 seconds for services to be ready
```

### 4. Start Applications

```bash
# Start both backend and frontend
npm run dev
```

**OR** start them separately:

```bash
# Terminal 1 - Backend
cd apps/backend
npm run start:dev

# Terminal 2 - Frontend  
cd apps/frontend
npm run dev
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000/api
- **API Documentation**: http://localhost:4000/api/docs (Swagger)

### 6. Create Your First Account

1. Go to http://localhost:3000
2. Click "Get Started" or "Sign Up"
3. Register with email and password
4. Create your first project
5. Explore the dashboard!

## Available Pages

### Public Pages
- **Landing Page** (`/`) - Marketing homepage with features
- **Login** (`/auth/login`) - User authentication
- **Register** (`/auth/register`) - New account creation

### Dashboard Pages (Authenticated)
- **Dashboard Home** (`/dashboard`) - KPIs, charts, activity feed
- **SEO Analysis** (`/dashboard/seo`) - Comprehensive SEO audits
- **Keywords & SERP** (`/dashboard/keywords`) - Keyword tracking and rankings
- **Competitors** (`/dashboard/competitors`) - Competitor analysis and content gaps
- **CRO Insights** (`/dashboard/cro`) - Conversion rate optimization recommendations
- **AI Assistant** (`/dashboard/ai`) - Natural language data querying
- **Settings** (`/dashboard/settings`) - Account and integration settings

## API Endpoints

All endpoints are documented at http://localhost:4000/api/docs when the backend is running.

### Key Endpoints:

**Authentication**
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token

**Projects**
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project details

**SEO**
- `POST /api/seo/audit` - Run SEO audit
- `GET /api/seo/audits/:projectId` - Get audits

**Keywords**
- `POST /api/serp/keywords` - Add keywords
- `GET /api/serp/keywords/:projectId` - List keywords
- `GET /api/serp/rankings/:keywordId` - Get rankings

**AI**
- `POST /api/ai/chat` - Send message to AI
- `GET /api/ai/sessions/:userId` - Get chat sessions

**CRO**
- `GET /api/cro/insights/:projectId` - Get CRO insights
- `POST /api/cro/analyze` - Analyze page for CRO

## Development Scripts

```bash
# Development
npm run dev                    # Start all services
npm run dev:backend           # Backend only
npm run dev:frontend          # Frontend only

# Building
npm run build                 # Build everything
npm run build:backend         # Backend only
npm run build:frontend        # Frontend only

# Docker
npm run docker:up             # Start infrastructure
npm run docker:down           # Stop infrastructure

# Code Quality
npm run lint                  # Lint all code
npm run format                # Format with Prettier
```

## Project Structure

```
riviso/
├── apps/
│   ├── backend/              # NestJS API (Port 4000)
│   │   ├── src/modules/      # Feature modules
│   │   │   ├── auth/         # JWT authentication
│   │   │   ├── user/         # User management
│   │   │   ├── project/      # Projects
│   │   │   ├── seo/          # SEO analysis
│   │   │   ├── serp/         # Keyword tracking
│   │   │   ├── competitor/   # Competitor analysis
│   │   │   ├── ai/           # AI chat
│   │   │   └── cro/          # CRO insights
│   │   └── Dockerfile
│   └── frontend/             # Next.js app (Port 3000)
│       ├── src/app/          # Pages and routes
│       ├── src/components/   # React components
│       ├── src/lib/          # Utilities (API, auth)
│       └── Dockerfile
├── packages/
│   ├── shared-types/         # TypeScript types
│   ├── ai-core/              # AI/LLM abstractions
│   └── ui-components/        # Shared components
├── docs/
│   ├── architecture.md       # System architecture
│   ├── system-flow.md        # Data flows
│   └── onboarding.md         # Developer guide
├── docker/
│   └── docker-compose.yml    # Infrastructure
└── README.md                 # Main documentation
```

## Important Notes for MVP

### Mock Data
The current MVP uses **mock data** for:
- SEO audit results (simulated analysis)
- Keyword rankings (random data)
- Competitor metrics (generated data)
- CRO recommendations (rule-based + AI)

### Real Implementation Required
For production, you'll need to:
1. **SEO Module**: Integrate with actual web crawling service
2. **SERP Module**: Connect to SERP API (e.g., DataForSEO, SerpAPI)
3. **Analytics**: Integrate Google Analytics API
4. **Search Console**: Integrate Google Search Console API
5. **AI Provider**: Add your OpenAI or Anthropic API key
6. **Background Jobs**: Implement scheduled tasks for data refresh

### Security Considerations
- Change `JWT_SECRET` to a strong random value
- Never commit `.env` files
- Use environment-specific secrets in production
- Enable HTTPS in production
- Set up proper CORS configuration

## Next Steps

### For Development

1. **Read Documentation**:
   - `README.md` - Overview and features
   - `docs/architecture.md` - System design
   - `docs/system-flow.md` - Data flows
   - `docs/onboarding.md` - Developer guide

2. **Explore the Code**:
   - Start with `apps/backend/src/app.module.ts`
   - Look at module structure in `apps/backend/src/modules/`
   - Examine frontend pages in `apps/frontend/src/app/`

3. **Make Changes**:
   - Add a new endpoint
   - Create a new dashboard page
   - Extend shared types
   - Customize UI components

### For Production

1. **Infrastructure**:
   - Set up AWS/GCP/Azure resources
   - Configure RDS for PostgreSQL
   - Set up ElastiCache for Redis
   - Configure managed OpenSearch

2. **CI/CD**:
   - Set up GitHub Actions or similar
   - Configure automated testing
   - Set up staging and production environments

3. **Monitoring**:
   - Add application monitoring (DataDog, New Relic)
   - Set up error tracking (Sentry)
   - Configure alerts for critical issues

4. **Security**:
   - Implement rate limiting
   - Add DDoS protection
   - Enable audit logging
   - Regular security audits

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Docker Services Won't Start
```bash
# Stop everything
npm run docker:down

# Remove volumes (WARNING: deletes data)
docker-compose -f docker/docker-compose.yml down -v

# Restart
npm run docker:up
```

### "Cannot find module" Errors
```bash
# Rebuild shared packages
npm run build:packages

# Clean install
rm -rf node_modules apps/*/node_modules packages/*/node_modules
npm install
```

### Database Connection Errors
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check logs
docker logs riviso-postgres

# Verify connection
docker exec -it riviso-postgres psql -U postgres -d riviso
```

## Getting Help

- **Documentation**: See `docs/` folder
- **API Docs**: http://localhost:4000/api/docs
- **Architecture**: `docs/architecture.md`
- **Onboarding**: `docs/onboarding.md`

## Tech Stack Summary

**Frontend**: Next.js 14, TypeScript, Tailwind CSS, Recharts
**Backend**: NestJS, TypeORM, PostgreSQL, Redis
**AI**: OpenAI/Anthropic abstraction, prompt orchestration
**Infrastructure**: Docker, Docker Compose
**Search**: OpenSearch for analytics

---

**Built with enterprise-grade architecture and best practices. Ready to scale! 🚀**
