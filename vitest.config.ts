import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@fixtures': fileURLToPath(new URL('./fixtures/stage-a', import.meta.url)) } },
  test: { include: ['packages/*/src/**/*.test.ts', 'apps/web/src/**/*.test.ts'], environment: 'node' },
});
