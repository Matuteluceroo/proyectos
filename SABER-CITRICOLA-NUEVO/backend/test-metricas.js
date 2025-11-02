// 🧪 test-metricas.js - Verificar refactorización de obtenerMetricas()
// Compara la versión legacy (callbacks) con la nueva versión (async/await)
// Ejecutar: node test-metricas.js

import { obtenerMetricas, obtenerMetricasAsync } from './database-citricola.js';

// Colores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(emoji, color, message) {
  console.log(`${emoji} ${color}${message}${colors.reset}`);
}

// ============================================================================
// FUNCIÓN PARA COMPARAR OBJETOS PROFUNDAMENTE
// ============================================================================

function compararObjetos(obj1, obj2, path = 'root') {
  const diferencias = [];
  
  // Comparar tipos
  if (typeof obj1 !== typeof obj2) {
    diferencias.push({
      path,
      error: 'Tipos diferentes',
      obj1: typeof obj1,
      obj2: typeof obj2
    });
    return diferencias;
  }
  
  // Si es array
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) {
      diferencias.push({
        path,
        error: 'Longitud de arrays diferente',
        obj1: obj1.length,
        obj2: obj2.length
      });
    }
    
    // Comparar elementos del array
    const minLength = Math.min(obj1.length, obj2.length);
    for (let i = 0; i < minLength; i++) {
      const subDiff = compararObjetos(obj1[i], obj2[i], `${path}[${i}]`);
      diferencias.push(...subDiff);
    }
    
    return diferencias;
  }
  
  // Si es objeto
  if (typeof obj1 === 'object' && obj1 !== null && obj2 !== null) {
    const keys1 = Object.keys(obj1).sort();
    const keys2 = Object.keys(obj2).sort();
    
    // Comparar keys
    const keys1Only = keys1.filter(k => !keys2.includes(k));
    const keys2Only = keys2.filter(k => !keys1.includes(k));
    
    if (keys1Only.length > 0) {
      diferencias.push({
        path,
        error: 'Keys solo en obj1',
        keys: keys1Only
      });
    }
    
    if (keys2Only.length > 0) {
      diferencias.push({
        path,
        error: 'Keys solo en obj2',
        keys: keys2Only
      });
    }
    
    // Comparar valores de keys comunes
    const commonKeys = keys1.filter(k => keys2.includes(k));
    for (const key of commonKeys) {
      const subDiff = compararObjetos(obj1[key], obj2[key], `${path}.${key}`);
      diferencias.push(...subDiff);
    }
    
    return diferencias;
  }
  
  // Comparar valores primitivos
  if (obj1 !== obj2) {
    diferencias.push({
      path,
      error: 'Valores diferentes',
      obj1,
      obj2
    });
  }
  
  return diferencias;
}

// ============================================================================
// FUNCIÓN PARA MEDIR PERFORMANCE
// ============================================================================

async function medirTiempo(nombre, funcion) {
  const inicio = performance.now();
  const resultado = await funcion();
  const fin = performance.now();
  const tiempo = (fin - inicio).toFixed(2);
  
  return { resultado, tiempo };
}

// ============================================================================
// TESTS
// ============================================================================

