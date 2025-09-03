# Getting Started with SEO Audit Platform

This guide will help you get the SEO Audit Platform up and running in minutes.

## 🚀 Quick Start (5 minutes)

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **Python 3.11+** - [Download here](https://python.org/)
- **Docker & Docker Compose** - [Download here](https://docker.com/)
- **pnpm** (recommended) - Install with `npm install -g pnpm`

### Option 1: Automated Setup

Run the setup script for automatic configuration:

```bash
./scripts/setup.sh
```

This will:
- Install all dependencies
- Start the infrastructure (PostgreSQL, Redis, Adminer)
- Run database migrations
- Set up environment files

### Option 2: Manual Setup

If you prefer manual setup or the script fails:

#### 1. Install Dependencies

```bash
# Install Node.js dependencies
pnpm install

# Install Python dependencies
cd services/audit-api
pip install -e .
cd ../..
```

#### 2. Start Infrastructure

```bash
# Start PostgreSQL, Redis, and Adminer
docker-compose -f infra/docker-compose.yml up -d

# Wait for services to be ready
sleep 10
```

#### 3. Setup Environment

```bash
# Copy environment template
cp infra/env/.env.local.example services/audit-api/.env

# Edit the .env file with your configuration (optional for local dev)
```

#### 4. Run Database Migrations

```bash
cd services/audit-api
alembic upgrade head
cd ../..
```

#### 5. Start Development Servers

```bash
# Start all services
make dev

# Or start individually:
# Frontend: pnpm --filter @seo-audit/web dev
# Backend: cd services/audit-api && uvicorn main:app --reload
```

## 🎯 Access Your Platform

Once everything is running, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database Admin**: http://localhost:8080 (Adminer)

## 🧪 Test Your Setup

### 1. Health Check

Visit http://localhost:8000/health to verify the API is running.

### 2. Create Your First Audit

1. Go to http://localhost:3000
2. Enter a URL (e.g., `https://example.com`)
3. Click "Start SEO Audit"
4. Watch the real-time progress
5. View the detailed results

### 3. API Test

```bash
# Create an audit via API
curl -X POST "http://localhost:8000/audits/" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Check audit status
curl "http://localhost:8000/audits/{audit_id}"
```

## 🔧 Development Commands

```bash
# Development
make dev              # Start all development servers
make docker-up        # Start local infrastructure
make docker-down      # Stop local infrastructure

# Building
make build            # Build all applications
make clean            # Clean build artifacts

# Testing
make test             # Run all tests
make lint             # Run linting
make format           # Format code

# Database
make migrate          # Run database migrations
make migrate-create   # Create new migration

# Type checking
make type-check       # Run TypeScript type checking
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use

If you get port conflicts:

```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5432 | xargs kill -9  # PostgreSQL
```

#### 2. Database Connection Issues

```bash
# Restart database
docker-compose -f infra/docker-compose.yml restart postgres

# Check database logs
docker-compose -f infra/docker-compose.yml logs postgres
```

#### 3. Python Dependencies Issues

```bash
# Reinstall Python dependencies
cd services/audit-api
pip install -e . --force-reinstall
```

#### 4. Node.js Dependencies Issues

```bash
# Clear cache and reinstall
pnpm store prune
rm -rf node_modules
pnpm install
```

### Logs and Debugging

```bash
# View API logs
cd services/audit-api
uvicorn main:app --reload --log-level debug

# View Docker logs
docker-compose -f infra/docker-compose.yml logs -f

# Check database
docker exec -it seo-audit-postgres psql -U seo_audit -d seo_audit
```

## 📚 Next Steps

### 1. Explore the Codebase

- **Frontend**: `apps/web/src/` - React components and pages
- **Backend**: `services/audit-api/src/` - FastAPI routes and business logic
- **Shared**: `packages/shared/src/` - TypeScript types and schemas

### 2. Customize SEO Rules

Edit `services/audit-api/rules/v1.yaml` to add or modify SEO rules.

### 3. Add External Providers

Implement providers in `services/audit-api/src/audit/providers/` for:
- PageSpeed Insights
- Ahrefs API
- Bing Search API

### 4. Deploy to Production

- **Frontend**: Deploy to Vercel
- **Backend**: Deploy to Cloud Run or Render
- **Database**: Use Neon or Supabase

## 🆘 Need Help?

- **Documentation**: Check the README files in each package
- **Issues**: Create a GitHub issue
- **Discussions**: Use GitHub Discussions for questions

## 🎉 You're Ready!

Your SEO Audit Platform is now running locally. Start auditing websites and building amazing SEO tools!

---

**Happy Auditing!** 🚀
