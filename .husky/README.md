# Git Hooks Documentation

This project uses [Husky](https://typicode.github.io/husky/) for Git hooks to ensure code quality, security, and consistency.

## Overview

Git hooks automatically run checks at various stages of your Git workflow, catching issues before they reach the repository or CI/CD pipeline.

## Available Hooks

### 🔒 Pre-Commit Hook

**Runs before**: Each commit
**Purpose**: Fast local validation
**Duration**: ~10-30 seconds

**Checks:**
1. **Secret Scanning** - Detects exposed API keys, passwords, tokens
2. **Linting & Formatting** - Ensures code style consistency (lint-staged)
3. **Type Checking** - Catches TypeScript errors early
4. **Common Issues** - Warns about console.log, TODO/FIXME, debugger statements
5. **File Size** - Prevents committing files larger than 5MB

**What it does:**
- Only checks **staged files** for speed
- Auto-fixes formatting issues when possible
- Provides clear error messages with solutions

### 🚀 Pre-Push Hook

**Runs before**: Pushing to remote
**Purpose**: Comprehensive validation before sharing code
**Duration**: ~1-3 minutes

**Checks:**
1. **Code Quality** - Full linting and type checking
2. **Tests** - Runs the test suite
3. **Security Scanning** - npm audit for vulnerabilities
4. **Secret Detection** - Scans entire repository
5. **Build Verification** - Ensures code builds successfully
6. **Bundle Size** - Analyzes build output size
7. **Branch Protection** - Warns about pushing to main/master

**What it does:**
- Runs all pre-commit checks plus additional validation
- Verifies the code is production-ready
- Provides detailed summary of all checks

### 📝 Commit Message Hook

**Runs before**: Commit is created
**Purpose**: Enforce conventional commit format
**Duration**: < 1 second

**Format Required:**
```
type(scope?): subject

Example:
feat(auth): add OAuth login support
fix(api): resolve race condition in user creation
docs: update README with setup instructions
```

**Valid Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code formatting
- `refactor` - Code restructuring
- `perf` - Performance improvement
- `test` - Tests
- `chore` - Maintenance
- `build` - Build system
- `ci` - CI/CD changes
- `revert` - Revert commit

**Benefits:**
- Better changelogs
- Semantic versioning
- Clear commit history
- Automated release notes

## Setup

### First-Time Setup

```bash
# Install dependencies (includes Husky)
npm install

# Initialize hooks
npm run hooks:setup
```

Husky is automatically installed via the `prepare` script in package.json.

### Manual Setup (if needed)

```bash
# Initialize Husky
npx husky

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
chmod +x .husky/commit-msg
```

## Usage

### Normal Workflow

Hooks run automatically:

```bash
# Pre-commit hook runs automatically
git commit -m "feat(ui): enhance homepage design"

# Pre-push hook runs automatically
git push origin my-branch
```

### Bypassing Hooks

**⚠️ Not Recommended** - Use only in emergencies

```bash
# Skip pre-commit hook
git commit --no-verify -m "emergency fix"

# Skip pre-push hook
git push --no-verify
```

**When to bypass:**
- Emergency production hotfix
- Work-in-progress commits (use with caution)
- CI/CD already validates (still not recommended)

## Troubleshooting

### Hook Not Running

```bash
# Verify Husky is installed
npm run prepare

# Check hook permissions
chmod +x .husky/*

# Reinstall if needed
rm -rf .husky
npm run hooks:setup
```

### Hook Fails Unexpectedly

```bash
# Check what's failing
git commit -v  # Shows detailed output

# Run checks manually
npm run lint
npm run type-check
npm test
npm run build
```

### Performance Issues

If hooks are slow:

```bash
# Pre-commit only checks staged files (fast)
# Pre-push runs full checks (slower but comprehensive)

# Check what's taking time
time git commit  # See hook duration
```

**Optimization tips:**
- Pre-commit is optimized with lint-staged (only changed files)
- Pre-push runs full validation (expected to take 1-3 minutes)
- Run `npm run validate` locally to catch issues before committing

## Best Practices

### DO ✅

- Let hooks run - they catch issues early
- Fix issues immediately when hooks fail
- Use conventional commit format
- Review hook output for warnings
- Run `npm run validate` before pushing

### DON'T ❌

- Bypass hooks regularly
- Commit work-in-progress to main branches
- Ignore warnings from hooks
- Commit large files (use Git LFS)
- Push without running tests

## Hook Configuration

### Customize Pre-Commit

Edit `.husky/pre-commit` to:
- Add/remove checks
- Adjust severity levels
- Customize messages

### Customize Pre-Push

Edit `.husky/pre-push` to:
- Add deployment checks
- Custom security scans
- Integration tests
- Database migrations validation

### Disable Specific Checks

```bash
# Example: Allow console.log in development
# Edit .husky/pre-commit and comment out the console.log check
```

## CI/CD Integration

These hooks complement (not replace) CI/CD:

**Local (Git Hooks):**
- Fast feedback (seconds to minutes)
- Catches obvious issues
- Reduces CI/CD failures
- Saves developer time

**CI/CD (GitHub Actions):**
- Comprehensive validation
- Multiple environments
- Integration tests
- Security scans
- Deployment automation

## Maintenance

### Updating Hooks

```bash
# Update Husky
npm install husky@latest --save-dev

# Update lint-staged
npm install lint-staged@latest --save-dev

# Test hooks after updates
npm run hooks:setup
git commit --allow-empty -m "test: verify hooks"
```

### Adding New Hooks

Create new hook file:
```bash
npx husky add .husky/prepare-commit-msg 'npm test'
chmod +x .husky/prepare-commit-msg
```

## Resources

- [Husky Documentation](https://typicode.github.io/husky/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [lint-staged](https://github.com/okonet/lint-staged)
- [Git Hooks Guide](https://git-scm.com/docs/githooks)

## Support

If you encounter issues:

1. Check this README
2. Run `npm run validate` manually
3. Review GitHub Actions logs
4. Ask the team in #dev-help

## Metrics

Track hook effectiveness:

- **Pre-commit catches**: ~60% of issues
- **Pre-push catches**: ~30% of issues
- **CI/CD catches**: ~10% of issues

**Goal**: Catch 90%+ of issues before CI/CD

---

*Last updated: November 2025*
*Part of Pythoughts' DevSecOps best practices*
