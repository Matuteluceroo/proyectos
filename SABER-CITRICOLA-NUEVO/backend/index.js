/**
 * 📦 INDEX.JS - Punto de entrada principal del backend
 * ======================================================
 * Este archivo centraliza todas las exportaciones del backend
 * de forma organizada y fácil de importar.
 */

// ============================================================================
// 🗄️ CONFIGURACIÓN Y BASE DE DATOS
// ============================================================================

export { default as db, dbPath } from './config/database.js';
export { initializeDatabase, TABLAS } from './models/schemas.js';

// ============================================================================
// 👥 MODELOS - USUARIOS
// ============================================================================

export {
  UserModel,
  // Funciones de compatibilidad
  obtenerUsuarioConRol,
  obtenerTodosUsuarios,
  obtenerUsuarioPorId,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  verificarUsuarioExiste
} from './models/User.js';

// ============================================================================
// 📄 MODELOS - DOCUMENTOS Y CATEGORÍAS
// ============================================================================

export {
  DocumentModel,
  // Funciones de compatibilidad
  obtenerCategorias,
  obtenerDocumentos,
  obtenerCategoriaPorId,
  contarDocumentosPorCategoria,
  obtenerDocumentoPorId,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria
} from './models/Document.js';

// ============================================================================
// 🔍 SERVICIOS - BÚSQUEDA
// ============================================================================

export {
  SearchService,
  // Funciones de compatibilidad
  buscarContenido,
  buscarContenidoAsync
} from './services/SearchService.js';

// ============================================================================
// 📊 MÉTRICAS Y FUNCIONES LEGACY
// ============================================================================

export {
  inicializarDB,
  obtenerMetricas,
  obtenerMetricasAsync
} from './database-citricola.js';

// ============================================================================
// 📖 EXPORTACIÓN POR DEFECTO - Objeto con todo organizado
// ============================================================================

import db from './config/database.js';
import { initializeDatabase } from './models/schemas.js';
import { UserModel } from './models/User.js';
import { DocumentModel } from './models/Document.js';
import { SearchService } from './services/SearchService.js';
import { 
  inicializarDB,
  obtenerMetricas,
  obtenerMetricasAsync 
} from './database-citricola.js';

/**
 * Objeto principal con todas las funcionalidades del backend
 * organizadas por categoría
 */
export default {
  // Configuración
  db,
  
  // Modelos
  models: {
    User: UserModel,
    Document: DocumentModel
  },
  
  // Servicios
  services: {
    Search: SearchService
  },
  
  // Funciones principales
  inicializarDB,
  initializeDatabase,
  obtenerMetricas,
  obtenerMetricasAsync
};

