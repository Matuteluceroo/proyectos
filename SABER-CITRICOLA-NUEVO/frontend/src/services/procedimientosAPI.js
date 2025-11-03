import { buildApiUrl } from '../config/app.config.js';
/**
 * 📋 PROCEDIMIENTOS API - Servicio para procedimientos paso a paso
 * ==================================================================
 * Todas las funciones de API relacionadas con procedimientos.
 * Usa Axios (configurado en api.js) con autenticación automática.
 */

import api from './api.js';

/**
 * Obtener todos los procedimientos
 * @returns {Promise<Array>} Lista de procedimientos
 */
export const obtenerProcedimientos = async () => {
    try {
        const { data } = await api.get('/procedimientos');
        return data.procedimientos || data;
    } catch (error) {
        console.error('❌ Error al obtener procedimientos:', error);
        // Retornar datos de ejemplo en caso de error
        return [
            {
                id: 1,
                titulo: 'Poda de Formación en Cítricos',
                descripcion: 'Procedimiento completo para realizar poda de formación en árboles jóvenes de cítricos',
                categoria: 'mantenimiento',
                icono: '✂️',
                dificultad: 'media',
                duracionEstimada: '45-60 minutos',
                pasos: [
                    {
                        titulo: 'Preparación de herramientas',
                        descripcion: 'Preparar y desinfectar todas las herramientas necesarias para la poda',
                        instrucciones: [
                            'Limpiar tijeras de poda con alcohol al 70%',
                            'Verificar el filo de las herramientas',
                            'Preparar pasta cicatrizante',
                            'Usar guantes de protección'
                        ],
                        herramientas: ['Tijeras de poda', 'Serrucho de poda', 'Alcohol 70%', 'Pasta cicatrizante', 'Guantes'],
                        precauciones: ['Mantener herramientas limpias para evitar enfermedades', 'Usar equipo de protección'],
                        tiempoEstimado: '10 minutos'
                    }
                ]
            }
        ];
    }
};

/**
 * Buscar procedimientos con filtros
 * @param {Object} filtros - Filtros de búsqueda (busqueda, categoria)
 * @returns {Promise<Array>} Procedimientos filtrados
 */
export const buscarProcedimientos = async (filtros) => {
    try {
        const params = new URLSearchParams();
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        
        const { data } = await api.get(`/procedimientos/buscar?${params.toString()}`);
        return data.procedimientos || data;
    } catch (error) {
        console.error('❌ Error en búsqueda de procedimientos:', error);
        // Fallback: filtrado local
        const todosLosProcedimientos = await obtenerProcedimientos();
        return todosLosProcedimientos.filter(proc => {
            const coincideBusqueda = !filtros.busqueda || 
                proc.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                proc.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
            
            const coincideCategoria = !filtros.categoria || proc.categoria === filtros.categoria;
            
            return coincideBusqueda && coincideCategoria;
        });
    }
};

/**
 * Obtener categorías de procedimientos
 * @returns {Promise<Array>} Lista de categorías
 */
export const obtenerCategoriasProcedimientos = async () => {
    try {
        const { data } = await api.get('/procedimientos/categorias');
        return data.categorias || data;
    } catch (error) {
        console.error('❌ Error al obtener categorías:', error);
        return [
            { id: 'mantenimiento', nombre: 'Mantenimiento', descripcion: 'Cuidado y mantenimiento' },
            { id: 'siembra', nombre: 'Siembra', descripcion: 'Técnicas de siembra' },
            { id: 'tratamientos', nombre: 'Tratamientos', descripcion: 'Aplicación de tratamientos' },
            { id: 'cosecha', nombre: 'Cosecha', descripcion: 'Procesos de cosecha' }
        ];
    }
};

/**
 * Marcar paso como completado
 * @param {number} procedimientoId - ID del procedimiento
 * @param {number} pasoIndex - Índice del paso
 * @param {boolean} completado - Estado de completitud
 * @returns {Promise<Object>} Resultado de la operación
 */
export const marcarPasoComoCompletado = async (procedimientoId, pasoIndex, completado) => {
    try {
        const { data } = await api.post(
            `/procedimientos/${procedimientoId}/pasos/${pasoIndex}/completar`,
            { completado }
        );
        return data;
    } catch (error) {
        console.error('❌ Error al marcar paso:', error);
        return { success: false };
    }
};

/**
 * Obtener progreso de procedimiento
 * @param {number} procedimientoId - ID del procedimiento
 * @returns {Promise<Object>} Progreso del procedimiento
 */
export const obtenerProgresProcedimiento = async (procedimientoId) => {
    try {
        const { data } = await api.get(`/procedimientos/${procedimientoId}/progreso`);
        return data.progreso || data;
    } catch (error) {
        console.error('❌ Error al obtener progreso:', error);
        return {
            pasosCompletados: [],
            pasoActual: 0,
            comentarios: {}
        };
    }
};

/**
 * Guardar comentario de procedimiento
 * @param {number} procedimientoId - ID del procedimiento
 * @param {number} pasoIndex - Índice del paso
 * @param {string} comentario - Comentario del usuario
 * @returns {Promise<Object>} Resultado de la operación
 */
export const guardarComentarioProcedimiento = async (procedimientoId, pasoIndex, comentario) => {
    try {
        const { data } = await api.post(
            `/procedimientos/${procedimientoId}/pasos/${pasoIndex}/comentario`,
            { comentario }
        );
        return data;
    } catch (error) {
        console.error('❌ Error al guardar comentario:', error);
        return { success: false };
    }
};

/**
 * Obtener procedimiento por ID
 * @param {number} procedimientoId - ID del procedimiento
 * @returns {Promise<Object>} Procedimiento encontrado
 */
export const obtenerProcedimientoPorId = async (procedimientoId) => {
    const { data } = await api.get(`/procedimientos/${procedimientoId}`);
        return data.procedimiento || data;
};

/**
 * Obtener estadísticas de procedimientos
 * @returns {Promise<Object>} Estadísticas de uso
 */
export const obtenerEstadisticasProcedimientos = async () => {
    try {
        const { data } = await api.get('/procedimientos/estadisticas');
        return data;
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        return {
            totalProcedimientos: 12,
            enProgreso: 3,
            completados: 8,
            masUsados: ['Poda de Formación', 'Aplicación de Fertilizante']
        };
    }
};

/**
 * Reiniciar progreso de procedimiento
 * @param {number} procedimientoId - ID del procedimiento
 * @returns {Promise<Object>} Resultado de la operación
 */
export const reiniciarProgresoProcedimiento = async (procedimientoId) => {
    try {
        const { data } = await api.post(`/procedimientos/${procedimientoId}/reiniciar`);
        return data;
    } catch (error) {
        console.error('❌ Error al reiniciar progreso:', error);
        return { success: false };
    }
};
