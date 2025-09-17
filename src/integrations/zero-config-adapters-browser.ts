import { LoggerService } from '../core/browser-logger';
import { LogLevel, LogStrategy } from '../core/types';
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
 * - Development: Console + Memory
 * - Production: Memory + Remote (no console, no file)
 */
export function createHybridLogger() {
  return LoggerService.getInstance({
    strategy: LogStrategy.HYBRID,
    level: isDevelopment() ? LogLevel.DEBUG : LogLevel.WARN,
    enableConsole: isDevelopment(), // Only in development
    enableMemory: true, // Always enabled
    enableRemote: isProduction(), // Only in production
    maxMemoryEntries: isDevelopment() ? 50 : 0, // No memory in production
    remoteEndpoint: '/api/logs',
  });
}

/**
 * Zero-config smart logger - automatically chooses the best strategy
 * - Development: Console + Memory (for debugging)
 * - Production: Memory + Remote (for production monitoring)
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
    // Production: Memory + Remote for monitoring
    return LoggerService.getInstance({
      strategy: LogStrategy.HYBRID,
      level: LogLevel.WARN,
      enableConsole: false,
      enableMemory: true,
      enableFile: false,
      enableRemote: true,
      maxMemoryEntries: 10,
      remoteEndpoint: '/api/logs',
    });
  }
}

// Export all zero-config loggers
export const Loggers = {
  console: createConsoleLogger,
  memory: createMemoryLogger,
  file: () => {
    throw new Error('File logging is not available in browser environments. Use console, memory, remote, or hybrid loggers instead.');
  },
  remote: createRemoteLogger,
  hybrid: createHybridLogger,
  smart: createSmartLogger, // Recommended default
} as const;

// Default export - the smart logger
export default createSmartLogger;
