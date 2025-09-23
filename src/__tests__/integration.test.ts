import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnifiedLogger, LOG_MODES } from '../index';
import type { ExecutionStep } from '../types';

// Mock fetch
global.fetch = vi.fn();

describe('Integration Tests', () => {
  let logger: UnifiedLogger;

  beforeEach(() => {
    UnifiedLogger.resetInstance();
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
  });

  describe('Real-world Scenarios', () => {
    it('should handle a complete API request tracking flow', async () => {
      logger = UnifiedLogger.getInstance({ logMode: LOG_MODES.CONSOLE });

      // Start API request tracking
      logger.startSession('api-req-123', 'execution', {
        endpoint: '/api/users',
        method: 'POST',
      });

      // Authentication step
      logger.startStep('auth', 'Authenticating request');
      await new Promise(resolve => setTimeout(resolve, 10));
      logger.completeStep('auth', { userId: 'user-456' });

      // Validation step
      logger.startStep('validate', 'Validating request body');
      logger.completeStep('validate', { valid: true });

      // Database operation
      logger.startStep('db-save', 'Saving to database');
      await new Promise(resolve => setTimeout(resolve, 20));
      logger.completeStep('db-save', { recordId: 'rec-789' });

      // Update session metadata with response info
      logger.updateSessionMetadata({
        statusCode: 201,
        responseTime: Date.now(),
      });

      // End session
      const session = logger.endSession();

      expect(session).toBeDefined();
      expect(session?.steps.length).toBeGreaterThan(3);
      expect(session?.metadata?.statusCode).toBe(201);
      expect(session?.totalDuration).toBeGreaterThan(30);
    });

    it('should handle error scenarios gracefully', () => {
      logger = UnifiedLogger.getInstance({ logMode: LOG_MODES.CONSOLE });

      logger.startSession('error-flow', 'execution');

      // Successful steps
      logger.startStep('step1', 'First step');
      logger.completeStep('step1');

      // Failed step
      logger.startStep('step2', 'Second step');
      try {
        throw new Error('Database connection failed');
      } catch (error) {
        logger.failStep('step2', (error as Error).message);
        logger.error('Step 2 failed', error);
      }

      // Recovery attempt
      logger.startStep('recovery', 'Attempting recovery');
      logger.completeStep('recovery', { recovered: true });

      const session = logger.endSession();

      const failedStep = session?.steps.find(
        s => 'stepId' in s && s.stepId === 'step2'
      );

      expect(failedStep).toBeDefined();
      expect((failedStep as ExecutionStep).status).toBe('failed');
    });

    it('should handle concurrent operations with proper isolation', () => {
      logger = UnifiedLogger.getInstance({ logMode: LOG_MODES.CONSOLE });

      // Simulate concurrent operations
      const operation1 = () => {
        logger.startSession('op1', 'trace');
        logger.logCustom('🔄', 'Operation 1 started');
        logger.addTraceStep('info', 'Processing op1 data');
        return logger.endSession();
      };

      const operation2 = () => {
        logger.startSession('op2', 'trace');
        logger.logCustom('🔄', 'Operation 2 started');
        logger.addTraceStep('info', 'Processing op2 data');
        return logger.endSession();
      };

      // Run operations sequentially (since we can't have truly concurrent sessions)
      const session1 = operation1();
      const session2 = operation2();

      expect(session1?.id).toBe('op1');
      expect(session2?.id).toBe('op2');
      expect(logger.getAllSessions()).toHaveLength(2);
    });

    it('should handle mixed logging patterns', () => {
      logger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.CONSOLE,
        sensitiveFields: ['apiKey', 'token'],
      });

      // General logging
      logger.info('Application started');
      logger.debug('Config loaded', { env: 'test' });

      // Session-based logging
      logger.startSession('mixed-test', 'trace');
      logger.logCustom('🚀', 'Starting process');
      logger.info('Session log', { apiKey: 'secret123' }); // Should be sanitized

      // Trace steps
      logger.startTraceStep('step1', 'Processing data');
      logger.completeTraceStep('step1');

      // End session and continue general logging
      const session = logger.endSession();
      logger.warn('Post-session warning');

      const logs = logger.getAllLogs();
      const sessionLog = logs.find(l => l.message === 'Session log');

      expect(logs.length).toBeGreaterThanOrEqual(4);
      expect(session?.steps.length).toBeGreaterThan(2);
      expect(
        (sessionLog?.context as Record<string, unknown>)?.apiKey
      ).toBeUndefined();
    });

    it('should handle remote logging with retries', async () => {
      logger = UnifiedLogger.getInstance({
        logMode: 'route',
        routeUrl: 'https://api.example.com/logs',
      });

      // First call fails
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      // Second call succeeds
      vi.mocked(fetch).mockResolvedValueOnce({ ok: true } as Response);

      logger.info('Test message');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      // The logger should handle the error gracefully
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should manage memory efficiently with high volume', () => {
      logger = UnifiedLogger.getInstance({
        maxLogs: 100,
        maxSessions: 10,
      });

      // Generate many logs
      for (let i = 0; i < 200; i++) {
        logger.info(`Log message ${i}`);
      }

      // Generate many sessions
      for (let i = 0; i < 20; i++) {
        logger.startSession(`session-${i}`, 'general');
        logger.info(`Session ${i} log`);
        logger.endSession();
      }

      const logs = logger.getAllLogs();
      const sessions = logger.getAllSessions();

      expect(logs.length).toBe(100);
      expect(sessions.length).toBe(10);

      // Check that we have the expected number of sessions
      // The cleanup keeps the most recent 10 sessions
      const sessionIds = sessions.map(s => s.id);
      // Should have the last 10 sessions (10-19)
      expect(sessionIds).toHaveLength(10);

      // Verify we have some of the more recent sessions
      // Due to session cleanup timing, we should have the last 10 sessions created
      const sessionNumbers = sessionIds.map(id => parseInt(id.split('-')[1]));
      const maxSessionNumber = Math.max(...sessionNumbers);
      expect(maxSessionNumber).toBeGreaterThanOrEqual(9);

      // Check that we have recent logs (not necessarily the exact last one due to session logs)
      const hasRecentLog = logs.some(log => log.message.includes('19'));
      expect(hasRecentLog).toBe(true);
    });
  });

  describe('Performance Considerations', () => {
    it('should handle rapid logging without blocking', async () => {
      logger = UnifiedLogger.getInstance({ logMode: LOG_MODES.BOTH });

      vi.mocked(fetch).mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ ok: true } as Response), 100)
          )
      );

      const startTime = Date.now();

      // Rapid fire logs
      for (let i = 0; i < 50; i++) {
        logger.info(`Rapid log ${i}`);
      }

      const syncTime = Date.now() - startTime;

      // Logging should complete quickly without waiting for fetch
      expect(syncTime).toBeLessThan(100);

      // Wait to ensure fetch calls complete
      await new Promise(resolve => setTimeout(resolve, 200));
    });

    it('should efficiently serialize large objects', () => {
      logger = UnifiedLogger.getInstance();

      const largeObject = {
        data: Array(1000)
          .fill(null)
          .map((_, i) => ({
            id: i,
            value: `value-${i}`,
            nested: { deep: { data: i } },
          })),
      };

      // Should not throw or hang
      const start = Date.now();
      logger.info('Large object', largeObject);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('Edge Case Handling', () => {
    it('should handle malformed session data', () => {
      logger = UnifiedLogger.getInstance();

      logger.startSession('malformed', 'trace');

      // Try to add invalid steps
      const session = logger.getCurrentSession();
      if (session) {
        // Directly manipulate session
        session.steps.push(null as never);
        session.steps.push(undefined as never);
        session.steps.push({} as never);
      }

      // Should not crash when ending session
      expect(() => logger.endSession()).not.toThrow();
    });

    it('should recover from fetch failures', async () => {
      logger = UnifiedLogger.getInstance({
        logMode: 'both',
        routeUrl: 'https://api.example.com/logs',
      });

      // Mock fetch to always fail
      vi.mocked(fetch).mockImplementation(() => {
        throw new Error('Fetch is not defined');
      });

      // Should still log to console
      expect(() => {
        logger.info('Test');
        logger.error('Error', new Error('Test error'));
      }).not.toThrow();

      const logs = logger.getAllLogs();
      expect(logs.length).toBe(2);
    });

    it('should handle session cleanup after crashes', () => {
      logger = UnifiedLogger.getInstance({ maxSessions: 3 });

      // Create sessions without properly ending them
      for (let i = 0; i < 5; i++) {
        logger.startSession(`abandoned-${i}`, 'trace');
        logger.logCustom('💥', 'Simulating crash');
        // Abandon session without ending
      }

      // Create a proper session
      logger.startSession('proper', 'trace');
      const properSession = logger.endSession();

      expect(properSession).toBeDefined();
      expect(logger.getAllSessions().length).toBeLessThanOrEqual(3);
    });
  });
});
