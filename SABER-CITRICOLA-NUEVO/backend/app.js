// 🚀 Servidor Express - Versión Mínima
// Este es el "cerebro" de nuestro backend

// 📦 Importamos las librerías que necesitamos
import express from 'express';
import cors from 'cors';
import path from 'path';
import { 
  inicializarDB, 
  obtenerUsuarioConRol,
  obtenerTodosUsuarios,
  obtenerCategorias,
  obtenerDocumentos,
  obtenerMetricas,
  buscarContenido
} from './database-citricola.js';
import archivosRoutes from './routes/archivos.js';
import documentosRoutes from './routes/documentos.js';
import usuariosRoutes from './routes/usuarios.js';
import reportesRoutes from './routes/reportes.js';
import gestionContenidoRoutes from './routes/gestionContenido.js';
import configuracionRoutes from './routes/configuracion.js';
import guiasRapidasRoutes from './routes/guiasRapidas.js';
import procedimientosRoutes from './routes/procedimientos.js';
import comentariosRoutes from './routes/comentarios.js';
import notificacionesRoutes from './routes/notificaciones.js';

// 🏗️ Creamos la aplicación Express
const app = express();

// ⚙️ Configuración básica
const PORT = 5000; // Puerto donde va a "escuchar" nuestro servidor

// 🌐 Configuramos CORS para que frontend pueda conectarse
app.use(cors({
    origin: [
        'http://localhost:3000',    // React en puerto 3000
        'http://localhost:5173',    // Vite en puerto 5173
        'null'                      // Archivos locales HTML
    ],
    credentials: true // Permitimos cookies
}));

// 📝 Configuramos Express para entender JSON
app.use(express.json());

// 📁 Servir archivos estáticos (uploads) con headers apropiados
app.use('/uploads', (req, res, next) => {
  // Configurar headers para permitir descarga
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  next();
}, express.static(path.join(process.cwd(), 'uploads')));

// 🎯 RUTAS - Aquí definimos qué responde el servidor

// 📁 Rutas de archivos
app.use('/api/archivos', archivosRoutes);

// 📄 Rutas de documentos CRUD
app.use('/api/documentos', documentosRoutes);

// 👥 Rutas de usuarios CRUD (solo admin)
app.use('/api/usuarios', usuariosRoutes);

// 📊 Rutas de reportes y estadísticas (solo admin)
app.use('/api/reportes', reportesRoutes);

// 📚 Rutas de gestión de contenido (categorías y documentos)
app.use('/api/contenido', gestionContenidoRoutes);

// ⚙️ Rutas de configuración del sistema (solo admin)
app.use('/api/configuracion', configuracionRoutes);

// ⚡ Rutas de guías rápidas (operadores)
app.use('/api/guias-rapidas', guiasRapidasRoutes);

// 📋 Rutas de procedimientos paso a paso (operadores)
app.use('/api/procedimientos', procedimientosRoutes);

// 💬 Rutas de comentarios en documentos
app.use('/api/comentarios', comentariosRoutes);

//  Rutas de notificaciones push e internas
app.use('/api/notificaciones', notificacionesRoutes);

// 👋 Ruta de prueba - Para verificar que funciona
app.get('/', (req, res) => {
    res.json({ 
        mensaje: '¡Hola! El servidor está funcionando 🎉',
        proyecto: 'Saber Citrícola',
        version: '1.0.0',
        rutas_test: {
            uploads: '/uploads',
            prueba_descarga: '/uploads/documento_prueba.txt'
        }
    });
});

// 📄 Ruta para obtener información del API
app.get('/api/info', (req, res) => {
    res.json({
        mensaje: 'API de Saber Citrícola',
        sistema: 'Gestión del Conocimiento Citrícola',
        version: '2.0.0',
        endpoints_disponibles: [
            'GET / - Información básica',
            'GET /api/info - Información del API',
            'POST /api/login - Login con roles (admin/experto/operador)',
            'GET /api/usuarios - Lista de usuarios (solo admin)',
            'GET /api/categorias - Categorías de conocimiento',
            'GET /api/documentos - Documentos y contenido',
            'GET /api/metricas - Indicadores del sistema'
        ]
    });
});

