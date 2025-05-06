import { test, expect, Page, TestInfo } from '@playwright/test';
import { setupLoginTests } from '@pages/Login/suite_login';
import data from '@general/data';
import { waitTime } from '@general/constants';
import { LoginPage } from '@/Pages/Login/key_login';

// Allure configuration for test suite
test.beforeAll(() => {
    // Metadata for Allure Report
    process.env.ALLURE_PROJECT_NAME = "Driver Management Synapsis";
    process.env.ALLURE_ENVIRONMENT = process.env.ENV || 'staging';
    process.env.ALLURE_BROWSER = process.env.BROWSER || 'chromium';
    process.env.ALLURE_PLATFORM = process.platform;
    process.env.ALLURE_VERSION = "1.0.0";
});

// Wrapper function to manage Allure metadata
const allureReporter = {
    setMeta(testInfo: TestInfo, data: {feature?: string, epic?: string, story?: string, severity?: string, testId?: string, description?: string}) {
        testInfo.annotations.push({ type: 'feature', description: data.feature || 'Login' });
        testInfo.annotations.push({ type: 'epic', description: data.epic || 'Authentication' });
        testInfo.annotations.push({ type: 'story', description: data.story || 'Login' });
        testInfo.annotations.push({ type: 'severity', description: data.severity || 'normal' });
        if (data.testId) {
            testInfo.annotations.push({ type: 'testId', description: data.testId });
        }
        if (data.description) {
            testInfo.annotations.push({ type: 'description', description: data.description });
        }
    },
    async addAttachment(testInfo: TestInfo, name: string, content: Buffer, type: string) {
        await testInfo.attach(name, { body: content, contentType: type });
    },
    parameter(testInfo: TestInfo, name: string, value: string) {
        testInfo.annotations.push({ type: name, description: value });
    }
};

