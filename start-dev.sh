#!/bin/bash

# QuickCourt Development Startup Script
echo "🏟️ Starting QuickCourt Development Environment..."

# Function to check if port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

# Check required ports
echo "🔍 Checking ports..."
if ! check_port 3000; then
    echo "❌ Frontend port 3000 is busy"
    exit 1
fi

if ! check_port 5000; then
    echo "❌ Backend port 5000 is busy"
    exit 1
fi

# Check if node_modules exist
echo "📦 Checking dependencies..."

if [ ! -d "backend/node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    cd frontend && npm install && cd ..
fi

# Check database connection
echo "🗄️ Checking database..."
cd backend
if ! npm run db:check > /dev/null 2>&1; then
    echo "⚠️  Database not accessible. Make sure PostgreSQL is running."
    echo "💡 Run 'npm run db:init' in backend folder to initialize."
fi
cd ..

echo "🚀 Starting servers..."

# Start backend in background
echo "🔧 Starting backend server on port 5000..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend in background
echo "⚛️ Starting frontend server on port 3000..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ QuickCourt is starting up!"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "📊 API Docs: http://localhost:5000/api/health"
echo ""
echo "👤 Test Accounts:"
echo "   Admin:  admin@quickcourt.com / admin123"
echo "   Owner:  owner@quickcourt.com / owner123"
echo "   User:   user@quickcourt.com / user123"
echo ""
echo "🛑 Press Ctrl+C to stop all servers"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servers stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for servers to run
wait
