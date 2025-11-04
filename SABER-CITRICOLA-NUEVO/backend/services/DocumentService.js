/**
 * 🔧 DocumentService.js - Capa de lógica de negocio para documentos
 * ==================================================================
 * RESPONSABILIDAD ÚNICA: Lógica de negocio y orquestación
 * 
 * Este servicio:
 * - Coordina operaciones entre repositorio y controlador
 * - Aplica reglas de negocio
 * - Valida datos
 * - Maneja archivos (delega a FileService)
 */

import DocumentRepository from '../repositories/DocumentRepository.js';
import path from 'path';
import fs from 'fs';

class DocumentService {
  /**
   * Obtiene documentos con filtros y paginación
   * @param {Object} queryParams - Parámetros de consulta
   * @returns {Promise<Object>} Documentos paginados
   */
  async getDocuments(queryParams) {
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
    } = queryParams;

    // Preparar filtros
    const filters = {
      categoria_id,
      tipo,
      estado,
      nivel_acceso,
      busqueda,
      orden,
      direccion
    };

    // Calcular paginación
    const pagination = {
      limite: parseInt(limite),
      offset: (parseInt(pagina) - 1) * parseInt(limite)
    };

    // Obtener documentos y total
    const [documentos, total] = await Promise.all([
      DocumentRepository.findAll(filters, pagination),
      DocumentRepository.count(filters)
    ]);

    return {
      documentos,
      paginacion: {
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        total: total,
        paginas: Math.ceil(total / parseInt(limite))
      }
    };
  }

  /**
   * Obtiene un documento por ID e incrementa vistas
   * @param {number} id - ID del documento
   * @returns {Promise<Object|null>} Documento encontrado
   */
  async getDocumentById(id) {
    const documento = await DocumentRepository.findById(id);
    
    if (documento) {
      // Incrementar vistas de forma asíncrona (no bloqueante)
      DocumentRepository.incrementViews(id).catch(err => 
        console.error('Error incrementando vistas:', err)
      );
    }

    return documento;
  }

  /**
   * Crea un nuevo documento
   * @param {Object} data - Datos del documento
   * @param {Object} user - Usuario que crea el documento
   * @returns {Promise<Object>} Documento creado
   */
  async createDocument(data, user) {
    // Validaciones de negocio
    if (!data.titulo || !data.descripcion) {
      throw new Error('Título y descripción son requeridos');
    }

    // Preparar datos
    const documentData = {
      titulo: data.titulo.trim(),
      descripcion: data.descripcion.trim(),
      contenido: data.contenido || '',
      tipo: data.tipo || 'documento',
      categoria_id: data.categoria_id || null,
      tags: data.tags || '',
      nivel_acceso: data.nivel_acceso || 'publico',
      keywords: data.keywords || '',
      estado: data.estado || 'borrador',
      autor_id: user.id
    };

    // Crear documento
    const documentId = await DocumentRepository.create(documentData);

    return {
      id: documentId,
      ...documentData
    };
  }

  /**
   * Crea un documento con archivo adjunto
   * @param {Object} data - Datos del documento
   * @param {Object} file - Archivo subido (multer)
   * @param {Object} user - Usuario que crea el documento
   * @returns {Promise<Object>} Documento creado con archivo
   */
  async createDocumentWithFile(data, file, user) {
    if (!file) {
      throw new Error('No se recibió ningún archivo');
    }

    // Validaciones
    if (!data.titulo) {
      throw new Error('El título es requerido');
    }

    // 1. Determinar tipo de archivo y carpeta
    const tipoArchivo = this._determinarTipoArchivo(file);
    const folder = path.join('uploads', tipoArchivo);
    
    // 2. Crear carpeta si no existe
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    // 3. Crear documento en BD primero (para obtener ID)
    const documentData = {
      titulo: data.titulo.trim(),
      descripcion: data.descripcion || `Archivo subido: ${file.originalname}`,
      tipo: data.tipo || 'documento',
      categoria_id: data.categoria_id || null,
      autor_id: user.id,
      estado: 'borrador'
    };

    const documentId = await DocumentRepository.create(documentData);

    // 4. Mover archivo con nombre basado en ID del documento
    const ext = path.extname(file.originalname);
    const safeTitle = data.titulo.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const newFilename = `${documentId}_${safeTitle}${ext}`;
    const newPath = path.join(folder, newFilename);

    try {
      fs.renameSync(file.path, newPath);
    } catch (error) {
      // Si falla mover el archivo, eliminar el documento creado
      await DocumentRepository.delete(documentId);
      throw new Error(`Error moviendo archivo: ${error.message}`);
    }

    // 5. Actualizar documento con info del archivo
    const url_archivo = `/uploads/${tipoArchivo}/${newFilename}`;
    
    await DocumentRepository.update(documentId, {
      archivo_url: url_archivo,
      archivo_nombre_original: file.originalname,
      archivo_extension: ext,
      archivo_size: file.size,
      archivo_tipo_mime: file.mimetype,
      archivo_ruta: newPath
    });

    return {
      id: documentId,
      titulo: data.titulo,
      url_archivo
    };
  }

  /**
   * Actualiza un documento
   * @param {number} id - ID del documento
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<boolean>} true si se actualizó
   */
  async updateDocument(id, data) {
    // Verificar que el documento existe
    const exists = await DocumentRepository.findById(id);
    if (!exists) {
      throw new Error('Documento no encontrado');
    }

    // Actualizar
    const updated = await DocumentRepository.update(id, data);
    return updated;
  }

  /**
   * Elimina un documento y su archivo asociado
   * @param {number} id - ID del documento
   * @returns {Promise<Object>} Resultado de eliminación
   */
  async deleteDocument(id) {
    // Obtener documento para eliminar archivo
    const documento = await DocumentRepository.findById(id);
    
    if (!documento) {
      throw new Error('Documento no encontrado');
    }

    let archivoEliminado = false;

    // Eliminar archivo físico si existe
    if (documento.archivo_ruta && fs.existsSync(documento.archivo_ruta)) {
      try {
        fs.unlinkSync(documento.archivo_ruta);
        archivoEliminado = true;
      } catch (error) {
        console.error('Error eliminando archivo:', error);
      }
    }

    // Eliminar registro de BD
    const deleted = await DocumentRepository.delete(id);

    return {
      eliminado: deleted,
      archivoEliminado
    };
  }

  /**
   * Obtiene estadísticas de documentos
   * @returns {Promise<Object>} Estadísticas
   */
  async getStats() {
    return await DocumentRepository.getStats();
  }

  /**
   * Determina el tipo de archivo según extensión y MIME type
   * @private
   * @param {Object} file - Archivo multer
   * @returns {string} Tipo de archivo (imagenes, pdf, videos, otros)
   */
  _determinarTipoArchivo(file) {
    const extension = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype.toLowerCase();
    
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
}

export default new DocumentService();

