#!/bin/bash
###############################################################################
# Security Vulnerability Scanning
# Checks for known vulnerabilities in dependencies
###############################################################################

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "  → Scanning for security vulnerabilities..."

# Run npm audit with appropriate severity level
if npm audit --audit-level=high 2>&1 | tee /tmp/npm-audit.log; then
    echo "  ✓ No high/critical vulnerabilities found"
    exit 0
else
    echo "  ✗ Security vulnerabilities detected:"
    echo ""
    grep -A 5 "high\|critical" /tmp/npm-audit.log || true
    echo ""
    echo "  Run 'npm audit fix' to attempt automatic fixes"
    echo "  Or review with 'npm audit' for details"

    # Check if there are critical vulnerabilities
    if grep -q "critical" /tmp/npm-audit.log; then
        echo "  ✗ CRITICAL vulnerabilities found - blocking push"
        exit 1
    else
        echo "  ⚠ High severity vulnerabilities - consider fixing"
        exit 0  # Don't block on high, only critical
    fi
fi
