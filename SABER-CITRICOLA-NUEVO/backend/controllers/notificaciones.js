// 🔔 NotificacionesController.js - Controlador para manejo de notificaciones
import NotificacionesModel from '../models/notificaciones.js';

// 🛠️ Helper function para obtener datos del usuario autenticado
const getUsuarioData = (req) => {
  const usuario = req.user || req.user;
  return {
    id: usuario?.id,
    rol: usuario?.rol || usuario?.role
  };
};

class NotificacionesController {

  // 📋 Obtener notificaciones del usuario autenticado
  static async obtenerNotificaciones(req, res) {
    try {
      const { id: usuarioId } = getUsuarioData(req);
      
      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido',
          error: 'No se pudo obtener el ID del usuario autenticado'
        });
      }

      const { 
        limite = 50, 
        offset = 0, 
        tipo, 
        categoria, 
        leida,
        fecha_desde 
      } = req.query;

      const filtros = {};
      if (tipo) filtros.tipo = tipo;
      if (categoria) filtros.categoria = categoria;
      if (leida !== undefined) filtros.leida = leida === 'true';
      if (fecha_desde) filtros.fecha_desde = fecha_desde;

      const resultado = await NotificacionesModel.obtenerNotificacionesUsuario(
        usuarioId,
        parseInt(limite),
        parseInt(offset),
        filtros
      );

      res.json({
        success: true,
        data: resultado.data,
        total: resultado.total,
        filtros_aplicados: filtros,
        message: 'Notificaciones obtenidas exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en obtenerNotificaciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener notificaciones',
        error: error.message
      });
    }
  }

  // ✅ Marcar notificación como leída
  static async marcarComoLeida(req, res) {
    try {
      const { notificacionId } = req.params;
      const { id: usuarioId } = getUsuarioData(req);

      if (!usuarioId) {
        return res.status(400).json({
          success: false,
          message: 'ID de usuario requerido'
        });
      }

      const resultado = await NotificacionesModel.marcarComoLeida(
        parseInt(notificacionId),
        usuarioId
      );

      if (resultado.success) {
        res.json({
          success: true,
          message: 'Notificación marcada como leída'
        });
      } else {
        res.status(404).json({
          success: false,
          message: resultado.message
        });
      }

    } catch (error) {
      console.error('❌ Error en marcarComoLeida:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar notificación como leída',
        error: error.message
      });
    }
  }

  // 📊 Marcar todas las notificaciones como leídas
  static async marcarTodasComoLeidas(req, res) {
    try {
      const usuarioId = req.user.id;

      const resultado = await NotificacionesModel.marcarTodasComoLeidas(usuarioId);

      res.json({
        success: true,
        data: resultado.data,
        message: resultado.message
      });

    } catch (error) {
      console.error('❌ Error en marcarTodasComoLeidas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al marcar todas las notificaciones como leídas',
        error: error.message
      });
    }
  }

  // 🗑️ Eliminar notificación
  static async eliminarNotificacion(req, res) {
    try {
      const { notificacionId } = req.params;
      const usuarioId = req.user.id;

      const resultado = await NotificacionesModel.eliminarNotificacion(
        parseInt(notificacionId),
        usuarioId
      );

      if (resultado.success) {
        res.json({
          success: true,
          message: resultado.message
        });
      } else {
        res.status(404).json({
          success: false,
          message: resultado.message
        });
      }

    } catch (error) {
      console.error('❌ Error en eliminarNotificacion:', error);
      res.status(500).json({
        success: false,
        message: 'Error al eliminar notificación',
        error: error.message
      });
    }
  }

  // 📊 Obtener estadísticas del usuario
  static async obtenerEstadisticas(req, res) {
    try {
      const usuarioId = req.user.id;

      const resultado = await NotificacionesModel.obtenerEstadisticasUsuario(usuarioId);

      res.json({
        success: true,
        data: resultado.data,
        message: 'Estadísticas obtenidas exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  // 📱 Crear suscripción push
  static async crearSuscripcionPush(req, res) {
    try {
      const usuarioId = req.user.id;
      const { subscription, deviceInfo = {} } = req.body;

      if (!subscription || !subscription.endpoint || !subscription.keys) {
        return res.status(400).json({
          success: false,
          message: 'Datos de suscripción incompletos'
        });
      }

      // Detectar información del navegador desde User-Agent
      const userAgent = req.headers['user-agent'] || '';
      const dispositivoInfo = this.analizarUserAgent(userAgent);

      const datosNavegador = {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        userAgent,
        dispositivo: deviceInfo.dispositivo || dispositivoInfo.dispositivo,
        navegador: deviceInfo.navegador || dispositivoInfo.navegador,
        so: deviceInfo.so || dispositivoInfo.so
      };

      const resultado = await NotificacionesModel.crearSuscripcionPush(
        usuarioId,
        datosNavegador
      );

      res.status(201).json({
        success: true,
        data: resultado.data,
        message: resultado.message
      });

    } catch (error) {
      console.error('❌ Error en crearSuscripcionPush:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear suscripción push',
        error: error.message
      });
    }
  }

  // 📱 Obtener suscripciones push del usuario
  static async obtenerSuscripcionesPush(req, res) {
    try {
      const usuarioId = req.user.id;

      const resultado = await NotificacionesModel.obtenerSuscripcionesUsuario(usuarioId);

      res.json({
        success: true,
        data: resultado.data,
        message: 'Suscripciones obtenidas exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en obtenerSuscripcionesPush:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener suscripciones push',
        error: error.message
      });
    }
  }

  // 🔔 Crear notificación (solo administradores)
  static async crearNotificacion(req, res) {
    try {
      // Verificar permisos
      if (req.user.rol !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para crear notificaciones'
        });
      }

      const {
        usuario_destinatario_id,
        titulo,
        mensaje,
        tipo = 'info',
        categoria = 'general',
        datos_adicionales = {},
        icono = '🔔',
        url_accion = null,
        enviar_push = true,
        prioridad = 'normal'
      } = req.body;

      // Validaciones
      if (!usuario_destinatario_id || !titulo || !mensaje) {
        return res.status(400).json({
          success: false,
          message: 'Usuario destinatario, título y mensaje son requeridos'
        });
      }

      const resultado = await NotificacionesModel.crearNotificacion({
        usuario_destinatario_id,
        usuario_emisor_id: req.user.id,
        titulo,
        mensaje,
        tipo,
        categoria,
        datos_adicionales,
        icono,
        url_accion,
        enviar_push: enviar_push ? 1 : 0,
        prioridad
      });

      res.status(201).json({
        success: true,
        data: resultado.data,
        message: 'Notificación creada y enviada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en crearNotificacion:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear notificación',
        error: error.message
      });
    }
  }

  // 📱 Crear notificación desde plantilla
  static async crearDesdePlantilla(req, res) {
    try {
      const {
        codigo_plantilla,
        usuario_destinatario_id,
        variables = {}
      } = req.body;

      // Validaciones
      if (!codigo_plantilla || !usuario_destinatario_id) {
        return res.status(400).json({
          success: false,
          message: 'Código de plantilla y usuario destinatario son requeridos'
        });
      }

      const resultado = await NotificacionesModel.crearDesdeplantilla(
        codigo_plantilla,
        usuario_destinatario_id,
        variables,
        req.user.id
      );

      res.status(201).json({
        success: true,
        data: resultado.data,
        message: 'Notificación creada desde plantilla exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en crearDesdePlantilla:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear notificación desde plantilla',
        error: error.message
      });
    }
  }

  // 🧹 Limpiar notificaciones antiguas (solo administradores)
  static async limpiarNotificacionesAntiguas(req, res) {
    try {
      // Verificar permisos
      if (req.user.rol !== 'administrador') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para limpiar notificaciones'
        });
      }

      const { dias_antiguedad = 30 } = req.body;

      const resultado = await NotificacionesModel.limpiarNotificacionesAntiguas(
        parseInt(dias_antiguedad)
      );

      res.json({
        success: true,
        data: resultado.data,
        message: resultado.message
      });

    } catch (error) {
      console.error('❌ Error en limpiarNotificacionesAntiguas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al limpiar notificaciones antiguas',
        error: error.message
      });
    }
  }

  // 🔄 Método helper para analizar User-Agent
  static analizarUserAgent(userAgent) {
    const info = {
      dispositivo: 'desktop',
      navegador: 'unknown',
      so: 'unknown'
    };

    // Detectar dispositivo
    if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
      info.dispositivo = /iPad/.test(userAgent) ? 'tablet' : 'mobile';
    }

    // Detectar navegador
    if (/Chrome/.test(userAgent) && !/Edg/.test(userAgent)) {
      info.navegador = 'Chrome';
    } else if (/Firefox/.test(userAgent)) {
      info.navegador = 'Firefox';
    } else if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) {
      info.navegador = 'Safari';
    } else if (/Edg/.test(userAgent)) {
      info.navegador = 'Edge';
    }

    // Detectar SO
    if (/Windows/.test(userAgent)) {
      info.so = 'Windows';
    } else if (/Mac/.test(userAgent)) {
      info.so = 'macOS';
    } else if (/Linux/.test(userAgent)) {
      info.so = 'Linux';
    } else if (/Android/.test(userAgent)) {
      info.so = 'Android';
    } else if (/iPhone|iPad/.test(userAgent)) {
      info.so = 'iOS';
    }

    return info;
  }

  // 📊 Crear notificaciones automáticas basadas en eventos

  // Notificación cuando alguien comenta
  static async notificarNuevoComentario(documentoId, comentarioId, autorComentarioId, contenidoComentario) {
    try {
      // Obtener información del documento
      const documento = await this.obtenerInfoDocumento(documentoId);
      if (!documento) return;

      // Obtener autor del comentario
      const autorComentario = await this.obtenerInfoUsuario(autorComentarioId);
      if (!autorComentario) return;

      // Obtener usuarios que deben ser notificados (autor del documento, otros comentaristas)
      const usuariosANotificar = await this.obtenerUsuariosANotificar(documentoId, autorComentarioId);

      // Crear notificaciones para cada usuario
      for (const usuario of usuariosANotificar) {
        const variables = {
          documento_titulo: documento.titulo,
          usuario_nombre: autorComentario.nombre,
          comentario_preview: contenidoComentario.substring(0, 100) + (contenidoComentario.length > 100 ? '...' : ''),
          documento_id: documentoId,
          comentario_id: comentarioId
        };

        await NotificacionesModel.crearDesdeplantilla(
          'nuevo_comentario',
          usuario.id,
          variables,
          autorComentarioId
        );
      }

    } catch (error) {
      console.warn('⚠️ Error al crear notificación de comentario:', error);
    }
  }

  // Notificación cuando se crea nueva versión
  static async notificarNuevaVersion(documentoId, versionId, numeroVersion, usuarioEditorId) {
    try {
      const documento = await this.obtenerInfoDocumento(documentoId);
      const editor = await this.obtenerInfoUsuario(usuarioEditorId);
      
      if (!documento || !editor) return;

      // Obtener usuarios interesados en el documento
      const usuariosInteresados = await this.obtenerUsuariosInteresadosEnDocumento(documentoId, usuarioEditorId);

      for (const usuario of usuariosInteresados) {
        const variables = {
          documento_titulo: documento.titulo,
          numero_version: numeroVersion,
          usuario_editor: editor.nombre,
          documento_id: documentoId,
          version_id: versionId
        };

        await NotificacionesModel.crearDesdeplantilla(
          'nueva_version',
          usuario.id,
          variables,
          usuarioEditorId
        );
      }

    } catch (error) {
      console.warn('⚠️ Error al crear notificación de nueva versión:', error);
    }
  }

  // Métodos auxiliares para obtener información
  static async obtenerInfoDocumento(documentoId) {
    try {
      const sql = `SELECT id, titulo, autor_id FROM documentos WHERE id = ?`;
      return db.prepare(sql).get(documentoId);
    } catch (error) {
      return null;
    }
  }

  static async obtenerInfoUsuario(usuarioId) {
    try {
      const sql = `SELECT id, nombre, email FROM usuarios WHERE id = ?`;
      return db.prepare(sql).get(usuarioId);
    } catch (error) {
      return null;
    }
  }

  static async obtenerUsuariosANotificar(documentoId, excluirUsuarioId) {
    try {
      // Obtener autor del documento y usuarios que han comentado
      const sql = `
        SELECT DISTINCT u.id, u.nombre, u.email
        FROM usuarios u
        WHERE u.id IN (
          SELECT d.autor_id FROM documentos d WHERE d.id = ?
          UNION
          SELECT c.usuario_id FROM comentarios c WHERE c.documento_id = ?
        ) AND u.id != ?
      `;
      return db.prepare(sql).all(documentoId, documentoId, excluirUsuarioId);
    } catch (error) {
      return [];
    }
  }

  static async obtenerUsuariosInteresadosEnDocumento(documentoId, excluirUsuarioId) {
    try {
      // Por simplicidad, notificar a todos los usuarios activos excepto al editor
      const sql = `
        SELECT id, nombre, email FROM usuarios 
        WHERE estado = 'activo' AND id != ?
      `;
      return db.prepare(sql).all(excluirUsuarioId);
    } catch (error) {
      return [];
    }
  }
}

export default NotificacionesController;