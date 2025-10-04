// 📊 reportes.js - Controlador para reportes y estadísticas del administrador
import fs from 'fs';
import path from 'path';
import { obtenerTodosUsuarios } from '../database-citricola.js';

// 📈 Obtener métricas completas del sistema
export const obtenerReportesCompletos = async (req, res) => {
  try {
    console.log('📊 Generando reporte completo del sistema...');
    
    // 👥 Estadísticas de usuarios usando la función existente
    let usuarios = await new Promise((resolve, reject) => {
      obtenerTodosUsuarios((err, rows) => {
        if (err) {
          console.error('❌ Error al obtener usuarios:', err);
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
    
    console.log('👥 Usuarios obtenidos:', usuarios);
    
    // Validar que usuarios sea un array
    if (!Array.isArray(usuarios)) {
      console.warn('⚠️ usuarios no es un array, usando array vacío');
      usuarios = [];
    }
    
    const usuariosTotal = usuarios.length;
    
    // Contar usuarios por rol
    const usuariosPorRol = usuarios.reduce((acc, usuario) => {
      if (usuario.rol === 'administrador') acc.admin++;
      else if (usuario.rol === 'experto') acc.experto++;
      else if (usuario.rol === 'operador') acc.operador++;
      return acc;
    }, { admin: 0, experto: 0, operador: 0 });

    // Simular usuarios nuevos este mes (en producción sería una consulta real)
    const usuariosNuevos = Math.floor(Math.random() * 20) + 5;
    const usuariosActivos = Math.floor(usuariosTotal * 0.7); // 70% activos simulado

    // 📄 Estadísticas de documentos (simuladas por ahora)
    const documentosTotal = 342;
    const categorias = 15;
    const capacitaciones = 28;
    const descargas = Math.floor(Math.random() * 2000) + 1000;

    // 📊 Métricas de actividad (simuladas para demo)
    const actividadMetricas = {
      loginsDiarios: Math.floor(Math.random() * 100) + 50,
      sesionesPromedio: Math.floor(Math.random() * 200) + 100,
      tiempoPromedioSesion: Math.floor(Math.random() * 30) + 15,
      accionesPorDia: Math.floor(Math.random() * 1000) + 500
    };

    // 🔧 Métricas del sistema (simuladas)
    const sistemaMetricas = {
      uptime: 99.8,
      rendimiento: Math.floor(Math.random() * 10) + 90,
      espacioUsado: Math.floor(Math.random() * 40) + 50,
      errores: Math.floor(Math.random() * 5)
    };

    // 📈 Construir respuesta completa
    const reporteCompleto = {
      usuarios: {
        total: usuariosTotal,
        nuevosEsteMes: usuariosNuevos,
        activos: usuariosActivos,
        porRol: usuariosPorRol
      },
      contenido: {
        documentos: documentosTotal,
        categorias: categorias,
        capacitaciones: capacitaciones,
        descargas: descargas
      },
      actividad: actividadMetricas,
      sistema: sistemaMetricas,
      fechaGeneracion: new Date().toISOString()
    };

    console.log('📊 Reporte generado exitosamente:', reporteCompleto);
    res.json(reporteCompleto);

  } catch (error) {
    console.error('❌ Error al generar reporte:', error);
    res.status(500).json({ 
      error: 'Error al generar reporte',
      mensaje: error.message 
    });
  }
};

// 📥 Exportar reporte específico
export const exportarReporte = async (req, res) => {
  try {
    const { tipo } = req.params;
    const { formato = 'json' } = req.query;

    console.log(`📤 Exportando reporte tipo: ${tipo}, formato: ${formato}`);

    // Datos simulados según el tipo
    let datosReporte = {};
    
    switch (tipo) {
      case 'usuarios':
        datosReporte = {
          titulo: 'Reporte de Usuarios',
          datos: [
            { id: 1, nombre: 'Juan Pérez', rol: 'administrador', ultimoAcceso: '2024-01-15' },
            { id: 2, nombre: 'María García', rol: 'experto', ultimoAcceso: '2024-01-14' },
            { id: 3, nombre: 'Carlos López', rol: 'operador', ultimoAcceso: '2024-01-13' }
          ]
        };
        break;
      
      case 'contenido':
        datosReporte = {
          titulo: 'Reporte de Contenido',
          datos: [
            { id: 1, titulo: 'Guía de Cultivo', categoria: 'Técnicas', descargas: 245 },
            { id: 2, titulo: 'Manejo de Plagas', categoria: 'Sanidad', descargas: 189 },
            { id: 3, titulo: 'Fertilización', categoria: 'Nutrición', descargas: 167 }
          ]
        };
        break;
      
      case 'actividad':
        datosReporte = {
          titulo: 'Reporte de Actividad',
          datos: [
            { fecha: '2024-01-15', logins: 67, sesiones: 156, duracion: 24 },
            { fecha: '2024-01-14', logins: 72, sesiones: 163, duracion: 26 },
            { fecha: '2024-01-13', logins: 58, sesiones: 142, duracion: 22 }
          ]
        };
        break;
      
      case 'sistema':
        datosReporte = {
          titulo: 'Reporte del Sistema',
          datos: [
            { metrica: 'Uptime', valor: '99.8%', estado: 'Excelente' },
            { metrica: 'Rendimiento', valor: '95.2%', estado: 'Muy Bueno' },
            { metrica: 'Espacio Usado', valor: '67.3%', estado: 'Normal' },
            { metrica: 'Errores', valor: '2', estado: 'Bajo' }
          ]
        };
        break;
      
      default:
        return res.status(400).json({ error: 'Tipo de reporte no válido' });
    }

    if (formato === 'json') {
      res.json(datosReporte);
    } else if (formato === 'csv') {
      // Simulación de CSV
      let csv = 'Tipo,Valor,Fecha\n';
      csv += `${tipo},datos,${new Date().toISOString()}\n`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${tipo}.csv`);
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Formato no soportado' });
    }

  } catch (error) {
    console.error('❌ Error al exportar reporte:', error);
    res.status(500).json({ 
      error: 'Error al exportar reporte',
      mensaje: error.message 
    });
  }
};

// 📊 Obtener métricas en tiempo real
export const obtenerMetricasEnTiempoReal = async (req, res) => {
  try {
    const metricas = {
      usuariosOnline: Math.floor(Math.random() * 50) + 10,
      cpuUsage: Math.floor(Math.random() * 30) + 20,
      memoryUsage: Math.floor(Math.random() * 40) + 30,
      requestsPerMinute: Math.floor(Math.random() * 100) + 50,
      timestamp: new Date().toISOString()
    };

    res.json(metricas);
  } catch (error) {
    console.error('❌ Error al obtener métricas en tiempo real:', error);
    res.status(500).json({ 
      error: 'Error al obtener métricas',
      mensaje: error.message 
    });
  }
};