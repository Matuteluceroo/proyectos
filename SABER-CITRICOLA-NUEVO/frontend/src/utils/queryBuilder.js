/**
 * 🔧 QUERY BUILDER - Constructor fluido de URLs con query params
 * ================================================================
 * Facilita la construcción de URLs con parámetros de consulta de forma
 * legible y mantenible usando el patrón Builder (Fluent API).
 * 
 * @example
 * const url = new QueryBuilder('/api/documentos')
 *   .addFilter('categoria', categoriaId)
 *   .addSearch('manual de operación')
 *   .addPagination(2, 20)
 *   .addSort('titulo', 'ASC')
 *   .build();
 * // Resultado: '/api/documentos?categoria=1&busqueda=manual%20de%20operaci%C3%B3n&pagina=2&limite=20&orden=titulo&direccion=ASC'
 */

export class QueryBuilder {
  /**
   * Constructor del QueryBuilder
   * @param {string} baseUrl - URL base (ej: '/api/documentos')
   */
  constructor(baseUrl) {
    if (!baseUrl) {
      throw new Error('QueryBuilder: baseUrl es requerida');
    }
    this.baseUrl = baseUrl;
    this.params = new Map();
  }

  /**
   * 🔧 MÉTODO PRIVADO: Agregar un parámetro
   * @private
   * @param {string} key - Nombre del parámetro
   * @param {any} value - Valor del parámetro
   * @returns {QueryBuilder} this (para encadenar)
   */
  _addParam(key, value) {
    // Solo agregar si el valor no es null, undefined o string vacío
    if (value !== null && value !== undefined && value !== '') {
      this.params.set(key, value);
    }
    return this;
  }

  /**
   * 📋 Agregar un filtro simple (key=value)
   * @param {string} key - Nombre del filtro
   * @param {any} value - Valor del filtro
   * @returns {QueryBuilder} this (para encadenar)
   * 
   * @example
   * builder.addFilter('categoria_id', 5)
   * builder.addFilter('tipo', 'pdf')
   * builder.addFilter('estado', 'activo')
   */
  addFilter(key, value) {
    return this._addParam(key, value);
  }

  /**
   * 📋 Agregar múltiples filtros de una vez
   * @param {Object} filters - Objeto con los filtros { key: value, ... }
   * @returns {QueryBuilder} this (para encadenar)
   * 
   * @example
   * builder.addFilters({
   *   categoria_id: 5,
   *   tipo: 'pdf',
   *   estado: 'activo'
   * })
   */
  addFilters(filters) {
    if (filters && typeof filters === 'object') {
      Object.entries(filters).forEach(([key, value]) => {
        this._addParam(key, value);
      });
    }
    return this;
  }

