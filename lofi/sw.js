// =====================================================================================
//  SERVICE WORKER — offline copy of the page (written to dist/sw.js by tools/build.mjs,
//  which stamps the build hash into CACHE, so every deploy gets a fresh cache).
//  · page: network first (4 s timeout), cached copy when offline
//  · icons/manifest: cache first
//  · anything else (status.json, the mp4, Open-Meteo and other origins): not touched
// =====================================================================================
const CACHE = 'homelab-live-5185bf48a83a';
const PAGE = 'index.html';   // homelab-live.html, or index.html in the public build
const FILES = [PAGE, 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('homelab-live-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

const timeout = (p, ms) => Promise.race([p, new Promise((_, no) => setTimeout(() => no(new Error('timeout')), ms))]);
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || url.pathname.endsWith('status.json')) return;
  if (req.mode === 'navigate') {
    e.respondWith(timeout(fetch(req), 4000).then(res => {
      if (res.ok && res.type === 'basic' && (url.pathname.endsWith(PAGE) || url.pathname.endsWith('/'))) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(PAGE, copy)); }
      return res;
    }).catch(() => caches.match(PAGE, { cacheName: CACHE }).then(r => r || caches.match(PAGE)).then(r => r || Response.error())));
    return;
  }
  if (FILES.includes(url.pathname.split('/').pop())) e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
