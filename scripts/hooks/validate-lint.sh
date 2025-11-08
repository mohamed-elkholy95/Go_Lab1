#!/bin/bash
###############################################################################
# ESLint Code Quality Validation
# Ensures code follows linting rules and best practices
###############################################################################

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "  → Checking code quality with ESLint..."

# Check if there's a lint script in package.json
if grep -q '"lint"' package.json; then
    if npm run lint 2>&1; then
        echo "  ✓ Linting passed"
        exit 0
    else
        echo "  ✗ Linting errors found"
        echo "  Run 'npm run lint' to see details"
        exit 1
    fi
else
    # Try running eslint directly
    if command -v eslint &> /dev/null; then
        if npx eslint src/ --ext .ts,.tsx,.astro --max-warnings 0 2>&1; then
            echo "  ✓ Linting passed"
            exit 0
        else
            echo "  ✗ Linting errors found"
            exit 1
        fi
    else
        echo "  ⚠ No linting configuration found - skipping"
        exit 0
    fi
fi
