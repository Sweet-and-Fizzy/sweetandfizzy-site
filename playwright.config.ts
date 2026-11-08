import { defineConfig } from '@playwright/test';

const external = process.env.SWEEP_BASE_URL;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: external ?? 'http://localhost:4329' },
  webServer: external ? undefined : {
    command: 'npx astro preview --port 4329',
    url: 'http://localhost:4329',
    reuseExistingServer: true,
  },
});
