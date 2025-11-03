/**
 * 🧪 TEST-INTEGRATION-FINAL.JS - Test de integración completo
 * =============================================================
 * Verifica que todos los módulos funcionan correctamente juntos
 * y que el sistema está completamente funcional después de la refactorización.
 */

import db from './config/database.js';
import { initializeDatabase } from './models/schemas.js';
import { UserModel } from './models/User.js';
import { DocumentModel } from './models/Document.js';
import { SearchService } from './services/SearchService.js';
import { 
  inicializarDB,
  obtenerMetricasAsync
} from './database-citricola.js';

// También probar el index.js
import Backend from './index.js';

// Colores para consola
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const BLUE = '\x1b[34m';
const MAGENTA = '\x1b[35m';

let testsPasados = 0;
let testsFallados = 0;

function assert(condicion, mensaje) {
  if (condicion) {
    console.log(`✅ ${GREEN}${mensaje}${RESET}`);
    testsPasados++;
  } else {
    console.error(`❌ ${RED}${mensaje}${RESET}`);
    testsFallados++;
  }
}

function printSection(title, emoji) {
  console.log(`\n${BLUE}${'━'.repeat(70)}${RESET}`);
  console.log(`${emoji} ${CYAN}${title}${RESET}`);
  console.log(`${BLUE}${'━'.repeat(70)}${RESET}\n`);
}

console.log(`
${MAGENTA}╔════════════════════════════════════════════════════════════════════╗
║                  🧪 TEST DE INTEGRACIÓN FINAL                      ║
║              Verificando toda la arquitectura refactorizada        ║
╚════════════════════════════════════════════════════════════════════╝${RESET}
`);

