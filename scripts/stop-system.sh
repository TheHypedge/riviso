#!/bin/bash

# Riviso System Stop Script
# Stops all running Riviso services

set -e

echo "🛑 Stopping Riviso System"
echo "========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to kill process on port
kill_port() {
    local port=$1
    local name=$2
    local pids=$(lsof -ti:${port} 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}Stopping ${name} (port ${port})...${NC}"
        echo "$pids" | xargs kill -9 2>/dev/null || true
        echo -e "${GREEN}  ✓ ${name} stopped${NC}"
    else
        echo -e "${BLUE}  ${name} (port ${port}) - Not running${NC}"
    fi
}

# Stop all services
kill_port 3000 "Frontend"
kill_port 4000 "Backend"
kill_port 8000 "Scraper Engine"

# Also kill any node/nest/python processes that might be related
echo ""
echo -e "${BLUE}Cleaning up related processes...${NC}"
pkill -f "nest start" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "uvicorn.*scraper" 2>/dev/null || true

sleep 1

echo ""
echo -e "${GREEN}✅ All services stopped${NC}"
