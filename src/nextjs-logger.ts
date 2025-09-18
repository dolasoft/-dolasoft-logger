/**
 * Zero-config Next.js Logger
 * Automatically detects server/client environment and configures logging accordingly
 */

import { getLogger, LogLevel, LogStrategy } from './index';

// Check if we're on the server
const isServer = typeof window === 'undefined';

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Server-side logger instance
let serverLoggerInstance: ReturnType<typeof getLogger> | null = null;

// Client-side logger instance  
let clientLoggerInstance: ReturnType<typeof getLogger> | null = null;

// Get the appropriate logger instance once
const getLoggerInstance = () => {
  return isServer ? getServerLoggerInstance() : getClientLoggerInstance();
};

/**
 * Get server-side logger instance with Next.js optimized config
 */
function getServerLoggerInstance() {
  if (isServer && !serverLoggerInstance) {
    try {
      serverLoggerInstance = getLogger({
        strategy: LogStrategy.CONSOLE,
        level: isProduction ? LogLevel.INFO : LogLevel.DEBUG,
        enableConsole: true,
        enableFile: isProduction, // Enable file logging in production
        enableDatabase: false,
        enableRemote: false,
        enableMemory: false,
        format: isProduction ? 'json' : 'pretty',
        filePath: isProduction ? './logs/server-prod.log' : './logs/server-dev.log',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        includeStack: true,
        includeMetadata: true,
        includeTimestamp: true,
        includeLevel: true,
        // Global app identifier
        appSlug: process.env.APP_SLUG || 'nextjs-app',
      });
    } catch (error) {
      console.error('Failed to initialize server logger:', error);
      // Fallback to console
      serverLoggerInstance = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        fatal: console.error,
      } as ReturnType<typeof getLogger>;
    }
  }
  return serverLoggerInstance;
}

/**
 * Get client-side logger instance with Next.js optimized config
 */
function getClientLoggerInstance() {
  if (!isServer && !clientLoggerInstance) {
    try {
      clientLoggerInstance = getLogger({
        strategy: LogStrategy.CONSOLE,
        level: isProduction ? LogLevel.WARN : LogLevel.DEBUG,
        enableConsole: true,
        enableFile: false, // No file logging in browser
        enableDatabase: false,
        enableRemote: false,
        enableMemory: false,
        format: 'pretty',
        includeStack: true,
        includeMetadata: true,
        includeTimestamp: true,
        includeLevel: true,
        // Global app identifier
        appSlug: process.env.NEXT_PUBLIC_APP_SLUG || 'nextjs-app',
      });
    } catch (error) {
      console.error('Failed to initialize client logger:', error);
      // Fallback to console
      clientLoggerInstance = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        fatal: console.error,
      } as ReturnType<typeof getLogger>;
    }
  }
  return clientLoggerInstance;
}

/**
 * Enhanced logger interface with support for appSlug, userId, and requestId
 */
interface EnhancedLoggerContext {
  appSlug?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Helper function to create logger methods
 */
function createLoggerMethod(
  method: 'debug' | 'info' | 'warn'
) {
  return (
    message: string,
    context: EnhancedLoggerContext = {},
    metadata: Record<string, unknown> = {}
  ) => {
    const logInstance = getLoggerInstance();
    logInstance?.[method](message, context, metadata);
  };
}

/**
 * Helper function to create error logger methods
 */
function createErrorLoggerMethod(
  method: 'error' | 'fatal'
) {
  return (
    message: string,
    error?: Error,
    context: EnhancedLoggerContext = {},
    metadata: Record<string, unknown> = {}
  ) => {
    const logInstance = getLoggerInstance();
    logInstance?.[method](message, error, context, metadata);
  };
}

/**
 * Universal logger interface that works on both server and client
 * Zero configuration required - automatically detects environment
 * Supports appSlug, userId, and requestId through context
 */
export const logger = {
  debug: createLoggerMethod('debug'),
  info: createLoggerMethod('info'),
  warn: createLoggerMethod('warn'),
  error: createErrorLoggerMethod('error'),
  fatal: createErrorLoggerMethod('fatal'),
};

/**
 * Hook for client-side components to use the logger
 * Returns the same logger instance but typed for React components
 */
export function useClientLogger() {
  return logger;
}

/**
 * Server-side logger for API routes and server components
 * Optimized for server-side logging with file output in production
 * Note: Use the universal 'logger' export instead for better functionality
 */
export const serverLogger = {
  debug: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getServerLoggerInstance()?.debug(message, context, metadata);
  },
  info: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getServerLoggerInstance()?.info(message, context, metadata);
  },
  warn: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getServerLoggerInstance()?.warn(message, context, metadata);
  },
  error: (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getServerLoggerInstance()?.error(message, error, context, metadata);
  },
  fatal: (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getServerLoggerInstance()?.fatal(message, error, context, metadata);
  },
};

/**
 * Client-side logger for browser components
 * Optimized for browser logging with console output only
 * Note: Use the universal 'logger' export instead for better functionality
 */
export const clientLogger = {
  debug: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getClientLoggerInstance()?.debug(message, context, metadata);
  },
  info: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getClientLoggerInstance()?.info(message, context, metadata);
  },
  warn: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getClientLoggerInstance()?.warn(message, context, metadata);
  },
  error: (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getClientLoggerInstance()?.error(message, error, context, metadata);
  },
  fatal: (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getClientLoggerInstance()?.fatal(message, error, context, metadata);
  },
};

// Default export - the universal logger
export default logger;

// Re-export types for convenience
export type { LoggerConfig, LogLevel, LogStrategy, LogEntry } from './core/types';
