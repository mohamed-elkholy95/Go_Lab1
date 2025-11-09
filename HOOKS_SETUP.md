# Professional Git Hooks Setup Guide

This document explains the professional CI/CD and Git hooks setup for the Pythoughts platform, implementing modern DevSecOps best practices based on industry research and standards.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Git Hooks Details](#git-hooks-details)
- [CI/CD Pipeline](#cicd-pipeline)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Customization](#customization)

## Overview

This project implements a comprehensive quality and security automation strategy with multiple layers:

1. **Pre-Commit Hooks** - Fast local checks (10-30s)
2. **Pre-Push Hooks** - Comprehensive validation (1-3min)
3. **CI/CD Pipelines** - Cloud validation and deployment
4. **Security Scanning** - Continuous security monitoring

### Philosophy

Following the **Shift-Left** security principle and modern DevOps practices:

- **Catch issues early** - Pre-commit hooks catch 60% of issues
- **Fail fast** - Quick feedback loops
- **Comprehensive validation** - Multi-layer checks
- **Developer experience** - Clear messages, auto-fixes

## Quick Start

### First-Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Initialize Git hooks
npm run hooks:setup

# 3. Verify installation
git commit --allow-empty -m "test: verify hooks installation"
```

That's it! Hooks are now active.

### For Existing Developers

```bash
# Pull latest changes
git pull

# Update dependencies (includes new hooks)
npm install

# Hooks are automatically updated
```

## Architecture

### Local Development Flow

```
┌─────────────┐
│   Developer │
│    Writes   │
│    Code     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│        git commit                   │
├─────────────────────────────────────┤
│  Pre-Commit Hook (10-30s)          │
│  ✓ Secret scanning                  │
│  ✓ Lint staged files                │
│  ✓ Type check                       │
│  ✓ Format code                      │
│  ✓ Check file sizes                 │
└──────┬──────────────────────────────┘
       │ Pass
       ▼
┌─────────────────────────────────────┐
│      Commit Message Hook            │
│  ✓ Conventional commits format      │
└──────┬──────────────────────────────┘
       │ Pass
       ▼
┌─────────────────────────────────────┐
│        Local Commit Created         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│        git push                     │
├─────────────────────────────────────┤
│  Pre-Push Hook (1-3min)             │
│  ✓ All pre-commit checks            │
│  ✓ Run test suite                   │
│  ✓ Security audit                   │
│  ✓ Build verification               │
│  ✓ Bundle analysis                  │
│  ✓ Branch protection                │
└──────┬──────────────────────────────┘
       │ Pass
       ▼
┌─────────────────────────────────────┐
│      Push to Remote (GitHub)        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      CI/CD Pipeline                 │
│  • Parallel job execution           │
│  • Multi-environment testing        │
│  • Security scanning (CodeQL)       │
│  • DORA metrics tracking            │
│  • Automated deployment             │
└─────────────────────────────────────┘
```

## Git Hooks Details

### Pre-Commit Hook

**Location**: `.husky/pre-commit`

**Purpose**: Fast, essential checks on staged files only

**Checks Performed:**

1. **Secret Scanning**
   - Detects API keys, passwords, tokens
   - Prevents accidental secret commits
   - Tools: Pattern matching, secretlint (optional)

2. **Lint Staged Files** (via lint-staged)
   - Auto-formats code with Prettier
   - Runs on changed files only (fast!)
   - Fixes issues automatically when possible

3. **Type Checking**
   - TypeScript/Astro type validation
   - Catches type errors before commit
   - Fast incremental checking

4. **Common Issues Detection**
   - Warns about `console.log` statements
   - Detects `TODO`/`FIXME` comments
   - Blocks `debugger` statements

5. **File Size Check**
   - Prevents committing files > 5MB
   - Suggests Git LFS for large files
   - Protects repository size

**Performance:**
- Average duration: 10-30 seconds
- Only scans staged files
- Parallel execution where possible

**Example Output:**

```
🔍 Running pre-commit checks...
================================

[1/5] 🔐 Scanning for secrets...
[2/5] ✨ Formatting and linting staged files...
[3/5] 🔍 Type checking...
[4/5] 🔎 Checking for common issues...
[5/5] 📦 Checking file sizes...

================================
✅ All pre-commit checks passed!
   Ready to commit
```

### Pre-Push Hook

**Location**: `.husky/pre-push`

**Purpose**: Comprehensive validation before sharing code

**Checks Performed:**

1. **Code Quality**
   - Full project linting
   - Complete type checking
   - Ensures production-ready code

2. **Test Suite**
   - Runs all tests
   - Validates functionality
   - Prevents broken code in remote

3. **Security Scanning**
   - `npm audit` for vulnerabilities
   - Repository-wide secret detection
   - Dependency security check

4. **Build Verification**
   - Ensures code builds successfully
   - Validates all imports/exports
   - Catches build-time errors

5. **Bundle Analysis**
   - Analyzes build size
   - Warns if bundle too large
   - Suggests optimizations

6. **Branch Protection**
   - Warns about pushing to main/master
   - Checks if branch is up-to-date
   - Detects diverged branches

**Performance:**
- Average duration: 1-3 minutes
- Runs full validation
- Caches where possible

**Example Output:**

```
🚀 Running pre-push validation...
====================================
📍 Branch: feature/new-ui

[1/7] ✨ Code quality checks...
✓ Linting passed

[2/7] 🔍 Type checking...
✓ Type checking passed

[3/7] 🧪 Running tests...
✓ Tests passed

[4/7] 🔒 Security scanning...
  ✓ No high/critical vulnerabilities found
  ✓ No secrets detected

[5/7] 🏗️  Build verification...
✓ Build successful

[6/7] 📦 Bundle size analysis...
  Build size: 2.3M

[7/7] 🛡️  Branch protection checks...
✓ Branch is up to date with remote

====================================
📊 Pre-push validation summary
====================================
  Branch: feature/new-ui
  Duration: 87s

✅ All pre-push checks passed!
   Safe to push to remote
```

### Commit Message Hook

**Location**: `.husky/commit-msg`

**Purpose**: Enforce conventional commits format

**Format Required:**

```
type(scope): subject

Examples:
✓ feat(auth): add OAuth login support
✓ fix(api): resolve race condition in user creation
✓ docs: update README with setup instructions
✓ refactor(database): optimize query performance

✗ Added new feature  (invalid - no type)
✗ fix: bug          (invalid - subject too short)
```

**Valid Types:**

| Type | Purpose | Examples |
|------|---------|----------|
| `feat` | New feature | `feat(ui): add dark mode toggle` |
| `fix` | Bug fix | `fix(auth): handle expired tokens` |
| `docs` | Documentation | `docs: add API documentation` |
| `style` | Code formatting | `style: format with prettier` |
| `refactor` | Code restructuring | `refactor(api): extract validation logic` |
| `perf` | Performance | `perf(db): add query caching` |
| `test` | Tests | `test(auth): add login test cases` |
| `chore` | Maintenance | `chore: update dependencies` |
| `build` | Build system | `build: configure webpack` |
| `ci` | CI/CD | `ci: add security scanning` |
| `revert` | Revert commit | `revert: undo feature X` |

**Rules:**

- Subject must be 10-100 characters
- Type is required
- Scope is optional
- Subject should be imperative ("add" not "added")
- No period at end of subject

**Benefits:**

1. **Better Changelogs**
   - Auto-generate release notes
   - Group changes by type
   - Clear what changed

2. **Semantic Versioning**
   - `feat` → minor version bump
   - `fix` → patch version bump
   - `BREAKING CHANGE` → major version bump

3. **Searchable History**
   - Find all features: `git log --grep="^feat"`
   - Find all fixes: `git log --grep="^fix"`

## CI/CD Pipeline

The project includes professional GitHub Actions workflows:

### 1. CI Pipeline (`.github/workflows/ci.yml`)

**Triggers**: Push to main, develop, claude/** branches, Pull Requests

**Stages:**

1. **Lint** (5min timeout)
   - ESLint (if configured)
   - TypeScript checking
   - Fast fail strategy

2. **Test** (10min timeout)
   - Unit tests with Vitest
   - Coverage reporting
   - Parallel execution

3. **Build** (15min timeout)
   - Full application build
   - Artifact upload
   - Build verification

4. **Code Quality** (10min timeout)
   - Complexity analysis
   - TODO/FIXME detection
   - Code metrics

5. **Bundle Analysis** (5min timeout)
   - Size analysis
   - Performance insights
   - Optimization suggestions

**Concurrency**: Cancels in-progress runs for same workflow

**Caching**: NPM packages cached for speed

### 2. Security Pipeline (`.github/workflows/security.yml`)

**Triggers**: Push, Pull Requests, Daily at 2 AM UTC

**Scans:**

1. **Secret Scanning** (TruffleHog)
   - Full repository history
   - Verified secrets only
   - Prevents credential leaks

2. **Dependency Scanning** (npm audit)
   - Vulnerability detection
   - SBOM generation
   - License compliance

3. **SAST** (CodeQL + Semgrep)
   - Static code analysis
   - Security vulnerability detection
   - Code quality insights

4. **SBOM Generation** (CycloneDX)
   - Software Bill of Materials
   - Component tracking
   - Supply chain security

**Retention**: SBOM artifacts kept for 90 days

### 3. DORA Metrics (`.github/workflows/dora-metrics.yml`)

Tracks DevOps Research and Assessment (DORA) metrics:

- **Deployment Frequency**: How often code is deployed
- **Lead Time for Changes**: Time from commit to production
- **Change Failure Rate**: Percentage of deployments causing failures
- **Mean Time to Recovery**: Average time to fix production issues

**Goal**: Achieve Elite performer status

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| Deploy Frequency | Multiple/day | Weekly | Monthly | Yearly |
| Lead Time | < 1 hour | < 1 day | < 1 week | < 1 month |
| Change Failure Rate | 0-15% | 16-30% | 31-45% | > 45% |
| MTTR | < 1 hour | < 1 day | < 1 week | > 1 week |

## Best Practices

### DO ✅

1. **Let hooks run naturally**
   - Don't bypass unless absolutely necessary
   - Hooks are optimized for speed
   - They save time by catching issues early

2. **Write good commit messages**
   - Follow conventional commits
   - Be descriptive but concise
   - Explain why, not what

3. **Run validation before pushing**
   ```bash
   npm run validate  # Runs all checks locally
   ```

4. **Keep hooks updated**
   - Pull latest changes regularly
   - Run `npm install` after updates
   - Test hooks after changes

5. **Fix issues immediately**
   - Don't commit broken code
   - Address warnings
   - Ask for help if stuck

### DON'T ❌

1. **Don't bypass hooks regularly**
   ```bash
   # Avoid this unless emergency
   git commit --no-verify
   git push --no-verify
   ```

2. **Don't commit large files**
   - Use Git LFS for files > 5MB
   - Optimize images before committing
   - Consider cloud storage for assets

3. **Don't push to main/master directly**
   - Use feature branches
   - Create pull requests
   - Get code reviewed

4. **Don't ignore warnings**
   - Warnings often indicate real issues
   - Clean up TODOs regularly
   - Remove debug code

5. **Don't commit secrets**
   - Use environment variables
   - Use secret management tools
   - Never hardcode credentials

## Troubleshooting

### Hooks Not Running

**Symptom**: Commits succeed without running checks

**Solution**:
```bash
# Reinstall hooks
npm run hooks:setup

# Verify hooks are executable
ls -la .husky/
# Should show: -rwxr-xr-x (executable)

# If not executable:
chmod +x .husky/*
```

### Hooks Too Slow

**Symptom**: Pre-commit takes > 1 minute

**Check**:
```bash
# Run with timing
time git commit -m "test"

# Identify slow step from output
```

**Solutions**:
- Pre-commit only checks staged files (should be fast)
- If slow, check `npx astro check` performance
- Consider disabling some checks temporarily

### False Positives

**Symptom**: Hook fails but code is correct

**Examples**:
- Secret detection flags test data
- Lint errors on generated code

**Solutions**:

1. **Add to .gitignore** (generated files)
   ```
   dist/
   .astro/
   ```

2. **Add to .prettierignore** (don't format)
   ```
   public/
   *.min.js
   ```

3. **Use inline comments** (specific lines)
   ```typescript
   // eslint-disable-next-line
   const apiKey = 'test-key-for-development';
   ```

### Build Failures in Pre-Push

**Symptom**: Build succeeds locally but fails in pre-push hook

**Common Causes**:
- Missing environment variables
- Different Node version
- Dependency issues

**Debug**:
```bash
# Run build manually
npm run build

# Check Node version
node --version  # Should match CI (18.x)

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Customization

### Adding New Checks

Edit `.husky/pre-commit` or `.husky/pre-push`:

```bash
# Example: Add custom security check
echo "\n${BLUE}[X/X]${NC} 🔒 Custom security check..."
if ! ./scripts/custom-security.sh; then
    echo "${RED}❌ Custom security check failed!${NC}"
    FAILED=1
fi
```

### Disabling Specific Checks

Comment out sections you don't need:

```bash
# Disable console.log check
# if git diff --cached --name-only | xargs grep -n "console\.log"; then
#     echo "Warning: console.log detected"
# fi
```

### Changing Severity

Make warnings errors or errors warnings:

```bash
# Change from error to warning
if git diff --cached --name-only | xargs grep "TODO"; then
    echo "${YELLOW}⚠️  Warning: TODOs detected${NC}"
    # Don't set FAILED=1 (warning only)
fi
```

### Team-Specific Configuration

Create `.huskyrc` for team defaults:

```json
{
  "skipCI": false,
  "requireTests": true,
  "maxFileSize": 5242880
}
```

## Additional Resources

### Documentation

- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [DORA Metrics](https://dora.dev/)
- [DevSecOps](https://www.devsecops.org/)

### Tools

- **Prettier**: Code formatting
- **Astro Check**: TypeScript validation
- **Vitest**: Testing framework
- **TruffleHog**: Secret detection
- **CodeQL**: Security analysis

### CI/CD

- **GitHub Actions**: Workflow automation
- **Dependabot**: Automated dependency updates
- **CodeQL**: Advanced security scanning
- **Semgrep**: SAST scanning

## Support

### Getting Help

1. **Check this documentation** first
2. **Run manual validation**: `npm run validate`
3. **Check CI logs** on GitHub
4. **Ask the team** in #dev-help
5. **Create an issue** on GitHub

### Reporting Issues

When reporting hook issues, include:

```bash
# System info
node --version
npm --version
git --version

# Hook output
git commit -v  # Full output

# Hook content
cat .husky/pre-commit
```

## Changelog

### Version 1.0.0 (November 2025)

**Initial Release:**
- ✅ Pre-commit hook with secret scanning, linting, type checking
- ✅ Pre-push hook with tests, build, security validation
- ✅ Commit message validation with conventional commits
- ✅ CI/CD pipelines (CI, Security, DORA metrics)
- ✅ Comprehensive documentation
- ✅ Based on latest DevSecOps best practices

**Future Enhancements:**
- Integration with security scanning services
- Custom team-specific checks
- Performance optimizations
- AI-powered code review suggestions

---

**Maintained by**: Pythoughts Development Team
**Last Updated**: November 2025
**Version**: 1.0.0
**License**: Part of Pythoughts platform
