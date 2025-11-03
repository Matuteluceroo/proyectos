import { buildApiUrl } from '../config/app.config.js';
/**
 * 📚 GESTIÓN DE CONTENIDO API - Servicio para categorías y documentos
 * ======================================================================
 * Todas las funciones de API relacionadas con gestión de contenido.
 * Usa Axios (configurado en api.js) con autenticación automática.
 */

import api from './api.js';

// ============================================================================
// 📁 GESTIÓN DE CATEGORÍAS
// ============================================================================

/**
 * Obtener todas las categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export const obtenerCategorias = async () => {
    const { data } = await api.get('/contenido/categorias');
        return data;
};

/**
 * Crear nueva categoría
 * @param {Object} categoria - Datos de la categoría
 * @returns {Promise<Object>} Categoría creada
 */
export const crearCategoria = async (categoria) => {
    const { data } = await api.post('/contenido/categorias', categoria);
        return data;
};

/**
 * Actualizar categoría existente
 * @param {number} id - ID de la categoría
 * @param {Object} categoria - Datos actualizados
 * @returns {Promise<Object>} Categoría actualizada
 */
export const actualizarCategoria = async (id, categoria) => {
    const { data } = await api.put(`/contenido/categorias/${id}`, categoria);
        return data;
};

/**
 * Eliminar categoría
 * @param {number} id - ID de la categoría
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const eliminarCategoria = async (id) => {
    const { data } = await api.delete(`/contenido/categorias/${id}`);
    return data;
};

// ============================================================================
// 📄 GESTIÓN DE DOCUMENTOS
// ============================================================================

/**
 * Obtener documentos con filtros opcionales
 * @param {Object} filtros - Filtros de búsqueda (categoria, busqueda, estado)
 * @returns {Promise<Array>} Lista de documentos
 */
export const obtenerDocumentos = async (filtros = {}) => {
        const params = new URLSearchParams();
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        if (filtros.estado) params.append('estado', filtros.estado);
        
    const queryString = params.toString();
    const url = queryString ? `/contenido/documentos?${queryString}` : '/contenido/documentos';
    
    const { data } = await api.get(url);
        return data;
};

/**
 * Obtener documento por ID
 * @param {number} id - ID del documento
 * @returns {Promise<Object>} Documento encontrado
 */
export const obtenerDocumentoPorId = async (id) => {
    const { data } = await api.get(`/contenido/documentos/${id}`);
        return data;
};

/**
 * Actualizar documento
 * @param {number} id - ID del documento
 * @param {Object} documento - Datos actualizados
 * @returns {Promise<Object>} Documento actualizado
 */
export const actualizarDocumento = async (id, documento) => {
    const { data } = await api.put(`/contenido/documentos/${id}`, documento);
        return data;
};

/**
 * Eliminar documento
 * @param {number} id - ID del documento
 * @returns {Promise<Object>} Confirmación de eliminación
 */
export const eliminarDocumento = async (id) => {
    const { data } = await api.delete(`/contenido/documentos/${id}`);
    return data;
};

/**
 * Cambiar estado de documento (activo/borrador)
 * @param {number} id - ID del documento
 * @param {string} estado - Nuevo estado ('activo' o 'borrador')
 * @returns {Promise<Object>} Documento con estado actualizado
 */
export const cambiarEstadoDocumento = async (id, estado) => {
    const { data } = await api.patch(`/contenido/documentos/${id}/estado`, { estado });
        return data;
};

// ============================================================================
// 📊 ESTADÍSTICAS Y MÉTRICAS
// ============================================================================

/**
 * Obtener estadísticas de contenido
 * @returns {Promise<Object>} Estadísticas del sistema
 */
export const obtenerEstadisticasContenido = async () => {
    const { data } = await api.get('/contenido/estadisticas');
        return data;
};

/**
 * Obtener documentos recientes
 * @param {number} limite - Número máximo de documentos a retornar
 * @returns {Promise<Array>} Lista de documentos recientes
 */
export const obtenerDocumentosRecientes = async (limite = 10) => {
    const { data } = await api.get(`/contenido/documentos/recientes?limite=${limite}`);
        return data;
};
        