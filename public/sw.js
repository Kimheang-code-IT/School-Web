const CACHE_NAME = 'websiteecom-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith('http')) return;

  // Skip development files that shouldn't be cached
  const url = event.request.url;
  if (
    url.includes('hot-update') ||
    url.includes('webpack-dev-server') ||
    url.includes('sockjs-node') ||
    url.includes('__webpack_hmr') ||
    url.includes('.hot-update.') ||
    url.includes('localhost:3000') && (url.includes('.hot-update.') || url.includes('webpack'))
  ) {
    return; // Let these requests go to network without caching
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version if available
        if (response) {
          // Only log for important files, not hot-updates
          if (!url.includes('hot-update') && !url.includes('.hot-update.')) {
            console.log('Service Worker: Serving from cache', event.request.url);
          }
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Don't cache development files
            if (
              url.includes('hot-update') ||
              url.includes('webpack-dev-server') ||
              url.includes('sockjs-node') ||
              url.includes('__webpack_hmr') ||
              url.includes('.hot-update.') ||
              (url.includes('localhost:3000') && (url.includes('.hot-update.') || url.includes('webpack')))
            ) {
              return response; // Don't cache, just return
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page for navigation requests
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Handle offline actions when connection is restored
  return Promise.resolve();
}