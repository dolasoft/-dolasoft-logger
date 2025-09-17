import { LogLevel, LogStrategy, LogEntry, LoggerConfig, LogAdapter, LogStats, ILoggerService } from './types';
import { createConfig, validateConfig } from './config';
import { ConsoleAdapter } from '../adapters/console';
import { MemoryAdapter } from '../adapters/memory';
import { DatabaseAdapter } from '../adapters/database';
// FileAdapter excluded - Node.js only
import { generateUUID } from '../utils/uuid';

// Re-export types for browser usage
export type { LogLevel, LogStrategy, LogEntry, LoggerConfig, LogAdapter, LogStats, ILoggerService } from './types';

export class LoggerService implements ILoggerService {
  private static instance: LoggerService | null = null;
  private config: LoggerConfig;
  private adapters: Map<string, LogAdapter> = new Map();

  private constructor(config: Partial<LoggerConfig> = {}) {
    this.config = createConfig(config);
    
    // Validate configuration
    const errors = validateConfig(this.config);
    if (errors.length > 0) {
      throw new Error(`Invalid logger configuration: ${errors.join(', ')}`);
    }
    
    this.initializeAdapters();
  }

  static getInstance(config?: Partial<LoggerConfig>): LoggerService {
    if (!LoggerService.instance) {
      LoggerService.instance = new LoggerService(config);
    }
    return LoggerService.instance;
  }

  static create(config: Partial<LoggerConfig> = {}): LoggerService {
    return new LoggerService(config);
  }

  static reset(): void {
    if (LoggerService.instance) {
      LoggerService.instance.cleanup();
      LoggerService.instance = null;
    }
  }

  private initializeAdapters(): void {
    // Console adapter
    if (this.config.enableConsole) {
      const consoleAdapter = new ConsoleAdapter();
      consoleAdapter.configure(this.config);
      this.adapters.set('console', consoleAdapter);
    }

    // Memory adapter (always enabled for browser)
    const memoryAdapter = new MemoryAdapter();
    memoryAdapter.configure(this.config);
    this.adapters.set('memory', memoryAdapter);

    // Database adapter
    if (this.config.enableDatabase) {
      const databaseAdapter = new DatabaseAdapter();
      databaseAdapter.configure(this.config);
      this.adapters.set('database', databaseAdapter);
    }

    // FileAdapter excluded - Node.js only
    // Remote adapter would be handled by integrations
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
    metadata?: Record<string, unknown>
  ): LogEntry {
    const entry: LogEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      level,
      message,
      context,
      error,
      metadata
    };

    // Add stack trace if error and stack is enabled
    if (error && this.config.includeStack && error.stack) {
      entry.stack = error.stack;
    }

    return entry;
  }

  private generateId(): string {
    return generateUUID();
  }

  async log(entry: LogEntry): Promise<void> {
    if (!this.shouldLog(entry.level)) {
      return;
    }

    const promises: Promise<void>[] = [];

    switch (this.config.strategy) {
      case LogStrategy.CONSOLE:
        if (this.adapters.has('console')) {
          promises.push(this.adapters.get('console')!.log(entry));
        }
        break;
      case LogStrategy.MEMORY:
        if (this.adapters.has('memory')) {
          promises.push(this.adapters.get('memory')!.log(entry));
        }
        break;
      case LogStrategy.DATABASE:
        if (this.adapters.has('database')) {
          promises.push(this.adapters.get('database')!.log(entry));
        }
        break;
      case LogStrategy.FILE:
        // FileAdapter not available in browser
        console.warn('FileAdapter not available in browser environment');
        break;
      case LogStrategy.HYBRID:
        // Use all available adapters
          for (const adapter of Array.from(this.adapters.values())) {
            promises.push(adapter.log(entry));
          }
        break;
      case LogStrategy.REMOTE:
        // Remote logging handled by integrations
        break;
    }

    await Promise.allSettled(promises);
  }

  debug(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, context, undefined, metadata);
    this.log(entry);
  }

  info(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, context, undefined, metadata);
    this.log(entry);
  }

  warn(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, context, undefined, metadata);
    this.log(entry);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error, metadata);
    this.log(entry);
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void {
    const entry = this.createLogEntry(LogLevel.FATAL, message, context, error, metadata);
    this.log(entry);
  }

  async getLogs(adapterName?: string, limit?: number): Promise<LogEntry[]> {
    if (adapterName && this.adapters.has(adapterName)) {
      const adapter = this.adapters.get(adapterName)!;
      if ('query' in adapter) {
        return (adapter as DatabaseAdapter).query({ limit });
      }
    }

    // Default to memory adapter
    if (this.adapters.has('memory')) {
      const memoryAdapter = this.adapters.get('memory') as MemoryAdapter;
      return memoryAdapter.getLogs(limit);
    }

    return [];
  }

  async getErrorLogs(limit?: number): Promise<LogEntry[]> {
    const logs = await this.getLogs(undefined, limit);
    return logs.filter(log => log.level >= LogLevel.ERROR);
  }

  async clearLogs(adapterName?: string): Promise<void> {
    if (adapterName && this.adapters.has(adapterName)) {
      const adapter = this.adapters.get(adapterName)!;
      if ('clear' in adapter) {
        await (adapter as MemoryAdapter | DatabaseAdapter).clear();
      }
      } else {
        // Clear all adapters
        for (const adapter of Array.from(this.adapters.values())) {
          if ('clear' in adapter) {
            await (adapter as MemoryAdapter | DatabaseAdapter).clear();
          }
        }
      }
  }

  getStats(): LogStats {
    const stats: LogStats = {
      memory: 0,
      database: 0,
      file: 0,
      errors: 0,
      maxMemory: this.config.maxMemoryEntries || 1000,
      maxDatabase: this.config.maxDatabaseEntries || 10000,
      maxFile: 0, // FileAdapter not available in browser
    };

    for (const [name, adapter] of Array.from(this.adapters)) {
      if ('getStats' in adapter) {
        const adapterStats = (adapter as MemoryAdapter | DatabaseAdapter).getStats();
        stats[name as keyof LogStats] = adapterStats.count || 0;
        if (adapterStats.errors) {
          stats.errors += adapterStats.errors;
        }
      }
    }

    return stats;
  }

  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Update all adapters with new config
    for (const adapter of this.adapters.values()) {
      if (adapter.configure) {
        adapter.configure(this.config);
      }
    }
  }

  async cleanup(): Promise<void> {
    for (const adapter of Array.from(this.adapters.values())) {
      if (adapter.cleanup) {
        await adapter.cleanup();
      }
    }
  }
}
