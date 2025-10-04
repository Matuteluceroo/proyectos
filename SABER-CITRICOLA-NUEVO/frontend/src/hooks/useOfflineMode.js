// 🌐 useOfflineMode.js - Hook personalizado para integrar funcionalidad offline
import { useState, useEffect } from 'react';
import { useOfflineStorage } from '../services/OfflineStorage';
import { useSyncService, queueDocumentOperation, queueCategoryOperation } from '../services/SyncService';

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState({
    documentos: [],
    categorias: [],
    estadisticas: null
  });
  
  const offlineStorage = useOfflineStorage();
  const syncService = useSyncService();

  // 🔄 Actualizar estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('connection-restored', handleOnline);
    window.addEventListener('connection-lost', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connection-restored', handleOnline);
      window.removeEventListener('connection-lost', handleOffline);
    };
  }, []);

  // 📊 Cargar datos offline al montar el componente
  useEffect(() => {
    loadOfflineData();
  }, []);

  // 📂 Cargar datos desde IndexedDB
  const loadOfflineData = async () => {
    try {
      const [documentos, categorias, estadisticas] = await Promise.all([
        offlineStorage.obtenerDocumentos(),
        offlineStorage.obtenerCategorias(),
        offlineStorage.obtenerEstadisticas()
      ]);

      setOfflineData({
        documentos,
        categorias,
        estadisticas
      });
    } catch (error) {
      console.error('❌ Error cargando datos offline:', error);
    }
  };

  // 📄 === OPERACIONES CON DOCUMENTOS ===

  // 📝 Crear documento (online o offline)
  const crearDocumento = async (documentData) => {
    try {
      if (isOnline) {
        // 🌐 Modo online - enviar directamente al servidor
        const response = await fetch('http://localhost:5000/api/documentos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(documentData)
        });

        if (response.ok) {
          const resultado = await response.json();
          return { success: true, data: resultado, online: true };
        } else {
          throw new Error(`Error HTTP: ${response.status}`);
        }
      } else {
        // 📱 Modo offline - guardar localmente
        const documentoOffline = {
          ...documentData,
          id: 'temp_' + Date.now(),
          fechaCreacion: new Date().toISOString(),
          offline: true,
          sincronizado: false
        };

        await offlineStorage.guardarDocumento(documentoOffline);
        await queueDocumentOperation('create', documentoOffline);
        await loadOfflineData();

        return { 
          success: true, 
          data: documentoOffline, 
          offline: true,
          message: 'Documento guardado offline. Se sincronizará cuando haya conexión.'
        };
      }
    } catch (error) {
      console.error('❌ Error creando documento:', error);
      
      // Si falla online, intentar guardar offline
      if (isOnline) {
        try {
          const documentoOffline = {
            ...documentData,
            id: 'temp_' + Date.now(),
            fechaCreacion: new Date().toISOString(),
            offline: true,
            sincronizado: false
          };

          await offlineStorage.guardarDocumento(documentoOffline);
          await queueDocumentOperation('create', documentoOffline);
          await loadOfflineData();

          return { 
            success: true, 
            data: documentoOffline, 
            offline: true,
            message: 'Error en el servidor. Documento guardado offline.'
          };
        } catch (offlineError) {
          return { 
            success: false, 
            error: 'Error guardando documento offline: ' + offlineError.message 
          };
        }
      }
      
      return { success: false, error: error.message };
    }
  };

  // ✏️ Actualizar documento
  const actualizarDocumento = async (id, documentData) => {
    try {
      if (isOnline) {
        const response = await fetch(`http://localhost:5000/api/documentos/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(documentData)
        });

        if (response.ok) {
          const resultado = await response.json();
          return { success: true, data: resultado, online: true };
        } else {
          throw new Error(`Error HTTP: ${response.status}`);
        }
      } else {
        // Guardar cambios offline
        const documentoActualizado = {
          ...documentData,
          id,
          fechaModificacion: new Date().toISOString(),
          offline: true,
          sincronizado: false
        };

        await offlineStorage.guardarDocumento(documentoActualizado);
        await queueDocumentOperation('update', documentoActualizado);
        await loadOfflineData();

        return { 
          success: true, 
          data: documentoActualizado, 
          offline: true,
          message: 'Cambios guardados offline.'
        };
      }
    } catch (error) {
      console.error('❌ Error actualizando documento:', error);
      return { success: false, error: error.message };
    }
  };

  // 🗑️ Eliminar documento
  const eliminarDocumento = async (id) => {
    try {
      if (isOnline) {
        const response = await fetch(`http://localhost:5000/api/documentos/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          return { success: true, online: true };
        } else {
          throw new Error(`Error HTTP: ${response.status}`);
        }
      } else {
        // Marcar para eliminar offline
        await offlineStorage.eliminarDocumento(id);
        await queueDocumentOperation('delete', { id });
        await loadOfflineData();

        return { 
          success: true, 
          offline: true,
          message: 'Documento marcado para eliminar offline.'
        };
      }
    } catch (error) {
      console.error('❌ Error eliminando documento:', error);
      return { success: false, error: error.message };
    }
  };

  // 🏷️ === OPERACIONES CON CATEGORÍAS ===

  // 📝 Crear categoría
  const crearCategoria = async (categoriaData) => {
    try {
      if (isOnline) {
        const response = await fetch('http://localhost:5000/api/categorias', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(categoriaData)
        });

        if (response.ok) {
          const resultado = await response.json();
          return { success: true, data: resultado, online: true };
        } else {
          throw new Error(`Error HTTP: ${response.status}`);
        }
      } else {
        const categoriaOffline = {
          ...categoriaData,
          id: 'temp_cat_' + Date.now(),
          fechaCreacion: new Date().toISOString(),
          offline: true
        };

        // Actualizar categorías locales
        const categoriasActuales = await offlineStorage.obtenerCategorias();
        await offlineStorage.guardarCategorias([...categoriasActuales, categoriaOffline]);
        await queueCategoryOperation('create', categoriaOffline);
        await loadOfflineData();

        return { 
          success: true, 
          data: categoriaOffline, 
          offline: true,
          message: 'Categoría guardada offline.'
        };
      }
    } catch (error) {
      console.error('❌ Error creando categoría:', error);
      return { success: false, error: error.message };
    }
  };

  // 📊 === UTILIDADES ===

  // 🔄 Sincronizar manualmente
  const sincronizarAhora = async () => {
    if (!isOnline) {
      return { success: false, error: 'No hay conexión a internet' };
    }

    try {
      const resultado = await syncService.forceSyncNow();
      await loadOfflineData(); // Recargar datos después de sincronizar
      return resultado;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // 📋 Obtener documentos (online + offline)
  const obtenerDocumentos = async () => {
    if (isOnline) {
      try {
        const response = await fetch('http://localhost:5000/api/documentos', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const documentosOnline = await response.json();
          // Combinar con documentos offline si hay
          const documentosOffline = offlineData.documentos.filter(doc => doc.offline);
          return [...documentosOnline.data, ...documentosOffline];
        }
      } catch (error) {
        console.error('❌ Error obteniendo documentos online:', error);
      }
    }

    // Fallback a datos offline
    return offlineData.documentos;
  };

  // 📂 Obtener categorías (online + offline)
  const obtenerCategorias = async () => {
    if (isOnline) {
      try {
        const response = await fetch('http://localhost:5000/api/categorias', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const categoriasOnline = await response.json();
          return categoriasOnline.data;
        }
      } catch (error) {
        console.error('❌ Error obteniendo categorías online:', error);
      }
    }

    // Fallback a datos offline
    return offlineData.categorias;
  };

  // 🎯 Retornar API del hook
  return {
    // Estado
    isOnline,
    offlineData,
    syncStatus: syncService.getSyncStatus(),

    // Operaciones con documentos
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento,
    obtenerDocumentos,

    // Operaciones con categorías
    crearCategoria,
    obtenerCategorias,

    // Utilidades
    sincronizarAhora,
    loadOfflineData,

    // Información
    get estadisticas() { return offlineData.estadisticas; },
    get documentosOffline() { return offlineData.documentos.filter(doc => doc.offline); },
    get operacionesPendientes() { return offlineData.estadisticas?.operacionesPendientes || 0; }
  };
};

export default useOfflineMode;