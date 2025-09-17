// Core exports
export { LoggerService } from './core/logger';
export { createConfig, validateConfig } from './core/config';
export * from './core/types';

// Adapter exports
export { ConsoleAdapter } from './adapters/console';
export { MemoryAdapter } from './adapters/memory';
export { DatabaseAdapter } from './adapters/database';
export { FileAdapter } from './adapters/file';

// Integration exports
export { useLogger } from './integrations/react';
export { getServerLogger, logApiError, logApiInfo, logApiWarn, ServerLogger } from './integrations/nextjs';
export { 
  useNextJSClientLogger, 
  NextJSClientLogger, 
  createNextJSClientLogger 
} from './integrations/nextjs-client';
export { 
  SimpleLoggerProvider,
  useSimpleLogger
} from './integrations/simple-logger-provider';
export { 
  ZeroConfigLoggerProvider,
  useZeroConfigLogger as useZeroConfigLoggerLegacy
} from './integrations/zero-config-logger';
export { 
  Loggers,
  createConsoleLogger,
  createMemoryLogger,
  createFileLogger,
  createRemoteLogger,
  createHybridLogger,
  createSmartLogger
} from './integrations/zero-config-adapters';
export { 
  ConsoleProvider,
  MemoryProvider,
  FileProvider,
  RemoteProvider,
  HybridProvider,
  SmartProvider,
  useLogger as useZeroConfigLogger
} from './integrations/zero-config-react-providers';
export { 
  createLoggingMiddleware, 
  createErrorHandler, 
  createExpressLogger 
} from './integrations/express';

// Utility exports
export { generateUUID, generateShortId, generateRequestId } from './utils/uuid';
export { SingletonManager, resetAllSingletons, areSingletonsInitialized } from './utils/singleton-manager';

// Create default logger instance
import { LoggerService } from './core/logger';

// Get singleton logger instance
export function getLogger(config?: Partial<import('./core/types').LoggerConfig>): LoggerService {
  return LoggerService.getInstance(config);
}

// Convenience functions for common use cases
export const logError = (message: string, error?: Error, context?: Record<string, unknown>) => {
  getLogger().error(message, error, context);
};

export const logInfo = (message: string, context?: Record<string, unknown>) => {
  getLogger().info(message, context);
};

export const logWarn = (message: string, context?: Record<string, unknown>) => {
  getLogger().warn(message, context);
};

export const logDebug = (message: string, context?: Record<string, unknown>) => {
  getLogger().debug(message, context);
};

export const logFatal = (message: string, error?: Error, context?: Record<string, unknown>) => {
  getLogger().fatal(message, error, context);
};

// Default export
export default getLogger;
