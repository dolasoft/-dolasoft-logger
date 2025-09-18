// Simple Logger - just the essentials
import { ConsoleAdapter } from './adapters/console';
import { FileAdapter } from './adapters/file';
import { RemoteAdapter } from './adapters/remote';
import { createConfig, validateConfig } from './core/config';
import { LogLevel, LoggerConfig, LogEntry, LogAdapter } from './core/types';
import { generateUUID } from './utils/uuid';

export class SimpleLogger {
  private config: LoggerConfig;
  private adapters: LogAdapter[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = createConfig(config);
    
    // Validate configuration
    const errors = validateConfig(this.config);
    if (errors.length > 0) {
      throw new Error(`Invalid logger configuration: ${errors.join(', ')}`);
    }

    // Initialize adapters based on environment and config
    this.initializeAdapters();
  }

  private initializeAdapters() {
    const adapterConfigs = [
      { 
        enabled: true, 
        adapter: ConsoleAdapter, 
        name: 'console' 
      },
      { 
        enabled: this.config.enableFile, 
        adapter: FileAdapter, 
        name: 'file' 
      },
      { 
        enabled: this.config.enableRemote, 
        adapter: RemoteAdapter, 
        name: 'remote' 
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

    // Log to all enabled adapters
    this.adapters.forEach(adapter => {
      adapter.log(logEntry).catch(err => {
        console.error(`Failed to log to ${adapter.name} adapter:`, err);
      });
    });
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
    
    // Reinitialize adapters with new config
    this.adapters = [];
    this.initializeAdapters();
  }
}

// Singleton logger instance
let defaultLogger: SimpleLogger | null = null;

export function getLogger(config?: Partial<LoggerConfig>): SimpleLogger {
  if (!defaultLogger) {
    defaultLogger = new SimpleLogger(config);
  } else if (config) {
    defaultLogger.updateConfig(config);
  }
  return defaultLogger;
}

// Universal convenience functions - work everywhere, no setup needed
// This creates a proxy that lazily initializes the logger
export const log = new Proxy({} as SimpleLogger, {
  get(target, prop) {
    const logger = getLogger();
    return logger[prop as keyof SimpleLogger];
  }
});

// Export types
export type { LoggerConfig, LogLevel, LogStrategy, LogEntry } from './core/types';
