// 🔧 Script para actualizar URLs de API en todos los servicios
import fs from 'fs';
import path from 'path';

const servicesDir = './src/services';
const configImport = "import { buildApiUrl } from '../config/app.config.js';";

// Patrones a reemplazar
const patterns = [
  {
    old: /const API_URL = ['"`]http:\/\/localhost:5000['"`];?/g,
    new: ''
  },
  {
    old: /const API_BASE_URL = ['"`]http:\/\/localhost:5000\/api['"`];?/g,
    new: ''
  },
  {
    old: /\$\{API_URL\}\/api\//g,
    new: 'buildApiUrl(\'/'
  },
  {
    old: /\$\{API_BASE_URL\}\//g,
    new: 'buildApiUrl(\'/'
  },
  {
    old: /fetch\(buildApiUrl\('\/([^']+)'\)/g,
    new: 'fetch(buildApiUrl(\'/$1\')'
  }
];

// Función para procesar archivo
function updateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Verificar si ya tiene el import
    if (!content.includes("import { buildApiUrl }")) {
      // Agregar import al inicio
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Buscar después de otros imports
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('//') || lines[i].trim() === '') {
          insertIndex = i + 1;
        } else if (lines[i].startsWith('import ')) {
          insertIndex = i + 1;
        } else {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, configImport);
      content = lines.join('\n');
      hasChanges = true;
    }
    
    // Aplicar patrones de reemplazo
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.old, pattern.new);
      if (newContent !== content) {
        content = newContent;
        hasChanges = true;
      }
    });
    
    // Escribir archivo si hay cambios
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Actualizado: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
  }
}

// Procesar todos los archivos JS en services
function processServices() {
  try {
    const files = fs.readdirSync(servicesDir);
    files.forEach(file => {
      if (file.endsWith('.js')) {
        const filePath = path.join(servicesDir, file);
        updateFile(filePath);
      }
    });
    console.log('🎉 Proceso completado');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

processServices();