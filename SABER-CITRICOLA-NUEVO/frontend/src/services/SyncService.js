// 🔄 SyncService.js - Servicio de sincronización automática para datos offline
import { useOfflineStorage } from './OfflineStorage';

import { buildApiUrl } from '../config/app.config.js';
class SyncService {
  constructor() {
    this.isOnline = navigator.onLine;
    this.syncInProgress = false;
    this.syncQueue = [];
    this.maxRetries = 3;
    this.retryDelay = 5000; // 5 segundos
    this.offlineStorage = null;
    
    this.init();
  }

  // 🚀 Inicializar el servicio
  async init() {
    const { 
      obtenerOperacionesPendientes, 
      marcarOperacionSincronizada,
      guardarOperacionPendiente 
    } = useOfflineStorage();
    
    this.offlineStorage = {
      obtenerOperacionesPendientes,
      marcarOperacionSincronizada,
      guardarOperacionPendiente
    };

    // 🎧 Escuchar eventos de conexión
    this.setupConnectionListeners();
    
    // 🔄 Sincronizar automáticamente si hay conexión
    if (this.isOnline) {
      setTimeout(() => this.syncPendingOperations(), 2000);
    }

    console.log('🔄 SyncService inicializado');
  }

  // 🎧 Configurar listeners de conexión
  setupConnectionListeners() {
    window.addEventListener('online', () => {
      console.log('🌐 Conexión restaurada - iniciando sincronización');
      this.isOnline = true;
      this.syncPendingOperations();
    });

    window.addEventListener('offline', () => {
      console.log('📱 Conexión perdida - modo offline activado');
      this.isOnline = false;
      this.syncInProgress = false;
    });

    // 📡 Eventos personalizados
    window.addEventListener('connection-restored', () => {
      this.isOnline = true;
      this.syncPendingOperations();
    });

    window.addEventListener('connection-lost', () => {
      this.isOnline = false;
      this.syncInProgress = false;
    });
  }

  // 📝 Agregar operación a la cola de sincronización
  async addToSyncQueue(operacion) {
    try {
      if (this.isOnline && !this.syncInProgress) {
        // Si hay conexión, intentar sincronizar inmediatamente
        return await this.syncOperation(operacion);
      } else {
        // Sin conexión, guardar para sincronizar después
        const tempId = await this.offlineStorage.guardarOperacionPendiente(operacion);
        console.log('📝 Operación guardada para sincronizar:', tempId);
        return { success: true, offline: true, tempId };
      }
    } catch (error) {
      console.error('❌ Error agregando operación a cola:', error);
      // Si falla, guardar como pendiente
      const tempId = await this.offlineStorage.guardarOperacionPendiente(operacion);
      return { success: false, offline: true, tempId, error: error.message };
    }
  }

  // 🔄 Sincronizar todas las operaciones pendientes
  async syncPendingOperations() {
    if (this.syncInProgress || !this.isOnline) {
      console.log('🔄 Sincronización ya en progreso o sin conexión');
      return;
    }

    this.syncInProgress = true;
    console.log('🔄 Iniciando sincronización de operaciones pendientes...');

    try {
      const operacionesPendientes = await this.offlineStorage.obtenerOperacionesPendientes();
      
      if (operacionesPendientes.length === 0) {
        console.log('✅ No hay operaciones pendientes para sincronizar');
        this.syncInProgress = false;
        return { success: true, sincronizadas: 0 };
      }

      console.log(`🔄 Sincronizando ${operacionesPendientes.length} operaciones...`);
      
      let sincronizadas = 0;
      let errores = 0;

      for (const operacion of operacionesPendientes) {
        try {
          const resultado = await this.syncOperation(operacion);
          
          if (resultado.success) {
            await this.offlineStorage.marcarOperacionSincronizada(operacion.tempId);
            sincronizadas++;
            console.log(`✅ Operación sincronizada: ${operacion.tempId}`);
          } else {
            errores++;
            console.error(`❌ Error sincronizando: ${operacion.tempId}`, resultado.error);
          }
        } catch (error) {
          errores++;
          console.error(`❌ Error sincronizando operación: ${operacion.tempId}`, error);
          
          // Incrementar contador de intentos
          operacion.intentos = (operacion.intentos || 0) + 1;
          
          // Si supera los reintentos máximos, marcar para revisión manual
          if (operacion.intentos >= this.maxRetries) {
            console.error(`❌ Operación ${operacion.tempId} superó máximo de intentos`);
            await this.markOperationForManualReview(operacion);
          }
        }
      }

      console.log(`✅ Sincronización completada: ${sincronizadas} exitosas, ${errores} errores`);
      
      // 📊 Disparar evento de sincronización completada
      window.dispatchEvent(new CustomEvent('sync-completed', {
        detail: { sincronizadas, errores }
      }));

      this.syncInProgress = false;
      return { success: true, sincronizadas, errores };

    } catch (error) {
      console.error('❌ Error en sincronización general:', error);
      this.syncInProgress = false;
      return { success: false, error: error.message };
    }
  }

