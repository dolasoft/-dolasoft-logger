/**
 * Base Logger Class
 * Provides common functionality for all logger implementations
 */

import { LogLevel, LogEntry, LoggerConfig, LogAdapter } from './types';
import { generateUUID } from '../utils/uuid';

export abstract class BaseLogger {
  protected config: LoggerConfig;
  protected adapters: LogAdapter[] = [];

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = this.createConfig(config);
    this.initializeAdapters();
  }

  /**
   * Create configuration with defaults
   * Override in subclasses for custom defaults
   */
  protected abstract createConfig(overrides: Partial<LoggerConfig>): LoggerConfig;

  /**
   * Initialize adapters based on configuration
   * Override in subclasses for custom adapter setup
   */
  protected abstract initializeAdapters(): void;

  /**
   * Get source information (browser, node, etc.)
   * Override in subclasses for custom source detection
   */
  protected getSource(): string {
    if (typeof window !== 'undefined') {
      return 'browser';
    }
    if (typeof process !== 'undefined' && process.versions?.node) {
      return 'node';
    }
    return 'unknown';
  }

  /**
   * Core logging method - handles the actual log entry creation and distribution
   */
  protected log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    metadata?: Record<string, unknown>,
    error?: Error
  ): void {
    if (level < this.config.level) {
      return;
    }

    // Extract per-call userId and requestId from context
    const perCallUserId = context?.userId as string | undefined;
    const perCallRequestId = context?.requestId as string | undefined;

    // Remove special fields from context to avoid duplication
    const cleanContext = { ...context };
    delete cleanContext.userId;
    delete cleanContext.requestId;

    const logEntry: LogEntry = {
      id: generateUUID(),
      timestamp: new Date(),
      level,
      message,
      context: cleanContext,
      metadata: { ...metadata },
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      source: this.getSource(),
      // Global appSlug from config, per-call userId and requestId
      appSlug: this.config.appSlug,
      userId: perCallUserId,
      requestId: perCallRequestId
    };

    // Log to all enabled adapters
    this.adapters.forEach(adapter => {
      adapter.log(logEntry).catch(err => {
        console.error(`Failed to log to ${adapter.name} adapter:`, err);
      });
    });
  }

  /**
   * Public logging methods
   */
  debug(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, context, metadata);
  }

  info(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, context, metadata);
  }

  warn(message: string, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, context, metadata);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, context, metadata, error);
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.FATAL, message, context, metadata, error);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.adapters = [];
    this.initializeAdapters();
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await Promise.all(
      this.adapters.map(adapter => 
        adapter.cleanup?.().catch(err => 
          console.error(`Failed to cleanup ${adapter.name} adapter:`, err)
        )
      )
    );
  }
}
