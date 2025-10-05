// 🚀 run-all-migrations.js - Script para ejecutar todas las migraciones pendientes
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Iniciando ejecución de migraciones...');

const db = new sqlite3.Database('./saber_citricola.db', (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('✅ Conexión a la base de datos establecida');
});

// Lista de migraciones a ejecutar en orden
const migraciones = [
  'comentarios_safe.sql',    // Migración segura - solo tablas complementarias
  'versiones.sql', 
  'notificaciones.sql'
];

// Función para ejecutar una migración
const ejecutarMigracion = (nombreArchivo) => {
  return new Promise((resolve, reject) => {
    const migrationPath = path.join(__dirname, 'migrations', nombreArchivo);
    
    console.log(`\n📁 Ejecutando migración: ${nombreArchivo}`);
    
    try {
      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log(`✅ Archivo ${nombreArchivo} leído correctamente`);
      
      // Ejecutar la migración
      db.exec(sql, (err) => {
        if (err) {
          console.error(`❌ Error ejecutando ${nombreArchivo}:`, err.message);
          reject(err);
        } else {
          console.log(`✅ Migración ${nombreArchivo} ejecutada exitosamente`);
          resolve();
        }
      });
      
    } catch (error) {
      console.error(`❌ Error leyendo ${nombreArchivo}:`, error.message);
      reject(error);
    }
  });
};

// Función para verificar las tablas creadas
const verificarTablas = () => {
  return new Promise((resolve, reject) => {
    console.log('\n🔍 Verificando tablas creadas...');
    
    const checkTablesQuery = `
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND (
        name LIKE '%comentario%' OR 
        name LIKE '%version%' OR 
        name LIKE '%notificacion%' OR
        name LIKE '%suscripcion%' OR
        name LIKE '%plantilla%'
      )
      ORDER BY name
    `;
    
    db.all(checkTablesQuery, (err, tables) => {
      if (err) {
        console.error('❌ Error consultando tablas:', err.message);
        reject(err);
      } else {
        console.log('📚 Nuevas tablas creadas:');
        tables.forEach(table => console.log(`  ✓ ${table.name}`));
        resolve(tables);
      }
    });
  });
};

// Función principal para ejecutar todas las migraciones
const ejecutarTodasLasMigraciones = async () => {
  try {
    console.log(`🎯 Se ejecutarán ${migraciones.length} migraciones:`);
    migraciones.forEach((migration, index) => {
      console.log(`  ${index + 1}. ${migration}`);
    });
    
    // Ejecutar cada migración secuencialmente
    for (const migracion of migraciones) {
      await ejecutarMigracion(migracion);
    }
    
    // Verificar resultados
    await verificarTablas();
    
    console.log('\n🎉 ¡Todas las migraciones ejecutadas exitosamente!');
    console.log('💡 Las nuevas funcionalidades están disponibles:');
    console.log('  ✅ Sistema de comentarios en documentos');
    console.log('  ✅ Historial de versiones de documentos');
    console.log('  ✅ Sistema de notificaciones push');
    
  } catch (error) {
    console.error('\n❌ Error durante la ejecución de migraciones:', error.message);
    console.log('\n🔧 Soluciones posibles:');
    console.log('  1. Verifica que los archivos de migración existen en la carpeta migrations/');
    console.log('  2. Revisa que la sintaxis SQL es correcta');
    console.log('  3. Asegúrate de que la base de datos no está siendo usada por otra aplicación');
    
  } finally {
    console.log('\n🔚 Cerrando conexión a la base de datos...');
    db.close((err) => {
      if (err) {
        console.error('❌ Error cerrando la base de datos:', err.message);
      } else {
        console.log('✅ Conexión cerrada correctamente');
      }
    });
  }
};

// Ejecutar las migraciones
ejecutarTodasLasMigraciones();