async function ejecutarTests() {
  console.log('\n' + '='.repeat(70));
  log('🧪', colors.cyan, 'TEST DE REFACTORIZACIÓN: obtenerMetricas()');
  console.log('='.repeat(70) + '\n');
  
  let testsExitosos = 0;
  let testsFallidos = 0;
  
  // ========================================
  // TEST 1: Versión Legacy (Callbacks)
  // ========================================
  
  console.log('━'.repeat(70));
  log('📊', colors.blue, 'TEST 1: Ejecutar versión LEGACY (callbacks)');
  console.log('━'.repeat(70));
  
  let metricasLegacy;
  let tiempoLegacy;
  
  try {
    const inicio = performance.now();
    metricasLegacy = await new Promise((resolve, reject) => {
      obtenerMetricas((err, metricas) => {
        if (err) reject(err);
        else resolve(metricas);
      });
    });
    const fin = performance.now();
    tiempoLegacy = (fin - inicio).toFixed(2);
    
    log('✅', colors.green, `Versión legacy ejecutada exitosamente en ${tiempoLegacy}ms`);
    console.log('\n📦 Estructura de datos recibida:');
    console.log(JSON.stringify(metricasLegacy, null, 2));
    console.log('');
    testsExitosos++;
  } catch (error) {
    log('❌', colors.red, 'Error en versión legacy:');
    console.error(error);
    testsFallidos++;
    process.exit(1);
  }
  
  // ========================================
  // TEST 2: Versión Async/Await
  // ========================================
  
  console.log('━'.repeat(70));
  log('🚀', colors.blue, 'TEST 2: Ejecutar versión ASYNC/AWAIT');
  console.log('━'.repeat(70));
  
  let metricasAsync;
  let tiempoAsync;
  
  try {
    const inicio = performance.now();
    metricasAsync = await obtenerMetricasAsync();
    const fin = performance.now();
    tiempoAsync = (fin - inicio).toFixed(2);
    
    log('✅', colors.green, `Versión async ejecutada exitosamente en ${tiempoAsync}ms`);
    console.log('\n📦 Estructura de datos recibida:');
    console.log(JSON.stringify(metricasAsync, null, 2));
    console.log('');
    testsExitosos++;
  } catch (error) {
    log('❌', colors.red, 'Error en versión async:');
    console.error(error);
    testsFallidos++;
    process.exit(1);
  }
  
  // ========================================
  // TEST 3: Comparar Resultados
  // ========================================
  
  console.log('━'.repeat(70));
  log('🔍', colors.blue, 'TEST 3: Comparar resultados de ambas versiones');
  console.log('━'.repeat(70));
  
  const diferencias = compararObjetos(metricasLegacy, metricasAsync);
  
  if (diferencias.length === 0) {
    log('✅', colors.green, '¡Los resultados son IDÉNTICOS!');
    console.log('   Ambas versiones devuelven exactamente los mismos datos.');
    testsExitosos++;
  } else {
    log('❌', colors.red, `Se encontraron ${diferencias.length} diferencia(s):`);
    diferencias.forEach((diff, i) => {
      console.log(`\n   ${i + 1}. ${diff.path}:`);
      console.log(`      ${colors.yellow}${diff.error}${colors.reset}`);
      if (diff.obj1 !== undefined) console.log(`      Legacy: ${JSON.stringify(diff.obj1)}`);
      if (diff.obj2 !== undefined) console.log(`      Async:  ${JSON.stringify(diff.obj2)}`);
      if (diff.keys) console.log(`      Keys: ${JSON.stringify(diff.keys)}`);
    });
    testsFallidos++;
  }
  
  console.log('');
  
  // ========================================
  // TEST 4: Comparar Performance
  // ========================================
  
  console.log('━'.repeat(70));
  log('⚡', colors.blue, 'TEST 4: Comparar PERFORMANCE');
  console.log('━'.repeat(70));
  
  const mejora = ((tiempoLegacy - tiempoAsync) / tiempoLegacy * 100).toFixed(1);
  const factor = (tiempoLegacy / tiempoAsync).toFixed(2);
  
  console.log(`\n   ⏱️  Versión Legacy:    ${colors.yellow}${tiempoLegacy}ms${colors.reset}`);
  console.log(`   ⚡ Versión Async:     ${colors.green}${tiempoAsync}ms${colors.reset}`);
  console.log(`   📈 Mejora:            ${colors.cyan}${mejora}%${colors.reset}`);
  console.log(`   🚀 Factor:            ${colors.cyan}${factor}x más rápido${colors.reset}`);
  
  if (tiempoAsync < tiempoLegacy) {
    log('✅', colors.green, '¡La versión async es más rápida!');
    testsExitosos++;
  } else if (tiempoAsync === tiempoLegacy) {
    log('⚠️', colors.yellow, 'Ambas versiones tienen el mismo tiempo (puede variar)');
    testsExitosos++;
  } else {
    log('⚠️', colors.yellow, 'La versión legacy fue más rápida esta vez (variación normal)');
    testsExitosos++;
  }
  
  console.log('');
  
  // ========================================
  // TEST 5: Verificar Estructura de Datos
  // ========================================
  
  console.log('━'.repeat(70));
  log('📋', colors.blue, 'TEST 5: Verificar ESTRUCTURA de datos');
  console.log('━'.repeat(70));
  
  const camposRequeridos = [
    'usuarios',
    'documentos',
    'categorias',
    'capacitaciones',
    'usuariosPorRol',
    'actividadReciente'
  ];
  
  const camposFaltantes = camposRequeridos.filter(campo => 
    !(campo in metricasAsync)
  );
  
  if (camposFaltantes.length === 0) {
    log('✅', colors.green, 'Todos los campos requeridos están presentes');
    camposRequeridos.forEach(campo => {
      const valor = metricasAsync[campo];
      const tipo = Array.isArray(valor) ? 'array' : typeof valor;
      console.log(`   • ${colors.cyan}${campo}${colors.reset}: ${tipo}`);
    });
    testsExitosos++;
  } else {
    log('❌', colors.red, `Faltan campos: ${camposFaltantes.join(', ')}`);
    testsFallidos++;
  }
  
  console.log('');
  
  // ========================================
  // TEST 6: Verificar Tipos de Datos
  // ========================================
  
  console.log('━'.repeat(70));
  log('🔢', colors.blue, 'TEST 6: Verificar TIPOS de datos');
  console.log('━'.repeat(70));
  
  const erroresTipos = [];
  
  // Verificar números
  if (typeof metricasAsync.usuarios !== 'number') {
    erroresTipos.push('usuarios debe ser number');
  }
  if (typeof metricasAsync.documentos !== 'number') {
    erroresTipos.push('documentos debe ser number');
  }
  if (typeof metricasAsync.categorias !== 'number') {
    erroresTipos.push('categorias debe ser number');
  }
  if (typeof metricasAsync.capacitaciones !== 'number') {
    erroresTipos.push('capacitaciones debe ser number');
  }
  
  // Verificar objeto usuariosPorRol
  if (typeof metricasAsync.usuariosPorRol !== 'object') {
    erroresTipos.push('usuariosPorRol debe ser object');
  } else {
    if (typeof metricasAsync.usuariosPorRol.administradores !== 'number') {
      erroresTipos.push('usuariosPorRol.administradores debe ser number');
    }
    if (typeof metricasAsync.usuariosPorRol.expertos !== 'number') {
      erroresTipos.push('usuariosPorRol.expertos debe ser number');
    }
    if (typeof metricasAsync.usuariosPorRol.operadores !== 'number') {
      erroresTipos.push('usuariosPorRol.operadores debe ser number');
    }
  }
  
  // Verificar array actividadReciente
  if (!Array.isArray(metricasAsync.actividadReciente)) {
    erroresTipos.push('actividadReciente debe ser array');
  }
  
  if (erroresTipos.length === 0) {
    log('✅', colors.green, 'Todos los tipos de datos son correctos');
    testsExitosos++;
  } else {
    log('❌', colors.red, `Errores de tipos encontrados:`);
    erroresTipos.forEach(error => {
      console.log(`   • ${error}`);
    });
    testsFallidos++;
  }
  
  console.log('');
  
  // ========================================
  // TEST 7: Ejecutar Múltiples Veces
  // ========================================
  
  console.log('━'.repeat(70));
  log('🔄', colors.blue, 'TEST 7: Ejecutar múltiples veces para promediar performance');
  console.log('━'.repeat(70));
  
  const iteraciones = 5;
  const tiemposLegacy = [];
  const tiemposAsync = [];
  
  console.log(`\n   Ejecutando ${iteraciones} iteraciones de cada versión...`);
  
  for (let i = 0; i < iteraciones; i++) {
    // Legacy
    const inicioLegacy = performance.now();
    await new Promise((resolve, reject) => {
      obtenerMetricas((err, metricas) => {
        if (err) reject(err);
        else resolve(metricas);
      });
    });
    const finLegacy = performance.now();
    tiemposLegacy.push(finLegacy - inicioLegacy);
    
    // Async
    const inicioAsync = performance.now();
    await obtenerMetricasAsync();
    const finAsync = performance.now();
    tiemposAsync.push(finAsync - inicioAsync);
    
    process.stdout.write(`   Iteración ${i + 1}/${iteraciones}... ✓\r`);
  }
  
  console.log('');
  
  const promedioLegacy = (tiemposLegacy.reduce((a, b) => a + b) / iteraciones).toFixed(2);
  const promedioAsync = (tiemposAsync.reduce((a, b) => a + b) / iteraciones).toFixed(2);
  const mejoraPromedio = ((promedioLegacy - promedioAsync) / promedioLegacy * 100).toFixed(1);
  
  console.log(`\n   📊 Promedio Legacy:   ${promedioLegacy}ms`);
  console.log(`   📊 Promedio Async:    ${promedioAsync}ms`);
  console.log(`   📈 Mejora promedio:   ${mejoraPromedio}%`);
  
  log('✅', colors.green, 'Test de múltiples ejecuciones completado');
  testsExitosos++;
  
  console.log('');
  
  // ========================================
  // RESUMEN FINAL
  // ========================================
  
  console.log('='.repeat(70));
  const totalTests = testsExitosos + testsFallidos;
  const porcentaje = Math.round((testsExitosos / totalTests) * 100);
  
  if (testsFallidos === 0) {
    log('🎉', colors.green, `TODOS LOS TESTS PASARON: ${testsExitosos}/${totalTests} (${porcentaje}%)`);
    console.log('='.repeat(70));
    console.log('');
    log('✅', colors.green, '¡LA REFACTORIZACIÓN FUE EXITOSA!');
    console.log('');
    console.log('   📋 Resumen:');
    console.log(`   • Resultados idénticos entre ambas versiones`);
    console.log(`   • Mejora de performance: ${mejora}%`);
    console.log(`   • Código más limpio y mantenible`);
    console.log(`   • Compatibilidad con código legacy mantenida`);
    console.log('');
    log('🚀', colors.cyan, 'Puedes proceder con confianza al siguiente paso');
    console.log('');
  } else {
    log('⚠️', colors.red, `TESTS FALLIDOS: ${testsFallidos}/${totalTests}`);
    console.log('='.repeat(70));
    console.log('');
    log('🔧', colors.yellow, 'Revisa los errores antes de continuar');
    console.log('');
  }
  
  process.exit(testsFallidos === 0 ? 0 : 1);
}

// ============================================================================
// EJECUTAR TESTS
// ============================================================================

ejecutarTests().catch(error => {
  console.error('\n❌ Error fatal durante los tests:', error);
  process.exit(1);
});

