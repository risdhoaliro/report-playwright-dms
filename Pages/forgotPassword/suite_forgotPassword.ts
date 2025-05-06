import { Page } from '@playwright/test';
import { ForgotPasswordPage } from './key_forgotPassword';

/**
 * Setup and return a configured ForgotPasswordPage instance
 * @param page Playwright Page object
 * @returns Configured ForgotPasswordPage instance
 */
export async function setupForgotPasswordTests(page: Page): Promise<ForgotPasswordPage> {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.gotoForgotPasswordPage();
    return forgotPasswordPage;
}

/**
 * Create a new ForgotPasswordPage instance without navigating
 * @param page Playwright Page object
 * @returns ForgotPasswordPage instance
 */
export function getForgotPasswordPage(page: Page): ForgotPasswordPage {
    return new ForgotPasswordPage(page);
} 