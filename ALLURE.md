# Panduan Penggunaan Allure Report

Allure Report adalah alat visualisasi laporan hasil pengujian yang kuat dan interaktif. Framework ini mengintegrasikan Allure untuk memberikan laporan hasil pengujian yang lebih informatif.

## Prasyarat

Pastikan Allure Command Line sudah terinstal:

```bash
npm run install:allure
```

Ini akan menginstal Allure Command Line secara global di sistem Anda.

## Menjalankan Test dengan Allure Reporter

Untuk menjalankan test dengan Allure reporter:

```bash
# Menjalankan semua test dengan laporan Allure
npm run test:allure

# Menjalankan test login saja dengan laporan Allure
npm run test:login:allure
```

Perintah ini akan secara otomatis menyiapkan direktori history sebelum menjalankan test.

## Menghasilkan dan Melihat Laporan Allure

Setelah menjalankan test, hasilnya akan disimpan di direktori `allure-results`. Untuk menghasilkan laporan visual dan membukanya di browser:

```bash
# Generate dan lihat laporan dasar
npm run report:allure

# Generate dan lihat laporan dengan data trend
npm run report:allure:trends

# Generate dan lihat laporan lengkap (dengan port khusus)
npm run report:allure:full
```

## Fitur Laporan yang Diimplementasikan

Laporan Allure yang diimplementasikan mencakup:

1. **Kategori**: Test dikelompokkan berdasarkan jenis error/failure
2. **Trend**: Menampilkan trend hasil pengujian dari waktu ke waktu
3. **Environment Info**: Informasi tentang lingkungan pengujian
4. **Executor**: Informasi tentang siapa/apa yang menjalankan test
5. **Attachment**: Screenshot, trace, dan logs untuk memudahkan debugging
6. **Metadata per Test**: Informasi detail tentang setiap test case

## Struktur Allure yang Diimplementasikan

Framework ini menggunakan beberapa file konfigurasi Allure:

- `utils/allure-setup.ts`: Menyiapkan kategori, environment, dan executor
- `utils/setupAllureHistory.ts`: Menyiapkan history untuk trend data
- `utils/copyTrends.ts`: Menyalin trend data dari laporan sebelumnya

## Custom Scripts

### Setup Allure

```bash
npm run allure:setup
```

Script ini akan menyiapkan:
- File categories.json untuk kategorisasi test
- File environment.properties untuk informasi lingkungan
- File executor.json untuk informasi executor

### Setup History

```bash
npm run allure:history
```

Script ini akan menyiapkan direktori history dan menyalin data dari laporan sebelumnya (jika ada).

### Membersihkan Laporan

```bash
npm run report:clean
```

Script ini akan menghapus direktori `allure-results` dan `allure-report`.

## Tips untuk Laporan Allure yang Baik

1. **Gunakan TestInfo untuk Metadata**:
   ```typescript
   testInfo.annotations.push({ type: 'feature', description: 'Login' });
   testInfo.annotations.push({ type: 'severity', description: 'critical' });
   ```

2. **Tambahkan Attachments untuk Debugging**:
   ```typescript
   await testInfo.attach('screenshot', { body: buffer, contentType: 'image/png' });
   ```

3. **Kelompokkan Langkah dengan test.step()**:
   ```typescript
   await test.step('Login dengan kredensial valid', async () => {
     // Kode login
   });
   ```

4. **Gunakan Naming Convention yang Konsisten**:
   Gunakan format penamaan yang konsisten untuk test case agar laporan lebih mudah dibaca.

## Pemecahan Masalah Umum

### Laporan Tidak Menampilkan Trend

Pastikan:
- Sudah ada laporan sebelumnya di `allure-report/history`
- Script `npm run report:allure:trends` digunakan untuk generate laporan

### Kategori Tidak Muncul

Pastikan:
- File `categories.json` sudah benar format-nya
- Ada test yang sesuai dengan kriteria kategori

### Environment Information Kosong

Pastikan:
- File `environment.properties` ada di `allure-results`
- Format file adalah `key=value` per baris

## Referensi

- [Dokumentasi Resmi Allure](https://docs.qameta.io/allure/)
- [Allure-Playwright](https://github.com/allure-framework/allure-js/tree/master/packages/allure-playwright) 