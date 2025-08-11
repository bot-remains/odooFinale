@echo off
REM QuickCourt Startup Script for Windows
echo 🚀 Starting QuickCourt Application...
echo ======================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js v18 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo 📦 Installing dependencies...

REM Install backend dependencies
echo 🔧 Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

REM Install frontend dependencies
echo 🎨 Installing frontend dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

cd ..

echo ✅ Dependencies installed successfully!

REM Setup database
echo 🗄️ Setting up database...
cd backend
call npm run prisma:generate
if %ERRORLEVEL% neq 0 (
    echo ❌ Failed to generate Prisma client
    pause
    exit /b 1
)

call npm run prisma:push
if %ERRORLEVEL% neq 0 (
    echo ⚠️ Database push failed. Please check your database connection.
    echo Make sure PostgreSQL is running and DATABASE_URL is correct in .env
    pause
    exit /b 1
)

call npm run init-db
if %ERRORLEVEL% neq 0 (
    echo ⚠️ Database initialization failed, but you can continue
    echo You may need to run 'npm run init-db' manually later
)

cd ..

echo ✅ Database setup completed!

echo 🎯 Starting development servers...
echo Backend will run on: http://localhost:3000
echo Frontend will run on: http://localhost:8081
echo.
echo Press Ctrl+C to stop both servers
echo ======================================

REM Start both servers using concurrently
call npm run dev

pause
