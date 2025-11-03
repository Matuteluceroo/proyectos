/**
 * 🧪 TESTS - QueryBuilder
 * ========================
 * Tests unitarios para verificar el correcto funcionamiento del QueryBuilder
 */

import QueryBuilder, { query, QueryHelpers } from './queryBuilder.js';

// ============================================================================
// 🧪 SUITE DE TESTS
// ============================================================================

const tests = [];
let passed = 0;
let failed = 0;

/**
 * Helper para registrar un test
 */
function test(description, fn) {
  tests.push({ description, fn });
}

/**
 * Helper para assertions
 */
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(
      message || `Expected "${expected}" but got "${actual}"`
    );
  }
}

// ============================================================================
// 📋 TESTS - Constructor y Métodos Básicos
// ============================================================================

test('Constructor: debe crear instancia con baseUrl', () => {
  const builder = new QueryBuilder('/api/test');
  assert(builder.baseUrl === '/api/test', 'baseUrl incorrecta');
});

test('Constructor: debe lanzar error sin baseUrl', () => {
  try {
    new QueryBuilder();
    throw new Error('Debería haber lanzado error');
  } catch (e) {
    assert(e.message.includes('baseUrl'), 'Error incorrecto');
  }
});

test('build(): sin parámetros debe retornar solo baseUrl', () => {
  const url = new QueryBuilder('/api/test').build();
  assertEqual(url, '/api/test');
});

// ============================================================================
// 📋 TESTS - Filtros Simples
// ============================================================================

test('addFilter(): debe agregar un filtro', () => {
  const url = new QueryBuilder('/api/test')
    .addFilter('id', 1)
    .build();
  assertEqual(url, '/api/test?id=1');
});

test('addFilter(): debe agregar múltiples filtros', () => {
  const url = new QueryBuilder('/api/test')
    .addFilter('id', 1)
    .addFilter('tipo', 'pdf')
    .build();
  assertEqual(url, '/api/test?id=1&tipo=pdf');
});

test('addFilter(): debe ignorar valores null/undefined', () => {
  const url = new QueryBuilder('/api/test')
    .addFilter('id', 1)
    .addFilter('nullable', null)
    .addFilter('undefined', undefined)
    .addFilter('empty', '')
    .build();
  assertEqual(url, '/api/test?id=1');
});

test('addFilters(): debe agregar múltiples filtros de una vez', () => {
  const url = new QueryBuilder('/api/test')
    .addFilters({ id: 1, tipo: 'pdf', estado: 'activo' })
    .build();
  
  const params = new URLSearchParams(url.split('?')[1]);
  assertEqual(params.get('id'), '1');
  assertEqual(params.get('tipo'), 'pdf');
  assertEqual(params.get('estado'), 'activo');
});

// ============================================================================
// 📋 TESTS - Búsqueda
// ============================================================================

test('addSearch(): debe agregar búsqueda con nombre por defecto', () => {
  const url = new QueryBuilder('/api/test')
    .addSearch('manual')
    .build();
  assertEqual(url, '/api/test?busqueda=manual');
});

test('addSearch(): debe permitir personalizar nombre del parámetro', () => {
  const url = new QueryBuilder('/api/test')
    .addSearch('manual', 'q')
    .build();
  assertEqual(url, '/api/test?q=manual');
});

test('addSearch(): debe encodear caracteres especiales', () => {
  const url = new QueryBuilder('/api/test')
    .addSearch('manual de operación')
    .build();
  assert(url.includes('manual%20de'), 'No encodeó espacios');
  assert(url.includes('%C3%B3'), 'No encodeó ó');
});

test('addSearch(): debe ignorar strings vacíos', () => {
  const url = new QueryBuilder('/api/test')
    .addSearch('')
    .build();
  assertEqual(url, '/api/test');
});

// ============================================================================
// 📋 TESTS - Paginación
// ============================================================================

test('addPagination(): debe agregar página y límite', () => {
  const url = new QueryBuilder('/api/test')
    .addPagination(2, 20)
    .build();
  assertEqual(url, '/api/test?pagina=2&limite=20');
});

test('addPage(): debe agregar solo página', () => {
  const url = new QueryBuilder('/api/test')
    .addPage(3)
    .build();
  assertEqual(url, '/api/test?pagina=3');
});

