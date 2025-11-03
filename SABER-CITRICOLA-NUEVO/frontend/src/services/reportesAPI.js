import { buildApiUrl } from '../config/app.config.js';
/**
 * 📊 REPORTES API - Servicio para reportes y estadísticas del sistema
 * =====================================================================
 * Todas las funciones de API relacionadas con reportes.
 * Usa Axios (configurado en api.js) con autenticación automática.
 */

import api from './api.js';

/**
 * Obtener reporte completo del sistema
 * @returns {Promise<Object>} Reporte con todas las estadísticas
 */
export const obtenerReportesCompletos = async () => {
    const { data } = await api.get('/reportes');
    return data;
};

/**
 * Exportar reporte en formato específico
 * @param {string} tipo - Tipo de reporte ('usuarios', 'documentos', 'actividad')
 * @param {string} formato - Formato de exportación ('json', 'csv', 'pdf')
 * @returns {Promise<Blob|Object>} Datos del reporte
 */
export const exportarReporte = async (tipo, formato = 'json') => {
    const { data } = await api.post(
        `/reportes/exportar/${tipo}`,
        { formato },
        { responseType: formato === 'json' ? 'json' : 'blob' }
    );
      return data;
};

/**
 * Obtener métricas en tiempo real
 * @returns {Promise<Object>} Métricas actuales del sistema
 */
export const obtenerMetricasEnTiempoReal = async () => {
    const { data } = await api.get('/reportes/metricas-tiempo-real');
    return data;
};

/**
 * Obtener reportes filtrados
 * @param {Object} filtros - Filtros de búsqueda (fechaInicio, fechaFin, tipo)
 * @returns {Promise<Object>} Reportes filtrados
 */
export const obtenerReportesFiltrados = async (filtros) => {
    const params = new URLSearchParams();
    if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio);
    if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin);
    if (filtros.tipo) params.append('tipo', filtros.tipo);
    
    const { data } = await api.get(`/reportes/filtrados?${params.toString()}`);
    return data;
};
