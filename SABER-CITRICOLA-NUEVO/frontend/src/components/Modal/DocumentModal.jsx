// 📄 components/Modal/DocumentModal.jsx - Modal para crear/editar documentos
import { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import FileUpload from '../FileUpload/FileUpload';
import './DocumentModal.css';

const DocumentModal = ({ 
  isOpen, 
  onClose, 
  document: documentToEdit = null, 
  onDocumentSaved,
  categories = []
}) => {
  const { showSuccess, showError, showLoading } = useNotification();
  
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    tipo: 'documento',
    categoria_id: '',
    tags: '',
    nivel_acceso: 'publico',
    keywords: '',
    estado: 'borrador'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);

  // Cargar datos si estamos editando
  useEffect(() => {
    if (documentToEdit) {
      setFormData({
        titulo: documentToEdit.titulo || '',
        descripcion: documentToEdit.descripcion || '',
        contenido: documentToEdit.contenido || '',
        tipo: documentToEdit.tipo || 'documento',
        categoria_id: documentToEdit.categoria_id || '',
        tags: documentToEdit.tags || '',
        nivel_acceso: documentToEdit.nivel_acceso || 'publico',
        keywords: documentToEdit.keywords || '',
        estado: documentToEdit.estado || 'borrador'
      });
    } else {
      // Resetear formulario para nuevo documento
      setFormData({
        titulo: '',
        descripcion: '',
        contenido: '',
        tipo: 'documento',
        categoria_id: '',
        tags: '',
        nivel_acceso: 'publico',
        keywords: '',
        estado: 'borrador'
      });
    }
    setErrors({});
    setUploadedFile(null);
  }, [documentToEdit, isOpen]);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error si existe
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es requerido';
    }
    
    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida';
    }
    
    if (!documentToEdit && !uploadedFile) {
      newErrors.archivo = 'Debe subir un archivo para el nuevo documento';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar archivo subido
  const handleFileUploaded = (fileData) => {
    setUploadedFile(fileData);
    setErrors(prev => ({ ...prev, archivo: '' }));
    
    // Auto-llenar título si está vacío
    if (!formData.titulo && fileData.archivo?.nombre_original) {
      const nombreSinExtension = fileData.archivo.nombre_original.replace(/\.[^/.]+$/, "");
      setFormData(prev => ({ ...prev, titulo: nombreSinExtension }));
    }
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    showLoading(documentToEdit ? 'Actualizando documento...' : 'Creando documento...');
    
    try {
      const payload = {
        ...formData,
        archivo_id: uploadedFile?.id || documentToEdit?.id
      };
      
      const url = documentToEdit 
        ? `http://localhost:5000/api/documentos/${documentToEdit.id}`
        : 'http://localhost:5000/api/documentos';
        
      const method = documentToEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();
      
      if (result.success) {
        showSuccess(documentToEdit ? 'Documento actualizado exitosamente' : 'Documento creado exitosamente');
        onDocumentSaved(result.data);
        onClose();
      } else {
        showError(result.message || 'Error al procesar documento');
      }
      
    } catch (error) {
      console.error('Error:', error);
      showError('Error de conexión al procesar documento');
    } finally {
      setIsSubmitting(false);
    }
  };

  // No renderizar si el modal no está abierto
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {documentToEdit ? '✏️ Editar Documento' : '📄 Nuevo Documento'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Información básica */}
          <div className="form-section">
            <h3>📝 Información Básica</h3>
            
            <div className="form-group">
              <label htmlFor="titulo">Título *</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={formData.titulo}
                onChange={handleChange}
                className={errors.titulo ? 'error' : ''}
                placeholder="Ingresa el título del documento"
              />
              {errors.titulo && <span className="error-text">{errors.titulo}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="descripcion">Descripción *</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                className={errors.descripcion ? 'error' : ''}
                placeholder="Describe el contenido del documento"
                rows="3"
              />
              {errors.descripcion && <span className="error-text">{errors.descripcion}</span>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipo">Tipo</label>
                <select id="tipo" name="tipo" value={formData.tipo} onChange={handleChange}>
                  <option value="documento">📄 Documento</option>
                  <option value="guia">📋 Guía</option>
                  <option value="procedimiento">⚙️ Procedimiento</option>
                  <option value="capacitacion">🎓 Capacitación</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="categoria_id">Categoría</label>
                <select id="categoria_id" name="categoria_id" value={formData.categoria_id} onChange={handleChange}>
                  <option value="">Seleccionar categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icono} {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Archivo */}
          <div className="form-section">
            <h3>📁 Archivo</h3>
            {documentToEdit ? (
              <div className="current-file">
                <p>📎 Archivo actual: <strong>{documentToEdit.archivo_nombre_original}</strong></p>
                <p className="text-sm text-gray-600">Suba un nuevo archivo para reemplazarlo (opcional)</p>
              </div>
            ) : null}
            
            <FileUpload
              onFileUploaded={handleFileUploaded}
              accept="*/*"
              maxSize={50}
              categoria_id={formData.categoria_id}
              tipo={formData.tipo}
            />
            {errors.archivo && <span className="error-text">{errors.archivo}</span>}
          </div>

          {/* Contenido adicional */}
          <div className="form-section">
            <h3>📝 Contenido Adicional</h3>
            
            <div className="form-group">
              <label htmlFor="contenido">Contenido</label>
              <textarea
                id="contenido"
                name="contenido"
                value={formData.contenido}
                onChange={handleChange}
                placeholder="Contenido adicional, notas o instrucciones"
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="keywords">Palabras Clave</label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleChange}
                placeholder="palabras, clave, separadas, por, comas"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">Etiquetas</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="etiqueta1, etiqueta2, etiqueta3"
              />
            </div>
          </div>

          {/* Configuración */}
          <div className="form-section">
            <h3>⚙️ Configuración</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nivel_acceso">Nivel de Acceso</label>
                <select id="nivel_acceso" name="nivel_acceso" value={formData.nivel_acceso} onChange={handleChange}>
                  <option value="publico">🌍 Público</option>
                  <option value="expertos">👨‍🔬 Solo Expertos</option>
                  <option value="administradores">👑 Solo Administradores</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="estado">Estado</label>
                <select id="estado" name="estado" value={formData.estado} onChange={handleChange}>
                  <option value="borrador">📝 Borrador</option>
                  <option value="revision">👀 En Revisión</option>
                  <option value="publicado">✅ Publicado</option>
                  <option value="archivado">📦 Archivado</option>
                </select>
              </div>
            </div>
          </div>
        </form>
        
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>⏳ Procesando...</>
            ) : (
              documentToEdit ? '💾 Actualizar' : '✅ Crear Documento'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;