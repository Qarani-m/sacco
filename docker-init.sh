#!/bin/sh
# Docker initialization script

echo "🚀 Starting SACCO Application..."

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Check if database needs initialization
echo "🔍 Checking database state..."

# Run migrations if needed
if [ -f "models/migrations/run_member_migration.js" ]; then
  echo "🔄 Running database migrations..."
  node models/migrations/run_member_migration.js || echo "⚠️  Migration warning (may already be applied)"
fi

# Build Tailwind CSS
if [ "$NODE_ENV" != "production" ]; then
  echo "🎨 Building Tailwind CSS..."
  npm run build
fi

echo "✅ Initialization complete!"

# Start the application
echo "🚀 Starting Node.js application..."
exec "$@"
