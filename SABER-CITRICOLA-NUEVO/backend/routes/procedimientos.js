// 📋 procedimientos.js - Rutas para procedimientos paso a paso
import express from 'express';
import {
    obtenerProcedimientos,
    buscarProcedimientos,
    obtenerCategoriasProcedimientos,
    marcarPasoComoCompletado,
    obtenerProgresProcedimiento,
    guardarComentarioProcedimiento,
    obtenerProcedimientoPorId,
    obtenerEstadisticasProcedimientos,
    reiniciarProgresoProcedimiento
} from '../controllers/procedimientos.js';

const router = express.Router();

// 🧪 Ruta de prueba para verificar que las rutas de procedimientos funcionan
router.get('/test', (req, res) => {
    res.json({
        mensaje: '✅ Las rutas de procedimientos están funcionando!',
        timestamp: new Date().toISOString(),
        rutas_disponibles: [
            'GET /api/procedimientos - Obtener todos los procedimientos',
            'GET /api/procedimientos/buscar - Buscar procedimientos',
            'GET /api/procedimientos/categorias - Obtener categorías',
            'GET /api/procedimientos/estadisticas - Obtener estadísticas',
            'GET /api/procedimientos/:id - Obtener procedimiento por ID',
            'GET /api/procedimientos/:id/progreso - Obtener progreso',
            'POST /api/procedimientos/:id/pasos/:pasoIndex/completar - Marcar paso completado',
            'POST /api/procedimientos/:id/pasos/:pasoIndex/comentario - Guardar comentario',
            'POST /api/procedimientos/:id/reiniciar - Reiniciar progreso'
        ]
    });
});

// 📋 GET /api/procedimientos - Obtener todos los procedimientos
router.get('/', obtenerProcedimientos);

// 🔍 GET /api/procedimientos/buscar - Buscar procedimientos
router.get('/buscar', buscarProcedimientos);

// 📂 GET /api/procedimientos/categorias - Obtener categorías de procedimientos
router.get('/categorias', obtenerCategoriasProcedimientos);

// 📊 GET /api/procedimientos/estadisticas - Obtener estadísticas de procedimientos
router.get('/estadisticas', obtenerEstadisticasProcedimientos);

// 📋 GET /api/procedimientos/:id - Obtener procedimiento específico por ID
router.get('/:id', obtenerProcedimientoPorId);

// 📊 GET /api/procedimientos/:id/progreso - Obtener progreso de procedimiento
router.get('/:procedimientoId/progreso', obtenerProgresProcedimiento);

// ✅ POST /api/procedimientos/:id/pasos/:pasoIndex/completar - Marcar paso como completado
router.post('/:procedimientoId/pasos/:pasoIndex/completar', marcarPasoComoCompletado);

// 💬 POST /api/procedimientos/:id/pasos/:pasoIndex/comentario - Guardar comentario de paso
router.post('/:procedimientoId/pasos/:pasoIndex/comentario', guardarComentarioProcedimiento);

// 🔄 POST /api/procedimientos/:id/reiniciar - Reiniciar progreso de procedimiento
router.post('/:procedimientoId/reiniciar', reiniciarProgresoProcedimiento);

export default router;