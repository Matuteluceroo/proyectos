// ⚡ guiasRapidas.js - Rutas para guías rápidas
import express from 'express';
import {
    obtenerGuiasRapidas,
    buscarGuiasRapidas,
    obtenerCategoriasGuias,
    marcarGuiaComoConsultada,
    marcarGuiaComoFavorita,
    obtenerEstadisticasGuias,
    obtenerGuiaPorId
} from '../controllers/guiasRapidas.js';

const router = express.Router();

// 🧪 Ruta de prueba para verificar que las rutas de guías rápidas funcionan
router.get('/test', (req, res) => {
    res.json({
        mensaje: '✅ Las rutas de guías rápidas están funcionando!',
        timestamp: new Date().toISOString(),
        rutas_disponibles: [
            'GET /api/guias-rapidas - Obtener todas las guías',
            'GET /api/guias-rapidas/buscar - Buscar guías',
            'GET /api/guias-rapidas/categorias - Obtener categorías',
            'GET /api/guias-rapidas/estadisticas - Obtener estadísticas',
            'GET /api/guias-rapidas/:id - Obtener guía por ID',
            'POST /api/guias-rapidas/:id/consultar - Marcar como consultada',
            'POST /api/guias-rapidas/:id/favorita - Marcar como favorita'
        ]
    });
});

// ⚡ GET /api/guias-rapidas - Obtener todas las guías rápidas
router.get('/', obtenerGuiasRapidas);

// 🔍 GET /api/guias-rapidas/buscar - Buscar guías rápidas
router.get('/buscar', buscarGuiasRapidas);

// 📂 GET /api/guias-rapidas/categorias - Obtener categorías de guías
router.get('/categorias', obtenerCategoriasGuias);

// 📊 GET /api/guias-rapidas/estadisticas - Obtener estadísticas de guías
router.get('/estadisticas', obtenerEstadisticasGuias);

// 📋 GET /api/guias-rapidas/:id - Obtener guía específica por ID
router.get('/:id', obtenerGuiaPorId);

// 👁️ POST /api/guias-rapidas/:id/consultar - Marcar guía como consultada
router.post('/:id/consultar', marcarGuiaComoConsultada);

// ⭐ POST /api/guias-rapidas/:id/favorita - Marcar guía como favorita
router.post('/:id/favorita', marcarGuiaComoFavorita);

export default router;