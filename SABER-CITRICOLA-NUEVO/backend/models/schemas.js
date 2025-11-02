/**
 * 📐 SCHEMAS.JS - Definiciones de tablas de la base de datos
 * ============================================================
 * Este módulo contiene todas las definiciones SQL de las tablas
 * y la lógica para inicializar la base de datos.
 */

import db from '../config/database.js';
import { crearUsuario } from '../database-citricola.js'; // Para insertar usuarios de prueba

// 📋 DEFINICIONES DE TABLAS
// ===========================

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

// 📋 LISTA DE TABLAS
// ===================
const TABLAS = [
  { nombre: 'usuarios', sql: tablaUsuarios },
  { nombre: 'categorias', sql: tablaCategorias },
  { nombre: 'documentos', sql: tablaDocumentos },
  { nombre: 'capacitaciones', sql: tablaCapacitaciones },
  { nombre: 'progreso_capacitaciones', sql: tablaProgreso },
  { nombre: 'metricas', sql: tablaMetricas },
  { nombre: 'comentarios', sql: tablaComentarios }
];

// 🏗️ FUNCIÓN: Crear todas las tablas
// ======================================
const crearTablas = () => {
  return new Promise((resolve, reject) => {
    let completadas = 0;
    let errores = [];

    TABLAS.forEach(tabla => {
      db.run(tabla.sql, (err) => {
        if (err) {
          console.error(`❌ Error al crear tabla ${tabla.nombre}:`, err.message);
          errores.push({ tabla: tabla.nombre, error: err.message });
        } else {
          console.log(`📋 Tabla "${tabla.nombre}" lista`);
        }

        completadas++;
        if (completadas === TABLAS.length) {
          if (errores.length > 0) {
            reject(errores);
          } else {
            resolve();
          }
        }
      });
    });
  });
};

// 🌱 FUNCIÓN: Insertar datos de prueba
// ======================================
const insertarDatosPrueba = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Verificar si ya existen usuarios
      db.get("SELECT COUNT(*) as count FROM usuarios", (err, row) => {
        if (err) {
          console.error('❌ Error al verificar usuarios:', err.message);
          return reject(err);
        }

        if (row.count === 0) {
          console.log('👤 Creando usuarios de prueba...');
          
          // Crear usuarios usando la función que ya hashea contraseñas
          const usuarios = [
            { username: 'admin', password: '123456', email: 'admin@sabercitricola.com', nombre_completo: 'Juan Administrador', rol: 'administrador' },
            { username: 'experto1', password: '123456', email: 'experto1@sabercitricola.com', nombre_completo: 'María González', rol: 'experto' },
            { username: 'operador1', password: '123456', email: 'operador1@sabercitricola.com', nombre_completo: 'Pedro Martínez', rol: 'operador' }
          ];

          let usuariosCreados = 0;
          usuarios.forEach((userData, index) => {
            setTimeout(() => {
              crearUsuario(userData, (err, result) => {
                if (err) {
                  console.error(`❌ Error al crear usuario ${userData.username}:`, err.message);
                } else {
                  console.log(`👤 Usuario ${userData.username} (${userData.rol}) creado exitosamente`);
                }
                
                usuariosCreados++;
                if (usuariosCreados === usuarios.length) {
                  // Después de crear usuarios, crear categorías
                  crearCategoriasPrueba(resolve, reject);
                }
              });
            }, index * 100);
          });
        } else {
          console.log('👤 Usuarios de prueba ya existen');
          
          // Verificar si existen categorías
          db.get("SELECT COUNT(*) as count FROM categorias", (err, row) => {
            if (err || row.count === 0) {
              crearCategoriasPrueba(resolve, reject);
            } else {
              console.log('📚 Categorías de prueba ya existen');
              resolve();
            }
          });
        }
      });
    }, 1000);
  });
};

// 📚 FUNCIÓN AUXILIAR: Crear categorías de prueba
// =================================================
const crearCategoriasPrueba = (resolve, reject) => {
  const categorias = [
    ['Manejo de Cultivos', 'Técnicas y procedimientos para el manejo de cultivos citrícolas', '#4CAF50', '🌱'],
    ['Control de Plagas', 'Identificación y control de plagas en cítricos', '#FF5722', '🐛'],
    ['Calidad de Frutos', 'Estándares y control de calidad de productos citrícolas', '#FF9800', '🍊'],
    ['Maquinaria', 'Operación y mantenimiento de equipos agrícolas', '#607D8B', '🚜'],
    ['Seguridad', 'Normas y procedimientos de seguridad en el trabajo', '#F44336', '⚠️']
  ];

  let categoriasCreadas = 0;
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
        
        categoriasCreadas++;
        if (categoriasCreadas === categorias.length) {
          resolve();
        }
      }
    );
  });
};

// 🚀 FUNCIÓN PRINCIPAL: Inicializar base de datos
// =================================================
export const initializeDatabase = async () => {
  try {
    console.log('📐 Creando esquema de base de datos...');
    await crearTablas();
    console.log('✅ Esquema de base de datos creado exitosamente');
    
    console.log('🌱 Insertando datos de prueba...');
    await insertarDatosPrueba();
    console.log('✅ Datos de prueba insertados exitosamente');
    
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    throw error;
  }
};

// 📤 EXPORTACIONES
// =================
export {
  TABLAS,
  crearTablas,
  insertarDatosPrueba,
  tablaUsuarios,
  tablaCategorias,
  tablaDocumentos,
  tablaCapacitaciones,
  tablaProgreso,
  tablaMetricas,
  tablaComentarios
};

