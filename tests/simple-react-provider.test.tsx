import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SimpleLoggerProvider, useLogger } from '../src/simple-react-provider';
import { LogLevel } from '../src/core/types';

// Mock console
const consoleSpy = {
  log: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn()
};

beforeEach(() => {
  Object.assign(console, consoleSpy);
  vi.clearAllMocks();
});

// Test component that uses the logger
const TestComponent = () => {
  const logger = useLogger();
  
  const handleClick = () => {
    logger.info('Button clicked');
  };
  
  return (
    <div>
      <button onClick={handleClick}>Test Button</button>
    </div>
  );
};

describe('SimpleLoggerProvider', () => {
  it('should provide logger to children', () => {
    render(
      <SimpleLoggerProvider>
        <TestComponent />
      </SimpleLoggerProvider>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = vi.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useLogger must be used within a SimpleLoggerProvider');
    
    console.error = originalError;
  });

  it('should accept custom configuration', () => {
    render(
      <SimpleLoggerProvider level={LogLevel.WARN}>
        <TestComponent />
      </SimpleLoggerProvider>
    );
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
});