test('addLimit(): debe agregar solo límite', () => {
  const url = new QueryBuilder('/api/test')
    .addLimit(50)
    .build();
  assertEqual(url, '/api/test?limite=50');
});

test('addPagination(): debe ignorar valores inválidos', () => {
  const url = new QueryBuilder('/api/test')
    .addPagination(-1, 0)
    .build();
  assertEqual(url, '/api/test');
});

// ============================================================================
// 📋 TESTS - Ordenamiento
// ============================================================================

test('addSort(): debe agregar ordenamiento', () => {
  const url = new QueryBuilder('/api/test')
    .addSort('titulo', 'ASC')
    .build();
  assertEqual(url, '/api/test?orden=titulo&direccion=ASC');
});

test('addSort(): debe usar DESC por defecto', () => {
  const url = new QueryBuilder('/api/test')
    .addSort('created_at')
    .build();
  assertEqual(url, '/api/test?orden=created_at&direccion=DESC');
});

test('addSort(): debe validar dirección', () => {
  const url = new QueryBuilder('/api/test')
    .addSort('titulo', 'invalid')
    .build();
  assertEqual(url, '/api/test?orden=titulo&direccion=DESC');
});

// ============================================================================
// 📋 TESTS - Fechas
// ============================================================================

test('addDateFrom(): debe agregar fecha desde', () => {
  const url = new QueryBuilder('/api/test')
    .addDateFrom('2024-01-01')
    .build();
  assertEqual(url, '/api/test?fechaDesde=2024-01-01');
});

test('addDateTo(): debe agregar fecha hasta', () => {
  const url = new QueryBuilder('/api/test')
    .addDateTo('2024-12-31')
    .build();
  assertEqual(url, '/api/test?fechaHasta=2024-12-31');
});

test('addDateRange(): debe agregar ambas fechas', () => {
  const url = new QueryBuilder('/api/test')
    .addDateRange('2024-01-01', '2024-12-31')
    .build();
  
  const params = new URLSearchParams(url.split('?')[1]);
  assertEqual(params.get('fechaDesde'), '2024-01-01');
  assertEqual(params.get('fechaHasta'), '2024-12-31');
});

test('addDateFrom(): debe manejar objetos Date', () => {
  const date = new Date('2024-01-01');
  const url = new QueryBuilder('/api/test')
    .addDateFrom(date)
    .build();
  assert(url.includes('2024-01-01'), 'No convirtió Date correctamente');
});

// ============================================================================
// 📋 TESTS - Arrays
// ============================================================================

test('addArrayParam(): debe agregar múltiples valores', () => {
  const url = new QueryBuilder('/api/test')
    .addArrayParam('ids', [1, 2, 3])
    .build();
  assertEqual(url, '/api/test?ids=1&ids=2&ids=3');
});

test('addArrayParam(): debe ignorar arrays vacíos', () => {
  const url = new QueryBuilder('/api/test')
    .addArrayParam('ids', [])
    .build();
  assertEqual(url, '/api/test');
});

// ============================================================================
// 📋 TESTS - Métodos Utilitarios
// ============================================================================

test('getQueryString(): debe retornar solo query string', () => {
  const builder = new QueryBuilder('/api/test')
    .addFilter('id', 1)
    .addFilter('tipo', 'pdf');
  
  const queryString = builder.getQueryString();
  assertEqual(queryString, 'id=1&tipo=pdf');
});

test('getParams(): debe retornar objeto con parámetros', () => {
  const builder = new QueryBuilder('/api/test')
    .addFilter('id', 1)
    .addFilter('tipo', 'pdf');
  
  const params = builder.getParams();
  assertEqual(params.id, 1);
  assertEqual(params.tipo, 'pdf');
});

test('reset(): debe limpiar todos los parámetros', () => {
  const builder = new QueryBuilder('/api/test')
    .addFilter('id', 1)
    .reset();
  
  const url = builder.build();
  assertEqual(url, '/api/test');
});

test('removeParam(): debe remover un parámetro específico', () => {
  const url = new QueryBuilder('/api/test')
    .addFilter('id', 1)
    .addFilter('tipo', 'pdf')
    .removeParam('id')
    .build();
  
  assertEqual(url, '/api/test?tipo=pdf');
});

