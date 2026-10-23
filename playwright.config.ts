import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'pruebas',
  timeout: 60_000,
  workers: 1,
  reporter: 'list',
  use: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'es-EC' },
});
