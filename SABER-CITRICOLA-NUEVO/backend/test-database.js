// 🔍 test-database.js - Verificar el estado de la base de datos
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, 'saber_citricola.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error al conectar:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos');
    }
});

// Verificar usuarios
db.all('SELECT username, substr(password, 1, 20) as password_preview, length(password) as password_length FROM usuarios', (err, rows) => {
    if (err) {
        console.error('❌ Error al consultar usuarios:', err);
    } else {
        console.log('👥 Usuarios en la base de datos:');
        console.table(rows);
    }
    
    db.close((err) => {
        if (err) {
            console.error('❌ Error al cerrar DB:', err.message);
        } else {
            console.log('🔐 Base de datos cerrada');
        }
    });
});