// ⚙️ configuracion.js - Controlador para configuración del sistema
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ruta del archivo de configuración
const configPath = path.join(__dirname, '..', 'config', 'sistema.json');
const logsPath = path.join(__dirname, '..', 'logs');
const backupPath = path.join(__dirname, '..', 'backups');

// Configuración por defecto
const defaultConfig = {
  general: {
    nombreSistema: 'Saber Citrícola',
    descripcionSistema: 'Sistema de Gestión del Conocimiento Citrícola',
    version: '2.0.0',
    idioma: 'es',
    timezone: 'America/Argentina/Buenos_Aires'
  },
  seguridad: {
    sessionTimeout: 30,
    passwordMinLength: 6,
    loginAttempts: 3,
    requirePasswordChange: false,
    enableTwoFactor: false
  },
  usuario: {
    maxFileSize: 10,
    allowedFileTypes: '.pdf,.doc,.docx,.txt,.jpg,.png,.mp4,.avi',
    defaultUserRole: 'operador',
    autoApproveUsers: false,
    enableUserRegistration: true
  },
  sistema: {
    backupInterval: 24,
    logLevel: 'info',
    enableDebugMode: false,
    maxLogFileSize: 100,
    autoCleanupDays: 30
  }
};

// Asegurar que existan los directorios necesarios
const ensureDirectories = async () => {
  const configDir = path.dirname(configPath);
  
  try {
    await fs.mkdir(configDir, { recursive: true });
    await fs.mkdir(logsPath, { recursive: true });
    await fs.mkdir(backupPath, { recursive: true });
  } catch (error) {
    console.log('Directorios ya existen o error al crearlos:', error.message);
  }
};

// 📋 Obtener configuración del sistema
export const obtenerConfiguracionSistema = async (req, res) => {
  try {
    console.log('⚙️ Obteniendo configuración del sistema...');
    
    await ensureDirectories();
    
    let configuracion = { ...defaultConfig };
    
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      const configFromFile = JSON.parse(configData);
      
      // Merge con configuración por defecto para asegurar que todas las propiedades existen
      configuracion = {
        general: { ...defaultConfig.general, ...(configFromFile.general || {}) },
        seguridad: { ...defaultConfig.seguridad, ...(configFromFile.seguridad || {}) },
        usuario: { ...defaultConfig.usuario, ...(configFromFile.usuario || {}) },
        sistema: { ...defaultConfig.sistema, ...(configFromFile.sistema || {}) }
      };
    } catch (error) {
      console.log('📄 Usando configuración por defecto (archivo no encontrado)');
      // Crear archivo de configuración con valores por defecto
      await fs.writeFile(configPath, JSON.stringify(configuracion, null, 2));
    }
    
    res.json({
      success: true,
      configuracion: configuracion,
      mensaje: 'Configuración obtenida exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración',
      mensaje: error.message
    });
  }
};

// 💾 Actualizar configuración del sistema
export const actualizarConfiguracionSistema = async (req, res) => {
  try {
    console.log('💾 Actualizando configuración del sistema...');
    
    const nuevaConfiguracion = req.body;
    
    // Validar que la configuración tenga la estructura correcta
    if (!nuevaConfiguracion.general || !nuevaConfiguracion.seguridad || 
        !nuevaConfiguracion.usuario || !nuevaConfiguracion.sistema) {
      return res.status(400).json({
        success: false,
        error: 'Estructura de configuración inválida'
      });
    }
    
    await ensureDirectories();
    
    // Crear backup de la configuración actual antes de actualizar
    try {
      const configActual = await fs.readFile(configPath, 'utf8');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupConfigPath = path.join(backupPath, `config-backup-${timestamp}.json`);
      await fs.writeFile(backupConfigPath, configActual);
    } catch (error) {
      console.log('No se pudo crear backup de configuración:', error.message);
    }
    
    // Guardar nueva configuración
    await fs.writeFile(configPath, JSON.stringify(nuevaConfiguracion, null, 2));
    
    // Log de la acción
    await agregarLog('info', `Configuración actualizada por usuario ${req.headers['x-user-name'] || 'Desconocido'}`);
    
    res.json({
      success: true,
      mensaje: 'Configuración actualizada exitosamente'
    });
    
  } catch (error) {
    console.error('❌ Error al actualizar configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar configuración',
      mensaje: error.message
    });
  }
};

