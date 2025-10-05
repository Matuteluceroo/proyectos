// 📚 models/versiones.js - Modelo para manejo de versiones de documentos
import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const sql = new sqlite3.Database('./saber_citricola.db');

export class VersionesModel {
  
  // 📄 Crear nueva versión de un documento
  static async crearVersion(datosVersion) {
    return new Promise((resolve, reject) => {
      const {
        documento_id,
        numero_version,
        usuario_id,
        tipo_cambio = 'edicion',
        titulo,
        descripcion,
        contenido,
        keywords,
        tags,
        nivel_acceso = 'publico',
        comentario_version,
        archivo_url,
        archivo_nombre_original,
        archivo_mimetype,
        archivo_tamano,
        ip_usuario,
        user_agent
      } = datosVersion;

      const insertSql = `
        INSERT INTO versiones_documentos (
          documento_id, numero_version, usuario_id, tipo_cambio,
          titulo, descripcion, contenido, keywords, tags, nivel_acceso,
          comentario_version, archivo_url, archivo_nombre_original,
          archivo_mimetype, archivo_tamano, ip_usuario, user_agent,
          tamano_contenido, hash_contenido, es_version_actual
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const tamano_contenido = contenido ? contenido.length : 0;
      const hash_contenido = crypto.createHash('md5').update(contenido || '').digest('hex');

      sql.run(insertSql, [
        documento_id, numero_version, usuario_id, tipo_cambio,
        titulo, descripcion, contenido, keywords, tags, nivel_acceso,
        comentario_version, archivo_url, archivo_nombre_original,
        archivo_mimetype, archivo_tamano, ip_usuario, user_agent,
        tamano_contenido, hash_contenido, 1 // es_version_actual
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          id: this.lastID,
          documento_id,
          numero_version,
          usuario_id,
          mensaje: 'Versión creada exitosamente'
        });
      });
    });
  }

  // 📖 Obtener versiones de un documento
  static async obtenerVersionesPorDocumento(documentoId, limite = 10) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          v.*,
          u.username,
          u.nombre_completo,
          u.rol
        FROM versiones_documentos v
        LEFT JOIN usuarios u ON v.usuario_id = u.id
        WHERE v.documento_id = ?
        ORDER BY v.fecha_creacion DESC
        LIMIT ?
      `;

      sql.all(query, [documentoId, limite], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }

  // 📄 Obtener versión específica
  static async obtenerVersionPorId(versionId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          v.*,
          u.username,
          u.nombre_completo,
          u.rol
        FROM versiones_documentos v
        LEFT JOIN usuarios u ON v.usuario_id = u.id
        WHERE v.id = ?
      `;

      sql.get(query, [versionId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  // 🔄 Comparar dos versiones
  static async compararVersiones(versionIdAnterior, versionIdNueva, usuarioId) {
    return new Promise((resolve, reject) => {
      // Obtener ambas versiones
      const query = `
        SELECT id, numero_version, titulo, contenido, fecha_creacion
        FROM versiones_documentos 
        WHERE id IN (?, ?)
        ORDER BY fecha_creacion ASC
      `;

      sql.all(query, [versionIdAnterior, versionIdNueva], (err, versiones) => {
        if (err) {
          reject(err);
          return;
        }

        if (versiones.length !== 2) {
          reject(new Error('No se encontraron las versiones especificadas'));
          return;
        }

        const [versionAnterior, versionNueva] = versiones;
        
        // Registrar la comparación
        const insertComparacion = `
          INSERT INTO comparaciones_versiones (
            version_anterior_id, version_nueva_id, usuario_id, fecha_comparacion
          ) VALUES (?, ?, ?, datetime('now'))
        `;

        sql.run(insertComparacion, [versionIdAnterior, versionIdNueva, usuarioId], function(err) {
          if (err) {
            console.error('Error registrando comparación:', err);
          }
        });

        resolve({
          version_anterior: versionAnterior,
          version_nueva: versionNueva,
          comparacion_id: this?.lastID
        });
      });
    });
  }

  // 🔄 Restaurar versión anterior
  static async restaurarVersion(versionId, usuarioId, comentario = '') {
    return new Promise((resolve, reject) => {
      // Primero obtener la versión a restaurar
      this.obtenerVersionPorId(versionId).then(version => {
        if (!version) {
          reject(new Error('Versión no encontrada'));
          return;
        }

        // Desactivar versión actual
        const desactivarSql = `
          UPDATE versiones_documentos 
          SET es_version_actual = 0 
          WHERE documento_id = ? AND es_version_actual = 1
        `;

        sql.run(desactivarSql, [version.documento_id], (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Activar la versión restaurada
          const activarSql = `
            UPDATE versiones_documentos 
            SET es_version_actual = 1 
            WHERE id = ?
          `;

          sql.run(activarSql, [versionId], (err) => {
            if (err) {
              reject(err);
              return;
            }

            // Registrar la restauración
            const registrarSql = `
              INSERT INTO restauraciones_versiones (
                version_id, usuario_id, comentario, fecha_restauracion
              ) VALUES (?, ?, ?, datetime('now'))
            `;

            sql.run(registrarSql, [versionId, usuarioId, comentario], function(err) {
              if (err) {
                console.error('Error registrando restauración:', err);
              }

              resolve({
                success: true,
                mensaje: 'Versión restaurada exitosamente',
                version_restaurada: version
              });
            });
          });
        });
      }).catch(reject);
    });
  }

  // 🏷️ Agregar etiqueta a versión
  static async agregarEtiqueta(versionId, etiqueta, descripcion, color = '#10b981', icono = '🏷️', usuarioId) {
    return new Promise((resolve, reject) => {
      const insertSql = `
        INSERT INTO etiquetas_versiones (
          version_id, etiqueta, descripcion, color, icono, usuario_asignador_id
        ) VALUES (?, ?, ?, ?, ?, ?)
      `;

      sql.run(insertSql, [versionId, etiqueta, descripcion, color, icono, usuarioId], function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          id: this.lastID,
          mensaje: 'Etiqueta agregada exitosamente'
        });
      });
    });
  }

  // 📊 Obtener estadísticas de versiones por documento
  static async obtenerEstadisticas(documentoId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          COUNT(*) as total_versiones,
          MAX(fecha_creacion) as ultima_modificacion,
          COUNT(DISTINCT usuario_id) as colaboradores,
          AVG(tamano_contenido) as tamano_promedio
        FROM versiones_documentos 
        WHERE documento_id = ?
      `;

      sql.get(query, [documentoId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || {});
      });
    });
  }

