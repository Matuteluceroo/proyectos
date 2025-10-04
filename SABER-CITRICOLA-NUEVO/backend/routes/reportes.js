// 📊 reportes.js - Rutas para reportes y estadísticas del administrador
import express from 'express';
import { 
  obtenerReportesCompletos, 
  exportarReporte, 
  obtenerMetricasEnTiempoReal 
} from '../controllers/reportes.js';

const router = express.Router();

// 🧪 Ruta de prueba para verificar que las rutas de reportes funcionan
router.get('/test', (req, res) => {
  res.json({ 
    mensaje: '✅ Las rutas de reportes están funcionando!',
    timestamp: new Date().toISOString()
  });
});

// 📈 GET /api/reportes - Obtener reporte completo del sistema
router.get('/', obtenerReportesCompletos);

// 📥 GET /api/reportes/exportar/:tipo - Exportar reporte específico
router.get('/exportar/:tipo', exportarReporte);

// 📊 GET /api/reportes/metricas-tiempo-real - Métricas en tiempo real
router.get('/metricas-tiempo-real', obtenerMetricasEnTiempoReal);

export default router;