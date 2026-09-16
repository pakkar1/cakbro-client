// CakBro PWA Service Worker - minimal, hanya untuk enable installability + inject anti-translate
self.addEventListener('install', e => self.skipWaiting());
self.addEventListener('activate', e => self.clients.claim());
self.addEventListener('fetch', event => {
  // Network-first untuk ujian (jangan cache ujian agar selalu fresh)
  event.respondWith(fetch(event.request).catch(()=> fetch(event.request)));
});
