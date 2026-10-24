// Spud the Piper - Advanced PWA Service Worker (Offline Showcase Mode)
const CACHE_NAME = 'spud-piper-v4-showcase';

const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/og-image.jpg',
  '/logo.png',
  '/spud-crest.svg',
  '/spud-heritage-logo.png',
  '/tunes',
  '/attire',
  '/services',
  '/booking',
  '/gallery',
  '/meet-spud',
  '/blog',
  '/about',
  '/reviews',
  '/faq',
  '/contact',
  '/tour-groups',
  '/partners',
  '/social',
  '/install'
];

// Approved external CDN hosts for audio, fonts, and photos
const ALLOWED_EXTERNAL_HOSTS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'images.unsplash.com',
  'firebasestorage.googleapis.com',
  'www.scottishbagpipers.com',
  'scottishbagpipers.com'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Pre-cache core offline assets with individual error resilience
      return Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.log('SW pre-cache note for', asset, err?.message || err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignore dev websockets, browser extensions & analytics
  if (url.protocol.startsWith('chrome-extension')) return;
  if (url.pathname.includes('/_next/webpack-hmr')) return;
  if (url.hostname.includes('google-analytics') || url.hostname.includes('googletagmanager')) return;

  const isSameOrigin = url.origin === self.origin;
  const isAllowedExternal = ALLOWED_EXTERNAL_HOSTS.some(host => url.hostname.includes(host));

  if (!isSameOrigin && !isAllowedExternal) {
    return;
  }

  // Network-first strategy for HTML navigations to always show fresh content, fallback to offline showcase
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return caches.match('/offline').then((offlinePage) => {
              return offlinePage || caches.match('/');
            });
          });
        })
    );
    return;
  }

  // Cache-first with background network revalidation for static assets, audio, fonts, and photos
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached, but revalidate in background when online
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
            }
          })
          .catch(() => {
            // Silently ignore background revalidation failures while offline
          });
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse && 
            networkResponse.status === 200 && 
            (event.request.url.startsWith('http://') || event.request.url.startsWith('https://'))
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback handling for images while offline
          if (event.request.destination === 'image') {
            return caches.match('/og-image.jpg');
          }
          return new Response('Network offline', { status: 503, statusText: 'Service Unavailable' });
        });
    })
  );
});
