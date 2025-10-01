// 🗄️ database-citricola.js - Base de datos completa para Saber Citrícola
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'saber_citricola.db');
const sqlite = sqlite3.verbose();

const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar con SQLite:', err.message);
  } else {
    console.log('✅ Conectado a SQLite exitosamente');
    console.log(`📁 Base de datos ubicada en: ${dbPath}`);
  }
});

// 🔧 Funciones para crear todas las tablas
const crearTablas = () => {
  
  // 👥 Tabla de usuarios con roles
  const tablaUsuarios = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      nombre_completo TEXT,
      rol TEXT CHECK(rol IN ('administrador', 'experto', 'operador')) DEFAULT 'operador',
      activo BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 📚 Tabla de categorías de conocimiento
  const tablaCategorias = `
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      color TEXT DEFAULT '#2196F3',
      icono TEXT DEFAULT '📚',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

  // 📄 Tabla de documentos/conocimiento
  const tablaDocumentos = `
    CREATE TABLE IF NOT EXISTS documentos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      contenido TEXT,
      tipo TEXT CHECK(tipo IN ('documento', 'guia', 'procedimiento', 'capacitacion')) DEFAULT 'documento',
      categoria_id INTEGER,
      archivo_url TEXT,
      autor_id INTEGER NOT NULL,
      tags TEXT, -- JSON array de tags
      nivel_acceso TEXT CHECK(nivel_acceso IN ('publico', 'expertos', 'administradores')) DEFAULT 'publico',
      activo BOOLEAN DEFAULT 1,
      vistas INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias (id),
      FOREIGN KEY (autor_id) REFERENCES usuarios (id)
    )
  `;

  // 🎓 Tabla de capacitaciones
  const tablaCapacitaciones = `
    CREATE TABLE IF NOT EXISTS capacitaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      contenido TEXT, -- Puede ser markdown o HTML
      duracion_estimada INTEGER, -- en minutos
      categoria_id INTEGER,
      instructor_id INTEGER NOT NULL,
      nivel TEXT CHECK(nivel IN ('basico', 'intermedio', 'avanzado')) DEFAULT 'basico',
      activo BOOLEAN DEFAULT 1,
      fecha_inicio DATE,
      fecha_fin DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (categoria_id) REFERENCES categorias (id),
      FOREIGN KEY (instructor_id) REFERENCES usuarios (id)
    )
  `;

  // 📊 Tabla de progreso de capacitaciones
  const tablaProgreso = `
    CREATE TABLE IF NOT EXISTS progreso_capacitaciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER NOT NULL,
      capacitacion_id INTEGER NOT NULL,
      progreso INTEGER DEFAULT 0, -- porcentaje 0-100
      completado BOOLEAN DEFAULT 0,
      tiempo_dedicado INTEGER DEFAULT 0, -- en minutos
      fecha_inicio DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_completado DATETIME,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
      FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones (id),
      UNIQUE(usuario_id, capacitacion_id)
    )
  `;

  // 📊 Tabla de métricas/indicadores
  const tablaMetricas = `
    CREATE TABLE IF NOT EXISTS metricas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      valor REAL NOT NULL,
      unidad TEXT,
      categoria TEXT,
      fecha_registro DATE DEFAULT (date('now')),
      usuario_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `;

  // 💬 Tabla de comentarios/valoraciones
  const tablaComentarios = `
    CREATE TABLE IF NOT EXISTS comentarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      documento_id INTEGER,
      capacitacion_id INTEGER,
      usuario_id INTEGER NOT NULL,
      comentario TEXT NOT NULL,
      valoracion INTEGER CHECK(valoracion >= 1 AND valoracion <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (documento_id) REFERENCES documentos (id),
      FOREIGN KEY (capacitacion_id) REFERENCES capacitaciones (id),
      FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
    )
  `;

  // 🏃‍♂️ Ejecutar creación de tablas
  const tablas = [
    { nombre: 'usuarios', sql: tablaUsuarios },
    { nombre: 'categorias', sql: tablaCategorias },
    { nombre: 'documentos', sql: tablaDocumentos },
    { nombre: 'capacitaciones', sql: tablaCapacitaciones },
    { nombre: 'progreso_capacitaciones', sql: tablaProgreso },
    { nombre: 'metricas', sql: tablaMetricas },
    { nombre: 'comentarios', sql: tablaComentarios }
  ];

  tablas.forEach(tabla => {
    db.run(tabla.sql, (err) => {
      if (err) {
        console.error(`❌ Error al crear tabla ${tabla.nombre}:`, err.message);
      } else {
        console.log(`📋 Tabla "${tabla.nombre}" lista`);
      }
    });
  });
};

// 🌱 Insertar datos de prueba
const insertarDatosPrueba = () => {
  setTimeout(() => {
    // Verificar si ya existen datos
    db.get("SELECT COUNT(*) as count FROM usuarios", (err, row) => {
      if (err) {
        console.error('❌ Error al verificar usuarios:', err.message);
        return;
      }

      if (row.count === 0) {
        // Crear usuarios de prueba
        const usuarios = [
          ['admin', '123456', 'admin@sabercitricola.com', 'Juan Administrador', 'administrador'],
          ['experto1', '123456', 'experto1@sabercitricola.com', 'María González', 'experto'],
          ['operador1', '123456', 'operador1@sabercitricola.com', 'Pedro Martínez', 'operador']
        ];

        usuarios.forEach(([username, password, email, nombre, rol]) => {
          db.run(
            "INSERT INTO usuarios (username, password, email, nombre_completo, rol) VALUES (?, ?, ?, ?, ?)",
            [username, password, email, nombre, rol],
            (err) => {
              if (err) {
                console.error(`❌ Error al crear usuario ${username}:`, err.message);
              } else {
                console.log(`👤 Usuario ${username} (${rol}) creado`);
              }
            }
          );
        });

        // Crear categorías de prueba
        const categorias = [
          ['Manejo de Cultivos', 'Técnicas y procedimientos para el manejo de cultivos citrícolas', '#4CAF50', '🌱'],
          ['Control de Plagas', 'Identificación y control de plagas en cítricos', '#FF5722', '🐛'],
          ['Calidad de Frutos', 'Estándares y control de calidad de productos citrícolas', '#FF9800', '🍊'],
          ['Maquinaria', 'Operación y mantenimiento de equipos agrícolas', '#607D8B', '🚜'],
          ['Seguridad', 'Normas y procedimientos de seguridad en el trabajo', '#F44336', '⚠️']
        ];

        setTimeout(() => {
          categorias.forEach(([nombre, descripcion, color, icono]) => {
            db.run(
              "INSERT INTO categorias (nombre, descripcion, color, icono) VALUES (?, ?, ?, ?)",
              [nombre, descripcion, color, icono],
              (err) => {
                if (err) {
                  console.error(`❌ Error al crear categoría ${nombre}:`, err.message);
                } else {
                  console.log(`📚 Categoría "${nombre}" creada`);
                }
              }
            );
          });
        }, 500);

      } else {
        console.log('👤 Datos de prueba ya existen');
      }
    });
  }, 1000);
};

// 🔍 Funciones de consulta

// Obtener usuario con rol
const obtenerUsuarioConRol = (username, password, callback) => {
  const sql = "SELECT id, username, email, nombre_completo, rol FROM usuarios WHERE username = ? AND password = ? AND activo = 1";
  db.get(sql, [username, password], callback);
};

// Obtener todos los usuarios (solo para administradores)
const obtenerTodosUsuarios = (callback) => {
  const sql = "SELECT id, username, email, nombre_completo, rol, activo, created_at FROM usuarios ORDER BY created_at DESC";
  db.all(sql, [], callback);
};

// Obtener categorías
const obtenerCategorias = (callback) => {
  const sql = "SELECT * FROM categorias ORDER BY nombre";
  db.all(sql, [], callback);
};

// Obtener documentos por categoría
const obtenerDocumentos = (categoriaId = null, nivelAcceso = 'publico', callback) => {
  let sql = `
    SELECT d.*, c.nombre as categoria_nombre, u.nombre_completo as autor_nombre 
    FROM documentos d 
    LEFT JOIN categorias c ON d.categoria_id = c.id 
    LEFT JOIN usuarios u ON d.autor_id = u.id 
    WHERE d.activo = 1
  `;
  
  const params = [];
  
  if (categoriaId) {
    sql += " AND d.categoria_id = ?";
    params.push(categoriaId);
  }
  
  if (nivelAcceso !== 'administrador') {
    sql += " AND d.nivel_acceso = 'publico'";
  }
  
  sql += " ORDER BY d.created_at DESC";
  
  db.all(sql, params, callback);
};

// Obtener métricas del sistema
const obtenerMetricas = (callback) => {
  // Obtener conteos de cada tabla
  const metricas = {};
  
  // Contar usuarios
  db.get("SELECT COUNT(*) as total FROM usuarios WHERE activo = 1", [], (err, usuarios) => {
    if (err) return callback(err);
    
    metricas.usuarios = usuarios.total;
    
    // Contar documentos
    db.get("SELECT COUNT(*) as total FROM documentos WHERE activo = 1", [], (err, documentos) => {
      if (err) return callback(err);
      
      metricas.documentos = documentos.total;
      
      // Contar categorías
      db.get("SELECT COUNT(*) as total FROM categorias WHERE activo = 1", [], (err, categorias) => {
        if (err) return callback(err);
        
        metricas.categorias = categorias.total;
        
        // Contar capacitaciones
        db.get("SELECT COUNT(*) as total FROM capacitaciones WHERE activo = 1", [], (err, capacitaciones) => {
          if (err) return callback(err);
          
          metricas.capacitaciones = capacitaciones ? capacitaciones.total : 0;
          
          // Obtener estadísticas adicionales
          db.get(`
            SELECT 
              COUNT(CASE WHEN rol = 'administrador' THEN 1 END) as admins,
              COUNT(CASE WHEN rol = 'experto' THEN 1 END) as expertos,
              COUNT(CASE WHEN rol = 'operador' THEN 1 END) as operadores
            FROM usuarios WHERE activo = 1
          `, [], (err, roles) => {
            if (err) return callback(err);
            
            metricas.usuariosPorRol = {
              administradores: roles.admins,
              expertos: roles.expertos,
              operadores: roles.operadores
            };
            
            // Obtener actividad reciente
            db.all(`
              SELECT 
                'usuario' as tipo,
                'Nuevo usuario registrado: ' || nombre_completo as descripcion,
                created_at as fecha
              FROM usuarios 
              WHERE activo = 1 
              ORDER BY created_at DESC 
              LIMIT 5
            `, [], (err, actividad) => {
              if (err) return callback(err);
              
              metricas.actividadReciente = actividad || [];
              
              callback(null, metricas);
            });
          });
        });
      });
    });
  });
};

// Inicializar la base de datos
const inicializarDB = () => {
  crearTablas();
  insertarDatosPrueba();
};

// Búsqueda inteligente de contenido
const buscarContenido = (query, filtros = {}, callback) => {
  const { tipo, categoria, fechaDesde, fechaHasta } = filtros;
  const searchTerm = `%${query}%`;
  let resultados = [];
  let operacionesPendientes = 0;
  
  const finalizarBusqueda = () => {
    operacionesPendientes--;
    if (operacionesPendientes === 0) {
      // Ordenar por relevancia (coincidencias exactas primero)
      resultados.sort((a, b) => {
        const aExact = a.titulo?.toLowerCase().includes(query.toLowerCase()) || 
                      a.nombre?.toLowerCase().includes(query.toLowerCase());
        const bExact = b.titulo?.toLowerCase().includes(query.toLowerCase()) || 
                      b.nombre?.toLowerCase().includes(query.toLowerCase());
        if (aExact && !bExact) return -1;
        if (!aExact && bExact) return 1;
        return new Date(b.fecha) - new Date(a.fecha);
      });
      
      callback(null, resultados);
    }
  };
  
  // Buscar en documentos
  if (tipo === 'todos' || tipo === 'documentos') {
    operacionesPendientes++;
    let sql = `
      SELECT 
        d.id,
        d.titulo,
        d.descripcion,
        d.tipo,
        d.created_at as fecha,
        c.nombre as categoria_nombre,
        u.nombre_completo as autor_nombre,
        'documento' as tipo_resultado
      FROM documentos d
      LEFT JOIN categorias c ON d.categoria_id = c.id
      LEFT JOIN usuarios u ON d.autor_id = u.id
      WHERE d.activo = 1 AND (
        d.titulo LIKE ? OR 
        d.descripcion LIKE ? OR 
        d.contenido LIKE ?
      )
    `;
    
    const params = [searchTerm, searchTerm, searchTerm];
    
    if (categoria) {
      sql += " AND d.categoria_id = ?";
      params.push(categoria);
    }
    
    if (fechaDesde) {
      sql += " AND d.created_at >= ?";
      params.push(fechaDesde);
    }
    
    if (fechaHasta) {
      sql += " AND d.created_at <= ?";
      params.push(fechaHasta);
    }
    
    sql += " ORDER BY d.created_at DESC LIMIT 20";
    
    db.all(sql, params, (err, documentos) => {
      if (!err && documentos) {
        resultados.push(...documentos.map(doc => ({
          ...doc,
          tipo: 'documento'
        })));
      }
      finalizarBusqueda();
    });
  }
  
  // Buscar en usuarios
  if (tipo === 'todos' || tipo === 'usuarios') {
    operacionesPendientes++;
    let sql = `
      SELECT 
        id,
        username as titulo,
        nombre_completo as nombre,
        email as descripcion,
        rol,
        created_at as fecha,
        'usuario' as tipo_resultado
      FROM usuarios
      WHERE activo = 1 AND (
        username LIKE ? OR 
        nombre_completo LIKE ? OR 
        email LIKE ?
      )
    `;
    
    const params = [searchTerm, searchTerm, searchTerm];
    
    if (fechaDesde) {
      sql += " AND created_at >= ?";
      params.push(fechaDesde);
    }
    
    if (fechaHasta) {
      sql += " AND created_at <= ?";
      params.push(fechaHasta);
    }
    
    sql += " ORDER BY created_at DESC LIMIT 10";
    
    db.all(sql, params, (err, usuarios) => {
      if (!err && usuarios) {
        resultados.push(...usuarios.map(user => ({
          ...user,
          tipo: 'usuario'
        })));
      }
      finalizarBusqueda();
    });
  }
  
  // Buscar en categorías
  if (tipo === 'todos' || tipo === 'categorias') {
    operacionesPendientes++;
    let sql = `
      SELECT 
        id,
        nombre as titulo,
        descripcion,
        icono,
        color,
        created_at as fecha,
        'categoria' as tipo_resultado
      FROM categorias
      WHERE activo = 1 AND (
        nombre LIKE ? OR 
        descripcion LIKE ?
      )
    `;
    
    const params = [searchTerm, searchTerm];
    
    if (fechaDesde) {
      sql += " AND created_at >= ?";
      params.push(fechaDesde);
    }
    
    if (fechaHasta) {
      sql += " AND created_at <= ?";
      params.push(fechaHasta);
    }
    
    sql += " ORDER BY created_at DESC LIMIT 10";
    
    db.all(sql, params, (err, categorias) => {
      if (!err && categorias) {
        resultados.push(...categorias.map(cat => ({
          ...cat,
          tipo: 'categoria'
        })));
      }
      finalizarBusqueda();
    });
  }
  
  // Si no hay operaciones pendientes, devolver resultados vacíos
  if (operacionesPendientes === 0) {
    callback(null, []);
  }
};

export { 
  db, 
  inicializarDB, 
  obtenerUsuarioConRol,
  obtenerTodosUsuarios,
  obtenerCategorias,
  obtenerDocumentos,
  obtenerMetricas,
  buscarContenido
};