async function runIntegrationTests() {
  
  // ==========================================================================
  // 1. VERIFICAR IMPORTS Y MÓDULOS
  // ==========================================================================
  printSection('MÓDULO 1: Verificar que todos los módulos se importan correctamente', '📦');
  
  assert(db !== undefined && db !== null, '1.1 - config/database.js importado correctamente');
  assert(typeof initializeDatabase === 'function', '1.2 - models/schemas.js importado correctamente');
  assert(typeof UserModel === 'function', '1.3 - models/User.js importado correctamente');
  assert(typeof DocumentModel === 'function', '1.4 - models/Document.js importado correctamente');
  assert(typeof SearchService === 'function', '1.5 - services/SearchService.js importado correctamente');
  assert(typeof inicializarDB === 'function', '1.6 - database-citricola.js importado correctamente');
  assert(Backend !== undefined, '1.7 - index.js (default export) importado correctamente');
  
  // ==========================================================================
  // 2. VERIFICAR ESTRUCTURA DEL INDEX.JS
  // ==========================================================================
  printSection('MÓDULO 2: Verificar estructura del index.js', '🏗️');
  
  assert(Backend.db !== undefined, '2.1 - Backend.db existe');
  assert(Backend.models !== undefined, '2.2 - Backend.models existe');
  assert(Backend.models.User !== undefined, '2.3 - Backend.models.User existe');
  assert(Backend.models.Document !== undefined, '2.4 - Backend.models.Document existe');
  assert(Backend.services !== undefined, '2.5 - Backend.services existe');
  assert(Backend.services.Search !== undefined, '2.6 - Backend.services.Search existe');
  assert(typeof Backend.inicializarDB === 'function', '2.7 - Backend.inicializarDB existe');
  assert(typeof Backend.obtenerMetricasAsync === 'function', '2.8 - Backend.obtenerMetricasAsync existe');
  
  // ==========================================================================
  // 3. PROBAR CONEXIÓN A BASE DE DATOS
  // ==========================================================================
  printSection('MÓDULO 3: Conexión a base de datos', '🗄️');
  
  let dbConnected = false;
  try {
    await new Promise((resolve, reject) => {
      db.get("SELECT 1 as test", (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    dbConnected = true;
  } catch (error) {
    console.error('Error en conexión:', error);
  }
  
  assert(dbConnected, '3.1 - Conexión a BD exitosa');
  
  // Verificar foreign keys
  const fkResult = await new Promise((resolve) => {
    db.get("PRAGMA foreign_keys", (err, row) => {
      resolve(row?.foreign_keys === 1);
    });
  });
  assert(fkResult, '3.2 - Foreign keys habilitadas');
  
  // ==========================================================================
  // 4. PROBAR MODELO DE USUARIOS
  // ==========================================================================
  printSection('MÓDULO 4: Modelo de Usuarios', '👥');
  
  // Obtener todos los usuarios
  const usuarios = await new Promise((resolve, reject) => {
    UserModel.obtenerTodosUsuarios((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  
  assert(Array.isArray(usuarios), '4.1 - obtenerTodosUsuarios() retorna array');
  assert(usuarios.length >= 3, `4.2 - Hay al menos 3 usuarios (actual: ${usuarios.length})`);
  
  // Verificar autenticación
  const usuarioAuth = await new Promise((resolve, reject) => {
    UserModel.obtenerUsuarioConRol('admin', '123456', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  
  assert(usuarioAuth !== null, '4.3 - Autenticación funciona correctamente');
  assert(usuarioAuth?.rol === 'administrador', '4.4 - Usuario tiene rol correcto');
  assert(!usuarioAuth?.hasOwnProperty('password'), '4.5 - Password no se retorna');
  
  // Verificar usuario por ID
  if (usuarios.length > 0) {
    const usuarioPorId = await new Promise((resolve, reject) => {
      UserModel.obtenerUsuarioPorId(usuarios[0].id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    assert(usuarioPorId !== null, '4.6 - obtenerUsuarioPorId() funciona');
  }
  
  // ==========================================================================
  // 5. PROBAR MODELO DE DOCUMENTOS/CATEGORÍAS
  // ==========================================================================
  printSection('MÓDULO 5: Modelo de Documentos y Categorías', '📄');
  
  // Obtener categorías
  const categorias = await new Promise((resolve, reject) => {
    DocumentModel.obtenerCategorias((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  
  assert(Array.isArray(categorias), '5.1 - obtenerCategorias() retorna array');
  assert(categorias.length >= 5, `5.2 - Hay al menos 5 categorías (actual: ${categorias.length})`);
  assert(categorias[0].hasOwnProperty('nombre'), '5.3 - Categorías tienen campo nombre');
  assert(categorias[0].hasOwnProperty('color'), '5.4 - Categorías tienen campo color');
  
  // Obtener documentos
  const documentos = await new Promise((resolve, reject) => {
    DocumentModel.obtenerDocumentos(null, 'administrador', (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  
  assert(Array.isArray(documentos), '5.5 - obtenerDocumentos() retorna array');
  
  // Contar documentos por categoría
  if (categorias.length > 0) {
    const count = await new Promise((resolve, reject) => {
      DocumentModel.contarDocumentosPorCategoria(categorias[0].id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    assert(typeof count === 'number', '5.6 - contarDocumentosPorCategoria() retorna número');
  }
  
  // ==========================================================================
  // 6. PROBAR SERVICIO DE BÚSQUEDA
  // ==========================================================================
  printSection('MÓDULO 6: Servicio de Búsqueda', '🔍');
  
  // Búsqueda async
  const resultadosBusqueda = await SearchService.buscarContenidoAsync('admin', { tipo: 'todos' });
  assert(Array.isArray(resultadosBusqueda), '6.1 - buscarContenidoAsync() retorna array');
  assert(resultadosBusqueda.length >= 1, `6.2 - Búsqueda encuentra resultados (${resultadosBusqueda.length})`);
  
  // Verificar que los resultados tienen el campo 'tipo'
  if (resultadosBusqueda.length > 0) {
    assert(resultadosBusqueda[0].hasOwnProperty('tipo'), '6.3 - Resultados tienen campo tipo');
  }
  
  // Búsqueda con callbacks (legacy)
  const resultadosLegacy = await new Promise((resolve, reject) => {
    SearchService.buscarContenido('admin', { tipo: 'usuarios' }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  
  assert(Array.isArray(resultadosLegacy), '6.4 - buscarContenido() (callback) funciona');
  
  // Búsqueda por tipo específico
  const soloUsuarios = await SearchService.buscarContenidoAsync('admin', { tipo: 'usuarios' });
  if (soloUsuarios.length > 0) {
    const todosSonUsuarios = soloUsuarios.every(r => r.tipo === 'usuario');
    assert(todosSonUsuarios, '6.5 - Filtro por tipo funciona correctamente');
  }
  
  // ==========================================================================
  // 7. PROBAR MÉTRICAS
  // ==========================================================================
  printSection('MÓDULO 7: Sistema de Métricas', '📊');
  
  // Métricas async
  const metricas = await obtenerMetricasAsync();
  
  assert(metricas !== null && metricas !== undefined, '7.1 - obtenerMetricasAsync() retorna datos');
  assert(typeof metricas.usuarios === 'number', '7.2 - Métricas contienen usuarios');
  assert(typeof metricas.documentos === 'number', '7.3 - Métricas contienen documentos');
  assert(typeof metricas.categorias === 'number', '7.4 - Métricas contienen categorías');
  assert(metricas.hasOwnProperty('usuariosPorRol'), '7.5 - Métricas contienen distribución de roles');
  assert(Array.isArray(metricas.actividadReciente), '7.6 - Métricas contienen actividad reciente');
  
  console.log(`\n   📊 ${YELLOW}Métricas del sistema:${RESET}`);
  console.log(`      • Usuarios: ${metricas.usuarios}`);
  console.log(`      • Documentos: ${metricas.documentos}`);
  console.log(`      • Categorías: ${metricas.categorias}`);
  console.log(`      • Capacitaciones: ${metricas.capacitaciones}`);
  console.log(`      • Roles: ${JSON.stringify(metricas.usuariosPorRol)}`);
  
  // ==========================================================================
  // 8. PROBAR INTEGRACIÓN VÍA INDEX.JS
  // ==========================================================================
  printSection('MÓDULO 8: Integración vía index.js', '🔗');
  
  // Probar acceso a través del objeto Backend
  const usuariosViaBackend = await new Promise((resolve, reject) => {
    Backend.models.User.obtenerTodosUsuarios((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  
  assert(Array.isArray(usuariosViaBackend), '8.1 - Backend.models.User funciona');
  
  const categoriasViaBackend = await new Promise((resolve, reject) => {
    Backend.models.Document.obtenerCategorias((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  
  assert(Array.isArray(categoriasViaBackend), '8.2 - Backend.models.Document funciona');
  
  const busquedaViaBackend = await Backend.services.Search.buscarContenidoAsync('admin');
  assert(Array.isArray(busquedaViaBackend), '8.3 - Backend.services.Search funciona');
  
  const metricasViaBackend = await Backend.obtenerMetricasAsync();
  assert(metricasViaBackend !== null, '8.4 - Backend.obtenerMetricasAsync() funciona');
  
  // ==========================================================================
  // 9. VERIFICAR COMPATIBILIDAD BACKWARD
  // ==========================================================================
  printSection('MÓDULO 9: Compatibilidad con código legacy', '🔄');
  
  // Importar desde database-citricola.js (forma antigua)
  const { 
    obtenerTodosUsuarios: obtenerUsuariosLegacy,
    obtenerCategorias: obtenerCategoriasLegacy,
    buscarContenido: buscarLegacy
  } = await import('./database-citricola.js');
  
  assert(typeof obtenerUsuariosLegacy === 'function', '9.1 - Re-export de usuarios funciona');
  assert(typeof obtenerCategoriasLegacy === 'function', '9.2 - Re-export de categorías funciona');
  assert(typeof buscarLegacy === 'function', '9.3 - Re-export de búsqueda funciona');
  
  // Probar que funcionan
  const usuariosLegacy = await new Promise((resolve, reject) => {
    obtenerUsuariosLegacy((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
  
  assert(Array.isArray(usuariosLegacy), '9.4 - Función re-exportada funciona correctamente');
  assert(usuariosLegacy.length === usuarios.length, '9.5 - Datos idénticos a módulo directo');
  
  // ==========================================================================
  // 10. VERIFICAR PERFORMANCE
  // ==========================================================================
  printSection('MÓDULO 10: Verificación de Performance', '⚡');
  
  // Medir tiempo de métricas
  const startMetricas = Date.now();
  await obtenerMetricasAsync();
  const timeMetricas = Date.now() - startMetricas;
  
  assert(timeMetricas < 100, `10.1 - Métricas se ejecutan rápido (${timeMetricas}ms < 100ms)`);
  console.log(`   ⏱️  Tiempo de métricas: ${CYAN}${timeMetricas}ms${RESET}`);
  
  // Medir tiempo de búsqueda
  const startBusqueda = Date.now();
  await SearchService.buscarContenidoAsync('admin', { tipo: 'todos' });
  const timeBusqueda = Date.now() - startBusqueda;
  
  assert(timeBusqueda < 100, `10.2 - Búsqueda se ejecuta rápido (${timeBusqueda}ms < 100ms)`);
  console.log(`   ⏱️  Tiempo de búsqueda: ${CYAN}${timeBusqueda}ms${RESET}`);
  
  // ==========================================================================
  // RESULTADOS FINALES
  // ==========================================================================
  console.log(`\n${MAGENTA}${'═'.repeat(70)}${RESET}`);
  console.log(`${CYAN}                    📊 RESULTADOS FINALES${RESET}`);
  console.log(`${MAGENTA}${'═'.repeat(70)}${RESET}\n`);
  
  const totalTests = testsPasados + testsFallados;
  const porcentaje = ((testsPasados / totalTests) * 100).toFixed(1);
  
  if (testsFallados > 0) {
    console.log(`${RED}❌ Tests pasados: ${testsPasados}/${totalTests} (${porcentaje}%)${RESET}`);
    console.log(`${RED}❌ Tests fallidos: ${testsFallados}${RESET}\n`);
    console.log(`${YELLOW}⚠️  Algunos tests fallaron. Revisa los errores arriba.${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`${GREEN}✅ Tests pasados: ${testsPasados}/${totalTests} (${porcentaje}%)${RESET}\n`);
    
    console.log(`${GREEN}╔════════════════════════════════════════════════════════════════════╗${RESET}`);
    console.log(`${GREEN}║  🎉 ¡INTEGRACIÓN COMPLETA EXITOSA!                                ║${RESET}`);
    console.log(`${GREEN}║                                                                    ║${RESET}`);
    console.log(`${GREEN}║  ✅ Todos los módulos funcionan correctamente                     ║${RESET}`);
    console.log(`${GREEN}║  ✅ Integración vía index.js verificada                           ║${RESET}`);
    console.log(`${GREEN}║  ✅ Compatibilidad backward confirmada                            ║${RESET}`);
    console.log(`${GREEN}║  ✅ Performance óptima                                             ║${RESET}`);
    console.log(`${GREEN}║  ✅ ${testsPasados} tests pasados (100%)                                      ║${RESET}`);
    console.log(`${GREEN}║                                                                    ║${RESET}`);
    console.log(`${GREEN}║  🚀 El sistema está listo para producción                         ║${RESET}`);
    console.log(`${GREEN}╚════════════════════════════════════════════════════════════════════╝${RESET}\n`);
  }
  
  // Cerrar conexión a BD
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar BD:', err);
    }
    process.exit(0);
  });
}

// Ejecutar tests
runIntegrationTests().catch(err => {
  console.error(`\n${RED}❌ Error fatal en tests de integración:${RESET}`, err);
  process.exit(1);
});

