# Riviso System Management Scripts

Quick scripts to manage the entire Riviso system.

## Quick Start

### Restart Full System
```bash
# Option 1: Using npm script (recommended)
npm run restart

# Option 2: Direct script execution
./scripts/restart-system.sh
```

### Stop All Services
```bash
# Option 1: Using npm script
npm run stop

# Option 2: Direct script execution
./scripts/stop-system.sh
```

## What These Scripts Do

### `restart-system.sh`
1. **Stops all services** (Frontend, Backend, Scraper Engine)
2. **Starts Scraper Engine** (port 8000)
3. **Starts Backend** (port 4000)
4. **Starts Frontend** (port 3000)
5. **Verifies** all services are running
6. **Displays** service URLs and log locations

### `stop-system.sh`
1. **Stops all services** gracefully
2. **Cleans up** related processes
3. **Confirms** shutdown

## Service Ports

- **Frontend**: `http://localhost:3000`
- **Backend**: `http://localhost:4000`
- **Scraper Engine**: `http://localhost:8000`

## Log Files

All services log to `/tmp/`:
- Scraper: `/tmp/riviso-scraper.log`
- Backend: `/tmp/riviso-backend.log`
- Frontend: `/tmp/riviso-frontend.log`

### View Logs
```bash
# View all logs
tail -f /tmp/riviso-*.log

# View specific service
tail -f /tmp/riviso-backend.log
```

## Troubleshooting

### Services Won't Start
1. Check if ports are already in use:
   ```bash
   lsof -i:3000
   lsof -i:4000
   lsof -i:8000
   ```

2. Manually kill processes:
   ```bash
   lsof -ti:3000 | xargs kill -9
   lsof -ti:4000 | xargs kill -9
   lsof -ti:8000 | xargs kill -9
   ```

3. Check logs for errors:
   ```bash
   tail -50 /tmp/riviso-*.log
   ```

### Network Errors
If you see "Network Error" in the frontend:
1. Ensure backend is running: `lsof -ti:4000`
2. Check backend logs: `tail -f /tmp/riviso-backend.log`
3. Verify backend health: `curl http://localhost:4000/health`

### Scraper Engine Issues
1. Check if Python venv exists: `ls tools/scraper-engine/venv`
2. Verify scraper is running: `curl http://localhost:8000/health`
3. Check scraper logs: `tail -f /tmp/riviso-scraper.log`

## Manual Service Management

### Start Individual Services

**Scraper Engine:**
```bash
cd tools/scraper-engine
npm run scraper:start
```

**Backend:**
```bash
cd apps/backend
npm run start:dev
```

**Frontend:**
```bash
cd apps/frontend
npm run dev
```

### Stop Individual Services
```bash
# Stop by port
lsof -ti:3000 | xargs kill -9  # Frontend
lsof -ti:4000 | xargs kill -9  # Backend
lsof -ti:8000 | xargs kill -9  # Scraper
```

## Notes

- Scripts use background processes (`&`) to run services
- All services start in the correct order (Scraper → Backend → Frontend)
- Scripts wait for services to initialize before starting the next
- Verification step checks all services are responding
- Logs are written to `/tmp/` for easy access
