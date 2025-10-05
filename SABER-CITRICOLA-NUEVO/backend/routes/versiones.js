// 📚 versiones.js - Rutas para manejo de versiones de documentos
import express from 'express';
import VersionesController from '../controllers/versiones.js';
import { authMiddleware } from '../middleware/jwt.js';

const router = express.Router();

// 🔐 Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// 📄 CRUD de versiones

// Crear nueva versión de un documento
router.post('/documento/:documentoId/version', VersionesController.crearVersion);

// Obtener historial de versiones de un documento
router.get('/documento/:documentoId/historial', VersionesController.obtenerHistorial);

// Obtener versiones filtradas de un documento
router.get('/documento/:documentoId/versiones', VersionesController.obtenerVersionesFiltradas);

// Obtener estadísticas de versiones de un documento
router.get('/documento/:documentoId/estadisticas', VersionesController.obtenerEstadisticas);

// Obtener versión específica por ID
router.get('/version/:versionId', VersionesController.obtenerVersion);

// 🔄 Comparación de versiones

// Comparar dos versiones (análisis completo)
router.get('/comparar/:versionOrigenId/:versionDestinoId', VersionesController.compararVersiones);

// Obtener diferencias rápidas entre versiones
router.get('/diferencias/:versionOrigenId/:versionDestinoId', VersionesController.obtenerDiferenciasRapidas);

// 🔙 Restauración de versiones

// Restaurar versión específica (requiere permisos especiales)
router.post('/documento/:documentoId/restaurar/:versionId', VersionesController.restaurarVersion);

// 🏷️ Gestión de etiquetas

// Agregar etiqueta a versión
router.post('/version/:versionId/etiqueta', VersionesController.agregarEtiqueta);

// 📊 Rutas adicionales de consulta

// Obtener todas las comparaciones realizadas de un documento
router.get('/documento/:documentoId/comparaciones', async (req, res) => {
  try {
    const { documentoId } = req.params;
    
    const sql = `
      SELECT 
        c.*,
        vo.numero_version as version_origen_numero,
        vd.numero_version as version_destino_numero,
        u.nombre as usuario_nombre
      FROM comparaciones_versiones c
      LEFT JOIN versiones_documentos vo ON c.version_origen_id = vo.id
      LEFT JOIN versiones_documentos vd ON c.version_destino_id = vd.id
      LEFT JOIN usuarios u ON c.usuario_solicitante_id = u.id
      WHERE vo.documento_id = ? OR vd.documento_id = ?
      ORDER BY c.fecha_solicitud DESC
      LIMIT 20
    `;

    const comparaciones = db.prepare(sql).all(documentoId, documentoId);

    res.json({
      success: true,
      data: comparaciones,
      message: 'Comparaciones obtenidas exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener comparaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener comparaciones',
      error: error.message
    });
  }
});

// Obtener todas las restauraciones realizadas de un documento
router.get('/documento/:documentoId/restauraciones', async (req, res) => {
  try {
    const { documentoId } = req.params;
    
    const sql = `
      SELECT 
        r.*,
        vr.numero_version as version_restaurada_numero,
        va.numero_version as version_anterior_numero,
        u.nombre as usuario_nombre
      FROM restauraciones_versiones r
      LEFT JOIN versiones_documentos vr ON r.version_restaurada_id = vr.id
      LEFT JOIN versiones_documentos va ON r.version_anterior_id = va.id
      LEFT JOIN usuarios u ON r.usuario_id = u.id
      WHERE r.documento_id = ?
      ORDER BY r.fecha_restauracion DESC
      LIMIT 10
    `;

    const restauraciones = db.prepare(sql).all(documentoId);

    res.json({
      success: true,
      data: restauraciones,
      message: 'Restauraciones obtenidas exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener restauraciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener restauraciones',
      error: error.message
    });
  }
});

// Obtener resumen de actividad de versiones
router.get('/documento/:documentoId/actividad', async (req, res) => {
  try {
    const { documentoId } = req.params;
    const { dias = 30 } = req.query;
    
    const sql = `
      SELECT 
        DATE(v.fecha_creacion) as fecha,
        COUNT(*) as versiones_creadas,
        COUNT(DISTINCT v.usuario_id) as editores_unicos,
        GROUP_CONCAT(DISTINCT u.nombre) as editores,
        COUNT(CASE WHEN v.tipo_cambio = 'edicion' THEN 1 END) as ediciones,
        COUNT(CASE WHEN v.tipo_cambio = 'restauracion' THEN 1 END) as restauraciones
      FROM versiones_documentos v
      LEFT JOIN usuarios u ON v.usuario_id = u.id
      WHERE v.documento_id = ? 
      AND v.fecha_creacion >= datetime('now', '-' || ? || ' days')
      GROUP BY DATE(v.fecha_creacion)
      ORDER BY fecha DESC
    `;

    const actividad = db.prepare(sql).all(documentoId, parseInt(dias));

    res.json({
      success: true,
      data: actividad,
      periodo_dias: parseInt(dias),
      message: 'Actividad obtenida exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad',
      error: error.message
    });
  }
});

// Obtener métricas globales de versiones
router.get('/metricas/globales', async (req, res) => {
  try {
    // Solo administradores pueden ver métricas globales
    if (req.usuario.rol !== 'administrador') {
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para ver métricas globales'
      });
    }

    const sql = `
      SELECT 
        COUNT(DISTINCT v.documento_id) as documentos_con_versiones,
        COUNT(*) as total_versiones,
        COUNT(DISTINCT v.usuario_id) as editores_totales,
        AVG(v.tamano_contenido) as promedio_tamano_contenido,
        COUNT(CASE WHEN v.tipo_cambio = 'restauracion' THEN 1 END) as total_restauraciones,
        COUNT(c.id) as total_comparaciones,
        COUNT(e.id) as total_etiquetas
      FROM versiones_documentos v
      LEFT JOIN comparaciones_versiones c ON v.id = c.version_origen_id OR v.id = c.version_destino_id
      LEFT JOIN etiquetas_versiones e ON v.id = e.version_id
      WHERE v.fecha_creacion >= datetime('now', '-30 days')
    `;

    const metricas = db.prepare(sql).get();

    res.json({
      success: true,
      data: metricas,
      periodo: 'Últimos 30 días',
      message: 'Métricas globales obtenidas exitosamente'
    });

  } catch (error) {
    console.error('❌ Error al obtener métricas globales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener métricas globales',
      error: error.message
    });
  }
});

export default router;