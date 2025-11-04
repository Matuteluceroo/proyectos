/**
 * 🚨 ERROR HANDLER MIDDLEWARE - Manejo centralizado de errores
 * =============================================================
 * Sistema robusto de manejo de errores con logging seguro y
 * respuestas estandarizadas.
 */

/**
 * Clase de error personalizada para errores operacionales
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores predefinidos comunes
 */
export class ValidationError extends AppError {
  constructor(message = 'Datos de entrada inválidos') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Acceso denegado') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflicto con el estado actual') {
    super(message, 409);
  }
}

/**
 * Logger seguro que NO expone información sensible
 */
const secureLogger = {
  error: (context, error) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: error.message,
      statusCode: error.statusCode,
      path: context.path,
      method: context.method,
      userId: context.userId || 'anonymous',
      ip: context.ip
    };

    // En desarrollo, incluir stack trace
    if (isDevelopment && error.stack) {
      logEntry.stack = error.stack;
    }

    // NO loggear passwords, tokens, o datos sensibles
    console.error(JSON.stringify(logEntry, null, 2));
  },

  warn: (message, metadata = {}) => {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...metadata
    }));
  },

  info: (message, metadata = {}) => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...metadata
    }));
  }
};

/**
 * Sanitizar errores de SQLite para no exponer estructura de BD
 */
const sanitizeSQLiteError = (error) => {
  const sqliteErrors = {
    'SQLITE_CONSTRAINT': 'Operación violó una restricción de integridad',
    'SQLITE_CONSTRAINT_UNIQUE': 'El valor ya existe en la base de datos',
    'SQLITE_CONSTRAINT_FOREIGNKEY': 'Referencia inválida a otro registro',
    'SQLITE_ERROR': 'Error en la operación de base de datos',
    'SQLITE_BUSY': 'Base de datos ocupada, intente nuevamente',
    'SQLITE_NOTFOUND': 'Registro no encontrado'
  };

  if (error.code && error.code.startsWith('SQLITE_')) {
    return sqliteErrors[error.code] || 'Error en la base de datos';
  }

  // Sanitizar mensajes que expongan estructura SQL
  if (error.message && error.message.includes('SQLITE')) {
    return 'Error en la operación de base de datos';
  }

  return null;
};

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Valores por defecto
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let isOperational = err.isOperational !== undefined ? err.isOperational : false;

  // Contexto para logging (sin datos sensibles)
  const errorContext = {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    ip: req.ip || req.connection.remoteAddress
  };

  // Manejar errores específicos de SQLite
  const sanitizedSQLMessage = sanitizeSQLiteError(err);
  if (sanitizedSQLMessage) {
    message = sanitizedSQLMessage;
    statusCode = 400;
    isOperational = true;
  }

  // Manejar errores de JWT
  if (err.name === 'JsonWebTokenError') {
    message = 'Token inválido';
    statusCode = 401;
    isOperational = true;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expirado';
    statusCode = 401;
    isOperational = true;
  }

  // Manejar errores de validación de Joi (por si alguno se escapa)
  if (err.name === 'ValidationError' && err.isJoi) {
    message = 'Datos de entrada inválidos';
    statusCode = 400;
    isOperational = true;
  }

  // Loggear error de forma segura
  if (!isOperational) {
    // Errores no operacionales son bugs - loggear completamente
    secureLogger.error(errorContext, err);
  } else if (isDevelopment) {
    // En desarrollo, loggear errores operacionales también
    secureLogger.warn(`Operational error: ${message}`, errorContext);
  }

  // Construir respuesta
  const errorResponse = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    path: req.path
  };

  // Solo incluir stack trace en desarrollo para errores no operacionales
  if (isDevelopment && !isOperational && err.stack) {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      name: err.name,
      code: err.code
    };
  }

  // Enviar respuesta
  res.status(statusCode).json(errorResponse);
};

/**
 * Wrapper para funciones async - captura errores automáticamente
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para manejar rutas no encontradas (404)
 */
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Ruta ${req.originalUrl} no encontrada`);
  next(error);
};

/**
 * Middleware para validar que el recurso existe
 */
export const validateResourceExists = (resource, resourceName = 'Recurso') => {
  if (!resource) {
    throw new NotFoundError(`${resourceName} no encontrado`);
  }
  return resource;
};

/**
 * Enviar respuesta de éxito estandarizada
 */
export const sendSuccess = (res, data, message = 'Operación exitosa', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

export default {
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validateResourceExists,
  sendSuccess
};

