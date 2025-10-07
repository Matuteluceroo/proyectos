// 📋 components/DocumentList/DocumentList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DocumentList.css';
import DocumentModal from '../Modal/DocumentModal';
import { useNotification } from '../../context/NotificationContext';

const DocumentList = () => {
  const navigate = useNavigate();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    estado: '',
    categoria_id: '',
    nivel_acceso: '',
    orden: 'created_at',
    direccion: 'DESC',
    pagina: 1,
    limite: 10
  });
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    paginas: 0
  });
  const [categorias, setCategorias] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});

  const { showNotification } = useNotification() || { showNotification: () => {} };

  // Estados para filtros en tiempo real
  const [busquedaTemp, setBusquedaTemp] = useState('');

  useEffect(() => {
    cargarCategorias();
    cargarEstadisticas();
  }, []);

  useEffect(() => {
    cargarDocumentos();
  }, [filtros]);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const response = await fetch(`http://localhost:5000/api/documentos?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setDocumentos(data.data.documentos);
        setPaginacion(data.data.paginacion);
      } else {
        showNotification('Error cargando documentos', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error conectando con el servidor', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categorias');
      const data = await response.json();
      if (data.success) {
        setCategorias(data.data);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const cargarEstadisticas = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/documentos/estadisticas');
      const data = await response.json();
      if (data.success) {
        setEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleBusqueda = (e) => {
    e.preventDefault();
    setFiltros({
      ...filtros,
      busqueda: busquedaTemp,
      pagina: 1
    });
  };

  const handleFiltroChange = (key, value) => {
    setFiltros({
      ...filtros,
      [key]: value,
      pagina: 1
    });
  };

  const handlePaginaChange = (nuevaPagina) => {
    setFiltros({
      ...filtros,
      pagina: nuevaPagina
    });
  };

  const abrirModal = (documento = null) => {
    setSelectedDocument(documento);
    setModalOpen(true);
  };

  const cerrarModal = () => {
    setModalOpen(false);
    setSelectedDocument(null);
  };

  const handleDocumentoGuardado = () => {
    cargarDocumentos();
    cargarEstadisticas();
    cerrarModal();
  };

  const eliminarDocumento = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/documentos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Documento eliminado exitosamente', 'success');
        cargarDocumentos();
        cargarEstadisticas();
      } else {
        showNotification(data.message || 'Error eliminando documento', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Error conectando con el servidor', 'error');
    }
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEstadoBadge = (estado) => {
    const clases = {
      'borrador': 'badge-warning',
      'revision': 'badge-info',
      'publicado': 'badge-success',
      'archivado': 'badge-secondary'
    };
    return clases[estado] || 'badge-secondary';
  };

  const getTipoBadge = (tipo) => {
    const clases = {
      'documento': 'badge-primary',
      'guia': 'badge-success',
      'procedimiento': 'badge-info',
      'capacitacion': 'badge-warning'
    };
    return clases[tipo] || 'badge-primary';
  };

  if (loading && documentos.length === 0) {
    return (
      <div className="document-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando documentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="document-list">
      {/* Header con estadísticas */}
      <div className="document-list-header">
        <div className="header-info">
          <h2>📚 Gestión de Documentos</h2>
          <div className="stats-row">
            <div className="stat-item">
              <span className="stat-number">{estadisticas.total_documentos || 0}</span>
              <span className="stat-label">Total</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{estadisticas.publicados || 0}</span>
              <span className="stat-label">Publicados</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{estadisticas.borradores || 0}</span>
              <span className="stat-label">Borradores</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{estadisticas.total_vistas || 0}</span>
              <span className="stat-label">Vistas</span>
            </div>
          </div>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/crear-documento')}
          >
            ✍️ Crear Documento Avanzado
          </button>
          
          <button 
            className="btn btn-secondary"
            onClick={() => abrirModal()}
          >
            ➕ Documento Rápido
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-section">
        <form onSubmit={handleBusqueda} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="🔍 Buscar documentos..."
              value={busquedaTemp}
              onChange={(e) => setBusquedaTemp(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Buscar
            </button>
          </div>
        </form>

        <div className="filters-row">
          <select 
            value={filtros.tipo}
            onChange={(e) => handleFiltroChange('tipo', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los tipos</option>
            <option value="documento">📄 Documento</option>
            <option value="guia">📋 Guía</option>
            <option value="procedimiento">⚙️ Procedimiento</option>
            <option value="capacitacion">🎓 Capacitación</option>
          </select>

          <select 
            value={filtros.estado}
            onChange={(e) => handleFiltroChange('estado', e.target.value)}
            className="filter-select"
          >
            <option value="">Todos los estados</option>
            <option value="borrador">📝 Borrador</option>
            <option value="revision">👀 En revisión</option>
            <option value="publicado">✅ Publicado</option>
            <option value="archivado">📦 Archivado</option>
          </select>

          <select 
            value={filtros.categoria_id}
            onChange={(e) => handleFiltroChange('categoria_id', e.target.value)}
            className="filter-select"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.icono} {categoria.nombre}
              </option>
            ))}
          </select>

          <select 
            value={`${filtros.orden}-${filtros.direccion}`}
            onChange={(e) => {
              const [orden, direccion] = e.target.value.split('-');
              handleFiltroChange('orden', orden);
              handleFiltroChange('direccion', direccion);
            }}
            className="filter-select"
          >
            <option value="created_at-DESC">🕒 Más recientes</option>
            <option value="created_at-ASC">🕒 Más antiguos</option>
            <option value="titulo-ASC">📝 A-Z</option>
            <option value="titulo-DESC">📝 Z-A</option>
            <option value="vistas-DESC">👁️ Más vistos</option>
            <option value="vistas-ASC">👁️ Menos vistos</option>
          </select>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="documents-grid">
        {documentos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No hay documentos</h3>
            <p>No se encontraron documentos con los filtros aplicados.</p>
            <button 
              className="btn btn-primary"
              onClick={() => abrirModal()}
            >
              Crear primer documento
            </button>
          </div>
        ) : (
          documentos.map(documento => (
            <div key={documento.id} className="document-card">
              <div className="document-header">
                <div className="document-badges">
                  <span className={`badge ${getTipoBadge(documento.tipo)}`}>
                    {documento.tipo}
                  </span>
                  <span className={`badge ${getEstadoBadge(documento.estado)}`}>
                    {documento.estado}
                  </span>
                </div>
                <div className="document-actions">
                  <button 
                    className="action-btn edit"
                    onClick={() => abrirModal(documento)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn delete"
                    onClick={() => eliminarDocumento(documento.id)}
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="document-content">
                <h3 className="document-title">{documento.titulo}</h3>
                <p className="document-description">{documento.descripcion}</p>
                
                {documento.categoria_nombre && (
                  <div className="document-category">
                    <span className="category-icon">{documento.categoria_icono}</span>
                    <span>{documento.categoria_nombre}</span>
                  </div>
                )}

                {documento.tags && (
                  <div className="document-tags">
                    {documento.tags.split(',').map((tag, index) => (
                      <span key={index} className="tag">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="document-footer">
                <div className="document-meta">
                  <div className="meta-item">
                    <span className="meta-icon">👤</span>
                    <span>{documento.autor_nombre || 'Sin autor'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">📅</span>
                    <span>{formatearFecha(documento.created_at)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-icon">👁️</span>
                    <span>{documento.vistas || 0}</span>
                  </div>
                </div>

                {documento.archivo_nombre_original && (
                  <div className="document-file">
                    <span className="file-icon">📎</span>
                    <span className="file-name">{documento.archivo_nombre_original}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Paginación */}
      {paginacion.paginas > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            disabled={paginacion.pagina === 1}
            onClick={() => handlePaginaChange(paginacion.pagina - 1)}
          >
            ← Anterior
          </button>
          
          <div className="pagination-info">
            <span>
              Página {paginacion.pagina} de {paginacion.paginas}
            </span>
            <span className="pagination-total">
              ({paginacion.total} documentos)
            </span>
          </div>

          <button 
            className="pagination-btn"
            disabled={paginacion.pagina === paginacion.paginas}
            onClick={() => handlePaginaChange(paginacion.pagina + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <DocumentModal
          isOpen={modalOpen}
          onClose={cerrarModal}
          documento={selectedDocument}
          onSave={handleDocumentoGuardado}
        />
      )}
    </div>
  );
};

export default DocumentList;