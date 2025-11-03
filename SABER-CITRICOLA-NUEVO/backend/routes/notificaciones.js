// 🔔 notificaciones.js - Rutas para manejo de notificaciones push e internas
import express from 'express';
import NotificacionesController from '../controllers/notificaciones.js';
import { authMiddleware, devBypassAuth } from '../middleware/jwt.js';

const router = express.Router();

// 🔐 Aplicar autenticación a todas las rutas (temporalmente usar devBypassAuth para debugging)
// router.use(authMiddleware);
router.use(devBypassAuth); // 🧪 TEMPORAL: Para debugging - cambiar por authMiddleware en producción

// 📋 CRUD de notificaciones

// Obtener notificaciones del usuario autenticado
router.get('/mis-notificaciones', NotificacionesController.obtenerNotificaciones);

// Obtener estadísticas de notificaciones del usuario
router.get('/estadisticas', NotificacionesController.obtenerEstadisticas);

// Marcar notificación específica como leída
router.put('/:notificacionId/marcar-leida', NotificacionesController.marcarComoLeida);

// Marcar todas las notificaciones como leídas
router.put('/marcar-todas-leidas', NotificacionesController.marcarTodasComoLeidas);

// Eliminar notificación específica
router.delete('/:notificacionId', NotificacionesController.eliminarNotificacion);

// 📱 Gestión de suscripciones push

// Crear suscripción push para el usuario actual
router.post('/suscripcion-push', NotificacionesController.crearSuscripcionPush);

// Obtener suscripciones push del usuario actual
router.get('/suscripciones-push', NotificacionesController.obtenerSuscripcionesPush);

// 🔔 Creación de notificaciones (solo administradores)

// Crear notificación manual
router.post('/crear', NotificacionesController.crearNotificacion);

// Crear notificación desde plantilla
router.post('/crear-desde-plantilla', NotificacionesController.crearDesdePlantilla);

// 🧹 Administración (solo administradores)

// Limpiar notificaciones antiguas
router.post('/limpiar-antiguas', NotificacionesController.limpiarNotificacionesAntiguas);

// 📊 Rutas de consulta y estadísticas adicionales

// Obtener todas las plantillas disponibles
router.get('/plantillas', async (req, res) => {
  try {
    // Solo administradores pueden ver todas las plantillas
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver las plantillas'
      });
    }

    const sql = `
      SELECT 
        codigo, nombre, descripcion, categoria, titulo_template, mensaje_template,
        icono_default, tipo_default, activa, fecha_creacion
      FROM plantillas_notificaciones 
      ORDER BY categoria, nombre
    `;

    const plantillas = db.prepare(sql).all();

    res.json({
      success: true,
      data: plantillas,
      message: 'Plantillas obtenidas exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener plantillas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener plantillas',
      error: error.message
    });
  }
});

// Obtener estadísticas globales de notificaciones (solo administradores)
router.get('/estadisticas-globales', async (req, res) => {
  try {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver estadísticas globales'
      });
    }

    const { dias = 30 } = req.query;

    const sql = `
      SELECT 
        COUNT(*) as total_notificaciones,
        COUNT(CASE WHEN leida = 1 THEN 1 END) as total_leidas,
        COUNT(CASE WHEN enviada_push = 1 THEN 1 END) as total_push_enviadas,
        COUNT(DISTINCT usuario_destinatario_id) as usuarios_notificados,
        COUNT(CASE WHEN tipo = 'info' THEN 1 END) as tipo_info,
        COUNT(CASE WHEN tipo = 'success' THEN 1 END) as tipo_success,
        COUNT(CASE WHEN tipo = 'warning' THEN 1 END) as tipo_warning,
        COUNT(CASE WHEN tipo = 'error' THEN 1 END) as tipo_error,
        COUNT(CASE WHEN categoria = 'comentarios' THEN 1 END) as categoria_comentarios,
        COUNT(CASE WHEN categoria = 'versiones' THEN 1 END) as categoria_versiones,
        COUNT(CASE WHEN categoria = 'documentos' THEN 1 END) as categoria_documentos,
        ROUND(AVG(CASE WHEN leida = 1 THEN 1.0 ELSE 0.0 END) * 100, 2) as tasa_lectura,
        (SELECT COUNT(*) FROM suscripciones_push WHERE activa = 1) as suscripciones_activas
      FROM notificaciones 
      WHERE fecha_creacion >= datetime('now', '-' || ? || ' days')
      AND estado = 'activa'
    `;

    const estadisticas = db.prepare(sql).get(parseInt(dias));

    // Obtener estadísticas por día
    const sqlPorDia = `
      SELECT 
        DATE(fecha_creacion) as fecha,
        COUNT(*) as total_dia,
        COUNT(CASE WHEN leida = 1 THEN 1 END) as leidas_dia,
        COUNT(CASE WHEN enviada_push = 1 THEN 1 END) as push_dia
      FROM notificaciones 
      WHERE fecha_creacion >= datetime('now', '-' || ? || ' days')
      AND estado = 'activa'
      GROUP BY DATE(fecha_creacion)
      ORDER BY fecha DESC
    `;

    const estadisticasPorDia = db.prepare(sqlPorDia).all(parseInt(dias));

    res.json({
      success: true,
      data: {
        resumen: estadisticas,
        por_dia: estadisticasPorDia,
        periodo_dias: parseInt(dias)
      },
      message: 'Estadísticas globales obtenidas exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas globales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas globales',
      error: error.message
    });
  }
});

