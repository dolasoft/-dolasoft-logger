// Node.js example
const { 
  getLogger, 
  LoggerService, 
  LogLevel, 
  LogStrategy 
} = require('@dolasoft/logger');

// Basic Node.js usage
const logger = getLogger({
  strategy: LogStrategy.HYBRID,
  level: LogLevel.INFO,
  enableConsole: true,
  enableFile: true,
  filePath: './logs/app.log'
});

logger.info('Node.js application started');

// Express.js integration
const express = require('express');
const { createLoggingMiddleware, createErrorHandler } = require('@dolasoft/logger/express');

const app = express();

// Add logging middleware
app.use(createLoggingMiddleware());

// Your routes
app.get('/api/users', (req, res) => {
  logger.info('Users endpoint called', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent')
  });
  
  res.json({ users: [] });
});

// Error handling
app.use(createErrorHandler());

// File system operations
const fs = require('fs');

try {
  const data = fs.readFileSync('./config.json', 'utf8');
  logger.info('Config file loaded', { size: data.length });
} catch (error) {
  logger.error('Failed to read config file', error);
}

// Database operations (example)
async function connectToDatabase() {
  try {
    // Simulate database connection
    logger.info('Connecting to database...');
    // await db.connect();
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error('Database connection failed', error, {
      host: 'localhost',
      port: 5432,
      database: 'myapp'
    });
  }
}

// Process event handlers
process.on('uncaughtException', (error) => {
  logger.fatal('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled promise rejection', new Error(reason), {
    promise: promise.toString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info('Server started', { port: PORT });
});
