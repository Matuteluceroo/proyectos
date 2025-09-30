// database.js - Conexión y configuración de SQLite
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Obtener la ruta actual del archivo
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Crear la base de datos en un archivo llamado 'saber_citricola.db'
const dbPath = join(__dirname, 'saber_citricola.db');

// Configurar SQLite en modo verbose para ver las consultas
const sqlite = sqlite3.verbose();

// Crear la conexión
const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar con SQLite:', err.message);
  } else {
    console.log('✅ Conectado a SQLite exitosamente');
    console.log(`📁 Base de datos ubicada en: ${dbPath}`);
  }
});

// Crear la tabla de usuarios si no existe
const crearTablaUsuarios = () => {
  const sql = `
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  db.run(sql, (err) => {
    if (err) {
      console.error('❌ Error al crear tabla usuarios:', err.message);
    } else {
      console.log('📋 Tabla "usuarios" lista');
    }
  });
};

// Función para insertar un usuario de prueba
const insertarUsuarioPrueba = () => {
  const checkUser = "SELECT COUNT(*) as count FROM usuarios WHERE username = ?";
  
  db.get(checkUser, ['admin'], (err, row) => {
    if (err) {
      console.error('❌ Error al verificar usuario:', err.message);
      return;
    }
    
    if (row.count === 0) {
      const insertUser = "INSERT INTO usuarios (username, password, email) VALUES (?, ?, ?)";
      db.run(insertUser, ['admin', '123456', 'admin@sabercitricola.com'], (err) => {
        if (err) {
          console.error('❌ Error al insertar usuario de prueba:', err.message);
        } else {
          console.log('👤 Usuario de prueba creado: admin/123456');
        }
      });
    } else {
      console.log('👤 Usuario admin ya existe');
    }
  });
};

// Función para obtener todos los usuarios
const obtenerUsuarios = (callback) => {
  const sql = "SELECT id, username, email, created_at FROM usuarios";
  db.all(sql, [], callback);
};

// Función para verificar login
const verificarLogin = (username, password, callback) => {
  const sql = "SELECT id, username, email FROM usuarios WHERE username = ? AND password = ?";
  db.get(sql, [username, password], callback);
};

// Inicializar la base de datos
const inicializarDB = () => {
  crearTablaUsuarios();
  setTimeout(() => {
    insertarUsuarioPrueba();
  }, 100); // Pequeño delay para asegurar que la tabla esté creada
};

// Exportar las funciones
export { 
  db, 
  inicializarDB, 
  obtenerUsuarios, 
  verificarLogin 
};