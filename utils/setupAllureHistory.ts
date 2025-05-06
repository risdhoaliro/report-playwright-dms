import * as fs from 'fs';
import * as path from 'path';

/**
 * Script untuk membuat struktur history di allure-results
 * sebelum test dijalankan
 */

const allureResultsDir = path.resolve('./allure-results');
const historyDir = path.resolve('./allure-results/history');

console.log('[Allure] Setting up history directory for Allure report...');

// Buat direktori history di allure-results jika belum ada
if (!fs.existsSync(allureResultsDir)) {
    console.log(`[Allure] Creating results directory: ${allureResultsDir}`);
    fs.mkdirSync(allureResultsDir, { recursive: true });
}

if (!fs.existsSync(historyDir)) {
    console.log(`[Allure] Creating history directory: ${historyDir}`);
    fs.mkdirSync(historyDir, { recursive: true });
}

// Periksa apakah ada laporan sebelumnya dengan history
const prevHistoryDir = path.resolve('./allure-report/history');
if (fs.existsSync(prevHistoryDir)) {
    console.log(`[Allure] Previous history found at: ${prevHistoryDir}`);
    
    // Salin file-file history ke allure-results/history
    try {
        const historyFiles = fs.readdirSync(prevHistoryDir).filter(file => file.endsWith('.json'));
        console.log(`[Allure] Copying ${historyFiles.length} history files`);
        
        historyFiles.forEach(file => {
            const sourceFile = path.join(prevHistoryDir, file);
            const destFile = path.join(historyDir, file);
            fs.copyFileSync(sourceFile, destFile);
        });
        
        console.log('[Allure] History files copied successfully');
    } catch (error) {
        console.error('[Allure] Error copying history files:', error);
    }
} else {
    console.log('[Allure] No previous history found, this is expected for the first run');
    // Buat file kosong untuk history
    const historyFiles = [
        'categories-trend.json',
        'duration-trend.json',
        'history-trend.json',
        'history.json',
        'retry-trend.json'
    ];
    
    historyFiles.forEach(file => {
        const filePath = path.join(historyDir, file);
        if (!fs.existsSync(filePath)) {
            if (file === 'history.json') {
                fs.writeFileSync(filePath, '{}');
            } else {
                fs.writeFileSync(filePath, '[]');
            }
        }
    });
    
    console.log('[Allure] Empty history files created');
}

console.log('[Allure] History setup complete'); 