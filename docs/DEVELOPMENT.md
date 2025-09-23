# Development Guide

This guide covers development setup, testing, and publishing procedures for the Unified Logger package.

## Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development Workflow

### Building

```bash
npm run build
```

This compiles TypeScript files to JavaScript in the `dist/` directory.

### Testing

Run all tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

### Linting and Formatting

Check for linting errors:
```bash
npm run lint:check
```

Fix linting errors automatically:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

Check formatting:
```bash
npm run format:check
```

## Project Structure

```
unified-logger/
├── src/                    # Source files
│   ├── index.ts           # Main UnifiedLogger class
│   ├── types.ts           # TypeScript type definitions
│   └── __tests__/         # Test files
├── dist/                  # Compiled JavaScript (generated)
├── docs/                  # Documentation
│   ├── EXAMPLES.md        # Comprehensive usage examples
│   └── DEVELOPMENT.md     # This file
├── package.json           # Package configuration
├── tsconfig.json          # TypeScript configuration
├── vitest.config.ts       # Test configuration
├── eslint.config.mjs      # ESLint configuration
└── README.md              # Package documentation
```

## Configuration Files

### TypeScript (`tsconfig.json`)
- Target: ES2020
- Module: CommonJS
- Strict mode enabled
- Declaration files generated

### ESLint (`eslint.config.mjs`)
- TypeScript support
- Prettier integration
- No explicit `any` types allowed
- Console statements allowed (it's a logger!)

### Vitest (`vitest.config.ts`)
- Node environment
- Global test functions
- Coverage reporting with v8

## Testing

The test suite includes:

1. **Unit Tests** (`UnifiedLogger.test.ts`)
   - Core functionality
   - All logging methods
   - Session management
   - Data sanitization

2. **Type Tests** (`types.test.ts`)
   - TypeScript type definitions
   - Interface compliance

3. **Integration Tests** (`integration.test.ts`)
   - Real-world scenarios
   - Performance tests
   - Edge cases

4. **Production Safety Tests** (`production-safety.test.ts`)
   - Production mode behavior
   - Environment variable handling
   - Silent mode verification

## Publishing

1. Ensure all tests pass:
   ```bash
   npm test
   ```

2. Check linting:
   ```bash
   npm run lint:check
   ```

3. Update version in `package.json`

4. Build the package:
   ```bash
   npm run build
   ```

5. Publish to npm:
   ```bash
   npm publish
   ```

The `prepublishOnly` script will automatically run linting, tests, and build before publishing.

## Environment Variables

For development and testing:

- `NODE_ENV`: Set to 'development' or 'production'
- `LOG_MODE`: Override default log mode ('console', 'route', 'both', 'none')
- `LOG_ROUTE_URL`: Override default route URL
- `UNIFIED_LOGGER_ENV`: Alternative to NODE_ENV for logger-specific settings
- `UNIFIED_LOGGER_SILENT_PRODUCTION`: Force silent mode in production

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Ensure all tests pass
5. No `any` types without explicit justification
6. Use meaningful commit messages

## Debugging

To debug the logger in your application:

1. Set `LOG_MODE=console` for immediate console output
2. Use `silentInProduction: false` to enable logging in production (use carefully!)
3. Check the in-memory logs with `logger.getAllLogs()`
4. Review session data with `logger.getAllSessions()`

## Performance Considerations

- The logger maintains in-memory storage of logs and sessions
- Default limits: 1000 logs, 100 sessions
- Old sessions are automatically cleaned up
- Async operations (route logging) don't block the main thread
- Console operations are synchronous but fast

## Security

- Sensitive fields are automatically sanitized
- Default sensitive fields: password, token, secret, key, apiKey, auth, authorization
- Add custom sensitive fields via configuration
- Never log sensitive data in production
- Use environment variables for configuration, not hardcoded values
