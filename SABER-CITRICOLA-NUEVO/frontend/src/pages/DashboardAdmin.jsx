// 👑 DashboardAdmin.jsx - Panel del Administrador
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardAdmin = () => {
  const { user, logout, API_URL } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsuarios: 0,
    totalDocumentos: 0,
    totalCategorias: 0,
    totalCapacitaciones: 0
  });
  const [usuarios, setUsuarios] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 📊 Cargar estadísticas del sistema
  const cargarEstadisticas = async () => {
    setIsLoading(true);
    try {
      // Obtener usuarios
      const usuariosRes = await fetch(`${API_URL}/api/usuarios`);
      const usuariosData = await usuariosRes.json();
      
      // Obtener categorías
      const categoriasRes = await fetch(`${API_URL}/api/categorias`);
      const categoriasData = await categoriasRes.json();
      
      // Obtener documentos
      const documentosRes = await fetch(`${API_URL}/api/documentos?rol=administrador`);
      const documentosData = await documentosRes.json();

      if (usuariosRes.ok) {
        setUsuarios(usuariosData.usuarios);
        setStats(prev => ({
          ...prev,
          totalUsuarios: usuariosData.usuarios.length
        }));
      }

      if (categoriasRes.ok) {
        setStats(prev => ({
          ...prev,
          totalCategorias: categoriasData.categorias.length
        }));
      }

      if (documentosRes.ok) {
        setStats(prev => ({
          ...prev,
          totalDocumentos: documentosData.documentos.length
        }));
      }

    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 📊 Contar usuarios por rol
  const usuariosPorRol = usuarios.reduce((acc, usuario) => {
    acc[usuario.rol] = (acc[usuario.rol] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="dashboard-page">
      <div className="admin-dashboard">
        {/* 📋 Header del Administrador */}
        <div className="dashboard-header">
          <div className="user-welcome">
            <h1>👑 Panel de Administración</h1>
            <p>Bienvenido, <strong>{user?.nombre_completo || user?.username}</strong></p>
            <span className="role-badge admin">Administrador</span>
          </div>
          <button className="btn-danger" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>

        {/* 📊 Métricas principales */}
        <div className="admin-metrics">
          <div className="metric-card admin">
            <div className="metric-icon">👥</div>
            <div className="metric-info">
              <h3>Usuarios</h3>
              <p className="metric-number">{stats.totalUsuarios}</p>
              <small>Total registrados</small>
            </div>
          </div>

          <div className="metric-card admin">
            <div className="metric-icon">📚</div>
            <div className="metric-info">
              <h3>Categorías</h3>
              <p className="metric-number">{stats.totalCategorias}</p>
              <small>Áreas de conocimiento</small>
            </div>
          </div>

          <div className="metric-card admin">
            <div className="metric-icon">📄</div>
            <div className="metric-info">
              <h3>Documentos</h3>
              <p className="metric-number">{stats.totalDocumentos}</p>
              <small>Contenido disponible</small>
            </div>
          </div>

          <div className="metric-card admin">
            <div className="metric-icon">🎓</div>
            <div className="metric-info">
              <h3>Capacitaciones</h3>
              <p className="metric-number">{stats.totalCapacitaciones}</p>
              <small>Cursos activos</small>
            </div>
          </div>
        </div>

        {/* 📊 Distribución de usuarios por rol */}
        <div className="role-distribution">
          <h3>📊 Distribución de Usuarios por Rol</h3>
          <div className="role-stats">
            <div className="role-stat admin">
              <span className="role-icon">👑</span>
              <span className="role-name">Administradores</span>
              <span className="role-count">{usuariosPorRol.administrador || 0}</span>
            </div>
            <div className="role-stat expert">
              <span className="role-icon">🧠</span>
              <span className="role-name">Expertos</span>
              <span className="role-count">{usuariosPorRol.experto || 0}</span>
            </div>
            <div className="role-stat operator">
              <span className="role-icon">⚙️</span>
              <span className="role-name">Operadores</span>
              <span className="role-count">{usuariosPorRol.operador || 0}</span>
            </div>
          </div>
        </div>

        {/* 🎯 Acciones administrativas */}
        <div className="admin-actions">
          <h3>🎯 Acciones Administrativas</h3>
          <div className="action-grid">
            <button 
              className="action-card"
              onClick={() => navigate('/usuarios')}
            >
              <span className="action-icon">👥</span>
              <span className="action-title">Gestionar Usuarios</span>
              <span className="action-desc">Crear, editar y asignar roles</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/categorias')}
            >
              <span className="action-icon">📚</span>
              <span className="action-title">Gestionar Categorías</span>
              <span className="action-desc">Organizar áreas de conocimiento</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/documentos')}
            >
              <span className="action-icon">📄</span>
              <span className="action-title">Revisar Contenido</span>
              <span className="action-desc">Aprobar y gestionar documentos</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/metricas')}
            >
              <span className="action-icon">📊</span>
              <span className="action-title">Ver Métricas</span>
              <span className="action-desc">Indicadores del sistema</span>
            </button>
          </div>
        </div>

        {/* ⚡ Actividad reciente */}
        <div className="recent-activity">
          <h3>⚡ Actividad Reciente</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">👤</span>
              <span className="activity-text">Nuevos usuarios registrados hoy</span>
              <span className="activity-count">3</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">📄</span>
              <span className="activity-text">Documentos subidos esta semana</span>
              <span className="activity-count">8</span>
            </div>
            <div className="activity-item">
              <span className="activity-icon">🎓</span>
              <span className="activity-text">Capacitaciones completadas</span>
              <span className="activity-count">15</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;