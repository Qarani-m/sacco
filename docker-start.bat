@echo off
REM Quick start script for Windows

echo ================================
echo  SACCO Docker Setup
echo ================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running!
    echo Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo.
    echo IMPORTANT: Please update the .env file with your credentials!
    echo.
)

echo Starting SACCO application with Docker Compose...
echo.

docker-compose up -d --build

if %errorlevel% equ 0 (
    echo.
    echo ================================
    echo  SUCCESS!
    echo ================================
    echo.
    echo Application is starting...
    echo.
    echo Services:
    echo  - Application: http://localhost:3000
    echo  - Database:    localhost:5432
    echo.
    echo To view logs:    docker-compose logs -f app
    echo To stop:         docker-compose down
    echo To seed data:    http://localhost:3000/auth/seed
    echo.
    echo Waiting for services to be healthy...
    timeout /t 10 >nul
    echo.
    docker-compose ps
) else (
    echo.
    echo ERROR: Failed to start Docker containers!
    echo Check the logs with: docker-compose logs
)

echo.
pause
