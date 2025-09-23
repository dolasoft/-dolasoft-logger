import { vi, beforeEach } from 'vitest';

// Mock global fetch
global.fetch = vi.fn();

// Ensure clean console mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
