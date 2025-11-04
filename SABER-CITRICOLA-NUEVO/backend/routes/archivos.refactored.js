/**
 * 📁 ARCHIVOS ROUTES - Rutas RESTful para gestión de archivos
 * ===========================================================
 * Refactorizado para seguir convenciones REST sin verbos en URLs.
 */

import express from 'express';
import {
  subirArchivo,
  subirMultiplesArchivos,
  descargarArchivo,
  eliminarArchivo,
  listarArchivos,
  obtenerInfoArchivo,
  obtenerEstadisticasArchivos
} from '../controllers/archivos.js';
import { verifyToken } from '../middleware/jwt.js';
import { validate, schemas } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sanitizeFileParams } from '../middleware/sanitizer.js';

const router = express.Router();

// ============================================================================
// 📋 RUTAS RESTFUL (sin verbos en URLs)
// ============================================================================

/**
 * GET /api/archivos
 * Listar todos los archivos con filtros y paginación
 */
router.get('/',
  validate(schemas.queryParams, 'query'),
  asyncHandler(listarArchivos)
);

/**
 * POST /api/archivos
 * Subir un nuevo archivo (antes: /subir)
 * ✅ RESTful: POST a colección crea nuevo recurso
 */
router.post('/',
  verifyToken,
  sanitizeFileParams,
  asyncHandler(subirArchivo)
);

/**
 * POST /api/archivos/batch
 * Subir múltiples archivos (antes: /subir-multiples)
 * ✅ RESTful: /batch indica operación en lote
 */
router.post('/batch',
  verifyToken,
  sanitizeFileParams,
  asyncHandler(subirMultiplesArchivos)
);

/**
 * GET /api/archivos/stats
 * Obtener estadísticas de archivos (antes: /estadisticas)
 * ✅ RESTful: Sub-recurso para estadísticas
 * NOTA: Debe ir ANTES de /:id para evitar que "stats" se interprete como ID
 */
router.get('/stats',
  asyncHandler(obtenerEstadisticasArchivos)
);

/**
 * GET /api/archivos/:id
 * Obtener información detallada de un archivo (antes: /info/:id)
 * ✅ RESTful: GET a recurso específico
 */
router.get('/:id',
  validate(schemas.idParam, 'params'),
  asyncHandler(obtenerInfoArchivo)
);

/**
 * GET /api/archivos/:id/download
 * Descargar archivo (antes: /descargar/:id)
 * ✅ RESTful: Sub-recurso /download para acción de descarga
 * ALTERNATIVA: También válido usar header Accept: application/octet-stream
 */
router.get('/:id/download',
  validate(schemas.idParam, 'params'),
  asyncHandler(descargarArchivo)
);

/**
 * DELETE /api/archivos/:id
 * Eliminar un archivo
 * ✅ RESTful: DELETE a recurso específico
 */
router.delete('/:id',
  verifyToken,
  validate(schemas.idParam, 'params'),
  asyncHandler(eliminarArchivo)
);

// ============================================================================
// 📊 HEALTH CHECK
// ============================================================================

/**
 * GET /api/archivos/health
 * Verificar estado del servicio de archivos
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'archivos',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default router;

