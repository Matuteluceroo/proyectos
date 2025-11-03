// 📚 gestionContenidoAPI.js - Servicio para gestionar categorías y documentos
import { buildApiUrl } from '../config/app.config.js';
import { getAuthHeaders } from '../utils/auth.js';

// 📁 GESTIÓN DE CATEGORÍAS

// Obtener todas las categorías
export const obtenerCategorias = async () => {
    try {
        console.log('📁 Obteniendo categorías...');
        
        const response = await fetch(`buildApiUrl('/contenido/categorias`, {
            method: 'GET',
            headers: getAuthHeaders()
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
        
        const response = await fetch(`buildApiUrl('/contenido/categorias`, {
            method: 'POST',
            headers: getAuthHeaders(),
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
        
        const response = await fetch(`buildApiUrl('/contenido/categorias/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
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
        
        const response = await fetch(`buildApiUrl('/contenido/categorias/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
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
        
        const url = `buildApiUrl('/contenido/documentos${params.toString() ? '?' + params.toString() : ''}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
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
        
        const response = await fetch(`buildApiUrl('/contenido/documentos/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
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
        
        const response = await fetch(`buildApiUrl('/contenido/documentos/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
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
        
        const response = await fetch(`buildApiUrl('/contenido/documentos/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
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
        
        const response = await fetch(`buildApiUrl('/contenido/documentos/${id}/estado`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
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
        
        const response = await fetch(`buildApiUrl('/contenido/estadisticas`, {
            method: 'GET',
            headers: getAuthHeaders()
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
        
        const response = await fetch(`buildApiUrl('/contenido/documentos/recientes?limite=${limite}`, {
            method: 'GET',
            headers: getAuthHeaders()
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