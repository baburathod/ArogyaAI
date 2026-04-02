/* ============================================================
   sw.js — ArogyaAI Service Worker
   Enables true offline functionality (PWA)
   Caches all app assets on first load
   Team Codecure26 | ArogyaAI | SPIRIT'26
   ============================================================ */

const CACHE_NAME = 'arogyaai-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/js/languages.js',
  '/js/voice.js',
  '/js/diagnosis.js',
  '/js/hospitals.js',
  '/js/vitals.js',
  '/js/medicine.js',
  '/js/history.js',
  '/js/doctor.js',
  '/js/privacy.js',
];

// ── Install: cache all assets ─────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ── Activate: clean old caches ────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Fetch: serve from cache, fallback to network ──────────────
self.addEventListener('fetch', event => {
  // Don't intercept Anthropic API calls — they need network
  if (event.request.url.includes('anthropic.com')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Cache new valid responses
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback — return cached index.html for navigation
        if (event.request.mode === 'navigate') return caches.match('/index.html');
      });
    })
  );
});

