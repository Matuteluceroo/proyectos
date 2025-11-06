// 📚 HistorialVersiones.jsx - Componente para mostrar y gestionar versiones de documentos
import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import './HistorialVersiones.css';

const HistorialVersiones = ({ documentoId, onVersionSeleccionada, onCerrar }) => {
  const { API_URL, user } = useAuth();

  // Estados
  const [versiones, setVersiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [estadisticas, setEstadisticas] = useState({});
  const [versionSeleccionada, setVersionSeleccionada] = useState(null);
  const [versionComparar, setVersionComparar] = useState(null);
  const [mostrarComparacion, setMostrarComparacion] = useState(false);
  const [diferencias, setDiferencias] = useState(null);
  const [filtros, setFiltros] = useState({
    tipo_cambio: '',
    usuario_id: '',
    etiqueta: ''
  });

  // 📄 Cargar historial de versiones
  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_URL}/api/versiones/documento/${documentoId}/historial`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setVersiones(data.data);
        
        // Cargar estadísticas
        await cargarEstadisticas();
      } else {
        setError(data.message || 'Error al cargar versiones');
      }

    } catch (error) {
      console.error('❌ Error al cargar historial:', error);
      setError('Error de conexión al cargar historial');
    } finally {
      setLoading(false);
    }
  };

  // 📊 Cargar estadísticas de versiones
  const cargarEstadisticas = async () => {
    try {
      const response = await fetch(`${API_URL}/api/versiones/documento/${documentoId}/estadisticas`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setEstadisticas(data.data);
        }
      }
    } catch (error) {
      console.warn('⚠️ Error al cargar estadísticas:', error);
    }
  };

  // 🔄 Comparar versiones
  const compararVersiones = async (versionOrigenId, versionDestinoId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/api/versiones/diferencias/${versionOrigenId}/${versionDestinoId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al comparar versiones');
      }

      const data = await response.json();
      
      if (data.success) {
        setDiferencias(data.data);
        setMostrarComparacion(true);
      } else {
        setError(data.message || 'Error al comparar versiones');
      }

    } catch (error) {
      console.error('❌ Error al comparar versiones:', error);
      setError('Error al comparar versiones');
    } finally {
      setLoading(false);
    }
  };

  // 🔙 Restaurar versión
  const restaurarVersion = async (versionId, razon = '') => {
    try {
      if (!window.confirm('¿Estás seguro de que quieres restaurar esta versión? Se creará una copia de seguridad de la versión actual.')) {
        return;
      }

      setLoading(true);

      const response = await fetch(`${API_URL}/api/versiones/documento/${documentoId}/restaurar/${versionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ razon_restauracion: razon })
      });

      if (!response.ok) {
        throw new Error('Error al restaurar versión');
      }

      const data = await response.json();
      
      if (data.success) {
        alert('Versión restaurada exitosamente');
        cargarHistorial(); // Recargar historial
        if (onVersionSeleccionada) {
          onVersionSeleccionada(data.data);
        }
      } else {
        setError(data.message || 'Error al restaurar versión');
      }

    } catch (error) {
      console.error('❌ Error al restaurar versión:', error);
      setError('Error al restaurar versión');
    } finally {
      setLoading(false);
    }
  };

  // 🏷️ Agregar etiqueta a versión
  const agregarEtiqueta = async (versionId, etiqueta, descripcion) => {
    try {
      const response = await fetch(`${API_URL}/api/versiones/version/${versionId}/etiqueta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ etiqueta, descripcion })
      });

      if (response.ok) {
        cargarHistorial(); // Recargar para mostrar nueva etiqueta
      }
    } catch (error) {
      console.error('❌ Error al agregar etiqueta:', error);
    }
  };

  // 🎯 Efectos
  useEffect(() => {
    if (documentoId) {
      cargarHistorial();
    }
  }, [documentoId]);

  // 🔄 Estados de carga
  if (loading) {
    return (
      <div className="historial-versiones-modal">
        <div className="historial-content">
          <div className="loading-historial">
            <div className="loading-spinner"></div>
            <p>Cargando historial de versiones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historial-versiones-modal">
        <div className="historial-content">
          <div className="error-historial">
            <h3>❌ Error</h3>
            <p>{error}</p>
            <button onClick={cargarHistorial} className="btn-reintentar">
              🔄 Reintentar
            </button>
            <button onClick={onCerrar} className="btn-cerrar">
              ✖️ Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="historial-versiones-modal">
      <div className="historial-content">
        {/* Header */}
        <div className="historial-header">
          <div className="header-info">
            <h2>📚 Historial de Versiones</h2>
            <div className="estadisticas-rapidas">
              <span className="stat-item">
                📄 {estadisticas.total_versiones || versiones.length} versiones
              </span>
              <span className="stat-item">
                👥 {estadisticas.total_editores_unicos || 0} editores
              </span>
              <span className="stat-item">
                🔄 {estadisticas.total_restauraciones || 0} restauraciones
              </span>
            </div>
          </div>
          <button onClick={onCerrar} className="btn-cerrar-modal">
            ✖️
          </button>
        </div>

        {/* Filtros */}
        <div className="historial-filtros">
          <select 
            value={filtros.tipo_cambio}
            onChange={(e) => setFiltros({...filtros, tipo_cambio: e.target.value})}
            className="filtro-select"
          >
            <option value="">Todos los tipos</option>
            <option value="creacion">Creación</option>
            <option value="edicion">Edición</option>
            <option value="restauracion">Restauración</option>
            <option value="backup">Backup</option>
          </select>

          <input
            type="text"
            placeholder="Filtrar por etiqueta..."
            value={filtros.etiqueta}
            onChange={(e) => setFiltros({...filtros, etiqueta: e.target.value})}
            className="filtro-input"
          />
        </div>

        {/* Lista de versiones */}
        <div className="versiones-lista">
          {versiones.length === 0 ? (
            <div className="sin-versiones">
              <p>📄 No hay versiones disponibles</p>
            </div>
          ) : (
            versiones.map((version) => (
              <div 
                key={version.id} 
                className={`version-item ${version.es_version_actual ? 'version-actual' : ''}`}
              >
                {/* Header de la versión */}
                <div className="version-header">
                  <div className="version-info">
                    <div className="version-numero">
                      {version.numero_version}
                      {version.es_version_actual && (
                        <span className="badge-actual">ACTUAL</span>
                      )}
                    </div>
                    <div className="version-metadata">
                      <span className="version-autor">
                        👤 {version.usuario_nombre}
                      </span>
                      <span className="version-fecha">
                        🕒 {version.fecha_creacion_formateada}
                      </span>
                      <span className={`version-tipo tipo-${version.tipo_cambio}`}>
                        {version.tipo_cambio}
                      </span>
                    </div>
                  </div>

                  <div className="version-acciones">
                    <button
                      onClick={() => setVersionSeleccionada(
                        versionSeleccionada === version.id ? null : version.id
                      )}
                      className="btn-ver-detalles"
                    >
                      {versionSeleccionada === version.id ? '🔼' : '🔽'}
                    </button>
                    
                    {!version.es_version_actual && (
                      <button
                        onClick={() => setVersionComparar(version.id)}
                        className="btn-comparar"
                        title="Comparar con versión actual"
                      >
                        🔄
                      </button>
                    )}

                    {(user.rol === 'administrador' || user.rol === 'experto') && !version.es_version_actual && (
                      <button
                        onClick={() => restaurarVersion(version.id)}
                        className="btn-restaurar"
                        title="Restaurar esta versión"
                      >
                        🔙
                      </button>
                    )}
                  </div>
                </div>

                {/* Etiquetas de la versión */}
                {version.etiquetas && version.etiquetas.length > 0 && (
                  <div className="version-etiquetas">
                    {version.etiquetas.map((etiqueta, index) => (
                      <span 
                        key={index} 
                        className="etiqueta-badge"
                        style={{ backgroundColor: etiqueta.color }}
                      >
                        {etiqueta.icono} {etiqueta.etiqueta}
                      </span>
                    ))}
                  </div>
                )}

                {/* Comentario de la versión */}
                {version.comentario_version && (
                  <div className="version-comentario">
                    💬 {version.comentario_version}
                  </div>
                )}

                {/* Detalles expandibles */}
                {versionSeleccionada === version.id && (
                  <div className="version-detalles">
                    <div className="detalles-grid">
                      <div className="detalle-item">
                        <strong>Título:</strong>
                        <span>{version.titulo}</span>
                      </div>
                      
                      {version.descripcion && (
                        <div className="detalle-item">
                          <strong>Descripción:</strong>
                          <span>{version.descripcion}</span>
                        </div>
                      )}

                      <div className="detalle-item">
                        <strong>Tamaño:</strong>
                        <span>{version.tamano_contenido} caracteres</span>
                      </div>

                      <div className="detalle-item">
                        <strong>Vistas:</strong>
                        <span>{version.vistas || 0}</span>
                      </div>

                      {version.archivo_nombre_original && (
                        <div className="detalle-item">
                          <strong>Archivo:</strong>
                          <span>📎 {version.archivo_nombre_original}</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones adicionales */}
                    <div className="detalles-acciones">
                      <button
                        onClick={() => onVersionSeleccionada && onVersionSeleccionada(version)}
                        className="btn-seleccionar"
                      >
                        📄 Ver Contenido
                      </button>

                      {(user.rol === 'administrador' || user.rol === 'experto') && (
                        <button
                          onClick={() => {
                            const etiqueta = prompt('Etiqueta:');
                            const descripcion = prompt('Descripción (opcional):');
                            if (etiqueta) {
                              agregarEtiqueta(version.id, etiqueta, descripcion);
                            }
                          }}
                          className="btn-etiquetar"
                        >
                          🏷️ Etiquetar
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal de comparación */}
        {mostrarComparacion && diferencias && (
          <div className="comparacion-modal">
            <div className="comparacion-content">
              <div className="comparacion-header">
                <h3>🔄 Comparación de Versiones</h3>
                <button 
                  onClick={() => setMostrarComparacion(false)}
                  className="btn-cerrar-comparacion"
                >
                  ✖️
                </button>
              </div>

              <div className="comparacion-info">
                <div className="version-origen">
                  <h4>📄 Versión Origen</h4>
                  <p><strong>Número:</strong> {diferencias.version_origen.numero_version}</p>
                  <p><strong>Fecha:</strong> {new Date(diferencias.version_origen.fecha_creacion).toLocaleString()}</p>
                  <p><strong>Autor:</strong> {diferencias.version_origen.usuario_nombre}</p>
                </div>

                <div className="version-destino">
                  <h4>📄 Versión Destino</h4>
                  <p><strong>Número:</strong> {diferencias.version_destino.numero_version}</p>
                  <p><strong>Fecha:</strong> {new Date(diferencias.version_destino.fecha_creacion).toLocaleString()}</p>
                  <p><strong>Autor:</strong> {diferencias.version_destino.usuario_nombre}</p>
                </div>
              </div>

              <div className="diferencias-estadisticas">
                <div className="stat-diff">
                  ➕ {diferencias.diferencias.estadisticas.adiciones} adiciones
                </div>
                <div className="stat-diff">
                  ➖ {diferencias.diferencias.estadisticas.eliminaciones} eliminaciones
                </div>
                <div className="stat-diff">
                  🔄 {diferencias.diferencias.estadisticas.modificaciones} modificaciones
                </div>
                <div className="stat-diff">
                  📊 {diferencias.diferencias.estadisticas.porcentajeCambio}% de cambio
                </div>
              </div>

              {/* Mostrar diferencias de contenido */}
              {diferencias.diferencias.contenido.length > 0 && (
                <div className="diferencias-contenido">
                  <h4>📝 Diferencias en Contenido</h4>
                  <div className="diff-lista">
                    {diferencias.diferencias.contenido.slice(0, 10).map((diff, index) => (
                      <div key={index} className={`diff-item diff-${diff.tipo}`}>
                        <div className="diff-linea">Línea {diff.linea}</div>
                        <div className="diff-tipo">{diff.tipo}</div>
                        {diff.contenidoOrigen && (
                          <div className="diff-contenido origen">
                            <strong>Anterior:</strong> {diff.contenidoOrigen}
                          </div>
                        )}
                        {diff.contenidoDestino && (
                          <div className="diff-contenido destino">
                            <strong>Nuevo:</strong> {diff.contenidoDestino}
                          </div>
                        )}
                      </div>
                    ))}
                    {diferencias.diferencias.contenido.length > 10 && (
                      <div className="diff-mas">
                        ... y {diferencias.diferencias.contenido.length - 10} cambios más
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistorialVersiones;