// 🛤️ routes/documentos.js - Rutas para CRUD de documentos
import express from 'express';
import multer from 'multer';
import {
  obtenerDocumentos,
  obtenerDocumentoPorId,
  crearDocumento,
  actualizarDocumento,
  eliminarDocumento,
  obtenerEstadisticas,
  crearConArchivo
} from '../controllers/documentos.js';
import { authMiddleware, devBypassAuth } from '../middleware/jwt.js';

const router = express.Router();

// 📁 Configuración de multer para subida de archivos
const upload = multer({ dest: 'uploads/tmp' });

// 🧪 Ruta de prueba para verificar que funciona
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Rutas de documentos funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// 📋 GET /api/documentos - Obtener documentos con filtros y paginación
router.get('/', obtenerDocumentos);

// 📊 GET /api/documentos/estadisticas - Estadísticas de documentos
router.get('/estadisticas', obtenerEstadisticas);

// 📄 GET /api/documentos/:id - Obtener documento por ID
router.get('/:id', obtenerDocumentoPorId);

// ✅ POST /api/documentos - Crear nuevo documento (requiere auth)
// Para desarrollo, puedes cambiar authMiddleware por devBypassAuth
router.post('/', devBypassAuth, crearDocumento);

// 📁 POST /api/documentos/upload - Subir documento con archivo
router.post('/upload', devBypassAuth, upload.single('archivo'), crearConArchivo);

// ✏️ PUT /api/documentos/:id - Actualizar documento (requiere auth)
router.put('/:id', devBypassAuth, actualizarDocumento);

// 🗑️ DELETE /api/documentos/:id - Eliminar documento (requiere auth)
router.delete('/:id', devBypassAuth, eliminarDocumento);

export default router;