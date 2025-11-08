#!/bin/bash
###############################################################################
# Code Complexity Analysis
# Checks for overly complex code that might need refactoring
###############################################################################

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "  → Analyzing code complexity..."

# Check for very long files
echo "  → Checking file lengths..."
LONG_FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.astro" \) -exec wc -l {} \; | awk '$1 > 500 {print}' || true)

if [ -n "$LONG_FILES" ]; then
    echo "  ⚠ Files longer than 500 lines (consider splitting):"
    echo "$LONG_FILES" | head -5
    echo ""
fi

# Check for TODO/FIXME comments in staged files
echo "  → Checking for TODO/FIXME markers..."
STAGED_FILES=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|astro)$' || true)

if [ -n "$STAGED_FILES" ]; then
    TODO_COUNT=$(grep -r "TODO\|FIXME" $STAGED_FILES 2>/dev/null | wc -l || echo "0")

    if [ "$TODO_COUNT" -gt 0 ]; then
        echo "  ⚠ Found $TODO_COUNT TODO/FIXME comments in staged files"
        grep -n "TODO\|FIXME" $STAGED_FILES 2>/dev/null | head -10 || true
        echo "  Consider addressing before pushing"
        echo ""
    fi
fi

# Check for console.log statements (often left by mistake)
echo "  → Checking for console.log statements..."
if [ -n "$STAGED_FILES" ]; then
    CONSOLE_LOGS=$(grep -r "console\.log" $STAGED_FILES 2>/dev/null || true)

    if [ -n "$CONSOLE_LOGS" ]; then
        echo "  ⚠ Found console.log statements:"
        echo "$CONSOLE_LOGS" | head -10
        echo "  Consider removing debug logs before pushing"
        echo ""
    fi
fi

# All checks are informational, don't block push
echo "  ✓ Complexity analysis complete"
exit 0
