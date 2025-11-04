const CACHE_NAME = 'eja-homestay-v2';
const STATIC_CACHE = 'eja-homestay-static-v2';
const DYNAMIC_CACHE = 'eja-homestay-dynamic-v2';
const API_CACHE = 'eja-homestay-api-v2';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/eja_svg.svg',
  '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle image requests
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Handle navigation requests - Network First strategy to prevent stale pages
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache if response is fresh and valid
          if (response.status === 200 && response.headers.get('cache-control') !== 'no-cache') {
            const responseClone = response.clone();
            // Cache with expiration (5 minutes for pages)
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(async () => {
          // Try cache first, then offline page
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            // Check if cache is fresh (less than 5 minutes old)
            const cacheDate = cachedResponse.headers.get('date');
            if (cacheDate) {
              const cacheAge = Date.now() - new Date(cacheDate).getTime();
              if (cacheAge < 5 * 60 * 1000) { // 5 minutes
                return cachedResponse;
              }
            }
          }
          // Return offline page if navigation fails
          return caches.match('/offline') || new Response('Offline', { status: 503 });
        })
    );
    return;
  }

  // Handle other requests
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle background sync tasks
  console.log('Background sync triggered');
}
