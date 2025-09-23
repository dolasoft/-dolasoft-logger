# @dolasoftfree/logger

A comprehensive logging system that combines execution tracking, trace logging, and general logging capabilities into a single, unified interface with automatic production safety.

## Features

- 🚀 **Multiple logging modes**: Console, HTTP route, both, or none
- 📊 **Session management**: Track complex operations with session-based logging
- ⏱️ **Execution tracking**: Monitor step-by-step execution with timing information
- 🔍 **Trace logging**: Detailed trace logs with emoji indicators
- 🔐 **Data sanitization**: Automatic removal of sensitive information
- 🌐 **Environment configuration**: Flexible configuration via environment variables
- 📝 **TypeScript support**: Full type definitions included
- 🔒 **Production safety**: Automatic console silencing in production environments
- 🎯 **Singleton pattern**: Ensures consistent logging across your application

## Installation

```bash
npm install @dolasoftfree/logger
```

## Quick Start

```typescript
import { getLogger } from '@dolasoftfree/logger';

// Get the logger instance
const logger = getLogger();

logger.info('Application started');
logger.debug('Debug information', { userId: 123 });
logger.warn('Warning message');
logger.error('Error occurred', new Error('Something went wrong'));

// Session-based logging
logger.startSession('user-123', 'trace');
logger.addTraceStep('start', '🚀 Starting operation');
// ... perform operations
logger.addTraceStep('complete', '✅ Operation completed');
const session = logger.endSession();
```

## Configuration

### Using the Singleton Instance

The package exports a default singleton instance for immediate use:

```typescript
import { getLogger } from '@dolasoftfree/logger';

// Get logger instance
const logger = getLogger();
logger.info('Using the singleton logger');
```

### Custom Configuration with getInstance

For custom configuration, use the `getInstance` method:

```typescript
import { UnifiedLogger, LOG_MODES } from '@dolasoftfree/logger';

// Get configured singleton instance
const logger = UnifiedLogger.getInstance({
  logMode: LOG_MODES.BOTH,
  routeUrl: 'http://localhost:3000/api/logs',
  maxLogs: 1000,
  maxSessions: 100,
  sensitiveFields: ['password', 'token', 'secret']
});
```

### Environment Variables

Configure the logger behavior using environment variables:

- `LOG_MODE`: Set the logging mode (`console`, `route`, `both`, or `none`)
- `LOG_ROUTE_URL`: Set the HTTP endpoint for remote logging
- `LOG_MAX_LOGS`: Positive integer to cap in-memory logs (default 1000)
- `LOG_MAX_SESSIONS`: Positive integer to cap stored sessions (default 100)
- `LOG_SENSITIVE_FIELDS`: Comma-separated list of keys to redact (default: password,token,secret,key,apiKey,auth,authorization)
- `NODE_ENV`: When set to `production`, automatically disables console output

```bash
export LOG_MODE=both
export LOG_ROUTE_URL=http://localhost:3000/api/logs
export LOG_MAX_LOGS=2000
export LOG_MAX_SESSIONS=250
export LOG_SENSITIVE_FIELDS=password,token,creditCard,ssn
export NODE_ENV=production
```

#### Precedence and Validation

- **LOG_MODE precedence**: `LOG_MODE` (if valid) → `config.logMode` → default `console`.
- **Valid values**: `console`, `route`, `both`, `none`. Invalid/empty values are ignored.
- **LOG_ROUTE_URL precedence**: `LOG_ROUTE_URL` (if non-empty) → `config.routeUrl` → default `http://localhost:3000/api/logs`.
- **Limits precedence**: `LOG_MAX_LOGS`/`LOG_MAX_SESSIONS` (valid positive int) → `config.maxLogs`/`config.maxSessions` → defaults.
- **Sanitization precedence**: `LOG_SENSITIVE_FIELDS` (comma-separated list) → `config.sensitiveFields` → defaults.
- **Production behavior**: see Production Safety below — console output is automatically disabled in production when applicable.

Example (invalid `LOG_MODE` is ignored and falls back to config):

