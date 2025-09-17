// Enhanced File Logging Examples
import { 
  getLogger, 
  LoggerService, 
  LogLevel, 
  LogStrategy 
} from '@dolasoft/logger';

// Example 1: Basic error-only file logging
const errorLogger = getLogger({
  strategy: LogStrategy.FILE,
  level: LogLevel.ERROR,
  enableFile: true,
  filePath: './logs/errors.log',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 3,
  format: 'json'
});

// Example 2: Comprehensive file logging with rotation
const fileLogger = LoggerService.create({
  strategy: LogStrategy.HYBRID,
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  filePath: './logs/app.log',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  format: 'pretty',
  includeTimestamp: true,
  includeLevel: true
});

// Example 3: Error-only logging with custom directory
const customErrorLogger = LoggerService.create({
  strategy: LogStrategy.FILE,
  level: LogLevel.ERROR,
  enableFile: true,
  directory: './logs/errors',
  fileName: 'application-errors.log',
  maxFileSize: 2 * 1024 * 1024, // 2MB
  maxFiles: 10,
  format: 'json',
  overwrite: false,
  append: true
});

// Example 4: Daily error logs with rotation
const dailyErrorLogger = LoggerService.create({
  strategy: LogStrategy.FILE,
  level: LogLevel.ERROR,
  enableFile: true,
  filePath: `./logs/errors-${new Date().toISOString().split('T')[0]}.log`,
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 30, // Keep 30 days
  format: 'json'
});

// Example 5: Debug logging with text format
const debugLogger = LoggerService.create({
  strategy: LogStrategy.FILE,
  level: LogLevel.DEBUG,
  enableFile: true,
  filePath: './logs/debug.log',
  maxFileSize: 1 * 1024 * 1024, // 1MB
  maxFiles: 3,
  format: 'text',
  includeTimestamp: true,
  includeLevel: true
});

// Usage examples
async function demonstrateFileLogging() {
  console.log('Demonstrating file logging capabilities...\n');

  // Basic error logging
  errorLogger.error('Database connection failed', new Error('Connection timeout'), {
    host: 'localhost',
    port: 5432,
    database: 'myapp'
  });

  // File logger with rotation
  fileLogger.info('Application started', {
    version: '1.0.0',
    environment: 'production'
  });

  fileLogger.warn('High memory usage detected', {
    memoryUsage: '85%',
    threshold: '80%'
  });

  // Custom error logger
  customErrorLogger.error('Payment processing failed', new Error('Invalid card'), {
    userId: 'user-123',
    amount: 99.99,
    currency: 'USD'
  });

  // Daily error logger
  dailyErrorLogger.fatal('System crash', new Error('Out of memory'), {
    timestamp: new Date().toISOString(),
    systemLoad: '100%'
  });

  // Debug logger
  debugLogger.debug('Processing user request', {
    requestId: 'req-456',
    method: 'POST',
    endpoint: '/api/users'
  });

  // Simulate file rotation by logging many entries
  console.log('Simulating file rotation...');
  for (let i = 0; i < 1000; i++) {
    fileLogger.info(`Log entry ${i}`, { iteration: i });
  }

  console.log('File logging demonstration complete!');
  console.log('Check the ./logs directory for generated files.');
}

// Error handling with file logging
function handleError(error: Error, context?: any) {
  errorLogger.error('Unhandled error', error, {
    ...context,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
}

// Process error handlers
process.on('uncaughtException', (error) => {
  handleError(error, { type: 'uncaughtException' });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  handleError(new Error(String(reason)), { 
    type: 'unhandledRejection',
    promise: promise.toString()
  });
});

// Run demonstration
if (require.main === module) {
  demonstrateFileLogging().catch(console.error);
}

export {
  errorLogger,
  fileLogger,
  customErrorLogger,
  dailyErrorLogger,
  debugLogger,
  handleError
};
