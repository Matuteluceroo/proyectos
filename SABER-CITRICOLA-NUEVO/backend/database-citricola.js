// 🗄️ database-citricola.js - Base de datos completa para Saber Citrícola
// ⚠️ NOTA: Este archivo será dividido en módulos más pequeños
// La conexión a la BD ahora está en config/database.js

import db from './config/database.js';
import bcrypt from 'bcrypt';

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
        // Solo crear usuarios si no existen (para evitar recrear en cada reinicio)
        db.get("SELECT COUNT(*) as count FROM usuarios", (err, result) => {
          if (err) {
            console.error('❌ Error al verificar usuarios:', err.message);
          } else if (result.count === 0) {
            console.log('👤 Creando usuarios de prueba...');
            
            // Crear usuarios usando la función que ya hashea contraseñas
            const usuarios = [
              { username: 'admin', password: '123456', email: 'admin@sabercitricola.com', nombre_completo: 'Juan Administrador', rol: 'administrador' },
              { username: 'experto1', password: '123456', email: 'experto1@sabercitricola.com', nombre_completo: 'María González', rol: 'experto' },
              { username: 'operador1', password: '123456', email: 'operador1@sabercitricola.com', nombre_completo: 'Pedro Martínez', rol: 'operador' }
            ];

            usuarios.forEach((userData, index) => {
              setTimeout(() => {
                crearUsuario(userData, (err, result) => {
                  if (err) {
                    console.error(`❌ Error al crear usuario ${userData.username}:`, err.message);
                  } else {
                    console.log(`👤 Usuario ${userData.username} (${userData.rol}) creado exitosamente`);
                  }
                });
              }, index * 100); // Pequeño delay para evitar conflictos
            });
          } else {
            console.log('👤 Usuarios de prueba ya existen');
          }
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

// Obtener usuario con rol - ahora con verificación de contraseña hasheada
const obtenerUsuarioConRol = (username, password, callback) => {
  // Primero obtenemos el usuario con su contraseña hasheada
  const sql = "SELECT id, username, email, nombre_completo, rol, password FROM usuarios WHERE username = ?";
  
  db.get(sql, [username], (err, usuario) => {
    if (err) {
      return callback(err, null);
    }
    
    if (!usuario) {
      return callback(null, null); // Usuario no encontrado
    }
    
    // Verificar contraseña hasheada
    bcrypt.compare(password, usuario.password, (bcryptErr, esValida) => {
      if (bcryptErr) {
        return callback(bcryptErr, null);
      }
      
      if (esValida) {
        // Contraseña correcta - devolver usuario sin la contraseña
        const { password: _, ...usuarioSinPassword } = usuario;
        callback(null, usuarioSinPassword);
      } else {
        // Contraseña incorrecta
        callback(null, null);
      }
    });
  });
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
    WHERE 1=1
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

// ============================================================================
// HELPERS: Promisify database functions para usar async/await
// ============================================================================

/**
 * Ejecutar query que retorna un solo resultado (promisified)
 * @param {string} query - Query SQL
 * @param {Array} params - Parámetros del query
 * @returns {Promise<Object>} Resultado del query
 */
const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

/**
 * Ejecutar query que retorna múltiples resultados (promisified)
 * @param {string} query - Query SQL
 * @param {Array} params - Parámetros del query
 * @returns {Promise<Array>} Array de resultados
 */
const dbAll = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows || []);
      }
    });
  });
};

// ============================================================================
// SUBFUNCIONES: Cada una hace UNA cosa específica
// ============================================================================

/**
 * Contar registros en una tabla
 * @param {string} tabla - Nombre de la tabla
 * @returns {Promise<number>} Cantidad de registros
 */
const contarTabla = async (tabla) => {
  const resultado = await dbGet(`SELECT COUNT(*) as total FROM ${tabla}`);
  return resultado.total;
};

/**
 * Verificar si una tabla existe en la BD
 * @param {string} nombreTabla - Nombre de la tabla
 * @returns {Promise<boolean>} true si existe, false si no
 */