```bash
export LOG_MODE=undefined   # ignored
```

```typescript
import { UnifiedLogger, LOG_MODES } from '@dolasoftfree/logger';

const logger = UnifiedLogger.getInstance({ logMode: LOG_MODES.BOTH });
// Resulting mode will be 'both' because env was invalid
```

### Log Modes

Use the exported `LOG_MODES` constant for type-safe configuration:

```typescript
import { UnifiedLogger, LOG_MODES } from '@dolasoftfree/logger';

const logger = UnifiedLogger.getInstance({
  logMode: LOG_MODES.CONSOLE,  // 'console'
  // logMode: LOG_MODES.ROUTE,  // 'route'
  // logMode: LOG_MODES.BOTH,   // 'both'
  // logMode: LOG_MODES.NONE,   // 'none'
});
```

### Production Safety

The logger automatically handles production environments:

1. **Automatic Production Detection**: Detects when running in production via `NODE_ENV`
2. **Console Silencing**: In production:
   - `console` mode → automatically switches to `none`
   - `both` mode → automatically switches to `route` only
   - `route` mode → remains unchanged
   - `none` mode → remains unchanged
3. **No Initialization Logs**: Logger initialization messages are suppressed in production

```typescript
// In production (NODE_ENV=production):
const logger = UnifiedLogger.getInstance({ 
  logMode: LOG_MODES.CONSOLE  // Automatically becomes 'none'
});

logger.info('This will not appear in console'); // Silent in production
logger.error('Even errors are silent');         // Silent in production

// But route mode still works in production:
const routeLogger = UnifiedLogger.getInstance({ 
  logMode: LOG_MODES.ROUTE,
  routeUrl: 'https://api.example.com/logs'
});

routeLogger.info('This will be sent to the API'); // Works in production
```

## API Reference

### Singleton Management

```typescript
// Get the singleton instance (creates one if it doesn't exist)
UnifiedLogger.getInstance(config?: UnifiedLoggerConfig): UnifiedLogger

// Reset the singleton instance (useful for testing)
UnifiedLogger.resetInstance(): void
```

### General Logging

```typescript
logger.debug(message: string, context?: unknown, metadata?: unknown): void
logger.info(message: string, context?: unknown, metadata?: unknown): void
logger.warn(message: string, context?: unknown, metadata?: unknown): void
logger.error(message: string, error?: Error | unknown, context?: unknown, metadata?: unknown): void
```

### Session Management

```typescript
// Start a new session
logger.startSession(id: string, type?: 'trace' | 'execution' | 'general', metadata?: Record<string, unknown>): void

// End the current session
logger.endSession(): Session | null

// Get session information
logger.getCurrentSession(): Session | null
logger.getSession(id: string): Session | null
logger.getAllSessions(): Session[]
```

### Trace Logging

```typescript
// Add a trace step
logger.addTraceStep(level: 'start' | 'complete' | 'error' | 'info', message: string, metadata?: Record<string, unknown>): void

// Start a timed trace step
logger.startTraceStep(stepName: string, message: string, metadata?: Record<string, unknown>): void

// Complete a timed trace step
logger.completeTraceStep(stepName: string, message?: string, metadata?: Record<string, unknown>): void
```

### Execution Tracking

```typescript
// Start an execution step
logger.startStep(stepId: string, stepName: string, metadata?: Record<string, unknown>): void

// Complete an execution step
logger.completeStep(stepId: string, metadata?: Record<string, unknown>): void

// Mark a step as failed
logger.failStep(stepId: string, error: string): void
```

### Specialized Methods

```typescript
// Custom logging with emoji
logger.logCustom(emoji: string, message: string, metadata?: Record<string, unknown>): void

// Update session metadata dynamically
logger.updateSessionMetadata(metadata: Record<string, unknown>): void
```

### Data Retrieval

```typescript
// Get all logs
logger.getAllLogs(): LogEntry[]

// Clear old sessions (older than 1 hour)
logger.clearOldSessions(): void
```

