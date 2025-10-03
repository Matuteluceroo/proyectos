// ✏️ EditarDocumento.jsx - Página para editar documentos existentes
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './EditarDocumento.css';

const EditarDocumento = () => {
  const { id } = useParams();
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    tipo: 'documento',
    categoria_id: '',
    tags: '',
    keywords: '',
    nivel_acceso: 'publico',
    estado: 'activo'
  });
  
  // Estados de control
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [documento, setDocumento] = useState(null);

  // 📄 Cargar documento existente
  const cargarDocumento = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando documento para editar, ID:', id);
      
      const response = await fetch(`${API_URL}/api/documentos/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Documento no encontrado');
          return;
        }
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📄 Documento recibido:', data);
      console.log('👤 Usuario actual completo:', user);
      
      if (data.success && data.data) {
        const doc = data.data;
        setDocumento(doc);
        
        // Verificar permisos - solo el autor o administrador puede editar
        console.log('🔍 Verificando permisos DETALLADO:', { 
          documentoCompleto: doc,
          documentoAutor: doc.autor_id,
          documentoAutorTipo: typeof doc.autor_id,
          usuarioActual: user?.id, 
          usuarioActualTipo: typeof user?.id,
          rolUsuario: user?.rol,
          usuarioCompleto: user,
          comparacionAutor: doc.autor_id === user?.id,
          comparacionRol: user?.rol === 'administrador'
        });
        
        if (doc.autor_id !== user?.id && user?.rol !== 'administrador') {
          console.log('❌ ACCESO DENEGADO por permisos');
          setError('No tienes permisos para editar este documento');
          return;
        } else {
          console.log('✅ ACCESO PERMITIDO');
        }
        
        setFormData({
          titulo: doc.titulo || '',
          descripcion: doc.descripcion || '',
          contenido: doc.contenido || '',
          tipo: doc.tipo || 'documento',
          categoria_id: doc.categoria_id || '',
          tags: doc.tags || '',
          keywords: doc.keywords || '',
          nivel_acceso: doc.nivel_acceso || 'publico',
          estado: doc.estado || 'activo'
        });
      } else {
        setError(data.message || 'Error al cargar el documento');
      }
    } catch (error) {
      console.error('❌ Error al cargar documento:', error);
      setError('Error de conexión al cargar el documento');
    } finally {
      setLoading(false);
    }
  };

  // 📚 Cargar categorías
  const cargarCategorias = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categorias`);
      if (!response.ok) return;
      
      const data = await response.json();
      const categoriasData = data.success ? data.data : data.categorias || [];
      setCategorias(categoriasData);
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
    }
  };

  // 💾 Guardar cambios
  const guardarCambios = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.descripcion.trim()) {
      alert('Título y descripción son obligatorios');
      return;
    }
    
    try {
      setSaving(true);
      console.log('💾 Guardando cambios del documento:', id);
      
      const response = await fetch(`${API_URL}/api/documentos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          autor_id: user?.id
        })
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Documento actualizado:', data);
      
      if (data.success) {
        alert('Documento actualizado exitosamente');
        navigate(`/documento/${id}`);
      } else {
        throw new Error(data.message || 'Error al actualizar el documento');
      }
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      alert('Error al guardar los cambios: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // 📝 Manejar cambios en el formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 🎯 Efectos
  useEffect(() => {
    console.log('🚀 EditarDocumento iniciado con:', { id, user });
    if (id) {
      cargarDocumento();
      cargarCategorias();
    }
  }, [id]);

  // 🔄 Estados de carga y error
  if (loading) {
    return (
      <div className="editar-documento-page">
        <div className="loading-editar">
          <div className="loading-spinner"></div>
          <p>Cargando documento para editar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="editar-documento-page">
        <div className="error-editar">
          <div className="error-icon">❌</div>
          <h2>Error</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate('/dashboard')} className="btn-volver">
              🏠 Volver al Dashboard
            </button>
            <button onClick={() => navigate(`/documento/${id}`)} className="btn-ver">
              👁️ Ver Documento
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editar-documento-page">
      {/* Header */}
      <div className="editar-header">
        <div className="header-content">
          <div className="header-nav">
            <button onClick={() => navigate('/dashboard')} className="btn-nav">
              ← Dashboard
            </button>
            <button onClick={() => navigate(`/documento/${id}`)} className="btn-nav">
              👁️ Ver Documento
            </button>
          </div>
          
          <div className="header-info">
            <h1>✏️ Editando Documento</h1>
            <p>Modifica la información y contenido del documento</p>
          </div>
        </div>
      </div>

      {/* Formulario de edición */}
      <div className="editar-container">
        <form onSubmit={guardarCambios} className="editar-form">
          {/* Información básica */}
          <div className="form-section">
            <h3>📄 Información Básica</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="titulo">Título *</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={manejarCambio}
                  placeholder="Título del documento"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="tipo">Tipo de Documento</label>
                <select
                  id="tipo"
                  name="tipo"
                  value={formData.tipo}
                  onChange={manejarCambio}
                >
                  <option value="documento">📄 Documento</option>
                  <option value="guia">📋 Guía</option>
                  <option value="procedimiento">⚙️ Procedimiento</option>
                  <option value="capacitacion">🎓 Capacitación</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción *</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={manejarCambio}
                placeholder="Descripción breve del documento"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Contenido */}
          <div className="form-section">
            <h3>📝 Contenido</h3>
            <div className="form-group">
              <label htmlFor="contenido">Contenido del Documento</label>
              <textarea
                id="contenido"
                name="contenido"
                value={formData.contenido}
                onChange={manejarCambio}
                placeholder="Escribe aquí el contenido completo del documento..."
                rows={10}
                className="contenido-textarea"
              />
            </div>
          </div>

          {/* Categorización */}
          <div className="form-section">
            <h3>🏷️ Categorización</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="categoria_id">Categoría</label>
                <select
                  id="categoria_id"
                  name="categoria_id"
                  value={formData.categoria_id}
                  onChange={manejarCambio}
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map(categoria => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.icono} {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="nivel_acceso">Nivel de Acceso</label>
                <select
                  id="nivel_acceso"
                  name="nivel_acceso"
                  value={formData.nivel_acceso}
                  onChange={manejarCambio}
                >
                  <option value="publico">🌐 Público</option>
                  <option value="restringido">🔒 Restringido</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tags">Etiquetas</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={manejarCambio}
                  placeholder="Separadas por comas: agricultura, calidad, control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="keywords">Palabras Clave</label>
                <input
                  type="text"
                  id="keywords"
                  name="keywords"
                  value={formData.keywords}
                  onChange={manejarCambio}
                  placeholder="Palabras para búsqueda, separadas por comas"
                />
              </div>
            </div>
          </div>

          {/* Estado del documento */}
          <div className="form-section">
            <h3>⚙️ Estado</h3>
            <div className="form-group">
              <label htmlFor="estado">Estado del Documento</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={manejarCambio}
              >
                <option value="borrador">📝 Borrador</option>
                <option value="activo">✅ Activo</option>
                <option value="archivado">📦 Archivado</option>
              </select>
            </div>
          </div>

          {/* Acciones */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(`/documento/${id}`)}
              className="btn-cancelar"
              disabled={saving}
            >
              ❌ Cancelar
            </button>
            
            <button
              type="submit"
              className="btn-guardar"
              disabled={saving}
            >
              {saving ? '💾 Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </form>

        {/* Información del documento */}
        <div className="documento-info-sidebar">
          <h3>📊 Información del Documento</h3>
          
          <div className="info-item">
            <span className="info-label">ID:</span>
            <span className="info-value">{documento?.id}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Autor:</span>
            <span className="info-value">{documento?.autor_nombre || `ID: ${documento?.autor_id}`}</span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Creado:</span>
            <span className="info-value">
              {documento?.created_at ? new Date(documento.created_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Última actualización:</span>
            <span className="info-value">
              {documento?.updated_at ? new Date(documento.updated_at).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          
          <div className="info-item">
            <span className="info-label">Visualizaciones:</span>
            <span className="info-value">{documento?.vistas || 0}</span>
          </div>

          {documento?.archivo_url && (
            <div className="info-item">
              <span className="info-label">Archivo:</span>
              <span className="info-value">📎 {documento.archivo_nombre_original || documento.titulo}</span>
            </div>
          )}

          <div className="sidebar-actions">
            <button 
              onClick={() => navigate(`/documento/${id}`)}
              className="btn-sidebar"
            >
              👁️ Vista Previa
            </button>
            {user?.rol === 'administrador' && (
              <button 
                onClick={() => {
                  if (confirm('¿Estás seguro de que quieres eliminar este documento?')) {
                    // TODO: Implementar eliminación
                    console.log('Eliminar documento:', id);
                  }
                }}
                className="btn-sidebar btn-danger"
              >
                🗑️ Eliminar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarDocumento;