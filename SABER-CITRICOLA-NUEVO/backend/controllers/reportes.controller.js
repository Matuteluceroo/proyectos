const { db } = require('../config/database');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// Obtener estadísticas generales
exports.getEstadisticas = async (req, res) => {
  try {
    const stats = {
      totalUsuarios: db.prepare('SELECT COUNT(*) as count FROM usuarios').get().count,
      totalDocumentos: db.prepare('SELECT COUNT(*) as count FROM documentos').get().count,
      totalCategorias: db.prepare('SELECT COUNT(*) as count FROM categorias').get().count,
      documentosPorCategoria: db.prepare(`
        SELECT c.nombre, COUNT(d.id) as total
        FROM categorias c
        LEFT JOIN documentos d ON c.id = d.categoria_id
        GROUP BY c.id, c.nombre
      `).all(),
      usuariosPorRol: db.prepare(`
        SELECT rol, COUNT(*) as total
        FROM usuarios
        GROUP BY rol
      `).all(),
      actividadReciente: db.prepare(`
        SELECT 
          tipo_actividad,
          COUNT(*) as total,
          DATE(fecha_hora) as fecha
        FROM historial_acceso
        WHERE fecha_hora >= datetime('now', '-7 days')
        GROUP BY tipo_actividad, DATE(fecha_hora)
        ORDER BY fecha DESC
      `).all()
    };

    res.json({ success: true, stats });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Obtener reporte de usuarios
exports.getReporteUsuarios = async (req, res) => {
  try {
    const usuarios = db.prepare(`
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.rol,
        u.created_at,
        COUNT(DISTINCT ha.id) as total_accesos,
        MAX(ha.fecha_hora) as ultimo_acceso
      FROM usuarios u
      LEFT JOIN historial_acceso ha ON u.id = ha.usuario_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `).all();

    res.json({ success: true, usuarios });
  } catch (error) {
    console.error('Error obteniendo reporte de usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte de usuarios',
      error: error.message
    });
  }
};

// Obtener reporte de documentos
exports.getReporteDocumentos = async (req, res) => {
  try {
    const documentos = db.prepare(`
      SELECT 
        d.id,
        d.titulo,
        c.nombre as categoria,
        u.nombre || ' ' || u.apellido as autor,
        d.estado,
        d.created_at,
        COUNT(DISTINCT ha.id) as total_visualizaciones,
        COUNT(DISTINCT CASE WHEN ha.tipo_actividad = 'descarga' THEN ha.id END) as total_descargas
      FROM documentos d
      LEFT JOIN categorias c ON d.categoria_id = c.id
      LEFT JOIN usuarios u ON d.autor_id = u.id
      LEFT JOIN historial_acceso ha ON d.id = ha.documento_id
      GROUP BY d.id
      ORDER BY total_visualizaciones DESC
    `).all();

    res.json({ success: true, documentos });
  } catch (error) {
    console.error('Error obteniendo reporte de documentos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte de documentos',
      error: error.message
    });
  }
};

// Obtener reporte de actividad
exports.getReporteActividad = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    let query = `
      SELECT 
        ha.id,
        ha.tipo_actividad,
        ha.fecha_hora,
        u.nombre || ' ' || u.apellido as usuario,
        d.titulo as documento,
        ha.detalles
      FROM historial_acceso ha
      LEFT JOIN usuarios u ON ha.usuario_id = u.id
      LEFT JOIN documentos d ON ha.documento_id = d.id
    `;

    const params = [];
    if (desde || hasta) {
      query += ' WHERE ';
      if (desde) {
        query += 'ha.fecha_hora >= ?';
        params.push(desde);
      }
      if (hasta) {
        if (desde) query += ' AND ';
        query += 'ha.fecha_hora <= ?';
        params.push(hasta);
      }
    }

    query += ' ORDER BY ha.fecha_hora DESC LIMIT 1000';

    const actividad = db.prepare(query).all(...params);

    res.json({ success: true, actividad });
  } catch (error) {
    console.error('Error obteniendo reporte de actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener reporte de actividad',
      error: error.message
    });
  }
};

