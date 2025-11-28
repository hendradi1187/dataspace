@echo off
REM Production Docker Compose Start Script for Windows
REM Usage: start-docker-production.bat [start|stop|restart|logs|ps|down|pull]

setlocal enabledelayedexpansion

set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%
set DOCKER_DIR=%PROJECT_ROOT%infra\docker
set ENV_FILE=%PROJECT_ROOT%.env.docker-compose

echo ==================================================
echo Dataspace Production Docker Compose Manager
echo ==================================================
echo Project Root: %PROJECT_ROOT%
echo Docker Dir: %DOCKER_DIR%
echo Environment File: %ENV_FILE%
echo.

REM Check if .env.docker-compose exists
if not exist "%ENV_FILE%" (
    echo ERROR: Environment file not found: %ENV_FILE%
    exit /b 1
)

REM Check if docker-compose.production.yml exists
if not exist "%DOCKER_DIR%\docker-compose.production.yml" (
    echo ERROR: docker-compose.production.yml not found at: %DOCKER_DIR%\docker-compose.production.yml
    exit /b 1
)

REM Get command from argument or default to 'start'
set COMMAND=%1
if "%COMMAND%"=="" set COMMAND=start

REM Change to docker directory
cd /d "%DOCKER_DIR%"

if "%COMMAND%"=="start" (
    echo 📦 Starting all services with Docker Compose...
    echo ⏳ This may take 5-10 minutes on first run...
    echo.
    docker-compose -f docker-compose.production.yml ^
        --env-file "%ENV_FILE%" ^
        up --build -d
    echo.
    echo ✅ Services started in background
    echo 📊 Check status: %SCRIPT_DIR%start-docker-production.bat ps
    echo 📋 View logs: %SCRIPT_DIR%start-docker-production.bat logs [service_name]
    goto :eof
)

if "%COMMAND%"=="stop" (
    echo 🛑 Stopping all services...
    docker-compose -f docker-compose.production.yml ^
        --env-file "%ENV_FILE%" ^
        stop
    echo ✅ All services stopped
    goto :eof
)

if "%COMMAND%"=="restart" (
    echo 🔄 Restarting all services...
    docker-compose -f docker-compose.production.yml ^
        --env-file "%ENV_FILE%" ^
        restart
    echo ✅ Services restarted
    goto :eof
)

if "%COMMAND%"=="down" (
    echo 💥 Stopping and removing all containers...
    echo ⚠️  WARNING: Data in volumes will be preserved
    docker-compose -f docker-compose.production.yml ^
        --env-file "%ENV_FILE%" ^
        down
    echo ✅ All containers removed
    goto :eof
)

if "%COMMAND%"=="logs" (
    set SERVICE=%2
    if not "!SERVICE!"=="" (
        echo 📋 Logs for service: !SERVICE!
        docker-compose -f docker-compose.production.yml ^
            --env-file "%ENV_FILE%" ^
            logs -f --tail=100 !SERVICE!
    ) else (
        echo 📋 All logs (press Ctrl+C to stop)...
        docker-compose -f docker-compose.production.yml ^
            --env-file "%ENV_FILE%" ^
            logs -f --tail=50
    )
    goto :eof
)

if "%COMMAND%"=="ps" (
    echo 📊 Container Status:
    echo.
    docker-compose -f docker-compose.production.yml ^
        --env-file "%ENV_FILE%" ^
        ps
    goto :eof
)

if "%COMMAND%"=="pull" (
    echo 🔄 Pulling latest images...
    docker-compose -f docker-compose.production.yml ^
        --env-file "%ENV_FILE%" ^
        pull
    echo ✅ Images updated
    goto :eof
)

if "%COMMAND%"=="health" (
    echo 🏥 Health Check Status:
    echo.
    docker-compose -f docker-compose.production.yml ^
        --env-file "%ENV_FILE%" ^
        ps
    goto :eof
)

if "%COMMAND%"=="clean" (
    echo 🧹 Cleaning up Docker resources...
    docker system prune -f --volumes
    echo ✅ Cleanup complete
    goto :eof
)

REM Default: show help
echo Usage: %0 [start^|stop^|restart^|down^|logs^|ps^|pull^|health^|clean]
echo.
echo Commands:
echo   start       - Start all services in background
echo   stop        - Stop all services (keep containers)
echo   restart     - Restart all services
echo   down        - Stop and remove all containers
echo   logs [svc]  - View logs (optional: specify service name)
echo   ps          - Show container status
echo   pull        - Pull latest images
echo   health      - Check health status
echo   clean       - Clean unused Docker resources
echo.
echo Examples:
echo   %0 start                    # Start all services
echo   %0 logs idp                 # View IDP service logs
echo   %0 logs postgres            # View database logs
echo   %0 ps                       # Show all containers
exit /b 1
