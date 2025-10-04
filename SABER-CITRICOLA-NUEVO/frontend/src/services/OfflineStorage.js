// 📚 OfflineStorage.js - Sistema de almacenamiento offline con IndexedDB
// Para guardar documentos, categorías y datos cuando no hay conexión

class OfflineStorage {
  constructor() {
    this.dbName = 'SaberCitricolaOfflineDB';
    this.dbVersion = 1;
    this.db = null;
  }

  // 🚀 Inicializar la base de datos
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        console.error('❌ Error abriendo IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB inicializada correctamente');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        console.log('🔧 Creando estructura de IndexedDB...');

        // 📄 Store para documentos
        if (!db.objectStoreNames.contains('documentos')) {
          const documentosStore = db.createObjectStore('documentos', { keyPath: 'id' });
          documentosStore.createIndex('categoria_id', 'categoria_id', { unique: false });
          documentosStore.createIndex('titulo', 'titulo', { unique: false });
          documentosStore.createIndex('fechaCreacion', 'fechaCreacion', { unique: false });
          documentosStore.createIndex('offline', 'offline', { unique: false });
        }

        // 🏷️ Store para categorías
        if (!db.objectStoreNames.contains('categorias')) {
          const categoriasStore = db.createObjectStore('categorias', { keyPath: 'id' });
          categoriasStore.createIndex('nombre', 'nombre', { unique: false });
        }

        // 📊 Store para datos offline pendientes de sincronización
        if (!db.objectStoreNames.contains('pendientes')) {
          const pendientesStore = db.createObjectStore('pendientes', { keyPath: 'tempId' });
          pendientesStore.createIndex('tipo', 'tipo', { unique: false });
          pendientesStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // ⚙️ Store para configuraciones offline
        if (!db.objectStoreNames.contains('configuracion')) {
          const configStore = db.createObjectStore('configuracion', { keyPath: 'key' });
        }

        console.log('✅ Estructura de IndexedDB creada');
      };
    });
  }

  // 📄 === OPERACIONES CON DOCUMENTOS === 

  // 💾 Guardar documento offline
  async guardarDocumento(documento) {
    try {
      const transaction = this.db.transaction(['documentos'], 'readwrite');
      const store = transaction.objectStore('documentos');
      
      // Marcar como offline si no tiene ID del servidor
      const documentoOffline = {
        ...documento,
        offline: !documento.id || documento.id.toString().startsWith('temp_'),
        fechaModificacion: new Date().toISOString(),
        sincronizado: false
      };

      await store.put(documentoOffline);
      console.log('💾 Documento guardado offline:', documento.titulo);
      return documentoOffline;
    } catch (error) {
      console.error('❌ Error guardando documento offline:', error);
      throw error;
    }
  }

  // 📋 Obtener todos los documentos offline
  async obtenerDocumentos() {
    try {
      const transaction = this.db.transaction(['documentos'], 'readonly');
      const store = transaction.objectStore('documentos');
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('📋 Documentos obtenidos desde IndexedDB:', request.result.length);
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error obteniendo documentos offline:', error);
      return [];
    }
  }

  // 🔍 Buscar documento por ID
  async obtenerDocumentoPorId(id) {
    try {
      const transaction = this.db.transaction(['documentos'], 'readonly');
      const store = transaction.objectStore('documentos');
      const request = store.get(id);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error obteniendo documento por ID:', error);
      return null;
    }
  }

  // 🗑️ Eliminar documento offline
  async eliminarDocumento(id) {
    try {
      const transaction = this.db.transaction(['documentos'], 'readwrite');
      const store = transaction.objectStore('documentos');
      await store.delete(id);
      console.log('🗑️ Documento eliminado offline:', id);
    } catch (error) {
      console.error('❌ Error eliminando documento offline:', error);
      throw error;
    }
  }

  // 🏷️ === OPERACIONES CON CATEGORÍAS ===

  // 💾 Guardar categorías offline
  async guardarCategorias(categorias) {
    try {
      const transaction = this.db.transaction(['categorias'], 'readwrite');
      const store = transaction.objectStore('categorias');
      
      for (const categoria of categorias) {
        await store.put(categoria);
      }
      
      console.log('💾 Categorías guardadas offline:', categorias.length);
    } catch (error) {
      console.error('❌ Error guardando categorías offline:', error);
      throw error;
    }
  }

  // 📋 Obtener categorías offline
  async obtenerCategorias() {
    try {
      const transaction = this.db.transaction(['categorias'], 'readonly');
      const store = transaction.objectStore('categorias');
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('📋 Categorías obtenidas desde IndexedDB:', request.result.length);
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error obteniendo categorías offline:', error);
      return [];
    }
  }

  // 📊 === OPERACIONES PENDIENTES ===

  // 📝 Guardar operación pendiente de sincronización
  async guardarOperacionPendiente(operacion) {
    try {
      const transaction = this.db.transaction(['pendientes'], 'readwrite');
      const store = transaction.objectStore('pendientes');
      
      const operacionPendiente = {
        tempId: 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        tipo: operacion.tipo, // 'create', 'update', 'delete'
        entidad: operacion.entidad, // 'documento', 'categoria'
        datos: operacion.datos,
        timestamp: new Date().toISOString(),
        intentos: 0
      };

      await store.put(operacionPendiente);
      console.log('📝 Operación pendiente guardada:', operacion.tipo);
      return operacionPendiente.tempId;
    } catch (error) {
      console.error('❌ Error guardando operación pendiente:', error);
      throw error;
    }
  }

  // 📋 Obtener operaciones pendientes
  async obtenerOperacionesPendientes() {
    try {
      const transaction = this.db.transaction(['pendientes'], 'readonly');
      const store = transaction.objectStore('pendientes');
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => {
          console.log('📋 Operaciones pendientes:', request.result.length);
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error obteniendo operaciones pendientes:', error);
      return [];
    }
  }

  // ✅ Marcar operación como sincronizada
  async marcarOperacionSincronizada(tempId) {
    try {
      const transaction = this.db.transaction(['pendientes'], 'readwrite');
      const store = transaction.objectStore('pendientes');
      await store.delete(tempId);
      console.log('✅ Operación sincronizada:', tempId);
    } catch (error) {
      console.error('❌ Error marcando operación como sincronizada:', error);
    }
  }

  // ⚙️ === CONFIGURACIÓN ===

  // 💾 Guardar configuración
  async guardarConfiguracion(key, value) {
    try {
      const transaction = this.db.transaction(['configuracion'], 'readwrite');
      const store = transaction.objectStore('configuracion');
      await store.put({ key, value, timestamp: new Date().toISOString() });
      console.log('⚙️ Configuración guardada:', key);
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
    }
  }

  // 📖 Obtener configuración
  async obtenerConfiguracion(key) {
    try {
      const transaction = this.db.transaction(['configuracion'], 'readonly');
      const store = transaction.objectStore('configuracion');
      const request = store.get(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result?.value || null);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('❌ Error obteniendo configuración:', error);
      return null;
    }
  }

  // 🔄 === SINCRONIZACIÓN ===

  // 📊 Obtener estadísticas offline
  async obtenerEstadisticas() {
    try {
      const [documentos, categorias, pendientes] = await Promise.all([
        this.obtenerDocumentos(),
        this.obtenerCategorias(),
        this.obtenerOperacionesPendientes()
      ]);

      const documentosOffline = documentos.filter(doc => doc.offline);
      
      return {
        documentosTotal: documentos.length,
        documentosOffline: documentosOffline.length,
        categorias: categorias.length,
        operacionesPendientes: pendientes.length,
        ultimaActualizacion: await this.obtenerConfiguracion('ultimaActualizacion')
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      return {
        documentosTotal: 0,
        documentosOffline: 0,
        categorias: 0,
        operacionesPendientes: 0,
        ultimaActualizacion: null
      };
    }
  }

  // 🗑️ Limpiar todos los datos offline
  async limpiarDatos() {
    try {
      const stores = ['documentos', 'categorias', 'pendientes', 'configuracion'];
      
      for (const storeName of stores) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await store.clear();
      }
      
      console.log('🗑️ Datos offline limpiados');
    } catch (error) {
      console.error('❌ Error limpiando datos offline:', error);
      throw error;
    }
  }
}

