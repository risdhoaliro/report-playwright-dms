import { Page } from '@playwright/test';
import { BasePage } from '../../Fixtures/basePage';
import { ForgotPasswordElements } from './el_forgotPassword';
import data from "../../General/data";
import { waitTime } from "../../General/constants";

/**
 * Result dari validasi email field
 */
interface EmailValidationResult {
    isValid: boolean;
    message: string;
}

/**
 * Result dari request password reset
 */
interface PasswordResetResult {
    type: string;
    message: string;
}

export class ForgotPasswordPage extends BasePage {
    private readonly elements: ForgotPasswordElements;

    constructor(page: Page) {
        super(page);
        this.elements = new ForgotPasswordElements(page);
    }

    /**
     * Navigate to forgot password page
     */
    async gotoForgotPasswordPage() {
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                // Coba akses halaman Forgot Password dari login page
                // 1. Pergi ke login page
                await this.page.goto('/login');
                console.log("Navigating to login page first");
                
                // 2. Klik link Forgot Password pada halaman login
                const forgotPasswordLink = this.page.getByText('Forgot password?');
                await forgotPasswordLink.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
                console.log("Found 'Forgot password?' link on login page");
                
                // 3. Klik link
                await forgotPasswordLink.click();
                console.log("Clicked on 'Forgot password?' link");
                
                // 4. Tunggu elemen pada halaman forgot password
                await this.elements.pageTitle.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
                await this.elements.emailInput.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
                await this.elements.submitButton.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
                
                console.log("Successfully navigated to forgot password page");
                return;
            } catch (error) {
                retryCount++;
                console.log(`Retry loading forgot password page ${retryCount}/${maxRetries}`);
                
                if (retryCount === maxRetries) {
                    throw new Error(`Failed to load forgot password page after ${maxRetries} attempts`);
                }
                await this.page.waitForTimeout(waitTime.MEDIUM);
            }
        }
    }

    /**
     * Fill email input field
     * @param email Email to enter
     */
    async fillEmail(email: string) {
        await this.elements.emailInput.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
        await this.elements.emailInput.fill(email);
    }

    /**
     * Click submit button
     */
    async clickSubmit() {
        await this.elements.submitButton.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
        
        // Check if button is enabled
        const isDisabled = await this.elements.submitButton.isDisabled();
        if (isDisabled) {
            console.log("Submit button is disabled, likely due to validation issues");
            return false;
        }
        
        await this.elements.submitButton.click();
        return true;
    }

    /**
     * Click back to login link
     */
    async goBackToLogin() {
        await this.elements.backToLoginLink.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
        await this.elements.backToLoginLink.click();
    }

    /**
     * Verify email field validation based on 3 main conditions:
     * 1. If field is empty, button should be disabled
     * 2. If email is not registered, error popup should appear
     * 3. If field is filled, button should be enabled
     */
    async verifyEmailValidation(): Promise<EmailValidationResult> {
        try {
            // Check email and button status
            const emailValue = await this.elements.emailInput.inputValue();
            const isEmailEmpty = emailValue.trim() === '';
            const isButtonDisabled = await this.elements.submitButton.isDisabled();
            
            // Log status for debugging
            console.log(`Email field is empty: ${isEmailEmpty}, value: "${emailValue}"`);
            console.log(`Submit button disabled: ${isButtonDisabled}`);
            
            // Condition 1: Empty field, button must be disabled
            if (isEmailEmpty) {
                const isValid = isButtonDisabled;
                return {
                    isValid,
                    message: isValid 
                        ? "Valid: Button disabled for empty email field" 
                        : "Invalid: Button should be disabled for empty email field"
                };
            }
            
            // Condition 3: Field filled, button must be enabled
            if (!isEmailEmpty) {
                const isValid = !isButtonDisabled;
                return {
                    isValid,
                    message: isValid 
                        ? "Valid: Button enabled for filled email field" 
                        : "Invalid: Button should be enabled for filled email field"
                };
            }
            
            // Default response (should never be reached)
            return {
                isValid: false,
                message: "Unexpected validation state"
            };
        } catch (error) {
            console.error("Error during email validation check:", error);
            return {
                isValid: false,
                message: `Error in validation: ${error}`
            };
        }
    }

    /**
     * Get success toast message text
     */
    async getSuccessMessage() {
        try {
            console.log("Waiting for success toast to appear...");
            await this.elements.successToast.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
            const message = await this.elements.successToast.textContent() || '';
            console.log(`Success message Forgot Password displayed: "${message}"`);
            return message;
        } catch (error) {
            console.error("No success toast message appeared:", error);
            return '';
        }
    }

    /**
     * Get error toast message text
     */
    async getErrorMessage() {
        try {
            console.log("Waiting for error toast to appear...");
            await this.elements.errorToast.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
            
            const message = await this.elements.errorToast.textContent() || '';
            console.log(`Error message from toast: "${message}"`);
            
            if (!message) {
                console.warn("Warning: Empty error message text from error toast element");
            }
            
            return message;
        } catch (error) {
            console.error("Failed to get error toast message:", error);
            return '';
        }
    }

    /**
     * Complete forgot password flow with given email
     * @param email Email to submit
     * @param expectError Set true if expecting an error (for negative test)
     */
    async requestPasswordReset(email: string, expectError: boolean = false): Promise<EmailValidationResult | PasswordResetResult> {
        // Fill email field
        await this.fillEmail(email);
        
        // Check validation for empty email
        if (email.trim() === '') {
            const validationResult = await this.verifyEmailValidation();
            return validationResult;
        }
        
        // Click submit button if email is filled
        const isSubmitted = await this.clickSubmit();
        
        // Return validation result if button can't be clicked
        if (!isSubmitted) {
            return {
                isValid: false,
                message: "Submit button is disabled but email is filled"
            };
        }
        
        // Wait for success or error message based on expectation
        try {
            if (expectError) {
                // For negative test cases (expecting error)
                console.log("Expecting error message for invalid email");
                const errorMessage = await this.getErrorMessage();
                return { 
                    type: 'error', 
                    message: errorMessage 
                };
            } else {
                // For positive test cases (expecting success)
                console.log("Expecting success message for valid email");
                const successMessage = await this.getSuccessMessage();
                return { 
                    type: 'success', 
                    message: successMessage 
                };
            }
        } catch (error) {
            console.error("Error during password reset request:", error);
            return { type: 'unknown', message: 'No response from server' };
        }
    }

    /**
     * Verify email format validation using evaluate
     */
    async verifyEmailFormat(email: string): Promise<EmailValidationResult> {
        // Fill email for testing
        await this.fillEmail(email);
        
        try {
            // Check button status
            const isButtonDisabled = await this.elements.submitButton.isDisabled();
            
            // Get validation message from HTML5 validation
            const emailInput = this.elements.emailInput;
            const validationMessage = await emailInput.evaluate((input: HTMLInputElement) => input.validationMessage);
            
            // Log validation information
            console.log(`Email: "${email}", Button disabled: ${isButtonDisabled}, Validation: "${validationMessage}"`);
            
            // Condition 1: Empty email - button should be disabled (no validation message)
            if (!email.trim()) {
                return {
                    isValid: isButtonDisabled,
                    message: isButtonDisabled 
                        ? "Valid: Button disabled for empty email" 
                        : "Invalid: Button should be disabled for empty email"
                };
            }
            
            // Condition 2: Invalid email format - validation message should appear
            if (validationMessage) {
                return {
                    isValid: true, // Test is valid if validation message appears
                    message: `Valid: HTML5 validation detected - "${validationMessage}"`
                };
            }
            
            // Condition 3: Valid email format - button should be enabled
            return {
                isValid: !isButtonDisabled,
                message: !isButtonDisabled 
                    ? "Valid: Button enabled for valid email format" 
                    : "Invalid: Button should be enabled for valid email format"
            };
        } catch (error) {
            console.error("Error checking email format validation:", error);
            return {
                isValid: false,
                message: `Error in format validation: ${error}`
            };
        }
    }
}
