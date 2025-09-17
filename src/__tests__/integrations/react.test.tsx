import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLogger } from '../../integrations/react';
import { LoggerService, LogLevel } from '../../core/logger';

// Mock React
vi.mock('react', () => ({
  useCallback: vi.fn((fn) => fn),
  useEffect: vi.fn((fn) => fn()),
  useRef: vi.fn(() => ({ current: null })),
}));

describe('useLogger', () => {
  let mockLogger: {
    debug: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    fatal: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      fatal: vi.fn(),
    };

    vi.spyOn(LoggerService, 'getInstance').mockReturnValue(mockLogger);
  });

  it('should create logger with default options', () => {
    const { result } = renderHook(() => useLogger());

    expect(result.current).toHaveProperty('debug');
    expect(result.current).toHaveProperty('info');
    expect(result.current).toHaveProperty('warn');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('fatal');
  });

  it('should create logger with custom options', () => {
    const options = {
      appSlug: 'test-app',
      userId: 'user-123',
      requestId: 'req-456'
    };

    const { result } = renderHook(() => useLogger(options));

    expect(result.current).toHaveProperty('debug');
    expect(result.current).toHaveProperty('info');
    expect(result.current).toHaveProperty('warn');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('fatal');
  });

  it('should log info messages', () => {
    const { result } = renderHook(() => useLogger());
    
    result.current.info('Test message', { context: 'test' });
    
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Test message',
      { context: 'test' },
      expect.objectContaining({
        appSlug: undefined,
        userId: undefined,
        requestId: undefined
      })
    );
  });

  it('should log error messages', () => {
    const { result } = renderHook(() => useLogger());
    const error = new Error('Test error');
    
    result.current.error('Test error message', error, { context: 'test' });
    
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Test error message',
      error,
      { context: 'test' },
      expect.objectContaining({
        appSlug: undefined,
        userId: undefined,
        requestId: undefined
      })
    );
  });

  it('should include custom context in metadata', () => {
    const options = {
      appSlug: 'test-app',
      userId: 'user-123',
      requestId: 'req-456'
    };

    const { result } = renderHook(() => useLogger(options));
    
    result.current.info('Test message');
    
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Test message',
      undefined,
      expect.objectContaining({
        appSlug: 'test-app',
        userId: 'user-123',
        requestId: 'req-456'
      })
    );
  });
});
