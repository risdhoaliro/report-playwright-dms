import { Page } from '@playwright/test';
import { waitTime } from '@general/constants';
import { LoginPage } from '@pages/Login/key_login';
import data from '@general/data';

/**
 * Setup function untuk test login dengan kredensial superadmin
 * @param page Playwright page
 * @returns LoginPage instance yang sudah login
 */
export const setupSuperAdminLogin = async (page: Page): Promise<LoginPage> => {
    console.log('[Setup] Memulai setup login SuperAdmin...');
    const loginPage = new LoginPage(page);
    await loginPage.gotoLoginPage();
    console.log('[Setup] Login sebagai superadmin dengan user: ' + data.LoginData.validDataSuperAdmin.userName);
    await loginPage.loginWithCredentials(
        data.LoginData.validDataSuperAdmin.userName,
        data.LoginData.validDataSuperAdmin.password
    );
    return loginPage;
};

/**
 * Setup function untuk test login tanpa login otomatis
 * @param page Playwright page
 * @returns LoginPage instance yang siap untuk testing
 */
export const setupLoginTests = async (page: Page): Promise<LoginPage> => {
    console.log('[Setup] Memulai setup untuk test login...');
    const loginPage = new LoginPage(page);
    await loginPage.gotoLoginPage();
    console.log('[Setup] Halaman login siap untuk testing');
    return loginPage;
};

/**
 * Setup function untuk ke halaman dashboard setelah login
 * @param page Playwright page
 * @returns LoginPage instance setelah login dan berada di dashboard
 */
export const setupDashboardAccess = async (page: Page): Promise<LoginPage> => {
    console.log('[Setup] Memulai setup akses ke dashboard...');
    const loginPage = await setupSuperAdminLogin(page);
    
    // Verifikasi redirect ke dashboard berhasil
    console.log('[Setup] Memverifikasi redirect ke dashboard...');
    await page.waitForURL(new RegExp(data.LoginData.urlPatterns.adminDashboard.replace('/', '')), { 
        timeout: waitTime.MEDIUM 
    });
    console.log('[Setup] Berhasil mengakses dashboard');
    
    return loginPage;
};

/**
 * Setup function untuk test dengan data-driven dari file data.json
 * @param page Playwright page
 * @param testCase Test case data yang berisi credentials dan expected results
 * @returns LoginPage instance yang siap untuk testing
 */
export const setupDataDrivenTest = async (page: Page, testCase: any): Promise<LoginPage> => {
    console.log(`[Setup] Memulai setup untuk data-driven test: ${testCase.scenario}`);
    const loginPage = new LoginPage(page);
    await loginPage.gotoLoginPage();
    console.log(`[Setup] Halaman login siap untuk test case: ${testCase.scenario}`);
    return loginPage;
}; 