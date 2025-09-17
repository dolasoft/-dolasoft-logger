// TypeScript example
import { 
  getLogger, 
  logInfo, 
  logError, 
  LogLevel, 
  LogStrategy,
  LoggerService 
} from '@dolasoft/logger';

// Basic usage
const logger = getLogger();

logger.info('Application started');
logger.warn('This is a warning');
logger.error('Something went wrong', new Error('Test error'));

// With context and metadata
logger.info('User action', { 
  userId: 'user-123', 
  action: 'login',
  timestamp: new Date().toISOString()
}, {
  sessionId: 'session-456',
  ipAddress: '192.168.1.1'
});

// Convenience functions
logInfo('Quick info message');
logError('Quick error message', new Error('Test error'));

// Custom configuration
const customLogger = getLogger({
  strategy: LogStrategy.CONSOLE,
  level: LogLevel.DEBUG,
  enableConsole: true
});

customLogger.debug('Debug message');
customLogger.info('Info message');

// Create multiple logger instances
const fileLogger = LoggerService.create({
  strategy: LogStrategy.FILE,
  level: LogLevel.INFO,
  enableFile: true,
  filePath: './logs/app.log'
});

fileLogger.info('This will be written to file');

// Error handling with context
try {
  throw new Error('Something went wrong');
} catch (error) {
  logger.error('Caught an error', error as Error, {
    function: 'main',
    line: 45
  });
}
