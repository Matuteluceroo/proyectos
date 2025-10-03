// 📂 CategoriaDetalle.jsx - Vista de documentos por categoría específica
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CategoriaDetalle.css';

const CategoriaDetalle = () => {
  const { id } = useParams();
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [categoria, setCategoria] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtros locales
  const [tipoFiltro, setTipoFiltro] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('recientes');

  // Estadísticas de la categoría
  const [estadisticas, setEstadisticas] = useState({
    totalDocumentos: 0,
    documentosTecnicos: 0,
    areasEspecializadas: 0,
    documentosRecientes: 0
  });

  // 📂 Cargar información de la categoría
  const cargarCategoria = async () => {
    try {
      console.log('🔄 Cargando categoría ID:', id);
      
      const response = await fetch(`${API_URL}/api/categorias`);
      if (!response.ok) throw new Error('Error al cargar categorías');
      
      const data = await response.json();
      const categoriasData = data.success ? data.data : data.categorias || [];
      
      const categoriaEncontrada = categoriasData.find(cat => cat.id === parseInt(id));
      
      if (categoriaEncontrada) {
        setCategoria(categoriaEncontrada);
        console.log('📂 Categoría encontrada:', categoriaEncontrada);
      } else {
        setError('Categoría no encontrada');
      }
    } catch (error) {
      console.error('❌ Error al cargar categoría:', error);
      setError('Error al cargar la categoría');
    }
  };

  // 📄 Cargar documentos de la categoría
  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando documentos de categoría:', id);
      
      const response = await fetch(`${API_URL}/api/documentos?categoria_id=${id}&limite=50`);
      if (!response.ok) throw new Error('Error al cargar documentos');
      
      const data = await response.json();
      console.log('📄 Datos recibidos:', data);
      
      const docs = data.success ? data.data?.documentos || [] : data.documentos || [];
      setDocumentos(docs);
      calcularEstadisticas(docs);
      
    } catch (error) {
      console.error('❌ Error al cargar documentos:', error);
      setError('Error al cargar documentos de la categoría');
    } finally {
      setLoading(false);
    }
  };

  // 📊 Calcular estadísticas específicas
  const calcularEstadisticas = (docs) => {
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);
    
    const recientes = docs.filter(doc => new Date(doc.created_at) > fechaLimite);
    const tecnicos = docs.filter(doc => doc.tipo === 'documento');
    const especializadas = docs.filter(doc => doc.tipo === 'procedimiento' || doc.tipo === 'guia');
    
    setEstadisticas({
      totalDocumentos: docs.length,
      documentosTecnicos: tecnicos.length,
      areasEspecializadas: especializadas.length,
      documentosRecientes: recientes.length
    });
  };

  // 📥 Manejar descarga de archivo
  const manejarDescarga = (documento) => {
    if (documento?.archivo_url) {
      try {
        const urlCompleta = `${API_URL}${documento.archivo_url}`;
        const link = document.createElement('a');
        link.href = urlCompleta;
        link.download = documento.archivo_nombre_original || 'documento';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('❌ Error al descargar:', error);
        alert('Error al descargar el archivo');
      }
    }
  };

  // 🔍 Filtrar documentos
  const documentosFiltrados = documentos
    .filter(doc => {
      const coincideBusqueda = !busqueda || 
        doc.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
        doc.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
      
      const coincideTipo = !tipoFiltro || doc.tipo === tipoFiltro;
      
      return coincideBusqueda && coincideTipo;
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
    if (id) {
      cargarCategoria();
      cargarDocumentos();
    }
  }, [id]);

  // 🔄 Estados de carga y error
  if (loading) {
    return (
      <div className="categoria-detalle-page">
        <div className="loading-categoria">
          <div className="loading-spinner"></div>
          <p>Cargando contenido de la categoría...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categoria-detalle-page">
        <div className="error-categoria">
          <div className="error-icon">❌</div>
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/dashboard')} className="btn-volver">
            🏠 Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="categoria-detalle-page">
      {/* Header de la categoría */}
      <div className="categoria-header">
        <div className="header-content">
          <div className="header-nav">
            <button onClick={() => navigate('/dashboard')} className="btn-nav">
              ← Dashboard
            </button>
            <button onClick={() => navigate('/biblioteca')} className="btn-nav">
              📚 Biblioteca
            </button>
          </div>
          
          <div className="categoria-info">
            <div className="categoria-icono-grande">
              {categoria?.icono || '📁'}
            </div>
            <div className="categoria-details">
              <h1>{categoria?.nombre || 'Categoría'}</h1>
              <p>{categoria?.descripcion || 'Explora el contenido especializado de esta área de conocimiento'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas de la categoría */}
      <div className="categoria-stats">
        <div className="stat-card-categoria">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <h3>{estadisticas.totalDocumentos}</h3>
            <p>Total Documentos</p>
          </div>
        </div>
        
        <div className="stat-card-categoria">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>{estadisticas.documentosTecnicos}</h3>
            <p>Documentos Técnicos</p>
          </div>
        </div>
        
        <div className="stat-card-categoria">
          <div className="stat-icon">⚙️</div>
          <div className="stat-info">
            <h3>{estadisticas.areasEspecializadas}</h3>
            <p>Procedimientos</p>
          </div>
        </div>
        
        <div className="stat-card-categoria">
          <div className="stat-icon">🆕</div>
          <div className="stat-info">
            <h3>{estadisticas.documentosRecientes}</h3>
            <p>Recientes (7 días)</p>
          </div>
        </div>
      </div>

      {/* Controles de filtrado */}
      <div className="categoria-controles">
        <div className="controles-busqueda">
          <input
            type="text"
            placeholder="🔍 Buscar en esta categoría..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="busqueda-input-categoria"
          />
          
          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value)}
            className="filtro-select-categoria"
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
            className="filtro-select-categoria"
          >
            <option value="recientes">📅 Más recientes</option>
            <option value="populares">🔥 Más populares</option>
            <option value="alfabetico">🔤 Alfabético</option>
          </select>
        </div>
        
        <div className="resultados-info-categoria">
          {documentosFiltrados.length} de {documentos.length} documentos
        </div>
      </div>

      {/* Contenido de documentos */}
      <div className="categoria-contenido">
        {documentosFiltrados.length === 0 ? (
          <div className="empty-categoria">
            <div className="empty-icon">{categoria?.icono || '📁'}</div>
            <h3>No hay documentos en esta categoría</h3>
            <p>Aún no se han creado documentos para esta área de conocimiento.</p>
            {user?.role === 'experto' && (
              <button 
                onClick={() => navigate('/crear-documento', { 
                  state: { categoria_id: parseInt(id) } 
                })}
                className="btn-crear-documento"
              >
                ✍️ Crear Primer Documento
              </button>
            )}
          </div>
        ) : (
          <div className="documentos-grid-categoria">
            {documentosFiltrados.map(documento => (
              <div key={documento.id} className="documento-card-categoria">
                <div className="documento-header-categoria">
                  <div className="documento-tipo-categoria">
                    {documento.tipo === 'documento' && '📄'}
                    {documento.tipo === 'guia' && '📋'}
                    {documento.tipo === 'procedimiento' && '⚙️'}
                    {documento.tipo === 'capacitacion' && '🎓'}
                    <span>{documento.tipo}</span>
                  </div>
                  <div className="documento-fecha-categoria">
                    {new Date(documento.created_at).toLocaleDateString()}
                  </div>
                </div>
                
                <h3 className="documento-titulo-categoria">{documento.titulo}</h3>
                <p className="documento-descripcion-categoria">{documento.descripcion}</p>
                
                <div className="documento-meta-categoria">
                  <span className="autor-categoria">
                    👤 {documento.autor_nombre || 'Autor desconocido'}
                  </span>
                  <span className="vistas-categoria">
                    👁️ {documento.vistas || 0} visualizaciones
                  </span>
                </div>
                
                <div className="documento-acciones-categoria">
                  <button 
                    className="btn-ver-categoria"
                    onClick={() => navigate(`/documento/${documento.id}`)}
                  >
                    👁️ Ver
                  </button>
                  {documento.archivo_url && (
                    <button 
                      className="btn-descargar-categoria"
                      onClick={() => manejarDescarga(documento)}
                    >
                      📥 Descargar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="categoria-acciones-rapidas">
        <div className="acciones-container">
          <h3>🚀 Acciones Rápidas</h3>
          <div className="acciones-grid">
            <button 
              onClick={() => navigate('/biblioteca')}
              className="accion-btn"
            >
              <span className="accion-icon">📚</span>
              <span className="accion-text">Ver Biblioteca Completa</span>
            </button>
            
            {user?.role === 'experto' && (
              <button 
                onClick={() => navigate('/crear-documento', { 
                  state: { categoria_id: parseInt(id) } 
                })}
                className="accion-btn"
              >
                <span className="accion-icon">✍️</span>
                <span className="accion-text">Crear Documento</span>
              </button>
            )}
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="accion-btn"
            >
              <span className="accion-icon">🏠</span>
              <span className="accion-text">Volver al Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriaDetalle;