# DolaSoft Logger Tests

This directory contains test files for the DolaSoft Logger package.

## Browser Tests

### HTML Test Page
- **File**: `browser/test-browser.html`
- **Purpose**: Interactive browser testing of the logger bundle
- **Usage**: Open the HTML file in a web browser to test the logger functionality
- **Features**:
  - Tests basic imports and exports
  - Tests UUID generation
  - Tests logger creation and configuration
  - Tests logging functionality
  - Tests zero-config loggers
  - Interactive UI with test results

### Node.js Test Script
- **File**: `browser/test-browser-core.cjs`
- **Purpose**: Automated testing of the browser-core bundle in Node.js
- **Usage**: Run from the project root directory
  ```bash
  node tests/browser/test-browser-core.cjs
  ```
- **Features**:
  - Tests all core functionality
  - Simulates browser environment
  - Automated test results
  - Exit codes for CI/CD integration
- **Note**: Currently has issues with module loading due to ES module configuration

## Running Tests

### Prerequisites
1. Build the project first:
   ```bash
   npm run build
   ```

2. Ensure the `dist/` directory contains the built bundles

### Browser Testing
1. Open `tests/browser/test-browser.html` in a web browser
2. Click the test buttons to run individual tests
3. View results in the test output area

### Node.js Testing
1. Run the test script:
   ```bash
   node tests/browser/test-browser-core.cjs
   ```
2. Check the console output for test results
3. Exit code 0 = all tests passed, 1 = some tests failed
4. **Note**: Currently has module loading issues - use browser testing instead

## Test Coverage

The tests cover:
- ✅ Basic module imports and exports
- ✅ UUID generation (browser and Node.js compatible)
- ✅ Logger creation and configuration
- ✅ All logging levels (debug, info, warn, error, fatal)
- ✅ Zero-config logger factories
- ✅ Convenience logging functions
- ✅ Browser environment compatibility
- ✅ Node.js environment compatibility

## Troubleshooting

### Common Issues

1. **Module not found errors**: Ensure the project is built (`npm run build`)
2. **Import errors in browser**: Check that the dist files exist and are accessible
3. **Node.js require errors**: Ensure you're running from the project root directory
4. **Browser compatibility**: The tests require a modern browser with ES6 module support

### Debug Mode

To run tests with more verbose output, you can modify the test files to include additional logging or use browser developer tools to inspect the console output.

## Contributing

When adding new features to the logger, please:
1. Add corresponding tests to these files
2. Ensure both browser and Node.js tests pass
3. Update this README if new test files are added
