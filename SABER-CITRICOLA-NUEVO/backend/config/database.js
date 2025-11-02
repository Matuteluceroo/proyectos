// 🗄️ config/database.js - Configuración de conexión a SQLite
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuración de rutas para ESM (ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path de la base de datos (un nivel arriba de config/)
const dbPath = join(__dirname, '..', 'saber_citricola.db');

// Activar modo verbose para debug (útil en desarrollo)
const sqlite = sqlite3.verbose();

// Crear conexión única a la base de datos
const db = new sqlite.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error al conectar con SQLite:', err.message);
    process.exit(1); // Salir si no hay conexión (crítico)
  } else {
    console.log('✅ Conectado a SQLite exitosamente');
    console.log(`📁 Base de datos ubicada en: ${dbPath}`);
  }
});

// Habilitar foreign keys (IMPORTANTE para integridad referencial)
// Por defecto SQLite las tiene deshabilitadas
db.run('PRAGMA foreign_keys = ON', (err) => {
  if (err) {
    console.error('⚠️ Error al habilitar foreign keys:', err.message);
  } else {
    console.log('🔒 Foreign keys habilitadas');
  }
});

// Exportar instancia única de la base de datos
export default db;

// Exportar el path por si se necesita (útil para backups)
export { dbPath };

