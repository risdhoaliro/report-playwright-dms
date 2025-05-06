import { Locator, Page } from "@playwright/test";
import data from "../../General/data";

export class LoginElements {
    readonly userName: Locator;
    readonly password: Locator;
    readonly loginButton: Locator;
    readonly popupErrorMessage: Locator;
    readonly popupSuccessMessage: Locator;
    readonly rememberMeCheckbox: Locator;
    readonly forgotPasswordLink: Locator;
    readonly usernameErrorMessage: Locator;
    readonly passwordErrorMessage: Locator;

    constructor(page: Page) {
        // Form fields - mengutamakan data-testid jika tersedia
        this.userName = page.locator("[data-testid='username-input'], input[placeholder='Input your username']");
        this.password = page.locator("[data-testid='password-input'], input[placeholder='Input your password']");
        this.loginButton = page.locator("[data-testid='login-button'], button[type='submit']");
        
        // Error messages form validation
        this.usernameErrorMessage = page.locator("[data-testid='username-error-message']");
        this.passwordErrorMessage = page.locator("[data-testid='password-error-message']");
        
        // Chakra UI toast untuk error message - menggunakan text dari data.json
        const errorText = data.LoginData.errorMessageLogin.split(',')[0]; // Mengambil bagian pertama dari pesan
        this.popupErrorMessage = page.locator([
            "#login-error-toast", 
            `div[id*='toast'][role='status']:has-text('${errorText}')`,
            "div.chakra-toast div.chakra-alert--error",
            `div[role='status']:has-text('${errorText}')`
        ].join(','));
        
        // Chakra UI toast untuk success message - menggunakan text dari data.json
        const successText = data.LoginData.successMessageLogin.split('.')[0]; // Mengambil bagian pertama dari pesan
        this.popupSuccessMessage = page.locator([
            "#login-success-toast", 
            `div[id*='toast'][role='status']:has-text('${successText}')`,
            "div.chakra-toast div.chakra-alert--success",
            `div[role='status']:has-text('${successText}')`
        ].join(','));
        
        // Elemen tambahan
        this.rememberMeCheckbox = page.locator("[data-testid='remember-me'], input[name='remember_me']");
        this.forgotPasswordLink = page.locator("[data-testid='forgot-password'], a:has-text('Forgot password?')");
    }
}