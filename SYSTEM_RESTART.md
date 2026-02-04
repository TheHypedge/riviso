# Riviso System Restart Guide

## Quick Restart Commands

### Option 1: Using npm scripts (Recommended)
```bash
# Restart entire system
npm run restart

# Stop all services
npm run stop
```

### Option 2: Using shell scripts directly
```bash
# Restart entire system
./scripts/restart-system.sh

# Stop all services
./scripts/stop-system.sh
```

## What Gets Restarted

The restart script manages three services:

1. **Scraper Engine** (Port 8000)
   - Python FastAPI application
   - Handles website crawling and link analysis
   - Health check: `http://localhost:8000/health`

2. **Backend** (Port 4000)
   - NestJS application
   - API server and business logic
   - Health check: `lsof -ti:4000`

3. **Frontend** (Port 3000)
   - Next.js application
   - User interface
   - Health check: `lsof -ti:3000`

## Service URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Scraper Engine**: http://localhost:8000

## Log Files

All services log to `/tmp/`:

```bash
# View all logs
tail -f /tmp/riviso-*.log

# View specific service
tail -f /tmp/riviso-backend.log
tail -f /tmp/riviso-frontend.log
tail -f /tmp/riviso-scraper.log
```

## Troubleshooting

### Backend Won't Start

If the backend fails to start, check the logs:

```bash
tail -50 /tmp/riviso-backend.log
```

Common issues:
- Database connection errors
- Port already in use
- Missing dependencies

### Manual Service Management

**Start individual services:**

```bash
# Scraper Engine
cd tools/scraper-engine
npm run scraper:start

# Backend
cd apps/backend
npm run start:dev

# Frontend
cd apps/frontend
npm run dev
```

**Stop individual services:**

```bash
# Stop by port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:4000 | xargs kill -9  # Backend
lsof -ti:8000 | xargs kill -9  # Scraper
```

### Check Service Status

```bash
# Check all services
curl -s http://localhost:8000/health && echo " ✓ Scraper"
lsof -ti:4000 >/dev/null && echo "✓ Backend" || echo "✗ Backend"
lsof -ti:3000 >/dev/null && echo "✓ Frontend" || echo "✗ Frontend"
```

## Notes

- Services start in order: Scraper → Backend → Frontend
- Script waits for each service to initialize before starting the next
- All services run in background (`&`)
- Logs are written to `/tmp/` for easy access
- Script includes verification step to confirm all services started
