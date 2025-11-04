/**
 * 📁 ARCHIVOS CONTROLLER (REFACTORIZADO)
 * =======================================
 * Controller modular con funciones pequeñas (<50 líneas).
 * Separación de responsabilidades clara.
 */

import { asyncHandler, sendSuccess, NotFoundError, AppError } from '../middleware/errorHandler.js';
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { deleteFile } from '../middleware/upload.js';

const db = new sqlite3.Database('./saber_citricola.db');

// ============================================================================
// 🛠️ HELPERS DE BASE DE DATOS
// ============================================================================

const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// ============================================================================
// 📋 LISTAR ARCHIVOS
// ============================================================================

/**
 * GET /api/archivos
 * Listar archivos con filtros y paginación
 */
export const listarArchivos = asyncHandler(async (req, res) => {
  const { tipo, limite = 20, pagina = 1, orden = 'created_at', direccion = 'DESC' } = req.query;

  // Construir query
  let query = `
    SELECT 
      d.id,
      d.titulo,
      d.archivo_nombre_original,
      d.archivo_extension,
      d.archivo_size,
      d.archivo_tipo_mime,
      d.archivo_url,
      d.created_at,
      c.nombre as categoria_nombre,
      u.nombre_completo as autor_nombre
    FROM documentos d
    LEFT JOIN categorias c ON d.categoria_id = c.id
    LEFT JOIN usuarios u ON d.autor_id = u.id
    WHERE d.archivo_ruta IS NOT NULL
  `;

  const params = [];

  // Filtro por tipo de archivo
  if (tipo) {
    query += ' AND d.archivo_tipo_mime LIKE ?';
    params.push(`%${tipo}%`);
  }

  // Ordenamiento
  query += ` ORDER BY d.${orden} ${direccion}`;

  // Paginación
  const offset = (pagina - 1) * limite;
  query += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limite), offset);

  // Ejecutar queries
  const archivos = await dbAll(query, params);
  const total = await dbGet('SELECT COUNT(*) as total FROM documentos WHERE archivo_ruta IS NOT NULL');

  sendSuccess(res, {
    archivos,
    paginacion: {
      pagina: parseInt(pagina),
      limite: parseInt(limite),
      total: total.total,
      paginas: Math.ceil(total.total / limite)
    }
  });
});

// ============================================================================
// 📤 SUBIR ARCHIVO
// ============================================================================

/**
 * POST /api/archivos
 * Subir un nuevo archivo
 */
export const subirArchivo = asyncHandler(async (req, res) => {
  const archivo = req.file;
  const { titulo, descripcion, categoria_id } = req.body;

  if (!archivo) {
    throw new AppError('No se recibió ningún archivo', 400);
  }

  // Insertar registro en BD
  const result = await dbRun(
    `INSERT INTO documentos (
      titulo, descripcion, categoria_id, autor_id, tipo,
      archivo_nombre_original, archivo_extension, archivo_size,
      archivo_tipo_mime, archivo_url, archivo_ruta, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      titulo || archivo.originalname,
      descripcion || '',
      categoria_id || null,
      req.user?.id || 1,
      'documento',
      archivo.originalname,
      path.extname(archivo.originalname),
      archivo.size,
      archivo.mimetype,
      `/uploads/${archivo.filename}`,
      archivo.path,
      'publicado'
    ]
  );

  sendSuccess(res, {
    id: result.id,
    archivo_url: `/uploads/${archivo.filename}`,
    archivo_nombre: archivo.originalname
  }, 'Archivo subido exitosamente', 201);
});

// ============================================================================
// 📤 SUBIR MÚLTIPLES ARCHIVOS
// ============================================================================

/**
 * POST /api/archivos/batch
 * Subir múltiples archivos a la vez
 */
export const subirMultiplesArchivos = asyncHandler(async (req, res) => {
  const archivos = req.files;

  if (!archivos || archivos.length === 0) {
    throw new AppError('No se recibieron archivos', 400);
  }

  const resultados = [];

  // Insertar cada archivo
  for (const archivo of archivos) {
    const result = await dbRun(
      `INSERT INTO documentos (
        titulo, categoria_id, autor_id, tipo,
        archivo_nombre_original, archivo_extension, archivo_size,
        archivo_tipo_mime, archivo_url, archivo_ruta, estado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        archivo.originalname,
        null,
        req.user?.id || 1,
        'documento',
        archivo.originalname,
        path.extname(archivo.originalname),
        archivo.size,
        archivo.mimetype,
        `/uploads/${archivo.filename}`,
        archivo.path,
        'publicado'
      ]
    );

    resultados.push({
      id: result.id,
      archivo: archivo.originalname,
      url: `/uploads/${archivo.filename}`
    });
  }

  sendSuccess(res, {
    total: resultados.length,
    archivos: resultados
  }, `${resultados.length} archivos subidos exitosamente`, 201);
});

