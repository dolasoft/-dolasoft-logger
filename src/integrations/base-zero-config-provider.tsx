'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { LoggerService } from '../core';

interface BaseZeroConfigLoggerContextType {
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

const BaseZeroConfigLoggerContext = createContext<BaseZeroConfigLoggerContextType | undefined>(undefined);

interface BaseZeroConfigLoggerProviderProps {
  children: ReactNode;
  appSlug?: string;
  userId?: string;
  requestId?: string;
  logger: LoggerService;
}

export class BaseZeroConfigLoggerProvider extends React.Component<BaseZeroConfigLoggerProviderProps> {
  private logUserAction = (action: string, context?: Record<string, unknown>) => {
    this.props.logger.info(`User action: ${action}`, {
      action,
      appSlug: this.props.appSlug,
      userId: this.props.userId,
      requestId: this.props.requestId,
      timestamp: new Date().toISOString(),
      ...context,
    });
  };

  private logError = (message: string, error?: Error, context?: Record<string, unknown>) => {
    this.props.logger.error(message, error, {
      appSlug: this.props.appSlug,
      userId: this.props.userId,
      requestId: this.props.requestId,
      timestamp: new Date().toISOString(),
      ...context,
    });
  };

  private logPerformance = (operation: string, duration: number, context?: Record<string, unknown>) => {
    this.props.logger.info(`Performance: ${operation}`, {
      operation,
      duration: `${duration}ms`,
      appSlug: this.props.appSlug,
      userId: this.props.userId,
      requestId: this.props.requestId,
      timestamp: new Date().toISOString(),
      ...context,
    });
  };

  render() {
    const value: BaseZeroConfigLoggerContextType = {
      logger: this.props.logger,
      logUserAction: this.logUserAction,
      logError: this.logError,
      logPerformance: this.logPerformance,
    };

    return (
      <BaseZeroConfigLoggerContext.Provider value={value}>
        {this.props.children}
      </BaseZeroConfigLoggerContext.Provider>
    );
  }
}

export const useBaseZeroConfigLogger = (): BaseZeroConfigLoggerContextType => {
  const context = useContext(BaseZeroConfigLoggerContext);
  if (context === undefined) {
    throw new Error('useBaseZeroConfigLogger must be used within a BaseZeroConfig logger provider');
  }
  return context;
};

export type { BaseZeroConfigLoggerProviderProps, BaseZeroConfigLoggerContextType };
