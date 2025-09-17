'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import {
  useNextJSClientLogger,
  LogLevel,
  LogStrategy,
} from './nextjs-client';
import { isDevelopment, isProduction } from '../constants/environment';

interface ZeroConfigLoggerContextType {
  logger: {
    debug: (message: string, context?: Record<string, unknown>) => void;
    info: (message: string, context?: Record<string, unknown>) => void;
    warn: (message: string, context?: Record<string, unknown>) => void;
    error: (message: string, error?: Error, context?: Record<string, unknown>) => void;
    fatal: (message: string, error?: Error, context?: Record<string, unknown>) => void;
  };
  logUserAction: (action: string, context?: Record<string, unknown>) => void;
  logError: (message: string, error?: Error, context?: Record<string, unknown>) => void;
  logPerformance: (operation: string, duration: number, context?: Record<string, unknown>) => void;
}

const ZeroConfigLoggerContext = createContext<ZeroConfigLoggerContextType | undefined>(undefined);

interface ZeroConfigLoggerProviderProps {
  children: ReactNode;
  // Absolutely no required props - zero configuration!
}

/**
 * Zero-config logger provider that works out of the box
 * - Development: Console logging + memory (50 entries max)
 * - Production: Remote logging only (no console, no memory overflow)
 * - Smart defaults for everything
 */
export const ZeroConfigLoggerProvider: React.FC<ZeroConfigLoggerProviderProps> = ({
  children,
}) => {
  // Smart defaults - no configuration needed!
  const appSlug = 'app';
  const shouldEnableConsole = isDevelopment();
  const shouldEnableRemote = isProduction();
  const strategy = isDevelopment() ? LogStrategy.CONSOLE : LogStrategy.REMOTE;
  const level = isProduction() ? LogLevel.WARN : LogLevel.DEBUG;
  const maxMemoryEntries = 50; // Conservative for production
  const remoteEndpoint = '/api/logs';

  const logger = useNextJSClientLogger({
    appSlug,
    enableConsole: shouldEnableConsole,
    enableRemote: shouldEnableRemote,
    remoteEndpoint,
    strategy,
    level,
    maxMemoryEntries,
  });

  const logUserAction = (action: string, context?: Record<string, unknown>) => {
    logger.info(`User action: ${action}`, {
      action,
      timestamp: new Date().toISOString(),
      ...context,
    });
  };

  const logError = (
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ) => {
    logger.error(message, error, {
      timestamp: new Date().toISOString(),
      ...context,
    });
  };

  const logPerformance = (
    operation: string,
    duration: number,
    context?: Record<string, unknown>
  ) => {
    logger.info(`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
      ...context,
    });
  };

  const value: ZeroConfigLoggerContextType = {
    logger,
    logUserAction,
    logError,
    logPerformance,
  };

  return (
    <ZeroConfigLoggerContext.Provider value={value}>
      {children}
    </ZeroConfigLoggerContext.Provider>
  );
};

export const useZeroConfigLogger = (): ZeroConfigLoggerContextType => {
  const context = useContext(ZeroConfigLoggerContext);
  if (context === undefined) {
    throw new Error('useZeroConfigLogger must be used within a ZeroConfigLoggerProvider');
  }
  return context;
};

// Export the enums for convenience
export { LogLevel, LogStrategy };

export default ZeroConfigLoggerProvider;
