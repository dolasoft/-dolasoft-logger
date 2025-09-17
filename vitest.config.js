import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: 'forks' // Use separate processes to avoid module conflicts
  },
  resolve: {
    alias: {
      '@': './src'
    }
  },
  esbuild: {
    target: 'node14'
  },
  define: {
    global: 'globalThis'
  }
});
