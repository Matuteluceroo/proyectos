/**
 * 🔍 BÚSQUEDA API - Servicio para búsqueda global
 * ================================================
 * Funciones de API para búsqueda de contenido.
 * Usa Axios (configurado en api.js) con autenticación automática.
 */

import api from './api.js';

/**
 * Buscar contenido globalmente
 * @param {string} termino - Término de búsqueda
 * @param {Object} opciones - Opciones de búsqueda (tipo, categoria, limite, etc.)
 * @returns {Promise<Object>} Resultados de búsqueda
 */
export const buscarContenido = async (termino, opciones = {}) => {
    const params = new URLSearchParams();
    params.append('q', termino);
    
    if (opciones.tipo) params.append('tipo', opciones.tipo);
    if (opciones.categoria) params.append('categoria', opciones.categoria);
    if (opciones.limite) params.append('limite', opciones.limite);
    if (opciones.orden) params.append('orden', opciones.orden);
    
    const { data } = await api.get(`/buscar?${params.toString()}`);
    return data;
};

/**
 * Obtener sugerencias de búsqueda
 * @param {string} termino - Término parcial
 * @returns {Promise<Array>} Sugerencias
 */
export const obtenerSugerencias = async (termino) => {
    const { data } = await api.get(`/buscar/sugerencias?q=${termino}`);
    return data.sugerencias || data.data || data;
};

/**
 * Buscar en categoría específica
 * @param {string} categoria - Categoría (documentos, procedimientos, guias, capacitaciones)
 * @param {string} termino - Término de búsqueda
 * @returns {Promise<Array>} Resultados filtrados
 */
export const buscarEnCategoria = async (categoria, termino) => {
    const { data } = await api.get(`/buscar/${categoria}?q=${termino}`);
    return data.resultados || data.data || data;
};

/**
 * Registrar búsqueda (para analytics)
 * @param {string} termino - Término buscado
 * @param {number} resultados - Cantidad de resultados
 * @returns {Promise<void>}
 */
export const registrarBusqueda = async (termino, resultados) => {
    try {
        await api.post('/buscar/log', { termino, resultados, timestamp: Date.now() });
    } catch (error) {
        console.warn('⚠️ No se pudo registrar búsqueda:', error);
        // No es crítico, no throw error
    }
};