// Exportar reporte
exports.exportarReporte = async (req, res) => {
  try {
    const { tipo } = req.params;
    const { formato = 'excel' } = req.body;

    let datos;
    let nombreArchivo;

    // Obtener datos según el tipo
    switch (tipo) {
      case 'usuarios':
        datos = db.prepare(`
          SELECT 
            nombre, apellido, email, rol, created_at
          FROM usuarios
          ORDER BY created_at DESC
        `).all();
        nombreArchivo = 'reporte_usuarios';
        break;

      case 'documentos':
        datos = db.prepare(`
          SELECT 
            d.titulo,
            c.nombre as categoria,
            u.nombre || ' ' || u.apellido as autor,
            d.estado,
            d.created_at
          FROM documentos d
          LEFT JOIN categorias c ON d.categoria_id = c.id
          LEFT JOIN usuarios u ON d.autor_id = u.id
          ORDER BY d.created_at DESC
        `).all();
        nombreArchivo = 'reporte_documentos';
        break;

      case 'actividad':
        datos = db.prepare(`
          SELECT 
            ha.tipo_actividad,
            ha.fecha_hora,
            u.nombre || ' ' || u.apellido as usuario,
            d.titulo as documento
          FROM historial_acceso ha
          LEFT JOIN usuarios u ON ha.usuario_id = u.id
          LEFT JOIN documentos d ON ha.documento_id = d.id
          ORDER BY ha.fecha_hora DESC
          LIMIT 1000
        `).all();
        nombreArchivo = 'reporte_actividad';
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Tipo de reporte no válido'
        });
    }

    if (formato === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte');

      if (datos.length > 0) {
        // Agregar headers
        worksheet.columns = Object.keys(datos[0]).map(key => ({
          header: key.toUpperCase(),
          key: key,
          width: 20
        }));

        // Agregar datos
        datos.forEach(row => worksheet.addRow(row));

        // Estilo de headers
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' }
        };
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}.xlsx`);

      await workbook.xlsx.write(res);
      res.end();

    } else if (formato === 'pdf') {
      const doc = new PDFDocument();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}.pdf`);

      doc.pipe(res);

      doc.fontSize(16).text(`Reporte: ${tipo.toUpperCase()}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).text(`Generado: ${new Date().toLocaleString()}`, { align: 'center' });
      doc.moveDown(2);

      // Agregar datos en formato tabla simple
      if (datos.length > 0) {
        const keys = Object.keys(datos[0]);
        doc.fontSize(12).text(keys.join(' | '));
        doc.moveDown(0.5);

        datos.forEach(row => {
          const values = keys.map(key => String(row[key] || ''));
          doc.fontSize(10).text(values.join(' | '));
        });
      } else {
        doc.fontSize(12).text('No hay datos disponibles');
      }

      doc.end();

    } else {
      // Formato JSON por defecto
      res.json({ success: true, datos });
    }

  } catch (error) {
    console.error('Error exportando reporte:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar el reporte',
      error: error.message
    });
  }
};

// Obtener historial de documentos
exports.getHistorialDocumentos = async (req, res) => {
  try {
    const historial = db.prepare(`
      SELECT 
        ha.id,
        ha.tipo_actividad,
        ha.fecha_hora,
        u.nombre || ' ' || u.apellido as usuario,
        d.titulo as documento,
        c.nombre as categoria
      FROM historial_acceso ha
      INNER JOIN usuarios u ON ha.usuario_id = u.id
      INNER JOIN documentos d ON ha.documento_id = d.id
      LEFT JOIN categorias c ON d.categoria_id = c.id
      WHERE ha.tipo_actividad IN ('visualizacion', 'descarga')
      ORDER BY ha.fecha_hora DESC
      LIMIT 100
    `).all();

    res.json({ success: true, historial });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el historial',
      error: error.message
    });
  }
};
