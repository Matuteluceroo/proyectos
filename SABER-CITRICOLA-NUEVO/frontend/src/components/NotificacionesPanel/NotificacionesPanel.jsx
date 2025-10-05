// 🔔 NotificacionesPanel.jsx - Componente para mostrar y gestionar notificaciones
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './NotificacionesPanel.css';

const NotificacionesPanel = () => {
  const { API_URL, user } = useAuth();

  // Estados
  const [notificaciones, setNotificaciones] = useState([]);
  const [noLeidas, setNoLeidas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mostrarPanel, setMostrarPanel] = useState(false);
  const [filtros, setFiltros] = useState({
    tipo: '',
    categoria: '',
    leida: ''
  });
  const [estadisticas, setEstadisticas] = useState({});
  const [soportaPush, setSoportaPush] = useState(false);
  const [suscripcionPush, setSuscripcionPush] = useState(null);

  // Referencias
  const panelRef = useRef(null);
  const intervalRef = useRef(null);

  // 🔄 Verificar soporte para notificaciones push
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setSoportaPush(true);
      verificarSuscripcionPush();
    }
  }, []);

  // 📱 Verificar suscripción push existente
  const verificarSuscripcionPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        setSuscripcionPush(subscription);
      }
    } catch (error) {
      console.warn('⚠️ Error al verificar suscripción push:', error);
    }
  };

  // 🔔 Cargar notificaciones
  const cargarNotificaciones = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.leida !== '') params.append('leida', filtros.leida);

      const response = await fetch(`${API_URL}/api/notificaciones/mis-notificaciones?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setNotificaciones(data.data);
        
        // Cargar estadísticas
        await cargarEstadisticas();
      } else {
        setError(data.message || 'Error al cargar notificaciones');
      }

    } catch (error) {
      console.error('❌ Error al cargar notificaciones:', error);
      setError('Error de conexión al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  // 📊 Cargar estadísticas
  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notificaciones/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEstadisticas(data.data);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error al cargar estadísticas:', error);
    }
  };

  // 🔄 Cargar notificaciones no leídas (para el polling)
  const cargarNoLeidas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notificaciones/no-leidas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNoLeidas(data.data);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error al cargar notificaciones no leídas:', error);
    }
  };

  // ✅ Marcar como leída
  const marcarComoLeida = async (notificacionId) => {
    try {
      const response = await fetch(`${API_URL}/api/notificaciones/${notificacionId}/marcar-leida`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Actualizar estado local
        setNotificaciones(prev => 
          prev.map(notif => 
            notif.id === notificacionId 
              ? { ...notif, leida: 1, fecha_lectura: new Date().toISOString() }
              : notif
          )
        );
        
        setNoLeidas(prev => prev.filter(notif => notif.id !== notificacionId));
        
        // Actualizar estadísticas
        setEstadisticas(prev => ({
          ...prev,
          no_leidas: Math.max(0, (prev.no_leidas || 0) - 1),
          leidas: (prev.leidas || 0) + 1
        }));
      }
    } catch (error) {
      console.error('❌ Error al marcar como leída:', error);
    }
  };

  // 📊 Marcar todas como leídas
  const marcarTodasComoLeidas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/notificaciones/marcar-todas-leidas`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Actualizar estado local
        setNotificaciones(prev => 
          prev.map(notif => ({ ...notif, leida: 1, fecha_lectura: new Date().toISOString() }))
        );
        setNoLeidas([]);
        
        // Actualizar estadísticas
        await cargarEstadisticas();
        
        alert(`${data.data.notificaciones_actualizadas} notificaciones marcadas como leídas`);
      }
    } catch (error) {
      console.error('❌ Error al marcar todas como leídas:', error);
    }
  };

  // 🗑️ Eliminar notificación
  const eliminarNotificacion = async (notificacionId) => {
    try {
      if (!window.confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
        return;
      }

      const response = await fetch(`${API_URL}/api/notificaciones/${notificacionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        // Remover de estado local
        setNotificaciones(prev => prev.filter(notif => notif.id !== notificacionId));
        setNoLeidas(prev => prev.filter(notif => notif.id !== notificacionId));
        
        // Actualizar estadísticas
        await cargarEstadisticas();
      }
    } catch (error) {
      console.error('❌ Error al eliminar notificación:', error);
    }
  };

  // 📱 Solicitar permisos y crear suscripción push
  const habilitarNotificacionesPush = async () => {
    try {
      if (!soportaPush) {
        alert('Tu navegador no soporta notificaciones push');
        return;
      }

      // Solicitar permisos
      const permission = await Notification.requestPermission();
      
      if (permission !== 'granted') {
        alert('Necesitas permitir las notificaciones para usar esta función');
        return;
      }

      // Registrar service worker (simplificado)
      const registration = await navigator.serviceWorker.register('/sw.js');
      await registration.update();

      // Crear suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array('TU_CLAVE_PUBLICA_VAPID') // Reemplazar con tu clave VAPID
      });

      // Enviar suscripción al servidor
      const response = await fetch(`${API_URL}/api/notificaciones/suscripcion-push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription,
          deviceInfo: {
            dispositivo: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            navegador: navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Otro',
            so: navigator.platform
          }
        })
      });

      if (response.ok) {
        setSuscripcionPush(subscription);
        alert('¡Notificaciones push habilitadas exitosamente!');
      }

    } catch (error) {
      console.error('❌ Error al habilitar notificaciones push:', error);
      alert('Error al habilitar notificaciones push');
    }
  };

  // 🔄 Manejar click en notificación
  const manejarClickNotificacion = (notificacion) => {
    // Marcar como leída si no lo está
    if (!notificacion.leida) {
      marcarComoLeida(notificacion.id);
    }

    // Navegar si tiene URL de acción
    if (notificacion.url_accion) {
      window.location.href = notificacion.url_accion;
    }
  };

  // 🎯 Efectos
  useEffect(() => {
    if (user) {
      cargarNotificaciones();
      cargarNoLeidas();
      
      // Polling cada 30 segundos para notificaciones no leídas
      intervalRef.current = setInterval(cargarNoLeidas, 30000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, filtros]);

  // 🖱️ Cerrar panel al hacer click fuera
  useEffect(() => {
    const manejarClickFuera = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setMostrarPanel(false);
      }
    };

    if (mostrarPanel) {
      document.addEventListener('mousedown', manejarClickFuera);
    }

    return () => {
      document.removeEventListener('mousedown', manejarClickFuera);
    };
  }, [mostrarPanel]);

  // 🔧 Función auxiliar para convertir VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // 📱 Render del componente
  return (
    <div className="notificaciones-container" ref={panelRef}>
      {/* Botón de notificaciones */}
      <button 
        className={`btn-notificaciones ${noLeidas.length > 0 ? 'tiene-nuevas' : ''}`}
        onClick={() => setMostrarPanel(!mostrarPanel)}
        title="Notificaciones"
      >
        🔔
        {noLeidas.length > 0 && (
          <span className="badge-contador">
            {noLeidas.length > 99 ? '99+' : noLeidas.length}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {mostrarPanel && (
        <div className="notificaciones-panel">
          {/* Header del panel */}
          <div className="panel-header">
            <div className="header-info">
              <h3>🔔 Notificaciones</h3>
              <div className="stats-rapidas">
                <span className="stat-item">
                  📊 {estadisticas.total_notificaciones || 0} total
                </span>
                <span className="stat-item nuevo">
                  🆕 {estadisticas.no_leidas || 0} nuevas
                </span>
              </div>
            </div>
            
            <div className="header-acciones">
              {estadisticas.no_leidas > 0 && (
                <button 
                  onClick={marcarTodasComoLeidas}
                  className="btn-marcar-todas"
                  title="Marcar todas como leídas"
                >
                  ✅
                </button>
              )}
              
              {soportaPush && !suscripcionPush && (
                <button 
                  onClick={habilitarNotificacionesPush}
                  className="btn-habilitar-push"
                  title="Habilitar notificaciones push"
                >
                  📱
                </button>
              )}
              
              <button 
                onClick={() => setMostrarPanel(false)}
                className="btn-cerrar-panel"
                title="Cerrar"
              >
                ✖️
              </button>
            </div>
          </div>

          {/* Filtros */}
          <div className="panel-filtros">
            <select 
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
              className="filtro-select"
            >
              <option value="">Todos los tipos</option>
              <option value="info">Información</option>
              <option value="success">Éxito</option>
              <option value="warning">Advertencia</option>
              <option value="error">Error</option>
            </select>

            <select 
              value={filtros.categoria}
              onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
              className="filtro-select"
            >
              <option value="">Todas las categorías</option>
              <option value="comentarios">Comentarios</option>
              <option value="versiones">Versiones</option>
              <option value="documentos">Documentos</option>
              <option value="sistema">Sistema</option>
            </select>

            <select 
              value={filtros.leida}
              onChange={(e) => setFiltros({...filtros, leida: e.target.value})}
              className="filtro-select"
            >
              <option value="">Todas</option>
              <option value="false">No leídas</option>
              <option value="true">Leídas</option>
            </select>
          </div>

          {/* Lista de notificaciones */}
          <div className="panel-contenido">
            {loading ? (
              <div className="loading-notificaciones">
                <div className="loading-spinner"></div>
                <p>Cargando notificaciones...</p>
              </div>
            ) : error ? (
              <div className="error-notificaciones">
                <p>❌ {error}</p>
                <button onClick={cargarNotificaciones} className="btn-reintentar">
                  🔄 Reintentar
                </button>
              </div>
            ) : notificaciones.length === 0 ? (
              <div className="sin-notificaciones">
                <p>📭 No tienes notificaciones</p>
              </div>
            ) : (
              <div className="lista-notificaciones">
                {notificaciones.map((notificacion) => (
                  <div 
                    key={notificacion.id}
                    className={`notificacion-item ${!notificacion.leida ? 'no-leida' : ''} tipo-${notificacion.tipo}`}
                    onClick={() => manejarClickNotificacion(notificacion)}
                  >
                    <div className="notificacion-contenido">
                      <div className="notificacion-header">
                        <span className="notificacion-icono">
                          {notificacion.icono}
                        </span>
                        <div className="notificacion-info">
                          <h4 className="notificacion-titulo">
                            {notificacion.titulo}
                          </h4>
                          <div className="notificacion-meta">
                            <span className="notificacion-fecha">
                              {notificacion.fecha_creacion_formateada}
                            </span>
                            {notificacion.emisor_nombre && (
                              <span className="notificacion-emisor">
                                👤 {notificacion.emisor_nombre}
                              </span>
                            )}
                            <span className={`notificacion-categoria categoria-${notificacion.categoria}`}>
                              {notificacion.categoria}
                            </span>
                          </div>
                        </div>
                        
                        <div className="notificacion-acciones">
                          {!notificacion.leida && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                marcarComoLeida(notificacion.id);
                              }}
                              className="btn-marcar-leida"
                              title="Marcar como leída"
                            >
                              ✅
                            </button>
                          )}
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarNotificacion(notificacion.id);
                            }}
                            className="btn-eliminar-notificacion"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      
                      <p className="notificacion-mensaje">
                        {notificacion.mensaje}
                      </p>
                      
                      {notificacion.url_accion && (
                        <div className="notificacion-accion">
                          <span className="accion-texto">
                            {notificacion.accion_principal || 'Ver más'} →
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer del panel */}
          <div className="panel-footer">
            <div className="stats-detalladas">
              <div className="stat-detalle">
                <span className="stat-numero">{estadisticas.categoria_comentarios || 0}</span>
                <span className="stat-label">Comentarios</span>
              </div>
              <div className="stat-detalle">
                <span className="stat-numero">{estadisticas.categoria_versiones || 0}</span>
                <span className="stat-label">Versiones</span>
              </div>
              <div className="stat-detalle">
                <span className="stat-numero">{estadisticas.categoria_documentos || 0}</span>
                <span className="stat-label">Documentos</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacionesPanel;