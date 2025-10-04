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

// 🧪 Ruta de prueba específica para debug de usuarios
router.get('/test-usuarios', async (req, res) => {
  try {
    const { obtenerTodosUsuarios } = await import('../database-citricola.js');
    
    const usuarios = await new Promise((resolve, reject) => {
      obtenerTodosUsuarios((err, rows) => {
        if (err) {
          console.error('❌ Error al obtener usuarios:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
    
    res.json({
      mensaje: '✅ Test de usuarios exitoso',
      usuariosEncontrados: usuarios.length,
      usuarios: usuarios,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error en test de usuarios',
      detalle: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 📈 GET /api/reportes - Obtener reporte completo del sistema
router.get('/', obtenerReportesCompletos);

// 📥 GET /api/reportes/exportar/:tipo - Exportar reporte específico
router.get('/exportar/:tipo', exportarReporte);

// 📊 GET /api/reportes/metricas-tiempo-real - Métricas en tiempo real
router.get('/metricas-tiempo-real', obtenerMetricasEnTiempoReal);

export default router;