#!/bin/bash

# Setup Test Database Script
# This script creates and configures the test database

set -e

echo "🔧 Setting up test database..."

# Configuration
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
TEST_DB_NAME="${TEST_DB_NAME:-sacco_test}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo "📡 Checking PostgreSQL connection..."
if ! pg_isready -h $DB_HOST -p $DB_PORT > /dev/null 2>&1; then
    echo -e "${RED}❌ PostgreSQL is not running or not accessible${NC}"
    echo "Please start PostgreSQL and try again"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Drop existing test database if it exists
echo "🗑️  Dropping existing test database (if exists)..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -tc "SELECT 1 FROM pg_database WHERE datname = '$TEST_DB_NAME'" | grep -q 1 && \
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "DROP DATABASE $TEST_DB_NAME;" || true

# Create test database
echo "🏗️  Creating test database..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE $TEST_DB_NAME;"

echo -e "${GREEN}✅ Test database created: $TEST_DB_NAME${NC}"

# Run migrations
echo "📦 Running migrations..."

# RBAC Schema
echo "  - RBAC schema..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TEST_DB_NAME < src/models/migrations/rbac_schema.sql

# Approval Workflow Schema
echo "  - Approval workflow schema..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TEST_DB_NAME < src/models/migrations/approval_workflow_schema.sql

echo -e "${GREEN}✅ Migrations completed${NC}"

# Verify setup
echo "🔍 Verifying setup..."
TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $TEST_DB_NAME -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")

if [ $TABLE_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Setup verified: $TABLE_COUNT tables created${NC}"
else
    echo -e "${RED}❌ Setup verification failed: No tables found${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Test database setup complete!${NC}"
echo ""
echo "Database details:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $TEST_DB_NAME"
echo "  User: $DB_USER"
echo ""
echo "You can now run tests with: npm test"
