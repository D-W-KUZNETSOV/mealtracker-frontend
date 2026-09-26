// MealTracker Service Worker
// Правильная стратегия обновления + офлайн-доступ к статике

const CACHE_VERSION = 'v3';                    // ← меняй при каждом деплое
const CACHE_NAME = `mealtracker-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.svg',
];

// ============================================================
// Установка: кэшируем статику
// ============================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing', CACHE_VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();   // ← активируем сразу
});

// ============================================================
// Активация: чистим старые кэши
// ============================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating', CACHE_VERSION);
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();  // ← перехватываем контроль сразу
});

// ============================================================
// Fetch: network-first для HTML, cache-first для статики
// ============================================================
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Пропускаем API-запросы
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Для навигации (HTML) — network-first, чтобы всегда свежий index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Для остальных GET — network-first с fallback на cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('/index.html'))
      )
  );
});