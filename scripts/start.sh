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

# Check RESEND_API_KEY (required for email verification)
if [ -z "$RESEND_API_KEY" ]; then
  echo "⚠️  WARNING: RESEND_API_KEY is not set"
  echo ""
  echo "Email verification will NOT work without Resend API key"
  echo "Get your API key from: https://resend.com/api-keys"
  echo "Then add RESEND_API_KEY to Dokploy → Your App → Settings → Environment Variables"
  echo ""
  echo "Application will start, but users won't receive verification emails"
  echo ""
else
  echo "✅ Email service configured (Resend)"
fi

# Check RESEND_FROM_EMAIL (recommended for email verification)
if [ -z "$RESEND_FROM_EMAIL" ]; then
  echo "⚠️  WARNING: RESEND_FROM_EMAIL is not set"
  echo "Using default: noreply@pythoughts.com"
  echo "For production, set a verified sending domain in Resend"
else
  echo "✅ Email sender configured: $RESEND_FROM_EMAIL"
fi

echo ""

# ============================================================================
# Database Schema Migration
# ============================================================================

echo "📊 Running professional database migration handler..."
echo "   This will validate, migrate, and verify the database schema"
echo ""

# Run professional migration handler with comprehensive logging
if npm run db:migrate:pro; then
  echo ""
  echo "✅ Migration handler completed successfully"
else
  MIGRATION_EXIT_CODE=$?
  echo ""
  echo "❌ ERROR: Migration handler failed with exit code: $MIGRATION_EXIT_CODE"
  echo ""
  echo "The migration handler provides detailed error messages above."
  echo "Please review the output and fix any issues before restarting."
  exit $MIGRATION_EXIT_CODE
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
