/**
 * 🔍 SEARCHSERVICE.JS - Servicio de búsqueda
 * ============================================
 * Este módulo contiene la lógica de búsqueda unificada:
 * - Búsqueda en documentos, usuarios y categorías
 * - Filtros de fecha y tipo
 * - Ordenamiento por relevancia
 */

import db from '../config/database.js';

// ============================================================================
// CLASE SEARCHSERVICE - Métodos estáticos para búsqueda
// ============================================================================

export class SearchService {
  
  /**
   * 🔧 Helper: Promisificar db.all
   * @param {string} query - Query SQL
   * @param {Array} params - Parámetros del query
   * @returns {Promise<Array>} Resultados
   */
  static dbAll(query, params = []) {
    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }
  
  /**
   * 🏗️ Helper: Construir filtros de fecha para queries
   * @param {string} baseSql - Query SQL base
   * @param {Array} baseParams - Parámetros base
   * @param {Object} filtros - { fechaDesde, fechaHasta }
   * @returns {Object} { sql, params }
   */
  static buildDateFilters(baseSql, baseParams, filtros) {
    let sql = baseSql;
    const params = [...baseParams];
    const { fechaDesde, fechaHasta } = filtros;
    
    if (fechaDesde) {
      sql += " AND created_at >= ?";
      params.push(fechaDesde);
    }
    
    if (fechaHasta) {
      sql += " AND created_at <= ?";
      params.push(fechaHasta);
    }
    
    return { sql, params };
  }
  
  /**
   * 📄 Buscar en documentos
   * @param {string} searchTerm - Término de búsqueda (ya con %)
   * @param {Object} filtros - { categoria, fechaDesde, fechaHasta }
   * @returns {Promise<Array>} Documentos encontrados
   */
  static async searchDocuments(searchTerm, filtros = {}) {
    const { categoria } = filtros;
    
    let sql = `
      SELECT 
        d.id,
        d.titulo,
        d.descripcion,
        d.tipo,
        d.created_at as fecha,
        c.nombre as categoria_nombre,
        u.nombre_completo as autor_nombre,
        'documento' as tipo_resultado
      FROM documentos d
      LEFT JOIN categorias c ON d.categoria_id = c.id
      LEFT JOIN usuarios u ON d.autor_id = u.id
      WHERE (
        d.titulo LIKE ? OR 
        d.descripcion LIKE ? OR 
        d.contenido LIKE ?
      )
    `;
    
    const params = [searchTerm, searchTerm, searchTerm];
    
    // Filtrar por categoría si se especifica
    if (categoria) {
      sql += " AND d.categoria_id = ?";
      params.push(categoria);
    }
    
    // Aplicar filtros de fecha
    const queryWithFilters = SearchService.buildDateFilters(sql, params, filtros);
    queryWithFilters.sql += " ORDER BY d.created_at DESC LIMIT 20";
    
    const resultados = await SearchService.dbAll(queryWithFilters.sql, queryWithFilters.params);
    
    return resultados.map(doc => ({
      ...doc,
      tipo: 'documento'
    }));
  }
  
  /**
   * 👥 Buscar en usuarios
   * @param {string} searchTerm - Término de búsqueda (ya con %)
   * @param {Object} filtros - { fechaDesde, fechaHasta }
   * @returns {Promise<Array>} Usuarios encontrados
   */
  static async searchUsers(searchTerm, filtros = {}) {
    let sql = `
      SELECT 
        id,
        username as titulo,
        nombre_completo as nombre,
        email as descripcion,
        rol,
        created_at as fecha,
        'usuario' as tipo_resultado
      FROM usuarios
      WHERE (
        username LIKE ? OR 
        nombre_completo LIKE ? OR 
        email LIKE ?
      )
    `;
    
    const params = [searchTerm, searchTerm, searchTerm];
    
    // Aplicar filtros de fecha
    const queryWithFilters = SearchService.buildDateFilters(sql, params, filtros);
    queryWithFilters.sql += " ORDER BY created_at DESC LIMIT 10";
    
    const resultados = await SearchService.dbAll(queryWithFilters.sql, queryWithFilters.params);
    
    return resultados.map(user => ({
      ...user,
      tipo: 'usuario'
    }));
  }
  
