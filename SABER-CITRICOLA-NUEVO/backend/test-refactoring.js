// 🧪 test-refactoring.js - Script para verificar la refactorización
// Ejecutar: node test-refactoring.js

import db from './config/database.js';
import { 
  obtenerTodosUsuarios,
  obtenerCategorias,
  obtenerMetricas,
  buscarContenido,
  obtenerUsuarioConRol
} from './database-citricola.js';

let testsPasados = 0;
let testsTotal = 0;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(emoji, color, message) {
  console.log(`${emoji} ${color}${message}${colors.reset}`);
}

function testPassed(testName) {
  testsPasados++;
  testsTotal++;
  log('✅', colors.green, `PASADO: ${testName}`);
}

function testFailed(testName, error) {
  testsTotal++;
  log('❌', colors.red, `FALLIDO: ${testName}`);
  console.error('   Error:', error.message || error);
}

async function runTests() {
  console.log('\n' + '='.repeat(60));
  log('🧪', colors.cyan, 'INICIANDO TESTS DE REFACTORIZACIÓN');
  console.log('='.repeat(60) + '\n');

  // TEST 1: Verificar que la conexión existe
  try {
    if (db && typeof db.get === 'function') {
      testPassed('Test 1.1 - Instancia de DB existe');
    } else {
      testFailed('Test 1.1 - Instancia de DB existe', new Error('DB no es válida'));
    }
  } catch (error) {
    testFailed('Test 1.1 - Instancia de DB existe', error);
  }

  // TEST 2: Verificar que foreign keys están habilitadas
  try {
    await new Promise((resolve, reject) => {
      db.get('PRAGMA foreign_keys', (err, row) => {
        if (err) {
          reject(err);
        } else if (row.foreign_keys === 1) {
          testPassed('Test 1.2 - Foreign Keys habilitadas');
          resolve();
        } else {
          reject(new Error('Foreign keys no habilitadas'));
        }
      });
    });
  } catch (error) {
    testFailed('Test 1.2 - Foreign Keys habilitadas', error);
  }

  // TEST 3: Verificar que hay usuarios en la BD
  try {
    const count = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM usuarios', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    
    if (count >= 3) {
      testPassed(`Test 2.1 - Base de datos tiene ${count} usuarios`);
    } else {
      testFailed('Test 2.1 - Base de datos tiene usuarios', new Error(`Solo ${count} usuarios encontrados`));
    }
  } catch (error) {
    testFailed('Test 2.1 - Base de datos tiene usuarios', error);
  }

  // TEST 4: Verificar función obtenerTodosUsuarios
  try {
    await new Promise((resolve, reject) => {
      obtenerTodosUsuarios((err, usuarios) => {
        if (err) {
          reject(err);
        } else if (usuarios && usuarios.length >= 3) {
          testPassed(`Test 2.2 - obtenerTodosUsuarios() retorna ${usuarios.length} usuarios`);
          resolve();
        } else {
          reject(new Error('No se obtuvieron usuarios'));
        }
      });
    });
  } catch (error) {
    testFailed('Test 2.2 - obtenerTodosUsuarios()', error);
  }

  // TEST 5: Verificar función obtenerCategorias
  try {
    await new Promise((resolve, reject) => {
      obtenerCategorias((err, categorias) => {
        if (err) {
          reject(err);
        } else if (categorias && categorias.length >= 5) {
          testPassed(`Test 3.1 - obtenerCategorias() retorna ${categorias.length} categorías`);
          resolve();
        } else {
          reject(new Error('No se obtuvieron categorías'));
        }
      });
    });
  } catch (error) {
    testFailed('Test 3.1 - obtenerCategorias()', error);
  }

  // TEST 6: Verificar función obtenerMetricas
  try {
    await new Promise((resolve, reject) => {
      obtenerMetricas((err, metricas) => {
        if (err) {
          reject(err);
        } else if (metricas && metricas.usuarios >= 3 && metricas.categorias >= 5) {
          testPassed('Test 3.2 - obtenerMetricas() retorna datos válidos');
          resolve();
        } else {
          reject(new Error('Métricas inválidas'));
        }
      });
    });
  } catch (error) {
    testFailed('Test 3.2 - obtenerMetricas()', error);
  }

  // TEST 7: Verificar función buscarContenido
  try {
    await new Promise((resolve, reject) => {
      buscarContenido('admin', { tipo: 'usuarios' }, (err, resultados) => {
        if (err) {
          reject(err);
        } else if (resultados && resultados.length >= 1) {
          testPassed(`Test 3.3 - buscarContenido() encuentra ${resultados.length} resultado(s)`);
          resolve();
        } else {
          reject(new Error('Búsqueda no retornó resultados'));
        }
      });
    });
  } catch (error) {
    testFailed('Test 3.3 - buscarContenido()', error);
  }

  // TEST 8: Verificar autenticación correcta
  try {
    await new Promise((resolve, reject) => {
      obtenerUsuarioConRol('admin', '123456', (err, usuario) => {
        if (err) {
          reject(err);
        } else if (usuario && usuario.username === 'admin' && usuario.rol === 'administrador') {
          testPassed('Test 4.1 - Autenticación con credenciales correctas');
          resolve();
        } else {
          reject(new Error('Usuario no autenticado correctamente'));
        }
      });
    });
  } catch (error) {
    testFailed('Test 4.1 - Autenticación correcta', error);
  }

  // TEST 9: Verificar autenticación incorrecta
  try {
    await new Promise((resolve, reject) => {
      obtenerUsuarioConRol('admin', 'incorrecta', (err, usuario) => {
        if (err) {
          reject(err);
        } else if (usuario === null) {
          testPassed('Test 4.2 - Autenticación con credenciales incorrectas rechazada');
          resolve();
        } else {
          reject(new Error('Debería rechazar credenciales incorrectas'));
        }
      });
    });
  } catch (error) {
    testFailed('Test 4.2 - Autenticación incorrecta', error);
  }

  // TEST 10: Verificar que las tablas existen
  try {
    const tablas = ['usuarios', 'categorias', 'documentos', 'capacitaciones', 'comentarios'];
    let tablasExistentes = 0;
    
    for (const tabla of tablas) {
      await new Promise((resolve, reject) => {
        db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tabla], (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            tablasExistentes++;
            resolve();
          } else {
            reject(new Error(`Tabla ${tabla} no existe`));
          }
        });
      });
    }
    
    if (tablasExistentes === tablas.length) {
      testPassed(`Test 5.1 - Todas las tablas existen (${tablasExistentes}/${tablas.length})`);
    }
  } catch (error) {
    testFailed('Test 5.1 - Verificar tablas', error);
  }

  // RESUMEN
  console.log('\n' + '='.repeat(60));
  const porcentaje = Math.round((testsPasados / testsTotal) * 100);
  const color = porcentaje === 100 ? colors.green : porcentaje >= 80 ? colors.yellow : colors.red;
  
  log('📊', color, `RESULTADO: ${testsPasados}/${testsTotal} tests pasados (${porcentaje}%)`);
  console.log('='.repeat(60) + '\n');

  if (testsPasados === testsTotal) {
    log('🎉', colors.green, '¡TODOS LOS TESTS PASARON! La refactorización fue exitosa.');
    log('✅', colors.green, 'Puedes continuar con el siguiente paso.');
  } else {
    log('⚠️', colors.yellow, `${testsTotal - testsPasados} test(s) fallaron.`);
    log('🔧', colors.yellow, 'Revisa los errores antes de continuar.');
  }

  // Cerrar conexión
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar BD:', err);
    }
    process.exit(testsPasados === testsTotal ? 0 : 1);
  });
}

// Ejecutar tests
runTests().catch(error => {
  console.error('\n❌ Error fatal durante los tests:', error);
  process.exit(1);
});

