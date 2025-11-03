import { buildApiUrl } from '../config/app.config.js';
/**
 * ⚙️ CONFIGURACIÓN API - Servicio para configuración del sistema
 * ================================================================
 * Todas las funciones de API relacionadas con configuración.
 * Usa Axios (configurado en api.js) con autenticación automática.
 */

import api from './api.js';
    
/**
 * Obtener configuración del sistema
 * @returns {Promise<Object>} Configuración actual
 */
export const obtenerConfiguracionSistema = async () => {
    const { data } = await api.get('/configuracion');
    return data;
};

/**
 * Actualizar configuración del sistema
 * @param {Object} configuracion - Nueva configuración
 * @returns {Promise<Object>} Configuración actualizada
 */
export const actualizarConfiguracionSistema = async (configuracion) => {
    const { data } = await api.put('/configuracion', configuracion);
        return data;
};

/**
 * Reiniciar el sistema
 * @returns {Promise<Object>} Resultado de la operación
 */
export const reiniciarSistema = async () => {
    const { data } = await api.post('/configuracion/reiniciar');
        return data;
};

/**
 * Crear backup del sistema
 * @returns {Promise<Object>} Información del backup creado
 */
export const crearBackupSistema = async () => {
    const { data } = await api.post('/configuracion/backup');
        return data;
};

/**
 * Obtener logs recientes del sistema
 * @param {number} limite - Número de logs a retornar
 * @returns {Promise<Array>} Lista de logs
 */
export const obtenerLogsRecientes = async (limite = 50) => {
    const { data } = await api.get(`/configuracion/logs?limite=${limite}`);
    return data;
};

/**
 * Obtener información del sistema
 * @returns {Promise<Object>} Información de versión, recursos, etc.
 */
export const obtenerInfoSistema = async () => {
    const { data } = await api.get('/configuracion/info-sistema');
    return data;
};

/**
 * Probar conexión con configuración
 * @returns {Promise<Object>} Resultado de la prueba de conexión
 */
export const probarConexionConfiguracion = async () => {
    const { data } = await api.get('/configuracion/probar-conexion');
        return data;
};
        