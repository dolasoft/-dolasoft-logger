import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConsoleAdapter } from '../../src/adapters/console';
import { LogLevel, LogEntry } from '../../src/core/types';

// Mock console methods
interface ConsoleSpy {
  log: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
}

describe('ConsoleAdapter', () => {
  let adapter: ConsoleAdapter;
  let consoleSpy: ConsoleSpy;

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
    
    adapter = new ConsoleAdapter();
  });

  describe('Configuration', () => {
    it('should configure with default settings', () => {
      const config = {
        level: LogLevel.INFO,
        enableConsole: true,
        forceConsole: false
      };
      
      adapter.configure(config);
      
      expect(adapter).toBeDefined();
    });

    it('should configure with forceConsole enabled', () => {
      const config = {
        level: LogLevel.INFO,
        enableConsole: true,
        forceConsole: true
      };
      
      adapter.configure(config);
      
      expect(adapter).toBeDefined();
    });
  });

  describe('Environment Detection', () => {
    it('should detect development environment in Node.js', () => {
      // Mock Node.js environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      // @ts-ignore - accessing private method for testing
      const isDev = adapter.isDevelopment();
      
      expect(isDev).toBe(true);
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should detect production environment in Node.js', () => {
      // Mock Node.js environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      // @ts-ignore - accessing private method for testing
      const isDev = adapter.isDevelopment();
      
      expect(isDev).toBe(false);
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should detect development environment in browser', () => {
      // Mock browser environment
      const originalWindow = global.window;
      const originalProcess = global.process;
      
      // Remove process to simulate browser environment
      delete (global as Record<string, unknown>).process;
      global.window = {
        location: { hostname: 'localhost' }
      } as unknown as Window;
      
      // Create a new adapter instance to test the environment detection
      const testAdapter = new ConsoleAdapter();
      
      // @ts-ignore - accessing private method for testing
      const isDev = testAdapter.isDevelopment();
      
      expect(isDev).toBe(true);
      
      // Restore
      global.window = originalWindow;
      global.process = originalProcess;
    });

    it('should detect production environment in browser', () => {
      // Mock browser environment
      const originalWindow = global.window;
      const originalProcess = global.process;
      
      // Remove process to simulate browser environment
      delete (global as Record<string, unknown>).process;
      global.window = {
        location: { hostname: 'myapp.com' }
      } as unknown as Window;
      
      // Create a new adapter instance to test the environment detection
      const testAdapter = new ConsoleAdapter();
      
      // @ts-ignore - accessing private method for testing
      const isDev = testAdapter.isDevelopment();
      
      expect(isDev).toBe(false);
      
      // Restore
      global.window = originalWindow;
      global.process = originalProcess;
    });
  });

  describe('Logging Behavior', () => {
    it('should log in development environment', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      adapter.configure({
        level: LogLevel.INFO,
        enableConsole: true,
        forceConsole: false
      });
      
      const logEntry: LogEntry = {
        id: 'test-id',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message',
        context: { userId: '123' },
        metadata: {},
        source: 'test'
      };
      
      adapter.log(logEntry);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should not log in production environment by default', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      adapter.configure({
        level: LogLevel.INFO,
        enableConsole: true,
        forceConsole: false
      });
      
      const logEntry: LogEntry = {
        id: 'test-id',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message',
        context: { userId: '123' },
        metadata: {},
        source: 'test'
      };
      
      adapter.log(logEntry);
      
      expect(consoleSpy.info).not.toHaveBeenCalled();
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should log in production when forceConsole is enabled', () => {
      // Mock production environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      
      adapter.configure({
        level: LogLevel.INFO,
        enableConsole: true,
        forceConsole: true
      });
      
      const logEntry: LogEntry = {
        id: 'test-id',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message',
        context: { userId: '123' },
        metadata: {},
        source: 'test'
      };
      
      adapter.log(logEntry);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should log different levels to appropriate console methods', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      adapter.configure({
        level: LogLevel.DEBUG,
        enableConsole: true,
        forceConsole: false
      });
      
      const debugEntry: LogEntry = {
        id: 'test-id-1',
        timestamp: new Date(),
        level: LogLevel.DEBUG,
        message: 'Debug message',
        context: {},
        metadata: {},
        source: 'test'
      };
      
      const infoEntry: LogEntry = {
        id: 'test-id-2',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Info message',
        context: {},
        metadata: {},
        source: 'test'
      };
      
      const warnEntry: LogEntry = {
        id: 'test-id-3',
        timestamp: new Date(),
        level: LogLevel.WARN,
        message: 'Warn message',
        context: {},
        metadata: {},
        source: 'test'
      };
      
      const errorEntry: LogEntry = {
        id: 'test-id-4',
        timestamp: new Date(),
        level: LogLevel.ERROR,
        message: 'Error message',
        context: {},
        metadata: {},
        source: 'test'
      };
      
      const fatalEntry: LogEntry = {
        id: 'test-id-5',
        timestamp: new Date(),
        level: LogLevel.FATAL,
        message: 'Fatal message',
        context: {},
        metadata: {},
        source: 'test'
      };
      
      adapter.log(debugEntry);
      adapter.log(infoEntry);
      adapter.log(warnEntry);
      adapter.log(errorEntry);
      adapter.log(fatalEntry);
      
      expect(consoleSpy.debug).toHaveBeenCalledWith(
        expect.stringContaining('Debug message')
      );
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('Info message')
      );
      expect(consoleSpy.warn).toHaveBeenCalledWith(
        expect.stringContaining('Warn message')
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Error message')
      );
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Fatal message')
      );
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should include context and metadata in logs', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      adapter.configure({
        level: LogLevel.INFO,
        enableConsole: true,
        forceConsole: false
      });
      
      const logEntry: LogEntry = {
        id: 'test-id',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message',
        context: { userId: '123', action: 'test' },
        metadata: { timestamp: Date.now() },
        source: 'test'
      };
      
      adapter.log(logEntry);
      
      expect(consoleSpy.info).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should handle errors in logs', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      
      adapter.configure({
        level: LogLevel.ERROR,
        enableConsole: true,
        forceConsole: false
      });
      
      const logEntry: LogEntry = {
        id: 'test-id',
        timestamp: new Date(),
        level: LogLevel.ERROR,
        message: 'Error occurred',
        context: {},
        metadata: {},
        source: 'test',
        error: {
          name: 'Error',
          message: 'Test error',
          stack: 'Error: Test error\n    at test.js:1:1'
        }
      };
      
      adapter.log(logEntry);
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred')
      );
      
      // Restore
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Error Handling', () => {
    it('should handle missing console methods gracefully', () => {
      // Mock missing console methods
      const originalConsole = console;
      // @ts-ignore - intentionally modifying console for test
      Object.assign(console, {
        log: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn()
      });

      adapter.configure({
        level: LogLevel.INFO,
        enableConsole: true,
        forceConsole: true
      });
      
      const logEntry: LogEntry = {
        id: 'test-id',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message',
        context: {},
        metadata: {},
        source: 'test'
      };
      
      // Should not throw
      expect(() => {
        adapter.log(logEntry);
      }).not.toThrow();
      
      // Restore
      Object.assign(console, originalConsole);
    });
  });
});