  /**
   * 🔍 Agregar búsqueda (q o busqueda)
   * @param {string} searchTerm - Término de búsqueda
   * @param {string} paramName - Nombre del parámetro (default: 'busqueda')
   * @returns {QueryBuilder} this (para encadenar)
   * 
   * @example
   * builder.addSearch('manual de usuario')
   * builder.addSearch('manual', 'q')
   */
  addSearch(searchTerm, paramName = 'busqueda') {
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim().length > 0) {
      return this._addParam(paramName, searchTerm.trim());
    }
    return this;
  }

  /**
   * 📄 Agregar paginación
   * @param {number} page - Número de página (1-indexed)
   * @param {number} limit - Cantidad de items por página
   * @returns {QueryBuilder} this (para encadenar)
   * 
   * @example
   * builder.addPagination(2, 20) // página 2, 20 items por página
   */
  addPagination(page, limit) {
    if (page && Number.isInteger(page) && page > 0) {
      this._addParam('pagina', page);
    }
    if (limit && Number.isInteger(limit) && limit > 0) {
      this._addParam('limite', limit);
    }
    return this;
  }

  /**
   * 🔢 Agregar solo página
   * @param {number} page - Número de página
   * @returns {QueryBuilder} this (para encadenar)
   */
  addPage(page) {
    if (page && Number.isInteger(page) && page > 0) {
      this._addParam('pagina', page);
    }
    return this;
  }

  /**
   * 🔢 Agregar solo límite
   * @param {number} limit - Cantidad de items
   * @returns {QueryBuilder} this (para encadenar)
   */
  addLimit(limit) {
    if (limit && Number.isInteger(limit) && limit > 0) {
      this._addParam('limite', limit);
    }
    return this;
  }

  /**
   * ↕️ Agregar ordenamiento
   * @param {string} column - Columna por la que ordenar
   * @param {string} direction - Dirección: 'ASC' o 'DESC' (default: 'DESC')
   * @returns {QueryBuilder} this (para encadenar)
   * 
   * @example
   * builder.addSort('titulo', 'ASC')
   * builder.addSort('created_at', 'DESC')
   */
  addSort(column, direction = 'DESC') {
    if (column) {
      this._addParam('orden', column);
      
      // Validar dirección
      const validDirection = ['ASC', 'DESC'].includes(direction?.toUpperCase()) 
        ? direction.toUpperCase() 
        : 'DESC';
      this._addParam('direccion', validDirection);
    }
    return this;
  }

  /**
   * 📅 Agregar filtro de fecha desde
   * @param {string|Date} date - Fecha en formato ISO o objeto Date
   * @returns {QueryBuilder} this (para encadenar)
   * 
   * @example
   * builder.addDateFrom('2024-01-01')
   * builder.addDateFrom(new Date('2024-01-01'))
   */
  addDateFrom(date) {
    if (date) {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      return this._addParam('fechaDesde', dateStr);
    }
    return this;
  }

  /**
   * 📅 Agregar filtro de fecha hasta
   * @param {string|Date} date - Fecha en formato ISO o objeto Date
   * @returns {QueryBuilder} this (para encadenar)
   * 
   * @example
   * builder.addDateTo('2024-12-31')
   * builder.addDateTo(new Date('2024-12-31'))
   */
  addDateTo(date) {
    if (date) {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      return this._addParam('fechaHasta', dateStr);
    }
    return this;
  }

  /**
   * 📅 Agregar rango de fechas
   * @param {string|Date} from - Fecha desde
   * @param {string|Date} to - Fecha hasta
   * @returns {QueryBuilder} this (para encadenar)
   * 
   * @example
   * builder.addDateRange('2024-01-01', '2024-12-31')
   */
  addDateRange(from, to) {
    this.addDateFrom(from);
    this.addDateTo(to);
    return this;
  }

  /**
   * 📋 Agregar múltiples valores para un mismo parámetro (arrays)
   * Convierte: ids=[1,2,3] en ids=1&ids=2&ids=3
   * @param {string} key - Nombre del parámetro
   * @param {Array} values - Array de valores
   * @returns {QueryBuilder} this (para encadenar)
   * 
   * @example
   * builder.addArrayParam('categorias', [1, 2, 3])
   * // Resultado: categorias=1&categorias=2&categorias=3
   */
  addArrayParam(key, values) {
    if (Array.isArray(values) && values.length > 0) {
      this.params.set(key, values);
    }
    return this;
  }

  /**
   * 🔄 Resetear todos los parámetros
   * @returns {QueryBuilder} this (para encadenar)
   */
  reset() {
    this.params.clear();
    return this;
  }

  /**
   * 🗑️ Remover un parámetro específico
   * @param {string} key - Nombre del parámetro a remover
   * @returns {QueryBuilder} this (para encadenar)
   * 
   * @example
   * builder.removeParam('categoria_id')
   */
  removeParam(key) {
    this.params.delete(key);
    return this;
  }

  /**
   * 📊 Obtener todos los parámetros como objeto
   * @returns {Object} Objeto con todos los parámetros
   * 
   * @example
   * const params = builder.getParams();
   * console.log(params); // { categoria: 5, busqueda: 'manual', ... }
   */
  getParams() {
    const paramsObj = {};
    this.params.forEach((value, key) => {
      paramsObj[key] = value;
    });
    return paramsObj;
  }

  /**
   * 🔗 Construir la query string sin la baseUrl
   * @returns {string} Query string (ej: 'categoria=1&busqueda=test')
   * 
   * @example
   * const queryString = builder.getQueryString();
   * console.log(queryString); // 'categoria=1&busqueda=manual&pagina=2'
   */
  getQueryString() {
    if (this.params.size === 0) {
      return '';
    }

    const queryParts = [];
    
    this.params.forEach((value, key) => {
      if (Array.isArray(value)) {
        // Manejar arrays: key=val1&key=val2&key=val3
        value.forEach(val => {
          queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(val)}`);
        });
      } else {
        // Valor simple
        queryParts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
      }
    });

    return queryParts.join('&');
  }

  /**
   * 🏗️ Construir la URL completa con query params
   * @returns {string} URL completa con parámetros
   * 
   * @example
   * const url = builder.build();
   * console.log(url); // '/api/documentos?categoria=1&busqueda=manual'
   */
  build() {
    const queryString = this.getQueryString();
    
    if (!queryString) {
      return this.baseUrl;
    }

    // Agregar ? o & dependiendo si la baseUrl ya tiene parámetros
    const separator = this.baseUrl.includes('?') ? '&' : '?';
    return `${this.baseUrl}${separator}${queryString}`;
  }

  /**
   * 📋 Clonar el QueryBuilder actual
   * @returns {QueryBuilder} Nuevo QueryBuilder con los mismos parámetros
   * 
   * @example
   * const builder2 = builder.clone();
   * builder2.addFilter('estado', 'activo'); // No afecta al builder original
   */
  clone() {
    const newBuilder = new QueryBuilder(this.baseUrl);
    this.params.forEach((value, key) => {
      newBuilder.params.set(key, value);
    });
    return newBuilder;
  }

  /**
   * 🖨️ Convertir a string (alias de build())
   * Permite usar el builder directamente en template strings
   * @returns {string} URL completa
   * 
   * @example
   * const builder = new QueryBuilder('/api/docs').addFilter('id', 1);
   * console.log(`Llamando a: ${builder}`); // Llama automáticamente a toString()
   */
  toString() {
    return this.build();
  }
}

/**
 * 🎯 FACTORY FUNCTION - Crear QueryBuilder de forma más concisa
 * @param {string} baseUrl - URL base
 * @returns {QueryBuilder} Nueva instancia de QueryBuilder
 * 
 * @example
 * const url = query('/api/documentos')
 *   .addFilter('categoria', 1)
 *   .build();
 */
export function query(baseUrl) {
  return new QueryBuilder(baseUrl);
}

/**
 * 🔧 HELPERS - Funciones auxiliares para casos comunes
 */
export const QueryHelpers = {
  /**
   * Crear builder con paginación pre-configurada
   * @param {string} baseUrl - URL base
   * @param {number} page - Página
   * @param {number} limit - Límite
   * @returns {QueryBuilder}
   */
  paginated(baseUrl, page = 1, limit = 20) {
    return new QueryBuilder(baseUrl).addPagination(page, limit);
  },

  /**
   * Crear builder con búsqueda pre-configurada
   * @param {string} baseUrl - URL base
   * @param {string} searchTerm - Término de búsqueda
   * @returns {QueryBuilder}
   */
  search(baseUrl, searchTerm) {
    return new QueryBuilder(baseUrl).addSearch(searchTerm);
  },

  /**
   * Crear builder con ordenamiento pre-configurado
   * @param {string} baseUrl - URL base
   * @param {string} column - Columna
   * @param {string} direction - Dirección
   * @returns {QueryBuilder}
   */
  sorted(baseUrl, column, direction = 'DESC') {
    return new QueryBuilder(baseUrl).addSort(column, direction);
  }
};

// Exportación por defecto
export default QueryBuilder;

