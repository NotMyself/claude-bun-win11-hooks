import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use happy-dom for browser-like environment
    environment: 'happy-dom',

    // Setup file runs before all tests
    setupFiles: ['./__tests__/setup.ts'],

    // Include test files
    include: ['__tests__/**/*.test.ts'],

    // Global test utilities
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['*.ts'],
      exclude: ['__tests__/**', 'vitest.config.ts'],
    },
  },
});
