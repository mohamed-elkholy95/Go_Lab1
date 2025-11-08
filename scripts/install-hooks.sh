#!/bin/bash
###############################################################################
# Git Hooks Installation Script
# Installs and configures pre-push validation hooks
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║              Git Hooks Installation Script                       ║${NC}"
echo -e "${CYAN}║         Installing Pre-Push Validation Hooks                     ║${NC}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Get repository root
REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$REPO_ROOT" ]; then
    echo -e "${RED}✗${NC} Error: Not in a git repository"
    exit 1
fi

echo -e "${BLUE}Repository:${NC} $REPO_ROOT"
echo ""

# Create hooks directory if it doesn't exist
HOOKS_DIR="$REPO_ROOT/.git/hooks"
mkdir -p "$HOOKS_DIR"

# Source hooks directory
SOURCE_HOOKS_DIR="$REPO_ROOT/scripts/hooks"

if [ ! -d "$SOURCE_HOOKS_DIR" ]; then
    echo -e "${RED}✗${NC} Error: Validation scripts not found at $SOURCE_HOOKS_DIR"
    exit 1
fi

# Install pre-push hook
echo -e "${BLUE}▶${NC} Installing pre-push hook..."

if [ -f "$HOOKS_DIR/pre-push" ]; then
    # Backup existing hook
    BACKUP_FILE="$HOOKS_DIR/pre-push.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}  ⚠${NC} Existing pre-push hook found, backing up to: $BACKUP_FILE"
    cp "$HOOKS_DIR/pre-push" "$BACKUP_FILE"
fi

# The pre-push hook is already in .git/hooks, but let's ensure it's executable
chmod +x "$HOOKS_DIR/pre-push"

echo -e "${GREEN}  ✓${NC} Pre-push hook installed"

# Make all validation scripts executable
echo ""
echo -e "${BLUE}▶${NC} Setting up validation scripts..."

for script in "$SOURCE_HOOKS_DIR"/*.sh; do
    if [ -f "$script" ]; then
        chmod +x "$script"
        SCRIPT_NAME=$(basename "$script")
        echo -e "${GREEN}  ✓${NC} $SCRIPT_NAME configured"
    fi
done

# Create configuration file if it doesn't exist
CONFIG_FILE="$REPO_ROOT/.githooks.config"

if [ ! -f "$CONFIG_FILE" ]; then
    echo ""
    echo -e "${BLUE}▶${NC} Creating default configuration..."

    cat > "$CONFIG_FILE" << 'EOF'
# Git Hooks Configuration
# Enable/disable specific validation checks

# TypeScript type checking
ENABLE_TYPESCRIPT_CHECK=true

# ESLint code quality
ENABLE_LINT_CHECK=true

# Security vulnerability scanning
ENABLE_SECURITY_CHECK=true

# Build validation
ENABLE_BUILD_CHECK=true

# Dependency health check
ENABLE_DEPENDENCY_CHECK=true

# Unit tests
ENABLE_TEST_CHECK=true

# Secret detection
ENABLE_SECRET_CHECK=true

# Code complexity analysis
ENABLE_COMPLEXITY_CHECK=true

# Fail on warnings (set to false to only fail on errors)
FAIL_ON_WARNINGS=false

# Skip hook with --no-verify (set to true to allow skipping)
ALLOW_SKIP=true
EOF

    echo -e "${GREEN}  ✓${NC} Configuration created at $CONFIG_FILE"
    echo -e "      Edit this file to customize validation checks"
fi

# Success message
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✓ INSTALLATION COMPLETE ✓                    ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}Installed Validations:${NC}"
echo -e "  ✓ TypeScript Type Checking"
echo -e "  ✓ ESLint Code Quality"
echo -e "  ✓ Security Vulnerability Scanning"
echo -e "  ✓ Build Validation"
echo -e "  ✓ Dependency Health Check"
echo -e "  ✓ Unit Tests"
echo -e "  ✓ Secret Detection"
echo -e "  ✓ Code Complexity Analysis"
echo ""

echo -e "${CYAN}Next Steps:${NC}"
echo -e "  1. Review configuration: ${YELLOW}.githooks.config${NC}"
echo -e "  2. Test the hook: ${YELLOW}git push --dry-run${NC}"
echo -e "  3. Make changes and commit/push normally"
echo ""

echo -e "${CYAN}Notes:${NC}"
echo -e "  • Hooks run automatically before every push"
echo -e "  • Failed checks will prevent push"
echo -e "  • To skip (not recommended): ${YELLOW}git push --no-verify${NC}"
echo -e "  • To reinstall: ${YELLOW}./scripts/install-hooks.sh${NC}"
echo ""
