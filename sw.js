
const CACHE_NAME = 'hujra-manager-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './index.tsx',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Vazirmatn:wght@100;400;700&display=swap',
  'https://img.icons8.com/color/48/mosque.png',
  'https://img.icons8.com/color/192/mosque.png',
  'https://img.icons8.com/color/512/mosque.png',
  'https://www.transparenttextures.com/patterns/islamic-art.png'
];

// کاتی دامەزراندن
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// سڕینەوەی کاشە کۆنەکان
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
  self.clients.claim();
});

// ستراتیژی Network First بەڵام کاشکردنی هەموو داواکارییەکان (تەنانەت React لە esm.sh)
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // ئەگەر ئینتەرنێت نەبوو، لاپەڕەی کاشکراو یان index.html بدەرەوە
        return cachedResponse || caches.match('./index.html');
      });

      return cachedResponse || fetchPromise;
    })
  );
});
