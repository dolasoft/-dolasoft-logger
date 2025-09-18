import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FileAdapter } from '../../src/adapters/file';
import { LogLevel, LogEntry } from '../../src/core/types';

// Mock fs module
const mockFs = {
  mkdir: vi.fn(),
  appendFile: vi.fn(),
  stat: vi.fn(),
  rename: vi.fn(),
  unlink: vi.fn()
};

vi.mock('fs', () => ({
  promises: mockFs
}));

// Mock path module
vi.mock('path', () => ({
  dirname: vi.fn((path) => path.split('/').slice(0, -1).join('/') || '.'),
  basename: vi.fn((path, ext) => {
    const name = path.split('/').pop() || '';
    return ext ? name.replace(ext, '') : name;
  }),
  extname: vi.fn((path) => {
    const name = path.split('/').pop() || '';
    const lastDot = name.lastIndexOf('.');
    return lastDot > 0 ? name.substring(lastDot) : '';
  })
}));

describe('FileAdapter', () => {
  let fileAdapter: FileAdapter;
  let mockLogEntry: LogEntry;

  beforeEach(() => {
    fileAdapter = new FileAdapter();
    mockLogEntry = {
      id: 'test-id',
      timestamp: new Date('2023-01-01T00:00:00Z'),
      level: LogLevel.INFO,
      message: 'Test message',
      source: 'test',
      context: { userId: '123' },
      metadata: { action: 'test' }
    };

    // Reset all mocks
    vi.clearAllMocks();
    
    // Mock successful operations by default
    mockFs.mkdir.mockResolvedValue(undefined);
    mockFs.appendFile.mockResolvedValue(undefined);
    mockFs.stat.mockResolvedValue({ size: 1000 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Configuration', () => {
    it('should configure with default values', () => {
      fileAdapter.configure({ enableFile: true });
      expect(fileAdapter.name).toBe('file');
    });

    it('should configure with custom values', () => {
      fileAdapter.configure({
        enableFile: true,
        filePath: '/custom/path/app.log',
        maxFileSize: 5 * 1024 * 1024,
        maxFiles: 3
      });
      expect(fileAdapter.name).toBe('file');
    });
  });

  describe('Environment Detection', () => {
    it('should detect Node.js environment', () => {
      // Mock Node.js environment
      const originalProcess = global.process;
      global.process = {
        versions: { node: '18.0.0' }
      } as unknown as NodeJS.Process;
      delete (global as Record<string, unknown>).window;

      const adapter = new FileAdapter();
      expect(adapter.name).toBe('file');

      global.process = originalProcess;
    });

    it('should detect browser environment', () => {
      // Mock browser environment
      delete (global as Record<string, unknown>).process;
      global.window = {} as Window;

      const adapter = new FileAdapter();
      expect(adapter.name).toBe('file');

      delete (global as Record<string, unknown>).window;
    });
  });

  describe('Logging', () => {
    it('should not log when enableFile is false', async () => {
      fileAdapter.configure({ enableFile: false });
      
      await fileAdapter.log(mockLogEntry);
      
      expect(mockFs.appendFile).not.toHaveBeenCalled();
    });

    it('should not log in browser environment', async () => {
      // Mock browser environment
      delete (global as Record<string, unknown>).process;
      global.window = {} as Window;

      fileAdapter.configure({ enableFile: true });
      
      await fileAdapter.log(mockLogEntry);
      
      expect(mockFs.appendFile).not.toHaveBeenCalled();

      delete (global as Record<string, unknown>).window;
    });

    it('should log in Node.js environment', async () => {
      // Create a new adapter instance to ensure environment detection runs
      const originalProcess = global.process;
      global.process = {
        versions: { node: '18.0.0' }
      } as unknown as NodeJS.Process;
      delete (global as Record<string, unknown>).window;

      const nodeAdapter = new FileAdapter();
      nodeAdapter.configure({ enableFile: true, filePath: './test.log' });
      
      await nodeAdapter.log(mockLogEntry);
      
      expect(mockFs.mkdir).toHaveBeenCalledWith('.', { recursive: true });
      expect(mockFs.appendFile).toHaveBeenCalledWith('./test.log', expect.stringContaining('Test message'));

      global.process = originalProcess;
    });

    it('should handle file write errors gracefully', async () => {
      // Mock Node.js environment
      const originalProcess = global.process;
      global.process = {
        versions: { node: '18.0.0' }
      } as unknown as NodeJS.Process;
      delete (global as Record<string, unknown>).window;

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFs.appendFile.mockRejectedValue(new Error('Write failed'));
      
      const nodeAdapter = new FileAdapter();
      nodeAdapter.configure({ enableFile: true });
      
      await nodeAdapter.log(mockLogEntry);
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to write to log file:', expect.any(Error));
      
      consoleSpy.mockRestore();
      global.process = originalProcess;
    });
  });

  describe('File Rotation', () => {
    beforeEach(() => {
      // Mock Node.js environment
      const originalProcess = global.process;
      global.process = {
        versions: { node: '18.0.0' }
      } as unknown as NodeJS.Process;
      delete (global as Record<string, unknown>).window;
    });

    it('should rotate files when size limit is reached', async () => {
      // Mock Node.js environment
      const originalProcess = global.process;
      global.process = {
        versions: { node: '18.0.0' }
      } as unknown as NodeJS.Process;
      delete (global as Record<string, unknown>).window;

      mockFs.stat.mockResolvedValue({ size: 11 * 1024 * 1024 }); // 11MB
      
      const nodeAdapter = new FileAdapter();
      nodeAdapter.configure({
        enableFile: true,
        filePath: './test.log',
        maxFileSize: 10 * 1024 * 1024,
        maxFiles: 3
      });
      
      await nodeAdapter.log(mockLogEntry);
      
      expect(mockFs.rename).toHaveBeenCalled();

      global.process = originalProcess;
    });

    it('should not rotate files when size limit is not reached', async () => {
      // Mock Node.js environment
      const originalProcess = global.process;
      global.process = {
        versions: { node: '18.0.0' }
      } as unknown as NodeJS.Process;
      delete (global as Record<string, unknown>).window;

      mockFs.stat.mockResolvedValue({ size: 5 * 1024 * 1024 }); // 5MB
      
      const nodeAdapter = new FileAdapter();
      nodeAdapter.configure({
        enableFile: true,
        filePath: './test.log',
        maxFileSize: 10 * 1024 * 1024,
        maxFiles: 3
      });
      
      await nodeAdapter.log(mockLogEntry);
      
      expect(mockFs.rename).not.toHaveBeenCalled();

      global.process = originalProcess;
    });
  });

  describe('Log Formatting', () => {
    it('should format log entry as JSON', async () => {
      // Mock Node.js environment
      const originalProcess = global.process;
      global.process = {
        versions: { node: '18.0.0' }
      } as unknown as NodeJS.Process;
      delete (global as Record<string, unknown>).window;

      fileAdapter.configure({ enableFile: true, filePath: './test.log' });
      
      await fileAdapter.log(mockLogEntry);
      
      const appendCall = mockFs.appendFile.mock.calls[0];
      const logLine = appendCall[1].replace(/\n$/, ''); // Remove trailing newline
      const parsedLog = JSON.parse(logLine);
      
      expect(parsedLog).toMatchObject({
        timestamp: '2023-01-01T00:00:00.000Z',
        level: 'INFO',
        message: 'Test message',
        source: 'test',
        context: { userId: '123' },
        metadata: { action: 'test' }
      });

      global.process = originalProcess;
    });
  });
});
