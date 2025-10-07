// ⚙️ configuracion.js - Rutas para configuración del sistema
import express from 'express';
import {
  obtenerConfiguracionSistema,
  actualizarConfiguracionSistema,
  reiniciarSistema,
  crearBackupSistema,
  obtenerLogsRecientes,
  obtenerInfoSistema
} from '../controllers/configuracion.js';

const router = express.Router();

// 🧪 Ruta de prueba para verificar que las rutas de configuración funcionan
router.get('/test', (req, res) => {
  res.json({
    mensaje: '✅ Las rutas de configuración están funcionando!',
    timestamp: new Date().toISOString(),
    rutas_disponibles: [
      'GET /api/configuracion - Obtener configuración',
      'PUT /api/configuracion - Actualizar configuración',
      'POST /api/configuracion/backup - Crear backup',
      'POST /api/configuracion/reiniciar - Reiniciar sistema',
      'GET /api/configuracion/logs - Obtener logs',
      'GET /api/configuracion/info - Información del sistema'
    ]
  });
});

// ⚙️ GET /api/configuracion - Obtener configuración del sistema
router.get('/', obtenerConfiguracionSistema);

// 💾 PUT /api/configuracion - Actualizar configuración del sistema
router.put('/', actualizarConfiguracionSistema);

// 🔄 POST /api/configuracion/reiniciar - Reiniciar sistema
router.post('/reiniciar', reiniciarSistema);

// 💾 POST /api/configuracion/backup - Crear backup del sistema
router.post('/backup', crearBackupSistema);

// 📋 GET /api/configuracion/logs - Obtener logs recientes
router.get('/logs', obtenerLogsRecientes);

// 📊 GET /api/configuracion/info - Obtener información del sistema
router.get('/info', obtenerInfoSistema);

export default router;