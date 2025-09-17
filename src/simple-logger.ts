// Simple Logger - just the essentials
import { ConsoleAdapter } from './adapters/console';
import { createConfig, validateConfig } from './core/config';
import { LogLevel, LoggerConfig, LogEntry } from './core/types';
import { generateUUID } from './utils/uuid';

export class SimpleLogger {
  private config: LoggerConfig;
  private consoleAdapter: ConsoleAdapter;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = createConfig(config);
    
    // Validate configuration
    const errors = validateConfig(this.config);
    if (errors.length > 0) {
      throw new Error(`Invalid logger configuration: ${errors.join(', ')}`);
    }

    // Initialize console adapter
    this.consoleAdapter = new ConsoleAdapter();
    this.consoleAdapter.configure(this.config);
  }

  debug(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  info(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  warn(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context, metadata, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) {
    this.log(LogLevel.FATAL, message, context, metadata, error);
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    metadata?: Record<string, unknown>,
    error?: Error
  ) {
    if (level < this.config.level) {
      return;
    }

    const logEntry: LogEntry = {
      id: generateUUID(),
      timestamp: new Date(),
      level,
      message,
      context: { ...context },
      metadata: { ...metadata },
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      source: this.getSource()
    };

    // Log to console
    if (this.config.enableConsole) {
      this.consoleAdapter.log(logEntry);
    }
  }

  private getSource(): string {
    if (typeof window !== 'undefined') {
      return 'browser';
    }
    if (typeof process !== 'undefined' && process.versions?.node) {
      return 'node';
    }
    return 'unknown';
  }

  updateConfig(newConfig: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.consoleAdapter.configure(this.config);
  }
}

// Create default logger instance
let defaultLogger: SimpleLogger | null = null;

export function getLogger(config?: Partial<LoggerConfig>): SimpleLogger {
  if (!defaultLogger) {
    defaultLogger = new SimpleLogger(config);
  }
  if (config) {
    defaultLogger.updateConfig(config);
  }
  return defaultLogger;
}

// Convenience functions
export const log = {
  debug: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getLogger().debug(message, context, metadata);
  },
  info: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getLogger().info(message, context, metadata);
  },
  warn: (message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getLogger().warn(message, context, metadata);
  },
  error: (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getLogger().error(message, error, context, metadata);
  },
  fatal: (message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>) => {
    getLogger().fatal(message, error, context, metadata);
  }
};

// Export types
export type { LoggerConfig, LogLevel, LogStrategy, LogEntry } from './core/types';
