// 📋 pages/MisDocumentos/MisDocumentos.jsx - Página para ver documentos del usuario
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { obtenerDocumentos, eliminarDocumento as eliminarDocumentoAPI } from '../../services/gestionContenidoAPI';
import DocumentModal from '../../components/Modal/DocumentModal';
import './MisDocumentos.css';

const MisDocumentos = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification() || { showNotification: () => {} };
  
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    orden: 'created_at',
    direccion: 'DESC'
  });
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    publicos: 0,
    privados: 0,
    borradores: 0
  });

  useEffect(() => {
    cargarMisDocumentos();
  }, [filtros]);

  const cargarMisDocumentos = async () => {
    try {
      setLoading(true);
      
      const filtroParams = {
        usuario_id: user.id,
        ...filtros
      };

      const data = await obtenerDocumentos(filtroParams);

      if (data.success || data.data || data.documentos) {
        const docs = data.data?.documentos || data.documentos || [];
        setDocumentos(docs);
        calcularEstadisticas(docs);
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

  const calcularEstadisticas = (docs) => {
    const stats = docs.reduce((acc, doc) => {
      acc.total++;
      if (doc.es_publico) acc.publicos++;
      else acc.privados++;
      if (doc.estado === 'borrador') acc.borradores++;
      return acc;
    }, { total: 0, publicos: 0, privados: 0, borradores: 0 });
    
    setEstadisticas(stats);
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
    cargarMisDocumentos();
    cerrarModal();
    showNotification('Documento guardado exitosamente', 'success');
  };

  const eliminarDocumento = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      return;
    }

    try {
      await eliminarDocumentoAPI(id);
      showNotification('Documento eliminado exitosamente', 'success');
      cargarMisDocumentos();
    } catch (error) {
      console.error('Error:', error);
      showNotification(error.message || 'Error al eliminar el documento', 'error');
    }
  };

  const handleBusqueda = (e) => {
    e.preventDefault();
    setFiltros(prev => ({ ...prev, busqueda: e.target.busqueda.value }));
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="mis-documentos-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📁 Mis Documentos</h1>
            <p>Gestiona todos tus documentos creados</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/crear-documento')}
            >
              ✍️ Crear Nuevo Documento
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => abrirModal()}
            >
              ➕ Documento Rápido
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="estadisticas-grid">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-info">
            <div className="stat-number">{estadisticas.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-info">
            <div className="stat-number">{estadisticas.publicos}</div>
            <div className="stat-label">Públicos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-info">
            <div className="stat-number">{estadisticas.privados}</div>
            <div className="stat-label">Privados</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-number">{estadisticas.borradores}</div>
            <div className="stat-label">Borradores</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <form onSubmit={handleBusqueda} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              name="busqueda"
              placeholder="🔍 Buscar en mis documentos..."
              defaultValue={filtros.busqueda}
            />
            <button type="submit" className="search-btn">Buscar</button>
          </div>
        </form>

        <div className="filtros-adicionales">
          <select 
            value={filtros.orden} 
            onChange={(e) => setFiltros(prev => ({ ...prev, orden: e.target.value }))}
          >
            <option value="created_at">Fecha de creación</option>
            <option value="updated_at">Última modificación</option>
            <option value="titulo">Título</option>
          </select>

          <select 
            value={filtros.direccion} 
            onChange={(e) => setFiltros(prev => ({ ...prev, direccion: e.target.value }))}
          >
            <option value="DESC">Más recientes</option>
            <option value="ASC">Más antiguos</option>
          </select>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="documentos-grid">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando documentos...</p>
          </div>
        ) : documentos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No tienes documentos aún</h3>
            <p>¡Crea tu primer documento para comenzar!</p>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/crear-documento')}
            >
              ✍️ Crear Primer Documento
            </button>
          </div>
        ) : (
          documentos.map(documento => (
            <div key={documento.id} className="documento-card">
              <div className="documento-header">
                <h3 className="documento-titulo">{documento.titulo}</h3>
                <div className="documento-badges">
                  {documento.es_publico ? (
                    <span className="badge badge-publico">🌐 Público</span>
                  ) : (
                    <span className="badge badge-privado">🔒 Privado</span>
                  )}
                  {documento.estado === 'borrador' && (
                    <span className="badge badge-borrador">📝 Borrador</span>
                  )}
                </div>
              </div>
              
              <div className="documento-content">
                <p className="documento-descripcion">{documento.descripcion}</p>
                <div className="documento-meta">
                  <span className="meta-item">
                    📅 Creado: {formatearFecha(documento.created_at)}
                  </span>
                  <span className="meta-item">
                    🔄 Actualizado: {formatearFecha(documento.updated_at)}
                  </span>
                  {documento.categoria_nombre && (
                    <span className="meta-item">
                      📂 {documento.categoria_nombre}
                    </span>
                  )}
                </div>
              </div>

              <div className="documento-actions">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => abrirModal(documento)}
                >
                  ✏️ Editar
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => eliminarDocumento(documento.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal para editar/crear documentos */}
      {modalOpen && (
        <DocumentModal
          isOpen={modalOpen}
          onClose={cerrarModal}
          onDocumentSaved={handleDocumentoGuardado}
          document={selectedDocument}
        />
      )}
    </div>
  );
};

export default MisDocumentos;