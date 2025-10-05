// 🧪 Test de notificaciones - Diagnóstico rápido
import express from 'express';
import cors from 'cors';
import notificacionesRoutes from './routes/notificaciones.js';

const app = express();
const PORT = 5001; // Puerto diferente para no interferir

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rutas de notificaciones
app.use('/api/notificaciones', notificacionesRoutes);

// Ruta de prueba
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Servidor de test funcionando',
    timestamp: new Date().toISOString()
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🧪 Servidor de test de notificaciones corriendo en puerto ${PORT}`);
  console.log(`📋 Prueba: http://localhost:${PORT}/test`);
  console.log(`🔔 Notificaciones: http://localhost:${PORT}/api/notificaciones/mis-notificaciones`);
});

export default app;