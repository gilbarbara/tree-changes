import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      all: true,
      include: ['src/**/*.ts?(x)'],
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