// 🚀 Instancia singleton del almacenamiento offline
const offlineStorage = new OfflineStorage();

// 🎯 Hook personalizado para usar en componentes React
export const useOfflineStorage = () => {
  return {
    // Documentos
    guardarDocumento: (documento) => offlineStorage.guardarDocumento(documento),
    obtenerDocumentos: () => offlineStorage.obtenerDocumentos(),
    obtenerDocumentoPorId: (id) => offlineStorage.obtenerDocumentoPorId(id),
    eliminarDocumento: (id) => offlineStorage.eliminarDocumento(id),
    
    // Categorías
    guardarCategorias: (categorias) => offlineStorage.guardarCategorias(categorias),
    obtenerCategorias: () => offlineStorage.obtenerCategorias(),
    
    // Operaciones pendientes
    guardarOperacionPendiente: (operacion) => offlineStorage.guardarOperacionPendiente(operacion),
    obtenerOperacionesPendientes: () => offlineStorage.obtenerOperacionesPendientes(),
    marcarOperacionSincronizada: (tempId) => offlineStorage.marcarOperacionSincronizada(tempId),
    
    // Configuración
    guardarConfiguracion: (key, value) => offlineStorage.guardarConfiguracion(key, value),
    obtenerConfiguracion: (key) => offlineStorage.obtenerConfiguracion(key),
    
    // Estadísticas
    obtenerEstadisticas: () => offlineStorage.obtenerEstadisticas(),
    limpiarDatos: () => offlineStorage.limpiarDatos(),
    
    // Estado
    isInitialized: () => offlineStorage.db !== null
  };
};

// 🚀 Inicializar automáticamente cuando se carga el módulo
offlineStorage.init().catch(error => {
  console.error('❌ Error inicializando IndexedDB:', error);
});

export default offlineStorage;