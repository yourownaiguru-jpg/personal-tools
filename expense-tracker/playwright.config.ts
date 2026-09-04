import { defineConfig } from '@playwright/test'

// Locally the tests drive the real installed Google Chrome; in CI (where
// Chrome isn't preinstalled) they fall back to Playwright's Chromium,
// installed via `npx playwright install chromium`.
export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:4173/personal-tools/',
    channel: process.env.CI ? undefined : 'chrome',
    headless: true,
  },
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4173/personal-tools/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
