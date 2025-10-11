const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth.middleware');
const reportesController = require('../controllers/reportes.controller');

// Obtener estadísticas generales
router.get('/estadisticas', auth, isAdmin, reportesController.getEstadisticas);

// Obtener reporte de usuarios
router.get('/usuarios', auth, isAdmin, reportesController.getReporteUsuarios);

// Obtener reporte de documentos
router.get('/documentos', auth, isAdmin, reportesController.getReporteDocumentos);

// Obtener reporte de actividad
router.get('/actividad', auth, isAdmin, reportesController.getReporteActividad);

// Exportar reporte en formato específico
router.post('/exportar/:tipo', auth, isAdmin, reportesController.exportarReporte);

// Obtener historial de acceso a documentos
router.get('/historial-documentos', auth, isAdmin, reportesController.getHistorialDocumentos);

module.exports = router;
