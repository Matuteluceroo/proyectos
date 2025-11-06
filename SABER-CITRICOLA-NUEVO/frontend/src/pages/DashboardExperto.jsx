// 🧠 DashboardExperto.jsx - Portal del Experto
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { obtenerDocumentos, obtenerCategorias } from '../services/gestionContenidoAPI';
import NotificacionesPanel from '../components/NotificacionesPanel/NotificacionesPanel';
import './DashboardExperto.css'; // 🎨 Estilos del portal del experto

const DashboardExperto = () => {
  const { user, logout, API_URL } = useAuth();
  const navigate = useNavigate();
  const [misDocumentos, setMisDocumentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [backendConnected, setBackendConnected] = useState(true);
  const [stats, setStats] = useState({
    documentosCreados: 0,
    capacitacionesImpartidas: 0,
    visualizacionesTotales: 0
  });

  // 📄 Cargar documentos del experto
  const cargarMisDocumentos = async () => {
    try {
      console.log('🔄 Cargando documentos del experto...');
      const data = await obtenerDocumentos({ autor: user?.id || 1 });
      
      console.log('📄 Datos de documentos recibidos:', data);
      const documentos = data.data?.documentos || data.documentos || [];
      setMisDocumentos(documentos);
      setStats(prev => ({
        ...prev,
        documentosCreados: documentos.length,
        visualizacionesTotales: documentos.reduce((sum, doc) => sum + (doc.vistas || 0), 0)
      }));
      setBackendConnected(true);
    } catch (error) {
      console.error('❌ Error al cargar documentos:', error);
      setMisDocumentos([]);
      setBackendConnected(false);
    }
  };

  // 📚 Cargar categorías
  const cargarCategorias = async () => {
    try {
      console.log('🔄 Cargando categorías...');
      const data = await obtenerCategorias();
      
      console.log('📚 Datos de categorías recibidos:', data);
      setCategorias(Array.isArray(data) ? data : (data.data || data.categorias || []));
      setBackendConnected(true);
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
      setCategorias([]);
      setBackendConnected(false);
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
            {!backendConnected && (
              <div className="connection-warning">
                ⚠️ Backend desconectado - Algunas funciones pueden no estar disponibles
              </div>
            )}
          </div>
          <div className="header-actions" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <NotificacionesPanel />
            <button className="btn-danger" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
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
              className="action-card secondary"
              onClick={() => navigate('/mis-documentos')}
            >
              <span className="action-icon">📋</span>
              <span className="action-title">Mis Contenidos</span>
              <span className="action-desc">Gestionar mis publicaciones</span>
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

        {/* 📚 Categorías de especialización - Rediseñada */}
        <div className="specialization-areas">
          <div className="section-header">
            <h3>📚 Áreas de Conocimiento</h3>
            <p className="section-desc">Explora las diferentes categorías de contenido técnico</p>
          </div>
          
          {categorias.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p>No hay categorías disponibles</p>
              <small>Las categorías se cargarán automáticamente desde el backend</small>
            </div>
          ) : (
            <div className="categories-grid enhanced">
              {categorias.map(categoria => (
                <div key={categoria.id} className="category-card enhanced">
                  <div className="category-header">
                    <span className="category-icon-large">{categoria.icono}</span>
                    <div className="category-title">
                      <h4>{categoria.nombre}</h4>
                      <span className="category-badge">Especialización</span>
                    </div>
                  </div>
                  
                  <div className="category-content">
                    <p className="category-description">{categoria.descripcion}</p>
                    
                    <div className="category-stats">
                      <span className="stat-item">
                        <span className="stat-icon">📄</span>
                        <span className="stat-text">Documentos técnicos</span>
                      </span>
                      <span className="stat-item">
                        <span className="stat-icon">🎯</span>
                        <span className="stat-text">Área especializada</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="category-actions">
                    <button 
                      className="btn-primary btn-small"
                      onClick={() => navigate(`/categoria/${categoria.id}`)}
                    >
                      🔍 Explorar contenido
                    </button>
                    <button 
                      className="btn-secondary btn-small"
                      onClick={() => navigate('/crear-documento', { state: { categoriaId: categoria.id } })}
                    >
                      ➕ Crear aquí
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 📄 Últimos documentos creados - Mejorado */}
        <div className="recent-documents">
          <div className="section-header">
            <h3>📄 Mis Últimas Publicaciones</h3>
            <p className="section-desc">Gestiona y revisa tus documentos más recientes</p>
          </div>
          
          {misDocumentos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>🆕 Aún no has creado contenido</p>
              <small>Comienza creando tu primer documento técnico</small>
              <div className="empty-actions">
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/crear-documento')}
                >
                  📝 Crear mi primer documento
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => navigate('/mis-documentos')}
                >
                  📁 Ver todos mis documentos
                </button>
              </div>
            </div>
          ) : (
            <div className="documents-list enhanced">
              {misDocumentos.slice(0, 3).map(documento => (
                <div key={documento.id} className="document-item enhanced">
                  <div className="document-header">
                    <div className="document-type-badge">
                      {documento.tipo === 'documento' && '📄'}
                      {documento.tipo === 'guia' && '📋'}
                      {documento.tipo === 'procedimiento' && '⚙️'}
                      {documento.tipo === 'capacitacion' && '🎓'}
                      <span>{documento.tipo}</span>
                    </div>
                    <div className="document-status">
                      {documento.estado === 'publicado' && <span className="status-badge published">✅ Publicado</span>}
                      {documento.estado === 'borrador' && <span className="status-badge draft">📝 Borrador</span>}
                      {documento.estado === 'revision' && <span className="status-badge review">🔍 En revisión</span>}
                    </div>
                  </div>
                  
                  <div className="document-content">
                    <h4>{documento.titulo}</h4>
                    <p className="document-description">{documento.descripcion}</p>
                    
                    <div className="document-meta enhanced">
                      <span className="meta-item">
                        <span className="meta-icon">👁️</span>
                        <span>{documento.vistas || 0} vistas</span>
                      </span>
                      <span className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span>{new Date(documento.created_at).toLocaleDateString()}</span>
                      </span>
                      {documento.archivo_url && (
                        <span className="meta-item">
                          <span className="meta-icon">📎</span>
                          <span>Con archivo</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="document-actions enhanced">
                    <button 
                      className="btn-small btn-primary"
                      onClick={() => navigate(`/documento/${documento.id}`)}
                    >
                      👁️ Ver
                    </button>
                    <button 
                      className="btn-small btn-secondary"
                      onClick={() => navigate(`/editar-documento/${documento.id}`)}
                    >
                      ✏️ Editar
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Botón para ver todos los documentos */}
              {misDocumentos.length > 0 && (
                <div className="view-all-section">
                  <button 
                    className="btn-secondary btn-full"
                    onClick={() => navigate('/mis-documentos')}
                  >
                    📁 Ver todos mis documentos ({misDocumentos.length})
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardExperto;