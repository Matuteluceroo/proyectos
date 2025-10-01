// 📁 routes/archivos.js - Rutas para gestión de archivos
import express from 'express';
import sqlite3 from 'sqlite3';
import {
  subirArchivo,
  subirMultiplesArchivos,
  descargarArchivo,
  eliminarArchivo,
  listarArchivos
} from '../controllers/archivos.js';
// import { requireAuth, requireRole } from '../middleware/auth.js'; // TODO: Implementar después

const router = express.Router();
const sql = new sqlite3.Database('./saber_citricola.db');

// 📤 POST /api/archivos/subir - Subir un archivo
router.post('/subir', subirArchivo);

// 📤 POST /api/archivos/subir-multiples - Subir múltiples archivos
router.post('/subir-multiples', subirMultiplesArchivos);

// 📥 GET /api/archivos/descargar/:id - Descargar archivo por ID
router.get('/descargar/:id', descargarArchivo);

// 📋 GET /api/archivos - Listar archivos con filtros
router.get('/', listarArchivos);

// 🗑️ DELETE /api/archivos/:id - Eliminar archivo
router.delete('/:id', eliminarArchivo);

// 📁 GET /api/archivos/info/:id - Información del archivo
router.get('/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        d.*,
        c.nombre as categoria_nombre,
        u.nombre_completo as autor_nombre
      FROM documentos d
      LEFT JOIN categorias c ON d.categoria_id = c.id
      LEFT JOIN usuarios u ON d.autor_id = u.id
      WHERE d.id = ? AND d.archivo_ruta IS NOT NULL
    `;
    
    sql.get(query, [id], (err, documento) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error consultando archivo',
          error: err.message
        });
      }

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado'
        });
      }

      res.json({
        success: true,
        data: documento
      });
    });

  } catch (error) {
    console.error('Error obteniendo info del archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

// 📊 GET /api/archivos/estadisticas - Estadísticas de archivos
router.get('/estadisticas', async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_archivos,
        COUNT(CASE WHEN archivo_tipo_mime LIKE 'image/%' THEN 1 END) as imagenes,
        COUNT(CASE WHEN archivo_tipo_mime = 'application/pdf' THEN 1 END) as pdfs,
        COUNT(CASE WHEN archivo_tipo_mime LIKE 'video/%' THEN 1 END) as videos,
        SUM(archivo_size) as tamano_total,
        AVG(archivo_size) as tamano_promedio,
        MAX(created_at) as ultimo_archivo
      FROM documentos 
      WHERE archivo_ruta IS NOT NULL
    `;
    
    sql.get(query, [], (err, stats) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo estadísticas',
          error: err.message
        });
      }

      res.json({
        success: true,
        data: {
          ...stats,
          tamano_total_mb: stats.tamano_total ? (stats.tamano_total / 1024 / 1024).toFixed(2) : 0,
          tamano_promedio_mb: stats.tamano_promedio ? (stats.tamano_promedio / 1024 / 1024).toFixed(2) : 0
        }
      });
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

export default router;