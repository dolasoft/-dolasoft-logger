import {
  LogEntry,
  TraceStep,
  Session,
  UnifiedLoggerConfig,
  LOG_MODES,
} from './types';
import { resolveLoggerConfig } from './config';
import { sanitizeData as externalSanitize } from './utils/sanitize';
import { SessionManager } from './managers/SessionManager';
import { TraceLogger } from './loggers/TraceLogger';
import { ExecutionLogger } from './loggers/ExecutionLogger';
import { GeneralLogger } from './loggers/GeneralLogger';

/**
 * UnifiedLogger - Comprehensive logging system for all logging needs
 * Combines execution tracking, trace logging, and general logging
 */
export class UnifiedLogger {
  private static instance: UnifiedLogger | null = null;
  private static config: UnifiedLoggerConfig | undefined;

  private sessionManager: SessionManager;
  private traceLogger: TraceLogger;
  private executionLogger: ExecutionLogger;
  private generalLogger: GeneralLogger;
  private sensitiveFields: string[];
  private isProduction: boolean;

  constructor(config?: UnifiedLoggerConfig) {
    // Resolve configuration with precedence: env → config → defaults
    const resolved = resolveLoggerConfig(process.env, config);
    this.isProduction = resolved.isProduction;
    this.sensitiveFields = resolved.sensitiveFields;

    // In production, automatically switch console mode to none (still allows route mode)
    let effectiveLogMode = resolved.logMode;
    if (this.isProduction && effectiveLogMode === LOG_MODES.CONSOLE) {
      effectiveLogMode = LOG_MODES.NONE;
    } else if (this.isProduction && effectiveLogMode === LOG_MODES.BOTH) {
      effectiveLogMode = LOG_MODES.ROUTE;
    }

    // Initialize managers and loggers
    this.sessionManager = new SessionManager(resolved.maxSessions);

    const sanitizeDataFn = (data?: unknown) => this.sanitizeData(data);

    this.generalLogger = new GeneralLogger(
      resolved.maxLogs,
      effectiveLogMode,
      resolved.routeUrl,
      this.sessionManager,
      sanitizeDataFn
    );

    this.traceLogger = new TraceLogger(this.sessionManager, sanitizeDataFn);

    this.executionLogger = new ExecutionLogger(
      this.sessionManager,
      sanitizeDataFn,
      (message, metadata) => this.generalLogger.info(message, metadata),
      (message, error) => this.generalLogger.error(message, error)
    );

    // Log the configuration on startup using console directly (only in non-production or if explicitly allowed)
    if (effectiveLogMode !== LOG_MODES.NONE && !this.isProduction) {
      console.log(
        `🔧 UnifiedLogger initialized - Mode: ${effectiveLogMode}, Route: ${resolved.routeUrl}, Production: ${this.isProduction}`
      );
    }
  }

  /**
   * Get the singleton instance of UnifiedLogger
   * @param config - Configuration options (only used on first call)
   * @returns The singleton UnifiedLogger instance
   */
  public static getInstance(config?: UnifiedLoggerConfig): UnifiedLogger {
    if (!UnifiedLogger.instance) {
      UnifiedLogger.config = config;
      UnifiedLogger.instance = new UnifiedLogger(config);
    } else if (config && config !== UnifiedLogger.config) {
      console.warn(
        '⚠️ UnifiedLogger.getInstance() called with different config. Ignoring new config and returning existing instance.'
      );
    }
    return UnifiedLogger.instance;
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    UnifiedLogger.instance = null;
    UnifiedLogger.config = undefined;
  }

  // ===== General Logging Methods =====

  debug(message: string, context?: unknown, metadata?: unknown): void {
    this.generalLogger.debug(message, context, metadata);
  }

  info(message: string, context?: unknown, metadata?: unknown): void {
    this.generalLogger.info(message, context, metadata);
  }

  warn(message: string, context?: unknown, metadata?: unknown): void {
    this.generalLogger.warn(message, context, metadata);
  }

