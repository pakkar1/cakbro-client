/**
 * CakBro - Safe Exam Browser v2.0
 * Cross-Platform Kiosk Browser (Electron)
 * Windows / Linux / macOS / Chromebook (via Linux container + PWA)
 * 
 * Fitur replikasi dari script AutoHotkey:
 *  - Kiosk fullscreen tanpa UI browser
 *  - Blokir 60+ shortcut berbahaya
 *  - Blokir translate & notifikasi
 *  - Bottom bar: CakBro label + Refresh + Clock + LOCKED
 *  - Keluar: CTRL+ALT+SHIFT+Q
 *  - Auto-reload safety, anti-minimize, always-on-top
 */

const { app, BrowserWindow, BrowserView, WebContentsView, globalShortcut, dialog, ipcMain, screen, shell } = require('electron');
const path = require('path');

// ============ KONFIGURASI (mirror AHK globals) ============
const CONFIG = {
  examURL: "https://ujikom.pakkar.my.id/2026/09/uji-kompetensi.html",
  appTitle: "CakBro",
  version: "2.0.0",
  barHeight: 42,
  barColor: "#1a1a2e",
  barTextColor: "#00d4ff",
  isDev: process.argv.includes('--dev'),
  language: "id"
};

let mainWindow = null;
let contentView = null; // WebContentsView untuk konten ujian
let isExiting = false;

// ============ COMMAND LINE FLAGS (blokir translate & popup) ============
// Harus sebelum app.whenReady()
app.commandLine.appendSwitch('lang', CONFIG.language);
app.commandLine.appendSwitch('accept-lang', CONFIG.language);
app.commandLine.appendSwitch('disable-translate');
app.commandLine.appendSwitch('disable-features', [
  'Translate',
  'TranslateUI',
  'AutofillServerCommunication',
  'OverlayScrollbar',
  'MediaRouter',
  'DialMediaRouteProvider',
  // Edge-specific (diabaikan jika bukan Edge, aman)
  'msTranslateCompactMenu',
  'msEdgeSidebarV2',
  'msEdgeDiscoverBar',
  'msEdgeMoveToDesktop',
  'msEdgeShoppingUI',
  'msEdgeSplitWindow',
  'msEdgeDropUI',
  'msEdgeMathSolver',
  'msEdgeCopilot',
  'msEdgeCouponDetector',
  'msEdgeReadAloud',
  'msSmartScreenProtection',
  'msEdgeCollections',
  'msEdgeShare',
  'msEdgeWebCapture',
  'msEdgeWorkspaces',
  'msEdgeEnhancedSecurityMode',
  'msImplicitSignin',
  'msEdgeAutoImport',
  'msEnableTranslatePageContextMenu',
  'msEdgeHubAppHost',
  'msEdgeOnRamp',
  'msCompactTranslate'
].join(','));

app.commandLine.appendSwitch('disable-notifications');
app.commandLine.appendSwitch('disable-popup-blocking', 'false'); // we want to block popups via code
app.commandLine.appendSwitch('no-first-run');
app.commandLine.appendSwitch('disable-infobars');
app.commandLine.appendSwitch('disable-extensions');
app.commandLine.appendSwitch('disable-component-update');
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-sync');
app.commandLine.appendSwitch('disable-client-side-phishing-detection');
app.commandLine.appendSwitch('disable-domain-reliability');
app.commandLine.appendSwitch('disable-hang-monitor');
app.commandLine.appendSwitch('disable-prompt-on-repost');
app.commandLine.appendSwitch('disable-session-crashed-bubble');
app.commandLine.appendSwitch('disable-offer-store-unmasked-wallet-cards');
app.commandLine.appendSwitch('disable-offer-upload-credit-cards');
app.commandLine.appendSwitch('disable-save-password-bubble');
app.commandLine.appendSwitch('disable-single-click-autofill');
app.commandLine.appendSwitch('password-store', 'basic');
app.commandLine.appendSwitch('disable-breakpad');
app.commandLine.appendSwitch('metrics-recording-only');
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

