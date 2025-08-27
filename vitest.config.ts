import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@/lib': resolve(fileURLToPath(new URL('./src', import.meta.url)), 'lib'),
      '@/components': resolve(fileURLToPath(new URL('./src', import.meta.url)), 'components'),
      '@/hooks': resolve(fileURLToPath(new URL('./src', import.meta.url)), 'hooks'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: './coverage',
    },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
