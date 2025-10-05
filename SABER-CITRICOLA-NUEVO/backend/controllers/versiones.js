// 📚 VersionesController.js - Controlador para manejo de versiones de documentos
import VersionesModel from '../models/versiones.js';

class VersionesController {

  // 📄 Crear nueva versión de documento
  static async crearVersion(req, res) {
    try {
      const { documentoId } = req.params;
      const {
        tipo_cambio = 'edicion',
        titulo,
        descripcion,
        contenido,
        keywords,
        tags,
        comentario_version,
        archivo_url,
        archivo_nombre_original,
        archivo_mimetype,
        archivo_tamano
      } = req.body;

      const usuarioId = req.usuario.id;

      // Validaciones básicas
      if (!titulo || !contenido) {
        return res.status(400).json({
          success: false,
          message: 'Título y contenido son requeridos'
        });
      }

      // Generar número de versión automático
      const timestamp = Date.now();
      const numero_version = `v${timestamp}`;

      const datosVersion = {
        documento_id: parseInt(documentoId),
        numero_version,
        usuario_id: usuarioId,
        tipo_cambio,
        titulo,
        descripcion,
        contenido,
        keywords,
        tags,
        comentario_version,
        archivo_url,
        archivo_nombre_original,
        archivo_mimetype,
        archivo_tamano
      };

      const resultado = await VersionesModel.crearVersion(datosVersion);

      res.status(201).json({
        success: true,
        data: resultado.data,
        message: 'Nueva versión creada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en crearVersion:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 📋 Obtener historial de versiones de un documento
  static async obtenerHistorial(req, res) {
    try {
      const { documentoId } = req.params;
      const { limite = 50 } = req.query;

      const resultado = await VersionesModel.obtenerVersionesPorDocumento(
        parseInt(documentoId), 
        parseInt(limite)
      );

      res.json({
        success: true,
        data: resultado.data,
        total: resultado.total,
        message: 'Historial obtenido exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en obtenerHistorial:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener historial de versiones',
        error: error.message
      });
    }
  }

  // 🔍 Obtener versión específica
  static async obtenerVersion(req, res) {
    try {
      const { versionId } = req.params;

      const resultado = await VersionesModel.obtenerVersionPorId(parseInt(versionId));

      if (!resultado.success) {
        return res.status(404).json({
          success: false,
          message: 'Versión no encontrada'
        });
      }

      res.json({
        success: true,
        data: resultado.data,
        message: 'Versión obtenida exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en obtenerVersion:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la versión',
        error: error.message
      });
    }
  }

  // 🔄 Comparar dos versiones
  static async compararVersiones(req, res) {
    try {
      const { versionOrigenId, versionDestinoId } = req.params;
      const usuarioId = req.usuario.id;

      const resultado = await VersionesModel.compararVersiones(
        parseInt(versionOrigenId),
        parseInt(versionDestinoId),
        usuarioId
      );

      if (!resultado.success) {
        return res.status(404).json({
          success: false,
          message: resultado.message
        });
      }

      res.json({
        success: true,
        data: resultado.data,
        message: 'Comparación realizada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en compararVersiones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al comparar versiones',
        error: error.message
      });
    }
  }

  // 🔙 Restaurar versión específica
  static async restaurarVersion(req, res) {
    try {
      const { documentoId, versionId } = req.params;
      const { razon_restauracion = '' } = req.body;
      const usuarioId = req.usuario.id;

      // Verificar permisos (solo administradores y autores)
      if (req.usuario.rol !== 'administrador' && req.usuario.rol !== 'experto') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para restaurar versiones'
        });
      }

      const resultado = await VersionesModel.restaurarVersion(
        parseInt(documentoId),
        parseInt(versionId),
        usuarioId,
        razon_restauracion
      );

      if (!resultado.success) {
        return res.status(404).json({
          success: false,
          message: resultado.message
        });
      }

      res.json({
        success: true,
        data: resultado.data,
        message: 'Versión restaurada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en restaurarVersion:', error);
      res.status(500).json({
        success: false,
        message: 'Error al restaurar la versión',
        error: error.message
      });
    }
  }

  // 🏷️ Agregar etiqueta a versión
  static async agregarEtiqueta(req, res) {
    try {
      const { versionId } = req.params;
      const { 
        etiqueta, 
        descripcion, 
        color = '#3b82f6', 
        icono = '🏷️' 
      } = req.body;
      const usuarioId = req.usuario.id;

      // Validación
      if (!etiqueta) {
        return res.status(400).json({
          success: false,
          message: 'La etiqueta es requerida'
        });
      }

      // Verificar permisos
      if (req.usuario.rol !== 'administrador' && req.usuario.rol !== 'experto') {
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para agregar etiquetas'
        });
      }

      const resultado = await VersionesModel.agregarEtiqueta(
        parseInt(versionId),
        etiqueta,
        descripcion,
        usuarioId,
        color,
        icono
      );

      res.json({
        success: true,
        message: 'Etiqueta agregada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en agregarEtiqueta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al agregar etiqueta',
        error: error.message
      });
    }
  }

  // 📊 Obtener estadísticas de versiones de un documento
  static async obtenerEstadisticas(req, res) {
    try {
      const { documentoId } = req.params;

      const resultado = await VersionesModel.obtenerEstadisticasDocumento(parseInt(documentoId));

      res.json({
        success: true,
        data: resultado.data,
        message: 'Estadísticas obtenidas exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas',
        error: error.message
      });
    }
  }

