import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Crear la base de datos SQLite
const dbPath = join(__dirname, 'saber_citricola.db')

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error conectando a SQLite:', err.message)
  } else {
    console.log('✅ Conectado a la base de datos SQLite')
    
    // Crear tablas básicas si no existen
    createTables()
  }
})

function createTables() {
  // Tabla de usuarios
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Tabla de documentos
  db.run(`CREATE TABLE IF NOT EXISTS documentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    contenido TEXT,
    tipo TEXT,
    usuario_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
  )`)

  // Tabla de contenidos
  db.run(`CREATE TABLE IF NOT EXISTS contenidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    categoria TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // Insertar usuario admin por defecto
  db.run(`INSERT OR IGNORE INTO usuarios (username, password, email) 
          VALUES ('admin', 'admin123', 'admin@sabercitricola.com')`)

  console.log('✅ Tablas de base de datos creadas/verificadas')
}

export const connectToDatabase = async () => {
  try {
    console.log('Conexión a SQLite saber_citricola.db')
    return db
  } catch (err) {
    console.error('Error en la conexión a SQLite:', err)
    return 0
  }
}

export { db }