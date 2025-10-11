const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Archivos que NO deberían estar en la raíz
const unnecessaryRootFiles = [
  'backend.log',
  'frontend.log',
  'test-saber-citricola.html',
  'saber_citricola.db',
  '.env'
];

// Archivos de test que deberían estar en backend/__tests__
const testFiles = [
  'backend/test-auth-function.js',
  'backend/test-bcrypt.js',
  'backend/test-crear-usuario.js',
  'backend/test-database.js',
  'backend/test-debug-crear-usuario.js',
  'backend/test-http-crear-usuario.js',
  'backend/test-login.js',
  'backend/test-server.js',
  'backend/test-usuarios-api.js'
];

// Estructura esperada
const expectedFolders = [
  'docs',
  'scripts',
  'backend',
  'frontend',
  'backend/__tests__',
  'backend/backups',
  'backend/uploads'
];

// Archivos que deberían estar en docs/
const docFiles = [
  'ARRANQUE-OPCIONES.md',
  'CORS-USUARIOS-SOLUCIONADO.md',
  'DEPLOY-GUIDE.md',
  'GUIA-ARRANQUE-AUTOMATICO.md',
  'SEGURIDAD-IMPLEMENTADA.md'
];

// Scripts que deberían estar en scripts/
const scriptFiles = [
  'iniciar-saber-citricola.js',
  'iniciar-saber-citricola.bat',
  'iniciar-saber-citricola.sh',
  'inicio-rapido.bat'
];

console.log('🔍 Verificando estructura del proyecto...\n');

let hasIssues = false;

// Verificar archivos innecesarios en la raíz
console.log('📁 Verificando archivos en la raíz...');
unnecessaryRootFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ⚠️  Archivo innecesario encontrado: ${file}`);
    hasIssues = true;
  }
});

// Verificar archivos de test en backend raíz
console.log('\n🧪 Verificando archivos de test...');
testFiles.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ⚠️  Test file en ubicación incorrecta: ${file}`);
    console.log(`     Debería estar en: backend/__tests__/`);
    hasIssues = true;
  }
});

// Verificar carpetas esperadas
console.log('\n📂 Verificando estructura de carpetas...');
expectedFolders.forEach(folder => {
  const folderPath = path.join(rootDir, folder);
  if (!fs.existsSync(folderPath)) {
    console.log(`  ⚠️  Carpeta faltante: ${folder}`);
    hasIssues = true;
  } else {
    console.log(`  ✅ ${folder}`);
  }
});

// Verificar archivos de documentación
console.log('\n📄 Verificando documentación...');
docFiles.forEach(file => {
  const rootPath = path.join(rootDir, file);
  const docsPath = path.join(rootDir, 'docs', file);
  
  if (fs.existsSync(rootPath)) {
    console.log(`  ⚠️  Archivo de doc en raíz: ${file} (debería estar en docs/)`);
    hasIssues = true;
  } else if (fs.existsSync(docsPath)) {
    console.log(`  ✅ docs/${file}`);
  } else {
    console.log(`  ℹ️  Archivo no encontrado: ${file}`);
  }
});

// Verificar scripts de inicio
console.log('\n⚙️  Verificando scripts de inicio...');
scriptFiles.forEach(file => {
  const rootPath = path.join(rootDir, file);
  const scriptsPath = path.join(rootDir, 'scripts', file);
  
  if (fs.existsSync(rootPath)) {
    console.log(`  ⚠️  Script en raíz: ${file} (debería estar en scripts/)`);
    hasIssues = true;
  } else if (fs.existsSync(scriptsPath)) {
    console.log(`  ✅ scripts/${file}`);
  } else {
    console.log(`  ℹ️  Script no encontrado: ${file}`);
  }
});

// Verificar .gitignore
console.log('\n🚫 Verificando .gitignore...');
const gitignorePath = path.join(rootDir, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  console.log('  ✅ .gitignore existe');
  
  const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
  const requiredPatterns = [
    'node_modules',
    '*.log',
    '*.db',
    '.env',
    'backups',
    'uploads'
  ];
  
  requiredPatterns.forEach(pattern => {
    if (gitignoreContent.includes(pattern)) {
      console.log(`  ✅ Patrón incluido: ${pattern}`);
    } else {
      console.log(`  ⚠️  Patrón faltante: ${pattern}`);
      hasIssues = true;
    }
  });
} else {
  console.log('  ⚠️  .gitignore no existe');
  hasIssues = true;
}

// Resumen
console.log('\n' + '='.repeat(50));
if (hasIssues) {
  console.log('❌ Se encontraron problemas en la estructura del proyecto');
  console.log('\nPara corregir, ejecuta:');
  console.log('  npm run setup:folders');
  console.log('  npm run clean:logs');
  console.log('  npm run clean:db');
  console.log('\nY mueve los archivos manualmente según las advertencias.');
  process.exit(1);
} else {
  console.log('✅ La estructura del proyecto está correcta');
  process.exit(0);
}
