// 💬 models/comentarios.js - Modelo para gestión de comentarios
import sqlite3 from 'sqlite3';

const sql = new sqlite3.Database('./saber_citricola.db');

export class ComentariosModel {
  
  // 📝 Crear nuevo comentario
  static async crear(datos) {
    const {
      documento_id,
      usuario_id,
      contenido,
      comentario_padre_id = null,
      posicion_texto = null,
      seleccion_texto = null,
      ip_usuario = null,
      user_agent = null
    } = datos;

    return new Promise((resolve, reject) => {
      // Calcular nivel de anidación
      let nivel_anidacion = 0;
      
      if (comentario_padre_id) {
        const getNivelQuery = `
          SELECT nivel_anidacion FROM comentarios WHERE id = ?
        `;
        
        sql.get(getNivelQuery, [comentario_padre_id], (err, padre) => {
          if (err) {
            reject(err);
            return;
          }
          
          nivel_anidacion = padre ? padre.nivel_anidacion + 1 : 0;
          
          // Limitar niveles de anidación a 3
          if (nivel_anidacion > 3) {
            nivel_anidacion = 3;
          }
          
          insertarComentario();
        });
      } else {
        insertarComentario();
      }
      
      function insertarComentario() {
        const insertQuery = `
          INSERT INTO comentarios (
            documento_id, usuario_id, comentario, comentario_padre_id,
            nivel_anidacion, posicion_texto, seleccion_texto, ip_usuario, user_agent
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        sql.run(insertQuery, [
          documento_id, usuario_id, contenido, comentario_padre_id,
          nivel_anidacion, posicion_texto, seleccion_texto, ip_usuario, user_agent
        ], function(err) {
          if (err) {
            reject(err);
            return;
          }
          
          // Actualizar estadísticas
          ComentariosModel.actualizarEstadisticas(documento_id);
          
          // Obtener el comentario creado con información del usuario
          ComentariosModel.obtenerPorId(this.lastID).then(resolve).catch(reject);
        });
      }
    });
  }

  // 📖 Obtener comentario por ID con información del usuario
  static async obtenerPorId(id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          c.*,
          u.username,
          u.nombre_completo,
          u.rol,
          COUNT(r.id) as total_reacciones,
          GROUP_CONCAT(CASE WHEN r.tipo_reaccion = 'like' THEN r.usuario_id END) as likes,
          GROUP_CONCAT(CASE WHEN r.tipo_reaccion = 'dislike' THEN r.usuario_id END) as dislikes
        FROM comentarios c
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN reacciones_comentarios r ON c.id = r.comentario_id
        WHERE c.id = ? AND c.estado = 'activo'
        GROUP BY c.id
      `;
      
      sql.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (row) {
          // Procesar reacciones
          row.likes = row.likes ? row.likes.split(',').map(Number) : [];
          row.dislikes = row.dislikes ? row.dislikes.split(',').map(Number) : [];
          row.total_likes = row.likes.length;
          row.total_dislikes = row.dislikes.length;
        }
        
        resolve(row);
      });
    });
  }

  // 📋 Obtener comentarios de un documento con estructura jerárquica
  static async obtenerPorDocumento(documento_id, usuario_id = null) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          c.*,
          c.comentario as contenido,
          c.created_at as fecha_creacion,
          u.username,
          u.nombre_completo,
          u.rol,
          COUNT(DISTINCT r.id) as total_reacciones,
          COUNT(DISTINCT rc.id) as total_respuestas,
          GROUP_CONCAT(DISTINCT CASE WHEN r.tipo_reaccion = 'like' THEN r.usuario_id END) as likes,
          GROUP_CONCAT(DISTINCT CASE WHEN r.tipo_reaccion = 'dislike' THEN r.usuario_id END) as dislikes,
          CASE WHEN ur.usuario_id IS NOT NULL THEN ur.tipo_reaccion ELSE NULL END as mi_reaccion
        FROM comentarios c
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN reacciones_comentarios r ON c.id = r.comentario_id
        LEFT JOIN comentarios rc ON c.id = rc.comentario_padre_id AND (rc.estado = 'activo' OR rc.estado IS NULL)
        LEFT JOIN reacciones_comentarios ur ON c.id = ur.comentario_id AND ur.usuario_id = ?
        WHERE c.documento_id = ? AND (c.estado = 'activo' OR c.estado IS NULL)
        GROUP BY c.id
        ORDER BY c.comentario_padre_id ASC, c.created_at ASC
      `;
      
      sql.all(query, [usuario_id, documento_id], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Procesar datos y crear estructura jerárquica
        const comentarios = rows.map(row => ({
          ...row,
          likes: row.likes ? row.likes.split(',').map(Number) : [],
          dislikes: row.dislikes ? row.dislikes.split(',').map(Number) : [],
          total_likes: row.likes ? row.likes.split(',').length : 0,
          total_dislikes: row.dislikes ? row.dislikes.split(',').length : 0,
          respuestas: []
        }));
        
        // Organizar comentarios en estructura jerárquica
        const comentariosMap = {};
        const comentariosPrincipales = [];
        
        comentarios.forEach(comentario => {
          comentariosMap[comentario.id] = comentario;
          
          if (comentario.comentario_padre_id) {
            // Es una respuesta
            if (comentariosMap[comentario.comentario_padre_id]) {
              comentariosMap[comentario.comentario_padre_id].respuestas.push(comentario);
            }
          } else {
            // Es comentario principal
            comentariosPrincipales.push(comentario);
          }
        });
        
        resolve(comentariosPrincipales);
      });
    });
  }

  // ✏️ Actualizar comentario
  static async actualizar(id, usuario_id, contenido) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE comentarios 
        SET comentario = ?, fecha_modificacion = CURRENT_TIMESTAMP
        WHERE id = ? AND usuario_id = ? AND estado = 'activo'
      `;
      
      sql.run(query, [contenido, id, usuario_id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        if (this.changes === 0) {
          reject(new Error('Comentario no encontrado o sin permisos'));
          return;
        }
        
        // Obtener comentario actualizado
        ComentariosModel.obtenerPorId(id).then(resolve).catch(reject);
      });
    });
  }

  // 🗑️ Eliminar comentario (soft delete)
  static async eliminar(id, usuario_id, es_admin = false) {
    return new Promise((resolve, reject) => {
      const whereClause = es_admin ? 'id = ?' : 'id = ? AND usuario_id = ?';
      const params = es_admin ? [id] : [id, usuario_id];
      
      const query = `
        UPDATE comentarios 
        SET estado = 'eliminado', fecha_eliminacion = CURRENT_TIMESTAMP
        WHERE ${whereClause} AND estado = 'activo'
      `;
      
      sql.run(query, params, function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        if (this.changes === 0) {
          reject(new Error('Comentario no encontrado o sin permisos'));
          return;
        }
        
        // Actualizar estadísticas
        const getDocQuery = 'SELECT documento_id FROM comentarios WHERE id = ?';
        sql.get(getDocQuery, [id], (err, row) => {
          if (!err && row) {
            ComentariosModel.actualizarEstadisticas(row.documento_id);
          }
        });
        
        resolve({ success: true, message: 'Comentario eliminado' });
      });
    });
  }

  // 👍 Agregar/quitar reacción
  static async reaccionar(comentario_id, usuario_id, tipo_reaccion) {
    return new Promise((resolve, reject) => {
      // Verificar si ya reaccionó
      const checkQuery = `
        SELECT tipo_reaccion FROM reacciones_comentarios 
        WHERE comentario_id = ? AND usuario_id = ?
      `;
      
      sql.get(checkQuery, [comentario_id, usuario_id], (err, existente) => {
        if (err) {
          reject(err);
          return;
        }
        
        if (existente) {
          if (existente.tipo_reaccion === tipo_reaccion) {
            // Quitar reacción
            const deleteQuery = `
              DELETE FROM reacciones_comentarios 
              WHERE comentario_id = ? AND usuario_id = ?
            `;
            
            sql.run(deleteQuery, [comentario_id, usuario_id], (err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve({ accion: 'eliminada', tipo: tipo_reaccion });
            });
          } else {
            // Cambiar reacción
            const updateQuery = `
              UPDATE reacciones_comentarios 
              SET tipo_reaccion = ?, fecha_creacion = CURRENT_TIMESTAMP
              WHERE comentario_id = ? AND usuario_id = ?
            `;
            
            sql.run(updateQuery, [tipo_reaccion, comentario_id, usuario_id], (err) => {
              if (err) {
                reject(err);
                return;
              }
              resolve({ accion: 'actualizada', tipo: tipo_reaccion });
            });
          }
        } else {
          // Agregar nueva reacción
          const insertQuery = `
            INSERT INTO reacciones_comentarios (comentario_id, usuario_id, tipo_reaccion)
            VALUES (?, ?, ?)
          `;
          
          sql.run(insertQuery, [comentario_id, usuario_id, tipo_reaccion], (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve({ accion: 'agregada', tipo: tipo_reaccion });
          });
        }
      });
    });
  }

  // 📊 Actualizar estadísticas de comentarios
  static async actualizarEstadisticas(documento_id) {
    return new Promise((resolve, reject) => {
      const statsQuery = `
        SELECT 
          COUNT(CASE WHEN comentario_padre_id IS NULL THEN 1 END) as total_comentarios,
          COUNT(CASE WHEN comentario_padre_id IS NOT NULL THEN 1 END) as total_respuestas,
          COUNT(CASE WHEN estado = 'activo' THEN 1 END) as comentarios_activos,
          COUNT(CASE WHEN estado = 'moderado' THEN 1 END) as comentarios_moderados,
          MAX(created_at) as ultimo_comentario_fecha
        FROM comentarios 
        WHERE documento_id = ?
      `;
      
      sql.get(statsQuery, [documento_id], (err, stats) => {
        if (err) {
          reject(err);
          return;
        }
        
        const likesQuery = `
          SELECT COUNT(*) as total_likes
          FROM reacciones_comentarios r
          JOIN comentarios c ON r.comentario_id = c.id
          WHERE c.documento_id = ? AND r.tipo_reaccion = 'like'
        `;
        
        sql.get(likesQuery, [documento_id], (err, likes) => {
          if (err) {
            reject(err);
            return;
          }
          
          const upsertQuery = `
            INSERT OR REPLACE INTO estadisticas_comentarios (
              documento_id, total_comentarios, total_respuestas, total_likes,
              ultimo_comentario_fecha, comentarios_activos, comentarios_moderados,
              ultima_actualizacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `;
          
          sql.run(upsertQuery, [
            documento_id,
            stats.total_comentarios || 0,
            stats.total_respuestas || 0,
            likes.total_likes || 0,
            stats.ultimo_comentario_fecha,
            stats.comentarios_activos || 0,
            stats.comentarios_moderados || 0
          ], (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(stats);
            }
          });
        });
      });
    });
  }

  // 📊 Obtener estadísticas de un documento
  static async obtenerEstadisticas(documento_id) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM estadisticas_comentarios WHERE documento_id = ?
      `;
      
      sql.get(query, [documento_id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        
        resolve(row || {
          documento_id,
          total_comentarios: 0,
          total_respuestas: 0,
          total_likes: 0,
          comentarios_activos: 0
        });
      });
    });
  }

  // 🚫 Reportar comentario
  static async reportar(comentario_id, usuario_reportante_id, razon, descripcion = '') {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO reportes_comentarios (
          comentario_id, usuario_reportante_id, razon, descripcion
        ) VALUES (?, ?, ?, ?)
      `;
      
      sql.run(query, [comentario_id, usuario_reportante_id, razon, descripcion], function(err) {
        if (err) {
          reject(err);
          return;
        }
        
        resolve({
          success: true,
          id: this.lastID,
          message: 'Reporte enviado correctamente'
        });
      });
    });
  }

  // 🔍 Buscar comentarios
  static async buscar(termino, documento_id = null, limite = 50) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT 
          c.*,
          u.username,
          u.nombre_completo,
          d.titulo as documento_titulo
        FROM comentarios c
        LEFT JOIN usuarios u ON c.usuario_id = u.id
        LEFT JOIN documentos d ON c.documento_id = d.id
        WHERE c.comentario LIKE ? AND (c.estado = 'activo' OR c.estado IS NULL)
      `;
      
      const params = [`%${termino}%`];
      
      if (documento_id) {
        query += ' AND c.documento_id = ?';
        params.push(documento_id);
      }
      
      query += ` ORDER BY c.created_at DESC LIMIT ?`;
      params.push(limite);
      
      sql.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

export default ComentariosModel;