// Service Worker para validação de PWA no Chrome
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Permite que o tráfego passe normalmente
  event.respondWith(fetch(event.request));
});