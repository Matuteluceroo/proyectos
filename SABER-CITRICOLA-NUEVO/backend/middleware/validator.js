/**
 * 🛡️ VALIDATOR MIDDLEWARE - Validación de datos con Joi
 * ======================================================
 * Middleware de validación genérico para prevenir datos inválidos.
 * Usa Joi para validar schemas de forma robusta.
 */

import Joi from 'joi';

/**
 * Middleware de validación genérico
 * @param {Joi.Schema} schema - Schema de validación Joi
 * @param {string} source - Fuente de datos ('body', 'query', 'params')
 * @returns {Function} Middleware Express
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Retornar todos los errores, no solo el primero
      stripUnknown: true // Remover campos no definidos en el schema
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        type: detail.type
      }));

      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors
      });
    }

    // Reemplazar con datos validados y sanitizados
    req[source] = value;
    next();
  };
};

// ============================================================================
// 📋 SCHEMAS DE VALIDACIÓN
// ============================================================================

/**
 * Schema para creación de usuario
 */
export const createUserSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required()
    .messages({
      'string.alphanum': 'El username solo puede contener letras y números',
      'string.min': 'El username debe tener al menos 3 caracteres',
      'string.max': 'El username no puede tener más de 30 caracteres',
      'any.required': 'El username es obligatorio'
    }),
  
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'El email debe ser válido',
      'any.required': 'El email es obligatorio'
    }),
  
  password: Joi.string()
    .min(6)
    .max(100)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es obligatoria'
    }),
  
  nombre_completo: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'string.max': 'El nombre no puede tener más de 100 caracteres',
      'any.required': 'El nombre completo es obligatorio'
    }),
  
  rol: Joi.string()
    .valid('administrador', 'experto', 'operador')
    .required()
    .messages({
      'any.only': 'El rol debe ser administrador, experto u operador',
      'any.required': 'El rol es obligatorio'
    }),

  area: Joi.string()
    .max(100)
    .optional()
    .allow('', null),

  telefono: Joi.string()
    .pattern(/^[0-9+\-\s()]{7,20}$/)
    .optional()
    .allow('', null)
    .messages({
      'string.pattern.base': 'El teléfono debe ser válido'
    })
});

/**
 * Schema para actualización de usuario
 */
export const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30),
  email: Joi.string().email(),
  nombre_completo: Joi.string().min(3).max(100),
  rol: Joi.string().valid('administrador', 'experto', 'operador'),
  area: Joi.string().max(100).allow('', null),
  telefono: Joi.string().pattern(/^[0-9+\-\s()]{7,20}$/).allow('', null),
  activo: Joi.boolean()
}).min(1); // Al menos un campo debe estar presente

/**
 * Schema para login
 */
export const loginSchema = Joi.object({
  username: Joi.string()
    .required()
    .messages({
      'any.required': 'El username es obligatorio'
    }),
  
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'La contraseña es obligatoria'
    })
});

/**
 * Schema para creación de documento
 */
export const createDocumentSchema = Joi.object({
  titulo: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.min': 'El título debe tener al menos 3 caracteres',
      'string.max': 'El título no puede tener más de 200 caracteres',
      'any.required': 'El título es obligatorio'
    }),
  
  descripcion: Joi.string()
    .max(1000)
    .allow('', null)
    .optional(),
  
  contenido: Joi.string()
    .allow('', null)
    .optional(),
  
  categoria_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'La categoría debe ser un número',
      'number.positive': 'La categoría debe ser válida',
      'any.required': 'La categoría es obligatoria'
    }),
  
  tipo: Joi.string()
    .valid('documento', 'guia', 'procedimiento', 'capacitacion')
    .required()
    .messages({
      'any.only': 'El tipo debe ser documento, guia, procedimiento o capacitacion',
      'any.required': 'El tipo es obligatorio'
    }),

  tags: Joi.string()
    .max(500)
    .allow('', null)
    .optional(),

  keywords: Joi.string()
    .max(500)
    .allow('', null)
    .optional(),

  nivel_acceso: Joi.string()
    .valid('publico', 'privado', 'restringido')
    .default('publico'),

  estado: Joi.string()
    .valid('borrador', 'revision', 'publicado', 'archivado')
    .default('borrador'),

  autor_id: Joi.number()
    .integer()
    .positive()
    .optional(),

  archivo_id: Joi.number()
    .integer()
    .positive()
    .optional()
});

