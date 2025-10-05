// 💬 controllers/comentarios.js - Controlador para gestión de comentarios
import { ComentariosModel } from '../models/comentarios.js';

export class ComentariosController {

  // 📝 Crear nuevo comentario
  static async crear(req, res) {
    try {
      const {
        documento_id,
        contenido,
        comentario_padre_id,
        posicion_texto,
        seleccion_texto
      } = req.body;

      // Validaciones
      if (!documento_id || !contenido) {
        return res.status(400).json({
          success: false,
          message: 'documento_id y contenido son requeridos'
        });
      }

      if (contenido.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'El comentario debe tener al menos 5 caracteres'
        });
      }

      if (contenido.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'El comentario no puede exceder 2000 caracteres'
        });
      }

      const usuario_id = req.usuario?.id;
      if (!usuario_id) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
      }

      // Obtener información adicional de la request
      const ip_usuario = req.ip || req.connection.remoteAddress;
      const user_agent = req.get('User-Agent');

      const comentario = await ComentariosModel.crear({
        documento_id,
        usuario_id,
        contenido: contenido.trim(),
        comentario_padre_id,
        posicion_texto,
        seleccion_texto,
        ip_usuario,
        user_agent
      });

      res.status(201).json({
        success: true,
        message: 'Comentario creado exitosamente',
        data: comentario
      });

    } catch (error) {
      console.error('Error creando comentario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 📖 Obtener comentarios de un documento
  static async obtenerPorDocumento(req, res) {
    try {
      const { documento_id } = req.params;
      const usuario_id = req.usuario?.id;

      if (!documento_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de documento requerido'
        });
      }

      const comentarios = await ComentariosModel.obtenerPorDocumento(documento_id, usuario_id);
      const estadisticas = await ComentariosModel.obtenerEstadisticas(documento_id);

      res.json({
        success: true,
        data: {
          comentarios,
          estadisticas,
          total: comentarios.length
        }
      });

    } catch (error) {
      console.error('Error obteniendo comentarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 📖 Obtener comentario específico
  static async obtenerPorId(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de comentario requerido'
        });
      }

      const comentario = await ComentariosModel.obtenerPorId(id);

      if (!comentario) {
        return res.status(404).json({
          success: false,
          message: 'Comentario no encontrado'
        });
      }

      res.json({
        success: true,
        data: comentario
      });

    } catch (error) {
      console.error('Error obteniendo comentario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // ✏️ Actualizar comentario
  static async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { contenido } = req.body;
      const usuario_id = req.usuario?.id;

      if (!id || !contenido) {
        return res.status(400).json({
          success: false,
          message: 'ID y contenido son requeridos'
        });
      }

      if (contenido.trim().length < 5) {
        return res.status(400).json({
          success: false,
          message: 'El comentario debe tener al menos 5 caracteres'
        });
      }

      const comentario = await ComentariosModel.actualizar(id, usuario_id, contenido.trim());

      res.json({
        success: true,
        message: 'Comentario actualizado exitosamente',
        data: comentario
      });

    } catch (error) {
      console.error('Error actualizando comentario:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 🗑️ Eliminar comentario
  static async eliminar(req, res) {
    try {
      const { id } = req.params;
      const usuario_id = req.usuario?.id;
      const es_admin = req.usuario?.rol === 'administrador';

      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID de comentario requerido'
        });
      }

      const resultado = await ComentariosModel.eliminar(id, usuario_id, es_admin);

      res.json({
        success: true,
        message: 'Comentario eliminado exitosamente',
        data: resultado
      });

    } catch (error) {
      console.error('Error eliminando comentario:', error);
      
      if (error.message.includes('no encontrado')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 👍 Reaccionar a comentario (like/dislike)
  static async reaccionar(req, res) {
    try {
      const { id } = req.params; // ID del comentario
      const { tipo } = req.body; // 'like' o 'dislike'
      const usuario_id = req.usuario?.id;

      if (!id || !tipo) {
        return res.status(400).json({
          success: false,
          message: 'ID de comentario y tipo de reacción son requeridos'
        });
      }

      const tiposValidos = ['like', 'dislike', 'love', 'laugh', 'angry'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: 'Tipo de reacción no válido'
        });
      }

      const resultado = await ComentariosModel.reaccionar(id, usuario_id, tipo);

      res.json({
        success: true,
        message: `Reacción ${resultado.accion}`,
        data: resultado
      });

    } catch (error) {
      console.error('Error procesando reacción:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 📊 Obtener estadísticas de comentarios
  static async obtenerEstadisticas(req, res) {
    try {
      const { documento_id } = req.params;

      if (!documento_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de documento requerido'
        });
      }

      const estadisticas = await ComentariosModel.obtenerEstadisticas(documento_id);

      res.json({
        success: true,
        data: estadisticas
      });

    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 🚫 Reportar comentario
  static async reportar(req, res) {
    try {
      const { id } = req.params; // ID del comentario
      const { razon, descripcion } = req.body;
      const usuario_reportante_id = req.usuario?.id;

      if (!id || !razon) {
        return res.status(400).json({
          success: false,
          message: 'ID de comentario y razón son requeridos'
        });
      }

      const razonesValidas = [
        'spam',
        'contenido_inapropiado',
        'acoso',
        'desinformacion',
        'otro'
      ];

      if (!razonesValidas.includes(razon)) {
        return res.status(400).json({
          success: false,
          message: 'Razón de reporte no válida'
        });
      }

      const resultado = await ComentariosModel.reportar(
        id,
        usuario_reportante_id,
        razon,
        descripcion || ''
      );

      res.json({
        success: true,
        message: 'Reporte enviado correctamente',
        data: resultado
      });

    } catch (error) {
      console.error('Error reportando comentario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 🔍 Buscar comentarios
  static async buscar(req, res) {
    try {
      const { q: termino, documento_id, limite = 50 } = req.query;

      if (!termino || termino.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'El término de búsqueda debe tener al menos 3 caracteres'
        });
      }

      const comentarios = await ComentariosModel.buscar(
        termino.trim(),
        documento_id,
        parseInt(limite)
      );

      res.json({
        success: true,
        data: {
          comentarios,
          total: comentarios.length,
          termino: termino.trim()
        }
      });

    } catch (error) {
      console.error('Error buscando comentarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // 🔄 Actualizar estadísticas manualmente
  static async actualizarEstadisticas(req, res) {
    try {
      const { documento_id } = req.params;

      if (!documento_id) {
        return res.status(400).json({
          success: false,
          message: 'ID de documento requerido'
        });
      }

      const estadisticas = await ComentariosModel.actualizarEstadisticas(documento_id);

      res.json({
        success: true,
        message: 'Estadísticas actualizadas',
        data: estadisticas
      });

    } catch (error) {
      console.error('Error actualizando estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

export default ComentariosController;