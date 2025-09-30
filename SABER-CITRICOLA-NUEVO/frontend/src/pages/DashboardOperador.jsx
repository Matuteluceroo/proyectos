// ⚙️ DashboardOperador.jsx - Portal del Operador
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardOperador = () => {
  const { user, logout, API_URL } = useAuth();
  const navigate = useNavigate();
  const [documentosRecientes, setDocumentosRecientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  // 📄 Cargar documentos recientes
  const cargarDocumentosRecientes = async () => {
    try {
      const response = await fetch(`${API_URL}/api/documentos?rol=operador`);
      const data = await response.json();
      
      if (response.ok) {
        setDocumentosRecientes(data.documentos.slice(0, 6));
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
    cargarDocumentosRecientes();
    cargarCategorias();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBusqueda = (e) => {
    e.preventDefault();
    if (busqueda.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(busqueda)}`);
    }
  };

  return (
    <div className="dashboard-page">
      <div className="operator-dashboard">
        {/* 📋 Header del Operador */}
        <div className="dashboard-header">
          <div className="user-welcome">
            <h1>⚙️ Portal del Operador</h1>
            <p>Bienvenido, <strong>{user?.nombre_completo || user?.username}</strong></p>
            <span className="role-badge operator">Operador Citrícola</span>
          </div>
          <button className="btn-danger" onClick={handleLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>

        {/* 🔍 Búsqueda rápida */}
        <div className="quick-search">
          <h3>🔍 Buscar Conocimiento</h3>
          <form onSubmit={handleBusqueda} className="search-form">
            <input
              type="text"
              placeholder="¿Qué necesitas aprender hoy? (ej: control de plagas, poda, fertilización...)"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-primary search-btn">
              🔍 Buscar
            </button>
          </form>
        </div>

        {/* 📚 Categorías de acceso rápido */}
        <div className="quick-categories">
          <h3>📚 Explorar por Categoría</h3>
          <div className="categories-grid">
            {categorias.map(categoria => (
              <button
                key={categoria.id}
                className="category-quick-card"
                onClick={() => navigate(`/categoria/${categoria.id}`)}
                style={{ borderColor: categoria.color }}
              >
                <span className="category-icon" style={{ color: categoria.color }}>
                  {categoria.icono}
                </span>
                <span className="category-name">{categoria.nombre}</span>
                <span className="category-arrow">→</span>
              </button>
            ))}
          </div>
        </div>

        {/* 🎯 Acciones principales para operadores */}
        <div className="operator-actions">
          <h3>🎯 Acceso Rápido</h3>
          <div className="action-grid">
            <button 
              className="action-card primary"
              onClick={() => navigate('/biblioteca')}
            >
              <span className="action-icon">📚</span>
              <span className="action-title">Biblioteca</span>
              <span className="action-desc">Explorar todo el conocimiento</span>
            </button>

            <button 
              className="action-card primary"
              onClick={() => navigate('/capacitaciones')}
            >
              <span className="action-icon">🎓</span>
              <span className="action-title">Capacitaciones</span>
              <span className="action-desc">Cursos y entrenamientos</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/guias-rapidas')}
            >
              <span className="action-icon">⚡</span>
              <span className="action-title">Guías Rápidas</span>
              <span className="action-desc">Consulta inmediata</span>
            </button>

            <button 
              className="action-card"
              onClick={() => navigate('/procedimientos')}
            >
              <span className="action-icon">📋</span>
              <span className="action-title">Procedimientos</span>
              <span className="action-desc">Paso a paso detallado</span>
            </button>
          </div>
        </div>

        {/* 📄 Contenido reciente */}
        <div className="recent-content">
          <h3>📄 Contenido Reciente</h3>
          <div className="documents-grid">
            {documentosRecientes.map(documento => (
              <div key={documento.id} className="document-card operator">
                <div className="document-header">
                  <span className="document-type">{documento.tipo}</span>
                  <span className="document-date">
                    {new Date(documento.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4>{documento.titulo}</h4>
                <p>{documento.descripcion}</p>
                <div className="document-footer">
                  <span className="document-author">
                    Por: {documento.autor_nombre}
                  </span>
                  <button 
                    className="btn-small btn-primary"
                    onClick={() => navigate(`/documento/${documento.id}`)}
                  >
                    Ver →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🎓 Mis capacitaciones en progreso */}
        <div className="my-training">
          <h3>🎓 Mi Progreso de Capacitación</h3>
          <div className="training-summary">
            <div className="training-stat">
              <span className="stat-icon">📈</span>
              <div className="stat-info">
                <p className="stat-number">3</p>
                <p className="stat-label">Cursos en progreso</p>
              </div>
            </div>
            <div className="training-stat">
              <span className="stat-icon">✅</span>
              <div className="stat-info">
                <p className="stat-number">12</p>
                <p className="stat-label">Completados</p>
              </div>
            </div>
            <div className="training-stat">
              <span className="stat-icon">🏆</span>
              <div className="stat-info">
                <p className="stat-number">85%</p>
                <p className="stat-label">Progreso general</p>
              </div>
            </div>
          </div>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/mi-progreso')}
          >
            Ver detalle completo →
          </button>
        </div>

        {/* 💡 Consejo del día */}
        <div className="daily-tip">
          <h3>💡 Consejo del Día</h3>
          <div className="tip-card">
            <p>
              <strong>🍊 Identificación de plagas temprana:</strong> 
              Revisa la parte inferior de las hojas en las primeras horas de la mañana. 
              Es el momento ideal para detectar ácaros y otros insectos antes de que se propaguen.
            </p>
            <button className="btn-link">
              Leer más sobre control de plagas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOperador;