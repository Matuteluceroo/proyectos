/**
 * 🚀 SABER CITRÍCOLA - Backend Express (REFACTORIZADO)
 * ====================================================
 * Servidor principal con middleware de seguridad aplicado globalmente.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import { 
  inicializarDB, 
  obtenerUsuarioConRol,
  obtenerTodosUsuarios,
  obtenerCategorias,
  obtenerDocumentos,
  obtenerMetricas,
  buscarContenido
} from './database-citricola.js';

// ============================================================================
// 🛡️ MIDDLEWARE DE SEGURIDAD (NUEVO)
// ============================================================================
import { errorHandler, notFoundHandler, asyncHandler } from './middleware/errorHandler.js';
import { sanitizeQuery, sanitizeBody, rateLimiter } from './middleware/sanitizer.js';
import { verifyToken } from './middleware/jwt.js';

// ============================================================================
// 📋 RUTAS
// ============================================================================
import authRoutes from './routes/auth.js';
import archivosRoutes from './routes/archivos.refactored.js'; // ✅ Rutas RESTful
import documentosRoutes from './routes/documentos.js';
import usuariosRoutes from './routes/usuarios.js';
import reportesRoutes from './routes/reportes.js';
import gestionContenidoRoutes from './routes/gestionContenido.js';
import configuracionRoutes from './routes/configuracion.js';
import guiasRapidasRoutes from './routes/guiasRapidas.js';
import procedimientosRoutes from './routes/procedimientos.js';
import comentariosRoutes from './routes/comentarios.js';
import notificacionesRoutes from './routes/notificaciones.js';

// ============================================================================
// 🏗️ CONFIGURACIÓN DE EXPRESS
// ============================================================================

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// 🌐 CORS CONFIGURATION
// ============================================================================

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
];

if (process.env.NODE_ENV === 'production') {
    allowedOrigins.push(process.env.FRONTEND_URL || 'https://*.vercel.app');
    if (process.env.CUSTOM_DOMAIN) {
        allowedOrigins.push(process.env.CUSTOM_DOMAIN);
    }
} else {
    allowedOrigins.push('null'); // Local HTML files (solo desarrollo)
}

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (process.env.NODE_ENV === 'production') {
            if (origin.endsWith('.vercel.app') || origin === process.env.FRONTEND_URL) {
                return callback(null, true);
            }
            if (process.env.CUSTOM_DOMAIN && origin === process.env.CUSTOM_DOMAIN) {
                return callback(null, true);
            }
        }
        
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.warn(`❌ CORS bloqueado para origen: ${origin}`);
            callback(new Error('No permitido por política CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'userRole', 'userrole']
}));

// ============================================================================
// 🔧 MIDDLEWARE BÁSICO
// ============================================================================

app.use(express.json({ limit: '10mb' })); // Límite de payload
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ============================================================================
// 🛡️ MIDDLEWARE DE SEGURIDAD GLOBAL (APLICADO ANTES DE RUTAS)
// ============================================================================

// Rate limiting - prevenir ataques de fuerza bruta
app.use(rateLimiter);

// Sanitizar query params - prevenir SQL injection
app.use(sanitizeQuery);

// Sanitizar body - prevenir XSS
app.use(sanitizeBody);

// Logging de requests (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.path}`);
        next();
    });
}

// ============================================================================
// 📁 ARCHIVOS ESTÁTICOS
// ============================================================================

app.use('/uploads', express.static('uploads', {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.pdf')) {
            res.setHeader('Content-Type', 'application/pdf');
        } else if (filePath.match(/\.(jpg|jpeg|png|gif)$/i)) {
            res.setHeader('Content-Type', 'image/*');
        } else if (filePath.match(/\.(mp4|avi|mov)$/i)) {
            res.setHeader('Content-Type', 'video/*');
        }
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 día
    }
}));

// ============================================================================
// 🏥 HEALTH CHECK GLOBAL
// ============================================================================

app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'ok',
        version: '2.0.0',
        timestamp: new Date().toISOString()
    });
});

// ============================================================================
// 📋 RUTAS DE API (CON PREFIJO /api)
// ============================================================================

// 🔐 Autenticación (rutas públicas y protegidas)
app.use('/api/auth', authRoutes);

// 📁 Archivos (RESTful - refactorizado)
app.use('/api/archivos', archivosRoutes);

// 📄 Documentos
app.use('/api/documentos', documentosRoutes);

// 👥 Usuarios (protegido)
app.use('/api/usuarios', verifyToken, usuariosRoutes);

// 📊 Reportes (protegido)
app.use('/api/reportes', verifyToken, reportesRoutes);

// 📚 Gestión de contenido (protegido)
app.use('/api/contenido', verifyToken, gestionContenidoRoutes);

// ⚙️ Configuración (protegido)
app.use('/api/configuracion', verifyToken, configuracionRoutes);

// ⚡ Guías rápidas
app.use('/api/guias-rapidas', guiasRapidasRoutes);

// 📋 Procedimientos
app.use('/api/procedimientos', procedimientosRoutes);

// 💬 Comentarios
app.use('/api/comentarios', comentariosRoutes);

// 🔔 Notificaciones (protegido)
app.use('/api/notificaciones', verifyToken, notificacionesRoutes);

// ============================================================================
// 🔍 BÚSQUEDA GLOBAL
// ============================================================================

app.get('/api/buscar', asyncHandler(async (req, res) => {
    const { q, tipo } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(400).json({
            success: false,
            message: 'El término de búsqueda debe tener al menos 2 caracteres'
        });
    }

    const resultados = await buscarContenido(q, tipo);
    
    res.json({
        success: true,
        data: {
            query: q,
            tipo: tipo || 'todos',
            total: resultados.length,
            resultados
        }
    });
}));

// ============================================================================
// 📊 MÉTRICAS GLOBALES (protegido)
// ============================================================================

app.get('/api/metricas', verifyToken, asyncHandler(async (req, res) => {
    const metricas = await obtenerMetricas();
    
    res.json({
        success: true,
        data: metricas
    });
}));

// ============================================================================
// 🚨 MANEJO DE ERRORES (DEBE IR AL FINAL)
// ============================================================================

// 404 - Ruta no encontrada
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

// ============================================================================
// 🚀 INICIAR SERVIDOR
// ============================================================================

app.listen(PORT, async () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🍊 SABER CITRÍCOLA - Backend v2.0 (REFACTORIZADO)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Servidor escuchando en: http://localhost:${PORT}`);
    console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🛡️  Seguridad: Rate limiting, sanitización, validación`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Inicializar base de datos
    try {
        console.log('🔄 Inicializando base de datos...');
        await inicializarDB();
        console.log('✅ Base de datos inicializada correctamente');
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Rutas disponibles:');
    console.log('   🔐 POST   /api/auth/login');
    console.log('   👤 GET    /api/auth/profile');
    console.log('   📁 GET    /api/archivos');
    console.log('   📄 GET    /api/documentos');
    console.log('   👥 GET    /api/usuarios');
    console.log('   📊 GET    /api/reportes');
    console.log('   🔍 GET    /api/buscar');
    console.log('   🏥 GET    /health');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

export default app;

