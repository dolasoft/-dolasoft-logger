import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { UnifiedLogger, LOG_MODES } from '../index';

describe('Production Safety Features', () => {
  let originalEnv: NodeJS.ProcessEnv;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Reset singleton
    UnifiedLogger.resetInstance();

    // Reset mocks
    vi.clearAllMocks();

    // Spy on console methods
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
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.restoreAllMocks();
    UnifiedLogger.resetInstance();
  });

  describe('Production Detection', () => {
    it('should detect production via NODE_ENV', () => {
      process.env.NODE_ENV = 'production';

      const logger = UnifiedLogger.getInstance({ logMode: LOG_MODES.CONSOLE });
      logger.info('Test message');

      // Should not log to console in production (auto-switched to none)
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    // Removed UNIFIED_LOGGER_ENV support

    it('should not consider non-production environments as production', () => {
      process.env.NODE_ENV = 'development';

      const logger = UnifiedLogger.getInstance({ logMode: LOG_MODES.CONSOLE });
      logger.info('Test message');

      // Should log in development
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[INFO] Test message',
        undefined,
        undefined
      );
    });
  });

  describe('Automatic Console Silencing', () => {
    it('should override console mode to none in production', () => {
      process.env.NODE_ENV = 'production';

      const logger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.CONSOLE,
      });

      logger.info('Should not appear');
      logger.warn('Warning hidden');
      logger.error('Error hidden');

      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should override both mode to route-only in production', async () => {
      process.env.NODE_ENV = 'production';

      const logger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.BOTH,
        routeUrl: 'https://api.test.com/logs',
      });

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      logger.info('Route only in production');

      // Should not log to console
      expect(consoleLogSpy).not.toHaveBeenCalled();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // But should still send to route
      expect(fetch).toHaveBeenCalledWith(
        'https://api.test.com/logs',
        expect.any(Object)
      );
    });

    it('should respect environment variable override', () => {
      process.env.LOG_MODE = 'route';
      process.env.NODE_ENV = 'production';

      // Mock fetch for route mode
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      const logger = UnifiedLogger.getInstance();

      logger.info('Should not log to console');

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should allow route mode in production', async () => {
      process.env.NODE_ENV = 'production';

      const logger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.ROUTE,
        routeUrl: 'https://api.test.com/logs',
      });

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      logger.info('Should appear in route');

      // Should not log to console
      expect(consoleLogSpy).not.toHaveBeenCalled();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should send to route
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('Initialization Logging', () => {
    it('should not log initialization in production', () => {
      process.env.NODE_ENV = 'production';

      vi.clearAllMocks();
      UnifiedLogger.resetInstance();
      UnifiedLogger.getInstance({ logMode: LOG_MODES.CONSOLE });

      expect(consoleLogSpy).not.toHaveBeenCalled();
    });

    it('should log initialization in development', () => {
      process.env.NODE_ENV = 'development';

      vi.clearAllMocks();
      UnifiedLogger.resetInstance();
      UnifiedLogger.getInstance({ logMode: LOG_MODES.CONSOLE });

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('UnifiedLogger initialized')
      );
    });
  });

  describe('Edge Cases', () => {
    it('should handle all log levels in silent production mode', () => {
      process.env.NODE_ENV = 'production';

      const logger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.CONSOLE,
      });

      logger.debug('Debug hidden');
      logger.info('Info hidden');
      logger.warn('Warn hidden');
      logger.error('Error hidden', new Error('Test'));

      expect(consoleDebugSpy).not.toHaveBeenCalled();
      expect(consoleLogSpy).not.toHaveBeenCalled();
      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should still collect logs in memory even when silent', () => {
      process.env.NODE_ENV = 'production';

      const logger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.CONSOLE,
      });

      logger.info('Memory log 1');
      logger.warn('Memory log 2');

      const logs = logger.getAllLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0].message).toBe('Memory log 1');
      expect(logs[1].message).toBe('Memory log 2');
    });

    it('should handle session operations in silent mode', () => {
      process.env.NODE_ENV = 'production';

      const logger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.CONSOLE,
      });

      logger.startSession('silent-session', 'trace');
      logger.addTraceStep('info', 'Step 1');
      const session = logger.endSession();

      expect(session).toBeDefined();
      expect(session?.steps).toHaveLength(3); // start + step + end
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('Route-only Mode in Production', () => {
    it('should work with route mode in production', async () => {
      process.env.NODE_ENV = 'production';

      const logger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.ROUTE,
        routeUrl: 'https://api.prod.com/logs',
      });

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({ ok: true });

      logger.info('Production log', { environment: 'prod' });

      // Should not log to console
      expect(consoleLogSpy).not.toHaveBeenCalled();

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      // Should send to route
      expect(fetch).toHaveBeenCalledWith(
        'https://api.prod.com/logs',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Production log'),
        })
      );
    });
  });
});
