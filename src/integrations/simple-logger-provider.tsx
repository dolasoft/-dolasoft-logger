'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import {
  useNextJSClientLogger,
  LogLevel,
  LogStrategy,
} from './nextjs-client';
import { isDevelopment, isProduction } from '../constants/environment';

interface SimpleLoggerContextType {
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

const SimpleLoggerContext = createContext<SimpleLoggerContextType | undefined>(undefined);

interface SimpleLoggerProviderProps {
  children: ReactNode;
  // All props are optional - zero config by default!
  appSlug?: string;
  userId?: string;
  requestId?: string;
  enableConsole?: boolean; // Override for development debugging
  maxMemoryEntries?: number; // Control memory usage
  remoteEndpoint?: string; // API endpoint for remote logging
}

export const SimpleLoggerProvider: React.FC<SimpleLoggerProviderProps> = ({
  children,
  appSlug = 'app', // Simple default
  userId,
  requestId,
  enableConsole,
  maxMemoryEntries = 50, // Very conservative default for production
  remoteEndpoint = '/api/logs', // Default remote endpoint
}) => {
  // Smart defaults based on environment
  const shouldEnableConsole = enableConsole ?? isDevelopment();
  const shouldEnableRemote = isProduction();
  const strategy = isDevelopment() ? LogStrategy.CONSOLE : LogStrategy.REMOTE;
  const level = isProduction() ? LogLevel.WARN : LogLevel.DEBUG;

  const logger = useNextJSClientLogger({
    appSlug,
    userId,
    requestId,
    enableConsole: shouldEnableConsole,
    enableRemote: shouldEnableRemote,
    remoteEndpoint,
    strategy,
    level,
    maxMemoryEntries, // Prevent memory overflow
  });

  const logUserAction = (action: string, context?: Record<string, unknown>) => {
    logger.info(`User action: ${action}`, {
      action,
      userId,
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

  const value: SimpleLoggerContextType = {
    logger,
    logUserAction,
    logError,
    logPerformance,
  };

  return (
    <SimpleLoggerContext.Provider value={value}>
      {children}
    </SimpleLoggerContext.Provider>
  );
};

export const useSimpleLogger = (): SimpleLoggerContextType => {
  const context = useContext(SimpleLoggerContext);
  if (context === undefined) {
    throw new Error('useSimpleLogger must be used within a SimpleLoggerProvider');
  }
  return context;
};

// Export the enums for convenience
export { LogLevel, LogStrategy };

export default SimpleLoggerProvider;
