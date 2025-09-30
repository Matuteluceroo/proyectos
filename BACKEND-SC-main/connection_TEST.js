import sql from 'mssql'
import dotenv from 'dotenv'
dotenv.config()

const config = {
  server: process.env.SERVER, // Cambia esto si es necesario
  database: process.env.DATABASE,
  options: {
    encrypt: false, // Cambia esto si estás en Azure
    trustServerCertificate: true, // Solo en desarrollo
    trustedConnection: true, // Usar autenticación Windows
    enableArithAbort: true
  },
  requestTimeout: 60000 // 🕒 60 segundos
}

export const connectToDatabase = async () => {
  try {
    sql.connect(config);
    console.log('Conexión a SQL Server',config.database);
  } catch (err) {
    console.error('Error en la conexión a SQL Server:', err);
    return 0
  }
}

export { sql } // Exporta sql para usarlo en tus rutas
