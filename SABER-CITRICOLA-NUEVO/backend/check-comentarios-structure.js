// check-comentarios-structure.js - Verificar estructura de tabla comentarios existente
import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./saber_citricola.db', (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('Conexion establecida');
});

// Verificar si la tabla comentarios existe y su estructura
db.all("PRAGMA table_info(comentarios)", (err, columns) => {
  if (err) {
    console.error('Error consultando estructura:', err.message);
  } else if (columns.length === 0) {
    console.log('La tabla comentarios NO existe');
  } else {
    console.log('\nEstructura actual de la tabla comentarios:');
    console.log('='.repeat(50));
    columns.forEach(col => {
      console.log(`${col.name.padEnd(20)} ${col.type.padEnd(15)} ${col.notnull ? 'NOT NULL' : ''} ${col.dflt_value ? `DEFAULT ${col.dflt_value}` : ''}`);
    });
  }
  
  // También verificar datos existentes
  db.all("SELECT COUNT(*) as total FROM comentarios", (err, result) => {
    if (err) {
      console.error('Error contando registros:', err.message);
    } else {
      console.log(`\nRegistros existentes: ${result[0].total}`);
    }
    
    if (result[0].total > 0) {
      // Mostrar algunos registros de ejemplo
      db.all("SELECT * FROM comentarios LIMIT 3", (err, rows) => {
        if (err) {
          console.error('Error consultando datos:', err.message);
        } else {
          console.log('\nPrimeros 3 registros:');
          console.log('='.repeat(50));
          rows.forEach((row, index) => {
            console.log(`Registro ${index + 1}:`, JSON.stringify(row, null, 2));
          });
        }
        
        db.close();
      });
    } else {
      db.close();
    }
  });
});