import { corsMiddleware } from './middleware/cors.js'
import { validateToken } from './middleware/jwt.js'
import cookieParser from 'cookie-parser'
import express from 'express'
import http from 'http' // Cambiar a http
import dotenv from 'dotenv'
import { Server } from 'socket.io'; // Importar Socket.IO
import { connectToDatabase } from './connection_TEST.js' // Asegúrate de importar la función
import { licitacionesRouter } from './routes/licitaciones.js'
import { clientesRouter } from './routes/clientes.js'
import { renglonesRouter } from './routes/renglones.js'
import { tarotRouter } from './routes/prodsTarot.js'
import { comprasRouter } from './routes/compras.js'
import { loginRouter } from './routes/login.js'
import { generarDOCSRouter } from './routes/generar_docs.js'
import { usuariosRouter } from './routes/usuarios.js'
import { facturasRouter } from './routes/facturas.js'
import { KTCRouter } from './routes/kairos.js'
import { stockRouter } from './routes/stock.js'
import { realesRouter } from './routes/reales.js'
import { logisticaRouter } from './routes/logistica.js'
import { indicadoresRouter } from './routes/indicadores.js'
import { documentosRouter } from './routes/documentos.js'

dotenv.config()

const acepted_origins = [
  'http://localhost:5173',
  'https://ktc-react.vercel.app',
  'http://127.0.0.1:5000',
  'http://192.168.0.112:5173',
  'http://192.168.0.121:5173',
  'http://192.168.0.129:5173',
  'http://192.168.0.169:5173',
  'https://testmacro.ngrok.app',
  'http://192.168.0.163:5173',
  'http://192.168.0.174:5173',
  'https://f4be-2803-9800-9443-440d-404d-770d-e373-3298.ngrok-free.app'
]

const app = express()
app.use(cookieParser())
app.use(express.json({
  limit: '500mb',
  /*  verify: (req, res, buf, encoding) => {
     console.log(`Tamaño del body en bytes: ${buf.length}`)
   } */
}))
app.use(express.urlencoded({ limit: '500mb', extended: false }))
app.use(corsMiddleware(acepted_origins))

app.disable('x-powered-by')
app.use('/login', loginRouter)
app.use('/api/usuarios', usuariosRouter)
app.use('/api/licitaciones', licitacionesRouter)
app.use('/api/clientes', clientesRouter)
app.use('/api/renglones', renglonesRouter)
app.use('/api/prodstarot', tarotRouter)
app.use('/api/compras', comprasRouter)
app.use('/api/generar-documento', generarDOCSRouter)
app.use('/api/facturas', facturasRouter)
app.use('/api/kairos', KTCRouter)
app.use('/api/stock', stockRouter)
app.use('/api/reales', realesRouter)
app.use('/api/logistica', logisticaRouter)
app.use('/api/indicadores', indicadoresRouter)
app.use('/api/documentos', documentosRouter);

///////////////////////////////////////////////////
const connectedUsers = new Map(); // Almacena usuarios conectados

app.get('/api/connected-users', validateToken, (req, res) => {
  const users = Array.from(connectedUsers.values())
  return res.json(users)
})

//////////////////////////////////////////////////

const PORT = process.env.PORT ?? 1235

const startServer = async () => {
  const conn = await connectToDatabase() // Conectar a la base de datos
  if (conn !== 0) {
    // Crear servidor HTTP
    const server = http.createServer(app)

    // Integrar Socket.IO con el servidor HTTP

    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          // Verificar si el origen está en la lista aceptada
          if (!origin || acepted_origins.includes(origin)) {
            callback(null, true); // Permitir el origen
          } else {
            callback(new Error('No permitido por CORS')) // Bloquear el origen
          }
        },
        methods: ['GET', 'POST'], // Métodos permitidos
        allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'], // Headers permitidos
        credentials: true, // Permitir credenciales
      },
    })

    const actualizarUsuariosConectados = () => {
      const usuarios = Array.from(connectedUsers.values());
      //console.log('Usuarios conectados:', Array.from(connectedUsers.entries()))
      io.emit('usuariosActualizados', usuarios); // Emitir la lista actualizada a todos los clientes
    }

    io.on('connection', (socket) => {
      //console.log(`Usuario conectado: ${socket.id}`);

      socket.on('register', (userData) => {
        const userName = userData["usuario"]

        connectedUsers.set(userName, { socketId: socket.id, userData: userData });

        actualizarUsuariosConectados() // Emitir la lista actualizada
      })

      socket.on('enviarNotificacion', ({ receptorId, mensaje }) => {
        console.log('Usuarios conectados:', Array.from(connectedUsers.entries()))

        const receptorSocketId = connectedUsers.get(receptorId) // Obtiene el ID del socket del receptor
        if (receptorSocketId) {
          io.to(receptorSocketId.socketId).emit('nuevaNotificacion', mensaje) // Envía la notificación al receptor
          console.log(`Notificación enviada a ${receptorId}: ${JSON.stringify(mensaje)}`)
        } else {
          console.log(`El usuario ${receptorId} no está conectado.`)
        }
      })


      socket.on('disconnect', () => {
        // Eliminar al usuario desconectado
        for (const [userName, user] of connectedUsers.entries()) {
          if (user.socketId === socket.id) {
            connectedUsers.delete(userName)

            break
          }
        }

        actualizarUsuariosConectados()
      })
    })

    // Iniciar el servidor
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server listening on http://0.0.0.0:${PORT}`)
    })

  }
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err)
})


