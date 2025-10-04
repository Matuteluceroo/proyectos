// 🛠️ Service Worker para Saber Citrícola - Modo Offline
// Versión del cache - cambiar cuando actualices recursos
const CACHE_VERSION = 'v1.0.0';
const STATIC_CACHE = `saber-citricola-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `saber-citricola-dynamic-${CACHE_VERSION}`;
const API_CACHE = `saber-citricola-api-${CACHE_VERSION}`;

// 📦 Recursos estáticos a cachear
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/logo.png',
  '/Macrologo.png',
  '/manifest.json'
];

// 🎯 URLs de API a cachear
const API_URLS = [
  '/api/documentos',
  '/api/categorias',
  '/api/usuarios/me'
];

// 📱 Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Cacheando recursos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker instalado correctamente');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch((error) => {
        console.error('❌ Error instalando Service Worker:', error);
      })
  );
});

// 🔄 Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches antiguos
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activado');
        return self.clients.claim(); // Tomar control inmediatamente
      })
  );
});

// 🌐 Interceptar requests (estrategia de caching)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // 🚫 No cachear requests de extensiones del navegador
  if (url.protocol === 'chrome-extension:' || url.protocol === 'moz-extension:') {
    return;
  }

  // 📄 Estrategia para recursos estáticos: Cache First
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset)) || 
      url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2)$/)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
  }
  
  // 🔌 Estrategia para API: Network First con fallback a cache
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
  }
  
  // 🌍 Estrategia para páginas HTML: Network First
  else if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
  }
  
  // 🎯 Para todo lo demás: Network only
  else {
    event.respondWith(fetch(request));
  }
});

// 📦 Estrategia Cache First - Para recursos estáticos
async function cacheFirstStrategy(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Sirviendo desde cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log('🌐 Guardando en cache:', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.log('❌ Error en cacheFirstStrategy:', error);
    return caches.match(request); // Fallback a cache si hay error
  }
}

// 🌐 Estrategia Network First - Para API y contenido dinámico
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Solo cachear GET requests exitosos
      if (request.method === 'GET') {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
        console.log('🌐 Actualizando cache:', request.url);
      }
      return networkResponse;
    }
    
    // Si la response no es ok, intentar desde cache
    return await caches.match(request) || networkResponse;
    
  } catch (error) {
    console.log('🔌 Sin conexión, sirviendo desde cache:', request.url);
    
    // Si es una request de API, intentar devolver respuesta offline
    if (request.url.includes('/api/')) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Respuesta offline personalizada para APIs
      return new Response(JSON.stringify({
        success: false,
        message: 'Sin conexión a internet',
        offline: true,
        data: []
      }), {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Para páginas HTML, devolver página offline
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Página offline genérica
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Saber Citrícola - Sin Conexión</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .offline-container { max-width: 400px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .icon { font-size: 64px; margin-bottom: 20px; }
            h1 { color: #e74c3c; margin-bottom: 20px; }
            p { color: #7f8c8d; line-height: 1.5; }
            .retry-btn { background: #3498db; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin-top: 20px; }
            .retry-btn:hover { background: #2980b9; }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="icon">🌐❌</div>
            <h1>Sin Conexión</h1>
            <p>No hay conexión a internet. Algunos contenidos pueden estar disponibles offline.</p>
            <button class="retry-btn" onclick="window.location.reload()">🔄 Reintentar</button>
          </div>
        </body>
      </html>
    `, {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// 📨 Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      console.log('🔄 Forzando actualización del Service Worker...');
      self.skipWaiting();
      break;
      
    case 'CACHE_URLS':
      console.log('📦 Cacheando URLs adicionales:', data);
      cacheUrls(data);
      break;
      
    case 'CLEAR_CACHE':
      console.log('🗑️ Limpiando cache...');
      clearAllCaches();
      break;
      
    default:
      console.log('📨 Mensaje desconocido:', type);
  }
});

// 📦 Función para cachear URLs adicionales
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    await cache.addAll(urls);
    console.log('✅ URLs cacheadas exitosamente');
  } catch (error) {
    console.error('❌ Error cacheando URLs:', error);
  }
}

// 🗑️ Función para limpiar todos los caches
async function clearAllCaches() {
  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('✅ Todos los caches eliminados');
  } catch (error) {
    console.error('❌ Error limpiando caches:', error);
  }
}

// 🔄 Background Sync para operaciones offline
self.addEventListener('sync', (event) => {
  console.log('🔄 Background Sync activado:', event.tag);
  
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineData());
  }
});

// 📊 Función para sincronizar datos offline
async function syncOfflineData() {
  console.log('🔄 Sincronizando datos offline...');
  
  try {
    // Aquí implementarías la lógica para sincronizar datos
    // guardados offline cuando se restaure la conexión
    
    // Por ejemplo: enviar documentos creados offline
    const offlineData = await getOfflineData();
    
    for (const item of offlineData) {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        
        if (response.ok) {
          await removeOfflineData(item.id);
          console.log('✅ Sincronizado:', item.id);
        }
      } catch (error) {
        console.error('❌ Error sincronizando:', item.id, error);
      }
    }
    
  } catch (error) {
    console.error('❌ Error en sincronización:', error);
  }
}

// 📚 Funciones auxiliares para datos offline (implementar según necesidad)
async function getOfflineData() {
  // Implementar lectura desde IndexedDB
  return [];
}

async function removeOfflineData(id) {
  // Implementar eliminación desde IndexedDB
  console.log('🗑️ Eliminando dato offline:', id);
}

console.log('🚀 Service Worker de Saber Citrícola cargado');