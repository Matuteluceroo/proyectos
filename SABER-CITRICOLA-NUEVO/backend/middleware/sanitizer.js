/**
 * 🧹 SANITIZER MIDDLEWARE - Prevención de SQL Injection y XSS
 * ============================================================
 * Limpia y valida parámetros para prevenir ataques de inyección.
 * Especialmente crítico para ORDER BY dinámicos.
 */

/**
 * Prevenir SQL Injection limpiando caracteres peligrosos
 */
export const sanitizeQuery = (req, res, next) => {
  // Caracteres peligrosos para SQL
  const dangerousChars = /[;'"\\`<>]/g;
  
  // Limpiar query parameters
  if (req.query && typeof req.query === 'object') {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        // Remover caracteres peligrosos
        req.query[key] = req.query[key].replace(dangerousChars, '');
        
        // Limitar longitud para prevenir ataques de buffer overflow
        if (req.query[key].length > 500) {
          req.query[key] = req.query[key].substring(0, 500);
        }
      }
    });
  }

  // Validar y sanitizar campos críticos de SQL
  validateSQLParameters(req.query);

  next();
};

/**
 * Validar parámetros SQL críticos (ORDER BY, columnas)
 */
const validateSQLParameters = (params) => {
  // Whitelist de columnas permitidas para ORDER BY
  const validColumns = [
    'id',
    'titulo',
    'nombre',
    'created_at',
    'updated_at',
    'vistas',
    'estado',
    'fecha',
    'descargas',
    'username',
    'email',
    'nombre_completo'
  ];

  // Validar 'orden' - CRÍTICO para prevenir SQL injection
  if (params.orden && !validColumns.includes(params.orden.toLowerCase())) {
    console.warn(`⚠️ Intento de SQL injection detectado en 'orden': ${params.orden}`);
    params.orden = 'created_at'; // Valor seguro por defecto
  }

  // Validar 'direccion' - Solo ASC o DESC
  if (params.direccion) {
    const direccion = params.direccion.toUpperCase();
    if (direccion !== 'ASC' && direccion !== 'DESC') {
      console.warn(`⚠️ Dirección inválida detectada: ${params.direccion}`);
      params.direccion = 'DESC'; // Valor seguro por defecto
    } else {
      params.direccion = direccion;
    }
  }

  // Validar IDs numéricos
  const numericFields = ['id', 'categoria_id', 'autor_id', 'usuario_id', 'documento_id'];
  numericFields.forEach(field => {
    if (params[field] !== undefined) {
      const num = parseInt(params[field], 10);
      if (isNaN(num) || num <= 0) {
        console.warn(`⚠️ ID inválido detectado en '${field}': ${params[field]}`);
        delete params[field]; // Remover parámetro inválido
      } else {
        params[field] = num; // Convertir a número seguro
      }
    }
  });

  // Validar límites de paginación
  if (params.limite !== undefined) {
    const limite = parseInt(params.limite, 10);
    if (isNaN(limite) || limite <= 0 || limite > 100) {
      params.limite = 20; // Valor seguro por defecto
    } else {
      params.limite = limite;
    }
  }

  if (params.pagina !== undefined) {
    const pagina = parseInt(params.pagina, 10);
    if (isNaN(pagina) || pagina <= 0) {
      params.pagina = 1; // Valor seguro por defecto
    } else {
      params.pagina = pagina;
    }
  }
};

/**
 * Sanitizar body parameters (para prevenir XSS)
 */
export const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

/**
 * Sanitizar objeto recursivamente
 */
const sanitizeObject = (obj) => {
  const sanitized = {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        // Escapar HTML para prevenir XSS
        sanitized[key] = escapeHtml(value);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Recursivo para objetos anidados
        sanitized[key] = sanitizeObject(value);
      } else if (Array.isArray(value)) {
        // Sanitizar arrays
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? escapeHtml(item) : 
          typeof item === 'object' ? sanitizeObject(item) : item
        );
      } else {
        // Números, booleanos, etc.
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
};

/**
 * Escapar HTML para prevenir XSS
 */
const escapeHtml = (text) => {
  const map = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[<>"'/]/g, char => map[char]);
};

/**
 * Validar y sanitizar parámetros de archivo
 */
export const sanitizeFileParams = (req, res, next) => {
  // Validar extensiones de archivo permitidas
  const allowedExtensions = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', 
    '.ppt', '.pptx', '.txt', '.jpg', '.jpeg', 
    '.png', '.gif', '.mp4', '.avi', '.zip'
  ];

  if (req.file) {
    const fileExt = req.file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0];
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de archivo no permitido',
        allowedTypes: allowedExtensions
      });
    }

    // Sanitizar nombre de archivo
    req.file.sanitizedName = req.file.originalname
      .replace(/[^a-z0-9._-]/gi, '_')
      .substring(0, 200);
  }

  if (req.files && Array.isArray(req.files)) {
    req.files = req.files.filter(file => {
      const fileExt = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0];
      const isValid = fileExt && allowedExtensions.includes(fileExt);
      
      if (isValid) {
        file.sanitizedName = file.originalname
          .replace(/[^a-z0-9._-]/gi, '_')
          .substring(0, 200);
      }
      
      return isValid;
    });
  }

  next();
};

/**
 * Rate limiting básico por IP (prevenir ataques de fuerza bruta)
 */
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto
const MAX_REQUESTS = 100; // 100 requests por minuto

export const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  const record = requestCounts.get(ip);

  if (now > record.resetTime) {
    // Resetear contador
    record.count = 1;
    record.resetTime = now + RATE_LIMIT_WINDOW;
    return next();
  }

  if (record.count >= MAX_REQUESTS) {
    console.warn(`⚠️ Rate limit excedido para IP: ${ip}`);
    return res.status(429).json({
      success: false,
      message: 'Demasiadas solicitudes. Intente nuevamente en 1 minuto.',
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
  }

  record.count++;
  next();
};

/**
 * Limpiar Map de rate limiting cada hora
 */
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Cada hora

/**
 * Prevenir NoSQL injection (para futuras migraciones a MongoDB)
 */
export const preventNoSQLInjection = (req, res, next) => {
  if (req.body) {
    req.body = removeNoSQLOperators(req.body);
  }
  if (req.query) {
    req.query = removeNoSQLOperators(req.query);
  }
  next();
};

const removeNoSQLOperators = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const cleaned = {};
  for (const key in obj) {
    // Remover operadores de MongoDB ($, {})
    if (!key.startsWith('$') && !key.startsWith('{')) {
      if (typeof obj[key] === 'object') {
        cleaned[key] = removeNoSQLOperators(obj[key]);
      } else {
        cleaned[key] = obj[key];
      }
    }
  }

  return cleaned;
};

export default {
  sanitizeQuery,
  sanitizeBody,
  sanitizeFileParams,
  rateLimiter,
  preventNoSQLInjection
};

