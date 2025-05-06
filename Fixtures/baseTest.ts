import { test as base, Browser, BrowserContext, Page } from '@playwright/test';
import { LoginPage } from '../Pages/Login/key_login';
import { waitTime } from '../General/constants';

type BaseFixtures = {
    browser: Browser;
    context: BrowserContext;
    page: Page;
    loginPage: LoginPage;
};

export const test = base.extend<BaseFixtures>({
    context: async ({ browser }, use) => {
        const context = await browser.newContext();
        await use(context);
        await context.close();
    },
    page: async ({ context }, use) => {
        const page = await context.newPage();
        await use(page);
    },
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },
});

export const expect = test.expect;

// Setup global hooks
test.beforeAll(async () => {
    console.log('Starting test suite...');
});

test.afterAll(async ({ context, page }) => {
    console.log('Test suite completed. Cleaning up...');
    // Tunggu hingga semua request selesai sebelum menutup context
    await page.waitForLoadState('networkidle', { timeout: waitTime.MEDIUM });
    await context.close();
});

test.afterEach(async ({ page }) => {
    // Tunggu hingga semua request selesai sebelum melanjutkan ke test berikutnya
    await page.waitForLoadState('networkidle', { timeout: waitTime.MEDIUM });
});