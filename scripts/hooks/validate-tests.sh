#!/bin/bash
###############################################################################
# Unit Tests Validation
# Runs test suite if configured
###############################################################################

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "  → Running unit tests..."

# Check if test script exists
if grep -q '"test"' package.json; then
    # Check if it's not just a placeholder
    TEST_SCRIPT=$(node -p "require('./package.json').scripts.test")

    if [[ "$TEST_SCRIPT" == *"no test specified"* ]]; then
        echo "  ⚠ No tests configured - skipping"
        exit 0
    fi

    # Run tests
    if npm test 2>&1 | tee /tmp/test.log; then
        echo "  ✓ All tests passed"
        exit 0
    else
        echo "  ✗ Tests failed:"
        tail -n 30 /tmp/test.log
        echo ""
        echo "  Fix failing tests before pushing"
        exit 1
    fi
else
    echo "  ⚠ No test script found - skipping"
    exit 0
fi
