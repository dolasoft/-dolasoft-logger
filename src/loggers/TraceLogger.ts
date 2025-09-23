import type { TraceStep } from '../types';
import type { SessionManager } from '../managers/SessionManager';

/**
 * Handles trace-specific logging operations
 */
export class TraceLogger {
  private stepStartTimes: Map<string, number> = new Map();
  private sessionManager: SessionManager;
  private sanitizeData: (data?: unknown) => Record<string, unknown> | undefined;

  constructor(
    sessionManager: SessionManager,
    sanitizeData: (data?: unknown) => Record<string, unknown> | undefined
  ) {
    this.sessionManager = sessionManager;
    this.sanitizeData = sanitizeData;
  }

  /**
   * Add a trace step to the current session
   */
  addTraceStep(
    level: TraceStep['level'],
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    const session = this.sessionManager.getCurrentSession();
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

    this.sessionManager.addStep(step);
  }

  /**
   * Start tracking a trace step
   */
  startTraceStep(
    stepName: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.stepStartTimes.set(stepName, Date.now());
    this.addTraceStep('start', `⏱️  ${message}`, metadata);
  }

  /**
   * Complete a trace step and calculate duration
   */
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

  /**
   * Log a custom trace step with an emoji and message
   */
  logCustom(
    emoji: string,
    message: string,
    metadata?: Record<string, unknown>
  ): void {
    this.addTraceStep('info', `${emoji} ${message}`, metadata);
  }
}
