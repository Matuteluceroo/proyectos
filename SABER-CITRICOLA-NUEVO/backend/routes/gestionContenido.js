// 📚 gestionContenido.js - Rutas para gestión de categorías y documentos
import express from 'express';
import { 
  // Categorías
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  // Documentos
  obtenerDocumentos,
  obtenerDocumentoPorId,
  actualizarDocumento,
  eliminarDocumento,
  cambiarEstadoDocumento,
  // Estadísticas
  obtenerEstadisticasContenido,
  obtenerDocumentosRecientes
} from '../controllers/gestionContenido.js';

const router = express.Router();

// 🧪 Ruta de prueba para verificar que las rutas de gestión de contenido funcionan
router.get('/test', (req, res) => {
  res.json({ 
    mensaje: '✅ Las rutas de gestión de contenido están funcionando!',
    timestamp: new Date().toISOString()
  });
});

// 📁 RUTAS DE CATEGORÍAS

// GET /api/categorias - Obtener todas las categorías
router.get('/categorias', obtenerCategorias);

// POST /api/categorias - Crear nueva categoría
router.post('/categorias', crearCategoria);

// PUT /api/categorias/:id - Actualizar categoría
router.put('/categorias/:id', actualizarCategoria);

// DELETE /api/categorias/:id - Eliminar categoría
router.delete('/categorias/:id', eliminarCategoria);

// 📄 RUTAS DE DOCUMENTOS

// GET /api/documentos - Obtener todos los documentos (con filtros opcionales)
router.get('/documentos', obtenerDocumentos);

// GET /api/documentos/recientes - Obtener documentos recientes
router.get('/documentos/recientes', obtenerDocumentosRecientes);

// GET /api/documentos/:id - Obtener documento por ID
router.get('/documentos/:id', obtenerDocumentoPorId);

// PUT /api/documentos/:id - Actualizar documento
router.put('/documentos/:id', actualizarDocumento);

// DELETE /api/documentos/:id - Eliminar documento
router.delete('/documentos/:id', eliminarDocumento);

// PATCH /api/documentos/:id/estado - Cambiar estado de documento
router.patch('/documentos/:id/estado', cambiarEstadoDocumento);

// 📊 RUTAS DE ESTADÍSTICAS

// GET /api/contenido/estadisticas - Obtener estadísticas de contenido
router.get('/estadisticas', obtenerEstadisticasContenido);

export default router;