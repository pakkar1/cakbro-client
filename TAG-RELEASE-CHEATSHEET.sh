#!/bin/bash
# Cheatsheet: buat tag v2.0.0 dan push → auto Release
# Jalankan di dalam folder cakbro-app setelah git push main pertama kali

set -e
echo "1. Pastikan sudah push main:"
echo "   git push -u origin main"
echo ""
echo "2. Buat tag v2.0.0:"
echo "   git tag -a v2.0.0 -m 'CakBro v2.0.0 - Pakkar transparan cross-platform'"
echo "   git push origin v2.0.0"
echo ""
echo "3. Atau satu baris:"
echo "   git tag v2.0.0 && git push origin v2.0.0"
echo ""
echo "4. Lihat di GitHub:"
echo "   - Tab Actions → workflow Build akan jalan (3 OS)"
echo "   - Setelah selesai → Tab Releases → v2.0.0 sudah ada otomatis dengan semua file!"

# Jika ingin update tag yang salah:
# git tag -d v2.0.0
# git push origin :refs/tags/v2.0.0
# git tag -a v2.0.0 -m 'fix'
# git push origin v2.0.0

