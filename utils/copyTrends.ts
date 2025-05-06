import * as fs from 'fs';
import * as path from 'path';

/**
 * Script untuk menyalin history trend dari run Allure sebelumnya
 * ke run saat ini, sehingga grafik trend dapat dipelihara antar run
 */

const historyDir = path.resolve('./allure-report/history');
const resultsHistoryDir = path.resolve('./allure-results/history');

console.log('[Allure] Menyalin data trend dari report sebelumnya ke report baru...');

// Buat direktori history di allure-results jika belum ada
if (!fs.existsSync(resultsHistoryDir)) {
    console.log(`[Allure] Membuat direktori history: ${resultsHistoryDir}`);
    fs.mkdirSync(resultsHistoryDir, { recursive: true });
}

// Cek apakah direktori history di allure-report ada
if (fs.existsSync(historyDir)) {
    console.log(`[Allure] Direktori history ditemukan: ${historyDir}`);
    
    // Salin semua file JSON history
    const historyFiles = fs.readdirSync(historyDir).filter(file => file.endsWith('.json'));
    console.log(`[Allure] Menyalin ${historyFiles.length} file history`);
    
    historyFiles.forEach(file => {
        const sourceFile = path.join(historyDir, file);
        const destFile = path.join(resultsHistoryDir, file);
        console.log(`[Allure] Menyalin ${file}...`);
        fs.copyFileSync(sourceFile, destFile);
    });
    
    console.log('[Allure] Penyalinan data trend selesai');
} else {
    console.warn('[Allure] Direktori history tidak ditemukan. Ini normal untuk run pertama.');
    console.warn('[Allure] Pada run kedua dan selanjutnya, trend data akan otomatis disalin.');
}

console.log('[Allure] Selesai.'); 