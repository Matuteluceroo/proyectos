// 💬 routes/comentarios.js - Rutas para gestión de comentarios
import express from 'express';
import { ComentariosController } from '../controllers/comentarios.js';
import { authMiddleware } from '../middleware/jwt.js';

const router = express.Router();

// 🧪 Ruta de prueba
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rutas de comentarios funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// 📝 POST /api/comentarios - Crear nuevo comentario
router.post('/', authMiddleware, ComentariosController.crear);

// 📖 GET /api/comentarios/documento/:documento_id - Obtener comentarios de un documento
router.get('/documento/:documento_id', ComentariosController.obtenerPorDocumento);

// 📖 GET /api/comentarios/:id - Obtener comentario específico
router.get('/:id', ComentariosController.obtenerPorId);

// ✏️ PUT /api/comentarios/:id - Actualizar comentario
router.put('/:id', authMiddleware, ComentariosController.actualizar);

// 🗑️ DELETE /api/comentarios/:id - Eliminar comentario
router.delete('/:id', authMiddleware, ComentariosController.eliminar);

// 👍 POST /api/comentarios/:id/reaccion - Reaccionar a comentario
router.post('/:id/reaccion', authMiddleware, ComentariosController.reaccionar);

// 🚫 POST /api/comentarios/:id/reportar - Reportar comentario
router.post('/:id/reportar', authMiddleware, ComentariosController.reportar);

// 📊 GET /api/comentarios/estadisticas/:documento_id - Estadísticas de comentarios
router.get('/estadisticas/:documento_id', ComentariosController.obtenerEstadisticas);

// 🔄 POST /api/comentarios/estadisticas/:documento_id/actualizar - Actualizar estadísticas
router.post('/estadisticas/:documento_id/actualizar', authMiddleware, ComentariosController.actualizarEstadisticas);

// 🔍 GET /api/comentarios/buscar - Buscar comentarios
router.get('/buscar', ComentariosController.buscar);

export default router;