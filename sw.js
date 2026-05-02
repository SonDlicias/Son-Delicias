// sw.js — Service Worker
const CACHE_NAME = 'pizzeria-v6.1.5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './menu.js',
  './bebidas.js',
  './mercado.js',
  './logo-app.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './apple-touch-icon.png',
  './site.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        // Cache parcial: silenciado en producción (algunos assets pueden no estar disponibles en runtime).
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  // No interceptar llamadas dinámicas al backend (Apps Script)
  // Esto evita servir respuestas viejas del Sheet desde caché.
  const url = event.request.url;
  if (url.includes('script.google.com') || url.includes('script.googleusercontent.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
