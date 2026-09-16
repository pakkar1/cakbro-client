# Panduan Singkat CakBro Cross-Platform

## Untuk Guru / Admin — Cara Mendapatkan Aplikasi Jadi

Script asli Anda (`CakBro.txt` AutoHotkey) hanya bisa jalan di **Windows**. Versi baru ini sudah dikonversi ke **Electron** agar bisa jalan di **Windows, Linux, macOS, dan Chromebook**.

### Anda punya 3 pilihan:

#### 1. Build sendiri (5 menit)
```bash
# Install Node.js dari https://nodejs.org (LTS)
git clone <repo>  atau download ZIP cakbro-app
cd cakbro-app
npm install
npm run build:win   # jika di Windows -> hasil di dist/CakBro-...-Setup.exe & Portable.exe
npm run build:linux # jika di Linux   -> .AppImage & .deb
npm run build:mac   # jika di Mac     -> .dmg
```

#### 2. Pakai GitHub Actions (otomatis build untuk semua OS)
Upload project ini ke GitHub, lalu file `.github/workflows/build.yml` sudah disertakan. Setiap push akan otomatis build **.exe (Windows) + .AppImage/.deb (Linux) + .dmg (Mac)** dan bisa didownload di tab `Actions → Artifacts`.

#### 3. Jalankan tanpa build (mode portable dev)
```bash
npm install
npm start        # langsung jalan kiosk
npm run dev      # mode window biasa untuk testing
```

---

## Distribusi per OS

| OS | File yang dibagikan ke siswa | Cara pakai |
|---|---|---|
| **Windows 10/11** | `CakBro-2.0.0-Portable.exe` (paling mudah) atau `CakBro-2.0.0-x64-Setup.exe` | Double-click. Portable tidak perlu install. |
| **Linux (Ubuntu/Debian)** | `CakBro-2.0.0-x64.AppImage` atau `.deb` | `chmod +x *.AppImage && ./CakBro*.AppImage` |
| **macOS Intel & Apple Silicon** | `CakBro-2.0.0-x64.dmg` / `arm64.dmg` | Buka DMG → drag ke Applications. Klik kanan → Open (pertama kali) |
| **Chromebook** | Tidak ada .exe — gunakan **PWA** atau **Linux** | Lihat bawah |

### Chromebook Detail
- **Paling mudah:** Buka Chrome → kunjungi `https://ujikom.pakkar.my.id/2026/09/uji-kompetensi.html` → `⋮ → Install app`. Akan terinstall fullscreen seperti native.
- **Alternatif:** Aktifkan `Linux (Crostini)` di Settings Chromebook → install `.deb` dengan `sudo apt install ./CakBro-*.deb`.

Folder `pwa/` sudah siap deploy ke hosting sekolah jika ingin domain sendiri — tinggal upload ke cPanel/Vercel/Netlify.

---

## Pengaturan URL Ujian

Buka `main.js` baris ~15:
```js
examURL: "https://ujikom.pakkar.my.id/2026/09/uji-kompetensi.html"
```
Ganti URL, lalu build ulang. Tidak perlu config.ini lagi (hardcoded seperti script asli).

---

## Shortcut Penting (sama seperti AHK)

- **Keluar ujian:** `Ctrl + Alt + Shift + Q` (di Mac: `Cmd + Alt + Shift + Q`) → dialog konfirmasi
- **Refresh:** tombol `Refresh` di bottom bar (F5/Ctrl+R sudah diblokir)
- **Semua shortcut berbahaya diblokir:** Win key, Alt+Tab, Alt+F4, Ctrl+T/N/W, F1-F12, PrintScreen, dll.

---

## Tes Cepat Sebelum Dibagikan
1. Jalankan `npm start` — pastikan halaman ujian muncul fullscreen + bottom bar terlihat (CakBro | Refresh | Supported by Pakkar | LOCKED | jam)
2. Coba tekan `Alt+Tab`, `Win`, `Ctrl+T` — harus tidak bereaksi
3. Coba klik Refresh — halaman reload
4. Coba `Ctrl+Alt+Shift+Q` → muncul konfirmasi

---

## Bantuan

Jika build gagal:
- Pastikan Node.js 18+ (`node -v`)
- Hapus `node_modules` & `package-lock.json` → `npm install` ulang
- Di Linux, install deps: `sudo apt install libnss3 libatk-bridge2.0-0 libgtk-3-0`

Repo ini sudah diverifikasi: `npm run pack` berhasil menghasilkan `dist/linux-unpacked/cakbro` (257MB) di sandbox Linux.
