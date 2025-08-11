# Test Configuration Fix: Jest and Playwright Separation

## Problem Fixed
Jest was attempting to run Playwright test files, causing the error:
```
Playwright Test needs to be invoked via 'npx playwright test' and excluded from Jest test runs.
Creating one directory for Playwright tests and one for Jest is the recommended way of doing it.
```

## Solution Implemented

### 1. Directory Structure
```
src/
├── components/
│   └── forms/
│       └── __tests__/
│           └── ContactForm.test.tsx    # Jest unit tests
└── **/*.test.{js,jsx,ts,tsx}          # Other Jest unit tests

tests/
├── e2e/
│   ├── contact.spec.ts                # Playwright E2E tests
│   └── homepage.spec.ts
├── performance/
│   └── lighthouse.spec.ts             # Playwright performance tests
└── visual/
    └── visual-regression.spec.ts      # Playwright visual tests
```

### 2. Jest Configuration (jest.config.js)
- **Test Patterns**: Only matches `*.test.{js,jsx,ts,tsx}` files in `src/` directory
- **Exclusions**: Excludes entire `tests/` directory and all `*.spec.*` files
- **Documentation**: Added clear comments explaining the separation

```javascript
// Test patterns - Jest should only run unit tests with .test. extension
testMatch: [
  '<rootDir>/src/**/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
  '<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'
],

// Exclude patterns - Exclude Playwright test directories and spec files
testPathIgnorePatterns: [
  '<rootDir>/.next/',
  '<rootDir>/node_modules/',
  '<rootDir>/out/',
  '<rootDir>/tests/', // Exclude all Playwright tests
  '<rootDir>/playwright.config.ts',
  '.*\\.spec\\.[jt]sx?$', // Exclude Playwright spec files anywhere
],
```

### 3. Playwright Configuration (playwright.config.ts)
- **Test Directory**: Points to `./tests` directory only
- **Test Pattern**: Only matches `**/*.spec.ts` files
- **Documentation**: Added clear comments explaining the separation

```typescript
export default defineConfig({
  testDir: './tests',
  // Only run Playwright test files with .spec.ts extension
  testMatch: '**/*.spec.ts',
  // ... rest of config
});
```

### 4. Package.json Scripts
Updated to clearly separate test commands:

```json
{
  "test": "jest --passWithNoTests",           // Jest unit tests
  "test:unit": "jest --passWithNoTests",     // Explicit unit tests
  "test:e2e": "playwright test --project=chromium", // Playwright E2E (single browser)
  "test:e2e:all": "playwright test",         // Playwright E2E (all browsers)
  "test:all": "npm run test:unit && npm run test:e2e:all", // Both sequentially
  "validate-build": "... && npm run test:unit && ..." // Uses unit tests only
}
```

## Verification

### Jest Only Runs Unit Tests
```bash
$ npm test
# Only runs: src/components/forms/__tests__/ContactForm.test.tsx
# Ignores: tests/**/*.spec.ts files

$ npx jest --listTests
# Shows only: C:\...\src\components\forms\__tests__\ContactForm.test.tsx
```

### Playwright Only Runs E2E Tests
```bash
$ npm run test:e2e
# Only runs: tests/**/*.spec.ts files
# Ignores: src/**/*.test.* files
```

### No Conflicts
- Jest and Playwright now run completely independently
- No more "Playwright Test needs to be invoked via 'npx playwright test'" error
- Clear separation of concerns: Jest for unit tests, Playwright for E2E tests

## File Naming Conventions
- **Jest Unit Tests**: `*.test.{js,jsx,ts,tsx}` or in `__tests__/` directories
- **Playwright E2E Tests**: `*.spec.ts` in the `tests/` directory
- **Directory Structure**: Jest tests in `src/`, Playwright tests in `tests/`

## Benefits
1. **No Conflicts**: Test runners don't interfere with each other
2. **Clear Separation**: Easy to understand which tests run where  
3. **Independent Execution**: Can run unit tests and E2E tests separately
4. **CI/CD Ready**: Proper separation for different pipeline stages
5. **Developer Experience**: Clear commands for different testing needs