test.describe('[Login Feature] Login Authentication Tests', () => {
    let loginPage: LoginPage;

    test.beforeAll(async ({}) => {
        console.log('[Test Suite] Starting Login Test Suite');
    });

    test.beforeEach(async ({ page }) => {
        // Setup login page
        loginPage = await setupLoginTests(page);
    });

    const superadminTestCases = [
        {
            scenario: 'Login Authentication: Valid Superadmin successfully redirects to dashboard',
            credentials: data.LoginData.validDataSuperAdmin,
            expected: {
                isSuccess: true,
                urlPattern: new RegExp(`${data.LoginData.urlPatterns.adminDashboard}`),
                message: data.LoginData.successMessageLogin
            },
            allure: {
                severity: 'critical',
                story: 'Admin Login',
                testId: 'LOGIN-001'
            }
        },
        {
            scenario: 'Login Authentication: Invalid username displays error message',
            credentials: data.LoginData.invalidData,
            expected: {
                isSuccess: false,
                urlPattern: new RegExp(`${data.LoginData.urlPatterns.loginPage}`),
                message: data.LoginData.errorMessageLogin
            },
            allure: {
                severity: 'normal',
                story: 'Login Validation',
                testId: 'LOGIN-002'
            }
        },
        {
            scenario: 'Login Authentication: Empty username displays validation message',
            credentials: data.LoginData.emptyUserData,
            expected: {
                isSuccess: false,
                urlPattern: new RegExp(data.LoginData.urlPatterns.loginPage.replace('/', '')),
                isEmptyField: true,
                fieldName: 'username'
            },
            allure: {
                severity: 'normal',
                story: 'Form Validation',
                testId: 'LOGIN-003'
            }
        },
        {
            scenario: 'Login Authentication: Empty password displays validation message',
            credentials: data.LoginData.emptyPasswordData,
            expected: {
                isSuccess: false,
                urlPattern: new RegExp(data.LoginData.urlPatterns.loginPage.replace('/', '')),
                isEmptyField: true,
                fieldName: 'password'
            },
            allure: {
                severity: 'normal',
                story: 'Form Validation',
                testId: 'LOGIN-004'
            }
        },
        {
            scenario: 'Login Authentication: Correct username with wrong password displays error',
            credentials: data.LoginData.wrongPasswordData,
            expected: {
                isSuccess: false,
                urlPattern: new RegExp(data.LoginData.urlPatterns.loginPage.replace('/', '')),
                message: data.LoginData.errorMessageLogin
            },
            allure: {
                severity: 'normal',
                story: 'Login Validation',
                testId: 'LOGIN-005'
            }
        },
        {
            scenario: 'Login Authentication: Invalid username and password displays error',
            credentials: data.LoginData.wrongUserWrongPass,
            expected: {
                isSuccess: false,
                urlPattern: new RegExp(data.LoginData.urlPatterns.loginPage.replace('/', '')),
                message: data.LoginData.errorMessageLogin
            },
            allure: {
                severity: 'normal',
                story: 'Login Validation',
                testId: 'LOGIN-006'
            }
        }
    ];

    test.describe('Login Credentials Tests', () => {
        for (const testCase of superadminTestCases) {
            test(testCase.scenario, async ({ page }, testInfo) => {
                // Setup Allure metadata for this test case
                allureReporter.setMeta(testInfo, {
                    feature: 'Login',
                    severity: testCase.allure?.severity || 'normal',
                    story: testCase.allure?.story || 'Login',
                    testId: testCase.allure?.testId || '',
                    description: `
                        Login Test - ${testCase.scenario}
                        Credentials: ${JSON.stringify({
                            username: testCase.credentials.userName || '[empty]',
                            password: testCase.credentials.password ? '********' : '[empty]'
                        })}
                        Expected: ${JSON.stringify(testCase.expected)}
                    `
                });
                
                const { userName, password } = testCase.credentials;
                
                await test.step(`Filling credentials: ${userName || data.LoginData.emptyValuePlaceholder} / ${password ? data.LoginData.passwordMask : data.LoginData.emptyValuePlaceholder}`, async () => {
                    // Handle empty field validations using helper function
                    if (testCase.expected.isEmptyField) {
                        await loginPage.fillAndValidateEmptyField(
                            testCase.expected.fieldName,
                            userName,
                            password
                        );
                        return;
                    }
                    
                    await loginPage.loginWithCredentials(userName, password, !testCase.expected.isSuccess);
                });

                await test.step(`Verifying login result: ${testCase.scenario}`, async () => {
                    // Add screenshot as Allure attachment
                    const screenshot = await page.screenshot();
                    await testInfo.attach('Screenshot after login attempt', { body: screenshot, contentType: 'image/png' });
                    
                    // Handle validation for empty fields with helper function
                    if (testCase.expected.isEmptyField) {
                        const isValid = await loginPage.handleEmptyFieldValidation(testCase.expected.fieldName);
                        expect(isValid).toBeTruthy();
                        console.log(`[Validation] Empty ${testCase.expected.fieldName} field successfully validated`);
                        return;
                    }

                    if (testCase.expected.isSuccess) {
                        // For successful login, validate dashboard URL and success toast
                        await expect(page).toHaveURL(testCase.expected.urlPattern, { timeout: waitTime.MEDIUM });
                        const successText = await loginPage.getPopupSuccessMessageText();
                        console.log(`[Validation] Login successful with message: "${successText}"`);
                        expect(successText).toContain(testCase.expected.message);
                        
                        // Add current URL to Allure
                        allureReporter.parameter(testInfo, 'Redirected URL', page.url());
                    } else {
                        // For failed login, validate error toast and staying on login page
                        await expect(page).toHaveURL(testCase.expected.urlPattern, { timeout: waitTime.MEDIUM });
                        
                        const errorText = await loginPage.getPopupErrorMessageText();
                        console.log(`[Validation] Expected error message: "${testCase.expected.message}"`);
                        console.log(`[Validation] Actual error message: "${errorText}"`);
                        
                        // Add error message to Allure
                        allureReporter.parameter(testInfo, 'Error Message', errorText);
                        
                        // Use includes instead of exact match to handle partial match
                        expect(errorText).toContain(testCase.expected.message?.split(',')[0] || data.LoginData.errorMessageLogin);
                    }
                });
            });
        }
    });

    test.afterEach(async ({ page }, testInfo) => {
        // Add final test screenshot to Allure
        try {
            const screenshot = await page.screenshot();
            await testInfo.attach('Final screenshot', { body: screenshot, contentType: 'image/png' });
        } catch (error) {
            console.error('[Allure] Failed to take screenshot:', error);
        }
    });

    test.afterAll(async () => {
        console.log('[Test Suite] Login Test Suite completed.');
    });
});