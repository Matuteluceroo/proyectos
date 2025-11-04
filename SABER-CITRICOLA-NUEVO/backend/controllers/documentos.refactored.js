/**
 * 🎯 controllers/documentos.js - Controlador REFACTORIZADO
 * ===========================================================
 * RESPONSABILIDAD ÚNICA: Orquestación HTTP
 * 
 * Este controlador:
 * - Recibe requests HTTP
 * - Valida entrada básica
 * - Llama al servicio correspondiente
 * - Formatea respuestas HTTP
 * - Maneja errores HTTP
 * 
 * NO contiene lógica de negocio ni acceso a BD directo.
 */

import DocumentService from '../services/DocumentService.js';

// ====================================================================
// CRUD BÁSICO
// ====================================================================

/**
 * 📋 GET /api/documentos - Obtener documentos con filtros
 */
export const obtenerDocumentos = async (req, res) => {
  try {
    const data = await DocumentService.getDocuments(req.query);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error obteniendo documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error consultando documentos',
      error: error.message
    });
  }
};

/**
 * 📄 GET /api/documentos/:id - Obtener documento por ID
 */
export const obtenerDocumentoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const documento = await DocumentService.getDocumentById(id);

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    res.json({
      success: true,
      data: documento
    });
  } catch (error) {
    console.error('Error obteniendo documento:', error);
    res.status(500).json({
      success: false,
      message: 'Error consultando documento',
      error: error.message
    });
  }
};

/**
 * ✅ POST /api/documentos - Crear nuevo documento
 */
export const crearDocumento = async (req, res) => {
  try {
    const user = req.user || { id: 1 }; // Del JWT middleware
    
    const documento = await DocumentService.createDocument(req.body, user);

    res.status(201).json({
      success: true,
      message: 'Documento creado exitosamente',
      data: documento
    });
  } catch (error) {
    console.error('Error creando documento:', error);
    
    // Diferenciar errores de validación de errores del servidor
    const statusCode = error.message.includes('requerido') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error creando documento',
      error: error.message
    });
  }
};

/**
 * ✏️ PUT /api/documentos/:id - Actualizar documento
 */
export const actualizarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await DocumentService.updateDocument(id, req.body);

    res.json({
      success: true,
      message: 'Documento actualizado exitosamente',
      data: { id, updated }
    });
  } catch (error) {
    console.error('Error actualizando documento:', error);
    
    const statusCode = error.message === 'Documento no encontrado' ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error actualizando documento',
      error: error.message
    });
  }
};

/**
 * 🗑️ DELETE /api/documentos/:id - Eliminar documento
 */
export const eliminarDocumento = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await DocumentService.deleteDocument(id);

    res.json({
      success: true,
      message: 'Documento eliminado exitosamente',
      data: result
    });
  } catch (error) {
    console.error('Error eliminando documento:', error);
    
    const statusCode = error.message === 'Documento no encontrado' ? 404 : 500;
    
    res.status(statusCode).json({
      success: false,
      message: error.message || 'Error eliminando documento',
      error: error.message
    });
  }
};

// ====================================================================
// OPERACIONES ESPECIALES
// ====================================================================

/**
 * 📁 POST /api/documentos/upload - Crear documento con archivo
 */
export const crearConArchivo = async (req, res) => {
  try {
    const user = req.user || { id: 1 }; // Del JWT middleware
    const file = req.file;

    const documento = await DocumentService.createDocumentWithFile(
      req.body,
      file,
      user
    );

    res.status(201).json({
      success: true,
      mensaje: 'Contenido creado con archivo',
      data: documento
    });
  } catch (error) {
    console.error('Error creando contenido con archivo:', error);
    
    const statusCode = error.message.includes('requerido') || 
                       error.message.includes('No se recibió') ? 400 : 500;
    
    res.status(statusCode).json({
      success: false,
      mensaje: error.message || 'Error creando contenido',
      error: error.message
    });
  }
};

/**
 * 📊 GET /api/documentos/estadisticas - Estadísticas de documentos
 */
export const obtenerEstadisticas = async (req, res) => {
  try {
    const stats = await DocumentService.getStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas',
      error: error.message
    });
  }
};

/**
 * 👁️ POST /api/documentos/:id/vista - Incrementar vistas (opcional)
 * NOTA: Esto se hace automáticamente al obtener el documento,
 * pero se puede mantener este endpoint para compatibilidad
 */
export const incrementarVista = async (req, res) => {
  try {
    // Esta funcionalidad ahora está integrada en getDocumentById
    res.json({
      success: true,
      message: 'Vista registrada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error registrando vista'
    });
  }
};

