import axios from 'axios';

import { buildApiUrl } from '../config/app.config.js';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Mejorar mensajes de error
    const errorMessage = error.response?.data?.message 
      || error.message 
      || 'Error de conexión con el servidor';
    
    return Promise.reject({
      ...error,
      message: errorMessage
    });
  }
);

// Servicios de Backup
export const backupService = {
  crear: () => api.post('/backup/create'),
  listar: () => api.get('/backup/list'),
  descargar: (filename) => api.get(`/backup/download/${filename}`, { responseType: 'blob' }),
  eliminar: (filename) => api.delete(`/backup/${filename}`),
  getConfig: () => api.get('/backup/config'),
  updateConfig: (config) => api.put('/backup/config', config)
};

// Servicios de Reportes
export const reportesService = {
  getEstadisticas: () => api.get('/reportes/estadisticas'),
  getReporteUsuarios: () => api.get('/reportes/usuarios'),
  getReporteDocumentos: () => api.get('/reportes/documentos'),
  getReporteActividad: (params) => api.get('/reportes/actividad', { params }),
  exportar: (tipo, formato) => api.post(`/reportes/exportar/${tipo}`, 
    { formato }, 
    { responseType: formato === 'json' ? 'json' : 'blob' }
  ),
  getHistorialDocumentos: () => api.get('/reportes/historial-documentos')
};

export default api;