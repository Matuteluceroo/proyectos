import { buildApiUrl } from '../config/app.config.js';
/**
 * 📚 GESTIÓN DE CONTENIDO API - Servicio para categorías y documentos
 * ======================================================================
 * Todas las funciones de API relacionadas con gestión de contenido.
 * Usa Axios (configurado en api.js) con autenticación automática.
 */

import api from './api.js';
import QueryBuilder from '../utils/queryBuilder.js';

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
 * @param {Object} filtros - Filtros de búsqueda
 * @param {number} filtros.categoria - ID de categoría
 * @param {string} filtros.busqueda - Término de búsqueda
 * @param {string} filtros.estado - Estado del documento (activo/borrador)
 * @param {string} filtros.tipo - Tipo de documento (pdf/video/texto)
 * @param {number} filtros.page - Número de página
 * @param {number} filtros.limit - Cantidad de resultados por página
 * @param {string} filtros.orden - Campo para ordenar
 * @param {string} filtros.direccion - Dirección del ordenamiento (ASC/DESC)
 * @returns {Promise<Array>} Lista de documentos
 * 
 * @example
 * // Búsqueda simple
 * const docs = await obtenerDocumentos({ busqueda: 'fertilizantes' });
 * 
 * // Con filtros y paginación
 * const docs = await obtenerDocumentos({
 *   categoria: 5,
 *   estado: 'activo',
 *   page: 2,
 *   limit: 20,
 *   orden: 'titulo',
 *   direccion: 'ASC'
 * });
 */
export const obtenerDocumentos = async (filtros = {}) => {
    const builder = new QueryBuilder('/contenido/documentos')
        .addFilter('categoria_id', filtros.categoria)
        .addFilter('tipo', filtros.tipo)
        .addFilter('estado', filtros.estado)
        .addFilter('nivel_acceso', filtros.nivel_acceso)
        .addSearch(filtros.busqueda)
        .addPagination(filtros.page, filtros.limit)
        .addSort(filtros.orden, filtros.direccion)
        .addDateRange(filtros.fechaDesde, filtros.fechaHasta);
    
    const url = builder.build();
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
    const url = new QueryBuilder('/contenido/documentos/recientes')
        .addLimit(limite)
        .build();
    
    const { data } = await api.get(url);
    return data;
};
        