  /**
   * 📚 Buscar en categorías
   * @param {string} searchTerm - Término de búsqueda (ya con %)
   * @param {Object} filtros - { fechaDesde, fechaHasta }
   * @returns {Promise<Array>} Categorías encontradas
   */
  static async searchCategories(searchTerm, filtros = {}) {
    let sql = `
      SELECT 
        id,
        nombre as titulo,
        descripcion,
        icono,
        color,
        created_at as fecha,
        'categoria' as tipo_resultado
      FROM categorias
      WHERE (
        nombre LIKE ? OR 
        descripcion LIKE ?
      )
    `;
    
    const params = [searchTerm, searchTerm];
    
    // Aplicar filtros de fecha
    const queryWithFilters = SearchService.buildDateFilters(sql, params, filtros);
    queryWithFilters.sql += " ORDER BY created_at DESC LIMIT 10";
    
    const resultados = await SearchService.dbAll(queryWithFilters.sql, queryWithFilters.params);
    
    return resultados.map(cat => ({
      ...cat,
      tipo: 'categoria'
    }));
  }
  
  /**
   * 🎯 Ordenar resultados por relevancia
   * @param {Array} resultados - Array de resultados
   * @param {string} query - Término de búsqueda original
   * @returns {Array} Resultados ordenados
   */
  static sortByRelevance(resultados, query) {
    return resultados.sort((a, b) => {
      // Coincidencias exactas primero
      const aExact = a.titulo?.toLowerCase().includes(query.toLowerCase()) || 
                     a.nombre?.toLowerCase().includes(query.toLowerCase());
      const bExact = b.titulo?.toLowerCase().includes(query.toLowerCase()) || 
                     b.nombre?.toLowerCase().includes(query.toLowerCase());
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      // Si ambos son exactos o ninguno, ordenar por fecha (más recientes primero)
      return new Date(b.fecha) - new Date(a.fecha);
    });
  }
  
  /**
   * 🔍 BÚSQUEDA PRINCIPAL (async/await)
   * @param {string} query - Término de búsqueda
   * @param {Object} filtros - { tipo, categoria, fechaDesde, fechaHasta }
   * @returns {Promise<Array>} Resultados ordenados por relevancia
   */
  static async buscarContenidoAsync(query, filtros = {}) {
    const { tipo = 'todos' } = filtros;
    const searchTerm = `%${query}%`;
    
    // Array para almacenar promesas de búsqueda
    const searchPromises = [];
    
    // Buscar en documentos
    if (tipo === 'todos' || tipo === 'documentos') {
      searchPromises.push(
        SearchService.searchDocuments(searchTerm, filtros).catch(err => {
          console.error('❌ Error buscando en documentos:', err);
          return []; // Retornar array vacío si falla
        })
      );
    }
    
    // Buscar en usuarios
    if (tipo === 'todos' || tipo === 'usuarios') {
      searchPromises.push(
        SearchService.searchUsers(searchTerm, filtros).catch(err => {
          console.error('❌ Error buscando en usuarios:', err);
          return [];
        })
      );
    }
    
    // Buscar en categorías
    if (tipo === 'todos' || tipo === 'categorias') {
      searchPromises.push(
        SearchService.searchCategories(searchTerm, filtros).catch(err => {
          console.error('❌ Error buscando en categorías:', err);
          return [];
        })
      );
    }
    
    // Ejecutar todas las búsquedas en PARALELO
    const resultadosArrays = await Promise.all(searchPromises);
    
    // Combinar todos los resultados en un solo array
    const resultadosCombinados = resultadosArrays.flat();
    
    // Ordenar por relevancia
    return SearchService.sortByRelevance(resultadosCombinados, query);
  }
  
  /**
   * 🔍 Búsqueda con callbacks (compatibilidad con código legacy)
   * @param {string} query - Término de búsqueda
   * @param {Object} filtros - { tipo, categoria, fechaDesde, fechaHasta }
   * @param {Function} callback - Callback (err, resultados)
   */
  static buscarContenido(query, filtros = {}, callback) {
    SearchService.buscarContenidoAsync(query, filtros)
      .then(resultados => callback(null, resultados))
      .catch(err => callback(err, null));
  }
}

// ============================================================================
// EXPORTACIONES DE COMPATIBILIDAD - Función individual
// ============================================================================

/**
 * Función de compatibilidad para mantener el código existente funcionando
 */
export function buscarContenido(query, filtros = {}, callback) {
  return SearchService.buscarContenido(query, filtros, callback);
}

/**
 * Versión async/await para código nuevo
 */
export function buscarContenidoAsync(query, filtros = {}) {
  return SearchService.buscarContenidoAsync(query, filtros);
}

// ============================================================================
// EXPORTACIÓN POR DEFECTO
// ============================================================================

export default SearchService;

