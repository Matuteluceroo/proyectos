/**
 * 📦 DocumentRepository.js - Capa de acceso a datos para documentos
 * ==================================================================
 * RESPONSABILIDAD ÚNICA: Acceso a base de datos para entidad Documento
 * 
 * Este repositorio maneja SOLO las consultas SQL y operaciones de BD.
 * No contiene lógica de negocio, validaciones ni manejo de archivos.
 */

import db from '../config/database.js';

class DocumentRepository {
  /**
   * Encuentra todos los documentos con filtros opcionales
   * @param {Object} filters - Filtros de búsqueda
   * @param {Object} pagination - Opciones de paginación
   * @returns {Promise<Array>} Lista de documentos
   */
  async findAll(filters = {}, pagination = { limite: 20, offset: 0 }) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          d.*,
          c.nombre as categoria_nombre,
          c.icono as categoria_icono,
          u.nombre_completo as autor_nombre
        FROM documentos d
        LEFT JOIN categorias c ON d.categoria_id = c.id
        LEFT JOIN usuarios u ON d.autor_id = u.id
        WHERE 1=1
      `;

      const params = [];

      // Aplicar filtros
      if (filters.categoria_id) {
        query += ' AND d.categoria_id = ?';
        params.push(filters.categoria_id);
      }

      if (filters.tipo) {
        query += ' AND d.tipo = ?';
        params.push(filters.tipo);
      }

      if (filters.estado) {
        query += ' AND d.estado = ?';
        params.push(filters.estado);
      }

      if (filters.nivel_acceso) {
        query += ' AND d.nivel_acceso = ?';
        params.push(filters.nivel_acceso);
      }

      if (filters.busqueda) {
        query += ` AND (
          d.titulo LIKE ? OR 
          d.descripcion LIKE ? OR 
          d.contenido LIKE ? OR 
          d.keywords LIKE ? OR
          d.tags LIKE ?
        )`;
        const searchTerm = `%${filters.busqueda}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      // Ordenamiento
      const validColumns = ['titulo', 'created_at', 'updated_at', 'vistas', 'estado'];
      const orderColumn = validColumns.includes(filters.orden) ? filters.orden : 'created_at';
      const orderDirection = filters.direccion?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      query += ` ORDER BY d.${orderColumn} ${orderDirection}`;

      // Paginación
      query += ` LIMIT ? OFFSET ?`;
      params.push(pagination.limite, pagination.offset);

