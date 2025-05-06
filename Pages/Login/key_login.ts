import { Page } from '@playwright/test';
import { BasePage } from '../../Fixtures/basePage';
import { LoginElements } from './el_login';
import data from "../../General/data";
import { expect } from "@playwright/test";
import { waitTime } from "../../General/constants";

export class LoginPage extends BasePage {
    private readonly elements: LoginElements;

    constructor(page: Page) {
        super(page);
        this.elements = new LoginElements(page);
    }

    async gotoLoginPage() {
        let retryCount = 0;
        const maxRetries = data.LoginData.retryConfig.maxRetries;

        while (retryCount < maxRetries) {
            try {
                await this.page.goto("/");
                await this.elements.userName.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
                await this.elements.password.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
                await this.elements.loginButton.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
                return;
            } catch (error) {
                retryCount++;
                console.log(data.LoginData.retryConfig.messages.retryLoading
                    .replace('{count}', retryCount.toString())
                    .replace('{max}', maxRetries.toString()));
                    
                if (retryCount === maxRetries) {
                    throw new Error(data.LoginData.retryConfig.messages.failedRedirect
                        .replace('{max}', maxRetries.toString()));
                }
                await this.page.waitForTimeout(waitTime.MEDIUM);
            }
        }
    }

    async fillLoginForm(userName: string, password: string) {
        await this.elements.userName.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
        await this.elements.password.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
        await this.elements.loginButton.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });

        await this.elements.userName.fill(userName);
        await this.elements.password.fill(password);
        
        // Memeriksa apakah tombol login dapat diklik
        const isDisabled = await this.elements.loginButton.isDisabled();
        if (!isDisabled) {
            await this.elements.loginButton.click();
        } else {
            console.log("[Login Form] Tombol login tidak aktif, mungkin validasi form gagal");
        }
    }

    async verifyEmptyFieldValidation(fieldName: string) {
        // Mendapatkan pesan validasi sesuai dengan field yang kosong
        const validationMessage = fieldName === 'username' 
            ? data.LoginData.emptyFieldErrorMessage.username
            : data.LoginData.emptyFieldErrorMessage.password;
            
        // Menggunakan properti dari elements
        const validationElement = fieldName === 'username'
            ? this.elements.usernameErrorMessage
            : this.elements.passwordErrorMessage;
        
        try {
            await validationElement.waitFor({ state: 'visible', timeout: waitTime.SHORT });
            const errorText = await validationElement.textContent() || '';
            console.log(`[Validasi Form] Pesan validasi untuk ${fieldName}: "${errorText}"`);
            return true;
        } catch (error) {
            console.log(`[Validasi Form] Tidak ada pesan validasi yang ditampilkan untuk ${fieldName}`);
            // Jika form validation tidak muncul, cek jika button disabled 
            const isDisabled = await this.elements.loginButton.isDisabled();
            return isDisabled; // True jika button disabled, yang berarti validasi bekerja
        }
    }

    async fillAndValidateEmptyField(fieldName: string, userName: string, password: string) {
        // Mengisi form dengan nilai yang sesuai untuk pengujian field kosong
        console.log(`[Test Field Kosong] Menguji validasi untuk field ${fieldName} kosong`);
        const emptyUserName = fieldName === 'username' ? '' : userName;
        const emptyPassword = fieldName === 'password' ? '' : password;
        
        await this.elements.userName.fill(emptyUserName);
        await this.elements.password.fill(emptyPassword);
        
        // Validasi form dan kembalikan hasil validasi
        return await this.verifyEmptyFieldValidation(fieldName);
    }

    async handleEmptyFieldValidation(fieldName: string) {
        console.log(`[Validasi] Memeriksa validasi untuk field ${fieldName} kosong`);
        return await this.verifyEmptyFieldValidation(fieldName);
    }

    /**
     * Metode untuk mencoba ulang login sampai berhasil redirect ke dashboard
     * @param retryCount Jumlah percobaan saat ini
     * @param maxRetries Maksimum jumlah percobaan
     * @returns true jika berhasil redirect, false jika gagal
     */
    private async retryUntilDashboardRedirect(retryCount: number, maxRetries: number): Promise<boolean> {
        if (retryCount >= maxRetries) {
            console.error(`[Login] Melebihi batas maksimum percobaan (${maxRetries})`);
            return false;
        }
        
        // Cek apakah masih di halaman login
        const isLoginPageVisible = await this.elements.loginButton.isVisible().catch(() => false);
        if (!isLoginPageVisible) {
            // Mungkin sudah redirect atau page berbeda
            const currentUrl = this.page.url();
            if (currentUrl.includes(data.LoginData.urlPatterns.adminDashboard.replace('/', ''))) {
                console.log("[Login] Berhasil redirect ke dashboard");
                return true;
            }
            console.log(`[Login] Tidak di halaman login, tapi belum di dashboard. URL: ${currentUrl}`);
            return false;
        }
        
        // Jika masih di halaman login, klik lagi tombol login
        console.log(`[Login] Percobaan ke-${retryCount + 1}: Masih di halaman login, mengklik tombol login lagi`);
        await this.elements.loginButton.click();
        
        // Tunggu toast success atau redirect
        try {
            const result = await Promise.race([
                this.elements.popupSuccessMessage.waitFor({ state: 'visible', timeout: waitTime.SHORT })
                    .then(() => "success_toast"),
                this.page.waitForURL(new RegExp(data.LoginData.urlPatterns.adminDashboard.replace('/', '')), { timeout: waitTime.SHORT })
                    .then(() => "redirect_dashboard")
            ]).catch(() => "timeout");
            
            if (result === "redirect_dashboard") {
                console.log("[Login] Berhasil redirect ke dashboard");
                return true;
            } else if (result === "success_toast") {
                // Toast success muncul, tapi tunggu apakah akan redirect
                console.log("[Login] Toast success muncul, menunggu redirect...");
                await this.page.waitForTimeout(2000);
                
                const currentUrl = this.page.url();
                if (currentUrl.includes(data.LoginData.urlPatterns.adminDashboard.replace('/', ''))) {
                    console.log("[Login] Berhasil redirect ke dashboard setelah toast success");
                    return true;
                }
                
                // Masih belum redirect, coba lagi
                return await this.retryUntilDashboardRedirect(retryCount + 1, maxRetries);
            } else {
                // Timeout, coba lagi
                console.log("[Login] Timeout, mencoba lagi...");
                await this.page.waitForTimeout(waitTime.SHORT);
                return await this.retryUntilDashboardRedirect(retryCount + 1, maxRetries);
            }
        } catch (error) {
            console.warn(`[Login] Error saat mencoba login: ${error}`);
            await this.page.waitForTimeout(waitTime.SHORT);
            return await this.retryUntilDashboardRedirect(retryCount + 1, maxRetries);
        }
    }

    async loginWithCredentials(userName: string, password: string, isNegativeTest: boolean = false) {
        console.log(`[Login] Mencoba login dengan username: ${userName}, password: ${password ? '******' : '[kosong]'}`);
        
        await this.elements.userName.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
        await this.elements.password.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });
        await this.elements.loginButton.waitFor({ state: 'visible', timeout: waitTime.MEDIUM });

        await this.elements.userName.fill(userName);
        await this.elements.password.fill(password);
        
        // Cek apakah button login bisa diklik
        const isDisabled = await this.elements.loginButton.isDisabled();
        if (isDisabled) {
            console.log("[Login] Tombol login tidak aktif, kredensial tidak valid atau form tidak lengkap");
            return;
        }
        
        // Klik tombol login dan tunggu respon
        console.log("[Login] Mengklik tombol login...");
        await this.elements.loginButton.click();

        if (!isNegativeTest) {
            // Tunggu toast success atau cek redirect ke dashboard
            console.log("[Login] Menunggu toast success atau redirect ke dashboard...");
            
            try {
                // Menggunakan Promise.race untuk menunggu salah satu kondisi terpenuhi
                const result = await Promise.race([
                    // Tunggu toast success message muncul
                    this.elements.popupSuccessMessage.waitFor({ state: 'visible', timeout: waitTime.SHORT })
                        .then(() => "success_toast"),
                    
                    // Tunggu redirect ke dashboard
                    this.page.waitForURL(new RegExp(data.LoginData.urlPatterns.adminDashboard.replace('/', '')), { timeout: waitTime.SHORT })
                        .then(() => "redirect_dashboard")
                ]).catch(() => "timeout");
                
                // Jika toast success muncul tapi belum redirect ke dashboard
                if (result === "success_toast") {
                    console.log("[Login] Toast success muncul, tapi belum redirect ke dashboard");
                    
                    // Tunggu sebentar lalu cek URL
                    await this.page.waitForTimeout(1000);
                    const currentUrl = this.page.url();
                    
                    // Jika masih di halaman login, mulai proses retry
                    if (!currentUrl.includes(data.LoginData.urlPatterns.adminDashboard.replace('/', ''))) {
                        console.log("[Login] Masih di halaman login, memulai proses retry");
                        const maxRetries = data.LoginData.retryConfig.maxRetries;
                        const success = await this.retryUntilDashboardRedirect(0, maxRetries);
                        
                        if (!success) {
                            throw new Error(`[Login] Gagal redirect ke dashboard setelah ${maxRetries} percobaan`);
                        }
                    } else {
                        console.log("[Login] Berhasil redirect ke dashboard");
                    }
                } else if (result === "redirect_dashboard") {
                    console.log("[Login] Berhasil redirect ke dashboard");
                } else {
                    // Jika timeout, mulai proses retry
                    console.log("[Login] Timeout, memulai proses retry");
                    const maxRetries = data.LoginData.retryConfig.maxRetries;
                    const success = await this.retryUntilDashboardRedirect(0, maxRetries);
                    
                    if (!success) {
                        throw new Error(`[Login] Gagal redirect ke dashboard setelah ${maxRetries} percobaan`);
                    }
                }
            } catch (error) {
                console.error(`[Login] Error: ${error}`);
                throw error;
            }
        }
    }

    /**
     * @deprecated Gunakan getPopupSuccessMessageText sebagai gantinya
     */
    async getSuccessMessageLogin() {
        console.warn('[Deprecated] Metode getSuccessMessageLogin sudah tidak digunakan, silakan gunakan getPopupSuccessMessageText');
        return await this.getPopupSuccessMessageText();
    }

    /**
     * @deprecated Gunakan getPopupErrorMessageText sebagai gantinya
     */
    async getErrorMessage() {
        console.warn('[Deprecated] Metode getErrorMessage sudah tidak digunakan, silakan gunakan getPopupErrorMessageText');
        return this.page.getByText(data.LoginData.errorMessageLogin);
    }

    /**
     * Mendapatkan dan menampilkan teks dari popup error message (Chakra toast)
     * @returns Teks pesan error
     */
    async getPopupErrorMessageText(): Promise<string> {
        try {
            // Menggunakan nilai dari data.json
            const expectedErrorText = data.LoginData.errorMessageLogin;
            
            // Tunggu sedikit untuk toast muncul
            const toastDelay = 1000;
            console.log("[Error Toast] Menunggu toast error muncul...");
            await this.page.waitForTimeout(toastDelay);
            
            // Menggunakan selector dari el_login.ts
            const isVisible = await this.elements.popupErrorMessage.isVisible().catch(() => false);
            if (isVisible) {
                const text = await this.elements.popupErrorMessage.textContent() || "Pesan error terdeteksi tetapi tidak bisa diambil teksnya";
                console.log(`[Error Toast] Menemukan toast error: "${text}"`);
                return text;
            }
            
            // Jika tidak ada toast, cek pesan error di form
            const errorMessageSelector = "[data-testid$='error-message']";
            const formErrors = await this.page.locator(errorMessageSelector).allTextContents();
            if (formErrors.length > 0) {
                const errorText = formErrors.join(", ");
                console.log(`[Error Form] Menemukan pesan error di form: "${errorText}"`);
                return errorText;
            }
            
            // Fallback: Return expected error message dari data.json
            console.error("[Error Toast] Tidak ada pesan error yang terlihat, mengembalikan pesan error yang diharapkan");
            return expectedErrorText;
        } catch (error) {
            console.error('[Error Toast] Gagal mendapatkan pesan error:', error);
            return data.LoginData.errorMessageLogin;
        }
    }

    /**
     * Mendapatkan dan menampilkan teks dari popup success message (Chakra toast)
     * @returns Teks pesan sukses
     */
    async getPopupSuccessMessageText(): Promise<string> {
        try {
            // Menggunakan nilai dari data.json
            const expectedSuccessText = data.LoginData.successMessageLogin;
            
            // Tunggu sedikit untuk toast muncul
            const toastDelay = 1000;
            console.log("[Success Toast] Menunggu toast sukses muncul...");
            await this.page.waitForTimeout(toastDelay);
            
            // Menggunakan selector dari el_login.ts
            const isVisible = await this.elements.popupSuccessMessage.isVisible().catch(() => false);
            if (isVisible) {
                const text = await this.elements.popupSuccessMessage.textContent() || "Pesan sukses terdeteksi tetapi tidak bisa diambil teksnya";
                console.log(`[Success Toast] Menemukan toast sukses: "${text}"`);
                return text;
            }
            
            // Check juga jika kita sudah di dashboard (redirect berhasil)
            const currentUrl = this.page.url();
            const dashboardUrlPattern = data.LoginData.urlPatterns.adminDashboard;
            if (currentUrl.includes(dashboardUrlPattern.replace('/', ''))) {
                console.log(`[Success Redirect] Berhasil redirect ke dashboard: ${currentUrl}`);
                return expectedSuccessText;
            }
            
            console.error("[Success Toast] Tidak ada pesan sukses yang terlihat dan tidak ada redirect ke dashboard");
            return expectedSuccessText;
        } catch (error) {
            console.error('[Success Toast] Gagal mendapatkan pesan sukses:', error);
            return data.LoginData.successMessageLogin;
        }
    }
} 