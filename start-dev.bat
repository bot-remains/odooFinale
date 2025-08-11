@echo off
REM QuickCourt Development Startup Script for Windows

echo 🏟️ Starting QuickCourt Development Environment...

REM Check if ports are available
echo 🔍 Checking ports...
netstat -an | find "3000" | find "LISTENING" >nul
if %errorlevel% == 0 (
    echo ❌ Frontend port 3000 is already in use
    pause
    exit /b 1
)

netstat -an | find "5000" | find "LISTENING" >nul
if %errorlevel% == 0 (
    echo ❌ Backend port 5000 is already in use
    pause
    exit /b 1
)

REM Check dependencies
echo 📦 Checking dependencies...

if not exist "backend\node_modules" (
    echo 📥 Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo 📥 Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo 🚀 Starting servers...

REM Start backend
echo 🔧 Starting backend server on port 5000...
cd backend
start "QuickCourt Backend" cmd /k "npm start"
cd ..

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend
echo ⚛️ Starting frontend server on port 3000...
cd frontend
start "QuickCourt Frontend" cmd /k "npm run dev"
cd ..

echo.
echo ✅ QuickCourt is starting up!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:5000
echo 📊 API Docs: http://localhost:5000/api/health
echo.
echo 👤 Test Accounts:
echo    Admin:  admin@quickcourt.com / admin123
echo    Owner:  owner@quickcourt.com / owner123
echo    User:   user@quickcourt.com / user123
echo.
echo 🛑 Close the terminal windows to stop servers
echo.
pause
