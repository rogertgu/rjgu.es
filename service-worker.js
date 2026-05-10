/**
 * service-worker.js
 * Servicio worker para habilitar funcionalidades offline y PWA
 */

// Nombre y versión de la caché
const CACHE_NAME = 'portfolio-cache-v2';

// Archivos a cachear para funcionamiento offline
const urlsToCache = [
  '/',
  '/index.html',
  '/en/',
  '/en/index.html',
  '/css/styles.css',
  '/js/main.js',
  '/js/network-animation.js',
  '/js/particles.js',
  '/js/glitch-text.js',
  '/js/typing-effect.js',
  '/js/scroll-animations.js',
  '/js/theme-switcher.js',
  '/js/projects-filter.js',
  '/js/skills-animation.js',
  '/js/contact-form.js',
  '/js/config-loader.js',
  '/img/profile.jpg',
  '/img/favicon.svg',
  '/img/icons/icon.svg',
  '/img/projects/project1.svg',
  '/img/projects/project2.svg',
  '/img/projects/project3.svg',
  '/img/projects/project4.svg',
  '/manifest.json'
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
        caches.open(CACHE_NAME)
          .then(cache => {
            cache.put(event.request, responseToCache);
          });
          
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar desde caché
        return caches.match(event.request);
      })
  );
});

// Evento de sincronización en segundo plano (para formularios)
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(
      // Aquí iría la lógica para enviar datos del formulario
      // almacenados en IndexedDB cuando se recupere la conexión
      console.log('Sincronizando formulario de contacto')
    );
  }
});

// Evento de notificación push
self.addEventListener('push', event => {
  const title = 'Portfolio Notification';
  const options = {
    body: event.data.text() || 'Notificación del portfolio',
    icon: '/img/icons/icon-192x192.png',
    badge: '/img/icons/icon-72x72.png'
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Evento de clic en notificación
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});