import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { UnifiedLogger, LOG_MODES } from '../index';

// These tests are separate because they need to test different logger configurations
// In real apps, you configure the logger once at startup

describe('Logger Mode Tests', () => {
  beforeAll(() => {
    // Clear any existing instance
    UnifiedLogger.resetInstance();
  });

  afterAll(() => {
    // Clean up
    UnifiedLogger.resetInstance();
  });

  describe('Route Mode', () => {
    it('should only send to route in route mode', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = fetchMock;

      const routeLogger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.ROUTE,
        routeUrl: 'https://api.test.com/logs',
      });

      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);

      routeLogger.info('Route only message');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[INFO]')
      );
      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.test.com/logs',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );

      consoleLogSpy.mockRestore();
      UnifiedLogger.resetInstance();
    });
  });

  describe('Both Mode', () => {
    it('should log to both console and route in both mode', async () => {
      const fetchMock = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = fetchMock;

      const bothLogger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.BOTH,
        routeUrl: 'https://api.test.com/logs',
      });

      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);

      bothLogger.info('Both targets message');

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[INFO] Both targets message',
        undefined,
        undefined
      );
      expect(fetchMock).toHaveBeenCalled();

      consoleLogSpy.mockRestore();
      UnifiedLogger.resetInstance();
    });
  });

  describe('None Mode', () => {
    it('should not output anything in none mode', () => {
      // Reset to ensure we get a fresh instance with none mode
      UnifiedLogger.resetInstance();

      const noneLogger = UnifiedLogger.getInstance({
        logMode: LOG_MODES.NONE,
      });

      const consoleLogSpy = vi
        .spyOn(console, 'log')
        .mockImplementation(() => undefined);
      const fetchMock = vi.fn();
      global.fetch = fetchMock;

      noneLogger.info('Should not appear');

      expect(consoleLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[INFO]')
      );
      expect(fetchMock).not.toHaveBeenCalled();

      consoleLogSpy.mockRestore();
      UnifiedLogger.resetInstance();
    });
  });
});
