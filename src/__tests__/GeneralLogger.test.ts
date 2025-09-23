import { describe, it, expect, beforeEach, vi, afterEach, Mock } from 'vitest';
import { GeneralLogger } from '../loggers/GeneralLogger';
import { SessionManager } from '../managers/SessionManager';
import { LOG_MODES } from '../types';
import * as consoleTransport from '../transports/console';
import * as routeTransport from '../transports/route';

// Mock the transport modules
vi.mock('../transports/console');
vi.mock('../transports/route');

describe('GeneralLogger', () => {
  let generalLogger: GeneralLogger;
  let sessionManager: SessionManager;
  let sanitizeData: Mock;

  beforeEach(() => {
    sessionManager = new SessionManager(100);
    sanitizeData = vi.fn(
      (data: unknown) => data as Record<string, unknown> | undefined
    );

    // Mock console methods
    vi.spyOn(console, 'log').mockImplementation(() => {
      // Empty implementation for testing
    });
    vi.spyOn(console, 'debug').mockImplementation(() => {
      // Empty implementation for testing
    });
    vi.spyOn(console, 'warn').mockImplementation(() => {
      // Empty implementation for testing
    });
    vi.spyOn(console, 'error').mockImplementation(() => {
      // Empty implementation for testing
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Constructor', () => {
    it('should initialize with provided configuration', () => {
      generalLogger = new GeneralLogger(
        1000,
        LOG_MODES.CONSOLE,
        'http://localhost:3000/api/logs',
        sessionManager,
        sanitizeData
      );

      expect(generalLogger.maxLogs).toBe(1000);
      expect(generalLogger.logMode).toBe(LOG_MODES.CONSOLE);
      expect(generalLogger.routeUrl).toBe('http://localhost:3000/api/logs');
    });
  });

  describe('Logging Methods', () => {
    beforeEach(() => {
      generalLogger = new GeneralLogger(
        1000,
        LOG_MODES.CONSOLE,
        'http://localhost:3000/api/logs',
        sessionManager,
        sanitizeData
      );
    });

    it('should log debug messages', () => {
      generalLogger.debug('Debug message', { data: 'test' }, { meta: 'data' });

      expect(consoleTransport.writeToConsole).toHaveBeenCalledWith(
        'debug',
        '[DEBUG] Debug message',
        { data: 'test' },
        { meta: 'data' }
      );
      expect(sanitizeData).toHaveBeenCalledWith({ data: 'test' });
      expect(sanitizeData).toHaveBeenCalledWith({ meta: 'data' });
    });

    it('should log info messages', () => {
      generalLogger.info('Info message', { data: 'test' });

      expect(consoleTransport.writeToConsole).toHaveBeenCalledWith(
        'info',
        '[INFO] Info message',
        { data: 'test' },
        undefined
      );
    });

    it('should log warn messages', () => {
      generalLogger.warn('Warning message', { data: 'test' });

      expect(consoleTransport.writeToConsole).toHaveBeenCalledWith(
        'warn',
        '[WARN] Warning message',
        { data: 'test' },
        undefined
      );
    });

    it('should log error messages with Error object', () => {
      const error = new Error('Test error');
      generalLogger.error('Error occurred', error, { context: 'test' });

      expect(consoleTransport.writeToConsole).toHaveBeenCalledWith(
        'error',
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
      generalLogger.error('Error occurred', 'String error', {
        context: 'test',
      });

      expect(consoleTransport.writeToConsole).toHaveBeenCalledWith(
        'error',
        '[ERROR] Error occurred',
        expect.objectContaining({
          context: 'test',
          error: 'String error',
        }),
        undefined
      );
    });

    it('should store logs in memory', () => {
      generalLogger.info('Log 1');
      generalLogger.debug('Log 2');
      generalLogger.warn('Log 3');

      const logs = generalLogger.getAllLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('Log 1');
      expect(logs[1].message).toBe('Log 2');
      expect(logs[2].message).toBe('Log 3');
    });

    it('should limit stored logs to maxLogs', () => {
      const limitedLogger = new GeneralLogger(
        3,
        LOG_MODES.CONSOLE,
        'http://localhost:3000/api/logs',
        sessionManager,
        sanitizeData
      );

      limitedLogger.info('Log 1');
      limitedLogger.info('Log 2');
      limitedLogger.info('Log 3');
      limitedLogger.info('Log 4');

      const logs = limitedLogger.getAllLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('Log 2');
      expect(logs[1].message).toBe('Log 3');
      expect(logs[2].message).toBe('Log 4');
    });

    it('should add logs to current session if active', () => {
      sessionManager.startSession('test-session', 'general');

      generalLogger.info('Session log');

      const session = sessionManager.getCurrentSession();
      expect(session?.steps).toHaveLength(1);
      expect(session?.steps[0]).toMatchObject({
        level: 'info',
        message: 'Session log',
      });
    });
  });

  describe('Log Modes', () => {
    it('should only log to console in console mode', async () => {
      generalLogger = new GeneralLogger(
        1000,
        LOG_MODES.CONSOLE,
        'http://localhost:3000/api/logs',
        sessionManager,
        sanitizeData
      );

      await generalLogger.info('Console only');

      expect(consoleTransport.writeToConsole).toHaveBeenCalled();
      expect(routeTransport.sendToRoute).not.toHaveBeenCalled();
    });

    it('should only send to route in route mode', async () => {
      generalLogger = new GeneralLogger(
        1000,
        LOG_MODES.ROUTE,
        'http://localhost:3000/api/logs',
        sessionManager,
        sanitizeData
      );

      await generalLogger.info('Route only');

      expect(consoleTransport.writeToConsole).not.toHaveBeenCalled();
      expect(routeTransport.sendToRoute).toHaveBeenCalledWith(
        'http://localhost:3000/api/logs',
        expect.objectContaining({
          level: 'info',
          message: 'Route only',
        })
      );
    });

    it('should log to both console and route in both mode', async () => {
      generalLogger = new GeneralLogger(
        1000,
        LOG_MODES.BOTH,
        'http://localhost:3000/api/logs',
        sessionManager,
        sanitizeData
      );

      await generalLogger.info('Both targets');

      expect(consoleTransport.writeToConsole).toHaveBeenCalled();
      expect(routeTransport.sendToRoute).toHaveBeenCalled();
    });

    it('should not output anything in none mode', async () => {
      generalLogger = new GeneralLogger(
        1000,
        LOG_MODES.NONE,
        'http://localhost:3000/api/logs',
        sessionManager,
        sanitizeData
      );

      await generalLogger.info('Silent');

      expect(consoleTransport.writeToConsole).not.toHaveBeenCalled();
      expect(routeTransport.sendToRoute).not.toHaveBeenCalled();

      // But should still store in memory
      const logs = generalLogger.getAllLogs();
      expect(logs).toHaveLength(1);
    });
  });

  describe('Data Sanitization', () => {
    it('should sanitize all data before logging', () => {
      const mockSanitize = vi.fn((data: unknown) => ({
        ...(data as Record<string, unknown>),
        sanitized: true,
      }));

      generalLogger = new GeneralLogger(
        1000,
        LOG_MODES.CONSOLE,
        'http://localhost:3000/api/logs',
        sessionManager,
        mockSanitize as (data?: unknown) => Record<string, unknown> | undefined
      );

      generalLogger.info('Test', { sensitive: 'data' }, { meta: 'info' });

      expect(mockSanitize).toHaveBeenCalledWith({ sensitive: 'data' });
      expect(mockSanitize).toHaveBeenCalledWith({ meta: 'info' });

      const logs = generalLogger.getAllLogs();
      expect(logs[0].context).toEqual({ sensitive: 'data', sanitized: true });
      expect(logs[0].metadata).toEqual({ meta: 'info', sanitized: true });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      generalLogger = new GeneralLogger(
        1000,
        LOG_MODES.CONSOLE,
        'http://localhost:3000/api/logs',
        sessionManager,
        sanitizeData
      );
    });

    it('should handle undefined context and metadata', () => {
      generalLogger.info('Test message');

      expect(consoleTransport.writeToConsole).toHaveBeenCalledWith(
        'info',
        '[INFO] Test message',
        undefined,
        undefined
      );
    });

    it('should handle null error objects', () => {
      generalLogger.error('Error', null);

      expect(consoleTransport.writeToConsole).toHaveBeenCalledWith(
        'error',
        '[ERROR] Error',
        expect.objectContaining({
          error: 'null',
        }),
        undefined
      );
    });

    it('should handle circular references in context', () => {
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;

      // sanitizeData should handle this
      generalLogger.info('Circular test', circular);

      // Should not throw
      expect(consoleTransport.writeToConsole).toHaveBeenCalled();
    });
  });
});
