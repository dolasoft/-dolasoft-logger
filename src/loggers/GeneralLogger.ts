import type { LogLevel, LogEntry, LogMode } from '../types';
import { LOG_MODES } from '../types';
import type { SessionManager } from '../managers/SessionManager';
import { writeToConsole as transportWriteToConsole } from '../transports/console';
import { sendToRoute as transportSendToRoute } from '../transports/route';

/**
 * Handles general logging operations (debug, info, warn, error)
 */
export class GeneralLogger {
  private logs: LogEntry[] = [];
  readonly maxLogs: number;
  readonly logMode: LogMode;
  readonly routeUrl: string;
  private sessionManager: SessionManager;
  private sanitizeData: (data?: unknown) => Record<string, unknown> | undefined;

  constructor(
    maxLogs: number,
    logMode: LogMode,
    routeUrl: string,
    sessionManager: SessionManager,
    sanitizeData: (data?: unknown) => Record<string, unknown> | undefined
  ) {
    this.maxLogs = maxLogs;
    this.logMode = logMode;
    this.routeUrl = routeUrl;
    this.sessionManager = sessionManager;
    this.sanitizeData = sanitizeData;
  }

  /**
   * Log a debug message
   */
  debug(message: string, context?: unknown, metadata?: unknown): void {
    this.log('debug', message, context, metadata);
  }

  /**
   * Log an info message
   */
  info(message: string, context?: unknown, metadata?: unknown): void {
    this.log('info', message, context, metadata);
  }

  /**
   * Log a warning message
   */
  warn(message: string, context?: unknown, metadata?: unknown): void {
    this.log('warn', message, context, metadata);
  }

  /**
   * Log an error message
   */
  error(
    message: string,
    error?: Error | unknown,
    context?: unknown,
    metadata?: unknown
  ): void {
    const errorContext = {
      ...(typeof context === 'object' && context !== null ? context : {}),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    };
    this.log('error', message, errorContext, metadata);
  }

  /**
   * Get all stored logs
   */
  getAllLogs(): LogEntry[] {
    return this.logs;
  }

  private async log(
    level: LogLevel['level'],
    message: string,
    context?: unknown,
    metadata?: unknown
  ): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: this.sanitizeData(context),
      metadata: this.sanitizeData(metadata),
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Also add to current session if active
    const currentSessionId = this.sessionManager.getCurrentSessionId();
    if (currentSessionId) {
      this.sessionManager.addStep(entry);
    }

    // Handle different log modes
    switch (this.logMode) {
      case LOG_MODES.CONSOLE:
        this.writeToConsole(level, message, context, metadata);
        break;

      case LOG_MODES.ROUTE:
        await this.sendToRoute(entry);
        break;

      case LOG_MODES.BOTH:
        this.writeToConsole(level, message, context, metadata);
        await this.sendToRoute(entry);
        break;

      case LOG_MODES.NONE:
        // Do nothing
        break;
    }
  }

  private async sendToRoute(entry: LogEntry): Promise<void> {
    await transportSendToRoute(this.routeUrl, entry);
  }

  private writeToConsole(
    level: LogLevel['level'],
    message: string,
    context?: unknown,
    metadata?: unknown
  ): void {
    const output = `[${level.toUpperCase()}] ${message}`;

    // Sanitize context and metadata before logging
    const sanitizedContext = this.sanitizeData(context);
    const sanitizedMetadata = this.sanitizeData(metadata);
    transportWriteToConsole(level, output, sanitizedContext, sanitizedMetadata);
  }
}
