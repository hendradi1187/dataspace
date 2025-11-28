@echo off
REM Full Stack Docker Compose Startup Script for Windows
REM Starts all services including Frontend on Port 5174

setlocal enabledelayedexpansion

set "SCRIPT_DIR=%cd%"
set "DOCKER_DIR=%SCRIPT_DIR%\infra\docker"

REM Colors (using ANSI codes)
for /F %%A in ('echo prompt $H ^| cmd') do set "BS=%%A"

cls
echo.
echo ===============================================================
echo         Full Stack Docker Compose - Windows Startup
echo ===============================================================
echo.

REM Check prerequisites
echo Checking prerequisites...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not installed
    exit /b 1
)
echo [OK] Docker is installed

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker Compose is not installed
    exit /b 1
)
echo [OK] Docker Compose is installed

if not exist "%DOCKER_DIR%\docker-compose.yml" (
    echo ERROR: docker-compose.yml not found
    exit /b 1
)
echo [OK] docker-compose.yml found

if not exist "%SCRIPT_DIR%\.env.docker-compose" (
    echo Creating .env.docker-compose...
    if exist "%SCRIPT_DIR%\.env.production" (
        copy "%SCRIPT_DIR%\.env.production" "%SCRIPT_DIR%\.env.docker-compose" >nul
        echo [OK] .env.docker-compose created
    )
)

echo.
echo ===============================================================
echo         Stopping Existing Containers
echo ===============================================================
echo.

cd /d "%DOCKER_DIR%"
docker-compose -f docker-compose.yml down 2>nul
timeout /t 2 /nobreak >nul

echo.
echo ===============================================================
echo         Building Docker Images
echo ===============================================================
echo.
echo This may take 5-10 minutes on first build...
echo.

docker-compose ^
    -f docker-compose.yml ^
    --env-file "..\..\env.docker-compose" ^
    build --no-cache

if %errorlevel% neq 0 (
    echo ERROR: Failed to build images
    exit /b 1
)

echo.
echo ===============================================================
echo         Starting Services
echo ===============================================================
echo.

docker-compose ^
    -f docker-compose.yml ^
    --env-file "..\..\env.docker-compose" ^
    up -d

if %errorlevel% neq 0 (
    echo ERROR: Failed to start services
    exit /b 1
)

echo [OK] Services started

echo.
echo ===============================================================
echo         Waiting for Services to be Ready
echo ===============================================================
echo.

timeout /t 10 /nobreak

echo.
echo ===============================================================
echo         Service Status
echo ===============================================================
echo.

docker-compose -f docker-compose.yml ps

echo.
echo ===============================================================
echo         ACCESS INFORMATION
echo ===============================================================
echo.

echo Frontend:
echo   http://localhost:5174
echo.

echo Microservices:
echo   IDP:        http://localhost:3000
echo   Broker:     http://localhost:3001
echo   Hub:        http://localhost:3002
echo   Policy:     http://localhost:3003
echo   Contract:   http://localhost:3004
echo   Compliance: http://localhost:3005
echo   Ledger:     http://localhost:3006
echo   Clearing:   http://localhost:3007
echo   AppStore:   http://localhost:3008
echo   Connector:  http://localhost:3009
echo.

echo Infrastructure:
echo   PostgreSQL: localhost:5432
echo   Redis:      localhost:6379
echo   Kafka:      localhost:9092
echo   Adminer:    http://localhost:8080
echo.

echo Credentials:
echo   DB User:     postgres
echo   DB Password: postgres
echo.

echo ===============================================================
echo         Testing Connectivity
echo ===============================================================
echo.

echo Testing Frontend...
curl -s http://localhost:5174 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Frontend is accessible
) else (
    echo [WAIT] Frontend still starting, check browser in a moment
)

echo.
echo ===============================================================
echo         SUCCESS!
echo ===============================================================
echo.
echo Full stack is running! Open http://localhost:5174 in your browser
echo.
echo To view logs:
echo   docker-compose -f infra\docker\docker-compose.yml logs -f
echo.
echo To stop services:
echo   docker-compose -f infra\docker\docker-compose.yml down
echo.

endlocal
pause
