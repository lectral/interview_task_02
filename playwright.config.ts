import { defineConfig, devices } from '@playwright/test';

import { SAUCE_DEMO_BASE_URL } from './tests/test-data/saucedemo.constants';

const headedInDocker = process.env.PW_HEADED === '1';

export default defineConfig({
  testDir: './tests/specs',
  outputDir: '.artifacts/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never', outputFolder: '.artifacts/playwright-report' }], ['list']],
  use: {
    baseURL: SAUCE_DEMO_BASE_URL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: headedInDocker ? false : true,
    viewport: { width: 1440, height: 900 }
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chromium'
      }
    }
  ]
});
