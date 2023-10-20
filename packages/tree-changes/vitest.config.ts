import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      all: true,
      include: ['src/**/*.ts?(x)'],
      exclude: ['src/**/types.ts'],
      provider: 'v8',
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
      reporter: ['text', 'lcov'],
    },
    environment: 'happy-dom',
    globals: true,
  },
});
