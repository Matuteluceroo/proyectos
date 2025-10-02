// 🔐 middleware/jwt.js - Middleware para autenticación JWT
import jwt from 'jsonwebtoken';

// 🔑 Función para generar tokens de acceso
export function generateAccessToken(user) {
  // Por ahora usamos un secret hardcodeado, en producción debe ser una variable de entorno
  const secret = process.env.SECRET || 'tu_clave_secreta_muy_segura_123';
  return jwt.sign(user, secret, { expiresIn: '5h' });
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

  const secret = process.env.SECRET || 'tu_clave_secreta_muy_segura_123';
  
  jwt.verify(accessToken, secret, (err, user) => {
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
  // Simular un usuario para desarrollo
  req.user = {
    id: 1,
    username: 'dev_user',
    email: 'dev@example.com',
    rol: 'admin',
    nombre_completo: 'Usuario de Desarrollo'
  };
  next();
}

// 📝 NOTAS:
// 1. En desarrollo puedes usar devBypassAuth para saltar la autenticación
// 2. En producción asegúrate de usar una SECRET key segura
// 3. El token puede venir del header Authorization o de cookies
// 4. requireRole permite verificar permisos específicos