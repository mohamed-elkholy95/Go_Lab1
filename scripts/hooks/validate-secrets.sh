#!/bin/bash
###############################################################################
# Secret Detection
# Scans for accidentally committed secrets and sensitive data
###############################################################################

set -e

REPO_ROOT=$(git rev-parse --show-toplevel)
cd "$REPO_ROOT"

echo "  → Scanning for secrets..."

# Patterns to detect
SECRET_PATTERNS=(
    'password\s*=\s*["\047][^"\047]+["\047]'
    'api[_-]?key\s*=\s*["\047][^"\047]+["\047]'
    'secret\s*=\s*["\047][^"\047]+["\047]'
    'token\s*=\s*["\047][^"\047]+["\047]'
    'private[_-]?key'
    'sk-[a-zA-Z0-9]{32,}'
    'ghp_[a-zA-Z0-9]{36}'
    'AKIA[0-9A-Z]{16}'
    'postgresql://[^@]+:[^@]+@'
)

# Files to check (staged for commit)
FILES_TO_CHECK=$(git diff --cached --name-only --diff-filter=ACM | grep -E '\.(ts|tsx|js|jsx|astro|env|json|yml|yaml)$' || true)

if [ -z "$FILES_TO_CHECK" ]; then
    echo "  → No relevant files to scan"
    exit 0
fi

SECRETS_FOUND=0

echo "  → Scanning ${FILES_TO_CHECK} files..."

for file in $FILES_TO_CHECK; do
    # Skip if file doesn't exist (might be deleted)
    if [ ! -f "$file" ]; then
        continue
    fi

    # Skip .env.example files
    if [[ "$file" == *".env.example"* ]]; then
        continue
    fi

    # Check for secret patterns
    for pattern in "${SECRET_PATTERNS[@]}"; do
        if grep -i -E "$pattern" "$file" > /dev/null 2>&1; then
            if [ $SECRETS_FOUND -eq 0 ]; then
                echo ""
                echo "  ✗ Potential secrets detected:"
                echo ""
            fi

            echo "  File: $file"
            grep -n -i -E "$pattern" "$file" | head -3
            echo ""
            SECRETS_FOUND=1
        fi
    done
done

if [ $SECRETS_FOUND -eq 1 ]; then
    echo "  ✗ Potential secrets found in code"
    echo "  Please review the files above and remove any sensitive data"
    echo "  Use environment variables instead"
    exit 1
fi

echo "  ✓ No secrets detected"
exit 0
