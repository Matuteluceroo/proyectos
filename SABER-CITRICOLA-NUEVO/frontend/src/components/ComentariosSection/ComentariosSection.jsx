// 💬 ComentariosSection.jsx - Componente para mostrar y gestionar comentarios
import { useState, useEffect } from 'react';
import {
  obtenerComentariosDocumento,
  crearComentario as crearComentarioAPI,
  actualizarComentario as actualizarComentarioAPI,
  eliminarComentario as eliminarComentarioAPI,
  reaccionarComentario
} from '../../services/comentariosAPI';
import './ComentariosSection.css';

const ComentariosSection = ({ documentoId, usuarioActual }) => {
  const [comentarios, setComentarios] = useState([]);
  const [estadisticas, setEstadisticas] = useState({});
  const [loading, setLoading] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [respondiendo, setRespondiendo] = useState(null);
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');

  // 📖 Cargar comentarios
  useEffect(() => {
    if (documentoId) {
      cargarComentarios();
    }
  }, [documentoId]);

  const cargarComentarios = async () => {
    try {
      setLoading(true);
      const data = await obtenerComentariosDocumento(documentoId);

      if (data.success) {
        setComentarios(data.data.comentarios);
        setEstadisticas(data.data.estadisticas);
      } else {
        setError(data.message || 'Error cargando comentarios');
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      setError(error.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  // 📝 Crear nuevo comentario
  const crearComentario = async (contenido, comentarioPadreId = null) => {
    try {
      const data = await crearComentarioAPI({
        documento_id: documentoId,
        contenido,
        comentario_padre_id: comentarioPadreId
      });

      if (data.success) {
        await cargarComentarios(); // Recargar comentarios
        setNuevoComentario('');
        setRespondiendo(null);
        return true;
      } else {
        setError(data.message || 'Error creando comentario');
        return false;
      }
    } catch (error) {
      console.error('Error creando comentario:', error);
      setError(error.message || 'Error de conexión');
      return false;
    }
  };

  // ✏️ Editar comentario
  const editarComentario = async (comentarioId, nuevoContenido) => {
    try {
      const data = await actualizarComentarioAPI(comentarioId, { contenido: nuevoContenido });

      if (data.success) {
        await cargarComentarios();
        setEditando(null);
        return true;
      } else {
        setError(data.message || 'Error editando comentario');
        return false;
      }
    } catch (error) {
      console.error('Error editando comentario:', error);
      setError(error.message || 'Error de conexión');
      return false;
    }
  };

  // 🗑️ Eliminar comentario
  const eliminar = async (comentarioId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      const data = await eliminarComentarioAPI(comentarioId);

      if (data.success) {
        await cargarComentarios();
      } else {
        setError(data.message || 'Error eliminando comentario');
      }
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      setError(error.message || 'Error de conexión');
    }
  };

  // 👍 Reaccionar a comentario
  const reaccionar = async (comentarioId, tipo) => {
    try {
      const data = await reaccionarComentario(comentarioId, tipo);

      if (data.success) {
        await cargarComentarios(); // Recargar para actualizar contadores
      } else {
        setError(data.message || 'Error procesando reacción');
      }
    } catch (error) {
      console.error('Error en reacción:', error);
      setError('Error de conexión');
    }
  };

  // 🚫 Reportar comentario
  const reportarComentario = async (comentarioId, razon, descripcion = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/comentarios/${comentarioId}/reportar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ razon, descripcion })
      });

      const data = await response.json();

      if (data.success) {
        alert('Reporte enviado correctamente');
      } else {
        setError(data.message || 'Error enviando reporte');
      }
    } catch (error) {
      console.error('Error reportando:', error);
      setError('Error de conexión');
    }
  };

  // 📝 Manejar envío de comentario principal
  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    if (nuevoComentario.trim().length < 5) {
      setError('El comentario debe tener al menos 5 caracteres');
      return;
    }
    await crearComentario(nuevoComentario.trim());
  };

  // 🔄 Formatear fecha
  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 📝 Componente de formulario de respuesta
  const FormularioRespuesta = ({ comentarioId, onCancel, onSuccess }) => {
    const [contenido, setContenido] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (contenido.trim().length < 5) {
        setError('La respuesta debe tener al menos 5 caracteres');
        return;
      }
      
      const success = await crearComentario(contenido.trim(), comentarioId);
      if (success) {
        onSuccess();
      }
    };

    return (
      <form onSubmit={handleSubmit} className="formulario-respuesta">
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder="Escribe tu respuesta..."
          rows={3}
          maxLength={2000}
          required
        />
        <div className="botones-respuesta">
          <button type="submit" className="btn-enviar">Responder</button>
          <button type="button" onClick={onCancel} className="btn-cancelar">Cancelar</button>
        </div>
      </form>
    );
  };

  // ✏️ Componente de formulario de edición
  const FormularioEdicion = ({ comentario, onCancel, onSuccess }) => {
    const [contenido, setContenido] = useState(comentario.contenido);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (contenido.trim().length < 5) {
        setError('El comentario debe tener al menos 5 caracteres');
        return;
      }
      
      const success = await editarComentario(comentario.id, contenido.trim());
      if (success) {
        onSuccess();
      }
    };

    return (
      <form onSubmit={handleSubmit} className="formulario-edicion">
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={3}
          maxLength={2000}
          required
        />
        <div className="botones-edicion">
          <button type="submit" className="btn-guardar">Guardar</button>
          <button type="button" onClick={onCancel} className="btn-cancelar">Cancelar</button>
        </div>
      </form>
    );
  };

  // 💬 Componente de comentario individual
  const ComentarioItem = ({ comentario, nivel = 0 }) => {
    const esAutor = usuarioActual?.id === comentario.usuario_id;
    const esAdmin = usuarioActual?.rol === 'administrador';
    const puedeEditar = esAutor && !comentario.fecha_eliminacion;
    const puedeEliminar = (esAutor || esAdmin) && !comentario.fecha_eliminacion;

    return (
      <div className={`comentario-item nivel-${Math.min(nivel, 3)}`}>
        <div className="comentario-header">
          <div className="autor-info">
            <span className="autor-nombre">{comentario.nombre_completo || comentario.username}</span>
            <span className="autor-rol">{comentario.rol}</span>
            <span className="fecha">{formatearFecha(comentario.fecha_creacion)}</span>
            {comentario.fecha_modificacion !== comentario.fecha_creacion && (
              <span className="editado">(editado)</span>
            )}
          </div>
          
          <div className="comentario-acciones">
            {puedeEditar && (
              <button 
                onClick={() => setEditando(comentario.id)}
                className="btn-editar"
                title="Editar comentario"
              >
                ✏️
              </button>
            )}
            {puedeEliminar && (
              <button 
                onClick={() => eliminarComentario(comentario.id)}
                className="btn-eliminar"
                title="Eliminar comentario"
              >
                🗑️
              </button>
            )}
            {!esAutor && (
              <button 
                onClick={() => reportarComentario(comentario.id, 'otro', 'Reportado por el usuario')}
                className="btn-reportar"
                title="Reportar comentario"
              >
                🚫
              </button>
            )}
          </div>
        </div>

        <div className="comentario-contenido">
          {editando === comentario.id ? (
            <FormularioEdicion
              comentario={comentario}
              onCancel={() => setEditando(null)}
              onSuccess={() => setEditando(null)}
            />
          ) : (
            <p>{comentario.contenido}</p>
          )}
        </div>

        <div className="comentario-footer">
          <div className="reacciones">
            <button 
              onClick={() => reaccionar(comentario.id, 'like')}
              className={`btn-reaccion ${comentario.mi_reaccion === 'like' ? 'activa' : ''}`}
            >
              👍 {comentario.total_likes || 0}
            </button>
            <button 
              onClick={() => reaccionar(comentario.id, 'dislike')}
              className={`btn-reaccion ${comentario.mi_reaccion === 'dislike' ? 'activa' : ''}`}
            >
              👎 {comentario.total_dislikes || 0}
            </button>
          </div>

          {nivel < 3 && (
            <button 
              onClick={() => setRespondiendo(respondiendo === comentario.id ? null : comentario.id)}
              className="btn-responder"
            >
              💬 Responder ({comentario.total_respuestas || 0})
            </button>
          )}
        </div>

        {respondiendo === comentario.id && (
          <FormularioRespuesta
            comentarioId={comentario.id}
            onCancel={() => setRespondiendo(null)}
            onSuccess={() => setRespondiendo(null)}
          />
        )}

        {/* Respuestas anidadas */}
        {comentario.respuestas && comentario.respuestas.length > 0 && (
          <div className="respuestas">
            {comentario.respuestas.map(respuesta => (
              <ComentarioItem 
                key={respuesta.id} 
                comentario={respuesta} 
                nivel={nivel + 1}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="comentarios-loading">Cargando comentarios...</div>;
  }

  return (
    <div className="comentarios-section">
      <div className="comentarios-header">
        <h3>💬 Comentarios ({estadisticas.total_comentarios || 0})</h3>
        <div className="estadisticas-comentarios">
          {estadisticas.total_likes > 0 && (
            <span>👍 {estadisticas.total_likes} likes</span>
          )}
          {estadisticas.comentarios_activos !== estadisticas.total_comentarios && (
            <span>👥 {estadisticas.comentarios_activos} activos</span>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      {usuarioActual && (
        <form onSubmit={handleSubmitComentario} className="nuevo-comentario">
          <textarea
            value={nuevoComentario}
            onChange={(e) => setNuevoComentario(e.target.value)}
            placeholder="Comparte tu opinión sobre este documento..."
            rows={4}
            maxLength={2000}
          />
          <div className="contador-caracteres">
            {nuevoComentario.length}/2000
          </div>
          <button 
            type="submit" 
            disabled={nuevoComentario.trim().length < 5}
            className="btn-comentar"
          >
            💬 Comentar
          </button>
        </form>
      )}

      <div className="comentarios-lista">
        {comentarios.length === 0 ? (
          <div className="sin-comentarios">
            <p>😊 Sé el primero en comentar sobre este documento</p>
          </div>
        ) : (
          comentarios.map(comentario => (
            <ComentarioItem key={comentario.id} comentario={comentario} />
          ))
        )}
      </div>
    </div>
  );
};

export default ComentariosSection;