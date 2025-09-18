// Simple Logger - just the essentials
import { ConsoleAdapter } from './adapters/console';
import { FileAdapter } from './adapters/file';
import { RemoteAdapter } from './adapters/remote';
import { createConfig, validateConfig } from './core/config';
import { LoggerConfig } from './core/types';
import { BaseLogger } from './core/base-logger';

export class SimpleLogger extends BaseLogger {
  constructor(config: Partial<LoggerConfig> = {}) {
    super(config);
  }

  protected createConfig(overrides: Partial<LoggerConfig>): LoggerConfig {
    const config = createConfig(overrides);
    
    // Validate configuration
    const errors = validateConfig(config);
    if (errors.length > 0) {
      throw new Error(`Invalid logger configuration: ${errors.join(', ')}`);
    }

    return config;
  }

  protected initializeAdapters() {
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
