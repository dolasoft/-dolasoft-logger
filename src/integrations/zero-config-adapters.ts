import { LoggerService, LogLevel, LogStrategy } from '../core';
import { isDevelopment, isProduction } from '../constants/environment';

/**
 * Zero-config console logger - works out of the box
 * - Development: Full console logging
 * - Production: No console logging (safe for production)
 */
export function createConsoleLogger() {
  return LoggerService.getInstance({
    strategy: LogStrategy.CONSOLE,
    level: isDevelopment() ? LogLevel.DEBUG : LogLevel.WARN,
    enableConsole: isDevelopment(), // Only in development
  });
}

/**
 * Zero-config memory logger - works out of the box
 * - Development: 50 entries max for debugging
 * - Production: 10 entries max (very conservative)
 */
export function createMemoryLogger() {
  return LoggerService.getInstance({
    strategy: LogStrategy.MEMORY,
    level: isDevelopment() ? LogLevel.DEBUG : LogLevel.WARN,
    maxMemoryEntries: isDevelopment() ? 50 : 10, // Conservative in production
  });
}

/**
 * Zero-config file logger - works out of the box
 * - Development: Logs to ./logs/dev.log
 * - Production: Logs to ./logs/prod.log
 * - Auto-creates directories
 * - 10MB max file size, 5 files max
 */
export function createFileLogger() {
  const logDir = isDevelopment() ? './logs/dev' : './logs/prod';
  const logFile = isDevelopment() ? 'dev.log' : 'prod.log';
  
  return LoggerService.getInstance({
    strategy: LogStrategy.FILE,
    level: isDevelopment() ? LogLevel.DEBUG : LogLevel.WARN,
    enableFile: true,
    filePath: `${logDir}/${logFile}`,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    format: 'json',
    includeTimestamp: true,
    includeLevel: true,
  });
}

/**
 * Zero-config remote logger - works out of the box
 * - Development: Disabled (no remote calls)
 * - Production: Sends to /api/logs endpoint
 */
export function createRemoteLogger() {
  return LoggerService.getInstance({
    strategy: LogStrategy.REMOTE,
    level: isDevelopment() ? LogLevel.DEBUG : LogLevel.WARN,
    enableRemote: isProduction(), // Only in production
    remoteEndpoint: '/api/logs',
  });
}

/**
 * Zero-config hybrid logger - works out of the box
 * - Development: Console + Memory + File
 * - Production: File + Remote (no console, no memory)
 */
export function createHybridLogger() {
  const logDir = isDevelopment() ? './logs/dev' : './logs/prod';
  const logFile = isDevelopment() ? 'hybrid.log' : 'hybrid.log';
  
  return LoggerService.getInstance({
    strategy: LogStrategy.HYBRID,
    level: isDevelopment() ? LogLevel.DEBUG : LogLevel.WARN,
    enableConsole: isDevelopment(), // Only in development
    enableFile: true, // Always enabled
    enableRemote: isProduction(), // Only in production
    maxMemoryEntries: isDevelopment() ? 50 : 0, // No memory in production
    filePath: `${logDir}/${logFile}`,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    format: 'json',
    remoteEndpoint: '/api/logs',
  });
}

/**
 * Zero-config smart logger - automatically chooses the best strategy
 * - Development: Console + Memory (for debugging)
 * - Production: File + Remote (for production monitoring)
 */
export function createSmartLogger() {
  if (isDevelopment()) {
    // Development: Console + Memory for easy debugging
    return LoggerService.getInstance({
      strategy: LogStrategy.HYBRID,
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableMemory: true,
      enableFile: false,
      enableRemote: false,
      maxMemoryEntries: 50,
    });
  } else {
    // Production: File + Remote for monitoring
    return LoggerService.getInstance({
      strategy: LogStrategy.HYBRID,
      level: LogLevel.WARN,
      enableConsole: false,
      enableMemory: false,
      enableFile: true,
      enableRemote: true,
      filePath: './logs/prod.log',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      format: 'json',
      remoteEndpoint: '/api/logs',
    });
  }
}

// Export all zero-config loggers
export const Loggers = {
  console: createConsoleLogger,
  memory: createMemoryLogger,
  file: createFileLogger,
  remote: createRemoteLogger,
  hybrid: createHybridLogger,
  smart: createSmartLogger, // Recommended default
} as const;

// Default export - the smart logger
export default createSmartLogger;
