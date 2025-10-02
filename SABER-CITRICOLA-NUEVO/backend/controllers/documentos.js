// 📄 controllers/documentos.js - Controlador CRUD para documentos
import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { deleteFile } from '../middleware/upload.js';

const sql = new sqlite3.Database('./saber_citricola.db');

// 📋 GET - Obtener todos los documentos con filtros
export const obtenerDocumentos = async (req, res) => {
  try {
    const {
      categoria_id,
      tipo,
      estado,
      nivel_acceso,
      busqueda,
      limite = 20,
      pagina = 1,
      orden = 'created_at',
      direccion = 'DESC'
    } = req.query;

    let query = `
      SELECT 
        d.*,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        u.nombre_completo as autor_nombre
      FROM documentos d
      LEFT JOIN categorias c ON d.categoria_id = c.id
      LEFT JOIN usuarios u ON d.autor_id = u.id
      WHERE 1=1
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

    if (estado) {
      query += ' AND d.estado = ?';
      params.push(estado);
    }

    if (nivel_acceso) {
      query += ' AND d.nivel_acceso = ?';
      params.push(nivel_acceso);
    }

    if (busqueda) {
      query += ` AND (
        d.titulo LIKE ? OR 
        d.descripcion LIKE ? OR 
        d.contenido LIKE ? OR 
        d.keywords LIKE ? OR
        d.tags LIKE ?
      )`;
      const searchTerm = `%${busqueda}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Ordenamiento
    const validColumns = ['titulo', 'created_at', 'updated_at', 'vistas', 'estado'];
    const validDirections = ['ASC', 'DESC'];
    
    const orderColumn = validColumns.includes(orden) ? orden : 'created_at';
    const orderDirection = validDirections.includes(direccion.toUpperCase()) ? direccion.toUpperCase() : 'DESC';
    
    query += ` ORDER BY d.${orderColumn} ${orderDirection}`;

    // Paginación
    const offset = (pagina - 1) * limite;
    query += ` LIMIT ? OFFSET ?`;
    params.push(limite, offset);

    sql.all(query, params, (err, documentos) => {
      if (err) {
        console.error('Error obteniendo documentos:', err);
        return res.status(500).json({
          success: false,
          message: 'Error consultando documentos',
          error: err.message
        });
      }

      // Contar total para paginación
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM documentos d 
        WHERE 1=1
      `;
      const countParams = params.slice(0, -2); // Remover LIMIT y OFFSET

      sql.get(countQuery, countParams, (err, { total }) => {
        if (err) {
          console.error('Error contando documentos:', err);
          return res.status(500).json({
            success: false,
            message: 'Error contando documentos',
            error: err.message
          });
        }

        res.json({
          success: true,
          data: {
            documentos,
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
    console.error('Error en obtenerDocumentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// 📄 GET - Obtener un documento por ID
export const obtenerDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        d.*,
        c.nombre as categoria_nombre,
        c.icono as categoria_icono,
        u.nombre_completo as autor_nombre,
        u.email as autor_email
      FROM documentos d
      LEFT JOIN categorias c ON d.categoria_id = c.id
      LEFT JOIN usuarios u ON d.autor_id = u.id
      WHERE d.id = ?
    `;

    sql.get(query, [id], (err, documento) => {
      if (err) {
        console.error('Error obteniendo documento:', err);
        return res.status(500).json({
          success: false,
          message: 'Error consultando documento',
          error: err.message
        });
      }

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      // Incrementar vistas
      sql.run('UPDATE documentos SET vistas = vistas + 1 WHERE id = ?', [id]);

      res.json({
        success: true,
        data: documento
      });
    });

  } catch (error) {
    console.error('Error en obtenerDocumentoPorId:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ✅ POST - Crear nuevo documento
export const crearDocumento = async (req, res) => {
  try {
    const {
      titulo,
      descripcion,
      contenido = '',
      tipo = 'documento',
      categoria_id = null,
      tags = '',
      nivel_acceso = 'publico',
      keywords = '',
      estado = 'borrador',
      archivo_id
    } = req.body;

    const autor_id = req.user?.id || 1; // Del JWT (por ahora hardcoded)

    // Validaciones
    if (!titulo || !descripcion) {
      return res.status(400).json({
        success: false,
        message: 'Título y descripción son requeridos'
      });
    }

    // Obtener información del archivo si se proporcionó archivo_id
    // Este debería ser el ID de un archivo ya subido previamente
    let archivoInfo = null;
    if (archivo_id) {
      // Buscar en la tabla de archivos/uploads
      const archivoQuery = `
        SELECT archivo_url, archivo_nombre_original, archivo_extension, 
               archivo_size, archivo_tipo_mime, archivo_ruta
        FROM documentos WHERE id = ? AND archivo_url IS NOT NULL
      `;
      archivoInfo = await new Promise((resolve, reject) => {
        sql.get(archivoQuery, [archivo_id], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }

    const query = `
      INSERT INTO documentos (
        titulo, descripcion, contenido, tipo, categoria_id, 
        autor_id, tags, nivel_acceso, keywords, estado,
        archivo_url, archivo_nombre_original, archivo_extension,
        archivo_size, archivo_tipo_mime, archivo_ruta
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      titulo,
      descripcion,
      contenido,
      tipo,
      categoria_id,
      autor_id,
      tags,
      nivel_acceso,
      keywords,
      estado,
      archivoInfo?.archivo_url || null,
      archivoInfo?.archivo_nombre_original || null,
      archivoInfo?.archivo_extension || null,
      archivoInfo?.archivo_size || null,
      archivoInfo?.archivo_tipo_mime || null,
      archivoInfo?.archivo_ruta || null
    ];

    sql.run(query, values, function(err) {
      if (err) {
        console.error('Error creando documento:', err);
        return res.status(500).json({
          success: false,
          message: 'Error creando documento',
          error: err.message
        });
      }

      res.status(201).json({
        success: true,
        message: 'Documento creado exitosamente',
        data: {
          id: this.lastID,
          titulo,
          descripcion,
          tipo,
          estado
        }
      });
    });

  } catch (error) {
    console.error('Error en crearDocumento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// ✏️ PUT - Actualizar documento
export const actualizarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      descripcion,
      contenido,
      tipo,
      categoria_id,
      tags,
      nivel_acceso,
      keywords,
      estado
    } = req.body;

    // Verificar que el documento existe
    const checkQuery = 'SELECT * FROM documentos WHERE id = ?';
    sql.get(checkQuery, [id], (err, documento) => {
      if (err) {
        console.error('Error verificando documento:', err);
        return res.status(500).json({
          success: false,
          message: 'Error verificando documento',
          error: err.message
        });
      }

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      const updateQuery = `
        UPDATE documentos SET
          titulo = COALESCE(?, titulo),
          descripcion = COALESCE(?, descripcion),
          contenido = COALESCE(?, contenido),
          tipo = COALESCE(?, tipo),
          categoria_id = COALESCE(?, categoria_id),
          tags = COALESCE(?, tags),
          nivel_acceso = COALESCE(?, nivel_acceso),
          keywords = COALESCE(?, keywords),
          estado = COALESCE(?, estado),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      const values = [
        titulo, descripcion, contenido, tipo, categoria_id,
        tags, nivel_acceso, keywords, estado, id
      ];

      sql.run(updateQuery, values, function(err) {
        if (err) {
          console.error('Error actualizando documento:', err);
          return res.status(500).json({
            success: false,
            message: 'Error actualizando documento',
            error: err.message
          });
        }

        res.json({
          success: true,
          message: 'Documento actualizado exitosamente',
          data: {
            id,
            cambios: this.changes
          }
        });
      });
    });

  } catch (error) {
    console.error('Error en actualizarDocumento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// 🗑️ DELETE - Eliminar documento
export const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener información del documento para eliminar archivo asociado
    const getQuery = 'SELECT * FROM documentos WHERE id = ?';
    sql.get(getQuery, [id], (err, documento) => {
      if (err) {
        console.error('Error obteniendo documento:', err);
        return res.status(500).json({
          success: false,
          message: 'Error consultando documento',
          error: err.message
        });
      }

      if (!documento) {
        return res.status(404).json({
          success: false,
          message: 'Documento no encontrado'
        });
      }

      // Eliminar archivo físico si existe
      let archivoEliminado = false;
      if (documento.archivo_ruta) {
        archivoEliminado = deleteFile(documento.archivo_ruta);
      }

      // Eliminar registro de base de datos
      const deleteQuery = 'DELETE FROM documentos WHERE id = ?';
      sql.run(deleteQuery, [id], function(err) {
        if (err) {
          console.error('Error eliminando documento:', err);
          return res.status(500).json({
            success: false,
            message: 'Error eliminando documento',
            error: err.message
          });
        }

        res.json({
          success: true,
          message: 'Documento eliminado exitosamente',
          data: {
            id,
            archivo_fisico_eliminado: archivoEliminado,
            registros_eliminados: this.changes
          }
        });
      });
    });

  } catch (error) {
    console.error('Error en eliminarDocumento:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// 📊 GET - Estadísticas de documentos
export const obtenerEstadisticas = async (req, res) => {
  try {
    const query = `
      SELECT 
        COUNT(*) as total_documentos,
        COUNT(CASE WHEN estado = 'publicado' THEN 1 END) as publicados,
        COUNT(CASE WHEN estado = 'borrador' THEN 1 END) as borradores,
        COUNT(CASE WHEN estado = 'revision' THEN 1 END) as en_revision,
        COUNT(CASE WHEN tipo = 'documento' THEN 1 END) as documentos,
        COUNT(CASE WHEN tipo = 'guia' THEN 1 END) as guias,
        COUNT(CASE WHEN tipo = 'procedimiento' THEN 1 END) as procedimientos,
        COUNT(CASE WHEN tipo = 'capacitacion' THEN 1 END) as capacitaciones,
        SUM(vistas) as total_vistas,
        AVG(vistas) as promedio_vistas
      FROM documentos
    `;

    sql.get(query, [], (err, stats) => {
      if (err) {
        console.error('Error obteniendo estadísticas:', err);
        return res.status(500).json({
          success: false,
          message: 'Error obteniendo estadísticas',
          error: err.message
        });
      }

      res.json({
        success: true,
        data: stats
      });
    });

  } catch (error) {
    console.error('Error en obtenerEstadisticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// 📁 POST - Crear documento con archivo subido
export const crearConArchivo = async (req, res) => {
  try {
    const { titulo, descripcion, id_tipo, id_usuario, tipo } = req.body;
    const archivo = req.file;

    if (!archivo || !titulo || !id_tipo || !id_usuario) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    console.log('📁 Creando documento con archivo:', {
      archivo: archivo.originalname,
      tipo_archivo: tipo,
      titulo
    });

    // Determinar tipo de documento basado en el archivo o usar valor por defecto
    const tipoDocumento = tipo && ['documento', 'guia', 'procedimiento', 'capacitacion'].includes(tipo) 
      ? tipo 
      : 'documento'; // Valor por defecto

    // 1. Crear carpetas necesarias basado en el tipo de archivo
    const basePath = 'uploads';
    const tipoArchivo = determinarTipoArchivo(archivo);
    let folder = path.join(basePath, tipoArchivo);
    
    fs.mkdirSync(folder, { recursive: true });

    // 2. Insertar metadatos en la base de datos primero
    const insertQuery = `
      INSERT INTO documentos (
        titulo, descripcion, tipo, categoria_id, autor_id, estado
      ) VALUES (?, ?, ?, ?, ?, 'borrador')
    `;

    sql.run(insertQuery, [titulo, descripcion, tipoDocumento, id_tipo, id_usuario], function(err) {
      if (err) {
        console.error('Error insertando documento:', err);
        return res.status(500).json({
          mensaje: 'Error creando documento',
          error: err.message
        });
      }

      const idContenido = this.lastID;
      console.log('📄 Documento creado con ID:', idContenido);

      // 3. Armar nombre del archivo con ID del documento
      const ext = path.extname(archivo.originalname);
      const safeTitle = titulo.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      const newFilename = `${idContenido}_${safeTitle}${ext}`;
      const newPath = path.join(folder, newFilename);

      try {
        // 4. Mover archivo desde tmp a carpeta definitiva
        fs.renameSync(archivo.path, newPath);
        console.log('📁 Archivo movido a:', newPath);

        // 5. Generar URL relativa para el frontend
        const url_archivo = `/uploads/${tipoArchivo}/${newFilename}`;

        // 6. Actualizar BD con información del archivo
        const updateQuery = `
          UPDATE documentos SET
            archivo_url = ?,
            archivo_nombre_original = ?,
            archivo_extension = ?,
            archivo_size = ?,
            archivo_tipo_mime = ?,
            archivo_ruta = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        sql.run(updateQuery, [
          url_archivo,
          archivo.originalname,
          ext,
          archivo.size,
          archivo.mimetype,
          newPath,
          idContenido
        ], function(updateErr) {
          if (updateErr) {
            console.error('Error actualizando archivo:', updateErr);
            return res.status(500).json({
              mensaje: 'Error asociando archivo al documento',
              error: updateErr.message
            });
          }

          console.log('✅ Documento con archivo creado exitosamente');
          res.status(201).json({
            mensaje: 'Contenido creado con archivo',
            id_contenido: idContenido,
            url_archivo,
          });
        });

      } catch (fileError) {
        console.error('Error moviendo archivo:', fileError);
        res.status(500).json({
          mensaje: 'Error procesando archivo',
          error: fileError.message
        });
      }
    });

  } catch (error) {
    console.error('Error creando contenido:', error);
    res.status(500).json({
      mensaje: 'Error creando contenido',
      error: error.message
    });
  }
};

// 🔍 Función auxiliar para determinar tipo de archivo
function determinarTipoArchivo(archivo) {
  const extension = path.extname(archivo.originalname).toLowerCase();
  const mimeType = archivo.mimetype.toLowerCase();
  
  if (mimeType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(extension)) {
    return 'imagenes';
  }
  if (mimeType === 'application/pdf' || extension === '.pdf') {
    return 'pdf';
  }
  if (mimeType.startsWith('video/') || ['.mp4', '.avi', '.mov', '.wmv'].includes(extension)) {
    return 'videos';
  }
  return 'otros';
}