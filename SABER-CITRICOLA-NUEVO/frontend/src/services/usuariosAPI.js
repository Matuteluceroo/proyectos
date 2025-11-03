import { buildApiUrl } from '../config/app.config.js';
import { getAuthHeaders } from '../utils/auth.js';

// Obtener todos los usuarios
export const obtenerUsuarios = async () => {
    const response = await fetch(buildApiUrl('/usuarios'), {
        method: 'GET',
        headers: getAuthHeaders(),
        credentials: 'include' // 🍪 Incluir cookies para autenticación
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener usuarios');
    }
    
    return await response.json();
};

// Crear nuevo usuario
export const crearUsuario = async (datosUsuario) => {
    const response = await fetch(buildApiUrl('/usuarios'), {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include', // 🍪 Incluir cookies para autenticación
        body: JSON.stringify(datosUsuario)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear usuario');
    }
    
    return await response.json();
};

// Actualizar usuario
export const actualizarUsuario = async (id, datosUsuario) => {
    const response = await fetch(buildApiUrl(`/usuarios/${id}`), {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include', // 🍪 Incluir cookies para autenticación
        body: JSON.stringify(datosUsuario)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar usuario');
    }
    
    return await response.json();
};

// Eliminar usuario
export const eliminarUsuario = async (id) => {
    const response = await fetch(buildApiUrl(`/usuarios/${id}`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include' // 🍪 Incluir cookies para autenticación
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
    }
    
    return await response.json();
};
