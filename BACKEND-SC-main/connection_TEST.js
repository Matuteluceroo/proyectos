import sql from 'mssql'
import dotenv from 'dotenv'
dotenv.config()

// 🔧 Configuración dinámica: Windows Auth o SQL Auth
const config = {
  server: process.env.SERVER || 'localhost',
  database: process.env.DATABASE,
  port: 1433, // ✅ Puerto por defecto de SQL Server
  options: {
    encrypt: true, // Cambia esto si no estás en Azure
    trustServerCertificate: true, // Solo en desarrollo
    enableArithAbort: true
  },
  requestTimeout: 60000, // 🕒 60 segundos
  connectionTimeout: 30000 // ⏱️ 30 segundos para conectar
}

// ✅ Si USER y PASSWORD están vacíos, usa Windows Authentication
if (process.env.USER && process.env.PASSWORD) {
  config.user = process.env.USER
  config.password = process.env.PASSWORD
  console.log('🔐 Usando SQL Server Authentication')
} else {
  config.options.trustedConnection = true
  console.log('🔐 Usando Windows Authentication')
}

export const connectToDatabase = async () => {
  try {
    await sql.connect(config);
    console.log('✅ Conexión a SQL Server exitosa:', config.database);
    return 1; // Retorna 1 si la conexión es exitosa
  } catch (err) {
    console.error('❌ Error en la conexión a SQL Server:', err);
    console.error('Verifica tu archivo .env con las credenciales de la BD');
    return 0
  }
}

export { sql } // Exporta sql para usarlo en tus rutas
