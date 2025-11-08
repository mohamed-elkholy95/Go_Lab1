#!/bin/bash
###############################################################################
# TypeScript Type Checking Validation
# Ensures all TypeScript code is properly typed with no errors
###############################################################################

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "  → Running Astro type checking..."

# Run Astro check which validates TypeScript
if npx astro check 2>&1 | tee /tmp/astro-check.log; then
    echo "  ✓ TypeScript validation successful"
    exit 0
else
    echo "  ✗ TypeScript errors found:"
    cat /tmp/astro-check.log
    echo ""
    echo "  Fix type errors before pushing"
    exit 1
fi