// ============ SINGLE INSTANCE LOCK ============
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// ============ CREATE WINDOW ============
function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenW, height: screenH } = primaryDisplay.workAreaSize;
  const fullSize = primaryDisplay.size;

  // Untuk kiosk, gunakan size penuh layar
  const winBounds = {
    width: fullSize.width,
    height: fullSize.height,
    x: 0,
    y: 0
  };

  mainWindow = new BrowserWindow({
    ...winBounds,
    title: CONFIG.appTitle + " - Safe Exam Browser v" + CONFIG.version,
    icon: path.join(__dirname, 'assets', 'icon.png'),
    kiosk: !CONFIG.isDev, // fullscreen kiosk (sembunyikan taskbar/dock)
    fullscreen: !CONFIG.isDev,
    frame: false, // tanpa titlebar/border (mirror AHK WinSet Style)
    alwaysOnTop: !CONFIG.isDev,
    skipTaskbar: false,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    closable: true,
    focusable: true,
    fullscreenable: true,
    backgroundColor: CONFIG.barColor,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webviewTag: false
    },
    show: false // tampilkan setelah ready, untuk splash effect
  });

  // Load renderer (UI shell: splash + bottom bar)
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  // --- WebContentsView untuk konten ujian (menggantikan BrowserPID di AHK) ---
  // WebContentsView adalah API modern Electron 30+ (pengganti BrowserView)
  const ViewClass = WebContentsView || BrowserView;
  const isWebContentsView = ViewClass === WebContentsView;

  contentView = new ViewClass({
    webPreferences: {
      // Isolasi session khusus ujian (mirror CakBroProfile di AHK)
      partition: 'persist:cakbro-exam',
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Matikan fitur mengganggu
      spellcheck: false,
      enableWebSQL: false,
      // Blokir translate via preferences sudah via command line
    }
  });

  // Attach view ke window
  if (isWebContentsView) {
    mainWindow.contentView.addChildView(contentView);
  } else {
    mainWindow.setBrowserView(contentView);
  }

  // Atur bounds: atas layar sampai barHeight dari bawah
  function updateContentBounds() {
    const bounds = mainWindow.getBounds();
    const contentBounds = {
      x: 0,
      y: 0,
      width: bounds.width,
      height: bounds.height - CONFIG.barHeight
    };
    if (isWebContentsView) {
      contentView.setBounds(contentBounds);
    } else {
      contentView.setBounds(contentBounds);
    }
  }

  // Load URL ujian
  contentView.webContents.loadURL(CONFIG.examURL);

  // --- Event: window ready ---
  mainWindow.once('ready-to-show', () => {
    updateContentBounds();
    if (CONFIG.isDev) {
      mainWindow.show();
      // Di dev mode, jangan kiosk agar bisa debug
    } else {
      mainWindow.show();
      mainWindow.setKiosk(true);
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.focus();
    }
    // Kirim config ke renderer untuk splash
    mainWindow.webContents.send('cakbro:config', CONFIG);
  });

  mainWindow.on('resize', updateContentBounds);
  mainWindow.on('enter-full-screen', updateContentBounds);
  mainWindow.on('leave-full-screen', () => {
    if (!CONFIG.isDev && !isExiting) {
      mainWindow.setKiosk(true);
    }
  });

  // ============ BLOKIR SHORTCUT BERBAHAYA (mirror SetupBlocking AHK) ============
  // Intercept sebelum input diproses
  const blockedAccelerators = new Set([
    // Windows keys handled via globalShortcut
  ]);

  contentView.webContents.on('before-input-event', (event, input) => {
    // Izinkan ketik normal di dalam halaman (huruf/angka) tanpa modifier
    // Blokir hanya kombinasi berbahaya

    const key = input.key.toLowerCase();
    const ctrl = input.control;
    const alt = input.alt;
    const shift = input.shift;
    const meta = input.meta; // Cmd di Mac, Win di Windows

    // ---- EXIT COMBINATION: Ctrl+Alt+Shift+Q (harus boleh) ----
    if (ctrl && alt && shift && key === 'q') {
      // Jangan block, biarkan globalShortcut handle
      return;
    }

    // ---- Blokir Meta/Win key apapun ----
    if (meta) {
      event.preventDefault();
      return;
    }

    // ---- Alt combinations ----
    if (alt) {
      // Alt+Tab, Alt+F4, Alt+Escape, Alt+Space, Alt+F8
      if (['tab', 'f4', 'escape', ' ', 'f8'].includes(key)) {
        event.preventDefault();
        return;
      }
      // Alt + angka/printscreen tidak perlu, tapi block semua Alt yang bukan untuk input
      // Kecuali AltGr (Ctrl+Alt) untuk karakter tertentu, jadi hati-hati
      // Kita block Alt+Tab/F4/Escape/Space saja, sisanya biarkan jika tidak ctrl
      if (key === 'printscreen') {
        event.preventDefault();
        return;
      }
    }

    // ---- Ctrl combinations (browser shortcuts) ----
    if (ctrl) {
      const blockedCtrl = [
        't', // new tab
        'n', // new window
        'w', // close tab
        'l', // address bar
        'd', // bookmark
        'h', // history
        'j', // downloads
        'u', // view source
        'p', // print
        'o', // open
        's', // save
        'g', // find?
        'k', // search
        'e', // search
        'r', // reload? kita blokir Ctrl+R tapi izinkan F5 via button
        'tab', // next tab
        'f5', // hard reload
        'escape'
      ];
      // Ctrl+Shift combinations
      if (shift) {
        const blockedCtrlShift = ['n', 'w', 'i', 'j', 'c', 'delete', 'tab', 't', 's', 'p'];
        if (blockedCtrlShift.includes(key)) {
          event.preventDefault();
          return;
        }
      }
      if (blockedCtrl.includes(key)) {
        event.preventDefault();
        return;
      }
      // Ctrl+Esc, Ctrl+Alt+Del, Ctrl+Shift+Esc
      if (key === 'escape' || key === 'delete') {
        event.preventDefault();
        return;
      }
    }

    // ---- Ctrl+Shift varian lain ----
    if (ctrl && shift && key === 'escape') { event.preventDefault(); return; }

    // ---- Function keys ----
    const blockedF = ['f1', 'f3', 'f6', 'f7', 'f10', 'f11', 'f12'];
    if (blockedF.includes(key)) {
      event.preventDefault();
      return;
    }

    // ---- PrintScreen ----
    if (key === 'printscreen' || input.code === 'PrintScreen') {
      event.preventDefault();
      return;
    }

    // ---- Context menu key ----
    if (key === 'contextmenu' || input.code === 'ContextMenu') {
      event.preventDefault();
      return;
    }

    // ---- Alt+F4 sudah di atas, tapi juga cek ----
    if (alt && key === 'f4') { event.preventDefault(); return; }
  });

  // Blokir right-click context menu
  contentView.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  // Blokir new window / popup -> tetap di view yang sama atau block
  contentView.webContents.setWindowOpenHandler(({ url }) => {
    // Blokir popup, tapi izinkan navigasi internal di view yang sama
    // Jika url sama domain ujian, load di view yang sama
    // Jika tidak, block dan optionally buka di external (tapi untuk ujian, block saja)
    console.log('[CakBro] Blocked popup:', url);
    // Untuk keamanan ujian, jangan buka popup sama sekali
    // Jika ingin izinkan navigasi, uncomment:
    // contentView.webContents.loadURL(url);
    return { action: 'deny' };
  });

  // Blokir navigasi ke devtools
  contentView.webContents.on('devtools-opened', () => {
    if (!CONFIG.isDev) contentView.webContents.closeDevTools();
  });

  // Inject CSS/JS untuk blokir translate bar & matikan notifikasi
  contentView.webContents.on('did-finish-load', () => {
    // Best-effort: hapus elemen translate bar jika muncul
    contentView.webContents.executeJavaScript(`
      (function(){
        try {
          // Hapus translate bar Google/Edge
          const selectors = [
            'div[role=\"dialog\"]', 
            '.translate-popup',
            '[class*=\"translate\"]',
            'goog-te-banner-frame',
            '#goog-gt-tt'
          ];
          // Sembunyikan banner translate
          const style = document.createElement('style');
          style.textContent = \`
            .goog-te-banner-frame, #goog-gt-tt, .goog-te-balloon-frame,
            [class*=\"translate\"], [id*=\"translate\"] { display:none !important; visibility:hidden !important; }
            .skiptranslate { display:none !important; }
          \`;
          document.head && document.head.appendChild(style);
          // Hapus attribute translate
          document.documentElement.setAttribute('translate','no');
          document.body && document.body.setAttribute('translate','no');
          
          // Blokir Notification API
          if (window.Notification) {
            window.Notification.requestPermission = () => Promise.resolve('denied');
          }
          // Blokir geolocation
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition = (s,e) => e && e({code:1, message:'Blocked'});
            navigator.geolocation.watchPosition = () => {};
          }
          // Blokir alert/confirm yang mengganggu? Jangan, biarkan tapi log
          console.log('[CakBro] Anti-translate & anti-notification injected');
        } catch(e){}
      })();
    `, true).catch(()=>{});

    // Pastikan bounds benar setelah load
    updateContentBounds();
  });

  // Handle crash/reload: auto-restart (mirror SecurityCheck AHK)
  contentView.webContents.on('render-process-gone', (event, details) => {
    console.warn('[CakBro] Render process gone:', details);
    if (!isExiting) {
      setTimeout(() => {
        if (contentView && !isExiting) contentView.webContents.reload();
      }, 800);
    }
  });

  contentView.webContents.on('did-fail-load', (event, code, desc, validatedURL) => {
    console.warn('[CakBro] Fail load', code, desc, validatedURL);
    // Tampilkan error di view dengan retry
    if (code !== -3) { // -3 = ERR_ABORTED (biasa saat redirect)
      contentView.webContents.executeJavaScript(`
        document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#0d1117;color:#00d4ff;font-family:Segoe UI,system-ui;padding:40px;text-align:center"><h1 style="font-size:32px;margin-bottom:12px">CakBro</h1><p style="color:#ccc;margin-bottom:8px">Gagal memuat halaman ujian</p><p style="color:#888;font-size:13px;margin-bottom:24px">${validatedURL}<br/>Error: ${desc} (${code})</p><button onclick="location.reload()" style="background:#0f3460;color:#fff;border:none;padding:12px 28px;border-radius:8px;cursor:pointer;font-size:14px">Coba Lagi (Refresh)</button><p style="color:#555;font-size:11px;margin-top:20px">Jika terus gagal, periksa koneksi internet</p></div>';
      `).catch(()=>{});
    }
  });

  // ============ SECURITY: BLOCK WINDOW CLOSE/MINIMIZE ============
  mainWindow.on('minimize', (e) => {
    if (!CONFIG.isDev && !isExiting) {
      e.preventDefault();
      mainWindow.restore();
      mainWindow.focus();
    }
  });

  mainWindow.on('close', (e) => {
    if (!isExiting && !CONFIG.isDev) {
      // Cegah close via Alt+F4 / X, paksa via Ctrl+Alt+Shift+Q
      e.preventDefault();
      triggerExit();
    }
  });

  // ============ GLOBAL SHORTCUTS (mirror Hotkey BlockedKey) ============
  // Daftarkan semua shortcut berbahaya sebagai global untuk di-block
  const blockedGlobal = [
    // Win keys (di Windows, 'Super' adalah Win)
    'Super+D', 'Super+E', 'Super+R', 'Super+L', 'Super+Tab',
    'Super+M', 'Super+Shift+M', 'Super+B', 'Super+I', 'Super+S',
    'Super+A', 'Super+X', 'Super+P', 'Super+K', 'Super+G', 'Super+H',
    'Super+U', 'Super+V', 'Super+W', 'Super+Q', 'Super+Period', 'Super+Semicolon', 'Super+C',
    'Alt+Tab', 'Alt+F4', 'Alt+Escape', 'Alt+Space', 'Alt+F8',
    'Control+Escape', 'Control+Shift+Escape', 'Control+Alt+Delete',
    'Control+T', 'Control+N', 'Control+Shift+N', 'Control+W', 'Control+Shift+W',
    'Control+L', 'Control+D', 'Control+H', 'Control+J', 'Control+Shift+I',
    'Control+Shift+J', 'Control+Shift+C', 'Control+U', 'Control+P', 'Control+O',
    'Control+S', 'Control+G', 'Control+Shift+Delete', 'Control+Tab', 'Control+Shift+Tab',
    'F1', 'F3', 'F6', 'F7', 'F10', 'F11', 'F12', 'PrintScreen', 'Alt+PrintScreen', 'Control+PrintScreen',
    'Super+Shift+S', 'Super+PrintScreen'
  ];

  // Register blocked shortcuts (best-effort, beberapa OS menolak)
  blockedGlobal.forEach(acc => {
    try {
      const ok = globalShortcut.register(acc, () => {
        // Do nothing -> blocked
        console.log('[CakBro] Blocked global:', acc);
      });
      if (!ok) console.log('[CakBro] Failed to register block:', acc);
    } catch (e) {}
  });

  // Exit shortcut: Ctrl+Alt+Shift+Q (handle global)
  globalShortcut.register('Control+Alt+Shift+Q', () => {
    triggerExit();
  });
  // Mac: Cmd+Alt+Shift+Q juga
  globalShortcut.register('Command+Alt+Shift+Q', () => {
    triggerExit();
  });

  // IPC dari renderer: refresh & triggerExit
  ipcMain.on('cakbro:refresh', () => {
    if (contentView) {
      contentView.webContents.reload();
      // Alternatif: send F5
      // contentView.webContents.sendInputEvent({type:'keyDown', keyCode:'F5'});
    }
  });

  ipcMain.on('cakbro:exit', () => {
    triggerExit();
  });

  ipcMain.handle('cakbro:get-config', () => CONFIG);

  // Focus keep timer (mirror KeepFocus + SecurityCheck AHK)
  setInterval(() => {
    if (isExiting || CONFIG.isDev || !mainWindow) return;
    // Pastikan kiosk & alwaysOnTop tetap
    if (!mainWindow.isKiosk()) mainWindow.setKiosk(true);
    if (!mainWindow.isAlwaysOnTop()) mainWindow.setAlwaysOnTop(true, 'screen-saver');
    // Pastikan tidak minimize
    if (mainWindow.isMinimized()) mainWindow.restore();
    // Pastikan bounds benar
    updateContentBounds();
  }, 500);

  // Hide taskbar simulation: kiosk sudah handle. Untuk Windows extra, kita set alwaysOnTop screen-saver level.

  // DevTools di dev mode saja
  if (CONFIG.isDev) {
    contentView.webContents.openDevTools({ mode: 'detach' });
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  }
}

