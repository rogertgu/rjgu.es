/**
 * service-worker.js
 * Servicio worker para habilitar funcionalidades offline y PWA
 */

// Nombre y versión de la caché
const CACHE_NAME = 'portfolio-cache-v9';
const APP_ROOT = new URL('./', self.location).pathname;
const assetUrl = path => `${APP_ROOT}${path.replace(/^\/+/, '')}`;

// Archivos a cachear para funcionamiento offline
const urlsToCache = [
  assetUrl(''),
  assetUrl('index.html'),
  assetUrl('en/'),
  assetUrl('en/index.html'),
  assetUrl('cutrepodcast/'),
  assetUrl('en/cutrepodcast/'),
  assetUrl('css/styles.css'),
  assetUrl('fonts/jetbrains-mono-latin-wght.woff2'),
  assetUrl('js/main.js'),
  assetUrl('js/topology.js'),
  assetUrl('js/cutrepodcast.js'),
  assetUrl('img/profile.webp'),
  assetUrl('img/froglm.svg'),
  assetUrl('img/cutrepodcast.jpg'),
  assetUrl('img/lofi.jpg'),
  assetUrl('img/favicon.svg'),
  assetUrl('img/icons/icon-72x72.png'),
  assetUrl('img/icons/icon-96x96.png'),
  assetUrl('img/icons/icon-128x128.png'),
  assetUrl('img/icons/icon-144x144.png'),
  assetUrl('img/icons/icon-152x152.png'),
  assetUrl('img/icons/icon-192x192.png'),
  assetUrl('img/icons/icon-384x384.png'),
  assetUrl('img/icons/icon-512x512.png'),
  assetUrl('Rogert-Guevara-CV.pdf'),
  assetUrl('Rogert-Guevara-CV-EN.pdf'),
  assetUrl('manifest.json')
];

// Instalación del service worker
self.addEventListener('install', event => {
  // Esperar hasta que la promesa se resuelva
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierta');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activación del service worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  // Eliminar cachés antiguas
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia de caché: Network first, fallback to cache
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Solo cachear peticiones GET del mismo origen.
  if (event.request.method !== 'GET' || requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Verificar si la respuesta es válida
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clonar la respuesta
        const responseToCache = response.clone();
        
        // Guardar en caché
        event.waitUntil(
          caches.open(CACHE_NAME)
            .then(cache => cache.put(event.request, responseToCache))
        );
          
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde caché
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse;
          }

          if (event.request.mode === 'navigate') {
            return caches.match(assetUrl('index.html'));
          }

          return Response.error();
        });
      })
  );
});
