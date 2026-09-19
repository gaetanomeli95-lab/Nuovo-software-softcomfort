import { defineConfig, devices } from '@playwright/test';

/**
 * E2E sui flussi critici. Richiede il dev server attivo
 * (webServer lo avvia automaticamente) e il backend legacy raggiungibile.
 * Per installare i browser: `npx playwright install chromium`.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    locale: 'it-IT',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
