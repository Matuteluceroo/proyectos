// 🔐 middleware/jwt.js - Middleware para autenticación JWT
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ✅ Secret seguro: usa .env o genera uno aleatorio para la sesión
const JWT_SECRET = process.env.JWT_SECRET || process.env.SECRET || (() => {
  const generated = crypto.randomBytes(32).toString('hex');
  if (process.env.NODE_ENV !== 'production') {
    console.warn('⚠️ JWT_SECRET no configurado. Usando secret temporal para demo.');
  }
  return generated;
})();

// 🔑 Función para generar tokens de acceso
export function generateAccessToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '5h' });
}

// 🛡️ Middleware para validar tokens
export function validateToken(req, res, next) {
  // Para desarrollo, puedes descomentar las siguientes líneas para saltar la validación:
  // next();
  // return;
  
  // Obtener token de diferentes fuentes
  const tokenFromCookie = req.cookies?.token;
  const tokenFromHeader = req.headers.authorization?.replace('Bearer ', '');
  const accessToken = tokenFromHeader || tokenFromCookie;

  if (!accessToken) {
    return res.status(401).json({ 
      success: false,
      message: 'Token no proporcionado',
      error: 'Se requiere autenticación' 
    });
  }
  
  jwt.verify(accessToken, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado',
        error: 'Token expirado o inválido'
      });
    }
    
    // Agregar información del usuario a la request
    req.user = user;
    next();
  });
}

// 🔄 Alias para compatibilidad
export const authMiddleware = validateToken;

// 👤 Middleware para verificar roles específicos
export function requireRole(roles) {
  return (req, res, next) => {
    const userRole = req.user?.rol || req.user?.role;
    
    if (!userRole) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado',
        error: 'No se pudo determinar el rol del usuario'
      });
    }
    
    // Si roles es un string, convertirlo a array
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Acceso denegado',
        error: `Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`
      });
    }
    
    next();
  };
}

// 🧪 Middleware para desarrollo - permite todas las requests
export function devBypassAuth(req, res, next) {
  // 🚨 SEGURIDAD: Solo permitir bypass en entorno de desarrollo
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado',
      error: 'El bypass de autenticación no está permitido en producción'
    });
  }
  
  // Simular un usuario para desarrollo con estructura completa
  req.user = {
    id: 1,
    username: 'dev_user',
    email: 'dev@example.com',
    rol: 'admin',
    role: 'admin', // Alias para compatibilidad
    nombre_completo: 'Usuario de Desarrollo'
  };
  next();
}

// 📝 NOTAS:
// 1. En desarrollo puedes usar devBypassAuth para saltar la autenticación
// 2. En producción asegúrate de usar una SECRET key segura
// 3. El token puede venir del header Authorization o de cookies
// 4. requireRole permite verificar permisos específicos