#!/bin/bash

# Riviso Full System Restart Script
# This script kills all existing processes and restarts the entire system

set -e

echo "🔄 Riviso System Restart"
echo "========================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to kill process on port
kill_port() {
    local port=$1
    local name=$2
    echo -e "${YELLOW}Stopping ${name} (port ${port})...${NC}"
    lsof -ti:${port} | xargs kill -9 2>/dev/null || echo -e "${BLUE}  No process found on port ${port}${NC}"
    sleep 1
}

# Step 1: Kill all existing processes
echo -e "${BLUE}Step 1: Stopping all services...${NC}"
kill_port 3000 "Frontend"
kill_port 4000 "Backend"
kill_port 8000 "Scraper Engine"
echo ""

# Wait a moment for ports to be released
sleep 2

# Get the project root directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Step 2: Start Scraper Engine
echo -e "${BLUE}Step 2: Starting Scraper Engine (port 8000)...${NC}"
cd "$PROJECT_ROOT/tools/scraper-engine"
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo -e "${YELLOW}  Creating virtual environment...${NC}"
    python3 -m venv venv || python3 -m venv .venv
fi
if [ -d "venv" ]; then
    source venv/bin/activate
elif [ -d ".venv" ]; then
    source .venv/bin/activate
fi
pip install -q -r requirements.txt 2>/dev/null || true
echo -e "${GREEN}  ✓ Starting scraper engine...${NC}"
cd "$PROJECT_ROOT"
npm run scraper:start > /tmp/riviso-scraper.log 2>&1 &
SCRAPER_PID=$!
echo -e "${GREEN}  ✓ Scraper Engine started (PID: ${SCRAPER_PID})${NC}"
sleep 3

# Step 3: Start Backend
echo ""
echo -e "${BLUE}Step 3: Starting Backend (port 4000)...${NC}"
cd "$PROJECT_ROOT/apps/backend"
echo -e "${GREEN}  ✓ Starting backend...${NC}"
npm run start:dev > /tmp/riviso-backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}  ✓ Backend started (PID: ${BACKEND_PID})${NC}"
sleep 5

# Step 4: Start Frontend
echo ""
echo -e "${BLUE}Step 4: Starting Frontend (port 3000)...${NC}"
cd "$PROJECT_ROOT/apps/frontend"
echo -e "${GREEN}  ✓ Starting frontend...${NC}"
npm run dev > /tmp/riviso-frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}  ✓ Frontend started (PID: ${FRONTEND_PID})${NC}"
sleep 3

# Step 5: Verify all services
echo ""
echo -e "${BLUE}Step 5: Verifying services (waiting for initialization)...${NC}"
sleep 10

SCRAPER_OK=false
BACKEND_OK=false
FRONTEND_OK=false

# Check Scraper Engine
if curl -s http://localhost:8000/health >/dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Scraper Engine (8000) - Running${NC}"
    SCRAPER_OK=true
else
    echo -e "${RED}  ✗ Scraper Engine (8000) - Not responding${NC}"
fi

# Check Backend
if lsof -ti:4000 >/dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Backend (4000) - Running${NC}"
    BACKEND_OK=true
else
    echo -e "${RED}  ✗ Backend (4000) - Not running${NC}"
fi

# Check Frontend
if lsof -ti:3000 >/dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Frontend (3000) - Running${NC}"
    FRONTEND_OK=true
else
    echo -e "${RED}  ✗ Frontend (3000) - Not running${NC}"
fi

echo ""
echo "========================"
if [ "$SCRAPER_OK" = true ] && [ "$BACKEND_OK" = true ] && [ "$FRONTEND_OK" = true ]; then
    echo -e "${GREEN}✅ All services started successfully!${NC}"
    echo ""
    echo "📊 Service URLs:"
    echo "  • Frontend:  http://localhost:3000"
    echo "  • Backend:   http://localhost:4000"
    echo "  • Scraper:   http://localhost:8000"
    echo ""
    echo "📝 Logs:"
    echo "  • Scraper:   tail -f /tmp/riviso-scraper.log"
    echo "  • Backend:   tail -f /tmp/riviso-backend.log"
    echo "  • Frontend:  tail -f /tmp/riviso-frontend.log"
    echo ""
    echo "🛑 To stop all services:"
    echo "  ./scripts/stop-system.sh"
else
    echo -e "${RED}⚠️  Some services failed to start. Check logs above.${NC}"
    echo ""
    echo "📝 Check logs:"
    echo "  tail -f /tmp/riviso-*.log"
    exit 1
fi
