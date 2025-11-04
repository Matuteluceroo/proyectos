/**
 * 🔐 AUTH CONTROLLER - Autenticación y autorización
 * ==================================================
 * Manejo seguro de autenticación sin exponer passwords en logs.
 */

import bcrypt from 'bcrypt';
import jwt from 'jwt-simple';
import { asyncHandler, AppError, UnauthorizedError, sendSuccess } from '../middleware/errorHandler.js';
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./saber_citricola.db');

// Helper para promisificar consultas SQLite
const dbGet = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbRun = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

/**
 * 🔑 Login - Autenticar usuario
 * CRÍTICO: NUNCA loggear passwords
 */
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // ✅ Log seguro - SIN password
  console.log(`🔐 Intento de login - Usuario: ${username}`);

  // Buscar usuario por username
  const usuario = await dbGet(
    'SELECT id, username, password, email, nombre_completo, rol, area, activo FROM usuarios WHERE username = ?',
    [username]
  );

  if (!usuario) {
    console.warn(`⚠️ Login fallido - Usuario no encontrado: ${username}`);
    throw new UnauthorizedError('Credenciales incorrectas');
  }

  // Verificar si usuario está activo
  if (!usuario.activo) {
    console.warn(`⚠️ Login fallido - Usuario inactivo: ${username}`);
    throw new UnauthorizedError('Usuario inactivo. Contacte al administrador.');
  }

  // Comparar password hasheado
  const passwordValido = await bcrypt.compare(password, usuario.password);

  if (!passwordValido) {
    console.warn(`⚠️ Login fallido - Password incorrecto para: ${username}`);
    
    // Registrar intento fallido (para detección de ataques de fuerza bruta)
    await registrarIntentoFallido(usuario.id);
    
    throw new UnauthorizedError('Credenciales incorrectas');
  }

  // ✅ Login exitoso - generar token JWT
  const payload = {
    id: usuario.id,
    username: usuario.username,
    rol: usuario.rol,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (5 * 60 * 60) // 5 horas
  };

  const secret = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';
  const token = jwt.encode(payload, secret);

  // Actualizar último login
  await dbRun(
    'UPDATE usuarios SET ultimo_login = CURRENT_TIMESTAMP WHERE id = ?',
    [usuario.id]
  );

  // Limpiar intentos fallidos
  await limpiarIntentosFallidos(usuario.id);

  console.log(`✅ Login exitoso - Usuario: ${username}, Rol: ${usuario.rol}`);

  // Establecer cookie HTTPOnly (más seguro que localStorage)
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS en producción
    sameSite: 'strict',
    maxAge: 5 * 60 * 60 * 1000 // 5 horas
  });

  // Respuesta sin password
  sendSuccess(res, {
    usuario: {
      id: usuario.id,
      username: usuario.username,
      email: usuario.email,
      nombre_completo: usuario.nombre_completo,
      rol: usuario.rol,
      area: usuario.area
    },
    token
  }, 'Login exitoso');
});

/**
 * 🚪 Logout - Cerrar sesión
 */
export const logout = asyncHandler(async (req, res) => {
  const username = req.user?.username || 'unknown';
  
  console.log(`🚪 Logout - Usuario: ${username}`);

  // Limpiar cookie
  res.clearCookie('token');

  sendSuccess(res, null, 'Sesión cerrada exitosamente');
});

/**
 * 🔄 Refresh - Refrescar token
 */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new UnauthorizedError('No hay token para refrescar');
  }

  const secret = process.env.JWT_SECRET || 'tu-secreto-super-seguro-cambiar-en-produccion';
  
  try {
    const decoded = jwt.decode(token, secret);
    
    // Verificar si el token está próximo a expirar (menos de 1 hora restante)
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = decoded.exp - now;

    if (timeUntilExpiry > 3600) {
      // Token aún válido por más de 1 hora, no renovar
      return sendSuccess(res, { token, renovado: false }, 'Token aún válido');
    }

    // Generar nuevo token
    const newPayload = {
      id: decoded.id,
      username: decoded.username,
      rol: decoded.rol,
      iat: now,
      exp: now + (5 * 60 * 60) // 5 horas
    };

    const newToken = jwt.encode(newPayload, secret);

    res.cookie('token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 5 * 60 * 60 * 1000
    });

    sendSuccess(res, { token: newToken, renovado: true }, 'Token renovado');
  } catch (error) {
    throw new UnauthorizedError('Token inválido o expirado');
  }
});

