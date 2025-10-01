// 📁 migrations/add_file_fields.js - Migración para campos de archivos
import sqlite3 from 'sqlite3';

// Crear conexión a la base de datos
const sql = new sqlite3.Database('./saber_citricola.db');

export const addFileFields = async () => {
  try {
    console.log('🔄 Ejecutando migración: Agregando campos de archivos...');

    // Verificar si las columnas ya existen
    const tableInfo = await new Promise((resolve, reject) => {
      sql.all("PRAGMA table_info(documentos)", (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    const existingColumns = tableInfo.map(col => col.name);
    
    // Lista de columnas a agregar
    const newColumns = [
      { name: 'archivo_nombre_original', type: 'TEXT', description: 'Nombre original del archivo' },
      { name: 'archivo_extension', type: 'TEXT', description: 'Extensión del archivo (.pdf, .jpg, etc)' },
      { name: 'archivo_size', type: 'INTEGER', description: 'Tamaño del archivo en bytes' },
      { name: 'archivo_tipo_mime', type: 'TEXT', description: 'Tipo MIME del archivo' },
      { name: 'archivo_ruta', type: 'TEXT', description: 'Ruta completa del archivo en el servidor' },
      { name: 'version', type: 'INTEGER DEFAULT 1', description: 'Versión del documento' },
      { name: 'version_anterior_id', type: 'INTEGER', description: 'ID de la versión anterior' },
      { name: 'metadatos', type: 'TEXT', description: 'JSON con metadatos adicionales' },
      { name: 'keywords', type: 'TEXT', description: 'Palabras clave para búsqueda' },
      { name: 'estado', type: 'TEXT CHECK(estado IN ("borrador", "revision", "publicado", "archivado")) DEFAULT "borrador"', description: 'Estado del documento' }
    ];

    // Agregar columnas que no existen
    for (const column of newColumns) {
      if (!existingColumns.includes(column.name)) {
        const alterQuery = `ALTER TABLE documentos ADD COLUMN ${column.name} ${column.type}`;
        
        await new Promise((resolve, reject) => {
          sql.run(alterQuery, (err) => {
            if (err) {
              console.error(`❌ Error agregando columna ${column.name}:`, err);
              reject(err);
            } else {
              console.log(`✅ Columna agregada: ${column.name} - ${column.description}`);
              resolve();
            }
          });
        });
      } else {
        console.log(`⚠️ Columna ${column.name} ya existe, saltando...`);
      }
    }

    // Crear índices para optimizar búsquedas
    const indices = [
      'CREATE INDEX IF NOT EXISTS idx_documentos_tipo_mime ON documentos(archivo_tipo_mime)',
      'CREATE INDEX IF NOT EXISTS idx_documentos_extension ON documentos(archivo_extension)',
      'CREATE INDEX IF NOT EXISTS idx_documentos_estado ON documentos(estado)',
      'CREATE INDEX IF NOT EXISTS idx_documentos_keywords ON documentos(keywords)',
      'CREATE INDEX IF NOT EXISTS idx_documentos_version ON documentos(version)'
    ];

    for (const indexQuery of indices) {
      await new Promise((resolve, reject) => {
        sql.run(indexQuery, (err) => {
          if (err) {
            console.error('❌ Error creando índice:', err);
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    console.log('✅ Migración completada: Campos de archivos agregados');
    return { success: true, message: 'Campos de archivos agregados correctamente' };

  } catch (error) {
    console.error('❌ Error en migración de archivos:', error);
    throw error;
  }
};

// Función para revertir la migración (si es necesario)
export const rollbackFileFields = async () => {
  console.log('⚠️ Rollback no implementado - SQLite no soporta DROP COLUMN');
  console.log('💡 Para revertir, recrea la base de datos desde cero');
};