function triggerExit() {
  if (isExiting) return;
  isExiting = true;

  // Keluar dari kiosk sementara agar dialog terlihat (mirror AHK AlwaysOnTop Off)
  if (mainWindow) {
    mainWindow.setAlwaysOnTop(false);
    mainWindow.setKiosk(false);
  }

  const choice = dialog.showMessageBoxSync(mainWindow, {
    type: 'question',
    buttons: ['Ya, Keluar', 'Batal'],
    defaultId: 1,
    cancelId: 1,
    title: 'CakBro - Konfirmasi Keluar',
    message: 'Apakah Anda yakin ingin keluar dari Safe Exam Browser?',
    detail: 'Tekan [Ya, Keluar] untuk keluar dari ujian. Semua progres yang belum disimpan mungkin hilang.',
    noLink: true,
    normalizeAccessKeys: true
  });

  if (choice === 0) {
    // Ya - cleanup & quit
    isExiting = true;
    globalShortcut.unregisterAll();
    app.quit();
  } else {
    // Batal - kembalikan kiosk
    isExiting = false;
    if (mainWindow) {
      mainWindow.setKiosk(!CONFIG.isDev);
      if (!CONFIG.isDev) mainWindow.setAlwaysOnTop(true, 'screen-saver');
      mainWindow.focus();
      // Focus ke contentView
      if (contentView) contentView.webContents.focus();
    }
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  globalShortcut.unregisterAll();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// Anti- Alt+F4 etc di OS level extra
app.on('browser-window-created', (e, win) => {
  win.webContents.on('before-input-event', (event, input) => {
    if (input.alt && input.key.toLowerCase() === 'f4') {
      event.preventDefault();
    }
  });
});

// Security: nonaktifkan navigasi luar
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (e, url) => {
    // Izinkan hanya navigasi di contentView, block di mainWindow
    if (contents === mainWindow?.webContents) {
      // mainWindow hanya untuk UI shell, jangan navigasi
      if (!url.startsWith('file://')) e.preventDefault();
    }
  });
});
