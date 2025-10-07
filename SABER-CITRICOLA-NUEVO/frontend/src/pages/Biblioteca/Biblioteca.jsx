// 📚 Biblioteca.jsx - Biblioteca de conocimiento citrícola
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Biblioteca.css';

const Biblioteca = () => {
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estados
  const [documentos, setDocumentos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vistaActual, setVistaActual] = useState('grid'); // 'grid' o 'lista'
  
  // Filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('recientes'); // 'recientes', 'populares', 'alfabetico'
  
  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalDocumentos: 0,
    totalAutores: 0,
    documentosRecientes: 0,
    categoriasMasUsadas: []
  });

  // Manejar parámetros URL para búsqueda por voz
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    
    if (query) {
      setBusqueda(query);
      console.log(`🎤 Aplicando búsqueda en biblioteca desde voz: ${query}`);
    }
  }, [location]);

  // 📄 Cargar documentos públicos
  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando documentos de la biblioteca...');
      
      const response = await fetch(`${API_URL}/api/documentos?nivel_acceso=publico&limite=100`);
      
      if (!response.ok) {
        console.warn('⚠️ Error en respuesta de documentos:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('📚 Datos de biblioteca recibidos:', data);
      
      if (data.success) {
        const docs = data.data?.documentos || [];
        setDocumentos(docs);
        calcularEstadisticas(docs);
      } else {
        const docs = data.documentos || [];
        setDocumentos(docs);
        calcularEstadisticas(docs);
      }
    } catch (error) {
      console.error('❌ Error al cargar biblioteca:', error);
      setDocumentos([]);
    } finally {
      setLoading(false);
    }
  };

  // 📚 Cargar categorías
  const cargarCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categorias`);
      
      if (!response.ok) {
        console.warn('⚠️ Error en respuesta de categorías:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('📂 Categorías recibidas:', data);
      
      if (data.success) {
        setCategorias(data.data || []);
      } else {
        setCategorias(data.categorias || []);
      }
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
      setCategorias([]);
    }
  };

  // 📊 Calcular estadísticas
  const calcularEstadisticas = (docs) => {
    const autoresUnicos = [...new Set(docs.map(doc => doc.autor_id))];
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7); // Últimos 7 días
    
    const recientes = docs.filter(doc => 
      new Date(doc.created_at) > fechaLimite
    );

    // Contar documentos por categoría
    const categoriaCount = {};
    docs.forEach(doc => {
      if (doc.categoria_nombre) {
        categoriaCount[doc.categoria_nombre] = (categoriaCount[doc.categoria_nombre] || 0) + 1;
      }
    });

    const categoriasMasUsadas = Object.entries(categoriaCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    setEstadisticas({
      totalDocumentos: docs.length,
      totalAutores: autoresUnicos.length,
      documentosRecientes: recientes.length,
      categoriasMasUsadas
    });
  };

  // 🔍 Filtrar y ordenar documentos
  const documentosFiltrados = documentos
    .filter(doc => {
      const coincideBusqueda = !busqueda || 
        doc.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        doc.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        doc.keywords?.toLowerCase().includes(busqueda.toLowerCase());
      
      const coincibeCategoria = !categoriaFiltro || 
        doc.categoria_id === parseInt(categoriaFiltro);
      
      const coincideTipo = !tipoFiltro || doc.tipo === tipoFiltro;
      
      return coincideBusqueda && coincibeCategoria && coincideTipo;
    })
    .sort((a, b) => {
      switch (ordenamiento) {
        case 'populares':
          return (b.vistas || 0) - (a.vistas || 0);
        case 'alfabetico':
          return a.titulo.localeCompare(b.titulo);
        case 'recientes':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // 🎯 Efectos
  useEffect(() => {
    cargarDocumentos();
    cargarCategorias();
  }, []);

  // 📥 Manejar descarga de archivo
  const manejarDescarga = (documento) => {
    if (documento?.archivo_url) {
      try {
        const urlCompleta = `${API_URL}${documento.archivo_url}`;
        console.log('🔄 Intentando descargar:', urlCompleta);
        
        // Crear un elemento <a> temporal para forzar la descarga
        const link = document.createElement('a');
        link.href = urlCompleta;
        link.download = documento.archivo_nombre_original || 'documento';
        link.target = '_blank';
        
        // Añadir al DOM, hacer click y remover
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Descarga iniciada');
      } catch (error) {
        console.error('❌ Error al descargar:', error);
        alert('Error al descargar el archivo. Por favor, intenta de nuevo.');
      }
    } else {
      alert('No hay archivo disponible para descargar.');
    }
  };

  // 📄 Renderizar documento en grid
  const renderDocumentoGrid = (documento) => (
    <div key={documento.id} className="documento-card-biblioteca">
      <div className="documento-header">
        <div className="documento-tipo">
          {documento.tipo === 'documento' && '📄'}
          {documento.tipo === 'guia' && '📋'}
          {documento.tipo === 'procedimiento' && '⚙️'}
          {documento.tipo === 'capacitacion' && '🎓'}
          <span>{documento.tipo}</span>
        </div>
        <div className="documento-fecha">
          {new Date(documento.created_at).toLocaleDateString()}
        </div>
      </div>
      
      <div className="documento-contenido">
        <h3>{documento.titulo}</h3>
        <p className="documento-descripcion">{documento.descripcion}</p>
        
        <div className="documento-metadata">
          {documento.categoria_nombre && (
            <span className="categoria-tag">
              {documento.categoria_icono} {documento.categoria_nombre}
            </span>
          )}
          <span className="autor-tag">
            👤 {documento.autor_nombre || 'Autor desconocido'}
          </span>
        </div>
        
        <div className="documento-stats">
          <span className="stat-item">
            <span className="stat-icon">👁️</span>
            <span>{documento.vistas || 0} visualizaciones</span>
          </span>
          {documento.archivo_url && (
            <span className="stat-item">
              <span className="stat-icon">📎</span>
              <span>Archivo adjunto</span>
            </span>
          )}
        </div>
      </div>
      
      <div className="documento-acciones">
        <button 
          className="btn-ver"
          onClick={() => navigate(`/documento/${documento.id}`)}
        >
          👁️ Ver Documento
        </button>
        {documento.archivo_url && (
          <button 
            className="btn-descargar"
            onClick={() => manejarDescarga(documento)}
          >
            📥 Descargar
          </button>
        )}
      </div>
    </div>
  );

  // 📋 Renderizar documento en lista
  const renderDocumentoLista = (documento) => (
    <div key={documento.id} className="documento-lista-item">
      <div className="documento-lista-info">
        <div className="documento-lista-header">
          <h4>{documento.titulo}</h4>
          <div className="documento-lista-metadata">
            <span className="tipo-badge">{documento.tipo}</span>
            <span className="fecha-texto">{new Date(documento.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <p className="documento-lista-descripcion">{documento.descripcion}</p>
        <div className="documento-lista-footer">
          <span className="autor-info">👤 {documento.autor_nombre}</span>
          <span className="categoria-info">{documento.categoria_icono} {documento.categoria_nombre}</span>
          <span className="vistas-info">👁️ {documento.vistas || 0} visualizaciones</span>
        </div>
      </div>
      <div className="documento-lista-acciones">
        <button 
          className="btn-lista-ver"
          onClick={() => navigate(`/documento/${documento.id}`)}
        >
          Ver
        </button>
        {documento.archivo_url && (
          <button 
            className="btn-lista-descargar"
            onClick={() => manejarDescarga(documento)}
          >
            📥
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="biblioteca-page">
      {/* Header */}
      <div className="biblioteca-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📚 Biblioteca de Conocimiento</h1>
            <p>Explora toda la documentación técnica disponible</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-volver"
              onClick={() => navigate('/dashboard')}
            >
              🏠 Volver al Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="biblioteca-stats">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>{estadisticas.totalDocumentos}</h3>
            <p>Documentos Totales</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{estadisticas.totalAutores}</h3>
            <p>Autores Activos</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🆕</div>
          <div className="stat-info">
            <h3>{estadisticas.documentosRecientes}</h3>
            <p>Nuevos (7 días)</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-info">
            <h3>{estadisticas.categoriasMasUsadas[0]?.nombre || 'N/A'}</h3>
            <p>Categoría Popular</p>
          </div>
        </div>
      </div>

      {/* Controles de búsqueda y filtros */}
      <div className="biblioteca-controles">
        <div className="busqueda-section">
          <div className="busqueda-principal">
            <input
              type="text"
              placeholder="🔍 Buscar documentos, autores, palabras clave..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="busqueda-input"
            />
          </div>
          
          <div className="filtros-section">
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="filtro-select"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.icono} {categoria.nombre}
                </option>
              ))}
            </select>
            
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="filtro-select"
            >
              <option value="">Todos los tipos</option>
              <option value="documento">📄 Documentos</option>
              <option value="guia">📋 Guías</option>
              <option value="procedimiento">⚙️ Procedimientos</option>
              <option value="capacitacion">🎓 Capacitaciones</option>
            </select>
            
            <select
              value={ordenamiento}
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="filtro-select"
            >
              <option value="recientes">📅 Más recientes</option>
              <option value="populares">🔥 Más populares</option>
              <option value="alfabetico">🔤 Alfabético</option>
            </select>
          </div>
        </div>
        
        <div className="vista-controles">
          <div className="vista-selector">
            <button
              className={`vista-btn ${vistaActual === 'grid' ? 'active' : ''}`}
              onClick={() => setVistaActual('grid')}
            >
              ⊞ Grid
            </button>
            <button
              className={`vista-btn ${vistaActual === 'lista' ? 'active' : ''}`}
              onClick={() => setVistaActual('lista')}
            >
              ☰ Lista
            </button>
          </div>
          
          <div className="resultados-info">
            {documentosFiltrados.length} de {documentos.length} documentos
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="biblioteca-contenido">
        {loading ? (
          <div className="loading-biblioteca">
            <div className="loading-spinner"></div>
            <p>Cargando biblioteca de conocimiento...</p>
          </div>
        ) : documentosFiltrados.length === 0 ? (
          <div className="empty-biblioteca">
            <div className="empty-icon">📚</div>
            <h3>No se encontraron documentos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
          </div>
        ) : (
          <div className={`documentos-container ${vistaActual}`}>
            {vistaActual === 'grid' ? (
              <div className="documentos-grid-biblioteca">
                {documentosFiltrados.map(renderDocumentoGrid)}
              </div>
            ) : (
              <div className="documentos-lista-biblioteca">
                {documentosFiltrados.map(renderDocumentoLista)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Biblioteca;