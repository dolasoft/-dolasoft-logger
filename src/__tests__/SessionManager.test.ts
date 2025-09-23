import { describe, it, expect, beforeEach } from 'vitest';
import { SessionManager } from '../managers/SessionManager';
import type { ExecutionStep } from '../types';

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    sessionManager = new SessionManager(100);
  });

  describe('Session Management', () => {
    it('should start a session', () => {
      const session = sessionManager.startSession('test-id', 'trace', {
        test: 'data',
      });

      expect(session).toMatchObject({
        id: 'test-id',
        type: 'trace',
        steps: [],
        metadata: { test: 'data' },
      });
      expect(session.startTime).toBeDefined();
    });

    it('should get current session', () => {
      sessionManager.startSession('test-id', 'execution');
      const current = sessionManager.getCurrentSession();

      expect(current).toBeDefined();
      expect(current?.id).toBe('test-id');
    });

    it('should end a session', async () => {
      sessionManager.startSession('test-id', 'trace');

      // Wait a bit to ensure measurable duration
      await new Promise(resolve => setTimeout(resolve, 1));

      const ended = sessionManager.endSession();

      expect(ended).toBeDefined();
      expect(ended?.endTime).toBeDefined();
      expect(ended?.totalDuration).toBeGreaterThanOrEqual(0);
      expect(sessionManager.getCurrentSession()).toBeNull();
    });

    it('should return null when ending without active session', () => {
      const result = sessionManager.endSession();
      expect(result).toBeNull();
    });

    it('should get session by id', () => {
      sessionManager.startSession('test-id', 'trace');
      sessionManager.endSession();

      const session = sessionManager.getSession('test-id');
      expect(session).toBeDefined();
      expect(session?.id).toBe('test-id');
    });

    it('should get all sessions sorted by start time', () => {
      sessionManager.startSession('session-1', 'trace');
      sessionManager.endSession();

      // Small delay to ensure different timestamps
      setTimeout(() => {
        sessionManager.startSession('session-2', 'execution');
        sessionManager.endSession();
      }, 10);

      setTimeout(() => {
        const sessions = sessionManager.getAllSessions();
        expect(sessions).toHaveLength(2);
        // Most recent first
        expect(sessions[0].id).toBe('session-2');
        expect(sessions[1].id).toBe('session-1');
      }, 20);
    });

    it('should limit stored sessions to maxSessions', () => {
      const limitedManager = new SessionManager(2);

      limitedManager.startSession('s1', 'trace');
      limitedManager.endSession();
      limitedManager.startSession('s2', 'trace');
      limitedManager.endSession();
      limitedManager.startSession('s3', 'trace');
      limitedManager.endSession();

      const sessions = limitedManager.getAllSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions.map(s => s.id)).toEqual(['s3', 's2']);
    });

    it('should clear old sessions', () => {
      // Create a session with an old timestamp
      sessionManager.startSession('old-session', 'trace');
      const session = sessionManager.getSession('old-session');
      if (session) {
        // Manually set the start time to 2 hours ago
        session.startTime = new Date(
          Date.now() - 2 * 60 * 60 * 1000
        ).toISOString();
      }
      sessionManager.endSession();

      sessionManager.startSession('new-session', 'trace');
      sessionManager.endSession();

      sessionManager.clearOldSessions();

      const sessions = sessionManager.getAllSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('new-session');
    });
  });

  describe('Step Management', () => {
    it('should add steps to current session', () => {
      sessionManager.startSession('test-id', 'trace');

      const step = {
        timestamp: new Date().toISOString(),
        level: 'info' as const,
        message: 'Test step',
      };

      sessionManager.addStep(step);

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(1);
      expect(session?.steps[0]).toEqual(step);
    });

    it('should not add steps without active session', () => {
      const step = {
        timestamp: new Date().toISOString(),
        level: 'info' as const,
        message: 'Test step',
      };

      // Should not throw, just ignore
      expect(() => sessionManager.addStep(step)).not.toThrow();
    });

    it('should find execution step in current session', () => {
      sessionManager.startSession('test-id', 'execution');

      const execStep: ExecutionStep = {
        stepId: 'step-1',
        stepName: 'Test Step',
        startTime: Date.now(),
        status: 'started',
      };

      sessionManager.addStep(execStep);

      const found = sessionManager.findStepInCurrentSession('step-1');
      expect(found).toEqual(execStep);
    });

    it('should return undefined when step not found', () => {
      sessionManager.startSession('test-id', 'execution');
      const found = sessionManager.findStepInCurrentSession('non-existent');
      expect(found).toBeUndefined();
    });

    it('should return undefined when no current session', () => {
      const found = sessionManager.findStepInCurrentSession('step-1');
      expect(found).toBeUndefined();
    });
  });

  describe('Metadata Management', () => {
    it('should update session metadata', () => {
      sessionManager.startSession('test-id', 'trace', { initial: 'data' });

      sessionManager.updateSessionMetadata({
        additional: 'info',
        updated: true,
      });

      const session = sessionManager.getCurrentSession();
      expect(session?.metadata).toEqual({
        initial: 'data',
        additional: 'info',
        updated: true,
      });
    });

    it('should not update metadata without active session', () => {
      // Should not throw, just ignore
      expect(() =>
        sessionManager.updateSessionMetadata({ test: 'data' })
      ).not.toThrow();
    });
  });

  describe('Getters', () => {
    it('should return current session id', () => {
      expect(sessionManager.getCurrentSessionId()).toBeNull();

      sessionManager.startSession('test-id', 'trace');
      expect(sessionManager.getCurrentSessionId()).toBe('test-id');

      sessionManager.endSession();
      expect(sessionManager.getCurrentSessionId()).toBeNull();
    });

    it('should expose maxSessions', () => {
      expect(sessionManager.maxSessions).toBe(100);

      const customManager = new SessionManager(50);
      expect(customManager.maxSessions).toBe(50);
    });
  });
});
