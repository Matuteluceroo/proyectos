// 🛠️ run-migration.js - Script para ejecutar migraciones de base de datos
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 📄 Función para ejecutar una migración
const ejecutarMigracion = (archivoSQL) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('🔄 Iniciando migración:', archivoSQL);
      
      // 📂 Verificar que el archivo existe
      const rutaArchivo = path.resolve(__dirname, archivoSQL);
      if (!fs.existsSync(rutaArchivo)) {
        console.error('❌ Error: Archivo no encontrado:', rutaArchivo);
        reject(new Error('Archivo no encontrado'));
        return;
      }
      
      // 📖 Leer el archivo SQL
      const sqlContent = fs.readFileSync(rutaArchivo, 'utf8');
      console.log('📖 Archivo SQL leído correctamente');
      
      // 🗄️ Conectar a la base de datos
      const dbPath = path.resolve(__dirname, '..', 'saber_citricola.db');
      console.log('🗄️ Conectando a la base de datos:', dbPath);
      
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Error al conectar con la base de datos:', err.message);
          reject(err);
          return;
        }
        
        console.log('✅ Conectado a la base de datos SQLite');
        
        // ⚙️ Habilitar foreign keys
        db.run('PRAGMA foreign_keys = ON', (err) => {
          if (err) {
            console.error('❌ Error al habilitar foreign keys:', err.message);
            reject(err);
            return;
          }
          
          // 🔄 Dividir el contenido en declaraciones individuales
          const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
          
          console.log(`📝 Ejecutando ${statements.length} declaraciones SQL...`);
          
          // 🎯 Ejecutar cada declaración secuencialmente
          let currentIndex = 0;
          
          const executeNext = () => {
            if (currentIndex >= statements.length) {
              // ✅ Todas las declaraciones ejecutadas
              db.close((err) => {
                if (err) {
                  console.error('❌ Error al cerrar la base de datos:', err.message);
                  reject(err);
                } else {
                  console.log('✅ Migración completada exitosamente!');
                  console.log('🎉 Base de datos actualizada correctamente');
                  resolve();
                }
              });
              return;
            }
            
            const statement = statements[currentIndex];
            if (statement.trim()) {
              console.log(`  ${currentIndex + 1}/${statements.length}: Ejecutando...`);
              
              db.run(statement, (err) => {
                if (err) {
                  console.error(`❌ Error en declaración ${currentIndex + 1}:`, statement.substring(0, 100) + '...');
                  console.error('❌ Detalles del error:', err.message);
                  reject(err);
                  return;
                }
                
                console.log(`  ✅ Declaración ${currentIndex + 1} ejecutada correctamente`);
                currentIndex++;
                executeNext();
              });
            } else {
              currentIndex++;
              executeNext();
            }
          };
          
          executeNext();
        });
      });
      
    } catch (error) {
      console.error('❌ Error durante la migración:', error.message);
      reject(error);
    }
  });
};

// 🎯 Verificar argumentos de línea de comandos
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('📋 Uso: node run-migration.js <archivo.sql>');
  console.log('📋 Ejemplo: node run-migration.js comentarios.sql');
  process.exit(1);
}

const archivoSQL = args[0];

// 🚀 Ejecutar la migración
ejecutarMigracion(archivoSQL)
  .then(() => {
    console.log('🎉 Proceso completado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error en el proceso:', error.message);
    process.exit(1);
  });