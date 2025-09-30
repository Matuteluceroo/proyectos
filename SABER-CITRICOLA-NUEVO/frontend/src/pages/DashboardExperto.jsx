// 🧠 DashboardExperto.jsx - Portal del Experto
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardExperto = () => {
  const { user, logout, API_URL } = useAuth();
  const navigate = useNavigate();
  const [misDocumentos, setMisDocumentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [stats, setStats] = useState({
    documentosCreados: 0,
    capacitacionesImpartidas: 0,
    visualizacionesTotales: 0
  });

  // 📄 Cargar documentos del experto
  const cargarMisDocumentos = async () => {
    try {
      const response = await fetch(`${API_URL}/api/documentos?autor=${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setMisDocumentos(data.documentos);
        setStats(prev => ({
          ...prev,
          documentosCreados: data.documentos.length,
          visualizacionesTotales: data.documentos.reduce((sum, doc) => sum + (doc.vistas || 0), 0)
        }));
      }
    } catch (error) {
      console.error('Error al cargar documentos:', error);
    }
  };

  // 📚 Cargar categorías
  const cargarCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categorias`);
      const data = await response.json();
      
      if (response.ok) {
        setCategorias(data.categorias);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  useEffect(() => {
    cargarMisDocumentos();
    cargarCategorias();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <div className="expert-dashboard">
        {/* 📋 Header del Experto */}
        <div className="dashboard-header">
          <div className="user-welcome">
            <h1>🧠 Portal del Experto</h1>
            <p>Bienvenido, <strong>{user?.nombre_completo || user?.username}</strong></p>
            <span className="role-badge expert">Experto en Cítricos</span>
          </div>
          <button className="btn-danger" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>

        {/* 📊 Métricas del experto */}
        <div className="expert-metrics">
          <div className="metric-card expert">
            <div className="metric-icon">📄</div>
            <div className="metric-info">
              <h3>Mis Documentos</h3>
              <p className="metric-number">{stats.documentosCreados}</p>
              <small>Contenido creado</small>
            </div>
          </div>

          <div className="metric-card expert">
            <div className="metric-icon">🎓</div>
            <div className="metric-info">
              <h3>Capacitaciones</h3>
              <p className="metric-number">{stats.capacitacionesImpartidas}</p>
              <small>Cursos impartidos</small>
            </div>
          </div>

          <div className="metric-card expert">
            <div className="metric-icon">👁️</div>
            <div className="metric-info">
              <h3>Visualizaciones</h3>
              <p className="metric-number">{stats.visualizacionesTotales}</p>
              <small>Veces consultado</small>
            </div>
          </div>

          <div className="metric-card expert">
            <div className="metric-icon">⭐</div>
            <div className="metric-info">
              <h3>Valoración</h3>
              <p className="metric-number">4.8</p>
              <small>Promedio de calificaciones</small>
            </div>
          </div>
        </div>

        {/* 🎯 Acciones rápidas para expertos */}
        <div className="expert-actions">
          <h3>🎯 Gestión de Contenido</h3>
          <div className="action-grid">
            <button 
              className="action-card primary"
              onClick={() => navigate('/crear-documento')}
            >
              <span className="action-icon">📝</span>
              <span className="action-title">Crear Documento</span>
              <span className="action-desc">Nuevo contenido técnico</span>
            </button>

            <button 
              className="action-card primary"
              onClick={() => navigate('/crear-capacitacion')}
            >
              <span className="action-icon">🎓</span>
              <span className="action-title">Nueva Capacitación</span>
              <span className="action-desc">Diseñar curso de formación</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/mis-documentos')}
            >
              <span className="action-icon">📋</span>
              <span className="action-title">Mis Contenidos</span>
              <span className="action-desc">Gestionar publicaciones</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/biblioteca')}
            >
              <span className="action-icon">📚</span>
              <span className="action-title">Biblioteca</span>
              <span className="action-desc">Explorar conocimiento</span>
            </button>
          </div>
        </div>

        {/* 📚 Categorías de especialización */}
        <div className="specialization-areas">
          <h3>📚 Áreas de Conocimiento</h3>
          <div className="categories-grid">
            {categorias.map(categoria => (
              <div key={categoria.id} className="category-card">
                <span className="category-icon">{categoria.icono}</span>
                <h4>{categoria.nombre}</h4>
                <p>{categoria.descripcion}</p>
                <button 
                  className="btn-small btn-secondary"
                  onClick={() => navigate(`/categoria/${categoria.id}`)}
                >
                  Ver contenido
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 📄 Últimos documentos creados */}
        <div className="recent-documents">
          <h3>📄 Mis Últimas Publicaciones</h3>
          {misDocumentos.length === 0 ? (
            <div className="empty-state">
              <p>🆕 Aún no has creado contenido</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/crear-documento')}
              >
                Crear mi primer documento
              </button>
            </div>
          ) : (
            <div className="documents-list">
              {misDocumentos.slice(0, 5).map(documento => (
                <div key={documento.id} className="document-item">
                  <div className="document-info">
                    <h4>{documento.titulo}</h4>
                    <p>{documento.descripcion}</p>
                    <div className="document-meta">
                      <span className="document-type">{documento.tipo}</span>
                      <span className="document-views">👁️ {documento.vistas || 0} vistas</span>
                      <span className="document-date">
                        {new Date(documento.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="document-actions">
                    <button className="btn-small btn-secondary">✏️ Editar</button>
                    <button className="btn-small btn-secondary">👁️ Ver</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardExperto;