// ⚙️ configuracionAPI.js - Servicio para configuración del sistema
import { buildApiUrl } from '../config/app.config.js';
import { getAuthHeaders } from '../utils/auth.js';

// ⚙️ Obtener configuración del sistema
export const obtenerConfiguracionSistema = async () => {
    try {
        console.log('⚙️ Obteniendo configuración del sistema...');
        
        const response = await fetch(`buildApiUrl('/configuracion`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Configuración obtenida:', data);
        
        return data.configuracion;
        
    } catch (error) {
        console.error('❌ Error al obtener configuración:', error);
        throw error;
    }
};

// 💾 Actualizar configuración del sistema
export const actualizarConfiguracionSistema = async (configuracion) => {
    try {
        console.log('💾 Actualizando configuración del sistema:', configuracion);
        
        const response = await fetch(`buildApiUrl('/configuracion`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(configuracion)
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Configuración actualizada:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al actualizar configuración:', error);
        throw error;
    }
};

// 🔄 Reiniciar sistema
export const reiniciarSistema = async () => {
    try {
        console.log('🔄 Reiniciando sistema...');
        
        const response = await fetch(`buildApiUrl('/configuracion/reiniciar`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Sistema reiniciado:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al reiniciar sistema:', error);
        throw error;
    }
};

// 💾 Crear backup del sistema
export const crearBackupSistema = async () => {
    try {
        console.log('💾 Creando backup del sistema...');
        
        const response = await fetch(`buildApiUrl('/configuracion/backup`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Backup creado:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error al crear backup:', error);
        throw error;
    }
};

// 📋 Obtener logs recientes
export const obtenerLogsRecientes = async (limite = 50) => {
    try {
        console.log('📋 Obteniendo logs recientes...');
        
        const response = await fetch(`buildApiUrl('/configuracion/logs?limite=${limite}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Logs obtenidos:', data);
        return data.logs || [];
        
    } catch (error) {
        console.error('❌ Error al obtener logs:', error);
        // Retornar logs de ejemplo en caso de error
        return [
            {
                timestamp: new Date().toISOString(),
                level: 'info',
                message: 'Sistema iniciado correctamente'
            },
            {
                timestamp: new Date().toISOString(),
                level: 'error',
                message: 'Error de conexión simulado'
            },
            {
                timestamp: new Date().toISOString(),
                level: 'warn',
                message: 'Advertencia de ejemplo'
            }
        ];
    }
};

// 📊 Obtener información del sistema
export const obtenerInfoSistema = async () => {
    try {
        console.log('📊 Obteniendo información del sistema...');
        
        const response = await fetch(`buildApiUrl('/configuracion/info`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Información del sistema obtenida:', data);
        return data.info;
        
    } catch (error) {
        console.error('❌ Error al obtener información del sistema:', error);
        throw error;
    }
};

// 🧪 Probar conexión con el servidor de configuración
export const probarConexionConfiguracion = async () => {
    try {
        console.log('🧪 Probando conexión con configuración...');
        
        const response = await fetch(`buildApiUrl('/configuracion/test`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ Conexión exitosa:', data);
        return data;
        
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        throw error;
    }
};