/**
 * 👤 Obtener perfil del usuario autenticado
 */
export const getProfile = asyncHandler(async (req, res) => {
  const usuario = await dbGet(
    'SELECT id, username, email, nombre_completo, rol, area, telefono, ultimo_login, created_at FROM usuarios WHERE id = ?',
    [req.user.id]
  );

  if (!usuario) {
    throw new NotFoundError('Usuario no encontrado');
  }

  sendSuccess(res, usuario);
});

/**
 * 🔐 Cambiar password
 * CRÍTICO: Validar password anterior antes de cambiar
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { passwordActual, passwordNuevo } = req.body;
  const userId = req.user.id;

  // ✅ Log seguro - SIN passwords
  console.log(`🔐 Cambio de password solicitado - Usuario ID: ${userId}`);

  if (!passwordActual || !passwordNuevo) {
    throw new AppError('Password actual y nuevo son requeridos', 400);
  }

  if (passwordNuevo.length < 6) {
    throw new AppError('El nuevo password debe tener al menos 6 caracteres', 400);
  }

  // Obtener usuario
  const usuario = await dbGet(
    'SELECT id, username, password FROM usuarios WHERE id = ?',
    [userId]
  );

  if (!usuario) {
    throw new NotFoundError('Usuario no encontrado');
  }

  // Verificar password actual
  const passwordValido = await bcrypt.compare(passwordActual, usuario.password);

  if (!passwordValido) {
    console.warn(`⚠️ Cambio de password fallido - Password actual incorrecto para usuario ID: ${userId}`);
    throw new UnauthorizedError('Password actual incorrecto');
  }

  // Hashear nuevo password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(passwordNuevo, salt);

  // Actualizar password
  await dbRun(
    'UPDATE usuarios SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [passwordHash, userId]
  );

  console.log(`✅ Password cambiado exitosamente - Usuario: ${usuario.username}`);

  sendSuccess(res, null, 'Password actualizado exitosamente');
});

/**
 * 📧 Solicitar reset de password (envía email con token)
 * Nota: Requiere configuración de email service
 */
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  console.log(`📧 Reset de password solicitado para email: ${email}`);

  const usuario = await dbGet(
    'SELECT id, username, email FROM usuarios WHERE email = ?',
    [email]
  );

  // ⚠️ IMPORTANTE: Por seguridad, siempre retornar éxito aunque el email no exista
  // (prevenir enumeración de usuarios)
  if (!usuario) {
    console.warn(`⚠️ Reset solicitado para email inexistente: ${email}`);
    // Retornar éxito de todas formas
    return sendSuccess(res, null, 'Si el email existe, recibirás instrucciones para resetear tu password');
  }

  // TODO: Generar token único, guardarlo en BD, enviar email
  // Por ahora, solo loggear
  console.log(`✅ Reset de password procesado para: ${usuario.username}`);

  sendSuccess(res, null, 'Si el email existe, recibirás instrucciones para resetear tu password');
});

// ============================================================================
// 🛡️ FUNCIONES AUXILIARES DE SEGURIDAD
// ============================================================================

/**
 * Registrar intento fallido de login (para detectar ataques de fuerza bruta)
 */
const registrarIntentoFallido = async (userId) => {
  // TODO: Implementar tabla de intentos fallidos
  // Por ahora solo loggear
  console.warn(`⚠️ Intento fallido registrado para usuario ID: ${userId}`);
};

/**
 * Limpiar intentos fallidos después de login exitoso
 */
const limpiarIntentosFallidos = async (userId) => {
  // TODO: Limpiar tabla de intentos fallidos
  console.log(`✅ Intentos fallidos limpiados para usuario ID: ${userId}`);
};

/**
 * Verificar si usuario está bloqueado por muchos intentos fallidos
 */
export const checkUserLocked = async (username) => {
  // TODO: Implementar lógica de bloqueo por intentos fallidos
  // Por ahora retornar false
  return false;
};

export default {
  login,
  logout,
  refresh,
  getProfile,
  changePassword,
  requestPasswordReset
};

