#!/bin/bash

echo "=========================================="
echo "Riviso System Test Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Check if backend builds
echo -e "${YELLOW}Test 1: Backend Build${NC}"
cd apps/backend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend builds successfully${NC}"
else
    echo -e "${RED}✗ Backend build failed${NC}"
    exit 1
fi
cd ../..

# Test 2: Check if frontend builds
echo -e "${YELLOW}Test 2: Frontend Build${NC}"
cd apps/frontend
if npm run build > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend builds successfully${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
cd ../..

# Test 3: Check if data directory exists
echo -e "${YELLOW}Test 3: Data Persistence${NC}"
if [ -d "apps/backend/data" ] && [ -f "apps/backend/data/users.json" ]; then
    USER_COUNT=$(cat apps/backend/data/users.json | grep -o '"email"' | wc -l)
    echo -e "${GREEN}✓ Data directory exists with ${USER_COUNT} users${NC}"
else
    echo -e "${YELLOW}⚠ Data directory does not exist (will be created on first run)${NC}"
fi

# Test 4: Check TypeScript compilation
echo -e "${YELLOW}Test 4: TypeScript Compilation${NC}"
cd apps/backend
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend TypeScript compiles${NC}"
else
    echo -e "${RED}✗ Backend TypeScript errors${NC}"
    exit 1
fi
cd ../..

cd apps/frontend
if npx tsc --noEmit > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend TypeScript compiles${NC}"
else
    echo -e "${RED}✗ Frontend TypeScript errors${NC}"
    exit 1
fi
cd ../..

# Test 5: Check if backend port is available
echo -e "${YELLOW}Test 5: Backend Port Check${NC}"
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running on port 4000${NC}"
else
    echo -e "${YELLOW}⚠ Backend is not running (start with: cd apps/backend && npm run start:dev)${NC}"
fi

# Test 6: Check if frontend port is available
echo -e "${YELLOW}Test 6: Frontend Port Check${NC}"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend is running on port 3000${NC}"
else
    echo -e "${YELLOW}⚠ Frontend is not running (start with: cd apps/frontend && npm run dev)${NC}"
fi

# Test 7: Test API endpoint (if backend is running)
echo -e "${YELLOW}Test 7: API Health Check${NC}"
if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is responding${NC}"
else
    echo -e "${YELLOW}⚠ Backend API is not responding (backend may not be running)${NC}"
fi

echo ""
echo "=========================================="
echo -e "${GREEN}System Test Complete!${NC}"
echo "=========================================="
echo ""
echo "To start the system:"
echo "  1. Backend:  cd apps/backend && npm run start:dev"
echo "  2. Frontend: cd apps/frontend && npm run dev"
echo ""
echo "Demo credentials:"
echo "  Email: demo@riviso.com"
echo "  Password: demo123"
echo ""
