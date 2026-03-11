// Service Worker for GerejaKu Admin PWA
const CACHE_NAME = 'gerejaku-v8';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/styles.min.css',
  '/js/app.min.js',
  '/js/data.min.js',
  '/js/auth-simple.min.js',
  '/js/components.min.js',
  '/js/storage.min.js',
  '/js/pages/dashboard.js',
  '/js/pages/members.js',
  '/js/pages/attendance.js',
  '/js/pages/finance.js',
  '/js/pages/inventory.js',
  '/js/pages/users.js',
  '/js/pages/settings.js',
  '/js/pages/worship-schedule.js',
  '/js/pages/events.js',
  '/js/pages/church-announcements.js',
  '/js/pages/commissions.js',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response and cache it
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // If network fails, try cache
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
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
