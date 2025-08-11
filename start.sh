#!/bin/bash

# QuickCourt Startup Script
echo "🚀 Starting QuickCourt Application..."
echo "======================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "📦 Installing dependencies..."

# Install backend dependencies
echo "🔧 Installing backend dependencies..."
cd backend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install backend dependencies"
    exit 1
fi

# Install frontend dependencies
echo "🎨 Installing frontend dependencies..."
cd ../frontend && npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install frontend dependencies"
    exit 1
fi

cd ..

echo "✅ Dependencies installed successfully!"

# Setup database
echo "🗄️ Setting up database..."
cd backend
npm run prisma:generate
if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

npm run prisma:push
if [ $? -ne 0 ]; then
    echo "⚠️ Database push failed. Please check your database connection."
    echo "Make sure PostgreSQL is running and DATABASE_URL is correct in .env"
    exit 1
fi

npm run init-db
if [ $? -ne 0 ]; then
    echo "⚠️ Database initialization failed, but you can continue"
    echo "You may need to run 'npm run init-db' manually later"
fi

cd ..

echo "✅ Database setup completed!"

echo "🎯 Starting development servers..."
echo "Backend will run on: http://localhost:3000"
echo "Frontend will run on: http://localhost:8081"
echo ""
echo "Press Ctrl+C to stop both servers"
echo "======================================"

# Start both servers using concurrently
npm run dev
