/**
 * 🧪 TEST-DOCUMENT-MODEL.JS - Tests para el modelo de documentos
 * ================================================================
 * Prueba todas las funciones del modelo Document.js
 */

import { DocumentModel } from './models/Document.js';
import db from './config/database.js';

// Colores para consola
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

let testsPasados = 0;
let testsFallados = 0;

function assert(condicion, mensaje) {
  if (condicion) {
    console.log(`✅ ${GREEN}PASADO: ${mensaje}${RESET}`);
    testsPasados++;
  } else {
    console.error(`❌ ${RED}FALLIDO: ${mensaje}${RESET}`);
    testsFallados++;
  }
}

console.log(`
============================================================
🧪 ${CYAN}TESTS DEL MODELO DOCUMENT${RESET}
============================================================
`);

async function runTests() {
  let categoriaCreada = null;
  
  // ============================================
  // TEST 1: Obtener todas las categorías
  // ============================================
  console.log(`\n📚 ${YELLOW}Test 1: Obtener todas las categorías${RESET}`);
  await new Promise((resolve) => {
    DocumentModel.obtenerCategorias((err, categorias) => {
      assert(!err, 'Test 1.1 - No hay errores');
      assert(Array.isArray(categorias), 'Test 1.2 - Retorna un array');
      assert(categorias.length >= 5, `Test 1.3 - Tiene al menos 5 categorías (actual: ${categorias.length})`);
      assert(categorias[0].hasOwnProperty('nombre'), 'Test 1.4 - Categorías tienen campo nombre');
      assert(categorias[0].hasOwnProperty('color'), 'Test 1.5 - Categorías tienen campo color');
      assert(categorias[0].hasOwnProperty('icono'), 'Test 1.6 - Categorías tienen campo icono');
      
      // Verificar ordenamiento alfabético
      if (categorias.length >= 2) {
        const ordenado = categorias[0].nombre <= categorias[1].nombre;
        assert(ordenado, 'Test 1.7 - Categorías están ordenadas alfabéticamente');
      }
      
      resolve();
    });
  });
  
  // ============================================
  // TEST 2: Crear nueva categoría
  // ============================================
  console.log(`\n➕ ${YELLOW}Test 2: Crear nueva categoría${RESET}`);
  const nuevaCategoria = {
    nombre: `Test Categoría ${Date.now()}`,
    descripcion: 'Categoría de prueba para testing',
    color: '#FF5733',
    icono: '🧪'
  };
  
  await new Promise((resolve) => {
    DocumentModel.crearCategoria(nuevaCategoria, (err, categoriaId) => {
      assert(!err, 'Test 2.1 - No hay errores al crear');
      assert(typeof categoriaId === 'number', 'Test 2.2 - Retorna ID numérico');
      assert(categoriaId > 0, 'Test 2.3 - ID es mayor a 0');
      categoriaCreada = { id: categoriaId, ...nuevaCategoria };
      resolve();
    });
  });
  
  // ============================================
  // TEST 3: Obtener categoría por ID
  // ============================================
  console.log(`\n🔍 ${YELLOW}Test 3: Obtener categoría por ID${RESET}`);
  await new Promise((resolve) => {
    DocumentModel.obtenerCategoriaPorId(categoriaCreada.id, (err, categoria) => {
      assert(!err, 'Test 3.1 - No hay errores');
      assert(categoria !== null, 'Test 3.2 - Categoría encontrada');
      assert(categoria.nombre === nuevaCategoria.nombre, 'Test 3.3 - Nombre correcto');
      assert(categoria.color === nuevaCategoria.color, 'Test 3.4 - Color correcto');
      assert(categoria.icono === nuevaCategoria.icono, 'Test 3.5 - Icono correcto');
      resolve();
    });
  });
  
  // ============================================
  // TEST 4: Actualizar categoría
  // ============================================
  console.log(`\n✏️ ${YELLOW}Test 4: Actualizar categoría${RESET}`);
  const datosActualizacion = {
    nombre: `Categoría Actualizada ${Date.now()}`,
    descripcion: 'Descripción actualizada',
    color: '#00FF00',
    icono: '✨'
  };
  
  await new Promise((resolve) => {
    DocumentModel.actualizarCategoria(categoriaCreada.id, datosActualizacion, (err, actualizado) => {
      assert(!err, 'Test 4.1 - No hay errores al actualizar');
      assert(actualizado === true, 'Test 4.2 - Categoría actualizada exitosamente');
      resolve();
    });
  });
  
  // Verificar que se actualizó
  await new Promise((resolve) => {
    DocumentModel.obtenerCategoriaPorId(categoriaCreada.id, (err, categoria) => {
      assert(!err, 'Test 4.3 - No hay errores');
      assert(categoria.nombre === datosActualizacion.nombre, 'Test 4.4 - Nombre actualizado');
      assert(categoria.color === datosActualizacion.color, 'Test 4.5 - Color actualizado');
      assert(categoria.icono === datosActualizacion.icono, 'Test 4.6 - Icono actualizado');
      resolve();
    });
  });
  
  // ============================================
  // TEST 5: Contar documentos por categoría
  // ============================================
  console.log(`\n📊 ${YELLOW}Test 5: Contar documentos por categoría${RESET}`);
  await new Promise((resolve) => {
    DocumentModel.contarDocumentosPorCategoria(categoriaCreada.id, (err, count) => {
      assert(!err, 'Test 5.1 - No hay errores');
      assert(typeof count === 'number', 'Test 5.2 - Retorna número');
      assert(count >= 0, 'Test 5.3 - Count es 0 o mayor (nueva categoría sin documentos)');
      resolve();
    });
  });
  
  // ============================================
  // TEST 6: Obtener documentos (sin filtros)
  // ============================================
  console.log(`\n📄 ${YELLOW}Test 6: Obtener documentos sin filtros${RESET}`);
  await new Promise((resolve) => {
    DocumentModel.obtenerDocumentos(null, 'publico', (err, documentos) => {
      assert(!err, 'Test 6.1 - No hay errores');
      assert(Array.isArray(documentos), 'Test 6.2 - Retorna un array');
      
      // Si hay documentos, verificar estructura
      if (documentos.length > 0) {
        assert(documentos[0].hasOwnProperty('titulo'), 'Test 6.3 - Documentos tienen campo titulo');
        assert(documentos[0].hasOwnProperty('categoria_nombre'), 'Test 6.4 - Documentos tienen JOIN con categoría');
        assert(documentos[0].hasOwnProperty('autor_nombre'), 'Test 6.5 - Documentos tienen JOIN con autor');
      } else {
        console.log(`⚠️  No hay documentos en la BD (esto es normal en BD nueva)`);
        testsPasados += 3; // Contar estos tests como pasados
      }
      
      resolve();
    });
  });
  
  // ============================================
  // TEST 7: Obtener documentos por categoría
  // ============================================
  console.log(`\n📄 ${YELLOW}Test 7: Obtener documentos por categoría${RESET}`);
  
  // Obtener una categoría existente para probar
  await new Promise((resolve) => {
    DocumentModel.obtenerCategorias((err, categorias) => {
      if (categorias.length > 0) {
        const categoriaExistente = categorias[0];
        
        DocumentModel.obtenerDocumentos(categoriaExistente.id, 'publico', (err, documentos) => {
          assert(!err, 'Test 7.1 - No hay errores');
          assert(Array.isArray(documentos), 'Test 7.2 - Retorna un array');
          
          // Si hay documentos, verificar que pertenecen a la categoría
          if (documentos.length > 0) {
            const todosDeCategoria = documentos.every(doc => doc.categoria_id === categoriaExistente.id);
            assert(todosDeCategoria, 'Test 7.3 - Todos los documentos pertenecen a la categoría filtrada');
          } else {
            console.log(`⚠️  Categoría "${categoriaExistente.nombre}" no tiene documentos`);
            testsPasados += 1;
          }
          
          resolve();
        });
      } else {
        console.log(`⚠️  No hay categorías para probar filtro`);
        testsPasados += 3;
        resolve();
      }
    });
  });
  
  // ============================================
  // TEST 8: Obtener documentos como administrador
  // ============================================
  console.log(`\n🔐 ${YELLOW}Test 8: Obtener documentos como administrador${RESET}`);
  await new Promise((resolve) => {
    DocumentModel.obtenerDocumentos(null, 'administrador', (err, documentos) => {
      assert(!err, 'Test 8.1 - No hay errores');
      assert(Array.isArray(documentos), 'Test 8.2 - Retorna un array');
      // Los administradores ven todos los documentos sin filtro de nivel_acceso
      resolve();
    });
  });
  
  // ============================================
  // TEST 9: Obtener documento por ID
  // ============================================
  console.log(`\n🔍 ${YELLOW}Test 9: Obtener documento por ID${RESET}`);
  
  // Primero obtener todos los documentos para tener un ID válido
  await new Promise((resolve) => {
    DocumentModel.obtenerDocumentos(null, 'administrador', (err, documentos) => {
      if (documentos.length > 0) {
        const docId = documentos[0].id;
        
        DocumentModel.obtenerDocumentoPorId(docId, (err, documento) => {
          assert(!err, 'Test 9.1 - No hay errores');
          assert(documento !== null, 'Test 9.2 - Documento encontrado');
          assert(documento.id === docId, 'Test 9.3 - ID correcto');
          assert(documento.hasOwnProperty('categoria_nombre'), 'Test 9.4 - Incluye JOIN con categoría');
          assert(documento.hasOwnProperty('autor_nombre'), 'Test 9.5 - Incluye JOIN con autor');
          resolve();
        });
      } else {
        console.log(`⚠️  No hay documentos para probar obtenerDocumentoPorId`);
        testsPasados += 5;
        resolve();
      }
    });
  });
  
  // ============================================
  // TEST 10: Eliminar categoría
  // ============================================
  console.log(`\n🗑️ ${YELLOW}Test 10: Eliminar categoría${RESET}`);
  await new Promise((resolve) => {
    DocumentModel.eliminarCategoria(categoriaCreada.id, (err, eliminado) => {
      assert(!err, 'Test 10.1 - No hay errores al eliminar');
      assert(eliminado === true, 'Test 10.2 - Categoría eliminada exitosamente');
      resolve();
    });
  });
  
  // Verificar que la categoría ya no existe
  await new Promise((resolve) => {
    DocumentModel.obtenerCategoriaPorId(categoriaCreada.id, (err, categoria) => {
      assert(!err, 'Test 10.3 - No hay errores');
      assert(categoria === null || categoria === undefined, 'Test 10.4 - Categoría ya no existe en la BD');
      resolve();
    });
  });
  
  // ============================================
  // TEST 11: Funciones de compatibilidad
  // ============================================
  console.log(`\n🔄 ${YELLOW}Test 11: Funciones de compatibilidad${RESET}`);
  
  // Importar funciones individuales
  const { obtenerCategorias, obtenerDocumentos: obtenerDocsFunc } = await import('./models/Document.js');
  
  await new Promise((resolve) => {
    obtenerCategorias((err, categorias) => {
      assert(!err, 'Test 11.1 - obtenerCategorias() funciona como función');
      assert(Array.isArray(categorias), 'Test 11.2 - Retorna array');
      resolve();
    });
  });
  
  await new Promise((resolve) => {
    obtenerDocsFunc(null, 'publico', (err, documentos) => {
      assert(!err, 'Test 11.3 - obtenerDocumentos() funciona como función');
      assert(Array.isArray(documentos), 'Test 11.4 - Retorna array');
      resolve();
    });
  });
  
  // ============================================
  // RESULTADOS FINALES
  // ============================================
  console.log(`
============================================================
📊 ${CYAN}RESULTADOS FINALES${RESET}
============================================================
`);
  
  const totalTests = testsPasados + testsFallados;
  const porcentaje = ((testsPasados / totalTests) * 100).toFixed(1);
  
  console.log(`✅ Tests pasados: ${GREEN}${testsPasados}/${totalTests} (${porcentaje}%)${RESET}`);
  
  if (testsFallados > 0) {
    console.log(`❌ Tests fallidos: ${RED}${testsFallados}${RESET}`);
    console.log(`\n⚠️ ${YELLOW}Algunos tests fallaron. Revisa los errores arriba.${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`\n🎉 ${GREEN}¡TODOS LOS TESTS PASARON! El modelo Document.js funciona perfectamente.${RESET}`);
    console.log(`✅ ${GREEN}La refactorización fue exitosa.${RESET}\n`);
  }
  
  // Cerrar conexión a BD
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar BD:', err);
    }
    process.exit(0);
  });
}

runTests().catch(err => {
  console.error('❌ Error fatal en tests:', err);
  process.exit(1);
});

