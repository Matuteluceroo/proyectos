// 📝 CreaDocumento.jsx - Página para crear documentos con editor avanzado
import React, { useState, useEffect } from 'react';
import RichTextEditor from '../../components/RichTextEditor/RichTextEditor';
import './CreaDocumento.css';

const CreaDocumento = () => {
  const [documentData, setDocumentData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    categoria: 'general',
    tags: '',
    esPublico: true,
    fechaVencimiento: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  const [wordCount, setWordCount] = useState(0);
  const [isDraft, setIsDraft] = useState(false);

  // Categorías disponibles
  const categorias = [
    { value: 'general', label: '📄 General' },
    { value: 'tecnico', label: '🔧 Técnico' },
    { value: 'procedimiento', label: '📋 Procedimiento' },
    { value: 'politica', label: '📜 Política' },
    { value: 'manual', label: '📖 Manual' },
    { value: 'guia', label: '🗺️ Guía' },
    { value: 'normativa', label: '⚖️ Normativa' },
    { value: 'investigacion', label: '🔬 Investigación' },
    { value: 'capacitacion', label: '🎓 Capacitación' },
    { value: 'otros', label: '📁 Otros' }
  ];

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDocumentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Manejar cambios en el contenido del editor
  const handleContentChange = (content, stats = {}) => {
    console.log('📝 Contenido recibido del editor:', content);
    console.log('📊 Stats:', stats);
    
    setDocumentData(prev => ({
      ...prev,
      contenido: content
    }));
    setWordCount(stats?.words || 0);
  };

  // Validar formulario
  const validateForm = () => {
    if (!documentData.titulo.trim()) {
      setMensaje({ tipo: 'error', texto: 'El título es obligatorio' });
      return false;
    }
    if (!documentData.descripcion.trim()) {
      setMensaje({ tipo: 'error', texto: 'La descripción es obligatoria' });
      return false;
    }
    if (!documentData.contenido.trim()) {
      setMensaje({ tipo: 'error', texto: 'El contenido no puede estar vacío' });
      return false;
    }
    if (wordCount < 10) {
      setMensaje({ tipo: 'error', texto: 'El documento debe tener al menos 10 palabras' });
      return false;
    }
    return true;
  };

  // Guardar borrador automáticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      if (documentData.titulo || documentData.contenido) {
        localStorage.setItem('documentoDraft', JSON.stringify(documentData));
        setIsDraft(true);
      }
    }, 5000); // Guardar cada 5 segundos

    return () => clearTimeout(timer);
  }, [documentData]);

  // Cargar borrador al iniciar
  useEffect(() => {
    const draft = localStorage.getItem('documentoDraft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        setDocumentData(parsedDraft);
        setIsDraft(true);
      } catch (error) {
        console.error('Error al cargar borrador:', error);
      }
    }
  }, []);

  // Limpiar borrador
  const clearDraft = () => {
    localStorage.removeItem('documentoDraft');
    setIsDraft(false);
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const token = localStorage.getItem('token');
      
      const formData = {
        ...documentData,
        tags: documentData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await fetch('http://localhost:5000/api/documentos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        setMensaje({ 
          tipo: 'success', 
          texto: `¡Documento creado exitosamente! ID: ${result.id}` 
        });
        
        // Limpiar formulario
        setDocumentData({
          titulo: '',
          descripcion: '',
          contenido: '',
          categoria: 'general',
          tags: '',
          esPublico: true,
          fechaVencimiento: ''
        });
        
        clearDraft();
        
        // Redirigir después de 2 segundos
        setTimeout(() => {
          window.location.href = '/documentos';
        }, 2000);
        
      } else {
        const error = await response.json();
        setMensaje({ 
          tipo: 'error', 
          texto: error.message || 'Error al crear el documento' 
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error de conexión. Verifica tu internet.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="crear-documento-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>📝 Crear Nuevo Documento</h1>
            <p>Crea documentación profesional con formato avanzado</p>
          </div>
          <div className="header-right">
            {isDraft && (
              <div className="draft-indicator">
                <span className="draft-icon">💾</span>
                <span>Borrador guardado</span>
                <button 
                  type="button" 
                  className="clear-draft-btn"
                  onClick={clearDraft}
                  title="Limpiar borrador"
                >
                  ✕
                </button>
              </div>
            )}
            <div className="word-counter">
              <span className="counter-label">Palabras:</span>
              <span className={`counter-value ${wordCount < 10 ? 'warning' : ''}`}>
                {wordCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          <span className="mensaje-icon">
            {mensaje.tipo === 'success' ? '✅' : '❌'}
          </span>
          {mensaje.texto}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="documento-form">
        {/* Metadatos del documento */}
        <div className="form-section">
          <h2>📋 Información del Documento</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="titulo">
                <span className="required">*</span> Título del Documento
              </label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={documentData.titulo}
                onChange={handleInputChange}
                placeholder="Ingresa un título descriptivo..."
                required
                maxLength="200"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="categoria">Categoría</label>
              <select
                id="categoria"
                name="categoria"
                value={documentData.categoria}
                onChange={handleInputChange}
              >
                {categorias.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="descripcion">
              <span className="required">*</span> Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={documentData.descripcion}
              onChange={handleInputChange}
              placeholder="Describe brevemente el contenido del documento..."
              rows="3"
              required
              maxLength="500"
            />
            <div className="char-counter">
              {documentData.descripcion.length}/500 caracteres
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tags">Etiquetas</label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={documentData.tags}
                onChange={handleInputChange}
                placeholder="citricola, manual, procedimiento..."
                title="Separa las etiquetas con comas"
              />
              <small>Separa las etiquetas con comas</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="fechaVencimiento">Fecha de Vencimiento</label>
              <input
                type="date"
                id="fechaVencimiento"
                name="fechaVencimiento"
                value={documentData.fechaVencimiento}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label htmlFor="esPublico" className="checkbox-label">
              <input
                type="checkbox"
                id="esPublico"
                name="esPublico"
                checked={documentData.esPublico}
                onChange={handleInputChange}
              />
              <span className="checkmark"></span>
              Documento público (visible para todos los usuarios)
            </label>
          </div>
        </div>

        {/* Editor de contenido */}
        <div className="form-section">
          <h2>✍️ Contenido del Documento</h2>
          <p className="editor-description">
            Utiliza el editor avanzado para crear contenido con formato profesional. 
            Puedes agregar títulos, texto formateado, listas, enlaces, imágenes y tablas.
          </p>
          
          <RichTextEditor
            value={documentData.contenido}
            onChange={handleContentChange}
            placeholder="Comienza a escribir tu documento aquí..."
          />
        </div>

        {/* Acciones */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => window.history.back()}
            disabled={isLoading}
          >
            ← Cancelar
          </button>
          
          <button 
            type="button" 
            className="btn-draft"
            onClick={clearDraft}
            disabled={!isDraft}
          >
            🗑️ Limpiar Borrador
          </button>
          
          <button 
            type="submit" 
            className="btn-primary"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Guardando...
              </>
            ) : (
              <>
                💾 Crear Documento
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreaDocumento;