#!/bin/bash

# Stock Arena - One Command Startup Script
# Starts both Backend (port 8000) and Frontend (port 5173)

set -e

PROJECT_ROOT="/Users/vivek/Code/stockarena"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║    Stock Arena - Full Stack Startup    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Kill any existing processes
echo -e "${YELLOW}🔄 Cleaning up old processes...${NC}"
pkill -f "uvicorn" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true
sleep 1

# Start Backend
echo -e "${GREEN}[1/2] Starting Backend (port 8000)...${NC}"
cd "$BACKEND_DIR"
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/stockarena-backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

# Verify backend started
if ! curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo -e "${RED}✗ Backend failed to start${NC}"
    cat /tmp/stockarena-backend.log
    exit 1
fi
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Start Frontend
echo -e "${GREEN}[2/2] Starting Frontend (port 5173)...${NC}"
cd "$FRONTEND_DIR"
npm run dev -- --host > /tmp/stockarena-frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 3

# Verify frontend started
if ! curl -s http://localhost:5173 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Frontend starting (may take a moment)...${NC}"
fi
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

# Print summary
echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║        ✓ All Services Running         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}\n"

echo -e "${BLUE}Frontend:${NC}  http://localhost:5173"
echo -e "${BLUE}Backend:${NC}   http://localhost:8000"
echo -e "${BLUE}API Docs:${NC}  http://localhost:8000/docs\n"

echo -e "${YELLOW}Logs:${NC}"
echo -e "  Backend:  tail -f /tmp/stockarena-backend.log"
echo -e "  Frontend: tail -f /tmp/stockarena-frontend.log\n"

echo -e "${YELLOW}To stop:${NC} Press Ctrl+C\n"

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo -e "${GREEN}✓ Services stopped${NC}"
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Keep script running
wait
