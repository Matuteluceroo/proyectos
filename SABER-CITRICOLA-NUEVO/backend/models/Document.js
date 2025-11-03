/**
 * 📄 DOCUMENT.JS - Modelo de documentos y categorías
 * ====================================================
 * Este módulo contiene toda la lógica relacionada con:
 * - Categorías de conocimiento
 * - Documentos
 * - Consultas y filtros
 */

import db from '../config/database.js';

// ============================================================================
// CLASE DOCUMENTMODEL - Métodos estáticos para operaciones de documentos
// ============================================================================

export class DocumentModel {
  
  /**
   * 📚 Obtener todas las categorías ordenadas alfabéticamente
   * @param {Function} callback - Callback (err, categorias)
   */
  static obtenerCategorias(callback) {
    const sql = "SELECT * FROM categorias ORDER BY nombre";
    db.all(sql, [], callback);
  }
  
  /**
   * 📄 Obtener documentos con filtros opcionales
   * @param {number|null} categoriaId - ID de categoría (opcional)
   * @param {string} nivelAcceso - Nivel de acceso del usuario ('publico', 'experto', 'administrador')
   * @param {Function} callback - Callback (err, documentos)
   */
  static obtenerDocumentos(categoriaId = null, nivelAcceso = 'publico', callback) {
    let sql = `
      SELECT d.*, c.nombre as categoria_nombre, u.nombre_completo as autor_nombre 
      FROM documentos d 
      LEFT JOIN categorias c ON d.categoria_id = c.id 
      LEFT JOIN usuarios u ON d.autor_id = u.id 
      WHERE 1=1
    `;
    
    const params = [];
    
    // Filtrar por categoría si se especifica
    if (categoriaId) {
      sql += " AND d.categoria_id = ?";
      params.push(categoriaId);
    }
    
    // Filtrar por nivel de acceso (administradores ven todo)
    if (nivelAcceso !== 'administrador') {
      sql += " AND d.nivel_acceso = 'publico'";
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    sql += " ORDER BY d.created_at DESC";
    
    db.all(sql, params, callback);
  }
  
  /**
   * 🔍 Obtener una categoría por ID
   * @param {number} id - ID de la categoría
   * @param {Function} callback - Callback (err, categoria)
   */
  static obtenerCategoriaPorId(id, callback) {
    const sql = "SELECT * FROM categorias WHERE id = ?";
    db.get(sql, [id], callback);
  }
  
  /**
   * 📊 Contar documentos por categoría
   * @param {number} categoriaId - ID de la categoría
   * @param {Function} callback - Callback (err, count)
   */
  static contarDocumentosPorCategoria(categoriaId, callback) {
    const sql = "SELECT COUNT(*) as total FROM documentos WHERE categoria_id = ?";
    db.get(sql, [categoriaId], (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row ? row.total : 0);
      }
    });
  }
  
  /**
   * 🔍 Obtener un documento por ID
   * @param {number} id - ID del documento
   * @param {Function} callback - Callback (err, documento)
   */
  static obtenerDocumentoPorId(id, callback) {
    const sql = `
      SELECT d.*, c.nombre as categoria_nombre, u.nombre_completo as autor_nombre 
      FROM documentos d 
      LEFT JOIN categorias c ON d.categoria_id = c.id 
      LEFT JOIN usuarios u ON d.autor_id = u.id 
      WHERE d.id = ?
    `;
    db.get(sql, [id], callback);
  }
  
  /**
   * ➕ Crear nueva categoría
   * @param {Object} datosCategoria - { nombre, descripcion, color, icono }
   * @param {Function} callback - Callback (err, categoriaId)
   */
  static crearCategoria(datosCategoria, callback) {
    const { nombre, descripcion, color = '#2196F3', icono = '📚' } = datosCategoria;
    
    const sql = `
      INSERT INTO categorias (nombre, descripcion, color, icono, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `;
    
    db.run(sql, [nombre, descripcion, color, icono], function(err) {
      if (err) {
        console.error('❌ Error al crear categoría:', err);
        callback(err, null);
      } else {
        console.log(`✅ Categoría creada con ID: ${this.lastID}`);
        callback(null, this.lastID);
      }
    });
  }
  
  /**
   * ✏️ Actualizar categoría
   * @param {number} id - ID de la categoría
   * @param {Object} datosActualizacion - { nombre, descripcion, color, icono }
   * @param {Function} callback - Callback (err, actualizado)
   */
  static actualizarCategoria(id, datosActualizacion, callback) {
    const { nombre, descripcion, color, icono } = datosActualizacion;
    
    const sql = `
      UPDATE categorias 
      SET nombre = ?, descripcion = ?, color = ?, icono = ?
      WHERE id = ?
    `;
    
    db.run(sql, [nombre, descripcion, color, icono, id], function(err) {
      if (err) {
        console.error('❌ Error al actualizar categoría:', err);
        callback(err, null);
      } else {
        console.log(`✅ Categoría ${id} actualizada exitosamente`);
        callback(null, this.changes > 0);
      }
    });
  }
  
  /**
   * 🗑️ Eliminar categoría
   * @param {number} id - ID de la categoría
   * @param {Function} callback - Callback (err, eliminado)
   */
  static eliminarCategoria(id, callback) {
    const sql = 'DELETE FROM categorias WHERE id = ?';
    
    db.run(sql, [id], function(err) {
      if (err) {
        console.error('❌ Error al eliminar categoría:', err);
        callback(err, null);
      } else {
        console.log(`✅ Categoría eliminada. Filas afectadas: ${this.changes}`);
        callback(null, this.changes > 0);
      }
    });
  }
}

// ============================================================================
// EXPORTACIONES DE COMPATIBILIDAD - Funciones individuales
// ============================================================================
// Estas funciones mantienen la compatibilidad con el código existente

/**
 * Obtener todas las categorías (función de compatibilidad)
 */
export function obtenerCategorias(callback) {
  return DocumentModel.obtenerCategorias(callback);
}

/**
 * Obtener documentos con filtros (función de compatibilidad)
 */
export function obtenerDocumentos(categoriaId = null, nivelAcceso = 'publico', callback) {
  return DocumentModel.obtenerDocumentos(categoriaId, nivelAcceso, callback);
}

/**
 * Obtener categoría por ID (función de compatibilidad)
 */
export function obtenerCategoriaPorId(id, callback) {
  return DocumentModel.obtenerCategoriaPorId(id, callback);
}

/**
 * Contar documentos por categoría (función de compatibilidad)
 */
export function contarDocumentosPorCategoria(categoriaId, callback) {
  return DocumentModel.contarDocumentosPorCategoria(categoriaId, callback);
}

/**
 * Obtener documento por ID (función de compatibilidad)
 */
export function obtenerDocumentoPorId(id, callback) {
  return DocumentModel.obtenerDocumentoPorId(id, callback);
}

/**
 * Crear categoría (función de compatibilidad)
 */
export function crearCategoria(datosCategoria, callback) {
  return DocumentModel.crearCategoria(datosCategoria, callback);
}

/**
 * Actualizar categoría (función de compatibilidad)
 */
export function actualizarCategoria(id, datosActualizacion, callback) {
  return DocumentModel.actualizarCategoria(id, datosActualizacion, callback);
}

/**
 * Eliminar categoría (función de compatibilidad)
 */
export function eliminarCategoria(id, callback) {
  return DocumentModel.eliminarCategoria(id, callback);
}

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

export default DocumentModel;

