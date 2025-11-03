import { buildApiUrl } from '../config/app.config.js';
/**
 * 👥 USUARIOS API - Servicio para gestión de usuarios
 * ====================================================
 * Todas las funciones de API relacionadas con usuarios.
 * Usa Axios (configurado en api.js) con autenticación automática.
 */

import api from './api.js';

/**
 * Obtener todos los usuarios del sistema
 * @returns {Promise<Array>} Lista de usuarios
 */
export const obtenerUsuarios = async () => {
    const { data } = await api.get('/usuarios');
    return data;
};

/**
 * Crear un nuevo usuario
 * @param {Object} datosUsuario - Datos del nuevo usuario
 * @returns {Promise<Object>} Usuario creado
 */
export const crearUsuario = async (datosUsuario) => {
    const { data } = await api.post('/usuarios', datosUsuario);
    return data;
};

/**
 * Actualizar un usuario existente
 * @param {number} id - ID del usuario
 * @param {Object} datosUsuario - Datos a actualizar
 * @returns {Promise<Object>} Usuario actualizado
 */
export const actualizarUsuario = async (id, datosUsuario) => {
    const { data } = await api.put(`/usuarios/${id}`, datosUsuario);
    return data;
};

/**
 * Eliminar un usuario
 * @param {number} id - ID del usuario a eliminar
 * @returns {Promise<Object>} Respuesta de confirmación
 */
export const eliminarUsuario = async (id) => {
    const { data } = await api.delete(`/usuarios/${id}`);
    return data;
};
