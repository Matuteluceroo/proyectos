import cors from 'cors';

export const corsMiddleware = (acepted_origins) =>
  cors({
    origin: (origin, callback) => {
      // Lista de orígenes permitidos
      const ACCEPTED_ORIGINS = acepted_origins
      
      if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
        return callback(null, true);
      }
      console.log("ORIGEN: ", origin)
      return callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'], // Métodos permitidos
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning', 'Cookie'],    // Encabezados permitidos
    optionsSuccessStatus: 204,
    credentials: true, // Permitir cookies y credenciales
  });
