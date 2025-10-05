// 🚀 run-migration.js - Script para ejecutar migración de capacitaciones
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Iniciando migración de capacitaciones...');

const db = new sqlite3.Database('./saber_citricola.db', (err) => {
  if (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('✅ Conexión a la base de datos establecida');
});

// Leer el archivo de migración
const migrationPath = path.join(__dirname, 'migrations', 'capacitaciones.sql');

try {
  const sql = fs.readFileSync(migrationPath, 'utf8');
  console.log('📄 Archivo de migración leído correctamente');
  
  // Ejecutar la migración
  db.exec(sql, (err) => {
    if (err) {
      console.error('❌ Error ejecutando migración:', err.message);
      db.close();
      process.exit(1);
    } else {
      console.log('✅ Migración de capacitaciones ejecutada exitosamente');
      
      // Verificar que las tablas se crearon
      const checkTablesQuery = `
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND (name LIKE '%capacit%' OR name LIKE '%modulo%' OR name LIKE '%leccion%')
        ORDER BY name
      `;
      
      db.all(checkTablesQuery, (err, tables) => {
        if (err) {
          console.error('❌ Error consultando tablas:', err.message);
        } else {
          console.log('📚 Tablas de capacitación creadas:');
          tables.forEach(table => console.log(`  ✓ ${table.name}`));
          
          // Verificar estructura de una tabla específica
          db.all("PRAGMA table_info(modulos_capacitacion)", (err, columns) => {
            if (err) {
              console.error('❌ Error verificando estructura:', err.message);
            } else {
              console.log('\n🔍 Estructura de tabla modulos_capacitacion:');
              columns.forEach(col => {
                console.log(`  - ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : ''}`);
              });
            }
            
            console.log('\n🎉 Migración completada exitosamente');
            db.close();
          });
        }
      });
    }
  });
  
} catch (error) {
  console.error('❌ Error leyendo archivo de migración:', error.message);
  console.error('🔍 Verifica que el archivo migrations/capacitaciones.sql existe');
  db.close();
  process.exit(1);
}