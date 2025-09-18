/**
 * Example usage of the improved @dolasoftfree/logger
 * This shows how to use the zero-config logger with appSlug, userId, and requestId support
 */

import { logger, LogLevel, LogStrategy } from './src/nextjs-logger';

// Example 1: Basic logging (zero config)
logger.info('Application started');
logger.debug('Debug information', { component: 'App' });
logger.warn('Warning message', { warning: 'Deprecated API used' });

// Example 2: Error logging with context
try {
  throw new Error('Something went wrong');
} catch (error) {
  logger.error('Failed to process request', error as Error, {
    component: 'API',
    endpoint: '/api/users'
  });
}

// Example 3: Logging with appSlug, userId, and requestId
logger.info('User action performed', {
  appSlug: 'my-nextjs-app',
  userId: 'user-123',
  requestId: 'req-456',
  action: 'login',
  component: 'Auth'
});

// Example 4: Server-side logging (automatically detected)
logger.info('Server-side log', {
  appSlug: 'my-nextjs-app',
  requestId: 'req-789',
  method: 'GET',
  url: '/api/data'
});

// Example 5: Client-side logging (automatically detected)
logger.debug('Client-side interaction', {
  appSlug: 'my-nextjs-app',
  userId: 'user-123',
  component: 'Button',
  action: 'click'
});

// Example 6: Fatal error logging
logger.fatal('Critical system error', new Error('Database connection failed'), {
  appSlug: 'my-nextjs-app',
  component: 'Database',
  severity: 'critical'
});

console.log('✅ All examples completed successfully!');
console.log('📁 Check ./logs/ directory for log files:');
console.log('   - Development: ./logs/server-dev.log');
console.log('   - Production: ./logs/server-prod.log');
