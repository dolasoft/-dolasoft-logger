import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useLogger } from '../src/use-logger';

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

describe('useLogger Hook', () => {
  it('should return singleton logger instance', () => {
    render(<TestComponent />);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('should work everywhere - no provider needed', () => {
    render(<TestComponent />);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });
});
