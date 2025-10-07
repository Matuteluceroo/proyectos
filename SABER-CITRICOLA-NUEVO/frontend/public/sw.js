// 📱 Service Worker para notificaciones push
// sw.js - Service Worker básico para Saber Citrícola

const CACHE_NAME = 'saber-citricola-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css'
];

// 🔧 Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker instalado');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 Cache abierto');
        return cache.addAll(urlsToCache);
      })
  );
});

// 🔄 Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 🌐 Intercepción de requests (fetch)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devolver el recurso del cache si está disponible
        if (response) {
          return response;
        }
        
        // Si no está en cache, hacer fetch normal
        return fetch(event.request);
      }
    )
  );
});

// 🔔 Manejo de notificaciones push
self.addEventListener('push', (event) => {
  console.log('📨 Notificación push recibida:', event);

  let notificationData = {
    title: 'Saber Citrícola',
    body: 'Tienes una nueva notificación',
    icon: '/logo.png',
    badge: '/badge.png',
    tag: 'saber-citricola-notification',
    requireInteraction: false,
    data: {
      url: '/',
      timestamp: Date.now()
    }
  };

  // Si hay datos en el push, usarlos
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData
      };
    } catch (error) {
      console.warn('⚠️ Error al parsear datos del push:', error);
      // Usar los datos como texto simple
      notificationData.body = event.data.text();
    }
  }

  // Mostrar la notificación
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      data: notificationData.data,
      actions: [
        {
          action: 'ver',
          title: '👀 Ver',
          icon: '/icons/view.png'
        },
        {
          action: 'cerrar',
          title: '❌ Cerrar',
          icon: '/icons/close.png'
        }
      ]
    })
  );
});

// 🖱️ Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Click en notificación:', event);

  const notification = event.notification;
  const action = event.action;

  if (action === 'cerrar') {
    // Cerrar la notificación
    notification.close();
    return;
  }

  // Para acción 'ver' o click directo en la notificación
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const url = notification.data?.url || '/';
      
      // Buscar si ya hay una ventana abierta
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes(url) && 'focus' in client) {
          // Enfocar la ventana existente
          notification.close();
          return client.focus();
        }
      }
      
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) {
        notification.close();
        return clients.openWindow(url);
      }
    })
  );
});

// 🔕 Manejo de cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notificación cerrada:', event);
  
  // Aquí podrías enviar analytics o actualizar el estado
  // de la notificación en el servidor
});

// 💬 Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
  console.log('💬 Mensaje recibido en SW:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    // Activar inmediatamente el nuevo service worker
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    // Responder con la versión del cache
    event.ports[0].postMessage({ version: CACHE_NAME });
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    // Limpiar el cache
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// 🔄 Sincronización en segundo plano (opcional)
self.addEventListener('sync', (event) => {
  console.log('🔄 Sync en segundo plano:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Aquí podrías sincronizar datos cuando hay conexión
      fetch('/api/sync')
        .then(response => response.json())
        .then(data => {
          console.log('✅ Sincronización completada:', data);
        })
        .catch(error => {
          console.error('❌ Error en sincronización:', error);
        })
    );
  }
});