// 🔐 Ruta para login con roles
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
    console.log('🔐 Intento de login:', { username, password });
    
    if (!username || !password) {
        return res.status(400).json({ 
            error: 'Username y password son requeridos' 
        });
    }
    
    obtenerUsuarioConRol(username, password, (err, usuario) => {
        if (err) {
            console.error('❌ Error al verificar login:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else if (usuario) {
            console.log('✅ Usuario encontrado:', usuario);
            res.json({
                mensaje: 'Login exitoso',
                usuario: {
                    id: usuario.id,
                    username: usuario.username,
                    email: usuario.email,
                    nombre_completo: usuario.nombre_completo,
                    rol: usuario.rol
                }
            });
        } else {
            console.log('❌ Usuario no encontrado con credenciales:', { username, password });
            res.status(401).json({ 
                error: 'Credenciales incorrectas' 
            });
        }
    });
});

// 📚 Ruta para obtener categorías
app.get('/api/categorias', (req, res) => {
    obtenerCategorias((err, categorias) => {
        if (err) {
            console.error('❌ Error al obtener categorías:', err);
            res.status(500).json({ 
                success: false,
                error: 'Error interno del servidor' 
            });
        } else {
            res.json({
                success: true,
                mensaje: 'Lista de categorías',
                data: categorias
            });
        }
    });
});

// 📄 Ruta para obtener documentos (legacy - será reemplazada por CRUD)
app.get('/api/documentos-legacy', (req, res) => {
    const { categoria, rol = 'operador' } = req.query;
    
    obtenerDocumentos(categoria, rol, (err, documentos) => {
        if (err) {
            console.error('❌ Error al obtener documentos:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            res.json({
                mensaje: 'Lista de documentos',
                documentos: documentos
            });
        }
    });
});

// 📊 Ruta para obtener métricas
app.get('/api/metricas', (req, res) => {
    obtenerMetricas((err, metricas) => {
        if (err) {
            console.error('❌ Error al obtener métricas:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            res.json({
                mensaje: 'Métricas del sistema',
                metricas: metricas
            });
        }
    });
});

// 🔍 Ruta para búsqueda inteligente
app.get('/api/buscar', (req, res) => {
    const { q, tipo = 'todos', categoria, fechaDesde, fechaHasta } = req.query;
    
    if (!q || q.trim().length < 2) {
        return res.status(400).json({ 
            error: 'La consulta debe tener al menos 2 caracteres' 
        });
    }
    
    buscarContenido(q.trim(), { tipo, categoria, fechaDesde, fechaHasta }, (err, resultados) => {
        if (err) {
            console.error('❌ Error en búsqueda:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            res.json({
                mensaje: 'Resultados de búsqueda',
                query: q.trim(),
                total: resultados.length,
                resultados: resultados
            });
        }
    });
});

// 🚀 Iniciamos el servidor
app.listen(PORT, async () => {
    console.log(`
🍊 ===================================
🚀 Servidor Saber Citrícola iniciado
📍 URL: http://localhost:${PORT}
🌐 CORS permitido desde: http://localhost:3000
⏰ Hora: ${new Date().toLocaleString()}
🍊 ===================================
    `);
    
    // 🗄️ Inicializamos la base de datos
    console.log('🗄️ Inicializando base de datos...');
    await inicializarDB();
    
    console.log('✅ Backend iniciado correctamente');
});

// 📝 NOTAS PARA ENTENDER:
// 
// 1. express() → Crea una nueva aplicación web
// 2. app.use() → Configura middleware (funciones que se ejecutan en cada petición)
// 3. app.get() → Define qué hacer cuando alguien hace una petición GET
// 4. req → La petición que llega (request)
// 5. res → La respuesta que enviamos (response)
// 6. app.listen() → Inicia el servidor en el puerto especificado