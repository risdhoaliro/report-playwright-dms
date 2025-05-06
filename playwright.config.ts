import { faker } from '@faker-js/faker';
import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

// Environment URLs
const ENV = process.env.ENV || 'staging'; // default to staging if not specified

const envUrls = {
  staging: 'https://dev-drivermanagement.synapsis.id/login',
  // production: 'https://synapsis.id/login'
};

const baseURL = envUrls[ENV as keyof typeof envUrls];
console.log(`Running tests in ${ENV} environment at ${baseURL}`);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './Tests',
  timeout: 60000, // Meningkatkan timeout global dari 30s ke 60s
  expect: {
    timeout: 10000
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Configure parallel mode for all test files */
  testMatch: '**/*.test.ts',
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Parallel workers configuration */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['allure-playwright', {
      detail: true,
      outputFolder: 'allure-results',
      suiteTitle: false,
      environmentInfo: {
        framework: 'Playwright',
        environment: ENV,
        browser: process.env.BROWSER || 'chromium',
        device: 'Desktop',
        app_version: '1.0.0',
      }
    }],
    ['list']
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    // Screenshot pada setiap test
    screenshot: 'only-on-failure',
    
    // Video pada setiap test
    video: 'retain-on-failure',

    navigationTimeout: 60000, // Menambah timeout untuk navigasi
    actionTimeout: 30000, // Menambah timeout untuk actions
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Driver Monitoring System In Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
        headless: false,
        screenshot: 'on',
        trace: 'retain-on-failure',
        launchOptions: {
          slowMo: 1000, // Memperlambat eksekusi untuk debugging
        }
      },
    },

    {
      name: 'Driver Monitoring System In Firefox',
      use: {
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 },
        headless: true,
        screenshot: 'on',
        trace: 'retain-on-failure',
        launchOptions: {
          slowMo: 1000,
        }
      },
    },

    {
      name: 'Driver Monitoring System In Safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 },
        headless: true,
        screenshot: 'on',
        trace: 'retain-on-failure',
        launchOptions: {
          slowMo: 1000,
        }
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'mobile-chrome',
    //   use: {
    //     ...devices['Pixel 5'],
    //     headless: false,
    //     screenshot: 'on',
    //     trace: 'retain-on-failure',
    //     launchOptions: {
    //       slowMo: 1000,
    //     }
    //   },
    // },

    // {
    //   name: 'mobile-safari',
    //   use: {
    //     ...devices['iPhone 12'],
    //     headless: false,
    //     screenshot: 'on',
    //     trace: 'retain-on-failure',
    //     launchOptions: {
    //       slowMo: 1000,
    //     }
    //   },
    // },
  ],
}); 