const tablaExiste = async (nombreTabla) => {
  const resultado = await dbGet(
    "SELECT COUNT(*) as total FROM sqlite_master WHERE type='table' AND name=?",
    [nombreTabla]
  );
  return resultado.total > 0;
};

/**
 * Obtener distribución de usuarios por rol
 * @returns {Promise<Object>} Objeto con conteos por rol
 */
const obtenerDistribucionRoles = async () => {
  const resultado = await dbGet(`
    SELECT 
      COUNT(CASE WHEN rol = 'administrador' THEN 1 END) as administradores,
      COUNT(CASE WHEN rol = 'experto' THEN 1 END) as expertos,
      COUNT(CASE WHEN rol = 'operador' THEN 1 END) as operadores
    FROM usuarios
  `);
  
  return {
    administradores: resultado.administradores,
    expertos: resultado.expertos,
    operadores: resultado.operadores
  };
};

/**
 * Obtener actividad reciente del sistema
 * @param {number} limite - Cantidad de registros a retornar
 * @returns {Promise<Array>} Array de actividades
 */
const obtenerActividadReciente = async (limite = 5) => {
  return await dbAll(`
    SELECT 
      'usuario' as tipo,
      'Nuevo usuario registrado: ' || nombre_completo as descripcion,
      created_at as fecha
    FROM usuarios 
    ORDER BY created_at DESC 
    LIMIT ?
  `, [limite]);
};

// ============================================================================
// FUNCIÓN PRINCIPAL REFACTORIZADA: obtenerMetricasAsync
// ============================================================================

/**
 * Obtener todas las métricas del sistema (versión async/await)
 * @returns {Promise<Object>} Objeto con todas las métricas
 */
const obtenerMetricasAsync = async () => {
  try {
    // Paso 1: Ejecutar consultas INDEPENDIENTES en PARALELO
    // Esto es 3-4x más rápido que secuencial!
    const [
      usuarios,
      documentos,
      categorias,
      existeCapacitaciones
    ] = await Promise.all([
      contarTabla('usuarios'),
      contarTabla('documentos'),
      contarTabla('categorias'),
      tablaExiste('capacitaciones')
    ]);
    
    // Paso 2: Contar capacitaciones si la tabla existe
    const capacitaciones = existeCapacitaciones 
      ? await contarTabla('capacitaciones')
      : 0;
    
    // Paso 3: Obtener datos adicionales en PARALELO
    const [
      usuariosPorRol,
      actividadReciente
    ] = await Promise.all([
      obtenerDistribucionRoles(),
      obtenerActividadReciente(5)
    ]);
    
    // Paso 4: Construir y retornar objeto de métricas
    return {
      usuarios,
      documentos,
      categorias,
      capacitaciones,
      usuariosPorRol,
      actividadReciente
    };
    
  } catch (error) {
    console.error('❌ Error al obtener métricas:', error);
    throw error;
  }
};

// ============================================================================
// VERSIÓN LEGACY: Mantener compatibilidad con callbacks
// ============================================================================

