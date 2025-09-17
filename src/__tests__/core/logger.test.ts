import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LoggerService } from '../../core/logger';
import { LogLevel, LogStrategy } from '../../core/types';
import { resetAllSingletons } from '../../utils/singleton-manager';

describe('LoggerService', () => {
  beforeEach(() => {
    resetAllSingletons();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const logger1 = LoggerService.getInstance();
      const logger2 = LoggerService.getInstance();
      expect(logger1).toBe(logger2);
    });

    it('should create new instances with create()', () => {
      const logger1 = LoggerService.create();
      const logger2 = LoggerService.create();
      expect(logger1).not.toBe(logger2);
    });

    it('should reset singleton with reset()', () => {
      const logger1 = LoggerService.getInstance();
      LoggerService.reset();
      const logger2 = LoggerService.getInstance();
      expect(logger1).not.toBe(logger2);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', () => {
      const logger = LoggerService.create();
      const stats = logger.getStats();
      expect(stats.maxMemory).toBe(1000);
      expect(stats.maxDatabase).toBe(10000);
    });

    it('should accept custom configuration', () => {
      const logger = LoggerService.create({
        strategy: LogStrategy.CONSOLE,
        level: LogLevel.INFO,
        maxMemoryEntries: 500
      });
      const stats = logger.getStats();
      expect(stats.maxMemory).toBe(500);
    });

    it('should validate configuration', () => {
      expect(() => {
        LoggerService.create({
          maxMemoryEntries: -1
        });
      }).toThrow('Invalid logger configuration');
    });
  });

  describe('Logging Methods', () => {
    let logger: LoggerService;

    beforeEach(() => {
      logger = LoggerService.create({
        strategy: LogStrategy.CONSOLE,
        level: LogLevel.DEBUG,
        enableConsole: true
      });
    });

    it('should log debug messages', () => {
      logger.debug('Debug message');
      expect(console.debug).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Info message');
      expect(console.info).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Warning message');
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const error = new Error('Test error');
      logger.error('Error message', error);
      expect(console.error).toHaveBeenCalled();
    });

    it('should log fatal messages', () => {
      const error = new Error('Fatal error');
      logger.fatal('Fatal message', error);
      expect(console.error).toHaveBeenCalled();
    });

    it('should include context in logs', () => {
      logger.info('Message with context', { userId: '123' });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('userId')
      );
    });

    it('should include metadata in logs', () => {
      logger.info('Message with metadata', undefined, { sessionId: '456' });
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('sessionId')
      );
    });
  });

  describe('Log Level Filtering', () => {
    it('should not log below configured level', () => {
      const logger = LoggerService.create({
        strategy: LogStrategy.CONSOLE,
        level: LogLevel.WARN,
        enableConsole: true
      });

      // Clear any previous calls
      vi.clearAllMocks();

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');

      expect(console.debug).not.toHaveBeenCalled();
      expect(console.info).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('Memory Management', () => {
    it('should limit memory entries', async () => {
      const logger = LoggerService.create({
        strategy: LogStrategy.MEMORY,
        level: LogLevel.DEBUG,
        maxMemoryEntries: 3
      });

      // Log more than the limit
      for (let i = 0; i < 5; i++) {
        logger.info(`Message ${i}`);
      }

      const logs = await logger.getLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('Message 2'); // First 2 should be removed
    });

    it('should get error logs only', async () => {
      const logger = LoggerService.create({
        strategy: LogStrategy.MEMORY,
        level: LogLevel.DEBUG
      });

      logger.info('Info message');
      logger.error('Error message');
      logger.warn('Warning message');
      logger.fatal('Fatal message');

      const errorLogs = await logger.getErrorLogs();
      expect(errorLogs).toHaveLength(2);
      expect(errorLogs.every(log => log.level >= LogLevel.ERROR)).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should provide log statistics', async () => {
      const logger = LoggerService.create({
        strategy: LogStrategy.MEMORY,
        level: LogLevel.DEBUG
      });

      logger.info('Info message');
      logger.error('Error message');
      logger.warn('Warning message');

      const stats = logger.getStats();
      expect(stats.memory).toBe(3);
      expect(stats.errors).toBe(1);
    });
  });

  describe('Configuration Updates', () => {
    it('should update configuration', () => {
      const logger = LoggerService.create({
        strategy: LogStrategy.CONSOLE,
        level: LogLevel.INFO
      });

      logger.updateConfig({
        level: LogLevel.DEBUG
      });

      // Should now log debug messages
      logger.debug('Debug message');
      expect(console.debug).toHaveBeenCalled();
    });
  });
});
