// Service Worker for cache management
const CACHE_NAME = 'dayboard-v1';
const urlsToCache = [
  '/',
  '/dashboard',
  '/profile',
  '/signin',
  '/work'
  // Note: Next.js handles static assets differently, so we don't pre-cache them
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Only cache the routes that exist
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('Some URLs failed to cache:', error);
          // Continue installation even if some URLs fail
        });
      })
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Fetch event with cache busting for API calls
self.addEventListener('fetch', (event) => {
  // Don't cache Supabase API calls - always fetch fresh
  if (event.request.url.includes('supabase.co')) {
    event.respondWith(
      fetch(event.request.clone(), {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }).catch(() => {
        // If network fails, don't serve stale cache for API calls
        return new Response('Network error', { status: 408 });
      })
    );
    return;
  }

  // Don't cache authentication routes
  if (event.request.url.includes('/auth/')) {
    event.respondWith(
      fetch(event.request, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      })
    );
    return;
  }

  // Don't cache Next.js internal routes
  if (event.request.url.includes('/_next/') || 
      event.request.url.includes('/api/') ||
      event.request.url.includes('/static/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // For page requests, use network-first strategy to avoid stale content
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // For other requests, try network first
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => caches.delete(cacheName))
      );
    }).then(() => {
      self.clients.claim();
    });
  }
});
