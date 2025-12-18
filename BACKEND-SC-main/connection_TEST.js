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
