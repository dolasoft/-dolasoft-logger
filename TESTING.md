# Testing Guide - @dolasoft/logger

## Test Setup

We use **Vitest** - a fast, modern testing framework that's much faster than Jest.

## 🌐 Browser Testing

### Interactive Browser Tests

We provide comprehensive browser testing tools to verify the logger works correctly in real browser environments.

#### Interactive Test Page
```bash
# Open the test page in your browser
open tests/browser/test-browser.html
```

This page provides:
- ✅ Bundle loading verification
- ✅ Export availability testing
- ✅ Logger creation testing
- ✅ Logging functionality testing
- ✅ UUID generation testing
- ✅ Zero-config logger testing
- ✅ Interactive UI with real-time results
- ✅ Individual test buttons
- ✅ Detailed test results
- ✅ Error reporting

### Automated Browser Tests

```bash
# Run automated browser tests
npm run test:browser
```

This command:
- ✅ Verifies build files exist
- ✅ Runs Node.js compatibility tests
- ✅ Provides browser testing instructions
- ✅ Exits with proper status codes for CI/CD

### Test Files Structure

```
tests/
├── README.md                           # Test documentation
├── run-browser-tests.cjs              # Test runner script
└── browser/
    ├── test-browser.html              # Interactive test suite
    └── test-browser-core.cjs          # Node.js test script
```

### Installation

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run tests once (for CI)
npm run test:run

# Run specific test file
npx vitest src/__tests__/core/logger.test.ts

# Run tests matching pattern
npx vitest --grep "singleton"
```

## Test Structure

```
src/__tests__/
├── setup.ts                 # Test setup and mocks
├── core/
│   └── logger.test.ts       # Core logger tests
├── adapters/
│   └── file.test.ts         # File adapter tests
├── integrations/
│   └── react.test.tsx       # React integration tests
└── utils/
    └── uuid.test.ts         # UUID utility tests
```

## Test Coverage

- ✅ **Core Logger** - Singleton pattern, configuration, logging methods
- ✅ **File Adapter** - File writing, rotation, formatting, error handling
- ✅ **React Integration** - Hook functionality, context enrichment
- ✅ **UUID Utils** - UUID generation, fallbacks, request IDs
- ✅ **Singleton Management** - Reset functionality, state management

## Key Test Features

### Mocking
- **Console methods** - Prevent test noise
- **File system** - Mock fs operations for file adapter
- **Crypto** - Mock UUID generation for consistent tests
- **React hooks** - Mock React hooks for integration tests

### Test Utilities
- **Singleton reset** - Clean state between tests
- **Mock cleanup** - Reset mocks after each test
- **Error simulation** - Test error handling paths

## Running Specific Tests

### Core Logger Tests
```bash
npx vitest src/__tests__/core/logger.test.ts
```

### File Adapter Tests
```bash
npx vitest src/__tests__/adapters/file.test.ts
```

### React Integration Tests
```bash
npx vitest src/__tests__/integrations/react.test.tsx
```

### UUID Utility Tests
```bash
npx vitest src/__tests__/utils/uuid.test.ts
```

## Test Configuration

### Vitest Config (`vitest.config.ts`)
- **Environment**: Node.js
- **Globals**: Enabled for cleaner test syntax
- **Coverage**: V8 provider with 80% thresholds
- **Setup**: Automatic test setup file
- **Aliases**: Path mapping for imports

### Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Continuous Integration

Tests run automatically on:
- **Pre-publish** - Before NPM publishing
- **Pre-commit** - Before git commits (if configured)
- **Pull requests** - On GitHub (if configured)

## Debugging Tests

### Run with Debug Output
```bash
npx vitest --reporter=verbose
```

### Run Single Test with Debug
```bash
npx vitest --reporter=verbose src/__tests__/core/logger.test.ts -t "should log debug messages"
```

### Test UI Mode
```bash
npm run test:ui
```
Opens a web interface for running and debugging tests.

## Performance

Vitest is significantly faster than Jest:
- **Cold start**: ~2x faster
- **Hot reload**: ~10x faster
- **Watch mode**: ~5x faster
- **Coverage**: ~3x faster

## Best Practices

1. **Reset singletons** - Always reset between tests
2. **Mock external dependencies** - Don't test external libraries
3. **Test error paths** - Ensure error handling works
4. **Use descriptive test names** - Clear what's being tested
5. **Group related tests** - Use describe blocks effectively
6. **Clean up mocks** - Reset mocks after each test

## Troubleshooting

### Common Issues

1. **Tests not running**
   ```bash
   # Clear node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Mock not working**
   ```bash
   # Check mock is properly imported
   import { vi } from 'vitest';
   ```

3. **Coverage not showing**
   ```bash
   # Run with coverage flag
   npm run test:coverage
   ```

4. **TypeScript errors**
   ```bash
   # Check TypeScript config
   npx tsc --noEmit
   ```

## Adding New Tests

1. Create test file in appropriate directory
2. Import necessary testing utilities
3. Write descriptive test cases
4. Mock external dependencies
5. Test both success and error paths
6. Run tests to ensure they pass

Example:
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { MyClass } from '../my-class';

describe('MyClass', () => {
  let instance: MyClass;

  beforeEach(() => {
    instance = new MyClass();
  });

  it('should do something', () => {
    expect(instance.someMethod()).toBe('expected result');
  });
});
```