      db.all(query, params, (err, documentos) => {
        if (err) return reject(err);
        resolve(documentos);
      });
    });
  }

  /**
   * Cuenta documentos con filtros opcionales
   * @param {Object} filters - Filtros de búsqueda
   * @returns {Promise<number>} Total de documentos
   */
  async count(filters = {}) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT COUNT(*) as total 
        FROM documentos d 
        WHERE 1=1
      `;

      const params = [];

      // Aplicar mismos filtros que findAll
      if (filters.categoria_id) {
        query += ' AND d.categoria_id = ?';
        params.push(filters.categoria_id);
      }

      if (filters.tipo) {
        query += ' AND d.tipo = ?';
        params.push(filters.tipo);
      }

      if (filters.estado) {
        query += ' AND d.estado = ?';
        params.push(filters.estado);
      }

      if (filters.nivel_acceso) {
        query += ' AND d.nivel_acceso = ?';
        params.push(filters.nivel_acceso);
      }

      if (filters.busqueda) {
        query += ` AND (
          d.titulo LIKE ? OR 
          d.descripcion LIKE ? OR 
          d.contenido LIKE ? OR 
          d.keywords LIKE ? OR
          d.tags LIKE ?
        )`;
        const searchTerm = `%${filters.busqueda}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      db.get(query, params, (err, result) => {
        if (err) return reject(err);
        resolve(result?.total || 0);
      });
    });
  }

  /**
   * Encuentra un documento por ID
   * @param {number} id - ID del documento
   * @returns {Promise<Object|null>} Documento encontrado o null
   */
  async findById(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          d.*,
          c.nombre as categoria_nombre,
          c.icono as categoria_icono,
          u.nombre_completo as autor_nombre,
          u.email as autor_email
        FROM documentos d
        LEFT JOIN categorias c ON d.categoria_id = c.id
        LEFT JOIN usuarios u ON d.autor_id = u.id
        WHERE d.id = ?
      `;

      db.get(query, [id], (err, documento) => {
        if (err) return reject(err);
        resolve(documento || null);
      });
    });
  }

  /**
   * Crea un nuevo documento
   * @param {Object} data - Datos del documento
   * @returns {Promise<number>} ID del documento creado
   */
  async create(data) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO documentos (
          titulo, descripcion, contenido, tipo, categoria_id, 
          autor_id, tags, nivel_acceso, keywords, estado,
          archivo_url, archivo_nombre_original, archivo_extension,
          archivo_size, archivo_tipo_mime, archivo_ruta
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        data.titulo,
        data.descripcion,
        data.contenido || '',
        data.tipo || 'documento',
        data.categoria_id || null,
        data.autor_id,
        data.tags || '',
        data.nivel_acceso || 'publico',
        data.keywords || '',
        data.estado || 'borrador',
        data.archivo_url || null,
        data.archivo_nombre_original || null,
        data.archivo_extension || null,
        data.archivo_size || null,
        data.archivo_tipo_mime || null,
        data.archivo_ruta || null
      ];

      db.run(query, values, function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });
  }

  /**
   * Actualiza un documento existente
   * @param {number} id - ID del documento
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<boolean>} true si se actualizó, false si no existe
   */
  async update(id, data) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE documentos SET
          titulo = COALESCE(?, titulo),
          descripcion = COALESCE(?, descripcion),
          contenido = COALESCE(?, contenido),
          tipo = COALESCE(?, tipo),
          categoria_id = COALESCE(?, categoria_id),
          tags = COALESCE(?, tags),
          nivel_acceso = COALESCE(?, nivel_acceso),
          keywords = COALESCE(?, keywords),
          estado = COALESCE(?, estado),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const values = [
        data.titulo, data.descripcion, data.contenido, data.tipo, data.categoria_id,
        data.tags, data.nivel_acceso, data.keywords, data.estado, id
      ];

      db.run(query, values, function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  /**
   * Elimina un documento
   * @param {number} id - ID del documento
   * @returns {Promise<boolean>} true si se eliminó, false si no existe
   */
  async delete(id) {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM documentos WHERE id = ?';

      db.run(query, [id], function(err) {
        if (err) return reject(err);
        resolve(this.changes > 0);
      });
    });
  }

  /**
   * Incrementa el contador de vistas
   * @param {number} id - ID del documento
   * @returns {Promise<void>}
   */
  async incrementViews(id) {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE documentos SET vistas = vistas + 1 WHERE id = ?';

      db.run(query, [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  /**
   * Obtiene estadísticas de documentos
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_documentos,
          COUNT(CASE WHEN estado = 'publicado' THEN 1 END) as publicados,
          COUNT(CASE WHEN estado = 'borrador' THEN 1 END) as borradores,
          COUNT(CASE WHEN estado = 'revision' THEN 1 END) as en_revision,
          COUNT(CASE WHEN tipo = 'documento' THEN 1 END) as documentos,
          COUNT(CASE WHEN tipo = 'guia' THEN 1 END) as guias,
          COUNT(CASE WHEN tipo = 'procedimiento' THEN 1 END) as procedimientos,
          COUNT(CASE WHEN tipo = 'capacitacion' THEN 1 END) as capacitaciones,
          SUM(vistas) as total_vistas,
          AVG(vistas) as promedio_vistas
        FROM documentos
      `;

      db.get(query, [], (err, stats) => {
        if (err) return reject(err);
        resolve(stats);
      });
    });
  }
}

export default new DocumentRepository();