  // 📈 Crear versión automática al guardar documento
  static async crearVersionAutomatica(documentoId, datosDocumento, usuarioId, tipoOperacion = 'edicion') {
    try {
      // Determinar si crear versión basado en cambios significativos
      const versionActual = await VersionesModel.obtenerVersionActual(documentoId);
      
      let debeCrearVersion = true;
      
      if (versionActual.success) {
        // Comparar contenido para ver si hay cambios significativos
        const cambios = VersionesModel.calcularPorcentajeCambio(
          versionActual.data.contenido || '',
          datosDocumento.contenido || ''
        );
        
        // Solo crear versión si hay cambios > 5%
        debeCrearVersion = cambios > 5;
      }

      if (debeCrearVersion) {
        const timestamp = Date.now();
        const datosVersion = {
          documento_id: documentoId,
          numero_version: `v${timestamp}`,
          usuario_id: usuarioId,
          tipo_cambio: tipoOperacion,
          titulo: datosDocumento.titulo,
          descripcion: datosDocumento.descripcion,
          contenido: datosDocumento.contenido,
          keywords: datosDocumento.keywords,
          tags: datosDocumento.tags,
          comentario_version: 'Versión automática creada al guardar cambios'
        };

        return await VersionesModel.crearVersion(datosVersion);
      }

      return { success: true, message: 'No se requiere nueva versión' };

    } catch (error) {
      console.warn('⚠️ Error al crear versión automática:', error);
      return { success: false, error: error.message };
    }
  }

  // 📑 Obtener diferencias rápidas entre versiones
  static async obtenerDiferenciasRapidas(req, res) {
    try {
      const { versionOrigenId, versionDestinoId } = req.params;

      // Obtener ambas versiones
      const versionOrigen = await VersionesModel.obtenerVersionPorId(parseInt(versionOrigenId));
      const versionDestino = await VersionesModel.obtenerVersionPorId(parseInt(versionDestinoId));

      if (!versionOrigen.success || !versionDestino.success) {
        return res.status(404).json({
          success: false,
          message: 'Una o ambas versiones no encontradas'
        });
      }

      // Calcular diferencias básicas
      const diferencias = VersionesModel.calcularDiferencias(
        versionOrigen.data,
        versionDestino.data
      );

      res.json({
        success: true,
        data: {
          version_origen: {
            id: versionOrigen.data.id,
            numero_version: versionOrigen.data.numero_version,
            fecha_creacion: versionOrigen.data.fecha_creacion,
            usuario_nombre: versionOrigen.data.usuario_nombre
          },
          version_destino: {
            id: versionDestino.data.id,
            numero_version: versionDestino.data.numero_version,
            fecha_creacion: versionDestino.data.fecha_creacion,
            usuario_nombre: versionDestino.data.usuario_nombre
          },
          diferencias: diferencias
        },
        message: 'Diferencias calculadas exitosamente'
      });

    } catch (error) {
      console.error('❌ Error en obtenerDiferenciasRapidas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al calcular diferencias',
        error: error.message
      });
    }
  }

  // 🗂️ Obtener versiones con filtros
  static async obtenerVersionesFiltradas(req, res) {
    try {
      const { documentoId } = req.params;
      const { 
        etiqueta, 
        tipo_cambio, 
        usuario_id, 
        fecha_desde, 
        fecha_hasta,
        limite = 20,
        offset = 0
      } = req.query;

      // Construir consulta con filtros
      let sql = `
        SELECT 
          v.*,
          u.nombre as usuario_nombre,
          GROUP_CONCAT(e.etiqueta) as etiquetas
        FROM versiones_documentos v
        LEFT JOIN usuarios u ON v.usuario_id = u.id
        LEFT JOIN etiquetas_versiones e ON v.id = e.version_id
        WHERE v.documento_id = ?
      `;
      
      const params = [parseInt(documentoId)];

      if (tipo_cambio) {
        sql += ` AND v.tipo_cambio = ?`;
        params.push(tipo_cambio);
      }

      if (usuario_id) {
        sql += ` AND v.usuario_id = ?`;
        params.push(parseInt(usuario_id));
      }

      if (fecha_desde) {
        sql += ` AND v.fecha_creacion >= ?`;
        params.push(fecha_desde);
      }

      if (fecha_hasta) {
        sql += ` AND v.fecha_creacion <= ?`;
        params.push(fecha_hasta);
      }

      sql += ` GROUP BY v.id ORDER BY v.fecha_creacion DESC LIMIT ? OFFSET ?`;
      params.push(parseInt(limite), parseInt(offset));

      // Si hay filtro por etiqueta, modificar la consulta
      if (etiqueta) {
        sql = `
          SELECT DISTINCT v.*, u.nombre as usuario_nombre,
                 GROUP_CONCAT(e.etiqueta) as etiquetas
          FROM versiones_documentos v
          LEFT JOIN usuarios u ON v.usuario_id = u.id
          LEFT JOIN etiquetas_versiones e ON v.id = e.version_id
          WHERE v.documento_id = ? AND v.id IN (
            SELECT version_id FROM etiquetas_versiones WHERE etiqueta = ?
          )
        `;
        params.splice(1, 0, etiqueta);
      }

      const versiones = db.prepare(sql).all(...params);

      res.json({
        success: true,
        data: versiones,
        total: versiones.length,
        filtros_aplicados: {
          etiqueta,
          tipo_cambio,
          usuario_id,
          fecha_desde,
          fecha_hasta
        }
      });

    } catch (error) {
      console.error('❌ Error en obtenerVersionesFiltradas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener versiones filtradas',
        error: error.message
      });
    }
  }
}

export default VersionesController;