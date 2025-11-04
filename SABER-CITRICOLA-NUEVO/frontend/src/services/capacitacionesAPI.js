/**
 * 🎓 CAPACITACIONES API - Servicio para módulos de capacitación
 * ============================================================
 * Todas las funciones de API relacionadas con capacitaciones.
 * Usa Axios (configurado en api.js) con autenticación automática.
 */

import api from './api.js';

/**
 * Obtener todas las capacitaciones
 * @param {Object} filtros - Filtros opcionales (categoria, estado)
 * @returns {Promise<Array>} Lista de capacitaciones
 */
export const obtenerCapacitaciones = async (filtros = {}) => {
    const params = new URLSearchParams();
    if (filtros.categoria) params.append('categoria', filtros.categoria);
    if (filtros.estado) params.append('estado', filtros.estado);
    
    const queryString = params.toString();
    const url = `/capacitaciones${queryString ? `?${queryString}` : ''}`;
    
    const { data } = await api.get(url);
    return data.capacitaciones || data.data || data;
};

/**
 * Obtener capacitación por ID
 * @param {number} id - ID de la capacitación
 * @returns {Promise<Object>} Datos de la capacitación
 */
export const obtenerCapacitacionPorId = async (id) => {
    const { data } = await api.get(`/capacitaciones/${id}`);
    return data.capacitacion || data.data || data;
};

/**
 * Inscribirse en una capacitación
 * @param {number} id - ID de la capacitación
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Object>} Resultado de la inscripción
 */
export const inscribirseCapacitacion = async (id, usuarioId) => {
    const { data } = await api.post(`/capacitaciones/${id}/inscribir`, { usuarioId });
    return data;
};

/**
 * Obtener progreso de capacitación
 * @param {number} id - ID de la capacitación
 * @param {number} usuarioId - ID del usuario
 * @returns {Promise<Object>} Progreso del usuario
 */
export const obtenerProgresoCapacitacion = async (id, usuarioId) => {
    const { data } = await api.get(`/capacitaciones/${id}/progreso/${usuarioId}`);
    return data.progreso || data.data || data;
};

/**
 * Actualizar progreso de capacitación
 * @param {number} id - ID de la capacitación
 * @param {Object} progresoData - Datos del progreso (usuarioId, moduloId, completado, etc.)
 * @returns {Promise<Object>} Progreso actualizado
 */
export const actualizarProgresoCapacitacion = async (id, progresoData) => {
    const { data } = await api.put(`/capacitaciones/${id}/progreso`, progresoData);
    return data;
};

/**
 * Crear nueva capacitación
 * @param {Object} capacitacionData - Datos de la capacitación
 * @returns {Promise<Object>} Capacitación creada
 */
export const crearCapacitacion = async (capacitacionData) => {
    const { data } = await api.post('/capacitaciones', capacitacionData);
    return data;
};

/**
 * Actualizar capacitación
 * @param {number} id - ID de la capacitación
 * @param {Object} capacitacionData - Datos actualizados
 * @returns {Promise<Object>} Capacitación actualizada
 */
export const actualizarCapacitacion = async (id, capacitacionData) => {
    const { data } = await api.put(`/capacitaciones/${id}`, capacitacionData);
    return data;
};

/**
 * Eliminar capacitación
 * @param {number} id - ID de la capacitación
 * @returns {Promise<Object>} Resultado de la eliminación
 */
export const eliminarCapacitacion = async (id) => {
    const { data } = await api.delete(`/capacitaciones/${id}`);
    return data;
};