// Obtener métricas del sistema (versión legacy con callbacks)
// Este es un WRAPPER que usa la versión async internamente
const obtenerMetricas = (callback) => {
  obtenerMetricasAsync()
    .then(metricas => callback(null, metricas))
    .catch(err => callback(err, null));
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
      WHERE (
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
      WHERE (
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
      WHERE (
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

// 👥 CRUD DE USUARIOS - Solo para administradores

// Obtener usuario por ID
export function obtenerUsuarioPorId(id, callback) {
    const sql = `
        SELECT * FROM usuarios WHERE id = ?
    `;
    
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error('❌ Error al obtener usuario por ID:', err);
            callback(err, null);
        } else {
            callback(null, row || null);
        }
    });
}

// Crear nuevo usuario - ahora con contraseña hasheada
export function crearUsuario(datosUsuario, callback) {
    const { username, email, password, nombre_completo, rol } = datosUsuario;
    
    console.log('🔄 Creando usuario con datos:', { username, email, nombre_completo, rol });
    
    // Validar que el rol sea válido
    const rolesValidos = ['administrador', 'admin', 'experto', 'operador'];
    const rolFinal = rolesValidos.includes(rol) ? (rol === 'admin' ? 'administrador' : rol) : 'operador';
    
    // Hashear contraseña antes de guardarla
    bcrypt.hash(password, 10, (hashErr, passwordHash) => {
        if (hashErr) {
            console.error('❌ Error al hashear contraseña:', hashErr);
            return callback(hashErr, null);
        }
        
        const sql = `
            INSERT INTO usuarios (username, email, password, nombre_completo, rol, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `;
        
        db.run(sql, [username, email, passwordHash, nombre_completo, rolFinal], function(err) {
            if (err) {
                console.error('❌ Error al crear usuario:', err);
                callback(err, null);
            } else {
                console.log(`✅ Usuario creado con ID: ${this.lastID}`);
                callback(null, this.lastID);
            }
        });
    });
}

// Actualizar usuario - ahora con contraseña hasheada si se proporciona
export function actualizarUsuario(id, datosActualizacion, callback) {
    const { username, email, password, nombre_completo, rol } = datosActualizacion;
    
    console.log('🔄 Actualizando usuario con datos:', { id, username, email, nombre_completo, rol });
    
    // Validar que el rol sea válido
    const rolesValidos = ['administrador', 'admin', 'experto', 'operador'];
    const rolFinal = rolesValidos.includes(rol) ? (rol === 'admin' ? 'administrador' : rol) : 'operador';
    
    // Si hay nueva contraseña, hashearla
    if (password) {
        bcrypt.hash(password, 10, (hashErr, passwordHash) => {
            if (hashErr) {
                console.error('❌ Error al hashear contraseña:', hashErr);
                return callback(hashErr, null);
            }
            
            const sql = `
                UPDATE usuarios 
                SET username = ?, email = ?, password = ?, nombre_completo = ?, rol = ?
                WHERE id = ?
            `;
            const params = [username, email, passwordHash, nombre_completo, rolFinal, id];
            
            db.run(sql, params, function(err) {
                if (err) {
                    console.error('❌ Error al actualizar usuario:', err);
                    callback(err, null);
                } else {
                    console.log(`✅ Usuario ${id} actualizado exitosamente`);
                    callback(null, { changes: this.changes });
                }
            });
        });
    } else {
        // Actualizar sin cambiar contraseña
        const sql = `
            UPDATE usuarios 
            SET username = ?, email = ?, nombre_completo = ?, rol = ?
            WHERE id = ?
        `;
        const params = [username, email, nombre_completo, rolFinal, id];
        
        db.run(sql, params, function(err) {
            if (err) {
                console.error('❌ Error al actualizar usuario:', err);
                callback(err, null);
            } else {
                console.log(`✅ Usuario ${id} actualizado exitosamente`);
                callback(null, { changes: this.changes });
            }
        });
    }
}

// Eliminar usuario
export function eliminarUsuario(id, callback) {
    const sql = 'DELETE FROM usuarios WHERE id = ?';
    
    db.run(sql, [id], function(err) {
        if (err) {
            console.error('❌ Error al eliminar usuario:', err);
            callback(err, null);
        } else {
            console.log(`✅ Usuario eliminado. Filas afectadas: ${this.changes}`);
            callback(null, this.changes > 0);
        }
    });
}

// Verificar si usuario existe (por username o email)
export function verificarUsuarioExiste(username, email, callback) {
    const sql = 'SELECT id FROM usuarios WHERE username = ? OR email = ?';
    
    db.get(sql, [username, email], (err, row) => {
        if (err) {
            console.error('❌ Error al verificar usuario:', err);
            callback(err, null);
        } else {
            callback(null, !!row);
        }
    });
}

export { 
  inicializarDB, 
  obtenerUsuarioConRol,
  obtenerTodosUsuarios,
  obtenerCategorias,
  obtenerDocumentos,
  obtenerMetricas,
  obtenerMetricasAsync,  // Nueva versión con async/await
  buscarContenido
};