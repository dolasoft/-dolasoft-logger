import { useCallback, useEffect, useRef } from 'react';
import { LoggerService, LogLevel } from '../core';
import { LogStrategy } from '../core/types';
import type { LogMethod, ErrorLogMethod } from '../core/types';
import { generateRequestId as _generateRequestId } from '../utils/uuid';
import { isDevelopment, isProduction } from '../constants/environment';

interface NextJSClientLoggerOptions {
  appSlug?: string;
  userId?: string;
  requestId?: string;
  logger?: LoggerService;
  enableConsole?: boolean;
  enableRemote?: boolean;
  remoteEndpoint?: string;
  strategy?: LogStrategy;
  level?: import('../core/types').LogLevel;
}

// Client-side logger hook for Next.js
export function useNextJSClientLogger(options: NextJSClientLoggerOptions = {}) {
  const { 
    appSlug, 
    userId, 
    requestId, 
    logger, 
    enableConsole = true,
    enableRemote = false,
    remoteEndpoint = '/api/logs',
    strategy = isDevelopment() ? LogStrategy.CONSOLE : LogStrategy.MEMORY,
    level = isProduction() ? LogLevel.WARN : LogLevel.DEBUG
  } = options;

  const loggerRef = useRef<LoggerService | null>(null);

  // Initialize logger on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const clientLogger = logger || LoggerService.getInstance({
      strategy,
      level,
      enableConsole: enableConsole && (strategy === LogStrategy.CONSOLE || strategy === LogStrategy.HYBRID),
      enableDatabase: false,
      enableFile: false
    });

    loggerRef.current = clientLogger;
  }, [logger, enableConsole]);

  const logWithContext = useCallback((
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
    metadata?: Record<string, unknown>
  ) => {
    if (!loggerRef.current) return;

    const enrichedMetadata = {
      ...metadata,
      appSlug,
      userId,
      requestId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    switch (level) {
      case LogLevel.DEBUG:
        loggerRef.current.debug(message, context, enrichedMetadata);
        break;
      case LogLevel.INFO:
        loggerRef.current.info(message, context, enrichedMetadata);
        break;
      case LogLevel.WARN:
        loggerRef.current.warn(message, context, enrichedMetadata);
        break;
      case LogLevel.ERROR:
        loggerRef.current.error(message, error, context, enrichedMetadata);
        break;
      case LogLevel.FATAL:
        loggerRef.current.fatal(message, error, context, enrichedMetadata);
        break;
    }

    // Send to remote endpoint if enabled
    if (enableRemote && remoteEndpoint) {
      sendToRemote(level, message, context, error, enrichedMetadata);
    }
  }, [appSlug, userId, requestId, enableRemote, remoteEndpoint]);

  const sendToRemote = useCallback(async (
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
    metadata?: Record<string, unknown>
  ) => {
    try {
      await fetch(remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          context,
          error: error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : undefined,
          metadata
        })
      });
    } catch (err) {
      console.warn('Failed to send log to remote endpoint:', err);
    }
  }, [remoteEndpoint]);

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

// Client-side logger class for non-React usage
export class NextJSClientLogger {
  private logger: LoggerService;
  private appSlug?: string;
  private userId?: string;
  private requestId?: string;
  private enableRemote: boolean;
  private remoteEndpoint: string;

  constructor(options: NextJSClientLoggerOptions = {}) {
    const { 
      appSlug, 
      userId, 
      requestId, 
      logger, 
      enableConsole = true,
      enableRemote = false,
      remoteEndpoint = '/api/logs',
      strategy = process.env.NODE_ENV === 'development' ? LogStrategy.CONSOLE : LogStrategy.MEMORY,
      level = process.env.NODE_ENV === 'production' ? LogLevel.WARN : LogLevel.DEBUG
    } = options;

    this.appSlug = appSlug;
    this.userId = userId;
    this.requestId = requestId;
    this.enableRemote = enableRemote;
    this.remoteEndpoint = remoteEndpoint;

    this.logger = logger || LoggerService.getInstance({
      strategy,
      level,
      enableConsole: enableConsole && (strategy === LogStrategy.CONSOLE || strategy === LogStrategy.HYBRID),
      enableDatabase: false,
      enableFile: false
    });
  }

  private createContext(additionalContext?: Record<string, unknown>): Record<string, unknown> {
    return {
      appSlug: this.appSlug,
      userId: this.userId,
      requestId: this.requestId,
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      timestamp: new Date().toISOString(),
      ...additionalContext
    };
  }

  private async sendToRemote(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
    metadata?: Record<string, unknown>
  ) {
    if (!this.enableRemote || typeof window === 'undefined') return;

    try {
      await fetch(this.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          context,
          error: error ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          } : undefined,
          metadata
        })
      });
    } catch (err) {
      console.warn('Failed to send log to remote endpoint:', err);
    }
  }

  debug(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) {
    const enrichedContext = this.createContext(context);
    this.logger.debug(message, enrichedContext, metadata);
    this.sendToRemote(LogLevel.DEBUG, message, enrichedContext, undefined, metadata);
  }

  info(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) {
    const enrichedContext = this.createContext(context);
    this.logger.info(message, enrichedContext, metadata);
    this.sendToRemote(LogLevel.INFO, message, enrichedContext, undefined, metadata);
  }

  warn(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) {
    const enrichedContext = this.createContext(context);
    this.logger.warn(message, enrichedContext, metadata);
    this.sendToRemote(LogLevel.WARN, message, enrichedContext, undefined, metadata);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) {
    const enrichedContext = this.createContext(context);
    this.logger.error(message, error, enrichedContext, metadata);
    this.sendToRemote(LogLevel.ERROR, message, enrichedContext, error, metadata);
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) {
    const enrichedContext = this.createContext(context);
    this.logger.fatal(message, error, enrichedContext, metadata);
    this.sendToRemote(LogLevel.FATAL, message, enrichedContext, error, metadata);
  }
}

// Convenience function to create client logger
export function createNextJSClientLogger(options: NextJSClientLoggerOptions = {}) {
  return new NextJSClientLogger(options);
}

// Export types
export type { NextJSClientLoggerOptions };
