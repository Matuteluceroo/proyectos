/**
 * 📚 EJEMPLOS DE USO - QueryBuilder
 * ===================================
 * Este archivo contiene ejemplos prácticos de cómo usar el QueryBuilder
 * en diferentes escenarios comunes.
 */

import QueryBuilder, { query, QueryHelpers } from './queryBuilder.js';

// ============================================================================
// 📋 EJEMPLO 1: Búsqueda Simple de Documentos
// ============================================================================
export function ejemploBusquedaSimple() {
  const url = new QueryBuilder('/api/documentos')
    .addSearch('manual de operación')
    .build();
  
  console.log('Ejemplo 1:', url);
  // Resultado: /api/documentos?busqueda=manual%20de%20operaci%C3%B3n
}

// ============================================================================
// 📋 EJEMPLO 2: Filtros Múltiples
// ============================================================================
export function ejemploFiltrosMultiples() {
  const url = new QueryBuilder('/api/documentos')
    .addFilter('categoria_id', 5)
    .addFilter('tipo', 'pdf')
    .addFilter('estado', 'activo')
    .addFilter('nivel_acceso', 'publico')
    .build();
  
  console.log('Ejemplo 2:', url);
  // Resultado: /api/documentos?categoria_id=5&tipo=pdf&estado=activo&nivel_acceso=publico
}

// ============================================================================
// 📋 EJEMPLO 3: Paginación con Ordenamiento
// ============================================================================
export function ejemploPaginacionOrdenamiento() {
  const url = new QueryBuilder('/api/documentos')
    .addPagination(2, 20)          // Página 2, 20 items
    .addSort('titulo', 'ASC')       // Ordenar por título ascendente
    .build();
  
  console.log('Ejemplo 3:', url);
  // Resultado: /api/documentos?pagina=2&limite=20&orden=titulo&direccion=ASC
}

// ============================================================================
// 📋 EJEMPLO 4: Búsqueda Compleja (filtros + búsqueda + paginación + ordenamiento)
// ============================================================================
export function ejemploBusquedaCompleja() {
  const url = new QueryBuilder('/api/documentos')
    .addFilter('categoria_id', 3)
    .addSearch('fertilizantes')
    .addPagination(1, 10)
    .addSort('created_at', 'DESC')
    .build();
  
  console.log('Ejemplo 4:', url);
  // Resultado: /api/documentos?categoria_id=3&busqueda=fertilizantes&pagina=1&limite=10&orden=created_at&direccion=DESC
}

// ============================================================================
// 📋 EJEMPLO 5: Filtros con Fechas
// ============================================================================
export function ejemploFiltroFechas() {
  const url = new QueryBuilder('/api/reportes/actividad')
    .addDateRange('2024-01-01', '2024-12-31')
    .addSort('fecha', 'DESC')
    .build();
  
  console.log('Ejemplo 5:', url);
  // Resultado: /api/reportes/actividad?fechaDesde=2024-01-01&fechaHasta=2024-12-31&orden=fecha&direccion=DESC
}

// ============================================================================
// 📋 EJEMPLO 6: Uso de addFilters() para Múltiples Filtros
// ============================================================================
export function ejemploAddFilters() {
  const filtros = {
    categoria_id: 5,
    tipo: 'pdf',
    estado: 'activo',
    nivel_acceso: 'publico'
  };
  
  const url = new QueryBuilder('/api/documentos')
    .addFilters(filtros)
    .addSearch('manual')
    .build();
  
  console.log('Ejemplo 6:', url);
  // Resultado: /api/documentos?categoria_id=5&tipo=pdf&estado=activo&nivel_acceso=publico&busqueda=manual
}

// ============================================================================
// 📋 EJEMPLO 7: Uso de Factory Function query()
// ============================================================================
export function ejemploFactoryFunction() {
  // Forma más corta usando la factory function
  const url = query('/api/usuarios')
    .addFilter('rol', 'administrador')
    .addFilter('activo', true)
    .addSort('nombre_completo', 'ASC')
    .build();
  
  console.log('Ejemplo 7:', url);
  // Resultado: /api/usuarios?rol=administrador&activo=true&orden=nombre_completo&direccion=ASC
}

// ============================================================================
// 📋 EJEMPLO 8: Uso de QueryHelpers
// ============================================================================
export function ejemploHelpers() {
  // Helper para paginación
  const url1 = QueryHelpers.paginated('/api/documentos', 3, 15)
    .addFilter('tipo', 'pdf')
    .build();
  
  console.log('Ejemplo 8a:', url1);
  // Resultado: /api/documentos?pagina=3&limite=15&tipo=pdf
  
  // Helper para búsqueda
  const url2 = QueryHelpers.search('/api/documentos', 'manual')
    .addPagination(1, 10)
    .build();
  
  console.log('Ejemplo 8b:', url2);
  // Resultado: /api/documentos?busqueda=manual&pagina=1&limite=10
}

// ============================================================================
// 📋 EJEMPLO 9: Arrays de Valores (múltiples valores para un parámetro)
// ============================================================================
export function ejemploArrayParams() {
  const url = new QueryBuilder('/api/documentos')
    .addArrayParam('categorias', [1, 2, 3])
    .addArrayParam('tipos', ['pdf', 'video'])
    .build();
  
  console.log('Ejemplo 9:', url);
  // Resultado: /api/documentos?categorias=1&categorias=2&categorias=3&tipos=pdf&tipos=video
}

