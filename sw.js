const CACHE = 'suiwind-calendar-v415';
const FONT_CACHE = 'suiwind-fonts-v414';
const CORE = [
  './',
  './index.html',
  './styles.css?v=414',
  './app-data.js?v=414',
  './app.js?v=415',
  './wealth-core.js?v=415',
  './wealth-book.js?v=415',
  './wealth-book.css?v=415',
  './supabase-local.js?v=414',
  './bazi-hepan.js?v=414',
  './bazi-hepan-v5.html?v=411',
  './xiaoliuren.js?v=414',
  './matrix-page.js?v=414',
  './matrix-workbench.html',
  './matrix-workbench.css?v=414',
  './matrix-workbench.js?v=414',
  './manifest.json',
  './favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  const keep = new Set([CACHE, FONT_CACHE]);
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => !keep.has(key)).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (url.origin === 'https://cdn.jsdelivr.net') {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(event.request).then(hit => hit || fetch(event.request).then(response => {
          if (response && (response.ok || response.type === 'opaque')) {
            cache.put(event.request, response.clone()).catch(() => {});
          }
          return response;
        }))
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  const isCoreAsset = event.request.mode === 'navigate' || /\.(html|css|js|json)$/i.test(url.pathname);
  if (isCoreAsset) {
    event.respondWith(
      fetch(event.request, { cache: 'no-cache' })
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(event.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    }))
  );
});
