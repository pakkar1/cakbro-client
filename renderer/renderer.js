// Renderer - Bottom bar logic & Splash
const clockEl = document.getElementById('clock');
const btnRefresh = document.getElementById('btnRefresh');
const btnExit = document.getElementById('btnExit');
const splash = document.getElementById('splash');
const splashVersion = document.getElementById('splashVersion');

async function init() {
  let cfg = null;
  try {
    cfg = await window.cakbro.getConfig();
  } catch {}
  window.cakbro.onConfig((c) => { cfg = c; updateSplash(c); });

  if (cfg) updateSplash(cfg);

  // Clock
  function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2,'0');
    const m = String(now.getMinutes()).padStart(2,'0');
    const s = String(now.getSeconds()).padStart(2,'0');
    clockEl.textContent = `${h}:${m}:${s}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // Splash auto hide 2.5s (mirror AHK Sleep 2500)
  setTimeout(() => {
    splash.classList.add('hidden');
  }, 2500);

  // Refresh
  btnRefresh.addEventListener('click', () => {
    btnRefresh.style.transform = 'scale(0.95)';
    setTimeout(()=> btnRefresh.style.transform='',150);
    window.cakbro.refresh();
  });

  // Exit
  btnExit.addEventListener('click', () => window.cakbro.exit());

  // Blokir right-click di shell (contentView sudah di-block di main)
  document.addEventListener('contextmenu', e => e.preventDefault());

  // Blokir shortcut di shell juga
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    // Izinkan exit combo
    if (e.ctrlKey && e.altKey && e.shiftKey && key === 'q') {
      e.preventDefault();
      window.cakbro.exit();
      return;
    }
    // Blokir F12, Ctrl+Shift+I, dll di shell
    if (key === 'f12' || key === 'f5' && e.ctrlKey || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(key))) {
      if (!window.location.search.includes('dev')) e.preventDefault();
    }
    if (e.altKey && key === 'f4') e.preventDefault();
  });
}

function updateSplash(cfg){
  if (splashVersion && cfg) {
    splashVersion.textContent = `v${cfg.version} — ${cfg.examURL.slice(0,40)}... — Powered by Electron Kiosk`;
  }
}

init();
