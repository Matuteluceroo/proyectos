/**
 * 📊 MÉTRICAS API - Servicio para métricas del sistema
 * ======================================================
 * Todas las funciones de API relacionadas con métricas y estadísticas generales.
 */

import api from './api.js';

/**
 * Obtener métricas generales del sistema
 * @returns {Promise<Object>} Métricas del sistema (usuarios, documentos, etc.)
 */
export const obtenerMetricasGenerales = async () => {
  const { data } = await api.get('/metricas');
  return data;
};

/**
 * Obtener métricas de usuarios por rol
 * @returns {Promise<Object>} Distribución de usuarios por rol
 */
export const obtenerMetricasUsuarios = async () => {
  const { data } = await api.get('/metricas/usuarios');
  return data;
};

/**
 * Obtener actividad reciente del sistema
 * @param {number} limite - Cantidad de registros a retornar
 * @returns {Promise<Array>} Lista de actividades recientes
 */
export const obtenerActividadReciente = async (limite = 10) => {
  const { data } = await api.get(`/metricas/actividad?limite=${limite}`);
  return data;
};

/**
 * Obtener métricas de contenido
 * @returns {Promise<Object>} Estadísticas de documentos y categorías
 */
export const obtenerMetricasContenido = async () => {
  const { data } = await api.get('/metricas/contenido');
  return data;
};

