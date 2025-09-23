# Unified Logger Examples

This document contains comprehensive examples demonstrating various use cases and features of the Unified Logger package.

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Session-Based Logging](#session-based-logging)
3. [Execution Tracking](#execution-tracking)
4. [Production Safety](#production-safety)
5. [Domain-Specific Examples](#domain-specific-examples)
6. [Advanced Patterns](#advanced-patterns)

## Basic Usage

### Simple Logging with Singleton

```javascript
const { getLogger } = require('@dolasoftfree/logger');

// Get the logger instance
const logger = getLogger();
logger.info('Application started');
logger.debug('Debug information', { module: 'example', version: '1.0.0' });
logger.warn('This is a warning', { threshold: 0.8 });
logger.error('An error occurred', new Error('Sample error'), { userId: 123 });
```

### Custom Configuration

```javascript
const { UnifiedLogger, LOG_MODES } = require('@dolasoftfree/logger');

// Get singleton with custom configuration
const logger = UnifiedLogger.getInstance({
  logMode: LOG_MODES.CONSOLE,
  maxLogs: 500,
  sensitiveFields: ['password', 'apiKey', 'secret']
});

// Sensitive data will be automatically removed
logger.info('User login attempt', {
  username: 'john.doe',
  password: 'this-will-be-removed',
  apiKey: 'also-removed',
  timestamp: new Date().toISOString()
});
```

## Session-Based Logging

### Trace Sessions

```javascript
const { getLogger } = require('@dolasoftfree/logger');

const logger = getLogger();

// Start a trace session
logger.startSession('example-session-1', 'trace', { 
  user: 'john.doe',
  action: 'data-import' 
});

// Add trace steps
logger.startTraceStep('fetch-data', 'Fetching data from API');
// ... perform operation
logger.completeTraceStep('fetch-data', 'Data fetched successfully', { 
  records: 150 
});

logger.startTraceStep('process-data', 'Processing fetched data');
// ... perform processing
logger.completeTraceStep('process-data', 'Processing complete', { 
  processed: 145, 
  failed: 5 
});

// End the session
const session = logger.endSession();
console.log(`Total duration: ${session.totalDuration}ms`);
console.log(`Steps completed: ${session.steps.length}`);
```

### Execution Sessions

```javascript
const { getLogger } = require('@dolasoftfree/logger');

const logger = getLogger();

logger.startSession('execution-example', 'execution');

// Track individual steps
logger.startStep('step1', 'Initialize database connection');
// ... perform operation
logger.completeStep('step1', { connectionPool: 10 });

logger.startStep('step2', 'Run database migrations');
// ... perform operation
logger.completeStep('step2', { migrationsRun: 3 });

logger.startStep('step3', 'Load initial data');
try {
  // ... operation that might fail
  throw new Error('Failed to connect to data source');
} catch (error) {
  logger.failStep('step3', error.message);
}

logger.endSession();
```

## Production Safety

### Automatic Console Silencing

```javascript
const { UnifiedLogger, LOG_MODES } = require('@dolasoftfree/logger');

// Development environment (NODE_ENV !== 'production')
const devLogger = UnifiedLogger.getInstance({
  logMode: LOG_MODES.CONSOLE
});
devLogger.info('This will appear in console'); // ✅ Shows in console

// Production environment (NODE_ENV === 'production')
process.env.NODE_ENV = 'production';
UnifiedLogger.resetInstance(); // Reset for new environment

const prodLogger = UnifiedLogger.getInstance({
  logMode: LOG_MODES.CONSOLE  // Automatically becomes 'none' in production
});
prodLogger.info('This will NOT appear in console'); // ❌ Silent in production
prodLogger.error('Even errors are silent in production'); // ❌ Silent in production
```

### Route-Only Logging in Production

```javascript
process.env.NODE_ENV = 'production';
process.env.LOG_ROUTE_URL = 'https://api.example.com/logs';

const { UnifiedLogger, LOG_MODES } = require('@dolasoftfree/logger');

const logger = UnifiedLogger.getInstance({
  logMode: LOG_MODES.ROUTE // Works in production
});

// Logs will only be sent to the remote endpoint
logger.info('Production log entry', { 
  server: 'web-01',
  region: 'us-east-1' 
});
```

### Mixed Mode in Production

```javascript
const { UnifiedLogger, LOG_MODES } = require('@dolasoftfree/logger');

// In production, 'both' mode becomes 'route' only
process.env.NODE_ENV = 'production';
const logger = UnifiedLogger.getInstance({
  logMode: LOG_MODES.BOTH, // Automatically becomes 'route' in production
  routeUrl: 'https://api.example.com/logs'
});

logger.info('Sent to API only, not console'); // Only sent to route in production
```

## Domain-Specific Examples

### E-commerce Order Processing

```javascript
const { UnifiedLogger, LOG_MODES } = require('@dolasoftfree/logger');

const logger = UnifiedLogger.getInstance({
  logMode: LOG_MODES.BOTH,
  routeUrl: 'https://api.store.com/logs'
});

logger.startSession('order-12345', 'trace', { 
  customerId: 'cust-789',
  orderTotal: 149.99 
});

logger.logCustom('🛒', 'Order received', { items: 3 });
logger.logCustom('📦', 'Checking inventory');
logger.updateSessionMetadata({ warehouseId: 'wh-east-1' });
logger.logCustom('💳', 'Processing payment', { method: 'credit_card' });
logger.logCustom('✅', 'Order confirmed', { confirmationNumber: 'ABC123' });

const session = logger.endSession();
console.log(`Order processing took: ${session.totalDuration}ms`);
```

### API Request Monitoring

```javascript
const { getLogger } = require('@dolasoftfree/logger');

const logger = getLogger();

// Middleware for Express.js
app.use((req, res, next) => {
  const sessionId = `api-${Date.now()}`;
  
  logger.startSession(sessionId, 'execution', {
    endpoint: req.path,
    method: req.method,
    ip: req.ip
  });

  logger.startStep('auth', 'Authenticating request');
  
  // Override res.end to capture response
  const originalEnd = res.end;
  res.end = function(...args) {
    logger.updateSessionMetadata({
      statusCode: res.statusCode,
      responseTime: Date.now()
    });
    logger.endSession();
    originalEnd.apply(res, args);
  };

  next();
});
```

### Machine Learning Pipeline

```javascript
const { UnifiedLogger, LOG_MODES } = require('@dolasoftfree/logger');

const logger = UnifiedLogger.getInstance({
  sensitiveFields: ['modelWeights', 'trainingData']
});

async function runMLPipeline(config) {
  logger.startSession('ml-pipeline-' + Date.now(), 'trace', {
    model: config.modelName,
    dataset: config.datasetName
  });

  try {
    logger.logCustom('📊', 'Loading dataset', { records: config.recordCount });
    const data = await loadDataset(config.datasetPath);
    
    logger.logCustom('🧹', 'Preprocessing data');
    const processed = await preprocessData(data);
    
    logger.logCustom('🧮', 'Training model', { epochs: config.epochs });
    const model = await trainModel(processed, config);
    
    logger.updateSessionMetadata({ 
      accuracy: model.accuracy,
      f1Score: model.f1Score 
    });
    
    logger.logCustom('💾', 'Saving model', { path: config.outputPath });
    await saveModel(model, config.outputPath);
    
  } catch (error) {
    logger.error('Pipeline failed', error);
    throw error;
  } finally {
    logger.endSession();
  }
}
```

### IoT Device Monitoring

```javascript
const { UnifiedLogger, LOG_MODES } = require('@dolasoftfree/logger');

class DeviceMonitor {
  constructor(deviceId, thresholds) {
    this.deviceId = deviceId;
    this.thresholds = thresholds;
    this.logger = UnifiedLogger.getInstance({
      logMode: LOG_MODES.BOTH,
      routeUrl: process.env.IOT_LOG_ENDPOINT
    });
  }

  startMonitoring() {
    this.logger.startSession(this.deviceId, 'general', {
      deviceType: 'temperature-sensor',
      location: this.location
    });

    // Simulate periodic readings
    this.interval = setInterval(() => {
      const reading = this.getReading();
      
      this.logger.logCustom('🌡️', 'Temperature reading', { 
        celsius: reading.temperature,
        fahrenheit: (reading.temperature * 9/5) + 32
      });
      
      if (reading.temperature > this.thresholds.temperature) {
        this.logger.logCustom('⚠️', 'Temperature threshold exceeded', { 
          current: reading.temperature, 
          threshold: this.thresholds.temperature 
        });
        
        this.logger.updateSessionMetadata({
          alertTriggered: true,
          alertTime: new Date().toISOString()
        });
      }
    }, 5000);
  }

  stopMonitoring() {
    clearInterval(this.interval);
    this.logger.endSession();
  }
}
```

## Advanced Patterns

### Testing with Logger

```javascript
const { UnifiedLogger, LOG_MODES } = require('@dolasoftfree/logger');

describe('MyService', () => {
  beforeEach(() => {
    // Reset singleton for each test
    UnifiedLogger.resetInstance();
  });

  it('should log operations', () => {
    // Configure logger for testing
    const logger = UnifiedLogger.getInstance({
      logMode: LOG_MODES.NONE // Silent during tests
    });

    // Your test code here
    const service = new MyService(logger);
    service.performOperation();
    
    // Check logs if needed
    const logs = logger.getAllLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0].message).toBe('Operation completed');
  });
});
```

### Async Operation Tracking

```javascript
const { getLogger } = require('@dolasoftfree/logger');

const logger = getLogger();

class AsyncOperationTracker {
  async trackOperation(name, operation) {
    const sessionId = `${name}-${Date.now()}`;
    logger.startSession(sessionId, 'trace');
    
    try {
      logger.startTraceStep(name, `Starting ${name}`);
      const result = await operation();
      logger.completeTraceStep(name, `${name} completed successfully`);
      return result;
    } catch (error) {
      logger.addTraceStep('error', `❌ ${name} failed: ${error.message}`);
      throw error;
    } finally {
      logger.endSession();
    }
  }
}

// Usage
const tracker = new AsyncOperationTracker();
await tracker.trackOperation('data-fetch', async () => {
  return await fetch('/api/data');
});
```

### Conditional Logging

```javascript
const { UnifiedLogger, LOG_MODES } = require('@dolasoftfree/logger');

class ConditionalLogger {
  constructor(config) {
    this.logger = UnifiedLogger.getInstance(config);
    this.verbosity = process.env.LOG_VERBOSITY || 'info';
  }

  logIf(condition, level, message, context) {
    if (condition && this.shouldLog(level)) {
      this.logger[level](message, context);
    }
  }

  shouldLog(level) {
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentIndex = levels.indexOf(this.verbosity);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
  }
}
```

### Structured Error Logging

```javascript
const { getLogger } = require('@dolasoftfree/logger');

const logger = getLogger();

class ErrorLogger {
  logError(error, context = {}) {
    const errorInfo = {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString(),
      ...context
    };

    // Log different error types differently
    if (error.statusCode >= 500) {
      logger.error('Server error', error, errorInfo);
    } else if (error.statusCode >= 400) {
      logger.warn('Client error', errorInfo);
    } else {
      logger.error('Unknown error', error, errorInfo);
    }

    // In development, also log the stack
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Error stack', { stack: error.stack });
    }
  }
}
```

### Performance Monitoring

```javascript
const { getLogger } = require('@dolasoftfree/logger');

const logger = getLogger();

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  startMeasure(name) {
    this.metrics.set(name, {
      start: performance.now(),
      memory: process.memoryUsage()
    });
  }

  endMeasure(name, metadata = {}) {
    const metric = this.metrics.get(name);
    if (!metric) return;

    const duration = performance.now() - metric.start;
    const currentMemory = process.memoryUsage();
    const memoryDelta = {
      heapUsed: currentMemory.heapUsed - metric.memory.heapUsed,
      external: currentMemory.external - metric.memory.external
    };

    logger.info(`Performance: ${name}`, {
      duration: `${duration.toFixed(2)}ms`,
      memoryDelta,
      ...metadata
    });

    this.metrics.delete(name);
  }
}
```

## Best Practices

1. **Use the singleton instance** (`logger`) for consistency across your application
2. **Use `LOG_MODES` constants** instead of string literals for better type safety
3. **Leverage automatic production safety** - console logs are automatically disabled in production
4. **Use structured metadata** instead of string concatenation for better log analysis
5. **Implement proper error handling** in your logging code to prevent logging failures from affecting your application
6. **Use sessions** for related operations to maintain context
7. **Configure sensitive fields** appropriately for your domain
8. **Use custom emojis** sparingly and consistently for better visual scanning
9. **Set appropriate log retention** limits based on your monitoring needs
10. **Reset the singleton** in tests using `UnifiedLogger.resetInstance()` for isolation

## TypeScript Usage

```typescript
import { getLogger, UnifiedLogger, LOG_MODES, LogEntry, Session } from '@dolasoftfree/logger';

// Get the logger instance
const logger = getLogger();
logger.info('TypeScript example');

// Custom configuration with type safety
const customLogger = UnifiedLogger.getInstance({
  logMode: LOG_MODES.BOTH,
  maxLogs: 1000,
  sensitiveFields: ['password', 'token']
});

// Type-safe session handling
const session: Session | null = logger.endSession();
if (session) {
  console.log(`Duration: ${session.totalDuration}ms`);
}

// Type-safe log retrieval
const logs: LogEntry[] = logger.getAllLogs();
logs.forEach((log: LogEntry) => {
  console.log(`[${log.level}] ${log.message}`);
});
```