  // 🔄 Sincronizar operación individual
  async syncOperation(operacion) {
    const { tipo, entidad, datos } = operacion;
    
    try {
      let endpoint = this.getEndpoint(entidad);
      let method = this.getMethod(tipo);
      
      // 🎯 Ajustar endpoint para operaciones específicas
      if (tipo === 'update' || tipo === 'delete') {
        endpoint += `/${datos.id}`;
      }

      // 🌐 Realizar petición HTTP
      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: tipo !== 'delete' ? JSON.stringify(datos) : undefined
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      console.log(`✅ Operación ${tipo} ${entidad} sincronizada exitosamente`);
      return { success: true, data: result };

    } catch (error) {
      console.error(`❌ Error sincronizando ${tipo} ${entidad}:`, error);
      return { success: false, error: error.message };
    }
  }

  // 🎯 Obtener endpoint según la entidad
  getEndpoint(entidad) {
    const endpoints = {
      documento: '/api/documentos',
      categoria: '/api/categorias',
      usuario: '/api/usuarios'
    };
    
    return endpoints[entidad] || '/api/sync';
  }

  // 🔧 Obtener método HTTP según el tipo
  getMethod(tipo) {
    const methods = {
      create: 'POST',
      update: 'PUT',
      delete: 'DELETE'
    };
    
    return methods[tipo] || 'POST';
  }

  // 🔑 Obtener token de autenticación
  getAuthToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  }

  // ⚠️ Marcar operación para revisión manual
  async markOperationForManualReview(operacion) {
    try {
      // Aquí podrías implementar lógica adicional
      // como guardar en una tabla especial o notificar al usuario
      console.warn('⚠️ Operación marcada para revisión manual:', operacion.tempId);
      
      // Por ahora, simplemente la eliminamos de pendientes
      await this.offlineStorage.marcarOperacionSincronizada(operacion.tempId);
      
      // 📊 Disparar evento para notificar a la UI
      window.dispatchEvent(new CustomEvent('sync-manual-review-needed', {
        detail: { operacion }
      }));
      
    } catch (error) {
      console.error('❌ Error marcando para revisión manual:', error);
    }
  }

  // 🔄 Forzar sincronización manual
  async forceSyncNow() {
    if (!this.isOnline) {
      throw new Error('No hay conexión a internet');
    }
    
    return await this.syncPendingOperations();
  }

  // 📊 Obtener estado de sincronización
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      queueLength: this.syncQueue.length
    };
  }

  // 🧪 Verificar conectividad con el servidor
  async checkServerConnectivity() {
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        method: 'GET',
        timeout: 5000
      });
      
      return response.ok;
    } catch (error) {
      console.log('🔍 Servidor no disponible:', error.message);
      return false;
    }
  }
}

// 🚀 Instancia singleton del servicio de sincronización
const syncService = new SyncService();

// 🎯 Hook personalizado para usar en componentes React
export const useSyncService = () => {
  return {
    // Operaciones principales
    addToSyncQueue: (operacion) => syncService.addToSyncQueue(operacion),
    syncPendingOperations: () => syncService.syncPendingOperations(),
    forceSyncNow: () => syncService.forceSyncNow(),
    
    // Estado
    getSyncStatus: () => syncService.getSyncStatus(),
    checkServerConnectivity: () => syncService.checkServerConnectivity(),
    
    // Propiedades
    get isOnline() { return syncService.isOnline; },
    get syncInProgress() { return syncService.syncInProgress; }
  };
};

// 🎯 Funciones utilitarias para operaciones comunes
export const queueDocumentOperation = async (tipo, documentData) => {
  return await syncService.addToSyncQueue({
    tipo, // 'create', 'update', 'delete'
    entidad: 'documento',
    datos: documentData
  });
};

export const queueCategoryOperation = async (tipo, categoryData) => {
  return await syncService.addToSyncQueue({
    tipo,
    entidad: 'categoria', 
    datos: categoryData
  });
};

export default syncService;