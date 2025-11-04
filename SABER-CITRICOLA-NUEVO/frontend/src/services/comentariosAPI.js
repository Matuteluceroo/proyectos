/**
 * 💬 COMENTARIOS API - Servicio para gestión de comentarios
 * ===========================================================
 * Todas las funciones de API relacionadas con comentarios en documentos.
 */

import api from './api.js';

/**
 * Obtener comentarios de un documento
 * @param {number} documentoId - ID del documento
 * @returns {Promise<Object>} Objeto con comentarios y estadísticas
 */
export const obtenerComentariosDocumento = async (documentoId) => {
  const { data } = await api.get(`/comentarios/documento/${documentoId}`);
  return data;
};

/**
 * Crear un nuevo comentario
 * @param {Object} comentario - Datos del comentario
 * @param {number} comentario.documento_id - ID del documento
 * @param {string} comentario.contenido - Contenido del comentario
 * @param {number} [comentario.comentario_padre_id] - ID del comentario padre (para respuestas)
 * @returns {Promise<Object>} Comentario creado
 */
export const crearComentario = async (comentario) => {
  const { data } = await api.post('/comentarios', comentario);
  return data;
};

/**
 * Actualizar un comentario existente
 * @param {number} comentarioId - ID del comentario
 * @param {Object} datos - Datos a actualizar
 * @param {string} datos.contenido - Nuevo contenido del comentario
 * @returns {Promise<Object>} Comentario actualizado
 */
export const actualizarComentario = async (comentarioId, datos) => {
  const { data } = await api.put(`/comentarios/${comentarioId}`, datos);
  return data;
};

/**
 * Eliminar un comentario
 * @param {number} comentarioId - ID del comentario
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const eliminarComentario = async (comentarioId) => {
  const { data } = await api.delete(`/comentarios/${comentarioId}`);
  return data;
};

/**
 * Reaccionar a un comentario
 * @param {number} comentarioId - ID del comentario
 * @param {string} tipo - Tipo de reacción ('like', 'love', 'thinking', etc.)
 * @returns {Promise<Object>} Reacción registrada
 */
export const reaccionarComentario = async (comentarioId, tipo) => {
  const { data } = await api.post(`/comentarios/${comentarioId}/reaccion`, { tipo });
  return data;
};

/**
 * Marcar comentario como resuelto/útil
 * @param {number} comentarioId - ID del comentario
 * @param {boolean} resuelto - Si el comentario está resuelto
 * @returns {Promise<Object>} Comentario actualizado
 */
export const marcarComentarioResuelto = async (comentarioId, resuelto = true) => {
  const { data } = await api.patch(`/comentarios/${comentarioId}/resuelto`, { resuelto });
  return data;
};

