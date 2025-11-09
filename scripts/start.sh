#!/bin/sh
set -e

echo "🚀 Starting Pythoughts Platform..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "Please configure DATABASE_URL in your Dokploy environment variables"
  echo "Example: postgresql://user:password@host:port/database"
  exit 1
fi

echo "✅ Database connection configured"

# Check if BETTER_AUTH_SECRET is set (optional but recommended)
if [ -z "$BETTER_AUTH_SECRET" ]; then
  echo "⚠️  WARNING: BETTER_AUTH_SECRET is not set"
  echo "Authentication may not work properly without this secret"
fi

# Push database schema (non-interactive)
echo "📊 Pushing database schema..."
if npm run db:push; then
  echo "✅ Database schema synchronized"
else
  echo "⚠️  Warning: Database schema push failed, but continuing..."
  echo "You may need to run migrations manually"
fi

# Start the server
echo "🌐 Starting Astro server..."
exec node dist/server/entry.mjs
