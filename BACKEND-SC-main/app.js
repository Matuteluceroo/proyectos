import { corsMiddleware } from "./middleware/cors.js";
import { validateToken } from "./middleware/jwt.js";
import cookieParser from "cookie-parser";
import express from "express";
import https from "https";         // ← HTTPS agregado
import fs from "fs";              // ← Para certificados
import dotenv from "dotenv";
import { Server } from "socket.io";
import { connectToDatabase } from "./connection_TEST.js";

import { loginRouter } from "./routes/login.js";
import { generarDOCSRouter } from "./routes/generar_docs.js";
import { usuariosRouter } from "./routes/usuarios.js";
import { indicadoresRouter } from "./routes/indicadores.js";
import { documentosRouter } from "./routes/documentos.js";
import { contenidosRouter } from "./routes/contenido.js";
import { kpiRouter } from "./routes/kpi.js";
import { tiposConocimientoRouter } from "./routes/tiposConocimiento.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { historialRouter } from "./routes/historial.js";
import { capacitacionesRouter } from "./routes/capacitaciones.js";

import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import mime from "mime-types";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RUTA_CONTENIDOS = process.env.RUTA_CONTENIDOS;

// Orígenes permitidos
const acepted_origins = [
  "http://localhost:5173",
  "https://9514609c1bc6.ngrok-free.app",
  "http://192.168.100.22:5173",
  "https://proyectos-etgj42q6b-matuteluceroos-projects.vercel.app/",
  "https://proyectos-etgj42q6b-matuteluceroos-projects.vercel.app",
  "https://proyectos-git-main-matuteluceroos-projects.vercel.app",
  "https://proyectos-git-main-matuteluceroos-projects.vercel.app/",
  "https://proyectos-black.vercel.app/",
  "https://proyectos-black.vercel.app",
  "https://937d87274a63.ngrok-free.app",
];

const app = express();
app.disable("x-powered-by");

app.use(cookieParser());
app.use(express.urlencoded({ limit: "500mb", extended: false }));
app.use(express.json({ limit: "500mb" }));

// CORS global
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || acepted_origins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("CORS no permitido"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "ngrok-skip-browser-warning",
    ],
    credentials: true,
  })
);
app.options("*", cors());

// Servir carpeta de contenidos estáticos
if (RUTA_CONTENIDOS && fs.existsSync(RUTA_CONTENIDOS)) {
  const rutaNormalizada = path.resolve(RUTA_CONTENIDOS).replace(/\\/g, "/");
  console.log("📂 Serviendo archivos estáticos desde:", rutaNormalizada);

  app.use(
    "/contenidos",
    cors({ origin: "*", methods: ["GET"] }),
    express.static(rutaNormalizada, {
      index: false,
      fallthrough: false,
      setHeaders: (res) => {
        res.set("Access-Control-Allow-Origin", "*");
        res.set("Cross-Origin-Resource-Policy", "cross-origin");
        res.set("Cross-Origin-Embedder-Policy", "cross-origin");
        res.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Range, ngrok-skip-browser-warning"
        );
        res.set(
          "Access-Control-Expose-Headers",
          "Content-Length, Content-Range"
        );
        res.set("ngrok-skip-browser-warning", "true");
      },
    })
  );
} else {
  console.error(
    "❌ RUTA_CONTENIDOS no existe o no es accesible:",
    RUTA_CONTENIDOS
  );
}

// Endpoint para ver contenidos con headers correctos
app.get("/ver-contenido/:tipo/:archivo", async (req, res) => {
  try {
    const { tipo, archivo } = req.params;
    const tipoFolder = tipo.toUpperCase() === "VIDEO" ? "VIDEO" : tipo;
    const basePath = process.env.RUTA_CONTENIDOS;
    const filePath = path.join(basePath, tipoFolder, archivo);

    console.log("🧩 Solicitando archivo:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error("❌ Archivo no encontrado:", filePath);
      return res.status(404).send("Archivo no encontrado");
    }

    const mimeType = mime.lookup(filePath) || "application/octet-stream";
    const stat = fs.statSync(filePath);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    res.setHeader("Cross-Origin-Embedder-Policy", "cross-origin");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Range, Content-Type, ngrok-skip-browser-warning"
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range"
    );

    // Videos → streaming
    if (mimeType.startsWith("video")) {
      const range = req.headers.range;
      if (!range) {
        res.setHeader("Content-Type", mimeType);
        res.setHeader("Content-Length", stat.size);
        const fileStream = fs.createReadStream(filePath);
        return fileStream.pipe(res);
      }

      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
      const chunkSize = end - start + 1;

      const fileStream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize,
        "Content-Type": mimeType,
      });
      return fileStream.pipe(res);
    }

    // PDFs
    if (mimeType === "application/pdf") {
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Length", stat.size);
      return fs.createReadStream(filePath).pipe(res);
    }

    // Imágenes u otros
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Length", stat.size);
    return fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error("⚠️ Error mostrando contenido:", error);
    res.status(500).send("Error al mostrar contenido");
  }
});

// Routers API
app.use("/login", loginRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/generar-documento", generarDOCSRouter);
app.use("/api/indicadores", indicadoresRouter);
app.use("/api/documentos", documentosRouter);
app.use("/api/contenidos", contenidosRouter);
app.use("/api/kpi", kpiRouter);
app.use("/api/tipos-conocimiento", tiposConocimientoRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/historial", historialRouter);
app.use("/api/capacitaciones", capacitacionesRouter);

// Usuarios conectados via WebSockets
const connectedUsers = new Map();

app.get("/api/connected-users", validateToken, (req, res) => {
  const users = Array.from(connectedUsers.values());
  return res.json(users);
});

// 🚀 SERVIDOR HTTPS
const PORT = process.env.PORT ?? 1234;

const startServer = async () => {
  const conn = await connectToDatabase();
  if (conn !== 0) {

    // Cargar certificados SSL
    const key = fs.readFileSync("./key.pem");
    const cert = fs.readFileSync("./cert.pem");

    // Crear servidor HTTPS
    const server = https.createServer({ key, cert }, app);

    // Websockets en HTTPS
    const io = new Server(server, {
      cors: {
        origin: (origin, callback) => {
          if (!origin || acepted_origins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("No permitido por CORS"));
          }
        },
        methods: ["GET", "POST"],
        allowedHeaders: [
          "Content-Type",
          "Authorization",
          "ngrok-skip-browser-warning",
        ],
        credentials: true,
      },
    });

    const actualizarUsuariosConectados = () => {
      io.emit("usuariosActualizados", Array.from(connectedUsers.values()));
    };

    io.on("connection", (socket) => {
      socket.on("register", (userData) => {
        const userName = userData["usuario"];
        connectedUsers.set(userName, { socketId: socket.id, userData });
        actualizarUsuariosConectados();
      });

      socket.on("enviarNotificacion", ({ receptorId, mensaje }) => {
        const receptorSocket = connectedUsers.get(receptorId);
        if (receptorSocket) {
          io.to(receptorSocket.socketId).emit("nuevaNotificacion", mensaje);
        }
      });

      socket.on("disconnect", () => {
        for (const [userName, user] of connectedUsers.entries()) {
          if (user.socketId === socket.id) {
            connectedUsers.delete(userName);
            break;
          }
        }
        actualizarUsuariosConectados();
      });
    });

    // Iniciar HTTPS
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🔐 HTTPS Server running at https://localhost:${PORT}`);
    });
  }
};

startServer().catch((err) => {
  console.error("Error al iniciar el servidor:", err);
});
