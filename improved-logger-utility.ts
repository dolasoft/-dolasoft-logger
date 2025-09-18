/**
 * Improved Logger utility for Next.js application
 * Uses the fixed @dolasoftfree/logger with proper enum exports
 * Zero configuration required - automatically detects environment
 */

import { getLogger, LogStrategy, LogLevel } from '@dolasoftfree/logger';

// Check if we're on the server
const isServer = typeof window === 'undefined';

// Check if we're in production
const isProduction = process.env.NODE_ENV === 'production';

// Server-side logger instance
let serverLogger: ReturnType<typeof getLogger> | null = null;

// Client-side logger instance
let clientLogger: ReturnType<typeof getLogger> | null = null;

/**
 * Get server-side logger instance with optimized config
 */
function getServerLoggerInstance() {
  if (isServer && !serverLogger) {
    try {
      serverLogger = getLogger({
        enableConsole: true,
        enableDatabase: false,
        enableFile: isProduction, // Enable file logging in production
        strategy: LogStrategy.CONSOLE,
        level: isProduction ? LogLevel.INFO : LogLevel.DEBUG,
        filePath: isProduction ? './logs/server-prod.log' : './logs/server-dev.log',
        format: isProduction ? 'json' : 'pretty',
        maxFileSize: 10 * 1024 * 1024, // 10MB
        maxFiles: 5,
        includeStack: true,
        includeMetadata: true,
        includeTimestamp: true,
        includeLevel: true,
      });
    } catch (error) {
      console.error('Failed to initialize server logger:', error);
      // Fallback to console
      serverLogger = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        fatal: console.error,
      } as ReturnType<typeof getLogger>;
    }
  }
  return serverLogger;
}

/**
 * Get client-side logger instance with optimized config
 */
function getClientLoggerInstance() {
  if (!isServer && !clientLogger) {
    try {
      clientLogger = getLogger({
        enableConsole: true,
        enableDatabase: false,
        enableFile: false, // No file logging in browser
        strategy: LogStrategy.CONSOLE,
        level: isProduction ? LogLevel.WARN : LogLevel.DEBUG,
        format: 'pretty',
        includeStack: true,
        includeMetadata: true,
        includeTimestamp: true,
        includeLevel: true,
      });
    } catch (error) {
      console.error('Failed to initialize client logger:', error);
      // Fallback to console
      clientLogger = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        fatal: console.error,
      } as ReturnType<typeof getLogger>;
    }
  }
  return clientLogger;
}

/**
 * Enhanced context interface with appSlug, userId, and requestId support
 */
interface EnhancedLoggerContext {
  appSlug?: string;
  userId?: string;
  requestId?: string;
  [key: string]: unknown;
}

/**
 * Universal logger interface that works on both server and client
 * Zero configuration required - automatically detects environment
 * Supports appSlug, userId, and requestId through context
 */
export const logger = {
  debug: (
    message: string,
    context?: EnhancedLoggerContext,
    metadata?: Record<string, unknown>
  ) => {
    const logInstance = isServer ? getServerLoggerInstance() : getClientLoggerInstance();
    
    // Merge appSlug, userId, requestId into context for LogEntry
    const enhancedContext = {
      ...context,
      ...(context?.appSlug && { appSlug: context.appSlug }),
      ...(context?.userId && { userId: context.userId }),
      ...(context?.requestId && { requestId: context.requestId }),
    };
    
    logInstance?.debug(message, enhancedContext, metadata);
  },

  info: (
    message: string,
    context?: EnhancedLoggerContext,
    metadata?: Record<string, unknown>
  ) => {
    const logInstance = isServer ? getServerLoggerInstance() : getClientLoggerInstance();
    
    const enhancedContext = {
      ...context,
      ...(context?.appSlug && { appSlug: context.appSlug }),
      ...(context?.userId && { userId: context.userId }),
      ...(context?.requestId && { requestId: context.requestId }),
    };
    
    logInstance?.info(message, enhancedContext, metadata);
  },

  warn: (
    message: string,
    context?: EnhancedLoggerContext,
    metadata?: Record<string, unknown>
  ) => {
    const logInstance = isServer ? getServerLoggerInstance() : getClientLoggerInstance();
    
    const enhancedContext = {
      ...context,
      ...(context?.appSlug && { appSlug: context.appSlug }),
      ...(context?.userId && { userId: context.userId }),
      ...(context?.requestId && { requestId: context.requestId }),
    };
    
    logInstance?.warn(message, enhancedContext, metadata);
  },

  error: (
    message: string,
    error?: Error,
    context?: EnhancedLoggerContext,
    metadata?: Record<string, unknown>
  ) => {
    const logInstance = isServer ? getServerLoggerInstance() : getClientLoggerInstance();
    
    const enhancedContext = {
      ...context,
      ...(context?.appSlug && { appSlug: context.appSlug }),
      ...(context?.userId && { userId: context.userId }),
      ...(context?.requestId && { requestId: context.requestId }),
    };
    
    logInstance?.error(message, error, enhancedContext, metadata);
  },

  fatal: (
    message: string,
    error?: Error,
    context?: EnhancedLoggerContext,
    metadata?: Record<string, unknown>
  ) => {
    const logInstance = isServer ? getServerLoggerInstance() : getClientLoggerInstance();
    
    const enhancedContext = {
      ...context,
      ...(context?.appSlug && { appSlug: context.appSlug }),
      ...(context?.userId && { userId: context.userId }),
      ...(context?.requestId && { requestId: context.requestId }),
    };
    
    logInstance?.fatal(message, error, enhancedContext, metadata);
  },
};

/**
 * Hook for client-side components to use the logger
 */
export function useClientLogger() {
  return logger;
}

export default logger;