  // 🔄 Actualizar estadísticas de versiones
  static actualizarEstadisticas(documentoId) {
    const updateSql = `
      INSERT OR REPLACE INTO estadisticas_versiones (
        documento_id, total_versiones, fecha_ultima_modificacion
      ) VALUES (
        ?, 
        (SELECT COUNT(*) FROM versiones_documentos WHERE documento_id = ?),
        (SELECT MAX(fecha_creacion) FROM versiones_documentos WHERE documento_id = ?)
      )
    `;

    sql.run(updateSql, [documentoId, documentoId, documentoId], (err) => {
      if (err) {
        console.error('Error actualizando estadísticas:', err);
      }
    });
  }

  // 📄 Obtener versión actual de un documento
  static async obtenerVersionActual(documentoId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          v.*,
          u.username,
          u.nombre_completo
        FROM versiones_documentos v
        LEFT JOIN usuarios u ON v.usuario_id = u.id
        WHERE v.documento_id = ? AND v.es_version_actual = 1
      `;

      sql.get(query, [documentoId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row);
      });
    });
  }

  // 🏷️ Obtener etiquetas de una versión
  static async obtenerEtiquetas(versionId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          e.*,
          u.username as asignado_por
        FROM etiquetas_versiones e
        LEFT JOIN usuarios u ON e.usuario_asignador_id = u.id
        WHERE e.version_id = ?
        ORDER BY e.fecha_asignacion DESC
      `;

      sql.all(query, [versionId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }
}

export default VersionesModel;