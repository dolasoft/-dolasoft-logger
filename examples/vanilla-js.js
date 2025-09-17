// Vanilla JavaScript example
const { getLogger, logInfo, logError, LogLevel } = require('@dolasoft/logger');

// Basic usage
const logger = getLogger();

logger.info('Application started');
logger.warn('This is a warning');
logger.error('Something went wrong', new Error('Test error'));

// With context
logger.info('User action', { 
  userId: 'user-123', 
  action: 'login',
  timestamp: new Date().toISOString()
});

// Convenience functions
logInfo('Quick info message');
logError('Quick error message', new Error('Test error'));

// Custom configuration
const customLogger = getLogger({
  strategy: 'console',
  level: LogLevel.DEBUG,
  enableConsole: true
});

customLogger.debug('Debug message');
customLogger.info('Info message');
