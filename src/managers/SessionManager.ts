import type { Session, TraceStep, ExecutionStep, LogEntry } from '../types';
import {
  sortSessionsDesc,
  sortSessionEntriesDesc,
} from '../utils/session-utils';

/**
 * Manages logging sessions including creation, cleanup, and retrieval
 */
export class SessionManager {
  private sessions: Map<string, Session> = new Map();
  private currentSessionId: string | null = null;
  readonly maxSessions: number;

  constructor(maxSessions: number) {
    this.maxSessions = maxSessions;
  }

  /**
   * Start a new session
   */
  startSession(
    id: string,
    type: Session['type'] = 'trace',
    metadata?: Record<string, unknown>
  ): Session {
    const session: Session = {
      id,
      type,
      startTime: new Date().toISOString(),
      steps: [],
      metadata,
    };

    this.sessions.set(id, session);
    this.currentSessionId = id;

    return session;
  }

  /**
   * End the current session
   */
  endSession(): Session | null {
    if (!this.currentSessionId) return null;

    const session = this.sessions.get(this.currentSessionId);
    if (!session) return null;

    session.endTime = new Date().toISOString();
    session.totalDuration =
      new Date(session.endTime).getTime() -
      new Date(session.startTime).getTime();

    this.currentSessionId = null;
    this.cleanupOldSessions();

    return session;
  }

  /**
   * Add a step to the current session
   */
  addStep(step: TraceStep | ExecutionStep | LogEntry): void {
    if (!this.currentSessionId) return;

    const session = this.sessions.get(this.currentSessionId);
    if (!session) return;

    session.steps.push(step);
  }

  /**
   * Get the current session
   */
  getCurrentSession(): Session | null {
    return this.currentSessionId
      ? this.sessions.get(this.currentSessionId) || null
      : null;
  }

  /**
   * Get a specific session by ID
   */
  getSession(id: string): Session | null {
    return this.sessions.get(id) || null;
  }

  /**
   * Get all sessions sorted by start time
   */
  getAllSessions(): Session[] {
    return sortSessionsDesc(Array.from(this.sessions.values()));
  }

  /**
   * Update metadata for the current session
   */
  updateSessionMetadata(metadata: Record<string, unknown>): void {
    if (!this.currentSessionId) return;

    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.metadata = {
        ...session.metadata,
        ...metadata,
      };
    }
  }

  /**
   * Get the current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }

  /**
   * Clear sessions older than one hour
   */
  clearOldSessions(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, session] of this.sessions.entries()) {
      if (new Date(session.startTime).getTime() < oneHourAgo) {
        this.sessions.delete(id);
      }
    }
  }

  /**
   * Find a step in the current session
   */
  findStepInCurrentSession(stepId: string): ExecutionStep | undefined {
    const session = this.getCurrentSession();
    if (!session) return undefined;

    return session.steps.find(
      (s): s is ExecutionStep => 'stepId' in s && s.stepId === stepId
    );
  }

  private cleanupOldSessions(): void {
    const sessions = Array.from(this.sessions.entries());
    if (sessions.length > this.maxSessions) {
      const sorted = sortSessionEntriesDesc(sessions);
      for (let i = this.maxSessions; i < sorted.length; i++) {
        this.sessions.delete(sorted[i][0]);
      }
    }
  }
}
