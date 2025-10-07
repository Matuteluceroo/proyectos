// 📁 middleware/upload.js - Configuración de multer para subida de archivos
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 📂 Crear directorios si no existen
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 📁 Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determinar carpeta según tipo de archivo
    let uploadPath = 'uploads/';
    
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'imagenes/';
    } else if (file.mimetype === 'application/pdf') {
      uploadPath += 'documentos/';
    } else if (file.mimetype.startsWith('video/')) {
      uploadPath += 'videos/';
    } else {
      uploadPath += 'otros/';
    }
    
    ensureDirectoryExists(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp-random-original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    const safeBaseName = baseName.replace(/[^a-zA-Z0-9-_]/g, '_');
    
    cb(null, `${uniqueSuffix}-${safeBaseName}${extension}`);
  }
});

// 🔍 Filtro de archivos permitidos
const fileFilter = (req, file, cb) => {
  // Tipos de archivo permitidos
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}`), false);
  }
};

// ⚙️ Configuración de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
    files: 10 // Máximo 10 archivos por request
  }
});

// 🚀 Middleware para diferentes tipos de upload
export const uploadSingle = upload.single('archivo'); // Un solo archivo
export const uploadMultiple = upload.array('archivos', 10); // Múltiples archivos
export const uploadFields = upload.fields([
  { name: 'documento', maxCount: 1 },
  { name: 'imagenes', maxCount: 5 },
  { name: 'videos', maxCount: 2 }
]);

// 🗑️ Función para eliminar archivo
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al eliminar archivo:', error);
    return false;
  }
};

// 📊 Función para obtener información del archivo
export const getFileInfo = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      return {
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        exists: true
      };
    }
    return { exists: false };
  } catch (error) {
    console.error('Error al obtener info del archivo:', error);
    return { exists: false, error: error.message };
  }
};

export default upload;