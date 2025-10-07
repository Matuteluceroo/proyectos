// 🔧 Configuración centralizada de la aplicación

// 🌐 URL base de la API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 🏷️ Información de la aplicación
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'Saber Citrícola',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: import.meta.env.NODE_ENV || 'development'
};

// 🔧 Configuración de desarrollo
export const DEV_CONFIG = {
  apiUrl: import.meta.env.VITE_DEV_API_URL || 'http://localhost:5000/api',
  enableLogs: import.meta.env.NODE_ENV === 'development'
};

// 📧 URLs de contacto y soporte
export const CONTACT_CONFIG = {
  email: import.meta.env.VITE_CONTACT_EMAIL || 'contacto@sabercitricola.com',
  supportUrl: import.meta.env.VITE_SUPPORT_URL || '#'
};

// 🛠️ Función helper para logs en desarrollo
export const devLog = (...args) => {
  if (DEV_CONFIG.enableLogs) {
    console.log('[Dev]', ...args);
  }
};

// 🌍 Detectar si estamos en producción
export const isProduction = () => import.meta.env.NODE_ENV === 'production';

// 🔧 Helper para construir URLs de API
export const buildApiUrl = (endpoint) => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  APP_CONFIG,
  DEV_CONFIG,
  CONTACT_CONFIG,
  devLog,
  isProduction,
  buildApiUrl
};