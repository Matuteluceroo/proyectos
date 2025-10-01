// 📁 controllers/archivos.js - Controlador para gestión de archivos
import { uploadSingle, uploadMultiple, deleteFile, getFileInfo } from '../middleware/upload.js';
import { inicializarDB } from '../database-citricola.js';
import path from 'path';
import fs from 'fs';
import sqlite3 from 'sqlite3';

// Crear conexión a la base de datos
const sql = new sqlite3.Database('./saber_citricola.db');

// 📤 Subir un archivo único
export const subirArchivo = async (req, res) => {
  try {
    // Usar middleware de multer
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Error al subir archivo',
          error: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se recibió ningún archivo'
        });
      }

      const archivo = req.file;
      const { titulo, descripcion, categoria_id, tipo = 'documento' } = req.body;
      const autor_id = req.user?.id || 1; // Del JWT token

      // Insertar en base de datos
      const query = `
        INSERT INTO documentos (
          titulo, descripcion, tipo, categoria_id, autor_id,
          archivo_url, archivo_nombre_original, archivo_extension, 
          archivo_size, archivo_tipo_mime, archivo_ruta, estado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const values = [
        titulo || archivo.originalname,
        descripcion || `Archivo subido: ${archivo.originalname}`,
        tipo,
        categoria_id || null,
        autor_id,
        `/uploads/${archivo.filename}`, // URL pública
        archivo.originalname,
        path.extname(archivo.originalname),
        archivo.size,
        archivo.mimetype,
        archivo.path,
        'publicado'
      ];

      sql.run(query, values, function(err) {
        if (err) {
          console.error('Error insertando documento:', err);
          // Eliminar archivo si falla la inserción
          deleteFile(archivo.path);
          return res.status(500).json({
            success: false,
            message: 'Error guardando en base de datos',
            error: err.message
          });
        }

        res.json({
          success: true,
          message: 'Archivo subido exitosamente',
          data: {
            id: this.lastID,
            archivo: {
              nombre_original: archivo.originalname,
              nombre_guardado: archivo.filename,
              size: archivo.size,
              tipo: archivo.mimetype,
              url: `/uploads/${archivo.filename}`
            }
          }
        });
      });
    });

  } catch (error) {
    console.error('Error en subirArchivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// 📤 Subir múltiples archivos
export const subirMultiplesArchivos = async (req, res) => {
  try {
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: 'Error al subir archivos',
          error: err.message
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se recibieron archivos'
        });
      }

      const { categoria_id, tipo = 'documento' } = req.body;
      const autor_id = req.user?.id || 1;
      const archivosSubidos = [];
      const errores = [];

      // Procesar cada archivo
      for (const archivo of req.files) {
        try {
          const query = `
            INSERT INTO documentos (
              titulo, descripcion, tipo, categoria_id, autor_id,
              archivo_url, archivo_nombre_original, archivo_extension, 
              archivo_size, archivo_tipo_mime, archivo_ruta, estado
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          const values = [
            archivo.originalname,
            `Archivo subido: ${archivo.originalname}`,
            tipo,
            categoria_id || null,
            autor_id,
            `/uploads/${archivo.filename}`,
            archivo.originalname,
            path.extname(archivo.originalname),
            archivo.size,
            archivo.mimetype,
            archivo.path,
            'publicado'
          ];

          await new Promise((resolve, reject) => {
            sql.run(query, values, function(err) {
              if (err) {
                reject(err);
              } else {
                archivosSubidos.push({
                  id: this.lastID,
                  nombre_original: archivo.originalname,
                  url: `/uploads/${archivo.filename}`
                });
                resolve();
              }
            });
          });

        } catch (error) {
          errores.push({
            archivo: archivo.originalname,
            error: error.message
          });
          deleteFile(archivo.path);
        }
      }

      res.json({
        success: true,
        message: `${archivosSubidos.length} archivos subidos exitosamente`,
        data: {
          archivos_subidos: archivosSubidos,
          errores: errores
        }
      });
    });

  } catch (error) {
    console.error('Error en subirMultiplesArchivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// 📥 Descargar archivo
export const descargarArchivo = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar documento en base de datos
    const query = 'SELECT * FROM documentos WHERE id = ?';
    
    sql.get(query, [id], (err, documento) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error consultando base de datos',
          error: err.message
        });
      }

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      const filePath = documento.archivo_ruta;

      // Verificar que el archivo existe
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'Archivo no encontrado en el servidor'
        });
      }

      // Incrementar contador de vistas
      sql.run('UPDATE documentos SET vistas = vistas + 1 WHERE id = ?', [id]);

      // Descargar archivo
      res.download(filePath, documento.archivo_nombre_original, (err) => {
        if (err) {
          console.error('Error descargando archivo:', err);
          res.status(500).json({
            success: false,
            message: 'Error descargando archivo'
          });
        }
      });
    });

  } catch (error) {
    console.error('Error en descargarArchivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// 🗑️ Eliminar archivo
export const eliminarArchivo = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar documento
    const query = 'SELECT * FROM documentos WHERE id = ?';
    
    sql.get(query, [id], (err, documento) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error consultando base de datos',
          error: err.message
        });
      }

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      // Eliminar archivo físico
      const archivoEliminado = deleteFile(documento.archivo_ruta);

      // Eliminar registro de base de datos
      sql.run('DELETE FROM documentos WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error eliminando de base de datos',
            error: err.message
          });
        }

        res.json({
          success: true,
          message: 'Archivo eliminado exitosamente',
          data: {
            archivo_fisico_eliminado: archivoEliminado,
            registros_eliminados: this.changes
          }
        });
      });
    });

  } catch (error) {
    console.error('Error en eliminarArchivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// 📋 Listar archivos con filtros
export const listarArchivos = async (req, res) => {
  try {
    const {
      categoria_id,
      tipo,
      extension,
      limite = 50,
      pagina = 1,
      orden = 'created_at',
      direccion = 'DESC'
    } = req.query;

    let query = `
      SELECT 
        d.*,
        c.nombre as categoria_nombre,
        u.nombre_completo as autor_nombre
      FROM documentos d
      LEFT JOIN categorias c ON d.categoria_id = c.id
      LEFT JOIN usuarios u ON d.autor_id = u.id
      WHERE d.archivo_ruta IS NOT NULL
    `;

    const params = [];

    // Filtros
    if (categoria_id) {
      query += ' AND d.categoria_id = ?';
      params.push(categoria_id);
    }

    if (tipo) {
      query += ' AND d.tipo = ?';
      params.push(tipo);
    }

    if (extension) {
      query += ' AND d.archivo_extension = ?';
      params.push(extension);
    }

    // Ordenamiento
    query += ` ORDER BY d.${orden} ${direccion}`;

    // Paginación
    const offset = (pagina - 1) * limite;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limite, offset);

    sql.all(query, params, (err, archivos) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: 'Error consultando archivos',
          error: err.message
        });
      }

      // Contar total
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM documentos d 
        WHERE d.archivo_ruta IS NOT NULL
      `;
      const countParams = [];

      if (categoria_id) {
        countQuery += ' AND d.categoria_id = ?';
        countParams.push(categoria_id);
      }

      if (tipo) {
        countQuery += ' AND d.tipo = ?';
        countParams.push(tipo);
      }

      if (extension) {
        countQuery += ' AND d.archivo_extension = ?';
        countParams.push(extension);
      }

      sql.get(countQuery, countParams, (err, { total }) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: 'Error contando archivos',
            error: err.message
          });
        }

        res.json({
          success: true,
          data: {
            archivos,
            paginacion: {
              pagina: parseInt(pagina),
              limite: parseInt(limite),
              total: total,
              paginas: Math.ceil(total / limite)
            }
          }
        });
      });
    });

  } catch (error) {
    console.error('Error en listarArchivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};