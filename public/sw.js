// Minimal offline cache for the installed PWA. Runtime cache-first for
// same-origin GET requests, with a network fallback that fills the cache.
const CACHE = 'accountability-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached || (request.mode === 'navigate' ? caches.match(new URL('app/', self.registration.scope).href) : undefined));
      return cached || network;
    })
  );
});
