/**
 * 🔐 AUTH.JS - Utilidades de autenticación
 * ==========================================
 * Funciones centralizadas para manejo de headers de autenticación
 * en todas las llamadas API del frontend.
 * 
 * @module utils/auth
 */

/**
 * Obtiene los headers de autenticación para las peticiones HTTP.
 * Busca datos del usuario en diferentes ubicaciones de localStorage
 * para mantener compatibilidad con diferentes versiones de la app.
 * 
 * @returns {Object} Objeto con headers de autenticación
 * @example
 * const headers = getAuthHeaders();
 * fetch('/api/endpoint', { headers });
 */
export const getAuthHeaders = () => {
    let userData = null;
    
    // Intentar obtener de 'userData' primero (para SC-REACT-main)
    try {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            userData = JSON.parse(userDataString);
        }
    } catch (error) {
        console.log('No hay userData en localStorage');
    }
    
    // Si no se encuentra, intentar con 'user' (para SABER-CITRICOLA-NUEVO)
    if (!userData) {
        try {
            const userString = localStorage.getItem('user');
            if (userString) {
                userData = JSON.parse(userString);
            }
        } catch (error) {
            console.log('No hay user en localStorage');
        }
    }
    
    // Construir headers base
    const headers = {
        'Content-Type': 'application/json',
    };
    
    // Agregar token de autorización si existe
    if (userData?.token) {
        headers['Authorization'] = `Bearer ${userData.token}`;
    }
    
    // Agregar headers de usuario
    if (userData) {
        headers['X-User-Name'] = userData.nombre_completo || userData.username || userData.nombre;
        headers['X-User-Role'] = userData.rol || userData.role;
        
        // También agregar userRole para compatibilidad con algunas rutas
        if (userData.rol || userData.role) {
            headers['userRole'] = userData.rol || userData.role;
        }
    } else {
        // Fallback: buscar datos individuales en localStorage
        const nombre = localStorage.getItem('userName');
        const rol = localStorage.getItem('userRole');
        if (nombre && rol) {
            headers['X-User-Name'] = nombre;
            headers['X-User-Role'] = rol;
            headers['userRole'] = rol;
        }
    }
    
    return headers;
};

/**
 * Obtiene el usuario actual del localStorage.
 * 
 * @returns {Object|null} Objeto con datos del usuario o null si no existe
 */
export const getCurrentUser = () => {
    try {
        const userDataString = localStorage.getItem('userData') || localStorage.getItem('user');
        if (userDataString) {
            return JSON.parse(userDataString);
        }
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
    }
    return null;
};

/**
 * Verifica si hay un usuario autenticado.
 * 
 * @returns {boolean} true si hay usuario autenticado, false en caso contrario
 */
export const isAuthenticated = () => {
    const user = getCurrentUser();
    return user !== null && (user.token || user.id);
};

/**
 * Obtiene el rol del usuario actual.
 * 
 * @returns {string|null} Rol del usuario o null si no existe
 */
export const getUserRole = () => {
    const user = getCurrentUser();
    return user?.rol || user?.role || localStorage.getItem('userRole');
};

/**
 * Limpia los datos de autenticación del localStorage.
 * Útil para logout.
 */
export const clearAuthData = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
};

