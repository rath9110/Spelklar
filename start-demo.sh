#!/bin/bash

# Spelklar Demo Start Script
# This script starts both backend and frontend servers and seeds demo data

set -e

echo "🚀 Starting Spelklar Demo..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install it first."
    exit 1
fi

echo "${BLUE}📦 Installing backend dependencies...${NC}"
cd spelklar-server
npm install > /dev/null 2>&1 || true

echo "${GREEN}✓ Backend dependencies installed${NC}"

echo ""
echo "${BLUE}🌱 Seeding demo data...${NC}"
npm run seed

echo ""
echo "${BLUE}📦 Installing frontend dependencies...${NC}"
cd ../spelklar-client
npm install > /dev/null 2>&1 || true

echo "${GREEN}✓ Frontend dependencies installed${NC}"

echo ""
echo "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "${BLUE}🔧 Starting servers...${NC}"
echo ""
echo "📍 Backend will start on: http://localhost:3001"
echo "📍 Frontend will start on: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""
echo "${BLUE}Opening app in 3 seconds...${NC}"
sleep 3

# Start backend in background
cd ../spelklar-server
npm start &
BACKEND_PID=$!

# Give backend time to start
sleep 2

# Start frontend (foreground, so Ctrl+C stops both)
cd ../spelklar-client
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null || true

echo ""
echo "👋 Servers stopped"
