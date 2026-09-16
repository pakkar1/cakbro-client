# CakBro - Safe Exam Browser v2.0 (Cross-Platform)

**Portable & Lightweight Kiosk Browser** — versi cross-platform dari script AutoHotkey `CakBro.txt`.  
Berjalan di **Windows, Linux, macOS, dan Chromebook** dari satu codebase.

> URL Ujian hardcoded: `https://ujikom.pakkar.my.id/2026/09/uji-kompetensi.html` (sesuai script asli)  
> Keluar: `CTRL + ALT + SHIFT + Q` → Konfirmasi → Exit

---

## ✨ Fitur (100% replikasi AutoHotkey)

| Fitur AHK | Implementasi Electron |
|---|---|
| Kiosk fullscreen tanpa UI browser (Edge>Chrome>Brave>Firefox) | `BrowserWindow` kiosk + `WebContentsView` Chromium embedded. Tidak butuh browser eksternal. |
| Blokir 60+ shortcut berbahaya | `before-input-event` + `globalShortcut` (Win, Alt+Tab, Ctrl+T/N/W, F1-F12, PrintScreen, dll) |
| Blokir translate popup & notifikasi Edge | `app.commandLine` disable translate + inject CSS `display:none` + blokir Notification/Geolocation API |
| Sembunyikan taskbar | `kiosk:true` + `alwaysOnTop: 'screen-saver'` + `frame:false` |
| Tutup aplikasi terlarang otomatis | Tidak relevan lintas OS, diganti blokir popup/window baru + focus enforcement |
| Auto-restart jika ditutup paksa | `render-process-gone` + interval `setKiosk(true)` + block `minimize`/`close` |
| Bottom bar: CakBro + Refresh + Clock | DOM bar 42px (`#1a1a2e` + `#00d4ff`) dengan jam realtime |
| Splash screen 2.5 detik | HTML/CSS splash animated |
| Keluar Ctrl+Alt+Shift+Q | `globalShortcut` + dialog konfirmasi |

---

## 📁 Struktur Project

```
cakbro-app/
├── main.js              # Proses utama Electron (kiosk, blocking, WebContentsView)
├── preload.js           # Bridge aman ke renderer
├── renderer/
│   ├── index.html       # Shell UI: splash + bottom bar
│   ├── style.css
│   └── renderer.js
├── assets/
│   ├── icon.png
│   └── installer.nsh
├── pwa/                 # Untuk Chromebook (PWA)
│   ├── manifest.json
│   ├── sw.js
│   └── index.html
├── package.json
└── README.md
```

---

## 🚀 Cara Menjalankan (Development)

### Prasyarat
- Node.js 18+ dan npm

### Install & Run

```bash
# 1. Masuk folder
cd cakbro-app

# 2. Install dependencies
npm install

# 3. Jalankan (mode kiosk)
npm start

# Mode development (window biasa, DevTools terbuka, bisa resize)
npm run dev
```

> Di mode dev (`--dev`), kiosk & alwaysOnTop dimatikan agar mudah debug.

---

## 📦 Cara Build Installer untuk Tiap OS

Build dilakukan dari OS masing-masing (atau via CI). Electron Builder akan menghasilkan file di folder `dist/`.

### Windows (dari Windows)
```bash
npm run build:win
# Output:
# dist/CakBro-2.0.0-x64-Setup.exe      (Installer NSIS)
# dist/CakBro-2.0.0-Portable.exe       (Portable - mirip AHK .exe)
```
- **Portable.exe** bisa langsung jalan tanpa install (paling mirip AHK standalone)
- Installer NSIS one-click

### Linux (dari Linux)
```bash
npm run build:linux
# Output:
# dist/CakBro-2.0.0-x64.AppImage      (Portable, tinggal chmod +x dan jalankan)
# dist/CakBro-2.0.0-x64.deb           (Debian/Ubuntu)
# dist/CakBro-2.0.0-x64.rpm           (Fedora/RHEL)
```
Cara pakai AppImage:
```bash
chmod +x CakBro-2.0.0-x64.AppImage
./CakBro-2.0.0-x64.AppImage
```

### macOS (dari Mac)
```bash
npm run build:mac
# Output:
# dist/CakBro-2.0.0-x64.dmg            (Intel)
# dist/CakBro-2.0.0-arm64.dmg          (Apple Silicon)
# dist/CakBro-2.0.0-x64.zip / arm64.zip
```
> DMG tinggal drag ke Applications. Karena tidak signed, pertama kali buka via `Klik kanan → Open`.

