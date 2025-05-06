import { Page, Locator } from '@playwright/test';
import { waitTime } from '../General/constants';

export class BasePage {
    constructor(protected page: Page) {
        this.page = page;
    }

    protected async waitForElementWithRetry(
        locator: Locator,
        action: () => Promise<void>,
        maxRetries: number = 3,
        timeout: number = waitTime.MEDIUM
    ): Promise<void> {
        let retryCount = 0;
        let lastError: Error | null = null;

        while (retryCount < maxRetries) {
            try {
                await locator.waitFor({ state: 'visible', timeout });
                await action();
                return;
            } catch (error) {
                lastError = error as Error;
                retryCount++;
                console.warn(`Retry attempt ${retryCount} failed: ${(error as Error).message}`);
                await this.page.waitForTimeout(waitTime.SHORT);
            }
        }

        throw new Error(`Action failed after ${maxRetries} retries. Last error: ${lastError?.message}`);
    }

    protected async waitForNavigationWithTimeout(timeout: number = waitTime.MEDIUM): Promise<void> {
        try {
            await this.page.waitForNavigation({ timeout });
        } catch (error) {
            console.error(`Navigation timeout after ${timeout}ms`);
            throw error;
        }
    }

    /**
     * Safely fill form input with retry logic
     * @param locator Element locator
     * @param value Value to fill
     * @param options Options for filling
     */
    protected async safeFill(locator: Locator, value: string, options?: { force?: boolean }): Promise<void> {
        await this.waitForElementWithRetry(
            locator,
            async () => {
                await locator.fill(value, options);
            }
        );
    }

    /**
     * Safely click element with retry logic
     * @param locator Element locator
     * @param options Options for clicking
     */
    protected async safeClick(locator: Locator, options?: { force?: boolean, timeout?: number }): Promise<void> {
        const timeout = options?.timeout || waitTime.MEDIUM;
        await this.waitForElementWithRetry(
            locator,
            async () => {
                await locator.click({ force: options?.force, timeout });
            },
            3,
            timeout
        );
    }

    /**
     * Safely check if element is visible
     * @param locator Element locator
     * @param timeout Timeout in milliseconds
     * @returns True if element is visible
     */
    protected async isVisible(locator: Locator, timeout: number = waitTime.SHORT): Promise<boolean> {
        try {
            await locator.waitFor({ state: 'visible', timeout });
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Select option from dropdown by text
     * @param dropdownLocator Dropdown element locator
     * @param optionText Text of the option to select
     */
    protected async selectDropdownByText(dropdownLocator: Locator, optionText: string): Promise<void> {
        await this.waitForElementWithRetry(
            dropdownLocator,
            async () => {
                await dropdownLocator.selectOption({ label: optionText });
            }
        );
    }

    /**
     * Select option from dropdown by value
     * @param dropdownLocator Dropdown element locator
     * @param value Value of the option to select
     */
    protected async selectDropdownByValue(dropdownLocator: Locator, value: string): Promise<void> {
        await this.waitForElementWithRetry(
            dropdownLocator,
            async () => {
                await dropdownLocator.selectOption({ value });
            }
        );
    }

    /**
     * Handle alerts with specified action
     * @param action Action to perform on alert (accept/dismiss)
     */
    protected async handleAlert(action: 'accept' | 'dismiss' = 'accept'): Promise<void> {
        this.page.once('dialog', async dialog => {
            console.info(`Alert with message "${dialog.message()}" ${action === 'accept' ? 'accepted' : 'dismissed'}`);
            action === 'accept' ? await dialog.accept() : await dialog.dismiss();
        });
    }

    /**
     * Take screenshot with meaningful name
     * @param name Screenshot name
     * @returns Path to saved screenshot
     */
    protected async takeScreenshot(name: string): Promise<string> {
        const path = `./screenshots/${name}_${new Date().toISOString().replace(/:/g, '-')}.png`;
        await this.page.screenshot({ path, fullPage: true });
        console.log(`Screenshot saved to: ${path}`);
        return path;
    }
    
    /**
     * Scroll element into view
     * @param locator Element locator
     */
    protected async scrollIntoView(locator: Locator): Promise<void> {
        await this.waitForElementWithRetry(
            locator,
            async () => {
                await locator.scrollIntoViewIfNeeded();
            }
        );
    }
}

export { expect, Page } from '@playwright/test';