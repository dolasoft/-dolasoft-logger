import { LogLevel, LogStrategy, LogEntry, LoggerConfig, LogAdapter, LogStats } from './types';
import { createConfig, validateConfig } from './config';
import { ConsoleAdapter } from '../adapters/console';
import { MemoryAdapter } from '../adapters/memory';
import { generateUUID } from '../utils/uuid';

/**
 * Client-side logger service that only includes browser-compatible adapters
 * (Console and Memory adapters only - no File or Database adapters)
 */
export class ClientLoggerService {
  private static instance: ClientLoggerService | null = null;
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

  static getInstance(config: Partial<LoggerConfig> = {}): ClientLoggerService {
    if (!ClientLoggerService.instance) {
      ClientLoggerService.instance = new ClientLoggerService(config);
    }
    return ClientLoggerService.instance;
  }

  static create(config: Partial<LoggerConfig> = {}): ClientLoggerService {
    return new ClientLoggerService(config);
  }

  static reset(): void {
    if (ClientLoggerService.instance) {
      ClientLoggerService.instance.cleanup();
      ClientLoggerService.instance = null;
    }
  }

  private initializeAdapters(): void {
    // Only initialize browser-compatible adapters
    if (this.config.enableConsole) {
      const consoleAdapter = new ConsoleAdapter();
      consoleAdapter.configure(this.config);
      this.adapters.set('console', consoleAdapter);
    }

    // Always initialize memory adapter for client-side logging
    const memoryAdapter = new MemoryAdapter();
    memoryAdapter.configure(this.config);
    this.adapters.set('memory', memoryAdapter);
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

    if (this.config.includeStack && error?.stack) {
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
      case LogStrategy.HYBRID:
        // Only use console and memory for client-side
        for (const adapter of this.adapters.values()) {
          promises.push(adapter.log(entry));
        }
        break;
      default:
        // For other strategies, fall back to memory
        if (this.adapters.has('memory')) {
          promises.push(this.adapters.get('memory')!.log(entry));
        }
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
      if ('getLogs' in adapter) {
        const adapterWithGetLogs = adapter as LogAdapter & { getLogs: (limit?: number) => LogEntry[] };
        return adapterWithGetLogs.getLogs(limit);
      }
    }

    // Default to memory adapter
    if (this.adapters.has('memory')) {
      const memoryAdapter = this.adapters.get('memory')!;
      if ('getLogs' in memoryAdapter) {
        const memoryAdapterWithGetLogs = memoryAdapter as LogAdapter & { getLogs: (limit?: number) => LogEntry[] };
        return memoryAdapterWithGetLogs.getLogs(limit);
      }
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
        const adapterWithClear = adapter as LogAdapter & { clear: () => void | Promise<void> };
        await adapterWithClear.clear();
      }
    } else {
      // Clear all adapters
      for (const adapter of this.adapters.values()) {
        if ('clear' in adapter) {
          const adapterWithClear = adapter as LogAdapter & { clear: () => void | Promise<void> };
          await adapterWithClear.clear();
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
      maxDatabase: 0,
      maxFile: 0
    };

    for (const [name, adapter] of this.adapters) {
      if ('getStats' in adapter) {
        const adapterWithStats = adapter as LogAdapter & { getStats: () => { count?: number; errors?: number } };
        const adapterStats = adapterWithStats.getStats();
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
    
    // Reconfigure all adapters
    for (const adapter of this.adapters.values()) {
      if (adapter.configure) {
        adapter.configure(this.config);
      }
    }
  }

  async cleanup(): Promise<void> {
    for (const adapter of this.adapters.values()) {
      if (adapter.cleanup) {
        await adapter.cleanup();
      }
    }
  }
}
