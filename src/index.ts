import {
  LogLevel,
  LogEntry,
  TraceStep,
  ExecutionStep,
  Session,
  LogMode,
  UnifiedLoggerConfig,
  LOG_MODES,
} from './types';
import { resolveLoggerConfig } from './config';

/**
 * UnifiedLogger - Comprehensive logging system for all logging needs
 * Combines execution tracking, trace logging, and general logging
 */
export class UnifiedLogger {
  private static instance: UnifiedLogger | null = null;
  private static config: UnifiedLoggerConfig | undefined;

  private sessions: Map<string, Session> = new Map();
  private currentSessionId: string | null = null;
  private stepStartTimes: Map<string, number> = new Map();
  private logs: LogEntry[] = [];
  private maxLogs: number;
  private maxSessions: number;
  private logMode: LogMode;
  private routeUrl: string;
  private sensitiveFields: string[];

  private isProduction: boolean;

  constructor(config?: UnifiedLoggerConfig) {
    // Resolve configuration with precedence: env → config → defaults
    const resolved = resolveLoggerConfig(process.env, config);
    this.isProduction = resolved.isProduction;
    this.logMode = resolved.logMode;
    this.routeUrl = resolved.routeUrl;
    this.maxLogs = resolved.maxLogs;
    this.maxSessions = resolved.maxSessions;
    this.sensitiveFields = resolved.sensitiveFields;

    // In production, automatically switch console mode to none (still allows route mode)
    if (this.isProduction && this.logMode === LOG_MODES.CONSOLE) {
      this.logMode = LOG_MODES.NONE;
    } else if (this.isProduction && this.logMode === LOG_MODES.BOTH) {
      this.logMode = LOG_MODES.ROUTE;
    }

    // Log the configuration on startup using console directly (only in non-production or if explicitly allowed)
    if (this.logMode !== LOG_MODES.NONE && !this.isProduction) {
      console.log(
        `🔧 UnifiedLogger initialized - Mode: ${this.logMode}, Route: ${this.routeUrl}, Production: ${this.isProduction}`
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
    this.log('debug', message, context, metadata);
  }

  info(message: string, context?: unknown, metadata?: unknown): void {
    this.log('info', message, context, metadata);
  }

  warn(message: string, context?: unknown, metadata?: unknown): void {
    this.log('warn', message, context, metadata);
  }

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
    if (this.currentSessionId) {
      const session = this.sessions.get(this.currentSessionId);
      if (session) {
        session.steps.push(entry);
      }
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
    try {
      // Don't await to avoid blocking
      fetch(this.routeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      }).catch(() => {
        // Silently ignore logging errors to avoid infinite loops
      });
    } catch {
      // Silently ignore logging errors
    }
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
    type ConsoleMethod = 'log' | 'debug' | 'warn' | 'error';
    const methodMap: Record<LogLevel['level'], ConsoleMethod> = {
      debug: 'debug',
      info: 'log',
      warn: 'warn',
      error: 'error',
    };
    const method: ConsoleMethod = methodMap[level];
    (console as Pick<Console, ConsoleMethod>)[method](
      output,
      sanitizedContext,
      sanitizedMetadata
    );
  }

  // ===== Session Management =====

  startSession(
    id: string,
    type: Session['type'] = 'trace',
    metadata?: Record<string, unknown>
  ): void {
    const session: Session = {
      id,
      type,
      startTime: new Date().toISOString(),
      steps: [],
      metadata: this.sanitizeData(metadata),
    };

    this.sessions.set(id, session);
    this.currentSessionId = id;

    if (type === 'trace') {
      this.addTraceStep('start', '🚀 SESSION START', {
        sessionId: id,
        ...metadata,
      });
    } else {
      this.info(`📋 ${type.toUpperCase()} session started: ${id}`, metadata);
    }
  }

  endSession(): Session | null {
    if (!this.currentSessionId) return null;

    const session = this.sessions.get(this.currentSessionId);
    if (!session) return null;

    session.endTime = new Date().toISOString();
    session.totalDuration =
      new Date(session.endTime).getTime() -
      new Date(session.startTime).getTime();

    if (session.type === 'trace') {
      this.addTraceStep(
        'complete',
        `🏁 SESSION COMPLETE: ${session.totalDuration}ms total`,
        {
          totalDuration: session.totalDuration,
        }
      );
    } else {
      this.info(
        `✅ ${session.type.toUpperCase()} session complete: ${session.totalDuration}ms`
      );
    }

    this.currentSessionId = null;
    this.cleanupOldSessions();

    return session;
  }

  // ===== Trace Logging Methods =====

  addTraceStep(
    level: TraceStep['level'],
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.currentSessionId) return;

    const session = this.sessions.get(this.currentSessionId);
    if (!session || session.type !== 'trace') return;

    const step: TraceStep = {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata: this.sanitizeData(metadata),
    };

    // Extract emoji from message
    const emojiMatch = message.match(
      /^([\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u
    );
    if (emojiMatch) {
      step.emoji = emojiMatch[1];
    }

    session.steps.push(step);
  }

  startTraceStep(
    stepName: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.stepStartTimes.set(stepName, Date.now());
    this.addTraceStep('start', `⏱️  ${message}`, metadata);
  }

  completeTraceStep(
    stepName: string,
    message?: string,
    metadata?: Record<string, unknown>
  ): void {
    const startTime = this.stepStartTimes.get(stepName);
    const duration = startTime ? Date.now() - startTime : 0;

    this.addTraceStep(
      'complete',
      `✅ ${message || stepName} completed in ${duration}ms`,
      {
        duration,
        ...metadata,
      }
    );

    this.stepStartTimes.delete(stepName);
  }

  // ===== Execution Logging Methods =====

  startStep(
    stepId: string,
    stepName: string,
    metadata?: Record<string, unknown>
  ): void {
    if (!this.currentSessionId) return;

    const session = this.sessions.get(this.currentSessionId);
    if (!session) return;

    const step: ExecutionStep = {
      stepId,
      stepName,
      startTime: Date.now(),
      metadata: this.sanitizeData(metadata),
      status: 'started',
    };

    session.steps.push(step);
    this.info(`⏱️ Starting: ${stepName}`, metadata);
  }

  completeStep(stepId: string, metadata?: Record<string, unknown>): void {
    if (!this.currentSessionId) return;

    const session = this.sessions.get(this.currentSessionId);
    if (!session) return;

    const step = session.steps.find(
      (s): s is ExecutionStep => 'stepId' in s && s.stepId === stepId
    );
    if (!step) return;

    step.endTime = Date.now();
    step.duration = step.endTime - step.startTime;
    step.status = 'completed';

    if (metadata) {
      step.metadata = { ...step.metadata, ...this.sanitizeData(metadata) };
    }

    this.info(`✅ Completed: ${step.stepName} (${step.duration}ms)`, metadata);
  }

  failStep(stepId: string, error: string): void {
    if (!this.currentSessionId) return;

    const session = this.sessions.get(this.currentSessionId);
    if (!session) return;

    const step = session.steps.find(
      (s): s is ExecutionStep => 'stepId' in s && s.stepId === stepId
    );
    if (!step) return;

    step.endTime = Date.now();
    step.duration = step.endTime - step.startTime;
    step.status = 'failed';
    step.error = error;

    this.error(`❌ Failed: ${step.stepName}`, new Error(error));
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
    this.addTraceStep('info', `${emoji} ${message}`, metadata);
  }

  /**
   * Update session metadata with custom properties
   * Useful for adding domain-specific information to sessions
   */
  updateSessionMetadata(metadata: Record<string, unknown>): void {
    if (!this.currentSessionId) return;

    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.metadata = {
        ...session.metadata,
        ...this.sanitizeData(metadata),
      };
    }
  }

  // ===== Data Retrieval Methods =====

  getAllLogs(): LogEntry[] {
    return this.logs;
  }

  getAllSessions(): Session[] {
    const sessions = Array.from(this.sessions.values());
    return sessions.sort((a, b) => {
      const diff =
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime();
      if (diff !== 0) return diff;
      return b.id.localeCompare(a.id);
    });
  }

  getSession(id: string): Session | null {
    return this.sessions.get(id) || null;
  }

  getCurrentSession(): Session | null {
    return this.currentSessionId
      ? this.sessions.get(this.currentSessionId) || null
      : null;
  }

  // ===== Utility Methods =====

  private sanitizeData(data?: unknown): Record<string, unknown> | undefined {
    if (!data) return undefined;

    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        if (
          !this.sensitiveFields.some(field =>
            key.toLowerCase().includes(field.toLowerCase())
          )
        ) {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }

    return {};
  }

  private cleanupOldSessions(): void {
    const sessions = Array.from(this.sessions.entries());
    if (sessions.length > this.maxSessions) {
      // Keep only the most recent sessions
      const sorted = sessions.sort((a, b) => {
        const diff =
          new Date(b[1].startTime).getTime() -
          new Date(a[1].startTime).getTime();
        if (diff !== 0) return diff;
        return b[0].localeCompare(a[0]);
      });

      for (let i = this.maxSessions; i < sorted.length; i++) {
        this.sessions.delete(sorted[i][0]);
      }
    }
  }

  clearOldSessions(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, session] of this.sessions.entries()) {
      if (new Date(session.startTime).getTime() < oneHourAgo) {
        this.sessions.delete(id);
      }
    }
  }
}

// Get logger instance - using a function for lazy initialization
export const getLogger = (config?: UnifiedLoggerConfig): UnifiedLogger =>
  UnifiedLogger.getInstance(config);

// Export types and constants
export * from './types';
