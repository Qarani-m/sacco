#!/bin/bash
# Quick start script for Linux/Mac

set -e

echo "================================"
echo " SACCO Docker Setup"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "ERROR: Docker is not running!"
    echo "Please start Docker first."
    exit 1
fi

# Check if .env exists
if [ ! -f .env ]; then
    echo "Creating .env file from .env.example..."
    cp .env.example .env
    echo ""
    echo "IMPORTANT: Please update the .env file with your credentials!"
    echo ""
fi

echo "Starting SACCO application with Docker Compose..."
echo ""

docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "================================"
    echo " SUCCESS!"
    echo "================================"
    echo ""
    echo "Application is starting..."
    echo ""
    echo "Services:"
    echo " - Application: http://localhost:3000"
    echo " - Database:    localhost:5432"
    echo ""
    echo "To view logs:    docker-compose logs -f app"
    echo "To stop:         docker-compose down"
    echo "To seed data:    http://localhost:3000/auth/seed"
    echo ""
    echo "Waiting for services to be healthy..."
    sleep 10
    echo ""
    docker-compose ps
else
    echo ""
    echo "ERROR: Failed to start Docker containers!"
    echo "Check the logs with: docker-compose logs"
    exit 1
fi

echo ""
