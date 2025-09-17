'use client';

import React, { ReactNode } from 'react';
import { Loggers } from './zero-config-adapters-browser';
import { BaseZeroConfigLoggerProvider, useBaseZeroConfigLogger } from './base-zero-config-provider';
import { LogLevel, LogStrategy } from '../core/types';

interface LoggerProviderProps {
  children: ReactNode;
  appSlug?: string;
  userId?: string;
  requestId?: string;
}

/**
 * Console logger provider
 * - Development: Full console logging
 * - Production: No console logging (safe for production)
 */
export const ConsoleProvider: React.FC<LoggerProviderProps> = ({
  children,
  appSlug = 'app',
  userId,
  requestId,
}) => {
  const logger = Loggers.console();
  return (
    <BaseZeroConfigLoggerProvider logger={logger} appSlug={appSlug} userId={userId} requestId={requestId}>
      {children}
    </BaseZeroConfigLoggerProvider>
  );
};

/**
 * Memory logger provider
 * - Development: 50 entries max for debugging
 * - Production: 10 entries max (very conservative)
 */
export const MemoryProvider: React.FC<LoggerProviderProps> = ({
  children,
  appSlug = 'app',
  userId,
  requestId,
}) => {
  const logger = Loggers.memory();
  return (
    <BaseZeroConfigLoggerProvider logger={logger} appSlug={appSlug} userId={userId} requestId={requestId}>
      {children}
    </BaseZeroConfigLoggerProvider>
  );
};

/**
 * File logger provider
 * - Development: Logs to ./logs/dev/dev.log
 * - Production: Logs to ./logs/prod/prod.log
 * - Auto-creates directories, 10MB max file size, 5 files max
 */
export const FileProvider: React.FC<LoggerProviderProps> = ({
  children,
  appSlug = 'app',
  userId,
  requestId,
}) => {
  const logger = Loggers.file();
  return (
    <BaseZeroConfigLoggerProvider logger={logger} appSlug={appSlug} userId={userId} requestId={requestId}>
      {children}
    </BaseZeroConfigLoggerProvider>
  );
};

/**
 * Remote logger provider
 * - Development: Disabled (no remote calls)
 * - Production: Sends to /api/logs endpoint
 */
export const RemoteProvider: React.FC<LoggerProviderProps> = ({
  children,
  appSlug = 'app',
  userId,
  requestId,
}) => {
  const logger = Loggers.remote();
  return (
    <BaseZeroConfigLoggerProvider logger={logger} appSlug={appSlug} userId={userId} requestId={requestId}>
      {children}
    </BaseZeroConfigLoggerProvider>
  );
};

/**
 * Hybrid logger provider
 * - Development: Console + Memory + File
 * - Production: File + Remote (no console, no memory)
 */
export const HybridProvider: React.FC<LoggerProviderProps> = ({
  children,
  appSlug = 'app',
  userId,
  requestId,
}) => {
  const logger = Loggers.hybrid();
  return (
    <BaseZeroConfigLoggerProvider logger={logger} appSlug={appSlug} userId={userId} requestId={requestId}>
      {children}
    </BaseZeroConfigLoggerProvider>
  );
};

/**
 * Smart logger provider (RECOMMENDED)
 * - Development: Console + Memory (for debugging)
 * - Production: File + Remote (for production monitoring)
 */
export const SmartProvider: React.FC<LoggerProviderProps> = ({
  children,
  appSlug = 'app',
  userId,
  requestId,
}) => {
  const logger = Loggers.smart();
  return (
    <BaseZeroConfigLoggerProvider logger={logger} appSlug={appSlug} userId={userId} requestId={requestId}>
      {children}
    </BaseZeroConfigLoggerProvider>
  );
};

// Universal hook that works with any provider
export const useLogger = (): ReturnType<typeof useBaseZeroConfigLogger> => {
  return useBaseZeroConfigLogger();
};

// Export types and enums
export type { LoggerProviderProps };
export { LogLevel, LogStrategy };