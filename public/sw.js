// ============================================================
// public/sw.js — Service Worker Zen Nail Salon
//
// Responsabilidades:
//   1) Cachear assets críticos (network-first con fallback a caché).
//   2) Manejar eventos `push` del Push API para mostrar notificaciones
//      nativas aunque la pestaña esté cerrada.
//   3) Manejar `notificationclick` para enfocar la pestaña y navegar
//      al deep-link entregado por el backend.
//
// Bump CACHE_NAME cuando cambien los archivos críticos — eso fuerza
// a los clientes a actualizar el SW y limpiar la caché vieja.
// ============================================================

const CACHE_NAME = 'zen-salon-cache-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.png',
];

// -----------------------------------------------------------
// Install: pre-cachear y tomar control inmediato.
// -----------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// -----------------------------------------------------------
// Activate: limpiar cachés antiguas y reclamar clientes.
// -----------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
          return null;
        })
      )
    ).then(() => self.clients.claim())
  );
});

// -----------------------------------------------------------
// Fetch: network-first con fallback a caché (no cachear /api).
// -----------------------------------------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (
    event.request.url.includes('/api/') ||
    event.request.url.startsWith('chrome-extension')
  ) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// -----------------------------------------------------------
// Push: mostrar notificación nativa del SO.
// El backend envía un JSON con { title, body, icon, tag, url }.
// -----------------------------------------------------------
self.addEventListener('push', (event) => {
  let payload = {
    title: 'Zen Nails',
    body: 'Tienes una nueva notificación.',
    icon: '/icon.png',
    tag: 'zen-default',
    url: '/',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch (e) {
      // Si el body no es JSON, tratarlo como texto plano.
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon,
      badge: '/icon-badge.png',
      tag: payload.tag,
      data: { url: payload.url },
      vibrate: [120, 60, 120],
      requireInteraction: false,
    })
  );
});

// -----------------------------------------------------------
// notificationclick: enfocar pestaña existente o abrir nueva
// y navegar al deep-link entregado por el backend.
// -----------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.focus();
            if ('navigate' in client) {
              return client.navigate(targetUrl);
            }
            return client;
          }
        }
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
        return null;
      })
  );
});
