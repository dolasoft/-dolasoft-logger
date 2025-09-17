# Contributing to DolaSoft Logger

Thank you for your interest in contributing to DolaSoft Logger! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/dolasoft-logger.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 16.0.0 or higher
- npm 7.0.0 or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/dolasoft/dolasoft-logger.git
cd dolasoft-logger

# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm run test:run
```

### Available Scripts

- `npm run build` - Build the package
- `npm run dev` - Build in watch mode
- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage
- `npm run test:ui` - Run tests with UI
- `npm run type-check` - Run TypeScript type checking

## Making Changes

### Code Style

- Use TypeScript with strict type checking
- Follow the existing code style and patterns
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Keep functions small and focused

### File Structure

```
src/
├── core/           # Core logger functionality
├── adapters/       # Logging adapters (console, file, etc.)
├── integrations/   # Framework integrations (React, Next.js, etc.)
├── utils/          # Utility functions
├── constants/      # Constants and configuration
└── __tests__/      # Test files
```

### Adding New Features

1. Create feature branch: `git checkout -b feature/feature-name`
2. Implement the feature with tests
3. Update documentation if needed
4. Ensure all tests pass
5. Submit pull request

### Adding New Adapters

1. Create new adapter in `src/adapters/`
2. Implement the `LogAdapter` interface
3. Add tests in `src/__tests__/adapters/`
4. Export the adapter in `src/index.ts`
5. Update documentation

### Adding New Integrations

1. Create new integration in `src/integrations/`
2. Follow existing integration patterns
3. Add tests for the integration
4. Export the integration in `src/index.ts`
5. Update documentation and examples

## Testing

### Running Tests

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Test Guidelines

- Write tests for all new functionality
- Use descriptive test names
- Test both success and error cases
- Keep tests simple and focused
- Use real file system for file adapter tests (no complex mocking)

### Test Structure

```typescript
describe('FeatureName', () => {
  describe('MethodName', () => {
    it('should do something when condition is met', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = methodUnderTest(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Submitting Changes

### Pull Request Process

1. Ensure your branch is up to date with main
2. Run all tests and ensure they pass
3. Run type checking: `npm run type-check`
4. Build the package: `npm run build`
5. Create a pull request with a clear description
6. Link any related issues
7. Request review from maintainers

### Pull Request Template

Use the provided pull request template to ensure all necessary information is included.

### Review Process

- All pull requests require review
- Address feedback promptly
- Keep pull requests focused and small
- Update documentation as needed

## Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Steps

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Create a release tag: `git tag v1.0.0`
4. Push the tag: `git push origin v1.0.0`
5. GitHub Actions will automatically publish to NPM

### Changelog

Update `CHANGELOG.md` with:
- New features
- Bug fixes
- Breaking changes
- Deprecations
- Security updates

## Questions?

If you have questions about contributing, please:
1. Check existing issues and discussions
2. Create a new issue with the "question" label
3. Contact maintainers directly

## Thank You!

Thank you for contributing to DolaSoft Logger! Your contributions help make this project better for everyone.
