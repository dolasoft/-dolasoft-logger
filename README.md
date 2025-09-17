# @dolasoftfree/logger

[![npm version](https://badge.fury.io/js/%40dolasoftfree%2Flogger.svg)](https://badge.fury.io/js/%40dolasoftfree%2Flogger)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/dolasoftfree/dolasoft-logger/actions)
[![Tests](https://img.shields.io/badge/tests-43%20passing-brightgreen.svg)](https://github.com/dolasoftfree/dolasoft-logger/actions)

Enterprise-grade logging library with multiple adapters and framework integrations for Node.js, React, Next.js, and Express applications.

## Features

- 🚀 **Multiple Log Levels**: DEBUG, INFO, WARN, ERROR, FATAL
- 🔌 **Multiple Adapters**: Console, Memory, Database, File
- ⚡ **Framework Integrations**: React, Next.js, Express
- 📊 **Structured Logging**: JSON and text formats
- 🔄 **Log Rotation**: Automatic file rotation with size limits
- 🎯 **Context Enrichment**: Automatic request/user context
- 📈 **Performance**: Async logging with batching
- 🛡️ **TypeScript**: Full type safety and IntelliSense
- 🔧 **Configurable**: Environment-based configuration
- 📦 **Zero Dependencies**: Lightweight and fast
- 🌐 **Universal**: Works in any JavaScript/TypeScript environment

## Installation

```bash
npm install @dolasoftfree/logger
# or
yarn add @dolasoft/logger
# or
pnpm add @dolasoft/logger
```

## Quick Start

### Basic Usage (Universal)

The logger works in **any JavaScript/TypeScript environment**:

```typescript
import { getLogger } from '@dolasoft/logger';

const logger = getLogger();

logger.info('Application started');
logger.error('Something went wrong', new Error('Database connection failed'));
```

### Node.js

```javascript
const { getLogger, LogLevel, LogStrategy } = require('@dolasoft/logger');

const logger = getLogger({
  strategy: LogStrategy.HYBRID,
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  filePath: './logs/app.log'
});

logger.info('Node.js application started');
```

### Browser (Vanilla JS)

```html
<script type="module">
  import { getLogger } from '@dolasoft/logger';
  
  const logger = getLogger({
    strategy: 'console',
    level: 'debug'
  });
  
  logger.info('Browser application started');
</script>
```

### TypeScript

```typescript
import { 
  getLogger, 
  LogLevel, 
  LogStrategy, 
  LoggerService 
} from '@dolasoft/logger';

const logger = getLogger({
  strategy: LogStrategy.CONSOLE,
  level: LogLevel.INFO
});

logger.info('TypeScript application started');
```

## Supported Environments

The logger works in **any JavaScript/TypeScript environment**:

### ✅ **Node.js**
- CommonJS (`require`)
- ES Modules (`import`)
- TypeScript
- Express.js, Fastify, Koa
- CLI applications
- Serverless functions

### ✅ **Browser**
- Vanilla JavaScript
- ES6 Modules
- UMD builds
- React, Vue, Angular, Svelte
- Web Workers
- Service Workers

### ✅ **Build Tools**
- Webpack, Vite, Rollup
- Parcel, esbuild
- Babel, TypeScript compiler
- Next.js, Nuxt.js, SvelteKit

### ✅ **Frameworks**
- **Frontend**: React, Vue, Angular, Svelte
- **Backend**: Express, Fastify, Koa, Hapi
- **Full-stack**: Next.js, Nuxt.js, SvelteKit
- **Mobile**: React Native, Ionic

### ✅ **Environments**
- **Development**: Full console logging
- **Production**: Optimized for performance
- **Testing**: Easy singleton reset
- **CI/CD**: Configurable output

### React Integration

```typescript
import { useLogger } from '@dolasoft/logger/react';

function MyComponent() {
  const logger = useLogger({ appSlug: 'my-app', userId: 'user-123' });
  
  const handleClick = () => {
    logger.info('Button clicked', { buttonId: 'submit' });
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

### Next.js API Routes (Server-side)

```typescript
import { getServerLogger } from '@dolasoft/logger/nextjs';

export async function GET(request: NextRequest) {
  const logger = getServerLogger(request);
  
  logger.info('API endpoint called');
  
  try {
    // Your logic here
    return Response.json({ success: true });
  } catch (error) {
    logger.error('API error', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### Next.js Client Components

```typescript
import { useNextJSClientLogger } from '@dolasoft/logger/nextjs-client';

function MyClientComponent() {
  const logger = useNextJSClientLogger({ 
    appSlug: 'my-app', 
    userId: 'user-123',
    enableRemote: true, // Send logs to your API endpoint
    strategy: 'console', // 'console', 'memory', or 'hybrid'
    level: LogLevel.INFO // Custom log level
  });
  
  const handleClick = () => {
    logger.info('Button clicked', { buttonId: 'submit' });
  };
  
  return <button onClick={handleClick}>Click me</button>;
}
```

**Note**: Client-side logging strategies:
- **`console`**: Logs to browser console (default in development)
- **`memory`**: Stores logs in memory (default in production)
- **`hybrid`**: Both console and memory logging

### Express Middleware

```typescript
import express from 'express';
import { createLoggingMiddleware, createErrorHandler } from '@dolasoft/logger/express';

const app = express();

// Request logging middleware
app.use(createLoggingMiddleware());

// Error handling middleware
app.use(createErrorHandler());

app.get('/api/users', (req, res) => {
  res.json({ users: [] });
});
```

## Configuration

### Environment Variables

```bash
# Log level (DEBUG, INFO, WARN, ERROR, FATAL)
LOG_LEVEL=INFO

# Log strategy (console, memory, database, file, hybrid)
LOG_STRATEGY=hybrid

# Memory limits
LOG_MAX_MEMORY_ENTRIES=1000
LOG_MAX_DATABASE_ENTRIES=10000
LOG_MAX_FILE_ENTRIES=5000

# File logging
LOG_FILE_PATH=./logs/app.log
LOG_MAX_FILE_SIZE=10485760  # 10MB
LOG_MAX_FILES=5

# Console logging
NODE_ENV=production
```

### Programmatic Configuration

```typescript
import { LoggerService, LogLevel, LogStrategy } from '@dolasoft/logger';

const logger = new LoggerService({
  strategy: LogStrategy.HYBRID,
  level: LogLevel.INFO,
  enableConsole: true,
  enableDatabase: true,
  enableFile: true,
  maxMemoryEntries: 1000,
  maxDatabaseEntries: 10000,
  filePath: './logs/app.log',
  format: 'json'
});
```

## API Reference

### Core Logger

#### `LoggerService`

Main logger class with configurable adapters.

```typescript
class LoggerService {
  constructor(config?: Partial<LoggerConfig>);
  
  debug(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
  fatal(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void;
  
  getLogs(adapterName?: string, limit?: number): Promise<LogEntry[]>;
  getErrorLogs(limit?: number): Promise<LogEntry[]>;
  clearLogs(adapterName?: string): Promise<void>;
  getStats(): LogStats;
  updateConfig(newConfig: Partial<LoggerConfig>): void;
  cleanup(): Promise<void>;
}
```

### React Hook

#### `useLogger(options)`

React hook for component-level logging.

```typescript
interface UseLoggerOptions {
  appSlug?: string;
  userId?: string;
  requestId?: string;
  logger?: LoggerService;
}

const logger = useLogger({ appSlug: 'my-app', userId: 'user-123' });
```

### Next.js Integration

#### Server-side

#### `getServerLogger(request, logger?)`

Get server logger with request context.

```typescript
const logger = getServerLogger(request);
logger.info('API called');
```

#### `logApiError(request, message, error?, context?)`

Convenience function for API error logging.

```typescript
logApiError(request, 'Database error', error, { query: 'SELECT * FROM users' });
```

#### Client-side

#### `useNextJSClientLogger(options)`

React hook for client-side logging in Next.js.

```typescript
interface NextJSClientLoggerOptions {
  appSlug?: string;
  userId?: string;
  requestId?: string;
  logger?: LoggerService;
  enableConsole?: boolean;
  enableRemote?: boolean;
  remoteEndpoint?: string;
  strategy?: 'console' | 'memory' | 'hybrid';
  level?: LogLevel;
}

const logger = useNextJSClientLogger({ 
  appSlug: 'my-app', 
  enableRemote: true,
  strategy: 'console', // Configurable strategy
  level: LogLevel.INFO // Configurable log level
});
```

**Configurable Strategies:**
- **`console`**: Logs to browser console (default in development)
- **`memory`**: Stores logs in memory (default in production)  
- **`hybrid`**: Both console and memory logging

#### `NextJSClientLogger`

Class-based client logger for non-React usage.

```typescript
const logger = new NextJSClientLogger({
  appSlug: 'my-app',
  enableRemote: true,
  remoteEndpoint: '/api/logs',
  strategy: 'hybrid', // Configurable strategy
  level: LogLevel.INFO // Configurable log level
});
```

### Express Integration

#### `createLoggingMiddleware(logger?)`

Express middleware for request/response logging.

```typescript
app.use(createLoggingMiddleware());
```

#### `createErrorHandler(logger?)`

Express error handling middleware.

```typescript
app.use(createErrorHandler());
```

## Log Levels

- **DEBUG** (0): Detailed information for debugging
- **INFO** (1): General information about application flow
- **WARN** (2): Warning messages for potential issues
- **ERROR** (3): Error messages for handled exceptions
- **FATAL** (4): Fatal errors that cause application termination

## Log Strategies

- **CONSOLE**: Log to console only
- **MEMORY**: Store logs in memory (for debugging)
- **DATABASE**: Store logs in database
- **FILE**: Write logs to files with rotation
- **HYBRID**: Use multiple adapters simultaneously

## Examples

### Custom Logger Configuration

```typescript
import { LoggerService, LogLevel, LogStrategy } from '@dolasoft/logger';

const logger = new LoggerService({
  strategy: LogStrategy.HYBRID,
  level: LogLevel.INFO,
  enableConsole: true,
  enableDatabase: true,
  enableFile: true,
  maxMemoryEntries: 1000,
  maxDatabaseEntries: 10000,
  filePath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  format: 'json',
  includeStack: true
});
```

### Enhanced File Logging

The logger supports advanced file logging with rotation, size limits, and flexible configuration:

```typescript
import { LoggerService, LogLevel, LogStrategy } from '@dolasoft/logger';

// Error-only file logging with rotation
const errorLogger = LoggerService.create({
  strategy: LogStrategy.FILE,
  level: LogLevel.ERROR,
  enableFile: true,
  filePath: './logs/errors.log',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 3,
  format: 'json',
  overwrite: false,
  append: true
});

// Custom directory and file naming
const customLogger = LoggerService.create({
  strategy: LogStrategy.FILE,
  level: LogLevel.INFO,
  enableFile: true,
  directory: './logs/app',
  fileName: 'application.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  format: 'pretty',
  includeTimestamp: true,
  includeLevel: true
});

// Daily error logs
const dailyLogger = LoggerService.create({
  strategy: LogStrategy.FILE,
  level: LogLevel.ERROR,
  enableFile: true,
  filePath: `./logs/errors-${new Date().toISOString().split('T')[0]}.log`,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 30, // Keep 30 days
  format: 'json'
});
```

**File Logging Features:**
- ✅ **Size-based rotation** - Automatic file rotation when size limit reached
- ✅ **Time-based rotation** - Daily/weekly log files
- ✅ **Configurable formats** - JSON, text, or pretty-printed
- ✅ **Directory management** - Custom directories and file naming
- ✅ **Overwrite/Append modes** - Control file writing behavior
- ✅ **Level filtering** - Log only specific levels (e.g., errors only)
- ✅ **Compression support** - Optional log file compression

### Database Integration

```typescript
import { DatabaseAdapter } from '@dolasoft/logger';

// Custom database adapter
class CustomDatabaseAdapter extends DatabaseAdapter {
  async log(entry: LogEntry): Promise<void> {
    // Your database implementation
    await this.db.collection('logs').insertOne(entry);
  }
}
```

### Error Tracking

```typescript
import { getLogger } from '@dolasoft/logger';

const logger = getLogger();

try {
  // Risky operation
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, {
    operation: 'riskyOperation',
    userId: 'user-123',
    timestamp: new Date().toISOString()
  });
}
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/dolasoft/-dolasoft-logger/issues)
- 📖 Documentation: [GitHub Wiki](https://github.com/dolasoft/-dolasoft-logger/wiki)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

---

Made with ❤️ by [DolaSoft](https://github.com/dolasoft)
# -dolasoft-logger
