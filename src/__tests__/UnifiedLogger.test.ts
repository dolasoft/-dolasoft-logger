import {
  describe,
  it,
  expect,
  beforeEach,
  vi,
  afterEach,
  beforeAll,
  afterAll,
} from 'vitest';
import { UnifiedLogger } from '../index';
import { LOG_MODES } from '../types';
import type { LogEntry, TraceStep, ExecutionStep } from '../types';

// Mock fetch for route logging tests
global.fetch = vi.fn();

describe('UnifiedLogger', () => {
  let logger: UnifiedLogger;

  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  // Reset the singleton instance before all tests
  beforeAll(() => {
    UnifiedLogger.resetInstance();
  });

  // Reset singleton after all tests
  afterAll(() => {
    UnifiedLogger.resetInstance();
  });

  beforeEach(() => {
    // Spy on console methods first
    consoleLogSpy = vi
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);
    consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);
    consoleDebugSpy = vi
      .spyOn(console, 'debug')
      .mockImplementation(() => undefined);

    // Clear any previous mocks
    vi.clearAllMocks();

    // Create a new logger instance for each test
    logger = new UnifiedLogger({ logMode: LOG_MODES.CONSOLE });

    // Clear the initialization log
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor and Configuration', () => {
    it('should initialize with default configuration', () => {
      const defaultLogger = new UnifiedLogger();
      expect(defaultLogger['logMode']).toBe(LOG_MODES.CONSOLE);
      expect(defaultLogger['routeUrl']).toBe('http://localhost:3000/api/logs');
      expect(defaultLogger['maxLogs']).toBe(1000);
      expect(defaultLogger['maxSessions']).toBe(100);
    });

    it('should accept custom configuration', () => {
      const customLogger = new UnifiedLogger({
        logMode: LOG_MODES.BOTH,
        routeUrl: 'https://api.example.com/logs',
        maxLogs: 500,
        maxSessions: 50,
        sensitiveFields: ['customSecret'],
      });

      expect(customLogger['logMode']).toBe(LOG_MODES.BOTH);
      expect(customLogger['routeUrl']).toBe('https://api.example.com/logs');
      expect(customLogger['maxLogs']).toBe(500);
      expect(customLogger['maxSessions']).toBe(50);
      expect(customLogger['sensitiveFields']).toContain('customSecret');
    });

    it('should respect LOG_MODE environment variable', () => {
      const originalEnv = process.env.LOG_MODE;
      process.env.LOG_MODE = 'route';

      const envLogger = new UnifiedLogger();
      expect(envLogger['logMode']).toBe(LOG_MODES.ROUTE);

      process.env.LOG_MODE = originalEnv;
    });

    it('should not log initialization in none mode', () => {
      consoleLogSpy.mockClear();

      new UnifiedLogger({ logMode: LOG_MODES.NONE });

      // The logger should not log anything when initialized with 'none' mode
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('General Logging Methods', () => {
    beforeEach(() => {
      // Clear initialization logs for each test
      consoleLogSpy.mockClear();
      consoleDebugSpy.mockClear();
      consoleWarnSpy.mockClear();
      consoleErrorSpy.mockClear();
    });

    it('should log debug messages', () => {
      logger.debug('Debug message', { data: 'test' });
      expect(consoleDebugSpy).toHaveBeenCalledWith(
        '[DEBUG] Debug message',
        { data: 'test' },
        undefined
      );
    });

    it('should log info messages', () => {
      logger.info('Info message', { data: 'test' });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[INFO] Info message',
        { data: 'test' },
        undefined
      );
    });

    it('should log warn messages', () => {
      logger.warn('Warning message', { data: 'test' });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARN] Warning message',
        { data: 'test' },
        undefined
      );
    });

    it('should log error messages with Error object', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error, { context: 'test' });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] Error occurred',
        expect.objectContaining({
          context: 'test',
          error: 'Test error',
          stack: expect.any(String),
        }),
        undefined
      );
    });

    it('should log error messages with non-Error object', () => {
      logger.error('Error occurred', 'String error', { context: 'test' });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR] Error occurred',
        expect.objectContaining({
          context: 'test',
          error: 'String error',
        }),
        undefined
      );
    });

    it('should store logs in memory', () => {
      const initialLogCount = logger.getAllLogs().length;

      logger.info('Test log 1');
      logger.info('Test log 2');

      const logs = logger.getAllLogs();
      expect(logs.length).toBe(initialLogCount + 2);

      // Check the last two logs
      expect(logs[logs.length - 2].message).toBe('Test log 1');
      expect(logs[logs.length - 1].message).toBe('Test log 2');
    });

    it('should limit stored logs to maxLogs', () => {
      const limitedLogger = new UnifiedLogger({ maxLogs: 3 });

      limitedLogger.info('Log 1');
      limitedLogger.info('Log 2');
      limitedLogger.info('Log 3');
      limitedLogger.info('Log 4');

      const logs = limitedLogger.getAllLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('Log 2');
      expect(logs[2].message).toBe('Log 4');
    });
  });

  describe('Session Management', () => {
    it('should start a trace session', () => {
      logger.startSession('test-session-1', 'trace', { user: 'testuser' });

      const session = logger.getCurrentSession();
      expect(session).toBeDefined();
      expect(session?.id).toBe('test-session-1');
      expect(session?.type).toBe('trace');
      expect(session?.metadata).toEqual({ user: 'testuser' });
    });

    it('should start an execution session', () => {
      logger.startSession('exec-session-1', 'execution');

      const session = logger.getCurrentSession();
      expect(session).toBeDefined();
      expect(session?.type).toBe('execution');
    });

    it('should end a session and calculate duration', async () => {
      logger.startSession('test-session-2', 'trace');

      // Wait a bit to ensure duration > 0
      await new Promise(resolve => setTimeout(resolve, 10));

      const endedSession = logger.endSession();
      expect(endedSession).toBeDefined();
      expect(endedSession?.endTime).toBeDefined();
      expect(endedSession?.totalDuration).toBeGreaterThan(0);
    });

    it('should return null when ending without active session', () => {
      const result = logger.endSession();
      expect(result).toBeNull();
    });

    it('should get session by id', () => {
      logger.startSession('find-me', 'general');
      logger.endSession();

      const session = logger.getSession('find-me');
      expect(session).toBeDefined();
      expect(session?.id).toBe('find-me');
    });

    it('should get all sessions sorted by start time', async () => {
      logger.startSession('session-sort-1', 'trace');
      logger.endSession();

      // Add small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 1));

      logger.startSession('session-sort-2', 'execution');
      logger.endSession();

      const sessions = logger.getAllSessions();
      expect(sessions).toHaveLength(2);
      expect(sessions[0].id).toBe('session-sort-2'); // Most recent first
      expect(sessions[1].id).toBe('session-sort-1');
    });

    it('should limit stored sessions to maxSessions', async () => {
      const limitedLogger = new UnifiedLogger({ maxSessions: 2 });

      limitedLogger.startSession('s1', 'trace');
      limitedLogger.endSession();

      await new Promise(resolve => setTimeout(resolve, 1));

      limitedLogger.startSession('s2', 'trace');
      limitedLogger.endSession();

      await new Promise(resolve => setTimeout(resolve, 1));

      limitedLogger.startSession('s3', 'trace');
      limitedLogger.endSession();

      const sessions = limitedLogger.getAllSessions();
      expect(sessions).toHaveLength(2);
      // Should keep the two most recent sessions (s2 and s3)
      const sessionIds = sessions.map(s => s.id);
      expect(sessionIds).toContain('s2');
      expect(sessionIds).toContain('s3');
      expect(sessionIds).not.toContain('s1');
    });
  });

  describe('Trace Logging', () => {
    beforeEach(() => {
      logger.startSession('trace-test', 'trace');
    });

    it('should add trace steps', () => {
      logger.addTraceStep('start', '🚀 Starting process', { step: 1 });

      const session = logger.getCurrentSession();
      expect(session?.steps).toHaveLength(2); // Initial start step + new step

      const lastStep = session?.steps[session.steps.length - 1];
      expect(lastStep).toMatchObject({
        level: 'start',
        message: '🚀 Starting process',
        metadata: { step: 1 },
      });
    });

    it('should extract emoji from trace messages', () => {
      logger.addTraceStep('info', '📊 Processing data');

      const session = logger.getCurrentSession();
      const lastStep = session?.steps[session.steps.length - 1];
      expect((lastStep as TraceStep).emoji).toBe('📊');
    });

    it('should handle timed trace steps', async () => {
      logger.startTraceStep('data-process', 'Processing data');

      await new Promise(resolve => setTimeout(resolve, 50));

      logger.completeTraceStep('data-process', 'Data processed');

      const session = logger.getCurrentSession();
      const steps = session?.steps || [];
      const completeStep = steps.find(
        s =>
          'message' in s && (s as TraceStep).message?.includes('completed in')
      );

      expect(completeStep).toBeDefined();
      expect(
        (completeStep as TraceStep).metadata?.duration
      ).toBeGreaterThanOrEqual(50);
    });

    it('should ignore trace steps without active trace session', () => {
      logger.endSession();
      logger.addTraceStep('info', 'This should be ignored');

      // Should not throw
      expect(() => logger.addTraceStep('info', 'test')).not.toThrow();
    });
  });

  describe('Execution Tracking', () => {
    beforeEach(() => {
      logger.startSession('exec-test', 'execution');
    });

    it('should track execution steps', () => {
      logger.startStep('step1', 'First step', { priority: 'high' });

      const session = logger.getCurrentSession();
      const step = session?.steps.find(
        s => 'stepId' in s && (s as ExecutionStep).stepId === 'step1'
      );

      expect(step).toBeDefined();
      expect(step).toMatchObject({
        stepId: 'step1',
        stepName: 'First step',
        status: 'started',
        metadata: { priority: 'high' },
      });
    });

    it('should complete execution steps', async () => {
      logger.startStep('step2', 'Second step');

      await new Promise(resolve => setTimeout(resolve, 30));

      logger.completeStep('step2', { result: 'success' });

      const session = logger.getCurrentSession();
      const step = session?.steps.find(
        s => 'stepId' in s && (s as ExecutionStep).stepId === 'step2'
      );

      expect(step).toMatchObject({
        status: 'completed',
        metadata: expect.objectContaining({ result: 'success' }),
      });
      expect((step as ExecutionStep).duration).toBeGreaterThanOrEqual(30);
    });

    it('should fail execution steps', () => {
      logger.startStep('step3', 'Third step');
      logger.failStep('step3', 'Connection timeout');

      const session = logger.getCurrentSession();
      const step = session?.steps.find(
        s => 'stepId' in s && (s as ExecutionStep).stepId === 'step3'
      );

      expect(step).toMatchObject({
        status: 'failed',
        error: 'Connection timeout',
      });
    });

    it('should ignore step operations without active session', () => {
      logger.endSession();

      expect(() => logger.startStep('ignored', 'Test')).not.toThrow();
      expect(() => logger.completeStep('ignored')).not.toThrow();
      expect(() => logger.failStep('ignored', 'error')).not.toThrow();
    });
  });

  describe('Data Sanitization', () => {
    it('should remove default sensitive fields', () => {
      logger.info('User data', {
        username: 'john',
        password: 'secret123',
        token: 'abc123',
        apiKey: 'key-123',
      });

      const logs = logger.getAllLogs();
      const lastLog = logs[logs.length - 1];

      expect(lastLog.context).toBeDefined();
      const context = lastLog.context as Record<string, unknown>;
      expect(context.username).toBe('john');
      expect(context.password).toBeUndefined();
      expect(context.token).toBeUndefined();
      expect(context.apiKey).toBeUndefined();
    });

    it('should remove custom sensitive fields', () => {
      const customLogger = new UnifiedLogger({
        sensitiveFields: ['creditCard', 'ssn'],
      });

      customLogger.info('Payment data', {
        amount: 100,
        creditCard: '1234-5678-9012-3456',
        ssn: '123-45-6789',
      });

      const logs = customLogger.getAllLogs();
      const lastLog = logs[logs.length - 1];

      const context = lastLog.context as Record<string, unknown>;
      expect(context.amount).toBe(100);
      expect(context.creditCard).toBeUndefined();
      expect(context.ssn).toBeUndefined();
    });

    it('should handle non-object data safely', () => {
      logger.info('String context', 'just a string');
      logger.info('Array context', [1, 2, 3]);
      logger.info('Null context', null);

      // Should not throw
      expect(() => logger.getAllLogs()).not.toThrow();
    });
  });

  describe('Log Modes', () => {
    it('should only log to console in console mode', async () => {
      // Our global logger is already in console mode
      consoleLogSpy.mockClear();

      logger.info('Console only');

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });

    // Note: Tests for route mode and other modes are in logger-modes.test.ts
    // This test file focuses on testing with a single logger instance (real-world usage)

    it('should only send to route in route mode', async () => {
      vi.clearAllMocks();

      // Mock fetch before creating logger
      const fetchMock = vi.mocked(global.fetch);
      fetchMock.mockResolvedValueOnce({ ok: true } as Response);

      const routeLogger = new UnifiedLogger({
        logMode: LOG_MODES.ROUTE,
        routeUrl: 'https://api.test.com/logs',
      });

      // Verify the logger is in route mode
      expect(routeLogger['logMode']).toBe(LOG_MODES.ROUTE);

      routeLogger.info('Route only');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.test.com/logs',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should log to both console and route in both mode', async () => {
      vi.clearAllMocks();

      // Mock fetch before creating logger
      const fetchMock = vi.mocked(global.fetch);
      fetchMock.mockResolvedValueOnce({ ok: true } as Response);

      const bothLogger = new UnifiedLogger({ logMode: LOG_MODES.BOTH });

      bothLogger.info('Both targets');

      await new Promise(resolve => setTimeout(resolve, 50));

      expect(consoleLogSpy).toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalled();
    });

    it('should not output anything in none mode', () => {
      vi.clearAllMocks();

      const noneLogger = new UnifiedLogger({ logMode: LOG_MODES.NONE });

      // Clear initialization logs
      consoleLogSpy.mockClear();

      noneLogger.info('Silent');
      noneLogger.error('Also silent');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle fetch errors gracefully', async () => {
      const routeLogger = new UnifiedLogger({
        logMode: LOG_MODES.ROUTE,
      });

      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      // Should not throw
      expect(() => routeLogger.info('Test')).not.toThrow();
    });
  });

  describe('Specialized Methods', () => {
    it('should log custom messages with emoji', () => {
      logger.startSession('custom-test', 'trace');
      logger.logCustom('🎉', 'Custom celebration', { score: 100 });

      const session = logger.getCurrentSession();
      const lastStep = session?.steps[session.steps.length - 1];

      expect((lastStep as TraceStep).message).toContain(
        '🎉 Custom celebration'
      );
    });

    it('should update session metadata', () => {
      logger.startSession('metadata-test', 'general', { initial: 'value' });

      logger.updateSessionMetadata({
        additional: 'info',
        count: 42,
      });

      const session = logger.getCurrentSession();
      expect(session?.metadata).toEqual({
        initial: 'value',
        additional: 'info',
        count: 42,
      });
    });

    it('should not update metadata without active session', () => {
      expect(() =>
        logger.updateSessionMetadata({ test: 'value' })
      ).not.toThrow();
    });

    it('should sanitize metadata updates', () => {
      logger.startSession('sanitize-test', 'general');

      logger.updateSessionMetadata({
        safe: 'data',
        password: 'should-be-removed',
      });

      const session = logger.getCurrentSession();
      expect(session?.metadata?.safe).toBe('data');
      expect(session?.metadata?.password).toBeUndefined();
    });
  });

  describe('Utility Methods', () => {
    it('should clear old sessions', () => {
      UnifiedLogger.resetInstance();
      const testLogger = UnifiedLogger.getInstance();

      // Create an old session by manipulating the start time
      testLogger.startSession('old-session', 'trace');
      const oldSession = testLogger.getCurrentSession();
      if (oldSession) {
        oldSession.startTime = new Date(
          Date.now() - 2 * 60 * 60 * 1000
        ).toISOString();
      }
      testLogger.endSession();

      // Create a recent session
      testLogger.startSession('new-session', 'trace');
      testLogger.endSession();

      testLogger.clearOldSessions();

      const sessions = testLogger.getAllSessions();
      expect(sessions.find(s => s.id === 'old-session')).toBeUndefined();
      expect(sessions.find(s => s.id === 'new-session')).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle circular references in context', () => {
      interface CircularRef {
        a: number;
        self?: CircularRef;
      }
      const circular: CircularRef = { a: 1 };
      circular.self = circular;

      // Should not throw
      expect(() => logger.info('Circular', circular)).not.toThrow();
    });

    it('should handle very long messages', () => {
      const longMessage = 'x'.repeat(10000);
      expect(() => logger.info(longMessage)).not.toThrow();
    });

    it('should handle concurrent session operations', () => {
      logger.startSession('session-1', 'trace');
      logger.startSession('session-2', 'execution'); // Should override

      const current = logger.getCurrentSession();
      expect(current?.id).toBe('session-2');
    });

    it('should handle adding logs to sessions', () => {
      logger.startSession('log-session', 'general');
      logger.info('Session log');

      const session = logger.getCurrentSession();
      expect(session?.steps).toHaveLength(2); // Session start + manual log
      expect((session?.steps[1] as LogEntry).message).toBe('Session log');
    });
  });
});
