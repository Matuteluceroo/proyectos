import { buildApiUrl } from '../config/app.config.js';
/**
 * ⚡ GUÍAS RÁPIDAS API - Servicio para guías de referencia rápida
 * ================================================================
 * Todas las funciones de API relacionadas con guías rápidas.
 * Usa Axios (configurado en api.js) con autenticación automática.
 */

import api from './api.js';

/**
 * Obtener todas las guías rápidas
 * @returns {Promise<Array>} Lista de guías rápidas
 */
export const obtenerGuiasRapidas = async () => {
    try {
        const { data } = await api.get('/guias-rapidas');
        return data.guias || data;
    } catch (error) {
        console.error('❌ Error al obtener guías rápidas:', error);
        // Retornar datos de ejemplo en caso de error
        return [
            {
                id: 1,
                titulo: 'Identificación Rápida de Plagas',
                descripcion: 'Guía visual para identificar las plagas más comunes en cítricos',
                categoria: 'plagas',
                icono: '🐛',
                prioridad: 'alta',
                tiempoLectura: 3,
                vistas: 245,
                contenido: [
                    {
                        titulo: 'Signos Visuales',
                        texto: 'Busca hojas amarillentas, manchas oscuras o deformaciones en las hojas.'
                    }
                ]
            }
        ];
    }
};

/**
 * Buscar guías rápidas con filtros
 * @param {Object} filtros - Filtros de búsqueda (busqueda, categoria)
 * @returns {Promise<Array>} Guías filtradas
 */
export const buscarGuiasRapidas = async (filtros) => {
    try {
        const params = new URLSearchParams();
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        
        const { data } = await api.get(`/guias-rapidas/buscar?${params.toString()}`);
        return data.guias || data;
    } catch (error) {
        console.error('❌ Error en búsqueda de guías:', error);
        // Fallback: filtrado local
        const todasLasGuias = await obtenerGuiasRapidas();
        return todasLasGuias.filter(guia => {
            const coincideBusqueda = !filtros.busqueda || 
                guia.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
                guia.descripcion.toLowerCase().includes(filtros.busqueda.toLowerCase());
            
            const coincideCategoria = !filtros.categoria || guia.categoria === filtros.categoria;
            
            return coincideBusqueda && coincideCategoria;
        });
    }
};

/**
 * Obtener categorías de guías
 * @returns {Promise<Array>} Lista de categorías
 */
export const obtenerCategoriasGuias = async () => {
    try {
        const { data } = await api.get('/guias-rapidas/categorias');
        return data.categorias || data;
    } catch (error) {
        console.error('❌ Error al obtener categorías:', error);
        return [
            { id: 'cultivo', nombre: 'Cultivo', descripcion: 'Técnicas de cultivo' },
            { id: 'plagas', nombre: 'Plagas', descripcion: 'Control de plagas' },
            { id: 'riego', nombre: 'Riego', descripcion: 'Sistemas de riego' },
            { id: 'fertilizacion', nombre: 'Fertilización', descripcion: 'Nutrición de plantas' }
        ];
    }
};

/**
 * Marcar guía como consultada
 * @param {number} guiaId - ID de la guía
 * @returns {Promise<Object>} Resultado de la operación
 */
export const marcarGuiaComoConsultada = async (guiaId) => {
    try {
        const { data } = await api.post(`/guias-rapidas/${guiaId}/consultar`);
        return data;
    } catch (error) {
        console.error('❌ Error al marcar guía como consultada:', error);
        return { success: false };
    }
};

/**
 * Marcar guía como favorita
 * @param {number} guiaId - ID de la guía
 * @returns {Promise<Object>} Resultado de la operación
 */
export const marcarGuiaComoFavorita = async (guiaId) => {
    try {
        const { data } = await api.post(`/guias-rapidas/${guiaId}/favorita`);
        return data;
    } catch (error) {
        console.error('❌ Error al marcar guía como favorita:', error);
        return { success: false };
    }
};

/**
 * Obtener estadísticas de uso de guías
 * @returns {Promise<Object>} Estadísticas de guías
 */
export const obtenerEstadisticasGuias = async () => {
    try {
        const { data } = await api.get('/guias-rapidas/estadisticas');
        return data;
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        return {
            totalGuias: 15,
            masConsultadas: ['Identificación de Plagas', 'Dosificación de Riego'],
            categoriaPopular: 'Plagas'
        };
    }
};
