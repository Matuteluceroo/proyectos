// 🚀 Servidor Express - Versión Mínima
// Este es el "cerebro" de nuestro backend

// 📦 Importamos las librerías que necesitamos
import express from 'express';
import cors from 'cors';
import { 
  inicializarDB, 
  obtenerUsuarioConRol,
  obtenerTodosUsuarios,
  obtenerCategorias,
  obtenerDocumentos,
  obtenerMetricas
} from './database-citricola.js';

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

// 🎯 RUTAS - Aquí definimos qué responde el servidor

// 👋 Ruta de prueba - Para verificar que funciona
app.get('/', (req, res) => {
    res.json({ 
        mensaje: '¡Hola! El servidor está funcionando 🎉',
        proyecto: 'Saber Citrícola',
        version: '1.0.0'
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

// 👥 Ruta para obtener usuarios (solo administradores)
app.get('/api/usuarios', (req, res) => {
    obtenerTodosUsuarios((err, usuarios) => {
        if (err) {
            console.error('❌ Error al obtener usuarios:', err);
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            res.json({
                mensaje: 'Lista de usuarios',
                usuarios: usuarios
            });
        }
    });
});

// 🔐 Ruta para login con roles
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    
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
            res.status(500).json({ error: 'Error interno del servidor' });
        } else {
            res.json({
                mensaje: 'Lista de categorías',
                categorias: categorias
            });
        }
    });
});

// 📄 Ruta para obtener documentos
app.get('/api/documentos', (req, res) => {
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

// 🚀 Iniciamos el servidor
app.listen(PORT, () => {
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
    inicializarDB();
});

// 📝 NOTAS PARA ENTENDER:
// 
// 1. express() → Crea una nueva aplicación web
// 2. app.use() → Configura middleware (funciones que se ejecutan en cada petición)
// 3. app.get() → Define qué hacer cuando alguien hace una petición GET
// 4. req → La petición que llega (request)
// 5. res → La respuesta que enviamos (response)
// 6. app.listen() → Inicia el servidor en el puerto especificado