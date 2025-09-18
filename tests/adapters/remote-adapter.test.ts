import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RemoteAdapter } from '../../src/adapters/remote';
import { LogLevel, LogEntry } from '../../src/core/types';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock AbortController
const mockAbortController = {
  signal: {},
  abort: vi.fn()
};
global.AbortController = vi.fn(() => mockAbortController) as unknown as typeof AbortController;

// Mock setTimeout
const mockSetTimeout = vi.fn();
global.setTimeout = mockSetTimeout as unknown as typeof setTimeout;

describe('RemoteAdapter', () => {
  let remoteAdapter: RemoteAdapter;
  let mockLogEntry: LogEntry;

  beforeEach(() => {
    remoteAdapter = new RemoteAdapter();
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
    
    // Mock successful fetch by default
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Configuration', () => {
    it('should configure with default values', () => {
      remoteAdapter.configure({ enableRemote: true });
      expect(remoteAdapter.name).toBe('remote');
    });

    it('should configure with remote config', () => {
      const config = {
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs',
          apiKey: 'test-key',
          headers: { 'X-Custom': 'value' },
          timeout: 5000
        }
      };
      
      remoteAdapter.configure(config);
      expect(remoteAdapter.name).toBe('remote');
    });
  });

  describe('Logging', () => {
    it('should not log when enableRemote is false', async () => {
      remoteAdapter.configure({ enableRemote: false });
      
      await remoteAdapter.log(mockLogEntry);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not log when remoteConfig is missing', async () => {
      remoteAdapter.configure({ enableRemote: true });
      
      await remoteAdapter.log(mockLogEntry);
      
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should not log when fetch is not available', async () => {
      const originalFetch = global.fetch;
      delete (global as Record<string, unknown>).fetch;

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      remoteAdapter.configure({
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs'
        }
      });
      
      await remoteAdapter.log(mockLogEntry);
      
      expect(consoleSpy).toHaveBeenCalledWith('RemoteAdapter: fetch is not available in this environment');
      
      consoleSpy.mockRestore();
      global.fetch = originalFetch;
    });

    it('should log successfully with valid config', async () => {
      remoteAdapter.configure({
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs',
          apiKey: 'test-key',
          timeout: 5000
        }
      });
      
      await remoteAdapter.log(mockLogEntry);
      
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/logs',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-key'
          }),
          body: expect.stringContaining('Test message'),
          signal: mockAbortController.signal
        })
      );
    });

    it('should handle fetch errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      remoteAdapter.configure({
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs'
        }
      });
      
      await remoteAdapter.log(mockLogEntry);
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to send log to remote service:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    it('should handle non-ok responses', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });
      
      remoteAdapter.configure({
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs'
        }
      });
      
      await remoteAdapter.log(mockLogEntry);
      
      expect(consoleSpy).toHaveBeenCalledWith('Remote logging failed: 500 Internal Server Error');
      
      consoleSpy.mockRestore();
    });

    it('should handle timeout errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const timeoutError = new Error('Timeout');
      timeoutError.name = 'AbortError';
      mockFetch.mockRejectedValue(timeoutError);
      
      remoteAdapter.configure({
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs',
          timeout: 1000
        }
      });
      
      await remoteAdapter.log(mockLogEntry);
      
      expect(consoleSpy).toHaveBeenCalledWith('Remote logging timeout');
      
      consoleSpy.mockRestore();
    });
  });

  describe('Log Formatting', () => {
    it('should format log entry correctly', async () => {
      remoteAdapter.configure({
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs'
        }
      });
      
      await remoteAdapter.log(mockLogEntry);
      
      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody).toMatchObject({
        timestamp: '2023-01-01T00:00:00.000Z',
        level: 'info',
        message: 'Test message',
        source: 'test',
        context: { userId: '123' },
        metadata: { action: 'test' },
        tags: {
          level: 'info',
          source: 'test'
        }
      });
    });

    it('should format error log entry correctly', async () => {
      const errorLogEntry = {
        ...mockLogEntry,
        level: LogLevel.ERROR,
        error: {
          name: 'TestError',
          message: 'Test error message',
          stack: 'Error: Test error message\n    at test (test.js:1:1)'
        }
      };

      remoteAdapter.configure({
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs'
        }
      });
      
      await remoteAdapter.log(errorLogEntry);
      
      const fetchCall = mockFetch.mock.calls[0];
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody).toMatchObject({
        level: 'error',
        error: {
          name: 'TestError',
          message: 'Test error message',
          stack: 'Error: Test error message\n    at test (test.js:1:1)'
        },
        tags: {
          level: 'error',
          source: 'test'
        }
      });
    });
  });

  describe('Headers and Authentication', () => {
    it('should include custom headers', async () => {
      remoteAdapter.configure({
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs',
          headers: {
            'X-Custom-Header': 'custom-value',
            'X-Another-Header': 'another-value'
          }
        }
      });
      
      await remoteAdapter.log(mockLogEntry);
      
      const fetchCall = mockFetch.mock.calls[0];
      const headers = fetchCall[1].headers;
      
      expect(headers).toMatchObject({
        'Content-Type': 'application/json',
        'X-Custom-Header': 'custom-value',
        'X-Another-Header': 'another-value'
      });
    });

    it('should include API key in Authorization header', async () => {
      remoteAdapter.configure({
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs',
          apiKey: 'test-api-key'
        }
      });
      
      await remoteAdapter.log(mockLogEntry);
      
      const fetchCall = mockFetch.mock.calls[0];
      const headers = fetchCall[1].headers;
      
      expect(headers).toMatchObject({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-api-key'
      });
    });

    it('should not include Authorization header when apiKey is not provided', async () => {
      remoteAdapter.configure({
        enableRemote: true,
        remoteConfig: {
          url: 'https://api.example.com/logs'
        }
      });
      
      await remoteAdapter.log(mockLogEntry);
      
      const fetchCall = mockFetch.mock.calls[0];
      const headers = fetchCall[1].headers;
      
      expect(headers).not.toHaveProperty('Authorization');
    });
  });
});
