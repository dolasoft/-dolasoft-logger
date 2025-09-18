/**
 * Next.js Logger Class
 * Extends BaseLogger with Next.js specific optimizations
 */

import { ConsoleAdapter } from './adapters/console';
import { FileAdapter } from './adapters/file';
import { LogLevel, LogStrategy, LoggerConfig } from './core/types';
import { BaseLogger } from './core/base-logger';

export class NextJSLogger extends BaseLogger {
  private isServer: boolean;
  private isProduction: boolean;

  constructor(config: Partial<LoggerConfig> = {}) {
    // Check if we're on the server
    const isServer = typeof window === 'undefined';
    const isProduction = process.env.NODE_ENV === 'production';
    
    super(config);
    
    this.isServer = isServer;
    this.isProduction = isProduction;
  }

  protected createConfig(overrides: Partial<LoggerConfig>): LoggerConfig {
    const baseConfig: LoggerConfig = {
      strategy: LogStrategy.CONSOLE,
      level: this.isProduction ? LogLevel.INFO : LogLevel.DEBUG,
      enableConsole: true,
      enableFile: this.isServer && this.isProduction, // Only file logging in production on server
      enableDatabase: false,
      enableRemote: false,
      enableMemory: false,
      format: this.isProduction ? 'json' : 'pretty',
      filePath: this.isProduction ? './logs/server-prod.log' : './logs/server-dev.log',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      includeStack: true,
      includeMetadata: true,
      includeTimestamp: true,
      includeLevel: true,
      // Global app identifier
      appSlug: this.isServer 
        ? (process.env.APP_SLUG || 'nextjs-app')
        : (process.env.NEXT_PUBLIC_APP_SLUG || 'nextjs-app'),
    };

    return { ...baseConfig, ...overrides };
  }

  protected initializeAdapters() {
    const adapterConfigs = [
      { 
        enabled: true, 
        adapter: ConsoleAdapter, 
        name: 'console' 
      },
      { 
        enabled: this.config.enableFile && this.isServer, 
        adapter: FileAdapter, 
        name: 'file' 
      }
    ];

    adapterConfigs.forEach(({ enabled, adapter }) => {
      if (enabled) {
        const adapterInstance = new adapter();
        adapterInstance.configure(this.config);
        this.adapters.push(adapterInstance);
      }
    });
  }

  protected getSource(): string {
    return this.isServer ? 'nextjs-server' : 'nextjs-client';
  }
}

// Singleton instances
let serverLoggerInstance: NextJSLogger | null = null;
let clientLoggerInstance: NextJSLogger | null = null;

/**
 * Get server-side logger instance
 */
export function getServerLoggerInstance(): NextJSLogger {
  if (typeof window === 'undefined' && !serverLoggerInstance) {
    try {
      serverLoggerInstance = new NextJSLogger();
    } catch (error) {
      console.error('Failed to initialize server logger:', error);
      // Fallback to console
      serverLoggerInstance = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        fatal: console.error,
      } as NextJSLogger;
    }
  }
  return serverLoggerInstance!;
}

/**
 * Get client-side logger instance
 */
export function getClientLoggerInstance(): NextJSLogger {
  if (typeof window !== 'undefined' && !clientLoggerInstance) {
    try {
      clientLoggerInstance = new NextJSLogger();
    } catch (error) {
      console.error('Failed to initialize client logger:', error);
      // Fallback to console
      clientLoggerInstance = {
        debug: console.debug,
        info: console.info,
        warn: console.warn,
        error: console.error,
        fatal: console.error,
      } as NextJSLogger;
    }
  }
  return clientLoggerInstance!;
}

/**
 * Get the appropriate logger instance based on environment
 */
export function getLoggerInstance(): NextJSLogger {
  return typeof window === 'undefined' 
    ? getServerLoggerInstance() 
    : getClientLoggerInstance();
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
 * Universal logger interface that works on both server and client
 * Zero configuration required - automatically detects environment
 * Supports appSlug, userId, and requestId through context
 */
export const logger = {
  debug: (message: string, context?: EnhancedLoggerContext, metadata?: Record<string, unknown>) => {
    getLoggerInstance().debug(message, context, metadata);
  },

  info: (message: string, context?: EnhancedLoggerContext, metadata?: Record<string, unknown>) => {
    getLoggerInstance().info(message, context, metadata);
  },

  warn: (message: string, context?: EnhancedLoggerContext, metadata?: Record<string, unknown>) => {
    getLoggerInstance().warn(message, context, metadata);
  },

  error: (message: string, error?: Error, context?: EnhancedLoggerContext, metadata?: Record<string, unknown>) => {
    getLoggerInstance().error(message, error, context, metadata);
  },

  fatal: (message: string, error?: Error, context?: EnhancedLoggerContext, metadata?: Record<string, unknown>) => {
    getLoggerInstance().fatal(message, error, context, metadata);
  },
};

/**
 * Hook for client-side components to use the logger
 */
export function useClientLogger() {
  return logger;
}

// Default export - the universal logger
export default logger;
