import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const allureResultsDir = path.resolve('./allure-results');

/**
 * Setup kategori untuk laporan Allure
 * Ini akan membantu mengkategorikan test berdasarkan status atau jenis kegagalan
 */
function setupCategories() {
    const categories = [
        // Kategori per Fitur
        {
            name: 'Login Feature',
            matchedStatuses: ['passed', 'failed', 'broken', 'skipped'],
            messageRegex: '.*login.*|.*Login.*|.*authentication.*|.*Authentication.*|.*credential.*',
        },
        {
            name: 'Dashboard Feature',
            matchedStatuses: ['passed', 'failed', 'broken', 'skipped'],
            messageRegex: '.*dashboard.*|.*Dashboard.*',
        },
        {
            name: 'Driver Management Feature',
            matchedStatuses: ['passed', 'failed', 'broken', 'skipped'],
            messageRegex: '.*driver.*management.*|.*Driver.*Management.*',
        },
        {
            name: 'Report Feature',
            matchedStatuses: ['passed', 'failed', 'broken', 'skipped'],
            messageRegex: '.*report.*|.*Report.*',
        },
        
        // Kategori status
        {
            name: 'Login Failed Tests',
            messageRegex: '.*[Ll]ogin.*failed.*',
            matchedStatuses: ['failed']
        },
        {
            name: 'Validation Tests',
            messageRegex: '.*[Vv]alidation.*|.*[Ee]mpty.*field.*',
            matchedStatuses: ['failed', 'broken', 'passed']
        },
        {
            name: 'Navigation Errors',
            messageRegex: '.*[Nn]avigation.*timeout.*|.*[Rr]edirect.*failed.*',
            matchedStatuses: ['broken']
        },
        {
            name: 'Element Errors',
            messageRegex: '.*[Ee]lement.*not.*found.*|.*[Ee]lement.*not.*visible.*',
            matchedStatuses: ['broken']
        },
        {
            name: 'Timeout Errors',
            messageRegex: '.*[Tt]imeout.*',
            matchedStatuses: ['broken']
        },
        {
            name: 'Unexpected Errors',
            matchedStatuses: ['broken'],
            messageRegex: '.*'
        },
        {
            name: 'Failed Tests',
            matchedStatuses: ['failed'],
            messageRegex: '.*'
        },
        {
            name: 'Passed Tests',
            matchedStatuses: ['passed'],
            messageRegex: '.*'
        },
        {
            name: 'Skipped Tests',
            matchedStatuses: ['skipped'],
            traceRegex: '.*'
        }
    ];

    fs.writeFileSync(
        path.join(allureResultsDir, 'categories.json'),
        JSON.stringify(categories, null, 2)
    );
    console.log('[Allure] Kategori berhasil dibuat');
}

/**
 * Setup environment properties untuk laporan Allure
 */
function setupEnvironment() {
    const env = {
        'Browser': process.env.BROWSER || 'chromium',
        'Browser.Version': process.env.BROWSER_VERSION || 'latest',
        'Environment': process.env.ENV || 'staging',
        'Platform': os.platform(),
        'Node.Version': process.version,
        'Base URL': process.env.BASE_URL || 'https://dev-drivermanagement.synapsis.id',
        'Test User': process.env.TEST_USER || 'qaautomation',
        'Test Date': new Date().toISOString()
    };

    // Simpan sebagai properties file (format key=value)
    const envProperties = Object.entries(env)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(
        path.join(allureResultsDir, 'environment.properties'),
        envProperties
    );
    console.log('[Allure] Environment properties berhasil dibuat');
}

/**
 * Setup executor info untuk laporan Allure
 */
function setupExecutor() {
    const executor = {
        name: os.userInfo().username,
        type: 'local',
        buildName: `Build-${new Date().toISOString().split('T')[0]}`,
        buildOrder: Date.now(),
    };

    fs.writeFileSync(
        path.join(allureResultsDir, 'executor.json'),
        JSON.stringify(executor, null, 2)
    );
    console.log('[Allure] Executor info berhasil dibuat');
}

// Pastikan direktori allure-results ada
if (!fs.existsSync(allureResultsDir)) {
    fs.mkdirSync(allureResultsDir, { recursive: true });
}

// Setup semua konfigurasi
setupCategories();
setupEnvironment();
setupExecutor();

console.log('[Allure] Setup selesai. Jalankan test dengan reporter allure-playwright untuk menghasilkan laporan.'); 