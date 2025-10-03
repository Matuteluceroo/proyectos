// 🎓 Capacitaciones.jsx - Página para ver capacitaciones disponibles
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Capacitaciones.css';

const Capacitaciones = () => {
  const { user, API_URL } = useAuth();
  const navigate = useNavigate();
  
  // Estados
  const [capacitaciones, setCapacitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    busqueda: '',
    nivel: '',
    modalidad: '',
    categoria: ''
  });
  const [categorias, setCategorias] = useState([]);

  // 📚 Cargar capacitaciones
  const cargarCapacitaciones = async () => {
    try {
      setLoading(true);
      console.log('🔄 Cargando capacitaciones...');
      
      // Construir query con filtros
      const params = new URLSearchParams({
        tipo: 'capacitacion',
        estado: 'publicado',
        limite: '50'
      });
      
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      if (filtros.categoria) params.append('categoria_id', filtros.categoria);
      
      const response = await fetch(`${API_URL}/api/documentos?${params}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📚 Capacitaciones recibidas:', data);
      
      if (data.success && data.data) {
        let capacitacionesData = data.data.documentos || [];
        
        // Filtros adicionales en frontend
        if (filtros.nivel) {
          capacitacionesData = capacitacionesData.filter(cap => 
            cap.nivel_dificultad === filtros.nivel
          );
        }
        
        if (filtros.modalidad) {
          capacitacionesData = capacitacionesData.filter(cap => 
            cap.modalidad === filtros.modalidad
          );
        }
        
        setCapacitaciones(capacitacionesData);
      } else {
        setCapacitaciones([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar capacitaciones:', error);
      setCapacitaciones([]);
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

  // 🔍 Manejar cambios de filtros
  const manejarFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  // 🎯 Efectos
  useEffect(() => {
    cargarCategorias();
  }, []);

  useEffect(() => {
    cargarCapacitaciones();
  }, [filtros]);

  // 🎓 Componente de tarjeta de capacitación
  const TarjetaCapacitacion = ({ capacitacion }) => {
    const nivelIconos = {
      'basico': '🟢',
      'intermedio': '🟡', 
      'avanzado': '🔴'
    };
    
    const modalidadIconos = {
      'virtual': '💻',
      'presencial': '🏢',
      'mixta': '🔄',
      'autoestudio': '📖'
    };

    return (
      <div className="capacitacion-card">
        <div className="card-header">
          <div className="card-badges">
            <span className="badge nivel">
              {nivelIconos[capacitacion.nivel_dificultad] || '⚪'} 
              {capacitacion.nivel_dificultad || 'Básico'}
            </span>
            <span className="badge modalidad">
              {modalidadIconos[capacitacion.modalidad] || '📖'} 
              {capacitacion.modalidad || 'Virtual'}
            </span>
          </div>
          <div className="card-category">
            {capacitacion.categoria_icono} {capacitacion.categoria_nombre}
          </div>
        </div>

        <div className="card-content">
          <h3 className="card-title">{capacitacion.titulo}</h3>
          <p className="card-description">{capacitacion.descripcion}</p>
          
          {capacitacion.duracion_estimada && (
            <div className="card-meta">
              <span className="meta-item">
                ⏱️ {capacitacion.duracion_estimada}
              </span>
            </div>
          )}

          {capacitacion.objetivos_aprendizaje && (
            <div className="card-objectives">
              <strong>🎯 Objetivos:</strong>
              <p>{capacitacion.objetivos_aprendizaje.substring(0, 100)}...</p>
            </div>
          )}
        </div>

        <div className="card-footer">
          <div className="card-stats">
            <span className="stat-item">
              👁️ {capacitacion.vistas || 0} vistas
            </span>
            <span className="stat-item">
              📅 {new Date(capacitacion.created_at).toLocaleDateString()}
            </span>
          </div>
          
          <div className="card-actions">
            <button 
              onClick={() => navigate(`/documento/${capacitacion.id}`)}
              className="btn-iniciar"
            >
              🚀 Iniciar Capacitación
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="capacitaciones-page">
      {/* Header */}
      <div className="capacitaciones-header">
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
            <h1>🎓 Capacitaciones</h1>
            <p>Desarrolla tus habilidades con nuestros cursos especializados</p>
          </div>
        </div>
      </div>

      <div className="capacitaciones-container">
        {/* Filtros */}
        <div className="filtros-sidebar">
          <h3>🔍 Filtros</h3>
          
          <div className="filtro-grupo">
            <label>Buscar</label>
            <input
              type="text"
              placeholder="Buscar capacitaciones..."
              value={filtros.busqueda}
              onChange={(e) => manejarFiltro('busqueda', e.target.value)}
              className="filtro-input"
            />
          </div>

          <div className="filtro-grupo">
            <label>Categoría</label>
            <select
              value={filtros.categoria}
              onChange={(e) => manejarFiltro('categoria', e.target.value)}
              className="filtro-select"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.icono} {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Nivel de Dificultad</label>
            <select
              value={filtros.nivel}
              onChange={(e) => manejarFiltro('nivel', e.target.value)}
              className="filtro-select"
            >
              <option value="">Todos los niveles</option>
              <option value="basico">🟢 Básico</option>
              <option value="intermedio">🟡 Intermedio</option>
              <option value="avanzado">🔴 Avanzado</option>
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Modalidad</label>
            <select
              value={filtros.modalidad}
              onChange={(e) => manejarFiltro('modalidad', e.target.value)}
              className="filtro-select"
            >
              <option value="">Todas las modalidades</option>
              <option value="virtual">💻 Virtual</option>
              <option value="presencial">🏢 Presencial</option>
              <option value="mixta">🔄 Mixta</option>
              <option value="autoestudio">📖 Autoestudio</option>
            </select>
          </div>

          <button 
            onClick={() => setFiltros({ busqueda: '', nivel: '', modalidad: '', categoria: '' })}
            className="btn-limpiar"
          >
            🧹 Limpiar Filtros
          </button>
        </div>

        {/* Lista de capacitaciones */}
        <div className="capacitaciones-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando capacitaciones...</p>
            </div>
          ) : capacitaciones.length > 0 ? (
            <>
              <div className="resultados-header">
                <h2>📋 {capacitaciones.length} Capacitaciones Disponibles</h2>
                <p>Encuentra la capacitación perfecta para desarrollar tus habilidades</p>
              </div>
              
              <div className="capacitaciones-grid">
                {capacitaciones.map(capacitacion => (
                  <TarjetaCapacitacion 
                    key={capacitacion.id} 
                    capacitacion={capacitacion} 
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🎓</div>
              <h3>No se encontraron capacitaciones</h3>
              <p>No hay capacitaciones que coincidan con tus filtros actuales.</p>
              <button 
                onClick={() => setFiltros({ busqueda: '', nivel: '', modalidad: '', categoria: '' })}
                className="btn-ver-todas"
              >
                📚 Ver Todas las Capacitaciones
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Capacitaciones;