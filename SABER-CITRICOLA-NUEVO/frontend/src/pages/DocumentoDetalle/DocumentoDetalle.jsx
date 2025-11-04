// 📄 DocumentoDetalle.jsx - Vista detallada de un documento
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { obtenerDocumentoPorId } from '../../services/gestionContenidoAPI';
import ComentariosSection from '../../components/ComentariosSection/ComentariosSection';
import HistorialVersiones from '../../components/HistorialVersiones/HistorialVersiones';
import './DocumentoDetalle.css';

const DocumentoDetalle = () => {
  const { id } = useParams();
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [documento, setDocumento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  // 📄 Cargar documento específico
  const cargarDocumento = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando documento ID:', id);
      
      const data = await obtenerDocumentoPorId(id);
      console.log('📄 Documento recibido:', data);
      
      if (data.success) {
        setDocumento(data.data);
      } else {
        setError(data.message || 'Error al cargar el documento');
      }
    } catch (error) {
      console.error('❌ Error al cargar documento:', error);
      if (error.response?.status === 404) {
        setError('Documento no encontrado');
      } else {
        setError(error.message || 'Error de conexión al cargar el documento');
      }
    } finally {
      setLoading(false);
    }
  };

  // 📊 Incrementar vistas del documento
  // NOTA: Esta funcionalidad ahora se maneja automáticamente en el backend
  // al obtener el documento, pero dejamos la función por compatibilidad
  const incrementarVistas = async () => {
    // El backend incrementa vistas automáticamente en getDocumentById
    console.log('👁️ Vistas incrementadas automáticamente por el backend');
  };

  // 🎯 Efectos
  useEffect(() => {
    if (id) {
      cargarDocumento();
      incrementarVistas(); // Registrar que se visualizó el documento
    }
  }, [id]);

  // 📥 Manejar descarga de archivo
  const manejarDescarga = () => {
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

  // 🔄 Estados de carga y error
  if (loading) {
    return (
      <div className="documento-detalle-page">
        <div className="loading-documento">
          <div className="loading-spinner"></div>
          <p>Cargando documento...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="documento-detalle-page">
        <div className="error-documento">
          <div className="error-icon">❌</div>
          <h2>Error al cargar documento</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/biblioteca')} className="btn-volver">
              📚 Volver a Biblioteca
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-dashboard">
              🏠 Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!documento) {
    return (
      <div className="documento-detalle-page">
        <div className="error-documento">
          <div className="error-icon">📄</div>
          <h2>Documento no encontrado</h2>
          <p>El documento que buscas no existe o no tienes permisos para verlo.</p>
          <div className="error-actions">
            <button onClick={() => navigate('/biblioteca')} className="btn-volver">
              📚 Volver a Biblioteca
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="documento-detalle-page">
      {/* Header con navegación */}
      <div className="documento-header">
        <div className="header-nav">
          <button onClick={() => navigate('/biblioteca')} className="btn-nav">
            ← Biblioteca
          </button>
          <button onClick={() => navigate('/dashboard')} className="btn-nav">
            🏠 Dashboard
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="documento-container">
        {/* Información del documento */}
        <div className="documento-info-card">
          <div className="documento-metadata-header">
            <div className="documento-tipo-badge">
              {documento.tipo === 'documento' && '📄'}
              {documento.tipo === 'guia' && '📋'}
              {documento.tipo === 'procedimiento' && '⚙️'}
              {documento.tipo === 'capacitacion' && '🎓'}
              <span>{documento.tipo}</span>
            </div>
            <div className="documento-fecha">
              Creado: {new Date(documento.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          <h1 className="documento-titulo">{documento.titulo}</h1>
          
          <div className="documento-meta-info">
            {documento.categoria_nombre && (
              <div className="meta-item">
                <span className="meta-label">Categoría:</span>
                <span className="meta-value">
                  {documento.categoria_icono} {documento.categoria_nombre}
                </span>
              </div>
            )}
            
            <div className="meta-item">
              <span className="meta-label">Autor:</span>
              <span className="meta-value">
                👤 {documento.autor_nombre || 'Autor desconocido'}
              </span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label">Estado:</span>
              <span className={`meta-value estado-${documento.estado}`}>
                {documento.estado === 'activo' ? '✅ Activo' : '⏸️ Inactivo'}
              </span>
            </div>
            
            <div className="meta-item">
              <span className="meta-label">Acceso:</span>
              <span className="meta-value">
                {documento.nivel_acceso === 'publico' ? '🌐 Público' : '🔒 Restringido'}
              </span>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="documento-stats-detalle">
            <div className="stat-item-detalle">
              <span className="stat-icon-detalle">👁️</span>
              <span className="stat-text-detalle">
                {documento.vistas || 0} visualizaciones
              </span>
            </div>
            {documento.archivo_url && (
              <div className="stat-item-detalle">
                <span className="stat-icon-detalle">📎</span>
                <span className="stat-text-detalle">Archivo adjunto disponible</span>
              </div>
            )}
            {documento.version && (
              <div className="stat-item-detalle">
                <span className="stat-icon-detalle">🔄</span>
                <span className="stat-text-detalle">Versión {documento.version}</span>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div className="documento-acciones-detalle">
            {documento.archivo_url && (
              <button onClick={manejarDescarga} className="btn-descargar-detalle">
                📥 Descargar Archivo
              </button>
            )}
            <button 
              onClick={() => navigate('/crear-documento', { 
                state: { 
                  basedOn: documento,
                  action: 'duplicate' 
                } 
              })} 
              className="btn-duplicar"
            >
              📋 Usar como Base
            </button>
            <button 
              onClick={() => setMostrarHistorial(true)} 
              className="btn-historial"
            >
              📚 Ver Historial
            </button>
          </div>
        </div>

        {/* Contenido del documento */}
        <div className="documento-contenido-card">
          {documento.descripcion && (
            <div className="documento-section">
              <h3>📝 Descripción</h3>
              <div className="documento-descripcion-detalle">
                {documento.descripcion}
              </div>
            </div>
          )}

          {documento.contenido && (
            <div className="documento-section">
              <h3>📄 Contenido</h3>
              <div 
                className="documento-contenido-detalle"
                dangerouslySetInnerHTML={{ __html: documento.contenido }}
              />
            </div>
          )}

          {documento.keywords && (
            <div className="documento-section">
              <h3>🏷️ Palabras Clave</h3>
              <div className="documento-keywords">
                {documento.keywords.split(',').map((keyword, index) => (
                  <span key={index} className="keyword-tag">
                    {keyword.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {documento.tags && (
            <div className="documento-section">
              <h3>🔖 Etiquetas</h3>
              <div className="documento-tags">
                {documento.tags.split(',').map((tag, index) => (
                  <span key={index} className="tag-item">
                    {tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 💬 Sección de comentarios */}
        <ComentariosSection 
          documentoId={id}
          titulo="Comentarios del documento"
        />

        {/* 📚 Modal de historial de versiones */}
        {mostrarHistorial && (
          <HistorialVersiones
            documentoId={id}
            onVersionSeleccionada={(version) => {
              console.log('Versión seleccionada:', version);
              // Aquí podrías mostrar el contenido de la versión seleccionada
            }}
            onCerrar={() => setMostrarHistorial(false)}
          />
        )}
      </div>
    </div>
  );
};

export default DocumentoDetalle;