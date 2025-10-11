const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function execCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout };
  }
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('🔄 Sincronizando con develop...\n');

  // Verificar rama actual
  const branchResult = execCommand('git branch --show-current');
  if (!branchResult.success) {
    console.error('❌ Error: No estás en un repositorio git');
    process.exit(1);
  }

  const currentBranch = branchResult.output.trim();
  console.log(`📍 Rama actual: ${currentBranch}\n`);

  if (currentBranch === 'develop') {
    console.log('⚠️  Ya estás en la rama develop');
    const continuar = await question('¿Quieres actualizar develop? (s/n): ');
    if (continuar.toLowerCase() !== 's') {
      process.exit(0);
    }
  }

  // Verificar cambios pendientes
  const statusResult = execCommand('git status --porcelain');
  const hasChanges = statusResult.output.trim().length > 0;

  if (hasChanges) {
    console.log('📝 Tienes cambios sin commitear:\n');
    console.log(statusResult.output);
    
    const opcion = await question(
      '\n¿Qué quieres hacer?\n' +
      '1. Commitear cambios y hacer merge\n' +
      '2. Stash (guardar temporalmente) y hacer merge\n' +
      '3. Cancelar\n' +
      'Elige (1/2/3): '
    );

    if (opcion === '1') {
      const mensaje = await question('Mensaje del commit: ');
      console.log('\n💾 Commiteando cambios...');
      execCommand('git add .');
      execCommand(`git commit -m "${mensaje}"`);
    } else if (opcion === '2') {
      console.log('\n📦 Guardando cambios en stash...');
      execCommand('git stash save "WIP: cambios antes de sync con develop"');
    } else {
      console.log('❌ Operación cancelada');
      process.exit(0);
    }
  }

  // Fetch develop
  console.log('\n🔍 Obteniendo últimos cambios de develop...');
  const fetchResult = execCommand('git fetch origin develop');
  if (!fetchResult.success) {
    console.error('❌ Error al hacer fetch de develop');
    process.exit(1);
  }

  // Mergear develop
  console.log('\n🔀 Mergeando develop en tu rama...');
  const mergeResult = execCommand('git merge origin/develop');
  
  if (!mergeResult.success) {
    if (mergeResult.error.includes('CONFLICT')) {
      console.log('⚠️  Hay conflictos que necesitas resolver manualmente:');
      console.log('\n📋 Archivos en conflicto:');
      const conflictsResult = execCommand('git diff --name-only --diff-filter=U');
      console.log(conflictsResult.output);
      console.log('\nPasos para resolver:');
      console.log('1. Abre los archivos en conflicto');
      console.log('2. Busca las marcas <<<<<<, ======, >>>>>>');
      console.log('3. Resuelve los conflictos manualmente');
      console.log('4. Ejecuta: git add .');
      console.log('5. Ejecuta: git commit -m "merge: resolver conflictos con develop"');
      
      if (hasChanges && opcion === '2') {
        console.log('\n6. Recupera tus cambios: git stash pop');
      }
    } else {
      console.error('❌ Error al mergear:', mergeResult.error);
    }
    process.exit(1);
  }

  console.log('✅ Merge completado exitosamente!');

  // Recuperar stash si se usó
  if (hasChanges && opcion === '2') {
    console.log('\n📦 Recuperando cambios del stash...');
    const stashResult = execCommand('git stash pop');
    
    if (!stashResult.success && stashResult.error.includes('CONFLICT')) {
      console.log('⚠️  Hay conflictos al recuperar el stash');
      console.log('Resuelve los conflictos y luego ejecuta:');
      console.log('git add . && git commit -m "merge: resolver conflictos del stash"');
    } else {
      console.log('✅ Cambios recuperados exitosamente!');
    }
  }

  console.log('\n🎉 ¡Sincronización completada!');
  console.log(`\n📊 Estado actual:`);
  execCommand('git status');

  rl.close();
}

main().catch(console.error);
