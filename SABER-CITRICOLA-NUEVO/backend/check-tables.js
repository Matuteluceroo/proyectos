// check-tables.js - Script para verificar las tablas existentes
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Verificando tablas en la base de datos...');

const db = new sqlite3.Database('./saber_citricola.db', (err) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err.message);
    process.exit(1);
  }
  console.log('Conexion a la base de datos establecida');
});

// Verificar todas las tablas
const verificarTablas = () => {
  console.log('\nTABLAS EXISTENTES:');
  console.log('='.repeat(50));
  
  db.all("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name", (err, tables) => {
    if (err) {
      console.error('Error consultando tablas:', err.message);
      db.close();
      process.exit(1);
    }
    
    console.log(`\nTotal de tablas encontradas: ${tables.length}`);
    tables.forEach((table, index) => {
      const num = (index + 1).toString().padStart(2, ' ');
      console.log(`${num}. ${table.name}`);
    });
    
    // Verificar si existen las tablas de las nuevas funcionalidades
    console.log('\nVERIFICANDO NUEVAS FUNCIONALIDADES:');
    console.log('='.repeat(50));
    
    const tablasNecesarias = [
      // Comentarios
      'comentarios', 'reacciones_comentarios', 'reportes_comentarios',
      'notificaciones_comentarios', 'estadisticas_comentarios',
      'configuracion_comentarios', 'moderacion_comentarios',
      
      // Versiones
      'versiones_documentos', 'comparaciones_versiones', 'restauraciones_versiones',
      'estadisticas_versiones', 'configuracion_versiones', 'metadatos_versiones',
      
      // Notificaciones
      'notificaciones', 'suscripciones_push', 'plantillas_notificaciones',
      'estadisticas_notificaciones', 'cola_notificaciones', 'acciones_notificaciones'
    ];
    
    const tablasExistentes = tables.map(t => t.name);
    let comentarios = 0, versiones = 0, notificaciones = 0;
    
    tablasNecesarias.forEach(tabla => {
      const existe = tablasExistentes.includes(tabla);
      const estado = existe ? 'SI' : 'NO';
      console.log(`${estado.padEnd(3)} ${tabla}`);
      
      if (existe) {
        if (tabla.includes('comentario')) comentarios++;
        else if (tabla.includes('version')) versiones++;
        else if (tabla.includes('notificacion')) notificaciones++;
      }
    });
    
    console.log('\nRESUMEN DE FUNCIONALIDADES:');
    console.log('='.repeat(50));
    console.log(`Comentarios:     ${comentarios}/7 tablas (${comentarios === 7 ? 'COMPLETO' : 'INCOMPLETO'})`);
    console.log(`Versiones:       ${versiones}/6 tablas (${versiones === 6 ? 'COMPLETO' : 'INCOMPLETO'})`);
    console.log(`Notificaciones:  ${notificaciones}/6 tablas (${notificaciones === 6 ? 'COMPLETO' : 'INCOMPLETO'})`);
    
    const totalCompletas = (comentarios === 7 ? 1 : 0) + (versiones === 6 ? 1 : 0) + (notificaciones === 6 ? 1 : 0);
    console.log(`\nESTADO GENERAL: ${totalCompletas}/3 funcionalidades completas`);
    
    if (totalCompletas < 3) {
      console.log('\nACCION REQUERIDA:');
      console.log('='.repeat(50));
      console.log('Es necesario ejecutar las migraciones para crear las tablas faltantes.');
      console.log('Ejecuta: node run-all-migrations.js');
    } else {
      console.log('\nTODAS LAS FUNCIONALIDADES ESTAN LISTAS!');
      console.log('='.repeat(50));
      console.log('Todas las tablas necesarias estan creadas.');
    }
    
    db.close((err) => {
      if (err) {
        console.error('Error cerrando la base de datos:', err.message);
      } else {
        console.log('\nVerificacion completada');
      }
    });
  });
};

// Ejecutar verificación
verificarTablas();