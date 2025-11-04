/**
 * 🔐 AUTH ROUTES - Rutas de autenticación
 * ========================================
 * Todas las rutas relacionadas con autenticación y autorización.
 */

import { Router } from 'express';
import { 
  login, 
  logout, 
  refresh, 
  getProfile, 
  changePassword,
  requestPasswordReset 
} from '../controllers/authController.js';
import { validate, schemas } from '../middleware/validator.js';
import { verifyToken } from '../middleware/jwt.js';

const router = Router();

// ============================================================================
// 🔓 RUTAS PÚBLICAS (sin autenticación)
// ============================================================================

/**
 * POST /api/auth/login
 * Autenticar usuario y obtener token
 */
router.post('/login', 
  validate(schemas.login, 'body'),
  login
);

/**
 * POST /api/auth/password-reset/request
 * Solicitar reset de password (envía email)
 */
router.post('/password-reset/request',
  requestPasswordReset
);

// ============================================================================
// 🔒 RUTAS PROTEGIDAS (requieren autenticación)
// ============================================================================

/**
 * POST /api/auth/logout
 * Cerrar sesión
 */
router.post('/logout',
  verifyToken,
  logout
);

/**
 * POST /api/auth/refresh
 * Refrescar token JWT
 */
router.post('/refresh',
  verifyToken,
  refresh
);

/**
 * GET /api/auth/profile
 * Obtener perfil del usuario autenticado
 */
router.get('/profile',
  verifyToken,
  getProfile
);

/**
 * PUT /api/auth/password
 * Cambiar password del usuario autenticado
 */
router.put('/password',
  verifyToken,
  changePassword
);

// ============================================================================
// 📊 HEALTH CHECK
// ============================================================================

/**
 * GET /api/auth/health
 * Verificar estado del servicio de autenticación
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'auth',
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;

