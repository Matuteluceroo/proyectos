const API_BASE_URL = 'http://localhost:5000/api';

// Obtener headers con autenticación
const getHeaders = () => {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    return {
        'Content-Type': 'application/json',
        'userRole': userData.rol || ''
    };
};

// Obtener todos los usuarios
export const obtenerUsuarios = async () => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'GET',
        headers: getHeaders()
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al obtener usuarios');
    }
    
    return await response.json();
};

// Crear nuevo usuario
export const crearUsuario = async (datosUsuario) => {
    const response = await fetch(`${API_BASE_URL}/usuarios`, {
        method: 'POST',
        headers: getHeaders(),
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
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
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
    const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al eliminar usuario');
    }
    
    return await response.json();
};
