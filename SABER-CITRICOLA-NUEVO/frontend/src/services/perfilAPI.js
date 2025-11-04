import { buildApiUrl } from '../config/app.config.js';
/**
 * 👤 PERFIL API - Servicio para gestión de perfil de usuario
 * ===========================================================
 * Funciones de API para perfil y preferencias del usuario.
 * Usa Axios (configurado en api.js) con autenticación automática.
 */

import api from './api.js';

/**
 * Obtener perfil del usuario actual
 * @param {number} id - ID del usuario
 * @returns {Promise<Object>} Datos del perfil
 */
export const obtenerPerfil = async (id) => {
    const { data } = await api.get(`/usuarios/${id}/perfil`);
    return data.perfil || data.data || data;
};

/**
 * Actualizar perfil del usuario
 * @param {number} id - ID del usuario
 * @param {Object} perfilData - Datos a actualizar
 * @returns {Promise<Object>} Perfil actualizado
 */
export const actualizarPerfil = async (id, perfilData) => {
    const { data } = await api.put(`/usuarios/${id}/perfil`, perfilData);
    return data;
};

/**
 * Cambiar contraseña
 * @param {number} id - ID del usuario
 * @param {Object} passwords - Contraseña actual y nueva
 * @returns {Promise<Object>} Resultado del cambio
 */
export const cambiarContrasena = async (id, passwords) => {
    const { data } = await api.post(`/usuarios/${id}/cambiar-password`, passwords);
    return data;
};

/**
 * Actualizar foto de perfil
 * @param {number} id - ID del usuario
 * @param {FormData} formData - Archivo de imagen
 * @returns {Promise<Object>} URL de la foto
 */
export const actualizarFotoPerfil = async (id, formData) => {
    const { data } = await api.post(`/usuarios/${id}/foto`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return data;
};

/**
 * Obtener preferencias del usuario
 * @param {number} id - ID del usuario
 * @returns {Promise<Object>} Preferencias
 */
export const obtenerPreferencias = async (id) => {
    const { data } = await api.get(`/usuarios/${id}/preferencias`);
    return data.preferencias || data.data || data;
};

/**
 * Actualizar preferencias del usuario
 * @param {number} id - ID del usuario
 * @param {Object} preferencias - Nuevas preferencias
 * @returns {Promise<Object>} Preferencias actualizadas
 */
export const actualizarPreferencias = async (id, preferencias) => {
    const { data } = await api.put(`/usuarios/${id}/preferencias`, preferencias);
    return data;
};

/**
 * Obtener actividad reciente del usuario
 * @param {number} id - ID del usuario
 * @param {number} limite - Límite de resultados
 * @returns {Promise<Array>} Lista de actividades
 */
export const obtenerActividadReciente = async (id, limite = 10) => {
    const { data } = await api.get(`/usuarios/${id}/actividad?limite=${limite}`);
    return data.actividades || data.data || data;
};