## Examples

For comprehensive examples and use cases, please see the [Examples Documentation](docs/EXAMPLES.md).

### Basic Logging

```typescript
import { getLogger } from '@dolasoftfree/logger';

const logger = getLogger();

// Simple logging
logger.info('Server started on port 3000');
logger.debug('Database connection established', { db: 'postgres' });

// Error logging with stack trace
try {
  // some operation
} catch (error) {
  logger.error('Operation failed', error, { operation: 'dataSync' });
}
```

### Execution Tracking

```typescript
import { getLogger } from '@dolasoftfree/logger';

const logger = getLogger();

// Start a session
logger.startSession('import-123', 'execution');

// Track individual steps
logger.startStep('step1', 'Loading data');
// ... perform loading
logger.completeStep('step1', { recordsLoaded: 1000 });

logger.startStep('step2', 'Processing data');
try {
  // ... process data
  logger.completeStep('step2', { recordsProcessed: 950 });
} catch (error) {
  logger.failStep('step2', error.message);
}

// End session
const session = logger.endSession();
console.log(`Total duration: ${session.totalDuration}ms`);
```

### Trace Logging with Timing

```typescript
import { getLogger } from '@dolasoftfree/logger';

const logger = getLogger();

logger.startSession('analysis-456', 'trace');

logger.startTraceStep('data-fetch', 'Fetching data from API');
// ... fetch data
logger.completeTraceStep('data-fetch', 'Data fetched successfully', { 
  records: 500 
});

logger.startTraceStep('data-transform', 'Transforming data');
// ... transform data
logger.completeTraceStep('data-transform');

logger.endSession();
```

### Remote Logging

```typescript
import { UnifiedLogger, LOG_MODES } from '@dolasoftfree/logger';

// Configure for remote logging
const logger = UnifiedLogger.getInstance({
  logMode: LOG_MODES.ROUTE,
  routeUrl: 'https://api.example.com/logs'
});

// All logs will be sent to the remote endpoint
logger.info('Remote log entry', { source: 'worker-1' });
```

### Data Sanitization

```typescript
import { UnifiedLogger } from '@dolasoftfree/logger';

const logger = UnifiedLogger.getInstance({
  sensitiveFields: ['password', 'creditCard', 'ssn']
});

// Sensitive fields will be automatically removed
logger.info('User login', {
  username: 'john.doe',
  password: 'secret123', // This will be removed
  timestamp: new Date()
});
```

### Custom Domain Logging

```typescript
import { getLogger } from '@dolasoftfree/logger';

const logger = getLogger();

// Start a session for your specific use case
logger.startSession('payment-processing', 'trace');

// Use custom logging for domain-specific events
logger.logCustom('💳', 'Processing payment', { amount: 99.99, currency: 'USD' });
logger.logCustom('🏦', 'Connecting to payment gateway', { provider: 'stripe' });

// Update session metadata as needed
logger.updateSessionMetadata({ 
  transactionId: 'tx_12345',
  customerType: 'premium' 
});

// Continue with your domain logic
logger.logCustom('✅', 'Payment processed successfully');
logger.endSession();
```

## Log Modes

1. **console**: Logs only to the console (automatically disabled in production)
2. **route**: Logs only to the HTTP endpoint
3. **both**: Logs to both console and HTTP endpoint (console disabled in production)
4. **none**: Disables all logging output

## Types

The package includes full TypeScript definitions:

```typescript
import { 
  LogEntry, 
  Session, 
  TraceStep, 
  ExecutionStep,
  LogMode,
  UnifiedLoggerConfig,
  LOG_MODES
} from '@dolasoftfree/logger';
```

## Testing

When writing tests, use the `resetInstance` method to ensure a clean state:

```typescript
import { UnifiedLogger } from '@dolasoftfree/logger';

beforeEach(() => {
  UnifiedLogger.resetInstance();
});

it('should test logging', () => {
  const logger = UnifiedLogger.getInstance({ logMode: 'none' });
  // ... your tests
});
```

## License

MIT