import sql from 'mssql'
import dotenv from 'dotenv'
dotenv.config()

const config = {
  user: process.env.USER,
  password: process.env.PASSWORD,
  server: process.env.SERVER, // Cambia esto si es necesario
  database: process.env.DATABASE,
  options: {
    encrypt: true, // Cambia esto si no estás en Azure
    trustServerCertificate: true, // Solo en desarrollo
    driver: 'ODBC Driver 17 for SQL Server'
  },
  requestTimeout: 60000 // 🕒 30 segundos
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
