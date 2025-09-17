import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimpleLogger, getLogger, log } from '../src/simple-logger';
import { LogLevel } from '../src/core/types';

describe('SimpleLogger', () => {
  let logger: SimpleLogger;
  let consoleSpy: any;

  beforeEach(() => {
    consoleSpy = {
      log: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn()
    };
    
    // Mock console
    Object.assign(console, consoleSpy);
    
    // Create a new logger instance
    logger = new SimpleLogger({
      level: LogLevel.DEBUG,
      enableConsole: true
    });
  });

  describe('Basic Logging', () => {
    it('should log debug messages', () => {
      logger.debug('Test debug message');
      expect(consoleSpy.debug).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      logger.warn('Test warn message');
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      logger.error('Test error message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });

    it('should log fatal messages', () => {
      logger.fatal('Test fatal message');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('Context and Metadata', () => {
    it('should include context in logs', () => {
      logger.info('Test message', { userId: '123' });
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should include metadata in logs', () => {
      logger.info('Test message', { userId: '123' }, { action: 'test' });
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('should include error details', () => {
      const error = new Error('Test error');
      logger.error('Test message', error);
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('Log Level Filtering', () => {
    it('should not log debug messages when level is INFO', () => {
      const infoLogger = new SimpleLogger({
        level: LogLevel.INFO,
        enableConsole: true
      });
      
      infoLogger.debug('This should not appear');
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should log info messages when level is INFO', () => {
      const infoLogger = new SimpleLogger({
        level: LogLevel.INFO,
        enableConsole: true
      });
      
      infoLogger.info('This should appear');
      expect(consoleSpy.info).toHaveBeenCalled();
    });
  });

  describe('Convenience Functions', () => {
    it('should work with convenience log functions', () => {
      log.debug('Convenience debug');
      log.info('Convenience info');
      log.warn('Convenience warn');
      log.error('Convenience error');
      
      expect(consoleSpy.debug).toHaveBeenCalled();
      expect(consoleSpy.info).toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('getLogger', () => {
    it('should return the same logger instance', () => {
      const logger1 = getLogger();
      const logger2 = getLogger();
      expect(logger1).toBe(logger2);
    });

    it('should update config when provided', () => {
      const logger = getLogger({ level: LogLevel.WARN });
      expect(logger).toBeDefined();
    });
  });

  describe('Configuration', () => {
    it('should update configuration', () => {
      logger.updateConfig({ level: LogLevel.ERROR });
      
      logger.warn('This should not appear');
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      
      logger.error('This should appear');
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });
});