  error(
    message: string,
    error?: Error | unknown,
    context?: unknown,
    metadata?: unknown
  ): void {
    this.generalLogger.error(message, error, context, metadata);
  }

  // ===== Session Management =====

  startSession(
    id: string,
    type: Session['type'] = 'trace',
    metadata?: Record<string, unknown>
  ): void {
    const sanitizedMetadata = this.sanitizeData(metadata);
    this.sessionManager.startSession(id, type, sanitizedMetadata);

    if (type === 'trace') {
      this.traceLogger.addTraceStep('start', '🚀 SESSION START', {
        sessionId: id,
        ...metadata,
      });
    } else {
      this.info(`📋 ${type.toUpperCase()} session started: ${id}`, metadata);
    }
  }

  endSession(): Session | null {
    const session = this.sessionManager.getCurrentSession();
    if (!session) return null;

    // Add completion step before ending the session (while currentSessionId is still set)
    if (session.type === 'trace') {
      // Calculate duration manually since session hasn't ended yet
      const duration = Date.now() - new Date(session.startTime).getTime();
      this.traceLogger.addTraceStep(
        'complete',
        `🏁 SESSION COMPLETE: ${duration}ms total`,
        {
          totalDuration: duration,
        }
      );
    }

    const endedSession = this.sessionManager.endSession();
    if (!endedSession) return null;

    if (session.type !== 'trace') {
      this.info(
        `✅ ${session.type.toUpperCase()} session complete: ${endedSession.totalDuration}ms`
      );
    }

    return endedSession;
  }

  // ===== Trace Logging Methods =====

  addTraceStep(
    level: TraceStep['level'],
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.traceLogger.addTraceStep(level, message, metadata);
  }

  startTraceStep(
    stepName: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.traceLogger.startTraceStep(stepName, message, metadata);
  }

  completeTraceStep(
    stepName: string,
    message?: string,
    metadata?: Record<string, unknown>
  ): void {
    this.traceLogger.completeTraceStep(stepName, message, metadata);
  }

  // ===== Execution Logging Methods =====

  startStep(
    stepId: string,
    stepName: string,
    metadata?: Record<string, unknown>
  ): void {
    this.executionLogger.startStep(stepId, stepName, metadata);
  }

  completeStep(stepId: string, metadata?: Record<string, unknown>): void {
    this.executionLogger.completeStep(stepId, metadata);
  }

  failStep(stepId: string, error: string): void {
    this.executionLogger.failStep(stepId, error);
  }

  // ===== Specialized Logging Methods =====

  /**
   * Log a custom trace step with an emoji and message
   * This is a generic method that can be used for any domain-specific logging
   */
  logCustom(
    emoji: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.traceLogger.logCustom(emoji, message, metadata);
  }

  /**
   * Update session metadata with custom properties
   * Useful for adding domain-specific information to sessions
   */
  updateSessionMetadata(metadata: Record<string, unknown>): void {
    const sanitizedMetadata = this.sanitizeData(metadata);
    if (sanitizedMetadata) {
      this.sessionManager.updateSessionMetadata(sanitizedMetadata);
    }
  }

  // ===== Data Retrieval Methods =====

  getAllLogs(): LogEntry[] {
    return this.generalLogger.getAllLogs();
  }

  getAllSessions(): Session[] {
    return this.sessionManager.getAllSessions();
  }

  getSession(id: string): Session | null {
    return this.sessionManager.getSession(id);
  }

  getCurrentSession(): Session | null {
    return this.sessionManager.getCurrentSession();
  }

  // ===== Utility Methods =====

  private sanitizeData(data?: unknown): Record<string, unknown> | undefined {
    return externalSanitize(this.sensitiveFields, data);
  }

  clearOldSessions(): void {
    this.sessionManager.clearOldSessions();
  }
}

// Get logger instance - using a function for lazy initialization
export const getLogger = (config?: UnifiedLoggerConfig): UnifiedLogger =>
  UnifiedLogger.getInstance(config);

// Export types and constants
export * from './types';
