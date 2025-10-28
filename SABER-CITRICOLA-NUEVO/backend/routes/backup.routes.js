const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middleware/auth.middleware');
const backupController = require('../controllers/backup.controller');

// Crear backup manual
router.post('/create', auth, isAdmin, backupController.createBackup);

// Obtener lista de backups
router.get('/list', auth, isAdmin, backupController.getBackups);

// Restaurar backup
router.post('/restore/:filename', auth, isAdmin, backupController.restoreBackup);

// Descargar backup
router.get('/download/:filename', auth, isAdmin, backupController.downloadBackup);

// Eliminar backup
router.delete('/:filename', auth, isAdmin, backupController.deleteBackup);

// Obtener configuración de backups automáticos
router.get('/config', auth, isAdmin, backupController.getBackupConfig);

// Actualizar configuración de backups automáticos
router.put('/config', auth, isAdmin, backupController.updateBackupConfig);

module.exports = router;
