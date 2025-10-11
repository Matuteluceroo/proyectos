const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { db } = require('../config/database');

const BACKUP_DIR = path.join(__dirname, '../backups');
const DB_PATH = path.join(__dirname, '../saber_citricola.db');

// Asegurar que existe el directorio de backups
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// Crear backup
exports.createBackup = async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup_${timestamp}.zip`;
    const backupPath = path.join(BACKUP_DIR, backupFileName);

    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      res.json({
        success: true,
        message: 'Backup creado exitosamente',
        filename: backupFileName,
        size: archive.pointer()
      });
    });

    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(output);
    
    // Agregar base de datos al backup
    if (fs.existsSync(DB_PATH)) {
      archive.file(DB_PATH, { name: 'saber_citricola.db' });
    }
    
    // Agregar carpeta de uploads si existe
    const uploadsDir = path.join(__dirname, '../uploads');
    if (fs.existsSync(uploadsDir)) {
      archive.directory(uploadsDir, 'uploads');
    }

    await archive.finalize();
  } catch (error) {
    console.error('Error creando backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear el backup',
      error: error.message
    });
  }
};

// Obtener lista de backups
exports.getBackups = async (req, res) => {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      return res.json({ success: true, backups: [] });
    }

    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files
      .filter(file => file.endsWith('.zip'))
      .map(file => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime
        };
      })
      .sort((a, b) => b.created - a.created);

    res.json({ success: true, backups });
  } catch (error) {
    console.error('Error obteniendo backups:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la lista de backups',
      error: error.message
    });
  }
};

// Descargar backup
exports.downloadBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup no encontrado'
      });
    }

    res.download(backupPath, filename);
  } catch (error) {
    console.error('Error descargando backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error al descargar el backup',
      error: error.message
    });
  }
};

// Restaurar backup
exports.restoreBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup no encontrado'
      });
    }

    // TODO: Implementar restauración
    res.status(501).json({
      success: false,
      message: 'Funcionalidad de restauración en desarrollo'
    });
  } catch (error) {
    console.error('Error restaurando backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error al restaurar el backup',
      error: error.message
    });
  }
};

// Eliminar backup
exports.deleteBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    const backupPath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: 'Backup no encontrado'
      });
    }

    fs.unlinkSync(backupPath);
    res.json({
      success: true,
      message: 'Backup eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando backup:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar el backup',
      error: error.message
    });
  }
};

// Obtener configuración
exports.getBackupConfig = async (req, res) => {
  try {
    const config = db.prepare('SELECT * FROM backup_config WHERE id = 1').get();
    
    if (!config) {
      // Crear configuración por defecto
      const defaultConfig = {
        auto_backup_enabled: 0,
        backup_frequency: 'daily',
        backup_time: '02:00',
        max_backups: 7
      };
      
      db.prepare(`
        INSERT INTO backup_config (auto_backup_enabled, backup_frequency, backup_time, max_backups)
        VALUES (?, ?, ?, ?)
      `).run(
        defaultConfig.auto_backup_enabled,
        defaultConfig.backup_frequency,
        defaultConfig.backup_time,
        defaultConfig.max_backups
      );
      
      return res.json({ success: true, config: defaultConfig });
    }

    res.json({ success: true, config });
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la configuración',
      error: error.message
    });
  }
};

// Actualizar configuración
exports.updateBackupConfig = async (req, res) => {
  try {
    const { auto_backup_enabled, backup_frequency, backup_time, max_backups } = req.body;

    const existing = db.prepare('SELECT id FROM backup_config WHERE id = 1').get();
    
    if (existing) {
      db.prepare(`
        UPDATE backup_config 
        SET auto_backup_enabled = ?,
            backup_frequency = ?,
            backup_time = ?,
            max_backups = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = 1
      `).run(auto_backup_enabled, backup_frequency, backup_time, max_backups);
    } else {
      db.prepare(`
        INSERT INTO backup_config (auto_backup_enabled, backup_frequency, backup_time, max_backups)
        VALUES (?, ?, ?, ?)
      `).run(auto_backup_enabled, backup_frequency, backup_time, max_backups);
    }

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar la configuración',
      error: error.message
    });
  }
};
