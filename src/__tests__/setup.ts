// Test setup file
import { vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { resetAllSingletons } from '../utils/singleton-manager';

// Reset all singletons before each test
beforeEach(() => {
  resetAllSingletons();
});

// Mock console methods to avoid noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  // Mock console methods
  console.log = vi.fn();
  console.info = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
  console.debug = vi.fn();
});

afterAll(() => {
  // Restore original console methods
  Object.assign(console, originalConsole);
});

// fs mocking is now handled in individual test files

// Mock require for Node.js environment
interface MockRequire {
  (module: string): unknown;
  cache: Record<string, unknown>;
  extensions: Record<string, unknown>;
  main: unknown;
  resolve: (id: string) => string;
}

(global as unknown as { require: MockRequire }).require = Object.assign(
  vi.fn((module: string) => {
    if (module === 'crypto') {
      return {
        randomUUID: vi.fn(() => 'mocked-node-uuid-123')
      };
    }
    throw new Error(`Module ${module} not found`);
  }),
  {
    cache: {},
    extensions: {},
    main: undefined,
    resolve: vi.fn((id: string) => id)
  }
) as MockRequire;

// Mock crypto for UUID generation - only when needed
// We'll let the actual crypto.randomUUID work in tests unless specifically mocked
