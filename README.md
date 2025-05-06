# Automation Testing Framework - Synapsis Driver Management

Framework otomasi testing untuk aplikasi Driver Management Synapsis menggunakan Playwright dengan TypeScript.

## Struktur Proyek

```
automation-drivermanagement-synapsis/
├── Fixtures/           # Base test & page classes
├── General/            # Constants, data models, utils 
├── Pages/              # Page Object Model files
│   └── Login/          # Login page elements & methods
│   └── Dashboard/      # Dashboard page elements & methods
│   └── forgotPassword/ # Forgot password page elements & methods
│   └── ...             # Page objects lainnya
├── Tests/              # Test files
├── utils/              # Utility functions
│   └── email-helper.ts # Email testing utility
│   └── allure-setup.ts # Allure reporting configuration
│   └── setupAllureHistory.ts # Allure history management
│   └── copyTrends.ts   # Allure trends data management
├── playwright-report/  # HTML test report
├── allure-results/     # Allure test results
├── allure-report/      # Generated Allure report
├── test-results/       # Screenshots, videos, traces
├── playwright.config.ts # Playwright configuration
└── package.json        # Project dependencies
```

## Prasyarat

- Node.js 16 atau lebih baru
- npm atau yarn
- Java (untuk menjalankan Allure report)

## Instalasi

```bash
# Clone repository
git clone <url_repository>
cd automation-drivermanagement-synapsis

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install
```

## Penggunaan

### Menjalankan Semua Test

```bash
npx playwright test
```

### Menjalankan Test pada Browser Tertentu

```bash
# Chrome
npx playwright test --project="Driver Monitoring System In Chrome"

# Firefox
npx playwright test --project="Driver Monitoring System In Firefox"

# Safari
npx playwright test --project="Driver Monitoring System In Safari"
```

### Menjalankan Test Spesifik

```bash
# Menjalankan test berdasarkan nama
npx playwright test -g "Password Recovery"

# Menjalankan test file tertentu
npx playwright test Tests/forgotPassword.test.ts

# Mode headed (dengan UI browser)
npx playwright test --headed
```

### Mode Debug

```bash
# Debug test dengan browser UI dan inspector
npx playwright test --debug

# UI Mode untuk debugging visual
npx playwright test --ui
```

### Melihat Laporan

```bash
# Laporan HTML
npx playwright show-report

# Generate dan melihat Laporan Allure
npx allure generate allure-results -o allure-report --clean
npx allure open allure-report

# Atau dalam satu perintah:
npx playwright test && npx allure generate allure-results -o allure-report --clean && npx allure open allure-report
```

### Generate Script dengan Codegen

```bash
npx playwright codegen
```

## Page Object Model

Framework ini menggunakan struktur Page Object Model dengan pemisahan:

1. **Elements (el_*.ts)** - Lokator elemen UI
   - Berisi seluruh lokator dan selector
   - Hindari logic disini, hanya definisi element

2. **Key Methods (key_*.ts)** - Metode interaksi dengan elemen
   - Berisi method untuk interaksi dengan page
   - Implementasi logic pengujian
   - Extend BasePage untuk reuse helper methods

3. **Test Suites (suite_*.ts)** - Fungsi setup untuk test suite
   - Berisi fungsi setup/teardown
   - Membantu reuse kode setup

## Pengembangan Test Case Baru

Untuk membuat test case baru:

1. Buat folder baru di `Pages/<NamaPage>/` jika belum ada
2. Buat 3 file:
   - `el_<namapage>.ts` - Definisi elemen
   - `key_<namapage>.ts` - Method interaksi
   - `suite_<namapage>.ts` - Setup functions

3. Buat file test di `Tests/<namapage>.test.ts`

## Best Practices

1. **Lokator yang Robust**
   - Gunakan data-testid (diutamakan)
   - Gunakan multiple selector untuk element yang sama
   - Prioritaskan: data-testid > id > role > text > css > xpath

2. **Error Handling**
   - Implementasikan retry mechanism untuk aksi tidak stabil
   - Berikan timeout yang reasonable
   - Log informasi pada setiap kegagalan

3. **Data Management**
   - Simpan test data di `General/data.json`
   - Jangan hardcode value dalam test
   - Gunakan faker untuk generate data

4. **Test Independence**
   - Setiap test harus berdiri sendiri
   - Gunakan beforeEach untuk setup ulang state

## Lingkungan

Framework mendukung multi-environment dengan konfigurasi di `playwright.config.ts`:

- Staging: https://dev-drivermanagement.synapsis.id
- Production: https://drivermanagement.synapsis.id

Gunakan variabel lingkungan `ENV` untuk memilih environment:

```bash
ENV=production npx playwright test
```

## Fitur Email Testing

Framework ini menggunakan MailSlurp untuk testing email seperti verifikasi reset password:

- Setup email testing di `utils/email-helper.ts`
- Konfigurasi email tetap di `General/data.json`
- Test case untuk email verification di `Tests/forgotPassword.test.ts`

## Penanganan Kesalahan

Framework dilengkapi dengan mekanisme retry dan timeout yang dapat dikonfigurasi di:
- `General/constants.ts` - Pengaturan timeout
- `General/data.json` - Konfigurasi retry 

## Allure Reporting

Framework terintegrasi dengan Allure Report untuk visualisasi hasil test:

1. Anotasi dan metadata test diatur di `Tests/*.test.ts`
2. Generate report dengan `npx allure generate allure-results -o allure-report --clean`
3. Buka report dengan `npx allure open allure-report`

## Kontribusi

1. Pastikan test berjalan di environment local
2. Pastikan tidak ada hardcoded value
3. Tambahkan dokumentasi/komentar pada kode yang kompleks
4. Gunakan format penamaan yang konsisten

## Kontak

Untuk pertanyaan atau informasi lebih lanjut, hubungi:
- Email: risdho@synapsis.id
- Repositori ini dikembangkan oleh Tim QA Synapsis 