/**
 * Schema para actualización de documento
 */
export const updateDocumentSchema = Joi.object({
  titulo: Joi.string().min(3).max(200),
  descripcion: Joi.string().max(1000).allow('', null),
  contenido: Joi.string().allow('', null),
  categoria_id: Joi.number().integer().positive(),
  tipo: Joi.string().valid('documento', 'guia', 'procedimiento', 'capacitacion'),
  tags: Joi.string().max(500).allow('', null),
  keywords: Joi.string().max(500).allow('', null),
  nivel_acceso: Joi.string().valid('publico', 'privado', 'restringido'),
  estado: Joi.string().valid('borrador', 'revision', 'publicado', 'archivado')
}).min(1);

/**
 * Schema para query parameters (paginación, búsqueda, ordenamiento)
 */
export const queryParamsSchema = Joi.object({
  // Paginación
  pagina: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'La página debe ser un número',
      'number.min': 'La página debe ser mayor a 0'
    }),
  
  limite: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'El límite debe ser un número',
      'number.min': 'El límite debe ser al menos 1',
      'number.max': 'El límite no puede ser mayor a 100'
    }),
  
  // Ordenamiento
  orden: Joi.string()
    .valid('titulo', 'created_at', 'updated_at', 'vistas', 'estado')
    .default('created_at')
    .messages({
      'any.only': 'El campo de orden no es válido'
    }),
  
  direccion: Joi.string()
    .valid('ASC', 'DESC', 'asc', 'desc')
    .default('DESC')
    .uppercase() // Convertir a mayúsculas automáticamente
    .messages({
      'any.only': 'La dirección debe ser ASC o DESC'
    }),
  
  // Búsqueda
  busqueda: Joi.string()
    .max(200)
    .allow('', null)
    .optional(),

  q: Joi.string()
    .max(200)
    .allow('', null)
    .optional(),
  
  // Filtros
  categoria_id: Joi.number()
    .integer()
    .positive()
    .optional(),
  
  tipo: Joi.string()
    .valid('documento', 'guia', 'procedimiento', 'capacitacion')
    .optional(),
  
  estado: Joi.string()
    .valid('borrador', 'revision', 'publicado', 'archivado')
    .optional(),

  nivel_acceso: Joi.string()
    .valid('publico', 'privado', 'restringido')
    .optional(),

  autor: Joi.number()
    .integer()
    .positive()
    .optional(),

  usuario_id: Joi.number()
    .integer()
    .positive()
    .optional()
});

/**
 * Schema para ID en params
 */
export const idParamSchema = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID debe ser un número',
      'number.positive': 'El ID debe ser válido',
      'any.required': 'El ID es obligatorio'
    })
});

/**
 * Schema para creación de categoría
 */
export const createCategorySchema = Joi.object({
  nombre: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 3 caracteres',
      'any.required': 'El nombre es obligatorio'
    }),
  
  descripcion: Joi.string()
    .max(500)
    .allow('', null)
    .optional(),
  
  color: Joi.string()
    .pattern(/^#[0-9A-Fa-f]{6}$/)
    .default('#3B82F6')
    .messages({
      'string.pattern.base': 'El color debe ser un código hexadecimal válido (#RRGGBB)'
    }),

  icono: Joi.string()
    .max(50)
    .allow('', null)
    .optional()
});

// Exportar todos los schemas en un objeto para fácil acceso
export const schemas = {
  createUser: createUserSchema,
  updateUser: updateUserSchema,
  login: loginSchema,
  createDocument: createDocumentSchema,
  updateDocument: updateDocumentSchema,
  queryParams: queryParamsSchema,
  idParam: idParamSchema,
  createCategory: createCategorySchema
};

export default {
  validate,
  schemas
};

