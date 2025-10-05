// 🔔 models/notificaciones.js - Modelo para manejo de notificaciones push e internas
import sqlite3 from 'sqlite3';

const sql = new sqlite3.Database('./saber_citricola.db');

export class NotificacionesModel {

  // 🔔 Crear nueva notificación
  static async crearNotificacion(datosNotificacion) {
    return new Promise((resolve, reject) => {
      const {
        usuario_destinatario_id,
        usuario_emisor_id = null,
        titulo,
        mensaje,
        tipo = 'info',
        categoria = 'general',
        datos_adicionales = '{}',
        url_accion = null,
        icono = '🔔',
        prioridad = 'normal',
        fecha_expiracion = null
      } = datosNotificacion;

      const insertSql = `
        INSERT INTO notificaciones (
          usuario_destinatario_id, usuario_emisor_id, titulo, mensaje,
          tipo, categoria, datos_adicionales, url_accion, icono, prioridad,
          fecha_expiracion, fecha_creacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `;

      sql.run(insertSql, [
        usuario_destinatario_id, usuario_emisor_id, titulo, mensaje,
        tipo, categoria, datos_adicionales, url_accion, icono, prioridad,
        fecha_expiracion
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          id: this.lastID,
          mensaje: 'Notificación creada exitosamente'
        });
      });
    });
  }

  // 📖 Obtener notificaciones de un usuario
  static async obtenerNotificacionesUsuario(usuarioId, limite = 20, offset = 0) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT 
          n.*,
          u.username as emisor_username,
          u.nombre_completo as emisor_nombre
        FROM notificaciones n
        LEFT JOIN usuarios u ON n.usuario_emisor_id = u.id
        WHERE n.usuario_destinatario_id = ? AND n.estado = 'activa'
        ORDER BY n.fecha_creacion DESC
        LIMIT ? OFFSET ?
      `;

      sql.all(query, [usuarioId, limite, offset], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }

  // ✅ Marcar notificación como leída
  static async marcarComoLeida(notificacionId, usuarioId) {
    return new Promise((resolve, reject) => {
      const updateSql = `
        UPDATE notificaciones 
        SET leida = 1, fecha_lectura = datetime('now')
        WHERE id = ? AND usuario_destinatario_id = ?
      `;

      sql.run(updateSql, [notificacionId, usuarioId], function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          success: this.changes > 0,
          mensaje: this.changes > 0 ? 'Notificación marcada como leída' : 'Notificación no encontrada'
        });
      });
    });
  }

  // ✅ Marcar todas las notificaciones como leídas
  static async marcarTodasComoLeidas(usuarioId) {
    return new Promise((resolve, reject) => {
      const updateSql = `
        UPDATE notificaciones 
        SET leida = 1, fecha_lectura = datetime('now')
        WHERE usuario_destinatario_id = ? AND leida = 0
      `;

      sql.run(updateSql, [usuarioId], function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          success: true,
          notificaciones_actualizadas: this.changes
        });
      });
    });
  }

  // 🔔 Crear suscripción push
  static async crearSuscripcionPush(datosSubscripcion) {
    return new Promise((resolve, reject) => {
      const {
        usuario_id,
        endpoint,
        p256dh_key,
        auth_key,
        dispositivo = 'unknown',
        navegador = 'unknown'
      } = datosSubscripcion;

      const insertSql = `
        INSERT OR REPLACE INTO suscripciones_push (
          usuario_id, endpoint, p256dh_key, auth_key, dispositivo, navegador,
          activa, fecha_suscripcion
        ) VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
      `;

      sql.run(insertSql, [
        usuario_id, endpoint, p256dh_key, auth_key, dispositivo, navegador
      ], function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          id: this.lastID,
          mensaje: 'Suscripción push creada exitosamente'
        });
      });
    });
  }

  // 📊 Obtener estadísticas de notificaciones
  static async obtenerEstadisticas(usuarioId = null) {
    return new Promise((resolve, reject) => {
      let query, params;

      if (usuarioId) {
        query = `
          SELECT 
            COUNT(*) as total_notificaciones,
            SUM(CASE WHEN leida = 1 THEN 1 ELSE 0 END) as leidas,
            SUM(CASE WHEN leida = 0 THEN 1 ELSE 0 END) as no_leidas,
            COUNT(DISTINCT tipo) as tipos_diferentes
          FROM notificaciones 
          WHERE usuario_destinatario_id = ? AND estado = 'activa'
        `;
        params = [usuarioId];
      } else {
        query = `
          SELECT 
            COUNT(*) as total_notificaciones,
            SUM(CASE WHEN leida = 1 THEN 1 ELSE 0 END) as leidas,
            SUM(CASE WHEN leida = 0 THEN 1 ELSE 0 END) as no_leidas,
            COUNT(DISTINCT usuario_destinatario_id) as usuarios_con_notificaciones
          FROM notificaciones 
          WHERE estado = 'activa'
        `;
        params = [];
      }

      sql.get(query, params, (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || {});
      });
    });
  }

  // 🗑️ Eliminar notificación
  static async eliminarNotificacion(notificacionId, usuarioId) {
    return new Promise((resolve, reject) => {
      const updateSql = `
        UPDATE notificaciones 
        SET estado = 'eliminada', fecha_eliminacion = datetime('now')
        WHERE id = ? AND usuario_destinatario_id = ?
      `;

      sql.run(updateSql, [notificacionId, usuarioId], function(err) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          success: this.changes > 0,
          mensaje: this.changes > 0 ? 'Notificación eliminada' : 'Notificación no encontrada'
        });
      });
    });
  }

  // 📋 Obtener plantillas de notificaciones
  static async obtenerPlantillas() {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT * FROM plantillas_notificaciones 
        WHERE activa = 1 
        ORDER BY categoria, nombre
      `;

      sql.all(query, [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows || []);
      });
    });
  }

  // 🎯 Enviar notificación usando plantilla
  static async enviarConPlantilla(codigoPlantilla, usuarioDestinatarioId, variables = {}) {
    return new Promise((resolve, reject) => {
      // Obtener plantilla
      const queryPlantilla = `
        SELECT * FROM plantillas_notificaciones 
        WHERE codigo = ? AND activa = 1
      `;

      sql.get(queryPlantilla, [codigoPlantilla], (err, plantilla) => {
        if (err) {
          reject(err);
          return;
        }

        if (!plantilla) {
          reject(new Error('Plantilla no encontrada'));
          return;
        }

        // Procesar plantilla con variables
        let titulo = plantilla.titulo_template;
        let mensaje = plantilla.mensaje_template;

        Object.keys(variables).forEach(variable => {
          const placeholder = `{{${variable}}}`;
          titulo = titulo.replace(new RegExp(placeholder, 'g'), variables[variable]);
          mensaje = mensaje.replace(new RegExp(placeholder, 'g'), variables[variable]);
        });

        // Crear notificación
        const datosNotificacion = {
          usuario_destinatario_id: usuarioDestinatarioId,
          titulo: titulo,
          mensaje: mensaje,
          tipo: plantilla.tipo_default,
          categoria: plantilla.categoria,
          icono: plantilla.icono_default,
          datos_adicionales: JSON.stringify(variables)
        };

        this.crearNotificacion(datosNotificacion)
          .then(resolve)
          .catch(reject);
      });
    });
  }
}

export default NotificacionesModel;