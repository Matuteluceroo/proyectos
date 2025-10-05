// 🔍 diagnostico.js - Script para diagnosticar problemas del servidor
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Iniciando diagnóstico del servidor...\n');

// ✅ 1. Verificar estructura de archivos
console.log('📁 1. Verificando estructura de archivos:');
const archivosEsenciales = [
  'app.js',
  'database-citricola.js',
  'package.json',
  'saber_citricola.db',
  'routes/comentarios.js',
  'routes/versiones.js',
  'routes/notificaciones.js',
  'controllers/comentarios.js',
  'controllers/versiones.js',
  'controllers/notificaciones.js',
  'models/comentarios.js',
  'models/versiones.js',
  'models/notificaciones.js'
];

archivosEsenciales.forEach(archivo => {
  const rutaCompleta = path.join(__dirname, archivo);
  if (fs.existsSync(rutaCompleta)) {
    console.log(`   ✅ ${archivo}`);
  } else {
    console.log(`   ❌ ${archivo} - NO ENCONTRADO`);
  }
});

// ✅ 2. Verificar base de datos
console.log('\n🗄️ 2. Verificando base de datos:');
const dbPath = path.join(__dirname, 'saber_citricola.db');
if (fs.existsSync(dbPath)) {
  const stats = fs.statSync(dbPath);
  console.log(`   ✅ saber_citricola.db existe (${(stats.size / 1024).toFixed(2)} KB)`);
} else {
  console.log('   ❌ saber_citricola.db no encontrada');
}

// ✅ 3. Verificar imports
console.log('\n📦 3. Verificando imports...');
try {
  console.log('   🔄 Importando database-citricola.js...');
  const db = await import('./database-citricola.js');
  console.log('   ✅ database-citricola.js importado correctamente');
  
  console.log('   🔄 Importando rutas...');
  const comentariosRoutes = await import('./routes/comentarios.js');
  const versionesRoutes = await import('./routes/versiones.js');
  const notificacionesRoutes = await import('./routes/notificaciones.js');
  console.log('   ✅ Rutas importadas correctamente');

  console.log('   🔄 Importando controladores...');
  const comentariosController = await import('./controllers/comentarios.js');
  const versionesController = await import('./controllers/versiones.js');
  const notificacionesController = await import('./controllers/notificaciones.js');
  console.log('   ✅ Controladores importados correctamente');

  console.log('   🔄 Importando modelos...');
  const comentariosModel = await import('./models/comentarios.js');
  const versionesModel = await import('./models/versiones.js');
  const notificacionesModel = await import('./models/notificaciones.js');
  console.log('   ✅ Modelos importados correctamente');

} catch (error) {
  console.error('   ❌ Error importando módulos:', error.message);
  console.error('   📍 Stack trace:', error.stack);
}

// ✅ 4. Verificar tablas en la BD
console.log('\n🗄️ 4. Verificando tablas en base de datos...');
try {
  const sqlite3 = await import('sqlite3');
  const db = new sqlite3.default.Database('./saber_citricola.db');
  
  await new Promise((resolve, reject) => {
    const query = `
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND (
        name LIKE '%comentario%' OR 
        name LIKE '%version%' OR 
        name LIKE '%notificacion%'
      )
      ORDER BY name
    `;
    
    db.all(query, (err, tables) => {
      if (err) {
        console.error('   ❌ Error consultando tablas:', err.message);
        reject(err);
      } else {
        console.log('   📚 Tablas relacionadas encontradas:');
        if (tables.length === 0) {
          console.log('   ⚠️ No se encontraron tablas relacionadas');
        } else {
          tables.forEach(table => {
            console.log(`     ✓ ${table.name}`);
          });
        }
        resolve();
      }
      db.close();
    });
  });

} catch (error) {
  console.error('   ❌ Error verificando tablas:', error.message);
}

console.log('\n🎯 Diagnóstico completado');
console.log('\n💡 Para iniciar el servidor:');
console.log('   node app.js');
console.log('\n🔧 Si hay errores, revisar:');
console.log('   1. Dependencias instaladas: npm install');
console.log('   2. Base de datos migrada correctamente');
console.log('   3. Sintaxis de ES6 modules en todos los archivos');