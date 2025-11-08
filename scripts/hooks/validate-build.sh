#!/bin/bash
###############################################################################
# Build Validation
# Ensures the project builds successfully
###############################################################################

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "  → Validating build..."

# Set mock environment variables for build
export DATABASE_URL="postgresql://user:pass@localhost:5432/test"
export AUTH_SECRET="test-secret-key-min-32-characters-long-for-build-validation"
export RESEND_API_KEY="re_test_key"
export RESEND_FROM_EMAIL="noreply@test.com"
export SITE_URL="http://localhost:4321"
export PUBLIC_SITE_NAME="Pythoughts"

# Run build
if npm run build 2>&1 | tee /tmp/build.log; then
    echo "  ✓ Build successful"

    # Clean up build artifacts (optional)
    if [ -d "$REPO_ROOT/dist" ]; then
        echo "  → Cleaning build artifacts..."
        rm -rf "$REPO_ROOT/dist"
    fi

    exit 0
else
    echo "  ✗ Build failed:"
    tail -n 20 /tmp/build.log
    echo ""
    echo "  Fix build errors before pushing"
    exit 1
fi
