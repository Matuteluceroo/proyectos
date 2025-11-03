// 🗄️ database-citricola.js - Base de datos completa para Saber Citrícola
// ⚠️ NOTA: Este archivo será dividido en módulos más pequeños
// La conexión a la BD ahora está en config/database.js
// Las definiciones de tablas ahora están en models/schemas.js
// Las funciones de usuarios ahora están en models/User.js
// Las funciones de documentos/categorías ahora están en models/Document.js
// Las funciones de búsqueda ahora están en services/SearchService.js

import db from './config/database.js';
import { initializeDatabase } from './models/schemas.js';
import { 
  obtenerUsuarioConRol,
  obtenerTodosUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  verificarUsuarioExiste
} from './models/User.js';
import {
  obtenerCategorias,
  obtenerDocumentos
} from './models/Document.js';
import {
  buscarContenido,
  buscarContenidoAsync
} from './services/SearchService.js';

// 🔍 Funciones de consulta

// ============================================================================
// HELPERS: Promisify database functions para usar async/await
// ============================================================================

/**
 * Ejecutar query que retorna un solo resultado (promisified)
 * @param {string} query - Query SQL
 * @param {Array} params - Parámetros del query
 * @returns {Promise<Object>} Resultado del query
 */
const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Ejecutar query que retorna múltiples resultados (promisified)
 * @param {string} query - Query SQL
 * @param {Array} params - Parámetros del query
 * @returns {Promise<Array>} Array de resultados
 */
const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

// ============================================================================
// SUBFUNCIONES: Cada una hace UNA cosa específica
// ============================================================================

/**
 * Contar registros en una tabla
 * @param {string} tabla - Nombre de la tabla
 * @returns {Promise<number>} Cantidad de registros
 */
const contarTabla = async (tabla) => {
  const resultado = await dbGet(`SELECT COUNT(*) as total FROM ${tabla}`);
  return resultado.total;
};

/**
 * Verificar si una tabla existe en la BD
 * @param {string} nombreTabla - Nombre de la tabla
 * @returns {Promise<boolean>} true si existe, false si no
 */
const tablaExiste = async (nombreTabla) => {
  const resultado = await dbGet(
    "SELECT COUNT(*) as total FROM sqlite_master WHERE type='table' AND name=?",
    [nombreTabla]
  );
  return resultado.total > 0;
};

/**
 * Obtener distribución de usuarios por rol
 * @returns {Promise<Object>} Objeto con conteos por rol
 */
const obtenerDistribucionRoles = async () => {
  const resultado = await dbGet(`
    SELECT 
      COUNT(CASE WHEN rol = 'administrador' THEN 1 END) as administradores,
      COUNT(CASE WHEN rol = 'experto' THEN 1 END) as expertos,
      COUNT(CASE WHEN rol = 'operador' THEN 1 END) as operadores
    FROM usuarios
  `);
  
  return {
    administradores: resultado.administradores,
    expertos: resultado.expertos,
    operadores: resultado.operadores
  };
};

/**
 * Obtener actividad reciente del sistema
 * @param {number} limite - Cantidad de registros a retornar
 * @returns {Promise<Array>} Array de actividades
 */
const obtenerActividadReciente = async (limite = 5) => {
  return await dbAll(`
    SELECT 
      'usuario' as tipo,
      'Nuevo usuario registrado: ' || nombre_completo as descripcion,
      created_at as fecha
    FROM usuarios 
    ORDER BY created_at DESC 
    LIMIT ?
  `, [limite]);
};

// ============================================================================
// FUNCIÓN PRINCIPAL REFACTORIZADA: obtenerMetricasAsync
// ============================================================================

/**
 * Obtener todas las métricas del sistema (versión async/await)
 * @returns {Promise<Object>} Objeto con todas las métricas
 */
const obtenerMetricasAsync = async () => {
  try {
    // Paso 1: Ejecutar consultas INDEPENDIENTES en PARALELO
    // Esto es 3-4x más rápido que secuencial!
    const [
      usuarios,
      documentos,
      categorias,
      existeCapacitaciones
    ] = await Promise.all([
      contarTabla('usuarios'),
      contarTabla('documentos'),
      contarTabla('categorias'),
      tablaExiste('capacitaciones')
    ]);
    
    // Paso 2: Contar capacitaciones si la tabla existe
    const capacitaciones = existeCapacitaciones 
      ? await contarTabla('capacitaciones')
      : 0;
    
    // Paso 3: Obtener datos adicionales en PARALELO
    const [
      usuariosPorRol,
      actividadReciente
    ] = await Promise.all([
      obtenerDistribucionRoles(),
      obtenerActividadReciente(5)
    ]);
    
    // Paso 4: Construir y retornar objeto de métricas
    return {
      usuarios,
      documentos,
      categorias,
      capacitaciones,
      usuariosPorRol,
      actividadReciente
    };
    
  } catch (error) {
    console.error('❌ Error al obtener métricas:', error);
    throw error;
  }
};

// ============================================================================
// VERSIÓN LEGACY: Mantener compatibilidad con callbacks
// ============================================================================

// Obtener métricas del sistema (versión legacy con callbacks)
// Este es un WRAPPER que usa la versión async internamente
const obtenerMetricas = (callback) => {
  obtenerMetricasAsync()
    .then(metricas => callback(null, metricas))
    .catch(err => callback(err, null));
};

// Inicializar la base de datos
// Ahora delega al módulo de schemas
const inicializarDB = async () => {
  return await initializeDatabase();
};

// 🔍 Búsqueda - Ahora importada desde services/SearchService.js
// La función se re-exporta abajo para mantener compatibilidad

// ============================================================================
// EXPORTACIONES - Re-exportar funciones de módulos para mantener compatibilidad
// ============================================================================

export { 
  // 🗄️ Base de datos
  inicializarDB,
  
  // 👥 Usuarios (re-exportadas desde models/User.js)
  obtenerUsuarioConRol,
  obtenerTodosUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  verificarUsuarioExiste,
  
  // 📄 Documentos y categorías (re-exportadas desde models/Document.js)
  obtenerCategorias,
  obtenerDocumentos,
  
  // 📊 Métricas
  obtenerMetricas,
  obtenerMetricasAsync,
  
  // 🔍 Búsqueda (re-exportadas desde services/SearchService.js)
  buscarContenido,
  buscarContenidoAsync
};