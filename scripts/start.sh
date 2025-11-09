#!/bin/sh
set -e

echo "🚀 Starting Pythoughts Platform..."
echo ""

# ============================================================================
# Environment Variable Validation
# ============================================================================

# Check DATABASE_URL
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo ""
  echo "Required format: postgresql://user:password@host:port/database"
  echo "Example: postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/pythoughts?sslmode=require"
  echo ""
  echo "Please configure this in Dokploy → Your App → Settings → Environment Variables"
  exit 1
fi

# Validate DATABASE_URL format
if ! echo "$DATABASE_URL" | grep -qE '^postgres(ql)?://'; then
  echo "❌ ERROR: DATABASE_URL must start with postgresql:// or postgres://"
  echo "Current value starts with: $(echo "$DATABASE_URL" | cut -d':' -f1)"
  exit 1
fi

echo "✅ Database connection configured"

# Check BETTER_AUTH_SECRET
if [ -z "$BETTER_AUTH_SECRET" ]; then
  echo "❌ ERROR: BETTER_AUTH_SECRET environment variable is not set"
  echo ""
  echo "Generate a secure secret with: openssl rand -base64 32"
  echo "Then add it to Dokploy → Your App → Settings → Environment Variables"
  exit 1
fi

echo "✅ Authentication secret configured"

# Check BETTER_AUTH_URL (required for better-auth)
if [ -z "$BETTER_AUTH_URL" ]; then
  echo "⚠️  WARNING: BETTER_AUTH_URL is not set"
  echo "Setting default to http://localhost:3000"
  echo "For production, set this to your domain: https://your-domain.com"
  export BETTER_AUTH_URL="http://localhost:3000"
else
  echo "✅ Authentication URL configured: $BETTER_AUTH_URL"
fi

echo ""

# ============================================================================
# Database Schema Migration
# ============================================================================

echo "📊 Synchronizing database schema..."
echo "   Using Drizzle Kit push with --force flag (non-interactive)"
echo ""

# Run drizzle push with error handling
if npm run db:push 2>&1; then
  echo ""
  echo "✅ Database schema synchronized successfully"
else
  PUSH_EXIT_CODE=$?
  echo ""
  echo "❌ ERROR: Database schema push failed with exit code: $PUSH_EXIT_CODE"
  echo ""
  echo "Common causes:"
  echo "  1. Database connection failed (check DATABASE_URL)"
  echo "  2. Database user lacks CREATE TABLE permissions"
  echo "  3. Network connectivity issues"
  echo "  4. Schema validation errors"
  echo ""
  echo "Check the error output above for details"
  exit $PUSH_EXIT_CODE
fi

echo ""

# ============================================================================
# Start Application Server
# ============================================================================

echo "🌐 Starting Astro server..."
echo "   Host: ${HOST:-0.0.0.0}"
echo "   Port: ${PORT:-3000}"
echo ""

# Use exec to replace shell with node process (proper signal handling)
exec node dist/server/entry.mjs
