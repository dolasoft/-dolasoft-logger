import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FileAdapter } from '../../adapters/file';
import { LogLevel, LogEntry } from '../../core/types';
import * as fs from 'fs';
import * as path from 'path';

describe('FileAdapter - Real File System Tests', () => {
  let fileAdapter: FileAdapter;
  const testLogDir = './test-logs';
  const testLogFile = path.join(testLogDir, 'test.log');

  beforeEach(() => {
    fileAdapter = new FileAdapter();
    
    // Clean up any existing test files
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up test files after each test
    if (fs.existsSync(testLogDir)) {
      fs.rmSync(testLogDir, { recursive: true, force: true });
    }
  });

  describe('Basic File Operations', () => {
    it('should create directory and log file when enabled', async () => {
      fileAdapter.configure({
        enableFile: true,
        filePath: testLogFile,
        logLevels: [LogLevel.INFO, LogLevel.ERROR]
      });

      const entry: LogEntry = {
        id: 'test-1',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message',
        source: 'test'
      };

      await fileAdapter.log(entry);

      // Check if directory was created
      expect(fs.existsSync(testLogDir)).toBe(true);
      
      // Check if log file was created
      expect(fs.existsSync(testLogFile)).toBe(true);
      
      // Check if content was written
      const content = fs.readFileSync(testLogFile, 'utf8');
      expect(content).toContain('Test message');
    });

    it('should not create files when disabled', async () => {
      // Configure with file logging disabled
      fileAdapter.configure({
        enableFile: false,
        filePath: testLogFile
      });

      const entry: LogEntry = {
        id: 'test-1',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message',
        source: 'test'
      };

      await fileAdapter.log(entry);

      // Check that no files were created (directory might exist from configure, but no log content)
      if (fs.existsSync(testLogFile)) {
        const content = fs.readFileSync(testLogFile, 'utf8');
        expect(content).toBe('');
      }
    });

    it('should filter logs by level', async () => {
      fileAdapter.configure({
        enableFile: true,
        filePath: testLogFile,
        logLevels: [LogLevel.ERROR] // Only allow ERROR level
      });

      const infoEntry: LogEntry = {
        id: 'test-1',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Info message',
        source: 'test'
      };

      const errorEntry: LogEntry = {
        id: 'test-2',
        timestamp: new Date(),
        level: LogLevel.ERROR,
        message: 'Error message',
        source: 'test'
      };

      await fileAdapter.log(infoEntry);
      await fileAdapter.log(errorEntry);

      // Check if log file was created
      expect(fs.existsSync(testLogFile)).toBe(true);
      
      // Check content - should only contain error message
      const content = fs.readFileSync(testLogFile, 'utf8');
      expect(content).not.toContain('Info message');
      expect(content).toContain('Error message');
    });
  });

  describe('File Modes', () => {
    it('should handle overwrite mode', async () => {
      fileAdapter.configure({
        enableFile: true,
        filePath: testLogFile,
        overwrite: true,
        logLevels: [LogLevel.INFO]
      });

      const entry1: LogEntry = {
        id: 'test-1',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'First message',
        source: 'test'
      };

      const entry2: LogEntry = {
        id: 'test-2',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Second message',
        source: 'test'
      };

      await fileAdapter.log(entry1);
      await fileAdapter.log(entry2);

      // Check if log file was created
      expect(fs.existsSync(testLogFile)).toBe(true);
      
      // Check content - should contain both messages
      const content = fs.readFileSync(testLogFile, 'utf8');
      expect(content).toContain('First message');
      expect(content).toContain('Second message');
    });

    it('should handle append mode', async () => {
      fileAdapter.configure({
        enableFile: true,
        filePath: testLogFile,
        append: true,
        logLevels: [LogLevel.INFO]
      });

      const entry1: LogEntry = {
        id: 'test-1',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'First message',
        source: 'test'
      };

      const entry2: LogEntry = {
        id: 'test-2',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Second message',
        source: 'test'
      };

      await fileAdapter.log(entry1);
      await fileAdapter.log(entry2);

      // Check if log file was created
      expect(fs.existsSync(testLogFile)).toBe(true);
      
      // Check content - should contain both messages
      const content = fs.readFileSync(testLogFile, 'utf8');
      expect(content).toContain('First message');
      expect(content).toContain('Second message');
    });
  });

  describe('File Formats', () => {
    it('should format as JSON', async () => {
      fileAdapter.configure({
        enableFile: true,
        filePath: testLogFile,
        format: 'json',
        logLevels: [LogLevel.INFO]
      });

      const entry: LogEntry = {
        id: 'test-1',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message',
        source: 'test'
      };

      await fileAdapter.log(entry);

      const content = fs.readFileSync(testLogFile, 'utf8');
      expect(content).toMatch(/^{.*"message":"Test message".*}\n?$/);
    });

    it('should format as text', async () => {
      fileAdapter.configure({
        enableFile: true,
        filePath: testLogFile,
        format: 'text',
        logLevels: [LogLevel.INFO]
      });

      const entry: LogEntry = {
        id: 'test-1',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message',
        source: 'test'
      };

      await fileAdapter.log(entry);

      const content = fs.readFileSync(testLogFile, 'utf8');
      expect(content).toMatch(/^\[.*\] INFO Test message\n?$/);
    });

    it('should format as pretty JSON', async () => {
      fileAdapter.configure({
        enableFile: true,
        filePath: testLogFile,
        format: 'pretty',
        logLevels: [LogLevel.INFO]
      });

      const entry: LogEntry = {
        id: 'test-1',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message',
        source: 'test'
      };

      await fileAdapter.log(entry);

      const content = fs.readFileSync(testLogFile, 'utf8');
      expect(content).toMatch(/^{\s*"timestamp"/);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid file paths gracefully', async () => {
      // This test should expect the error to be thrown during configure
      expect(() => {
        fileAdapter.configure({
          enableFile: true,
          filePath: '/invalid/path/that/does/not/exist/test.log',
          logLevels: [LogLevel.INFO]
        });
      }).toThrow();
    });

    it('should handle malformed log entries gracefully', async () => {
      fileAdapter.configure({
        enableFile: true,
        filePath: testLogFile,
        logLevels: [LogLevel.INFO]
      });

      const malformedEntry = {
        id: 'test-1',
        timestamp: new Date(),
        level: LogLevel.INFO,
        message: 'Test message'
        // Missing required fields
      } as LogEntry;

      // Should not throw an error
      await expect(fileAdapter.log(malformedEntry)).resolves.not.toThrow();
    });
  });
});