// ============================================================================
// 📋 EJEMPLO 10: Clonar y Modificar Builder
// ============================================================================
export function ejemploClone() {
  const baseBuilder = new QueryBuilder('/api/documentos')
    .addFilter('categoria_id', 5)
    .addPagination(1, 20);
  
  // Clonar para crear variantes sin afectar el original
  const urlPdf = baseBuilder.clone()
    .addFilter('tipo', 'pdf')
    .build();
  
  const urlVideo = baseBuilder.clone()
    .addFilter('tipo', 'video')
    .build();
  
  console.log('Ejemplo 10a:', urlPdf);
  // Resultado: /api/documentos?categoria_id=5&pagina=1&limite=20&tipo=pdf
  
  console.log('Ejemplo 10b:', urlVideo);
  // Resultado: /api/documentos?categoria_id=5&pagina=1&limite=20&tipo=video
}

// ============================================================================
// 📋 EJEMPLO 11: Uso Condicional de Filtros
// ============================================================================
export function ejemploFiltrosCondicionales(filtros) {
  const builder = new QueryBuilder('/api/documentos');
  
  // Solo agregar filtros si existen
  if (filtros.categoria) {
    builder.addFilter('categoria_id', filtros.categoria);
  }
  
  if (filtros.busqueda) {
    builder.addSearch(filtros.busqueda);
  }
  
  if (filtros.tipo) {
    builder.addFilter('tipo', filtros.tipo);
  }
  
  // Siempre agregar paginación por defecto
  builder.addPagination(filtros.page || 1, filtros.limit || 20);
  
  return builder.build();
}

// ============================================================================
// 📋 EJEMPLO 12: Integración con React State
// ============================================================================
export function ejemploReactState() {
  // Ejemplo de cómo usar con estado de React
  const estadoFiltros = {
    categoria: 5,
    busqueda: 'manual',
    page: 2,
    limit: 20,
    orden: 'titulo',
    direccion: 'ASC'
  };
  
  const url = new QueryBuilder('/api/documentos')
    .addFilter('categoria_id', estadoFiltros.categoria)
    .addSearch(estadoFiltros.busqueda)
    .addPagination(estadoFiltros.page, estadoFiltros.limit)
    .addSort(estadoFiltros.orden, estadoFiltros.direccion)
    .build();
  
  console.log('Ejemplo 12:', url);
  // Resultado: /api/documentos?categoria_id=5&busqueda=manual&pagina=2&limite=20&orden=titulo&direccion=ASC
}

// ============================================================================
// 📋 EJEMPLO 13: Uso con Axios (integración real)
// ============================================================================
export async function ejemploAxios() {
  // Importar dentro de la función para evitar errores si axios no está disponible
  // import api from '../services/api.js';
  
  const url = new QueryBuilder('/documentos')  // Sin /api porque axios ya tiene baseURL
    .addFilter('categoria_id', 5)
    .addSearch('fertilizantes')
    .addPagination(1, 10)
    .build();
  
  console.log('Ejemplo 13 - URL para axios:', url);
  // Resultado: /documentos?categoria_id=5&busqueda=fertilizantes&pagina=1&limite=10
  
  // Uso real con axios:
  // const response = await api.get(url);
  // return response.data;
}

// ============================================================================
// 📋 EJEMPLO 14: Resetear y Reutilizar Builder
// ============================================================================
export function ejemploResetear() {
  const builder = new QueryBuilder('/api/documentos')
    .addFilter('categoria_id', 5)
    .addSearch('manual');
  
  const url1 = builder.build();
  console.log('Ejemplo 14a:', url1);
  // Resultado: /api/documentos?categoria_id=5&busqueda=manual
  
  // Resetear y crear nueva query
  builder.reset()
    .addFilter('tipo', 'pdf')
    .addPagination(1, 20);
  
  const url2 = builder.build();
  console.log('Ejemplo 14b:', url2);
  // Resultado: /api/documentos?tipo=pdf&pagina=1&limite=20
}

// ============================================================================
// 📋 EJEMPLO 15: Obtener Parámetros como Objeto
// ============================================================================
export function ejemploGetParams() {
  const builder = new QueryBuilder('/api/documentos')
    .addFilter('categoria_id', 5)
    .addSearch('manual')
    .addPagination(2, 20);
  
  const params = builder.getParams();
  console.log('Ejemplo 15 - Parámetros:', params);
  // Resultado: { categoria_id: 5, busqueda: 'manual', pagina: 2, limite: 20 }
  
  // Útil para debugging o para pasar a otros componentes
  return params;
}

// ============================================================================
// 🚀 EJECUTAR TODOS LOS EJEMPLOS
// ============================================================================
export function ejecutarTodosLosEjemplos() {
  console.log('\n🚀 EJECUTANDO EJEMPLOS DE QUERYBUILDER\n');
  console.log('═'.repeat(60));
  
  ejemploBusquedaSimple();
  ejemploFiltrosMultiples();
  ejemploPaginacionOrdenamiento();
  ejemploBusquedaCompleja();
  ejemploFiltroFechas();
  ejemploAddFilters();
  ejemploFactoryFunction();
  ejemploHelpers();
  ejemploArrayParams();
  ejemploClone();
  ejemploFiltrosCondicionales({ categoria: 5, busqueda: 'test', page: 2, limit: 15 });
  ejemploReactState();
  ejemploAxios();
  ejemploResetear();
  ejemploGetParams();
  
  console.log('═'.repeat(60));
  console.log('\n✅ TODOS LOS EJEMPLOS EJECUTADOS\n');
}

// Descomentar para ejecutar al importar:
// ejecutarTodosLosEjemplos();

