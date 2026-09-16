# 🎉 CakBro v2.0.0 — Release Notes Template

Copy-paste ini saat membuat Release di GitHub (jika tidak pakai auto-release).

---

**Judul Release:** `CakBro v2.0.0 — Safe Exam Browser Cross-Platform (Pakkar)`

**Tag:** `v2.0.0` — Target: `main`

**Deskripsi:**

## CakBro v2.0.0 — Safe Exam Browser Cross-Platform 🦾
> Konversi dari `CakBro.txt` AutoHotkey Windows-only → **Electron** untuk Windows, Linux, macOS, Chromebook. Logo Pakkar transparan.

### 📥 Download Siswa
| OS | File yang dibagikan |
|---|---|
| **Windows 10/11** | `CakBro-2.0.0-Portable.exe` (klik 2x langsung jalan, tanpa install) <br> *Alternatif:* `CakBro-2.0.0-x64-Setup.exe` (installer) |
| **Linux** | `CakBro-2.0.0-x64.AppImage` → `chmod +x CakBro*.AppImage && ./CakBro*.AppImage` <br> *atau* `CakBro-2.0.0-x64.deb` → `sudo apt install ./CakBro*.deb` |
| **macOS Intel** | `CakBro-2.0.0-x64.dmg` |
| **macOS Apple Silicon** | `CakBro-2.0.0-arm64.dmg` |
| **Chromebook** | **Paling mudah:** Buka Chrome → `https://ujikom.pakkar.my.id/2026/09/uji-kompetensi.html` → ⋮ → **Install app** (PWA fullscreen) <br> *Alternatif:* Aktifkan Linux di Chromebook → install `.deb` |

### ✨ Fitur (replikasi 100% AHK)
- Kiosk fullscreen `frame:false` + `alwaysOnTop` (taskbar/Dock tersembunyi)
- Blokir 60+ shortcut: Win, Alt+Tab, Ctrl+T/N/W, F1-F12, PrintScreen
- Blokir translate & notifikasi (flag Chromium + inject CSS)
- Bottom bar 42px: Logo Pakkar transparan | CakBro | Refresh | Supported by Pakkar | LOCKED | Jam
- Splash 2.5 detik
- Keluar: `Ctrl+Alt+Shift+Q` (Mac: `Cmd+Alt+Shift+Q`) → dialog konfirmasi

### 🖼️ Logo
Background **transparan** (bukan putih) — menyatu dengan tema gelap `#0d1117 / #1a1a2e`. File ikon: `assets/icon.png` (512 transparan), `assets/icon.ico`, `pwa/icon-512.png`.

### 🔧 Untuk Guru/Admin
Lihat `PANDUAN-SINGKAT.md` (bahasa Indonesia) di repo untuk cara build manual & via GitHub.

---
**Cara buat Release manual:**
1. Push tag: `git tag v2.0.0 && git push origin v2.0.0`
2. GitHub → **Releases** → **Draft a new release** → Choose tag `v2.0.0` → Title: `CakBro v2.0.0` → Paste deskripsi di atas → **Publish release**
3. Upload file dari `Actions → Artifacts` ke Release (atau biarkan auto-release dari workflow baru yang upload otomatis).

**Auto-release (recommended, baru):** Workflow `build.yml` yang baru sudah pakai `softprops/action-gh-release`. Begitu Anda `git push origin v2.0.0`, Release akan terbuat **otomatis** dengan semua file terbundel — tidak perlu upload manual.

---
URL Ujian hardcoded: `https://ujikom.pakkar.my.id/2026/09/uji-kompetensi.html`
