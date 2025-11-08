#!/bin/bash
###############################################################################
# Dependency Health Check
# Validates package.json and checks for outdated packages
###############################################################################

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "  → Checking dependency health..."

# Validate package.json
if ! node -e "require('./package.json')" 2>&1; then
    echo "  ✗ Invalid package.json"
    exit 1
fi

# Check for missing dependencies
echo "  → Verifying all dependencies are installed..."
if npm ls --depth=0 2>&1 > /tmp/npm-ls.log; then
    echo "  ✓ All dependencies satisfied"
else
    # Check if there are missing dependencies (not peer dependency warnings)
    if grep -q "UNMET DEPENDENCY" /tmp/npm-ls.log; then
        echo "  ✗ Missing dependencies found:"
        grep "UNMET DEPENDENCY" /tmp/npm-ls.log
        echo ""
        echo "  Run 'npm install' to fix"
        exit 1
    else
        echo "  ✓ Dependencies OK (peer dependency warnings ignored)"
    fi
fi

# Check for critically outdated packages
echo "  → Checking for outdated packages..."
if npm outdated 2>&1 | tee /tmp/npm-outdated.log; then
    echo "  ✓ All packages up to date"
else
    # Show outdated packages but don't fail (informational only)
    echo "  ⚠ Some packages have updates available:"
    head -n 10 /tmp/npm-outdated.log || true
    echo ""
    echo "  Consider running 'npm update' (not blocking push)"
fi

exit 0
