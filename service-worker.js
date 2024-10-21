const CACHE_NAME = 'expense-tracker-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/main.js',
    '/tailwind.min.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install the service worker and cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

// Intercept fetch requests and serve cached files if offline
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(keyList =>
            Promise.all(
                keyList.map(key => {
                    if (!cacheWhitelist.includes(key)) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );
});
