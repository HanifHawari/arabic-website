import { defineConfig } from '@playwright/test';

// Smoke test halaman hasil static export. Jalankan `npm run build` dulu.
// Memakai Chrome yang terpasang (channel: 'chrome'); ganti ke chromium bawaan Playwright
// dengan `npx playwright install chromium` kalau Chrome tidak ada.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    channel: process.env.PW_CHANNEL ?? 'chrome',
    viewport: { width: 360, height: 780 },
  },
  webServer: {
    command: 'node scripts/serve-out.mjs 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
