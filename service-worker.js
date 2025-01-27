self.importScripts('./js/config.js');

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CONFIG.CACHE_NAME)
            .then(cache => {
                // Convert relative paths to absolute URLs
                const baseUrl = self.location.origin;
                const urlsToCache = CONFIG.ASSETS.map(path => {
                    if (path.startsWith('./')) {
                        path = path.slice(2); // Remove './'
                    }
                    return new URL(path, baseUrl).href;
                });
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting())
            .catch(error => console.error('Cache installation failed:', error))
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            caches.keys().then(keys => {
                return Promise.all(
                    keys.map(key => {
                        if (key !== CONFIG.CACHE_NAME) {
                            return caches.delete(key);
                        }
                    })
                );
            })
        ])
    );
});

self.addEventListener('fetch', event => {
    if (event.request.url.includes('/api/') || !event.request.url.startsWith(self.location.origin)) {
        return fetch(event.request);
    }
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then(response => {
                        if (response.ok) {
                            const responseToCache = response.clone();
                            caches.open(CONFIG.CACHE_NAME)
                                .then(cache => {
                                    cache.put(event.request, responseToCache);
                                });
                        }
                        return response;
                    })
                    .catch(() => {
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        return new Response('Offline');
                    });
            })
    );
});

self.addEventListener('push', event => {
    const options = {
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [CONFIG.VIBRATION_DURATION]
    };

    event.waitUntil(
        self.registration.showNotification('Exercise Tracker', options)
    );
});

self.addEventListener('notificationclick', event => {
    console.log('Notification clicked:', event);
    event.notification.close();

    event.waitUntil(
        clients.matchAll({type: 'window', includeUncontrolled: true})
            .then(clientList => {
                for (const client of clientList) {
                    if (client.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                return clients.openWindow('/');
            })
    );
});

self.addEventListener('error', event => {
    console.error('Serviceworker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('Unhandled promise rejection:', event.reason);
});