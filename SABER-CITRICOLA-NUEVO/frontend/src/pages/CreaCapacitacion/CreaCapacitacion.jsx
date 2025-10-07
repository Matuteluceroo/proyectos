// 🎓 CreaCapacitacion.jsx - Página para crear capacitaciones
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CreaCapacitacion.css';

const CreaCapacitacion = () => {
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    contenido: '',
    tipo: 'capacitacion',
    categoria_id: '',
    tags: '',
    keywords: '',
    nivel_acceso: 'publico',
    estado: 'borrador',
    duracion_estimada: '',
    nivel_dificultad: 'basico',
    requisitos_previos: '',
    objetivos_aprendizaje: '',
    modalidad: 'virtual'
  });
  
  // Estados de control
  const [loading, setLoading] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [archivo, setArchivo] = useState(null);

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

  // 📝 Manejar cambios en el formulario
  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 📁 Manejar selección de archivo
  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    setArchivo(file);
    console.log('📁 Archivo seleccionado:', file);
  };

  // 💾 Guardar capacitación
  const guardarCapacitacion = async (e) => {
    e.preventDefault();
    
    if (!formData.titulo.trim() || !formData.descripcion.trim()) {
      alert('Título y descripción son obligatorios');
      return;
    }
    
    try {
      setLoading(true);
      console.log('💾 Guardando capacitación...');
      
      let capacitacionId;
      
      // Si hay archivo, usar endpoint de upload
      if (archivo) {
        const formDataUpload = new FormData();
        formDataUpload.append('archivo', archivo);
        formDataUpload.append('titulo', formData.titulo);
        formDataUpload.append('descripcion', formData.descripcion);
        formDataUpload.append('id_tipo', formData.categoria_id || 1);
        formDataUpload.append('id_usuario', user?.id);
        formDataUpload.append('tipo', 'capacitacion');
        
        const response = await fetch(`${API_URL}/api/documentos/upload`, {
          method: 'POST',
          body: formDataUpload
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Capacitación con archivo creada:', data);
        capacitacionId = data.id_contenido;
        
      } else {
        // Sin archivo, usar endpoint normal
        const response = await fetch(`${API_URL}/api/documentos`, {
          method: 'POST',
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
        console.log('✅ Capacitación creada:', data);
        capacitacionId = data.data?.id;
      }
      
      alert('Capacitación creada exitosamente');
      
      // Redirigir al documento creado o al dashboard
      if (capacitacionId) {
        navigate(`/documento/${capacitacionId}`);
      } else {
        navigate('/dashboard');
      }
      
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      alert('Error al guardar la capacitación: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Efectos
  useEffect(() => {
    cargarCategorias();
  }, []);

  // 🔒 Verificar permisos
  if (!user || (user.rol !== 'experto' && user.rol !== 'administrador')) {
    return (
      <div className="crea-capacitacion-page">
        <div className="error-permisos">
          <div className="error-icon">🚫</div>
          <h2>Acceso Restringido</h2>
          <p>Solo los expertos y administradores pueden crear capacitaciones.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-volver">
            🏠 Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="crea-capacitacion-page">
      {/* Header */}
      <div className="capacitacion-header">
        <div className="header-content">
          <div className="header-nav">
            <button onClick={() => navigate('/dashboard')} className="btn-nav">
              ← Dashboard
            </button>
            <button onClick={() => navigate('/biblioteca')} className="btn-nav">
              📚 Biblioteca
            </button>
          </div>
          
          <div className="header-info">
            <h1>🎓 Nueva Capacitación</h1>
            <p>Crea contenido educativo para el equipo</p>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="capacitacion-container">
        <form onSubmit={guardarCapacitacion} className="capacitacion-form">
          
          {/* Información básica */}
          <div className="form-section">
            <h3>📄 Información Básica</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="titulo">Título de la Capacitación *</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={manejarCambio}
                  placeholder="Ej: Técnicas de Poda en Cítricos"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="duracion_estimada">Duración Estimada</label>
                <input
                  type="text"
                  id="duracion_estimada"
                  name="duracion_estimada"
                  value={formData.duracion_estimada}
                  onChange={manejarCambio}
                  placeholder="Ej: 2 horas, 1 día, 3 semanas"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="descripcion">Descripción *</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={manejarCambio}
                placeholder="Describe de qué trata la capacitación y qué aprenderán los participantes"
                rows={3}
                required
              />
            </div>
          </div>

          {/* Configuración de aprendizaje */}
          <div className="form-section">
            <h3>🎯 Configuración de Aprendizaje</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nivel_dificultad">Nivel de Dificultad</label>
                <select
                  id="nivel_dificultad"
                  name="nivel_dificultad"
                  value={formData.nivel_dificultad}
                  onChange={manejarCambio}
                >
                  <option value="basico">🟢 Básico</option>
                  <option value="intermedio">🟡 Intermedio</option>
                  <option value="avanzado">🔴 Avanzado</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="modalidad">Modalidad</label>
                <select
                  id="modalidad"
                  name="modalidad"
                  value={formData.modalidad}
                  onChange={manejarCambio}
                >
                  <option value="virtual">💻 Virtual</option>
                  <option value="presencial">🏢 Presencial</option>
                  <option value="mixta">🔄 Mixta</option>
                  <option value="autoestudio">📖 Autoestudio</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="objetivos_aprendizaje">Objetivos de Aprendizaje</label>
              <textarea
                id="objetivos_aprendizaje"
                name="objetivos_aprendizaje"
                value={formData.objetivos_aprendizaje}
                onChange={manejarCambio}
                placeholder="• Al finalizar, el participante será capaz de...&#10;• Identificar y aplicar técnicas de...&#10;• Resolver problemas relacionados con..."
                rows={4}
              />
            </div>

            <div className="form-group">
              <label htmlFor="requisitos_previos">Requisitos Previos</label>
              <textarea
                id="requisitos_previos"
                name="requisitos_previos"
                value={formData.requisitos_previos}
                onChange={manejarCambio}
                placeholder="Conocimientos o experiencia previa necesaria para aprovechar al máximo la capacitación"
                rows={2}
              />
            </div>
          </div>

          {/* Contenido */}
          <div className="form-section">
            <h3>📝 Contenido de la Capacitación</h3>
            
            <div className="form-group">
              <label htmlFor="contenido">Contenido Detallado</label>
              <textarea
                id="contenido"
                name="contenido"
                value={formData.contenido}
                onChange={manejarCambio}
                placeholder="Escribe aquí el contenido completo de la capacitación: módulos, temas, ejercicios, etc."
                rows={12}
                className="contenido-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="archivo">Archivo de Apoyo (Opcional)</label>
              <input
                type="file"
                id="archivo"
                onChange={manejarArchivo}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.rar"
                className="file-input"
              />
              <small className="file-help">
                Formatos permitidos: PDF, Word, PowerPoint, Excel, ZIP, RAR
              </small>
              {archivo && (
                <div className="file-preview">
                  📎 {archivo.name} ({(archivo.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
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
                  placeholder="capacitacion, poda, citricos, tecnicas"
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
                  placeholder="Palabras para búsqueda"
                />
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="form-section">
            <h3>⚙️ Estado de Publicación</h3>
            <div className="form-group">
              <label htmlFor="estado">Estado</label>
              <select
                id="estado"
                name="estado"
                value={formData.estado}
                onChange={manejarCambio}
              >
                <option value="borrador">📝 Borrador</option>
                <option value="revision">👀 En Revisión</option>
                <option value="publicado">✅ Publicado</option>
              </select>
            </div>
          </div>

          {/* Acciones */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-cancelar"
              disabled={loading}
            >
              ❌ Cancelar
            </button>
            
            <button
              type="submit"
              className="btn-guardar"
              disabled={loading}
            >
              {loading ? '💾 Guardando...' : '🎓 Crear Capacitación'}
            </button>
          </div>
        </form>

        {/* Sidebar de ayuda */}
        <div className="capacitacion-sidebar">
          <h3>💡 Consejos para Crear Capacitaciones</h3>
          
          <div className="tip-item">
            <strong>🎯 Objetivos Claros:</strong>
            <p>Define qué aprenderán específicamente los participantes.</p>
          </div>
          
          <div className="tip-item">
            <strong>📚 Contenido Estructurado:</strong>
            <p>Organiza el contenido en módulos o secciones lógicas.</p>
          </div>
          
          <div className="tip-item">
            <strong>🎨 Material de Apoyo:</strong>
            <p>Incluye presentaciones, documentos o videos cuando sea posible.</p>
          </div>
          
          <div className="tip-item">
            <strong>📊 Evaluación:</strong>
            <p>Considera incluir ejercicios o formas de evaluar el aprendizaje.</p>
          </div>

          <div className="tip-item">
            <strong>🔄 Actualización:</strong>
            <p>Mantén el contenido actualizado con las mejores prácticas.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreaCapacitacion;