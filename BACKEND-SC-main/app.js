import { corsMiddleware } from './middleware/cors.js';
import { validateToken } from './middleware/jwt.js';
import cookieParser from 'cookie-parser';
import express, { json } from 'express';
import http from 'http'; // Cambiar a http
import dotenv from 'dotenv';
import { Server } from 'socket.io'; // Importar Socket.IO
import { connectToDatabase } from './connection_TEST.js'; // Asegúrate de importar la función
import { loginRouter } from './routes/login.js';
import { generarDOCSRouter } from './routes/generar_docs.js';
import { usuariosRouter } from './routes/usuarios.js';
import { indicadoresRouter } from './routes/indicadores.js';
import { documentosRouter } from './routes/documentos.js';
import { contenidosRouter } from './routes/contenido.js';
import { kpiRouter } from './routes/kpi.js'
const basePath = process.env.RUTA_CONTENIDOS || "uploads";
dotenv.config();

const acepted_origins = [
  'http://localhost:5173',
  'https://9514609c1bc6.ngrok-free.app',
]

const app = express()
app.use(cookieParser())
app.use(express.json({
  limit: '500mb',
}));
app.use(express.urlencoded({ limit: '500mb', extended: false }))
app.use(corsMiddleware(acepted_origins))

app.disable('x-powered-by')
app.use('/login', loginRouter)
app.use('/api/usuarios', usuariosRouter)
app.use('/api/generar-documento', generarDOCSRouter)
app.use('/api/indicadores', indicadoresRouter)
app.use('/api/documentos', documentosRouter);
app.use('/api/contenidos', contenidosRouter);
app.use('/api/kpi', kpiRouter)
///////////////////////////////////////////////////
const connectedUsers = new Map(); // Almacena usuarios conectados

app.get('/api/connected-users', validateToken, (req, res) => {
  const users = Array.from(connectedUsers.values())
  return res.json(users)
})

//////////////////////////////////////////////////

const PORT = process.env.PORT ?? 1234

const startServer = async () => {
  const conn = await connectToDatabase(); // Conectar a la base de datos
  if (conn !== 0) {
    // Crear servidor HTTP
    const server = http.createServer(app);

    // Integrar Socket.IO con el servidor HTTP

    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          // Verificar si el origen está en la lista aceptada
          if (!origin || acepted_origins.includes(origin)) {
            callback(null, true); // Permitir el origen
          } else {
            callback(new Error('No permitido por CORS')); // Bloquear el origen
          }
        },
        methods: ['GET', 'POST'], // Métodos permitidos
        allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'], // Headers permitidos
        credentials: true, // Permitir credenciales
      },
    });

    const actualizarUsuariosConectados = () => {
      const usuarios = Array.from(connectedUsers.values());
      //console.log('Usuarios conectados:', Array.from(connectedUsers.entries()))
      io.emit('usuariosActualizados', usuarios); // Emitir la lista actualizada a todos los clientes
    }

    io.on('connection', (socket) => {
      //console.log(`Usuario conectado: ${socket.id}`);

      socket.on('register', (userData) => {
        const userName = userData["usuario"];

        // Registrar al usuario
        connectedUsers.set(userName, { socketId: socket.id, userData: userData });

        //console.log(`Usuario registrado: ${userName} --  ${socket.id}`);

        actualizarUsuariosConectados(); // Emitir la lista actualizada
      });

      socket.on('enviarNotificacion', ({ receptorId, mensaje }) => {
        //console.log('Intentando enviar notificación a:', receptorId);
        console.log('Usuarios conectados:', Array.from(connectedUsers.entries()));

        const receptorSocketId = connectedUsers.get(receptorId); // Obtiene el ID del socket del receptor
        if (receptorSocketId) {
          io.to(receptorSocketId.socketId).emit('nuevaNotificacion', mensaje); // Envía la notificación al receptor
          console.log(`Notificación enviada a ${receptorId}: ${JSON.stringify(mensaje)}`);
        } else {
          console.log(`El usuario ${receptorId} no está conectado.`);
        }
      });


      socket.on('disconnect', () => {
        //console.log(`Usuario desconectado: ${socket.id}`);

        // Eliminar al usuario desconectado
        for (const [userName, user] of connectedUsers.entries()) {
          if (user.socketId === socket.id) {
            connectedUsers.delete(userName);
            //console.log(`Usuario eliminado: ${userName}`);
            break;
          }
        }

        actualizarUsuariosConectados(); // Emitir la lista actualizada
      });
    });

    // Iniciar el servidor
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`);
    })

  }
};

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
});
