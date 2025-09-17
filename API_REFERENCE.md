# @dolasoft/logger - AI API Reference

## Quick Start

```typescript
import { getLogger, LogLevel, LogStrategy } from '@dolasoft/logger';

const logger = getLogger();
logger.info('Hello World');
```

## Core API

### LoggerService

**Main logger class with singleton pattern**

```typescript
import { LoggerService, LogLevel, LogStrategy } from '@dolasoft/logger';

// Get singleton instance
const logger = LoggerService.getInstance();

// Create new instance
const customLogger = LoggerService.create({
  strategy: LogStrategy.CONSOLE,
  level: LogLevel.INFO
});

// Reset singleton (for testing)
LoggerService.reset();
```

### Logging Methods

```typescript
// Basic logging
logger.debug(message: string, context?: object, metadata?: object)
logger.info(message: string, context?: object, metadata?: object)
logger.warn(message: string, context?: object, metadata?: object)
logger.error(message: string, error?: Error, context?: object, metadata?: object)
logger.fatal(message: string, error?: Error, context?: object, metadata?: object)

// Examples
logger.info('User logged in', { userId: '123' });
logger.error('Database error', new Error('Connection failed'), { query: 'SELECT * FROM users' });
```

### Configuration

```typescript
interface LoggerConfig {
  strategy: 'console' | 'memory' | 'database' | 'file' | 'hybrid';
  level: LogLevel;
  maxMemoryEntries?: number;
  maxDatabaseEntries?: number;
  maxFileEntries?: number;
  enableConsole?: boolean;
  enableDatabase?: boolean;
  enableFile?: boolean;
  filePath?: string;
  maxFileSize?: number; // bytes
  maxFiles?: number;
  format?: 'json' | 'text' | 'pretty';
  includeStack?: boolean;
  includeMetadata?: boolean;
}
```

### Log Levels

```typescript
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}
```

### Log Strategies

```typescript
enum LogStrategy {
  CONSOLE = 'console',    // Console only
  MEMORY = 'memory',      // Memory storage
  DATABASE = 'database',  // Database storage
  FILE = 'file',          // File storage
  HYBRID = 'hybrid'       // Multiple adapters
}
```

## Framework Integrations

### React

```typescript
import { useLogger } from '@dolasoft/logger/react';

function MyComponent() {
  const logger = useLogger({ 
    appSlug: 'my-app', 
    userId: 'user-123' 
  });
  
  logger.info('Component rendered');
}
```

### Next.js (Server)

```typescript
import { getServerLogger } from '@dolasoft/logger/nextjs';

export async function GET(request: NextRequest) {
  const logger = getServerLogger(request);
  logger.info('API called');
}
```

### Next.js (Client)

```typescript
import { useNextJSClientLogger } from '@dolasoft/logger/nextjs-client';

function MyComponent() {
  const logger = useNextJSClientLogger({ 
    strategy: 'console',
    enableRemote: true 
  });
  
  logger.info('Client action');
}
```

### Express

```typescript
import { createLoggingMiddleware, createErrorHandler } from '@dolasoft/logger/express';

app.use(createLoggingMiddleware());
app.use(createErrorHandler());
```

## File Logging

### Basic File Logging

```typescript
const logger = LoggerService.create({
  strategy: LogStrategy.FILE,
  enableFile: true,
  filePath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  format: 'json'
});
```

### Error-Only File Logging

```typescript
const errorLogger = LoggerService.create({
  strategy: LogStrategy.FILE,
  level: LogLevel.ERROR,
  enableFile: true,
  filePath: './logs/errors.log',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 3,
  format: 'json'
});
```

### Daily Error Logs

```typescript
const dailyLogger = LoggerService.create({
  strategy: LogStrategy.FILE,
  level: LogLevel.ERROR,
  enableFile: true,
  filePath: `./logs/errors-${new Date().toISOString().split('T')[0]}.log`,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 30 // Keep 30 days
});
```

## Utility Functions

### Convenience Functions

```typescript
import { logInfo, logError, logWarn, logDebug, logFatal } from '@dolasoft/logger';

logInfo('Quick info message');
logError('Quick error', new Error('Test error'));
```

### UUID Generation

```typescript
import { generateUUID, generateShortId, generateRequestId } from '@dolasoft/logger';

const uuid = generateUUID();
const shortId = generateShortId();
const requestId = generateRequestId('req');
```

### Singleton Management

```typescript
import { resetAllSingletons, areSingletonsInitialized } from '@dolasoft/logger';

// Reset all singletons (useful for testing)
resetAllSingletons();

// Check if singletons are initialized
const isInitialized = areSingletonsInitialized();
```

## Environment Configuration

### Environment Variables

```bash
LOG_LEVEL=INFO
LOG_STRATEGY=hybrid
LOG_MAX_MEMORY_ENTRIES=1000
LOG_MAX_DATABASE_ENTRIES=10000
LOG_MAX_FILE_ENTRIES=5000
LOG_FILE_PATH=./logs/app.log
LOG_MAX_FILE_SIZE=10485760
LOG_MAX_FILES=5
NODE_ENV=production
```

### Environment-Aware Configuration

```typescript
const logger = getLogger({
  strategy: process.env.NODE_ENV === 'production' ? LogStrategy.HYBRID : LogStrategy.CONSOLE,
  level: process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG,
  enableConsole: process.env.NODE_ENV !== 'production',
  enableFile: process.env.NODE_ENV === 'production'
});
```

## Common Patterns

### Error Handling

```typescript
try {
  // Risky operation
  await riskyOperation();
} catch (error) {
  logger.error('Operation failed', error, {
    operation: 'riskyOperation',
    userId: 'user-123'
  });
}
```

### Request Logging

```typescript
// Express middleware
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent')
  });
  next();
});
```

### Performance Logging

```typescript
const startTime = Date.now();
// ... operation
const duration = Date.now() - startTime;
logger.info('Operation completed', { duration: `${duration}ms` });
```

### User Action Logging

```typescript
logger.info('User action', {
  action: 'login',
  userId: 'user-123',
  timestamp: new Date().toISOString()
});
```

## File Formats

### JSON Format
```json
{
  "timestamp": "2023-01-01T00:00:00.000Z",
  "level": "INFO",
  "message": "User logged in",
  "context": { "userId": "123" },
  "metadata": { "sessionId": "456" }
}
```

### Text Format
```
[2023-01-01T00:00:00.000Z] INFO User logged in {"userId":"123"} {"sessionId":"456"}
```

### Pretty Format
```json
{
  "timestamp": "2023-01-01T00:00:00.000Z",
  "level": "INFO",
  "message": "User logged in",
  "context": {
    "userId": "123"
  },
  "metadata": {
    "sessionId": "456"
  }
}
```

## Installation

```bash
npm install @dolasoft/logger
# or
yarn add @dolasoft/logger
# or
pnpm add @dolasoft/logger
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions and IntelliSense.

## Browser Support

Works in all modern browsers and Node.js environments.

## Zero Dependencies

Lightweight library with no external dependencies.
