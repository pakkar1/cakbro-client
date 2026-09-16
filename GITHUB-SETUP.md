# Push ke GitHub — Auto Build Windows / Linux / macOS

File `.github/workflows/build.yml` sudah ada di Paket ZIP ini. Begitu Anda push ke GitHub, workflow akan **otomatis build untuk 3 OS sekaligus**.

## Langkah 1: Buat Repository di GitHub
1. Buka https://github.com/new
2. Repository name: `cakbro-safe-exam-browser` (atau `CakBro`)
3. Pilih **Public** (biar Actions gratis & Artifacts bisa didownload)
4. **JANGAN** centang "Initialize with README" — biar kosong
5. Klik **Create repository**

## Langkah 2: Push dari Laptop Anda
Ekstrak `CakBro-v2.0-Paket-Lengkap.zip`, lalu di dalam folder `cakbro-app`:

```bash
# Masuk folder
cd cakbro-app

# Init git (jika belum)
git init
git branch -M main

# Tambahkan remote (GANTI USERNAME)
git remote add origin https://github.com/USERNAME/cakbro-safe-exam-browser.git

# Add & commit
git add .
git commit -m "CakBro v2.0 - Electron cross-platform dengan logo Pakkar transparan"

# Push
git push -u origin main
```

> Ganti `USERNAME` dengan username GitHub Anda. Jika pakai SSH: `git@github.com:USERNAME/cakbro-safe-exam-browser.git`

## Langkah 3: Lihat Auto-Build
1. Buka repo di GitHub → tab **Actions**
2. Workflow `Build CakBro All Platforms` akan jalan (3 job: windows-latest, ubuntu-latest, macos-latest)
3. Tunggu ±5-10 menit
4. Klik workflow yang sukses → scroll ke bawah → **Artifacts**:
   - `CakBro-windows-latest` → berisi `CakBro-2.0.0-Setup.exe` + `CakBro-Portable.exe`
   - `CakBro-ubuntu-latest` → berisi `CakBro-2.0.0-x64.AppImage` + `.deb` + `.rpm`
   - `CakBro-macos-latest` → berisi `CakBro-2.0.0-x64.dmg` + `arm64.dmg` + `.zip`

Download Artifacts → bagikan ke siswa sesuai OS.

## Langkah 4: Buat Release (Opsional, Biar Rapi)
Supaya ada halaman Releases dengan file siap download permanen:

```bash
git tag v2.0.0
git push origin v2.0.0
```
Lalu di GitHub → **Releases** → **Create new release** → pilih tag `v2.0.0` → upload file dari Artifacts secara manual, atau biarkan Actions upload otomatis (bisa ditambah `softprops/action-gh-release`).

## Tips
- Jika build Windows gagal karena `icon.ico` transparent, workflow sudah pakai `assets/icon.ico` transparan yang valid.
- Untuk logo update berikutnya: ganti `assets/pakkar-logo.png` & `assets/icon.png`, commit & push lagi — Actions build ulang otomatis.
- File `PANDUAN-SINGKAT.md` & `README.md` sudah ada untuk guru/siswa.

## Struktur yang akan ter-push
```
cakbro-app/
├── .github/workflows/build.yml  # INI KUNCINYA — auto build 3 OS
├── assets/icon.png              # transparan
├── pwa/                         # untuk Chromebook
└── ... (semua source)
```

Selamat! Setelah ini Anda tidak perlu build manual di tiap OS lagi.
