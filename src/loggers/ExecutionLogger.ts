import type { ExecutionStep } from '../types';
import type { SessionManager } from '../managers/SessionManager';

/**
 * Handles execution-specific logging operations
 */
export class ExecutionLogger {
  private sessionManager: SessionManager;
  private sanitizeData: (data?: unknown) => Record<string, unknown> | undefined;
  private logInfo: (message: string, metadata?: unknown) => void;
  private logError: (message: string, error: Error) => void;

  constructor(
    sessionManager: SessionManager,
    sanitizeData: (data?: unknown) => Record<string, unknown> | undefined,
    logInfo: (message: string, metadata?: unknown) => void,
    logError: (message: string, error: Error) => void
  ) {
    this.sessionManager = sessionManager;
    this.sanitizeData = sanitizeData;
    this.logInfo = logInfo;
    this.logError = logError;
  }

  /**
   * Start an execution step
   */
  startStep(
    stepId: string,
    stepName: string,
    metadata?: Record<string, unknown>
  ): void {
    const session = this.sessionManager.getCurrentSession();
    if (!session) return;

    const step: ExecutionStep = {
      stepId,
      stepName,
      startTime: Date.now(),
      metadata: this.sanitizeData(metadata),
      status: 'started',
    };

    this.sessionManager.addStep(step);
    this.logInfo(`⏱️ Starting: ${stepName}`, metadata);
  }

  /**
   * Complete an execution step
   */
  completeStep(stepId: string, metadata?: Record<string, unknown>): void {
    const step = this.sessionManager.findStepInCurrentSession(stepId);
    if (!step) return;

    step.endTime = Date.now();
    step.duration = step.endTime - step.startTime;
    step.status = 'completed';

    if (metadata) {
      step.metadata = { ...step.metadata, ...this.sanitizeData(metadata) };
    }

    this.logInfo(
      `✅ Completed: ${step.stepName} (${step.duration}ms)`,
      metadata
    );
  }

  /**
   * Mark an execution step as failed
   */
  failStep(stepId: string, error: string): void {
    const step = this.sessionManager.findStepInCurrentSession(stepId);
    if (!step) return;

    step.endTime = Date.now();
    step.duration = step.endTime - step.startTime;
    step.status = 'failed';
    step.error = error;

    this.logError(`❌ Failed: ${step.stepName}`, new Error(error));
  }
}
