// 🔧 DashboardAdmin.jsx - Panel del Administrador con notificaciones
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const DashboardAdmin = () => {
  const { user, logout, API_URL } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();
  const [metricas, setMetricas] = useState({
    usuarios: 0,
    documentos: 0,
    categorias: 0,
    capacitaciones: 0,
    usuariosPorRol: { administradores: 0, expertos: 0, operadores: 0 },
    actividadReciente: []
  });
  const [loading, setLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(true);

  // 📊 Cargar métricas del sistema
  const cargarMetricas = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando métricas del sistema...');
      const response = await fetch(`${API_URL}/api/metricas`);
      
      if (!response.ok) {
        console.warn('⚠️ Error en respuesta de métricas:', response.status);
        setBackendConnected(false);
        showError?.('Error conectando con el servidor', {
          message: 'No se pudieron cargar las métricas del sistema'
        });
        return;
      }
      
      const data = await response.json();
      console.log('📊 Datos de métricas recibidos:', data);
      
      if (data.metricas) {
        setMetricas(data.metricas);
        showSuccess?.('Métricas actualizadas', {
          message: 'Datos del sistema cargados correctamente'
        });
      } else {
        console.warn('⚠️ Estructura de métricas inesperada:', data);
        setBackendConnected(false);
        showError?.('Error al cargar métricas', {
          message: data.error || 'No se pudieron obtener las estadísticas'
        });
      }
    } catch (error) {
      console.error('❌ Error al cargar métricas:', error);
      setBackendConnected(false);
      showError?.('Error de conexión', {
        message: 'No se pudo conectar con el servidor'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarMetricas();
    // Mostrar notificación de bienvenida
    showInfo(`Bienvenido al panel de administración, ${user?.nombre_completo || user?.username}`, {
      message: 'Tienes acceso completo al sistema'
    });
  }, []);

  const handleLogout = () => {
    showSuccess('Sesión cerrada correctamente');
    logout();
    navigate('/login');
  };

  const handleTestNotifications = () => {
    showSuccess('¡Notificación de éxito!', {
      message: 'Esta es una notificación de prueba exitosa'
    });
    
    setTimeout(() => {
      showError('Notificación de error', {
        message: 'Esta es una notificación de error de prueba'
      });
    }, 1000);
    
    setTimeout(() => {
      showInfo('Notificación informativa', {
        message: 'Esta es una notificación informativa de prueba'
      });
    }, 2000);
  };

  return (
    <div className="dashboard-page">
      <div className="admin-dashboard">
        {/* 📋 Header del Administrador */}
        <div className="dashboard-header">
          <div className="user-welcome">
            <h1>🔧 Panel de Administración</h1>
            <p>Bienvenido, <strong>{user?.nombre_completo || user?.username}</strong></p>
            <span className="role-badge admin">Administrador del Sistema</span>
            {!backendConnected && (
              <div className="connection-warning">
                ⚠️ Backend desconectado - Algunas funciones pueden no estar disponibles
              </div>
            )}
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={handleTestNotifications}>
              🔔 Probar Notificaciones
            </button>
            <button className="btn-danger" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        {/* 📊 Métricas principales del sistema */}
        <div className="metrics-row">
          <div className="metric-card admin">
            <span className="metric-icon">👥</span>
            <div className="metric-info">
              <p className="metric-number">
                {loading ? '⏳' : metricas.usuarios}
              </p>
              <p className="metric-label">Usuarios Registrados</p>
            </div>
          </div>
          
          <div className="metric-card admin">
            <span className="metric-icon">📄</span>
            <div className="metric-info">
              <p className="metric-number">
                {loading ? '⏳' : metricas.documentos}
              </p>
              <p className="metric-label">Documentos Totales</p>
            </div>
          </div>
          
          <div className="metric-card admin">
            <span className="metric-icon">📚</span>
            <div className="metric-info">
              <p className="metric-number">
                {loading ? '⏳' : metricas.categorias}
              </p>
              <p className="metric-label">Categorías Activas</p>
            </div>
          </div>
          
          <div className="metric-card admin">
            <span className="metric-icon">🎓</span>
            <div className="metric-info">
              <p className="metric-number">
                {loading ? '⏳' : metricas.capacitaciones}
              </p>
              <p className="metric-label">Capacitaciones</p>
            </div>
          </div>
        </div>

        {/* 📈 Métricas adicionales por rol */}
        {!loading && metricas.usuariosPorRol && (
          <div className="role-metrics">
            <h3>👥 Distribución de Usuarios por Rol</h3>
            <div className="role-stats">
              <div className="role-stat admin">
                <span className="role-icon">🔧</span>
                <div className="role-info">
                  <p className="role-count">{metricas.usuariosPorRol.administradores}</p>
                  <p className="role-name">Administradores</p>
                </div>
              </div>
              
              <div className="role-stat expert">
                <span className="role-icon">🎓</span>
                <div className="role-info">
                  <p className="role-count">{metricas.usuariosPorRol.expertos}</p>
                  <p className="role-name">Expertos</p>
                </div>
              </div>
              
              <div className="role-stat operator">
                <span className="role-icon">⚙️</span>
                <div className="role-info">
                  <p className="role-count">{metricas.usuariosPorRol.operadores}</p>
                  <p className="role-name">Operadores</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🎯 Acciones de administración */}
        <div className="admin-actions">
          <h3>🎯 Administración del Sistema</h3>
          <div className="action-grid">
            <button 
              className="action-card primary"
              onClick={() => {
                showInfo('Navegando a gestión de usuarios');
                navigate('/usuarios');
              }}
            >
              <span className="action-icon">👥</span>
              <span className="action-title">Gestionar Usuarios</span>
              <span className="action-desc">Crear, editar y administrar usuarios</span>
            </button>

            <button 
              className="action-card primary"
              onClick={() => showInfo('Función en desarrollo')}
            >
              <span className="action-icon">📚</span>
              <span className="action-title">Gestionar Contenido</span>
              <span className="action-desc">Administrar categorías y documentos</span>
            </button>

            <button 
              className="action-card"
              onClick={() => showInfo('Función en desarrollo')}
            >
              <span className="action-icon">⚙️</span>
              <span className="action-title">Configuración</span>
              <span className="action-desc">Ajustes generales del sistema</span>
            </button>

            <button 
              className="action-card primary"
              onClick={() => {
                showInfo('Navegando a reportes del sistema');
                navigate('/reportes');
              }}
            >
              <span className="action-icon">📊</span>
              <span className="action-title">Reportes</span>
              <span className="action-desc">Estadísticas y análisis</span>
            </button>

            <button 
              className="action-card"
              onClick={() => showInfo('Función en desarrollo')}
            >
              <span className="action-icon">💾</span>
              <span className="action-title">Respaldos</span>
              <span className="action-desc">Backup y restauración</span>
            </button>

            <button 
              className="action-card"
              onClick={() => showInfo('Función en desarrollo')}
            >
              <span className="action-icon">📝</span>
              <span className="action-title">Logs del Sistema</span>
              <span className="action-desc">Registros y auditoría</span>
            </button>
          </div>
        </div>

        {/* 🔍 Actividad reciente del sistema */}
        <div className="system-activity">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>🔍 Actividad Reciente del Sistema</h3>
            <button 
              className="btn-small btn-secondary"
              onClick={cargarMetricas}
              disabled={loading}
            >
              {loading ? '⏳' : '🔄 Actualizar'}
            </button>
          </div>
          
          <div className="activity-feed">
            {loading ? (
              <div className="activity-item">
                <span className="activity-icon">⏳</span>
                <div className="activity-content">
                  <p>Cargando actividad reciente...</p>
                </div>
              </div>
            ) : metricas.actividadReciente && metricas.actividadReciente.length > 0 ? (
              metricas.actividadReciente.map((actividad, index) => (
                <div key={index} className="activity-item">
                  <span className="activity-icon">
                    {actividad.tipo === 'usuario' ? '👤' : 
                     actividad.tipo === 'documento' ? '📄' : 
                     actividad.tipo === 'capacitacion' ? '🎓' : '📊'}
                  </span>
                  <div className="activity-content">
                    <p>{actividad.descripcion}</p>
                    <span className="activity-time">
                      {new Date(actividad.fecha).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="activity-item">
                <span className="activity-icon">�</span>
                <div className="activity-content">
                  <p>No hay actividad reciente registrada</p>
                  <span className="activity-time">Sistema recién inicializado</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ⚠️ Alertas del sistema */}
        <div className="system-alerts">
          <h3>⚠️ Alertas del Sistema</h3>
          <div className="alerts-grid">
            <div className="alert-card warning">
              <span className="alert-icon">⚠️</span>
              <div className="alert-content">
                <h4>Respaldo Pendiente</h4>
                <p>El último respaldo se realizó hace 3 días</p>
                <button 
                  className="btn-small btn-warning"
                  onClick={() => showInfo('Ejecutando respaldo del sistema...')}
                >
                  Ejecutar Respaldo
                </button>
              </div>
            </div>
            
            <div className="alert-card info">
              <span className="alert-icon">📈</span>
              <div className="alert-content">
                <h4>Crecimiento de Usuarios</h4>
                <p>+15% de usuarios activos este mes</p>
                <button 
                  className="btn-small btn-secondary"
                  onClick={() => showInfo('Mostrando estadísticas detalladas...')}
                >
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;