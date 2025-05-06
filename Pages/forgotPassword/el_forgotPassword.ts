import { Page } from '@playwright/test';

export class ForgotPasswordElements {
    readonly page: Page;
    
    // Page title and instructions
    readonly pageTitle;
    readonly instructionsText;
    readonly resetPasswordTitle;
    
    // Form fields
    readonly emailInput;
    readonly emailErrorMessage;
    readonly inputNewPassword;
    readonly inputConfirmPassword;
    
    // Buttons
    readonly submitButton;
    readonly backToLoginLink;
    readonly resetPasswordButton;
    
    // Toast messages
    readonly successToast;
    readonly errorToast;
    // readonly successMessageFromForgotPassword;
    
    // Footer
    readonly copyrightText;
    readonly versionText;

    constructor(page: Page) {
        this.page = page;
        
        // Page title and instructions
        this.pageTitle = page.locator('h2:has-text("Forgot Your Password?")');
        this.instructionsText = page.locator('h4:has-text("Enter your registered below to receive Reset Password Link")');
        this.resetPasswordTitle = page.locator('h2:has-text("Reset Password")');
        
        // Form fields - berdasarkan kode React
        this.emailInput = page.locator('input[name="email"][type="email"]');
        this.emailErrorMessage = page.locator('.chakra-form__error-message');
        this.inputNewPassword = page.locator("(//input[@placeholder='Input your password'])[1]");
        this.inputConfirmPassword = page.locator("(//input[@placeholder='Input your password'])[2]");
        
        // Buttons
        this.submitButton = page.locator('button[type="submit"]');
        this.backToLoginLink = page.locator('a:has-text("Back to Login")');
        this.resetPasswordButton = page.locator("//button[normalize-space(text())='Reset Password']");
        
        // Toast messages berdasarkan Chakra UI Toast
        this.successToast = page.locator("(//div[@data-status='success'])[2]");
        this.errorToast = page.locator("//div[normalize-space(text())='data not found']");

        // Footer
        this.copyrightText = page.locator('div:has-text("Copyright © 2024")');
        this.versionText = page.locator('div:has-text("App version 1.0.0")');
    }
}
