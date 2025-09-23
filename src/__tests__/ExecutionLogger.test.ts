import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { ExecutionLogger } from '../loggers/ExecutionLogger';
import { SessionManager } from '../managers/SessionManager';
import type { ExecutionStep } from '../types';

describe('ExecutionLogger', () => {
  let executionLogger: ExecutionLogger;
  let sessionManager: SessionManager;
  let sanitizeData: Mock;
  let logInfo: Mock;
  let logError: Mock;

  beforeEach(() => {
    sessionManager = new SessionManager(100);
    sanitizeData = vi.fn(
      (data: unknown) => data as Record<string, unknown> | undefined
    );
    logInfo = vi.fn();
    logError = vi.fn();

    executionLogger = new ExecutionLogger(
      sessionManager,
      sanitizeData,
      logInfo,
      logError
    );
  });

  describe('startStep', () => {
    it('should start an execution step', () => {
      sessionManager.startSession('test-session', 'execution');

      executionLogger.startStep('step-1', 'Process Data', {
        input: 'file.txt',
      });

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(1);

      const step = session?.steps[0] as ExecutionStep;
      expect(step).toMatchObject({
        stepId: 'step-1',
        stepName: 'Process Data',
        status: 'started',
        metadata: { input: 'file.txt' },
      });
      expect(step.startTime).toBeDefined();
      expect(step.startTime).toBeGreaterThan(0);
    });

    it('should log info when starting step', () => {
      sessionManager.startSession('test-session', 'execution');

      executionLogger.startStep('step-1', 'Process Data', {
        input: 'file.txt',
      });

      expect(logInfo).toHaveBeenCalledWith('⏱️ Starting: Process Data', {
        input: 'file.txt',
      });
    });

    it('should sanitize metadata', () => {
      sessionManager.startSession('test-session', 'execution');

      const metadata = { password: 'secret' };
      executionLogger.startStep('step-1', 'Login', metadata);

      expect(sanitizeData).toHaveBeenCalledWith(metadata);
    });

    it('should not add step without active session', () => {
      executionLogger.startStep('step-1', 'Process Data');

      // Should not throw
      expect(() => executionLogger.startStep('step-1', 'Test')).not.toThrow();
      expect(logInfo).not.toHaveBeenCalled();
    });
  });

  describe('completeStep', () => {
    it('should complete an execution step', async () => {
      sessionManager.startSession('test-session', 'execution');
      executionLogger.startStep('step-1', 'Process Data');

      // Wait a bit to ensure measurable duration
      await new Promise(resolve => setTimeout(resolve, 10));

      executionLogger.completeStep('step-1', { output: 'result.json' });

      const session = sessionManager.getCurrentSession();
      const step = session?.steps[0] as ExecutionStep;

      expect(step.status).toBe('completed');
      expect(step.endTime).toBeDefined();
      expect(step.duration).toBeDefined();
      expect(step.duration).toBeGreaterThan(0);
      expect(step.metadata).toEqual({ output: 'result.json' });
    });

    it('should log info when completing step', async () => {
      sessionManager.startSession('test-session', 'execution');
      executionLogger.startStep('step-1', 'Process Data');

      await new Promise(resolve => setTimeout(resolve, 10));

      executionLogger.completeStep('step-1', { output: 'result.json' });

      expect(logInfo).toHaveBeenCalledWith(
        expect.stringMatching(/✅ Completed: Process Data \(\d+ms\)/),
        { output: 'result.json' }
      );
    });

    it('should merge metadata when completing', () => {
      sessionManager.startSession('test-session', 'execution');
      executionLogger.startStep('step-1', 'Process', { input: 'data' });

      executionLogger.completeStep('step-1', { output: 'result' });

      const session = sessionManager.getCurrentSession();
      const step = session?.steps[0] as ExecutionStep;

      expect(step.metadata).toEqual({
        input: 'data',
        output: 'result',
      });
    });

    it('should sanitize additional metadata', () => {
      sessionManager.startSession('test-session', 'execution');
      executionLogger.startStep('step-1', 'Process');

      const metadata = { secret: 'value' };
      executionLogger.completeStep('step-1', metadata);

      expect(sanitizeData).toHaveBeenCalledWith(metadata);
    });

    it('should not complete non-existent step', () => {
      sessionManager.startSession('test-session', 'execution');

      executionLogger.completeStep('non-existent');

      expect(logInfo).toHaveBeenCalledTimes(0);
    });

    it('should not complete without active session', () => {
      executionLogger.completeStep('step-1');

      expect(logInfo).not.toHaveBeenCalled();
    });
  });

  describe('failStep', () => {
    it('should mark step as failed', async () => {
      sessionManager.startSession('test-session', 'execution');
      executionLogger.startStep('step-1', 'Process Data');

      await new Promise(resolve => setTimeout(resolve, 10));

      executionLogger.failStep('step-1', 'File not found');

      const session = sessionManager.getCurrentSession();
      const step = session?.steps[0] as ExecutionStep;

      expect(step.status).toBe('failed');
      expect(step.error).toBe('File not found');
      expect(step.endTime).toBeDefined();
      expect(step.duration).toBeDefined();
      expect(step.duration).toBeGreaterThan(0);
    });

    it('should log error when failing step', () => {
      sessionManager.startSession('test-session', 'execution');
      executionLogger.startStep('step-1', 'Process Data');

      executionLogger.failStep('step-1', 'File not found');

      expect(logError).toHaveBeenCalledWith(
        '❌ Failed: Process Data',
        new Error('File not found')
      );
    });

    it('should not fail non-existent step', () => {
      sessionManager.startSession('test-session', 'execution');

      executionLogger.failStep('non-existent', 'Error');

      expect(logError).not.toHaveBeenCalled();
    });

    it('should not fail without active session', () => {
      executionLogger.failStep('step-1', 'Error');

      expect(logError).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple steps', () => {
      sessionManager.startSession('test-session', 'execution');

      executionLogger.startStep('step-1', 'First Step');
      executionLogger.startStep('step-2', 'Second Step');
      executionLogger.completeStep('step-1');
      executionLogger.startStep('step-3', 'Third Step');
      executionLogger.failStep('step-2', 'Error in step 2');
      executionLogger.completeStep('step-3');

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(3);

      const steps = session?.steps as ExecutionStep[];
      expect(steps[0].status).toBe('completed');
      expect(steps[1].status).toBe('failed');
      expect(steps[2].status).toBe('completed');
    });

    it('should handle completing already completed step', () => {
      sessionManager.startSession('test-session', 'execution');

      executionLogger.startStep('step-1', 'Process');
      executionLogger.completeStep('step-1');

      const firstComplete = logInfo.mock.calls.length;

      // Try to complete again - it will find the step and log again
      executionLogger.completeStep('step-1');

      // Should log again since step is still found
      expect(logInfo).toHaveBeenCalledTimes(firstComplete + 1);
    });

    it('should handle very long step names', () => {
      sessionManager.startSession('test-session', 'execution');

      const longName = 'A'.repeat(1000);
      executionLogger.startStep('step-1', longName);

      expect(logInfo).toHaveBeenCalledWith(
        `⏱️ Starting: ${longName}`,
        undefined
      );
    });

    it('should handle undefined metadata', () => {
      sessionManager.startSession('test-session', 'execution');

      executionLogger.startStep('step-1', 'Process');
      executionLogger.completeStep('step-1');

      const session = sessionManager.getCurrentSession();
      const step = session?.steps[0] as ExecutionStep;
      expect(step.metadata).toBeUndefined();
    });
  });
});