// ============================================================================
// 📥 DESCARGAR ARCHIVO
// ============================================================================

/**
 * GET /api/archivos/:id/download
 * Descargar archivo por ID
 */
export const descargarArchivo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const documento = await dbGet(
    'SELECT archivo_ruta, archivo_nombre_original FROM documentos WHERE id = ? AND archivo_ruta IS NOT NULL',
    [id]
  );

  if (!documento) {
    throw new NotFoundError('Archivo no encontrado');
  }

  // Verificar que el archivo existe físicamente
  if (!fs.existsSync(documento.archivo_ruta)) {
    throw new NotFoundError('El archivo físico no existe');
  }

  // Enviar archivo
  res.download(documento.archivo_ruta, documento.archivo_nombre_original);
});

// ============================================================================
// 📄 OBTENER INFO DE ARCHIVO
// ============================================================================

/**
 * GET /api/archivos/:id
 * Obtener información detallada de un archivo
 */
export const obtenerInfoArchivo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const documento = await dbGet(
    `SELECT 
      d.*,
      c.nombre as categoria_nombre,
      u.nombre_completo as autor_nombre
    FROM documentos d
    LEFT JOIN categorias c ON d.categoria_id = c.id
    LEFT JOIN usuarios u ON d.autor_id = u.id
    WHERE d.id = ? AND d.archivo_ruta IS NOT NULL`,
    [id]
  );

  if (!documento) {
    throw new NotFoundError('Archivo no encontrado');
  }

  sendSuccess(res, documento);
});

// ============================================================================
// 🗑️ ELIMINAR ARCHIVO
// ============================================================================

/**
 * DELETE /api/archivos/:id
 * Eliminar archivo (BD y físico)
 */
export const eliminarArchivo = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Obtener ruta del archivo
  const documento = await dbGet(
    'SELECT archivo_ruta FROM documentos WHERE id = ? AND archivo_ruta IS NOT NULL',
    [id]
  );

  if (!documento) {
    throw new NotFoundError('Archivo no encontrado');
  }

  // Eliminar archivo físico
  const archivoEliminado = deleteFile(documento.archivo_ruta);

  // Eliminar registro de BD
  await dbRun('DELETE FROM documentos WHERE id = ?', [id]);

  sendSuccess(res, {
    id,
    archivo_fisico_eliminado: archivoEliminado
  }, 'Archivo eliminado exitosamente');
});

// ============================================================================
// 📊 ESTADÍSTICAS DE ARCHIVOS
// ============================================================================

/**
 * GET /api/archivos/stats
 * Obtener estadísticas de archivos
 */
export const obtenerEstadisticasArchivos = asyncHandler(async (req, res) => {
  const stats = await dbGet(
    `SELECT 
      COUNT(*) as total_archivos,
      COUNT(CASE WHEN archivo_tipo_mime LIKE 'image/%' THEN 1 END) as imagenes,
      COUNT(CASE WHEN archivo_tipo_mime = 'application/pdf' THEN 1 END) as pdfs,
      COUNT(CASE WHEN archivo_tipo_mime LIKE 'video/%' THEN 1 END) as videos,
      SUM(archivo_size) as tamano_total,
      AVG(archivo_size) as tamano_promedio,
      MAX(created_at) as ultimo_archivo
    FROM documentos 
    WHERE archivo_ruta IS NOT NULL`
  );

  sendSuccess(res, {
    ...stats,
    tamano_total_mb: stats.tamano_total ? (stats.tamano_total / 1024 / 1024).toFixed(2) : 0,
    tamano_promedio_mb: stats.tamano_promedio ? (stats.tamano_promedio / 1024 / 1024).toFixed(2) : 0
  });
});

export default {
  listarArchivos,
  subirArchivo,
  subirMultiplesArchivos,
  descargarArchivo,
  obtenerInfoArchivo,
  eliminarArchivo,
  obtenerEstadisticasArchivos
};

