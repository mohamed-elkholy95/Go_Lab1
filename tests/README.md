# Testing Documentation

## Overview

This project uses **Vitest** for unit testing. Tests ensure code quality, catch bugs early, and serve as living documentation.

## Running Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on changes)
npm run test:watch

# Run tests with UI (interactive browser interface)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── validations/          # Schema and utility function tests
│   ├── posts.test.ts     # Post validation tests
│   └── comments.test.ts  # Comment validation tests
├── services/             # Service layer tests (add your tests here)
└── README.md             # This file
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should do something specific', () => {
    const result = yourFunction(input);
    expect(result).toBe(expectedOutput);
  });
});
```

### Test Organization

- **describe()** - Group related tests
- **it()** - Individual test case
- **expect()** - Assertion

### Common Assertions

```typescript
// Equality
expect(value).toBe(5);              // Strict equality
expect(value).toEqual({a: 1});      // Deep equality

// Truthiness
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();

// Numbers
expect(value).toBeGreaterThan(3);
expect(value).toBeLessThan(10);

// Strings
expect(string).toContain('substring');
expect(string).toMatch(/regex/);

// Arrays
expect(array).toHaveLength(3);
expect(array).toContain(item);

// Exceptions
expect(() => fn()).toThrow();
expect(() => fn()).toThrow('error message');
```

## Test Coverage

Aim for:
- **> 80%** overall coverage
- **100%** for critical paths (auth, payments, data integrity)
- **100%** for utility functions

View coverage report:
```bash
npm run test:coverage
# Opens coverage/index.html in browser
```

## Best Practices

### ✅ DO

- Write tests for all validation schemas
- Test edge cases (empty, null, max values)
- Test error conditions
- Keep tests simple and focused
- Use descriptive test names
- Mock external dependencies (database, APIs)

### ❌ DON'T

- Test implementation details
- Write tests that depend on each other
- Use real database in unit tests
- Test third-party library code
- Skip edge cases

## Example Tests

### Testing Validation Schema

```typescript
import { createPostSchema } from '@/lib/validations/posts';

describe('createPostSchema', () => {
  it('should accept valid post data', () => {
    const validData = {
      title: 'My Post',
      slug: 'my-post',
      content: 'Content here',
      status: 'draft',
    };

    const result = createPostSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty title', () => {
    const invalidData = {
      title: '',
      slug: 'my-post',
      content: 'Content',
    };

    const result = createPostSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

### Testing Utility Function

```typescript
import { generateSlug } from '@/lib/validations/posts';

describe('generateSlug', () => {
  it('should convert to lowercase and replace spaces', () => {
    expect(generateSlug('Hello World')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(generateSlug('Hello@World!')).toBe('helloworld');
  });
});
```

## Continuous Integration

Tests run automatically in CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
- name: Run tests
  run: npm test
```

Pre-push hooks also run tests:

```bash
# Hooks validate before push
git push  # Tests run automatically
```

## Debugging Tests

### Run specific test file
```bash
npx vitest run tests/validations/posts.test.ts
```

### Run tests matching pattern
```bash
npx vitest run -t "generateSlug"
```

### Debug with console.log
```typescript
it('should do something', () => {
  console.log('Debug value:', value);
  expect(value).toBe(expected);
});
```

### Use test.only() for focused testing
```typescript
it.only('should test this one', () => {
  // Only this test runs
});
```

## Next Steps

1. Add tests for service layer functions
2. Add tests for API endpoints (integration tests)
3. Add tests for React/Svelte components
4. Set up E2E tests with Playwright

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://testingjavascript.com/)
- [Mocking Guide](https://vitest.dev/guide/mocking.html)

---

**Remember:** Good tests make refactoring safe and development faster!
