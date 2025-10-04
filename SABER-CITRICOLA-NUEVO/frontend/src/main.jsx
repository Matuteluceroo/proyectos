import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 🛠️ Registro del Service Worker para modo offline
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      
      console.log('✅ Service Worker registrado:', registration.scope);
      
      // Manejar actualizaciones del Service Worker
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Hay una nueva versión disponible
            if (confirm('🔄 Nueva versión disponible. ¿Deseas actualizar la aplicación?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });
      
      // Escuchar cuando el Service Worker tome control
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('🔄 Service Worker actualizado, recargando página...');
        window.location.reload();
      });
      
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
    }
  });
  
  // 🌐 Detectar cambios en el estado de conexión
  window.addEventListener('online', () => {
    console.log('🌐 Conexión restaurada');
    // Disparar event personalizado para que la app lo maneje
    window.dispatchEvent(new CustomEvent('connection-restored'));
  });
  
  window.addEventListener('offline', () => {
    console.log('📱 Modo offline activado');
    // Disparar event personalizado para que la app lo maneje
    window.dispatchEvent(new CustomEvent('connection-lost'));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