test('clone(): debe crear copia independiente', () => {
  const builder1 = new QueryBuilder('/api/test')
    .addFilter('id', 1);
  
  const builder2 = builder1.clone()
    .addFilter('tipo', 'pdf');
  
  const url1 = builder1.build();
  const url2 = builder2.build();
  
  assertEqual(url1, '/api/test?id=1');
  assertEqual(url2, '/api/test?id=1&tipo=pdf');
});

test('toString(): debe ser alias de build()', () => {
  const builder = new QueryBuilder('/api/test')
    .addFilter('id', 1);
  
  assertEqual(builder.toString(), builder.build());
});

// ============================================================================
// 📋 TESTS - Factory Function
// ============================================================================

test('query(): debe crear instancia con factory', () => {
  const url = query('/api/test')
    .addFilter('id', 1)
    .build();
  assertEqual(url, '/api/test?id=1');
});

// ============================================================================
// 📋 TESTS - QueryHelpers
// ============================================================================

test('QueryHelpers.paginated(): debe crear builder con paginación', () => {
  const url = QueryHelpers.paginated('/api/test', 2, 20).build();
  assertEqual(url, '/api/test?pagina=2&limite=20');
});

test('QueryHelpers.search(): debe crear builder con búsqueda', () => {
  const url = QueryHelpers.search('/api/test', 'manual').build();
  assertEqual(url, '/api/test?busqueda=manual');
});

test('QueryHelpers.sorted(): debe crear builder con ordenamiento', () => {
  const url = QueryHelpers.sorted('/api/test', 'titulo', 'ASC').build();
  assertEqual(url, '/api/test?orden=titulo&direccion=ASC');
});

// ============================================================================
// 📋 TESTS - Casos Complejos
// ============================================================================

test('Caso complejo: todos los filtros combinados', () => {
  const url = new QueryBuilder('/api/documentos')
    .addFilter('categoria_id', 5)
    .addFilter('tipo', 'pdf')
    .addSearch('manual')
    .addPagination(2, 20)
    .addSort('titulo', 'ASC')
    .addDateRange('2024-01-01', '2024-12-31')
    .build();
  
  const params = new URLSearchParams(url.split('?')[1]);
  assertEqual(params.get('categoria_id'), '5');
  assertEqual(params.get('tipo'), 'pdf');
  assertEqual(params.get('busqueda'), 'manual');
  assertEqual(params.get('pagina'), '2');
  assertEqual(params.get('limite'), '20');
  assertEqual(params.get('orden'), 'titulo');
  assertEqual(params.get('direccion'), 'ASC');
  assertEqual(params.get('fechaDesde'), '2024-01-01');
  assertEqual(params.get('fechaHasta'), '2024-12-31');
});

test('Caso complejo: filtros condicionales', () => {
  const filtros = {
    categoria: 5,
    busqueda: 'manual',
    page: 2
  };
  
  const builder = new QueryBuilder('/api/docs');
  
  if (filtros.categoria) builder.addFilter('categoria', filtros.categoria);
  if (filtros.busqueda) builder.addSearch(filtros.busqueda);
  if (filtros.page) builder.addPage(filtros.page);
  
  const url = builder.build();
  const params = new URLSearchParams(url.split('?')[1]);
  
  assertEqual(params.get('categoria'), '5');
  assertEqual(params.get('busqueda'), 'manual');
  assertEqual(params.get('pagina'), '2');
});

// ============================================================================
// 🚀 EJECUTAR TESTS
// ============================================================================

export function runTests() {
  console.log('\n🧪 EJECUTANDO TESTS DE QUERYBUILDER\n');
  console.log('═'.repeat(60));
  
  tests.forEach(({ description, fn }) => {
    try {
      fn();
      passed++;
      console.log(`✅ ${description}`);
    } catch (error) {
      failed++;
      console.log(`❌ ${description}`);
      console.log(`   Error: ${error.message}`);
    }
  });
  
  console.log('═'.repeat(60));
  console.log(`\n📊 RESULTADOS:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📋 Total: ${tests.length}`);
  
  if (failed === 0) {
    console.log('\n🎉 ¡TODOS LOS TESTS PASARON!\n');
  } else {
    console.log('\n⚠️  ALGUNOS TESTS FALLARON\n');
  }
  
  return { passed, failed, total: tests.length };
}

// Ejecutar automáticamente al importar
// Descomentar para auto-ejecución:
// runTests();

export default runTests;

