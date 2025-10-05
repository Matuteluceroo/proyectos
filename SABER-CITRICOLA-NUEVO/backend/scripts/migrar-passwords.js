// 🔧 Script para migrar contraseñas existentes de texto plano a bcrypt
import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dbPath = join(__dirname, '..', 'saber_citricola.db');
const sqlite = sqlite3.verbose();

const db = new sqlite.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error al conectar con SQLite:', err.message);
    } else {
        console.log('✅ Conectado a la base de datos SQLite');
    }
});

async function migrarPasswords() {
    try {
        console.log('🔄 Iniciando migración de contraseñas...');
        
        // Obtener todos los usuarios con contraseñas en texto plano
        const usuarios = await new Promise((resolve, reject) => {
            db.all('SELECT id, username, password FROM usuarios', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        console.log(`📋 Encontrados ${usuarios.length} usuarios para migrar`);
        
        for (const usuario of usuarios) {
            // Verificar si la contraseña ya está hasheada (bcrypt genera hashes que empiezan con $2b$)
            if (usuario.password.startsWith('$2b$')) {
                console.log(`⏭️  Usuario ${usuario.username} ya tiene contraseña hasheada`);
                continue;
            }
            
            // Hashear la contraseña actual
            const passwordHash = await bcrypt.hash(usuario.password, 10);
            
            // Actualizar en la base de datos
            await new Promise((resolve, reject) => {
                db.run(
                    'UPDATE usuarios SET password = ? WHERE id = ?',
                    [passwordHash, usuario.id],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
            
            console.log(`✅ Contraseña migrada para usuario: ${usuario.username}`);
        }
        
        console.log('🎉 ¡Migración completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error durante la migración:', error);
    } finally {
        db.close((err) => {
            if (err) {
                console.error('❌ Error al cerrar la base de datos:', err.message);
            } else {
                console.log('🔐 Base de datos cerrada');
            }
        });
    }
}

// Ejecutar migración
migrarPasswords();