// Obtener notificaciones no leídas (para polling)
router.get('/no-leidas', async (req, res) => {
  try {
    const usuarioId = req.user.id;

    const sql = `
      SELECT 
        n.*,
        ue.nombre as emisor_nombre
      FROM notificaciones n
      LEFT JOIN usuarios ue ON n.usuario_emisor_id = ue.id
      WHERE n.usuario_destinatario_id = ? 
      AND n.leida = 0 
      AND n.estado = 'activa'
      ORDER BY n.fecha_creacion DESC
      LIMIT 10
    `;

    const notificaciones = db.prepare(sql).all(usuarioId);

    // Procesar datos adicionales JSON
    notificaciones.forEach(notif => {
      try {
        notif.datos_adicionales = JSON.parse(notif.datos_adicionales || '{}');
      } catch (e) {
        notif.datos_adicionales = {};
      }
    });

    res.json({
      success: true,
      data: notificaciones,
      total: notificaciones.length,
      message: 'Notificaciones no leídas obtenidas exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener notificaciones no leídas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener notificaciones no leídas',
      error: error.message
    });
  }
});

// Obtener configuración de notificaciones del usuario
router.get('/configuracion', async (req, res) => {
  try {
    const usuarioId = req.user.id;

    // Obtener suscripciones activas
    const suscripciones = await NotificacionesController.obtenerSuscripcionesPush({ usuario: { id: usuarioId } }, res);
    
    // Por simplicidad, devolvemos configuración básica
    // En una implementación completa, tendrías una tabla de configuración por usuario
    const configuracion = {
      notificaciones_push_habilitadas: true,
      notificaciones_email_habilitadas: false,
      tipos_habilitados: ['info', 'success', 'warning', 'error'],
      categorias_habilitadas: ['comentarios', 'versiones', 'documentos', 'sistema'],
      horario_habilitado: true,
      hora_inicio: '09:00',
      hora_fin: '18:00',
      dias_habilitados: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes']
    };

    res.json({
      success: true,
      data: configuracion,
      message: 'Configuración obtenida exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener configuración',
      error: error.message
    });
  }
});

// Probar envío de notificación push (para debugging)
router.post('/test-push', async (req, res) => {
  try {
    if (req.user.rol !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para enviar notificaciones de prueba'
      });
    }

    const usuarioId = req.user.id;
    const { mensaje = 'Notificación de prueba' } = req.body;

    // Crear notificación de prueba
    const resultado = await NotificacionesModel.crearNotificacion({
      usuario_destinatario_id: usuarioId,
      usuario_emisor_id: usuarioId,
      titulo: 'Prueba de Notificación Push',
      mensaje,
      tipo: 'info',
      categoria: 'sistema',
      icono: '🧪',
      enviar_push: 1,
      prioridad: 'normal'
    });

    res.json({
      success: true,
      data: resultado.data,
      message: 'Notificación de prueba enviada'
    });

  } catch (error) {
    console.error('❌ Error al enviar notificación de prueba:', error);
    res.status(500).json({
      success: false,
      message: 'Error al enviar notificación de prueba',
      error: error.message
    });
  }
});

export default router;