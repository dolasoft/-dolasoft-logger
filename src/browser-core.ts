// Browser-specific core logger (without React dependencies)
// This is the minimal browser bundle without React components

// Core types and enums
export type {
  LogEntry,
  LoggerConfig,
  LogAdapter,
  LogStats,
  ILoggerService
} from './core/types';

// Export enums as values (not just types)
export { LogLevel, LogStrategy } from './core/types';

// Core logger service (browser version)
export { LoggerService } from './core/browser-logger';

// Adapters (browser-compatible only)
export { ConsoleAdapter } from './adapters/console';
export { MemoryAdapter } from './adapters/memory';
export { DatabaseAdapter } from './adapters/database';
// FileAdapter excluded - Node.js only

// Zero-config adapters (browser version)
export {
  Loggers,
  createConsoleLogger,
  createMemoryLogger,
  // createFileLogger excluded - Node.js only
  createRemoteLogger,
  createHybridLogger,
  createSmartLogger
} from './integrations/zero-config-adapters-browser';

// Utility exports
export { generateUUID, generateShortId, generateRequestId } from './utils/uuid';
export { SingletonManager, resetAllSingletons, areSingletonsInitialized } from './utils/singleton-manager';

// Create default logger instance
import { LoggerService } from './core/browser-logger';
import { SingletonManager } from './utils/singleton-manager';

// Register the browser logger service with the singleton manager (browser only)
SingletonManager.registerLoggerForEnvironment('browser-logger', 'browser', LoggerService);

// Get singleton logger instance
export function getLogger(config?: Partial<import('./core/types').LoggerConfig>): LoggerService {
  return LoggerService.getInstance(config);
}

// Convenience functions
export const logDebug = (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
  getLogger().debug(message, context, metadata);
};

export const logInfo = (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
  getLogger().info(message, context, metadata);
};

export const logWarn = (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
  getLogger().warn(message, context, metadata);
};

export const logError = (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
  getLogger().error(message, error, context, metadata);
};

export const logFatal = (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
  getLogger().fatal(message, error, context, metadata);
};

// Configuration utilities
export { createConfig, validateConfig } from './core/config';
