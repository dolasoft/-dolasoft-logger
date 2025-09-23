import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { TraceLogger } from '../loggers/TraceLogger';
import { SessionManager } from '../managers/SessionManager';
import type { TraceStep } from '../types';

describe('TraceLogger', () => {
  let traceLogger: TraceLogger;
  let sessionManager: SessionManager;
  let sanitizeData: Mock;

  beforeEach(() => {
    sessionManager = new SessionManager(100);
    sanitizeData = vi.fn(
      (data: unknown) => data as Record<string, unknown> | undefined
    );
    traceLogger = new TraceLogger(sessionManager, sanitizeData);
  });

  describe('addTraceStep', () => {
    it('should add trace step to current trace session', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.addTraceStep('info', 'Test step', { data: 'test' });

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(1);

      const step = session?.steps[0] as TraceStep;
      expect(step).toMatchObject({
        level: 'info',
        message: 'Test step',
        metadata: { data: 'test' },
      });
      expect(step.timestamp).toBeDefined();
    });

    it('should not add step without current session', () => {
      traceLogger.addTraceStep('info', 'Test step');

      // Should not throw
      expect(() => traceLogger.addTraceStep('info', 'Test')).not.toThrow();
    });

    it('should not add step to non-trace session', () => {
      sessionManager.startSession('test-session', 'execution');

      traceLogger.addTraceStep('info', 'Test step');

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(0);
    });

    it('should extract emoji from message', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.addTraceStep('info', '🚀 Launch message');

      const session = sessionManager.getCurrentSession();
      const step = session?.steps[0] as TraceStep;
      expect(step.emoji).toBe('🚀');
    });

    it('should handle messages without emoji', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.addTraceStep('info', 'No emoji here');

      const session = sessionManager.getCurrentSession();
      const step = session?.steps[0] as TraceStep;
      expect(step.emoji).toBeUndefined();
    });

    it('should sanitize metadata', () => {
      sessionManager.startSession('test-session', 'trace');

      const metadata = { sensitive: 'data' };
      traceLogger.addTraceStep('info', 'Test', metadata);

      expect(sanitizeData).toHaveBeenCalledWith(metadata);
    });
  });

  describe('startTraceStep', () => {
    it('should start a timed trace step', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.startTraceStep('step1', 'Starting process', { id: 123 });

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(1);

      const step = session?.steps[0] as TraceStep;
      expect(step.message).toBe('⏱️  Starting process');
      expect(step.level).toBe('start');
      expect(step.metadata).toEqual({ id: 123 });
    });

    it('should track step start time internally', () => {
      sessionManager.startSession('test-session', 'trace');

      // Start time is tracked internally by traceLogger
      traceLogger.startTraceStep('step1', 'Starting');

      // Complete immediately
      traceLogger.completeTraceStep('step1');

      const session = sessionManager.getCurrentSession();
      const completeStep = session?.steps[1] as TraceStep;
      expect(completeStep.metadata?.duration).toBeDefined();
      expect(completeStep.metadata?.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('completeTraceStep', () => {
    it('should complete a trace step with duration', async () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.startTraceStep('step1', 'Starting');

      // Wait a bit to ensure measurable duration
      await new Promise(resolve => setTimeout(resolve, 10));

      traceLogger.completeTraceStep('step1', 'Process completed', {
        result: 'success',
      });

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(2);

      const completeStep = session?.steps[1] as TraceStep;
      expect(completeStep.level).toBe('complete');
      expect(completeStep.message).toMatch(
        /✅ Process completed completed in \d+ms/
      );
      expect(completeStep.metadata).toMatchObject({
        duration: expect.any(Number),
        result: 'success',
      });
      expect(completeStep.metadata?.duration).toBeGreaterThan(0);
    });

    it('should use step name if no message provided', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.startTraceStep('myStep', 'Starting');
      traceLogger.completeTraceStep('myStep');

      const session = sessionManager.getCurrentSession();
      const completeStep = session?.steps[1] as TraceStep;
      expect(completeStep.message).toMatch(/✅ myStep completed in \d+ms/);
    });

    it('should handle completing non-started step', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.completeTraceStep('never-started', 'Completed');

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(1);

      const step = session?.steps[0] as TraceStep;
      expect(step.message).toBe('✅ Completed completed in 0ms');
      expect(step.metadata?.duration).toBe(0);
    });

    it('should clean up tracked start times', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.startTraceStep('step1', 'Starting');
      traceLogger.completeTraceStep('step1');

      // Starting another step with same name should start fresh
      traceLogger.startTraceStep('step1', 'Starting again');
      traceLogger.completeTraceStep('step1');

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(4); // 2 starts + 2 completes
    });
  });

  describe('logCustom', () => {
    it('should log custom message with emoji', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.logCustom('🎉', 'Celebration time', { score: 100 });

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(1);

      const step = session?.steps[0] as TraceStep;
      expect(step.level).toBe('info');
      expect(step.message).toBe('🎉 Celebration time');
      expect(step.emoji).toBe('🎉');
      expect(step.metadata).toEqual({ score: 100 });
    });

    it('should handle custom emoji in message', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.logCustom('📊', 'Data processed');

      const session = sessionManager.getCurrentSession();
      const step = session?.steps[0] as TraceStep;
      expect(step.message).toBe('📊 Data processed');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long messages', () => {
      sessionManager.startSession('test-session', 'trace');

      const longMessage = 'A'.repeat(1000);
      traceLogger.addTraceStep('info', longMessage);

      const session = sessionManager.getCurrentSession();
      const step = session?.steps[0] as TraceStep;
      expect(step.message).toBe(longMessage);
    });

    it('should handle undefined metadata', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.addTraceStep('info', 'Test', undefined);

      const session = sessionManager.getCurrentSession();
      const step = session?.steps[0] as TraceStep;
      expect(step.metadata).toBeUndefined();
    });

    it('should handle multiple emoji in message', () => {
      sessionManager.startSession('test-session', 'trace');

      traceLogger.addTraceStep('info', '🚀 Launch 🎯 Target');

      const session = sessionManager.getCurrentSession();
      const step = session?.steps[0] as TraceStep;
      expect(step.emoji).toBe('🚀'); // Only first emoji is extracted
    });
  });
});