// 🔄 Reiniciar sistema
export const reiniciarSistema = async (req, res) => {
  try {
    console.log('🔄 Solicitud de reinicio del sistema...');
    
    await agregarLog('warn', `Sistema reiniciado por usuario ${req.headers['x-user-name'] || 'Desconocido'}`);
    
    res.json({
      success: true,
      mensaje: 'Solicitud de reinicio procesada. El sistema se reiniciará en 5 segundos.'
    });
    
    // Reiniciar después de enviar la respuesta
    setTimeout(() => {
      console.log('🔄 Reiniciando servidor...');
      process.exit(0);
    }, 5000);
    
  } catch (error) {
    console.error('❌ Error al reiniciar sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Error al reiniciar sistema',
      mensaje: error.message
    });
  }
};

// 💾 Crear backup del sistema
export const crearBackupSistema = async (req, res) => {
  try {
    console.log('💾 Creando backup del sistema...');
    
    await ensureDirectories();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupData = {
      timestamp: timestamp,
      version: '2.0.0',
      configuracion: null,
      estadisticas: {
        fecha_creacion: new Date().toISOString(),
        usuario_creacion: req.headers['x-user-name'] || 'Desconocido'
      }
    };
    
    // Incluir configuración actual
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      backupData.configuracion = JSON.parse(configData);
    } catch (error) {
      console.log('No se pudo incluir configuración en el backup');
      backupData.configuracion = defaultConfig;
    }
    
    const backupFilename = `sistema-backup-${timestamp}.json`;
    const backupFilePath = path.join(backupPath, backupFilename);
    
    await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2));
    
    await agregarLog('info', `Backup creado: ${backupFilename} por usuario ${req.headers['x-user-name'] || 'Desconocido'}`);
    
    res.json({
      success: true,
      mensaje: 'Backup creado exitosamente',
      filename: backupFilename,
      size: JSON.stringify(backupData).length
    });
    
  } catch (error) {
    console.error('❌ Error al crear backup:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear backup',
      mensaje: error.message
    });
  }
};

// 📋 Obtener logs recientes
export const obtenerLogsRecientes = async (req, res) => {
  try {
    console.log('📋 Obteniendo logs recientes...');
    
    const limite = parseInt(req.query.limite) || 50;
    
    await ensureDirectories();
    
    // Archivo de logs
    const logFile = path.join(logsPath, 'sistema.log');
    
    let logs = [];
    
    try {
      const logData = await fs.readFile(logFile, 'utf8');
      const lineas = logData.trim().split('\n').filter(linea => linea.trim());
      
      // Tomar las últimas líneas
      const ultimasLineas = lineas.slice(-limite);
      
      logs = ultimasLineas.map(linea => {
        try {
          return JSON.parse(linea);
        } catch {
          // Si no es JSON, crear un objeto log básico
          return {
            timestamp: new Date().toISOString(),
            level: 'info',
            message: linea
          };
        }
      });
      
    } catch (error) {
      console.log('Archivo de logs no encontrado, creando logs de ejemplo');
      logs = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Sistema iniciado correctamente'
        },
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'Base de datos conectada'
        }
      ];
    }
    
    res.json({
      success: true,
      logs: logs.reverse(), // Más recientes primero
      total: logs.length
    });
    
  } catch (error) {
    console.error('❌ Error al obtener logs:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener logs',
      mensaje: error.message
    });
  }
};

// 📝 Función auxiliar para agregar logs
const agregarLog = async (level, message) => {
  try {
    await ensureDirectories();
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level,
      message: message
    };
    
    const logFile = path.join(logsPath, 'sistema.log');
    const logLine = JSON.stringify(logEntry) + '\n';
    
    await fs.appendFile(logFile, logLine);
  } catch (error) {
    console.error('Error al escribir log:', error);
  }
};

// 📊 Obtener información del sistema
export const obtenerInfoSistema = async (req, res) => {
  try {
    const info = {
      version: '2.0.0',
      uptime: process.uptime(),
      memoria: process.memoryUsage(),
      pid: process.pid,
      plataforma: process.platform,
      nodeVersion: process.version,
      timestamp: new Date().toISOString()
    };
    
    res.json({
      success: true,
      info: info
    });
    
  } catch (error) {
    console.error('❌ Error al obtener info del sistema:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener información del sistema',
      mensaje: error.message
    });
  }
};