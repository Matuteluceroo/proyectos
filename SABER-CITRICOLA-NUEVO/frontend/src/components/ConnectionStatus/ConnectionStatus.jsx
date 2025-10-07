// 🌐 ConnectionStatus.jsx - Indicador de estado de conexión y sincronización
import { useState, useEffect } from 'react';
import { useOfflineStorage } from '../../services/OfflineStorage';
import './ConnectionStatus.css';

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showStatus, setShowStatus] = useState(false);
  const [statistics, setStatistics] = useState({
    documentosOffline: 0,
    operacionesPendientes: 0,
    ultimaActualizacion: null
  });
  const [syncing, setSyncing] = useState(false);
  
  const offlineStorage = useOfflineStorage();

  // 🔄 Actualizar estadísticas offline
  const updateStatistics = async () => {
    try {
      const stats = await offlineStorage.obtenerEstadisticas();
      setStatistics(stats);
    } catch (error) {
      console.error('Error obteniendo estadísticas offline:', error);
    }
  };

  // 🌐 Manejar eventos de conexión
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowStatus(true);
      
      // Ocultar después de 3 segundos
      setTimeout(() => setShowStatus(false), 3000);
      
      // Actualizar estadísticas y sincronizar si hay pendientes
      updateStatistics().then(() => {
        if (statistics.operacionesPendientes > 0) {
          handleSync();
        }
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowStatus(true);
      updateStatistics();
    };

    // 📡 Eventos personalizados desde main.jsx
    const handleConnectionRestored = () => handleOnline();
    const handleConnectionLost = () => handleOffline();

    // 🎧 Agregar listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('connection-restored', handleConnectionRestored);
    window.addEventListener('connection-lost', handleConnectionLost);

    // 📊 Actualizar estadísticas iniciales
    updateStatistics();

    // 🧹 Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('connection-restored', handleConnectionRestored);
      window.removeEventListener('connection-lost', handleConnectionLost);
    };
  }, []);

  // 🔄 Manejar sincronización manual
  const handleSync = async () => {
    if (!isOnline || syncing) return;
    
    setSyncing(true);
    try {
      const pendientes = await offlineStorage.obtenerOperacionesPendientes();
      
      if (pendientes.length === 0) {
        console.log('✅ No hay operaciones pendientes');
        setSyncing(false);
        return;
      }

      console.log(`🔄 Sincronizando ${pendientes.length} operaciones...`);
      
      for (const operacion of pendientes) {
        try {
          await syncOperation(operacion);
          await offlineStorage.marcarOperacionSincronizada(operacion.tempId);
        } catch (error) {
          console.error('❌ Error sincronizando operación:', error);
        }
      }
      
      await updateStatistics();
      console.log('✅ Sincronización completada');
      
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
    } finally {
      setSyncing(false);
    }
  };

  // 🔄 Sincronizar operación individual
  const syncOperation = async (operacion) => {
    const { tipo, entidad, datos } = operacion;
    let endpoint = '';
    let method = '';
    
    // 📄 Determinar endpoint y método según el tipo de operación
    switch (entidad) {
      case 'documento':
        endpoint = '/api/documentos';
        break;
      case 'categoria':
        endpoint = '/api/categorias';
        break;
      default:
        throw new Error(`Entidad desconocida: ${entidad}`);
    }
    
    switch (tipo) {
      case 'create':
        method = 'POST';
        break;
      case 'update':
        method = 'PUT';
        endpoint += `/${datos.id}`;
        break;
      case 'delete':
        method = 'DELETE';
        endpoint += `/${datos.id}`;
        break;
      default:
        throw new Error(`Tipo de operación desconocida: ${tipo}`);
    }

    // 🌐 Realizar la petición
    const response = await fetch(`http://localhost:5000${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: tipo !== 'delete' ? JSON.stringify(datos) : undefined
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  };

  // 🎨 Determinar clase CSS según el estado
  const getStatusClass = () => {
    if (syncing) return 'connection-status syncing';
    if (!isOnline) return 'connection-status offline';
    if (statistics.operacionesPendientes > 0) return 'connection-status pending';
    return 'connection-status online';
  };

  // 📱 Renderizar solo si hay algo que mostrar
  if (!showStatus && isOnline && statistics.operacionesPendientes === 0) {
    return null;
  }

  return (
    <div className={getStatusClass()}>
      <div className="status-content">
        {/* 🎯 Icono de estado */}
        <div className="status-icon">
          {syncing ? '🔄' : !isOnline ? '📱' : statistics.operacionesPendientes > 0 ? '⏳' : '🌐'}
        </div>
        
        {/* 📝 Mensaje de estado */}
        <div className="status-message">
          {syncing ? (
            <span>Sincronizando...</span>
          ) : !isOnline ? (
            <span>Sin conexión - Modo offline</span>
          ) : statistics.operacionesPendientes > 0 ? (
            <span>{statistics.operacionesPendientes} cambios pendientes</span>
          ) : (
            <span>Conectado</span>
          )}
        </div>
        
        {/* 🔄 Botón de sincronización */}
        {isOnline && statistics.operacionesPendientes > 0 && !syncing && (
          <button
            className="sync-button"
            onClick={handleSync}
            title="Sincronizar cambios pendientes"
          >
            🔄
          </button>
        )}
      </div>
      
      {/* 📊 Información adicional offline */}
      {!isOnline && statistics.documentosOffline > 0 && (
        <div className="offline-info">
          <small>
            📄 {statistics.documentosOffline} documentos offline disponibles
          </small>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;