// 📚 gestionContenidoAPI.js - Servicio para gestionar categorías y documentos
const API_URL = 'http://localhost:5000';

// 🔐 Función auxiliar para obtener headers con autenticación
const getHeaders = () => {
    // Buscar datos de usuario en diferentes ubicaciones del localStorage
    let userData = null;
    
    // Intentar obtener de 'userData' primero
    try {
        userData = JSON.parse(localStorage.getItem('userData'));
    } catch (error) {
        console.log('No hay userData en localStorage');
    }
    
    // Si no se encuentra, intentar con 'user'
    if (!userData) {
        try {
            userData = JSON.parse(localStorage.getItem('user'));
        } catch (error) {
            console.log('No hay user en localStorage');
        }
    }
    
    const headers = {
        'Content-Type': 'application/json',
    };
    
    // Agregar token si existe
    if (userData && userData.token) {
        headers['Authorization'] = `Bearer ${userData.token}`;
    }
    
    // Buscar datos individuales si no hay objeto completo
    if (!userData) {
        const nombre = localStorage.getItem('userName');
        const rol = localStorage.getItem('userRole');
        if (nombre && rol) {
            headers['X-User-Name'] = nombre;
            headers['X-User-Role'] = rol;
        }
    }
    
    return headers;
};

// 📁 GESTIÓN DE CATEGORÍAS

// Obtener todas las categorías
export const obtenerCategorias = async () => {
    try {
        console.log('📁 Obteniendo categorías...');
        
        const response = await fetch(`${API_URL}/api/categorias`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Categorías obtenidas:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al obtener categorías:', error);
        throw error;
    }
};

// Crear nueva categoría
export const crearCategoria = async (categoria) => {
    try {
        console.log('➕ Creando categoría:', categoria);
        
        const response = await fetch(`${API_URL}/api/categorias`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(categoria)
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Categoría creada:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al crear categoría:', error);
        throw error;
    }
};

// Actualizar categoría
export const actualizarCategoria = async (id, categoria) => {
    try {
        console.log('✏️ Actualizando categoría:', id, categoria);
        
        const response = await fetch(`${API_URL}/api/categorias/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(categoria)
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Categoría actualizada:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al actualizar categoría:', error);
        throw error;
    }
};

// Eliminar categoría
export const eliminarCategoria = async (id) => {
    try {
        console.log('🗑️ Eliminando categoría:', id);
        
        const response = await fetch(`${API_URL}/api/categorias/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ Categoría eliminada exitosamente');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error al eliminar categoría:', error);
        throw error;
    }
};

// 📄 GESTIÓN DE DOCUMENTOS

// Obtener todos los documentos con filtros
export const obtenerDocumentos = async (filtros = {}) => {
    try {
        console.log('📄 Obteniendo documentos con filtros:', filtros);
        
        const params = new URLSearchParams();
        if (filtros.categoria) params.append('categoria', filtros.categoria);
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        if (filtros.estado) params.append('estado', filtros.estado);
        
        const url = `${API_URL}/api/documentos${params.toString() ? '?' + params.toString() : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Documentos obtenidos:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al obtener documentos:', error);
        throw error;
    }
};

// Obtener documento por ID
export const obtenerDocumentoPorId = async (id) => {
    try {
        console.log('📄 Obteniendo documento:', id);
        
        const response = await fetch(`${API_URL}/api/documentos/${id}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Documento obtenido:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al obtener documento:', error);
        throw error;
    }
};

// Actualizar documento
export const actualizarDocumento = async (id, documento) => {
    try {
        console.log('✏️ Actualizando documento:', id, documento);
        
        const response = await fetch(`${API_URL}/api/documentos/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(documento)
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Documento actualizado:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al actualizar documento:', error);
        throw error;
    }
};

// Eliminar documento
export const eliminarDocumento = async (id) => {
    try {
        console.log('🗑️ Eliminando documento:', id);
        
        const response = await fetch(`${API_URL}/api/documentos/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        console.log('✅ Documento eliminado exitosamente');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Error al eliminar documento:', error);
        throw error;
    }
};

// Cambiar estado de documento (activo/borrador)
export const cambiarEstadoDocumento = async (id, estado) => {
    try {
        console.log('🔄 Cambiando estado de documento:', id, estado);
        
        const response = await fetch(`${API_URL}/api/documentos/${id}/estado`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ estado })
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Estado de documento cambiado:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al cambiar estado de documento:', error);
        throw error;
    }
};

// 📊 ESTADÍSTICAS Y MÉTRICAS

// Obtener estadísticas de contenido
export const obtenerEstadisticasContenido = async () => {
    try {
        console.log('📊 Obteniendo estadísticas de contenido...');
        
        const response = await fetch(`${API_URL}/api/contenido/estadisticas`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Estadísticas obtenidas:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al obtener estadísticas:', error);
        throw error;
    }
};

// Obtener documentos recientes
export const obtenerDocumentosRecientes = async (limite = 10) => {
    try {
        console.log('📄 Obteniendo documentos recientes...');
        
        const response = await fetch(`${API_URL}/api/documentos/recientes?limite=${limite}`, {
            method: 'GET',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Documentos recientes obtenidos:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al obtener documentos recientes:', error);
        throw error;
    }
};