### Build All (butuh OS sesuai)
```bash
npm run build:all
```

### Build tanpa publish (cepat untuk test)
```bash
npm run pack
# menghasilkan dist/win-unpacked, linux-unpacked, mac/
```

---

## 💻 Chromebook — 3 Cara

Chromebook tidak bisa menjalankan `.exe` secara native, tapi ada 3 opsi resmi:

### Opsi A — PWA (Paling Mudah, Recommended)
1. Buka Chrome di Chromebook, kunjungi `https://ujikom.pakkar.my.id/2026/09/uji-kompetensi.html`
2. Klik `⋮ → Install app` / `Save as app` / `Install CakBro`
3. Atau deploy folder `pwa/` ke hosting Anda dan install dari sana — sudah include `manifest.json` dengan `display: fullscreen`.

Folder `pwa/` di project ini sudah siap deploy (static hosting). Manifest:
```json
{
  "name": "CakBro Safe Exam Browser",
  "display": "fullscreen",
  "start_url": "https://ujikom.pakkar.my.id/2026/09/uji-kompetensi.html"
}
```

### Opsi B — Linux Container (Crostini)
Chromebook modern mendukung Linux:
1. Aktifkan Linux di `Settings → Advanced → Developers → Linux development environment`
2. Download `CakBro-2.0.0-x64.deb` atau `.AppImage` hasil build Linux
3. Install:
```bash
sudo apt install ./CakBro-2.0.0-x64.deb
# atau
chmod +x CakBro-*.AppImage && ./CakBro-*.AppImage
```
App akan muncul di launcher ChromeOS sebagai aplikasi Linux.

### Opsi C — Chrome Extension Kiosk (Managed Chromebook)
Jika Chromebook dikelola sekolah (Google Admin), deploy sebagai Kiosk App via `chrome://extensions` dengan manifest kiosk (template ada di `pwa/`).

---

## ⚙️ Konfigurasi

Edit `main.js` bagian `CONFIG`:

```js
const CONFIG = {
  examURL: "https://ujikom.pakkar.my.id/2026/09/uji-kompetensi.html",
  appTitle: "CakBro",
  barHeight: 42,
  barColor: "#1a1a2e",
  language: "id"
};
```

Ganti `examURL` jika ada ujian berbeda, lalu rebuild.

---

## 🔒 Keamanan & Catatan Kiosk

- **Electron kiosk** sudah menyembunyikan taskbar/dock dan mencegah Alt+Tab di level app. Untuk sekuritas level OS penuh (blokir Task Manager, Ctrl+Alt+Del di Windows), jalankan dengan kebijakan OS:
  - Windows: Group Policy / Assigned Access
  - Linux: window manager kiosk (Openbox)
  - macOS: Single App Mode
- Right-click context menu sudah dimatikan total
- `PrintScreen` diblokir via shortcut + `before-input-event` (namun OS-level screenshot hardware tetap tidak bisa dicegah 100% tanpa driver)
- Semua popup/ window baru diblokir (`setWindowOpenHandler: deny`)

---

## 🛠 Troubleshooting

| Masalah | Solusi |
|---|---|
| `Browser tidak ditemukan` (di AHK) tidak relevan | Electron bawa Chromium sendiri, tidak butuh Edge/Chrome terinstall |
| Build gagal di Linux `cannot find icon` | Pastikan `assets/icon.png` 512x512 PNG ada |
| Kiosk tidak keluar | Pastikan tekan **Ctrl+Alt+Shift+Q** bersamaan (atau Cmd+Alt+Shift+Q di Mac) |
| Halaman ujian tidak load (X-Frame) | Tidak pakai iframe — pakai WebContentsView, jadi aman. Jika `ERR_FAILED`, cek internet |
| Chromebook .deb tidak install | Pastikan Linux container aktif dan file `.deb` di folder Linux, bukan Downloads ChromeOS |

---

## 📜 Lisensi

MIT — Bebas dipakai untuk sekolah/instansi. Credit: Pakkar.

---

## 🙏 Credit

Dikonversi dari `CakBro.txt` (AutoHotkey v1.1) ke Electron cross-platform. Semua warna, ukuran bar (42px), splash 2.5s, dan shortcut dipertahankan identik.
