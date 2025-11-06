// ⚙️ DashboardOperador.jsx - Portal del Operador
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { obtenerDocumentos, obtenerCategorias } from '../services/gestionContenidoAPI';
import VoiceSearch from '../components/VoiceSearch/VoiceSearch';
import NotificacionesPanel from '../components/NotificacionesPanel/NotificacionesPanel';
import './DashboardOperador.css'; // 🎨 Estilos del portal del operador

const DashboardOperador = () => {
  const { user, logout, API_URL } = useAuth();
  const navigate = useNavigate();
  const [documentosRecientes, setDocumentosRecientes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [backendConnected, setBackendConnected] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  // 📄 Cargar documentos recientes
  const cargarDocumentosRecientes = async () => {
    try {
      console.log('🔄 Cargando documentos recientes...');
      const data = await obtenerDocumentos({ limite: 6, orden: 'created_at', direccion: 'DESC' });
      
      console.log('📄 Datos de documentos recibidos:', data);
      const documentos = data.data?.documentos || data.documentos || [];
      setDocumentosRecientes(documentos.slice(0, 6));
      setBackendConnected(true);
    } catch (error) {
      console.error('❌ Error al cargar documentos:', error);
      setDocumentosRecientes([]);
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

  const handleVoiceResult = (transcript, isFinal) => {
    // Actualizar el campo de búsqueda con el transcript
    setBusqueda(transcript);
    console.log('🎤 Transcript recibido:', transcript, 'Final:', isFinal);
  };

  const handleVoiceSearch = (searchTerm) => {
    // Mapeo de comandos de voz a rutas funcionales existentes
    const voiceRoutes = {
      'control de plagas': '/biblioteca?q=control%20de%20plagas',
      'técnicas de poda': '/biblioteca?q=poda',
      'fertilización': '/biblioteca?q=fertilización',
      'fertilización orgánica': '/biblioteca?q=fertilización%20orgánica',
      'sistemas de riego': '/biblioteca?q=riego',
      'técnicas de injerto': '/biblioteca?q=injerto',
      'enfermedades citricolas': '/biblioteca?q=enfermedades',
      'plagas': '/biblioteca?q=plagas',
      'poda': '/biblioteca?q=poda',
      'riego': '/biblioteca?q=riego',
      'injerto': '/biblioteca?q=injerto',
      'enfermedad': '/biblioteca?q=enfermedades',
      'hongos': '/biblioteca?q=hongos',
      
      // Rutas generales
      'biblioteca': '/biblioteca',
      'capacitaciones': '/capacitaciones',
      'documentos': '/biblioteca',
      'ayuda': '/biblioteca?q=ayuda',
      'procedimientos': '/biblioteca?q=procedimientos',
      'guías': '/biblioteca?q=guías',
      'guias': '/biblioteca?q=guias'
    };

    const normalizedTerm = searchTerm.toLowerCase().trim();
    
    // Buscar coincidencia exacta
    if (voiceRoutes[normalizedTerm]) {
      console.log(`🎯 Navegando directamente a: ${voiceRoutes[normalizedTerm]}`);
      // Mostrar mensaje de éxito
      if (window.showNotification) {
        window.showNotification(`🎯 Navegando a información sobre: ${normalizedTerm}`, 'success');
      }
      navigate(voiceRoutes[normalizedTerm]);
      return;
    }
    
    // Buscar coincidencia parcial
    for (const [key, route] of Object.entries(voiceRoutes)) {
      if (normalizedTerm.includes(key) || key.includes(normalizedTerm)) {
        console.log(`🎯 Coincidencia parcial encontrada: ${key} -> ${route}`);
        if (window.showNotification) {
          window.showNotification(`🎯 Encontrado: ${key}`, 'success');
        }
        navigate(route);
        return;
      }
    }
    
    // Si no hay coincidencia, ir a biblioteca como fallback
    console.log(`📚 Sin coincidencia específica, navegando a biblioteca con búsqueda: ${searchTerm}`);
    if (window.showNotification) {
      window.showNotification(`📚 Buscando en biblioteca: ${searchTerm}`, 'info');
    }
    navigate(`/biblioteca?q=${encodeURIComponent(searchTerm.trim())}`);
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

        {/* 🔍 Búsqueda rápida */}
        <div className="quick-search">
          <h3>🔍 Buscar Conocimiento</h3>
          
          {/* Búsqueda tradicional por texto */}
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

          {/* Separador */}
          <div className="search-separator">
            <span className="separator-line"></span>
            <span className="separator-text">o busca por voz</span>
            <span className="separator-line"></span>
          </div>

          {/* Búsqueda por voz */}
          <div className="voice-search-section">
            <VoiceSearch 
              onVoiceResult={handleVoiceResult}
              onSearchSubmit={handleVoiceSearch}
              placeholder="¿Qué necesitas aprender hoy?"
            />
          </div>
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
      </div>
    </div>
  );
};

export default DashboardOperador;