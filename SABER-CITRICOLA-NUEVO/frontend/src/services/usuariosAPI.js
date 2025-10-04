const API_BASE_URL = 'http://localhost:5000/api';

// Obtener headers con autenticación
const getHeaders = () => {
    // Intentar obtener datos del usuario desde diferentes fuentes
    let userData = {};
    
    // Fuente 1: localStorage con key 'userData' (para SC-REACT-main)
    const userData1 = localStorage.getItem('userData');
    if (userData1) {
        try {
            userData = JSON.parse(userData1);
        } catch (e) {
            console.warn('Error al parsear userData:', e);
        }
    }
    
    // Fuente 2: localStorage con key 'user' (para SABER-CITRICOLA-NUEVO)
    const userData2 = localStorage.getItem('user');
    if (userData2 && !userData.rol) {
        try {
            const user2 = JSON.parse(userData2);
            userData = user2;
        } catch (e) {
            console.warn('Error al parsear user:', e);
        }
    }
    
    console.log('🔍 Datos del usuario para API:', userData);
    
    const headers = {
        'Content-Type': 'application/json',
        'userRole': userData.rol || userData.role || ''
    };
    
    console.log('📤 Headers enviados:', headers);
    
    return headers;
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
