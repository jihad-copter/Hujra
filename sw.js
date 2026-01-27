
const CACHE_NAME = 'hujra-manager-v2';
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

// کاتی دامەزراندن، هەموو فایلە پێویستەکان خەزن دەکرێن
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('خەریکی کاشکردنی فایلەکانە بۆ دۆخی ئۆفلاین...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// سڕینەوەی کاشە کۆنەکان کاتی نوێکردنەوە
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

// وەڵامدانەوەی داواکارییەکان تەنانەت بە بێ ئینتەرنێت
self.addEventListener('fetch', (event) => {
  // تەنها بۆ داواکارییەکانی GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((response) => {
        // ئەگەر فایلێکی نوێ بوو، بیخە ناو کاشەوە بۆ جاری داهاتوو
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // ئەگەر ئینتەرنێت نەبوو و لە کاشیشدا نەبوو، لاپەڕەی سەرەکی پیشان بدە
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
