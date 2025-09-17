import { useCallback } from 'react';
import { LoggerService, LogLevel } from '../core';
import type { LogMethod, ErrorLogMethod } from '../core/types';

interface UseLoggerOptions {
  appSlug?: string;
  userId?: string;
  requestId?: string;
  logger?: LoggerService;
}

export function useLogger(options: UseLoggerOptions = {}) {
  const { appSlug, userId, requestId, logger } = options;

  const logWithContext = useCallback((
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
    metadata?: Record<string, unknown>
  ) => {
    const enrichedMetadata = {
      ...metadata,
      appSlug,
      userId,
      requestId
    };

    const loggerInstance = logger || LoggerService.getInstance();

    switch (level) {
      case LogLevel.DEBUG:
        loggerInstance.debug(message, context, enrichedMetadata);
        break;
      case LogLevel.INFO:
        loggerInstance.info(message, context, enrichedMetadata);
        break;
      case LogLevel.WARN:
        loggerInstance.warn(message, context, enrichedMetadata);
        break;
      case LogLevel.ERROR:
        loggerInstance.error(message, error, context, enrichedMetadata);
        break;
      case LogLevel.FATAL:
        loggerInstance.fatal(message, error, context, enrichedMetadata);
        break;
    }
  }, [appSlug, userId, requestId, logger]);

  return {
    debug: useCallback((message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
      logWithContext(LogLevel.DEBUG, message, context, undefined, metadata);
    }, [logWithContext]) as LogMethod,

    info: useCallback((message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
      logWithContext(LogLevel.INFO, message, context, undefined, metadata);
    }, [logWithContext]) as LogMethod,

    warn: useCallback((message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
      logWithContext(LogLevel.WARN, message, context, undefined, metadata);
    }, [logWithContext]) as LogMethod,

    error: useCallback((message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
      logWithContext(LogLevel.ERROR, message, context, error, metadata);
    }, [logWithContext]) as ErrorLogMethod,

    fatal: useCallback((message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
      logWithContext(LogLevel.FATAL, message, context, error, metadata);
    }, [logWithContext]) as ErrorLogMethod
  };
}

// Export types for TypeScript users
export type { UseLoggerOptions };
