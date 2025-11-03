/**
 * 🧪 TEST-USER-MODEL.JS - Tests para el modelo de usuarios
 * ==========================================================
 * Prueba todas las funciones del modelo User.js
 */

import { UserModel } from './models/User.js';
import db from './config/database.js';

// Colores para consola
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';

let testsPasados = 0;
let testsFallados = 0;

function assert(condicion, mensaje) {
  if (condicion) {
    console.log(`✅ ${GREEN}PASADO: ${mensaje}${RESET}`);
    testsPasados++;
  } else {
    console.error(`❌ ${RED}FALLIDO: ${mensaje}${RESET}`);
    testsFallados++;
  }
}

console.log(`
============================================================
🧪 ${CYAN}TESTS DEL MODELO USER${RESET}
============================================================
`);

async function runTests() {
  let usuarioCreado = null;
  
  // ============================================
  // TEST 1: Obtener todos los usuarios
  // ============================================
  console.log(`\n📋 ${YELLOW}Test 1: Obtener todos los usuarios${RESET}`);
  await new Promise((resolve) => {
    UserModel.obtenerTodosUsuarios((err, usuarios) => {
      assert(!err, 'Test 1.1 - No hay errores');
      assert(Array.isArray(usuarios), 'Test 1.2 - Retorna un array');
      assert(usuarios.length >= 3, `Test 1.3 - Tiene al menos 3 usuarios (actual: ${usuarios.length})`);
      assert(usuarios[0].hasOwnProperty('username'), 'Test 1.4 - Usuarios tienen campo username');
      assert(usuarios[0].hasOwnProperty('rol'), 'Test 1.5 - Usuarios tienen campo rol');
      resolve();
    });
  });
  
  // ============================================
  // TEST 2: Verificar usuario existente
  // ============================================
  console.log(`\n🔍 ${YELLOW}Test 2: Verificar usuario existente${RESET}`);
  await new Promise((resolve) => {
    UserModel.verificarUsuarioExiste('admin', 'admin@sabercitricola.com', (err, existe) => {
      assert(!err, 'Test 2.1 - No hay errores');
      assert(existe === true, 'Test 2.2 - Usuario "admin" existe');
      resolve();
    });
  });
  
  await new Promise((resolve) => {
    UserModel.verificarUsuarioExiste('noexiste123', 'noexiste@test.com', (err, existe) => {
      assert(!err, 'Test 2.3 - No hay errores');
      assert(existe === false, 'Test 2.4 - Usuario inexistente retorna false');
      resolve();
    });
  });
  
  // ============================================
  // TEST 3: Crear nuevo usuario
  // ============================================
  console.log(`\n➕ ${YELLOW}Test 3: Crear nuevo usuario${RESET}`);
  const nuevoUsuario = {
    username: `test_user_${Date.now()}`,
    email: `test_${Date.now()}@test.com`,
    password: 'password123',
    nombre_completo: 'Usuario de Test',
    rol: 'operador'
  };
  
  await new Promise((resolve) => {
    UserModel.crearUsuario(nuevoUsuario, (err, userId) => {
      assert(!err, 'Test 3.1 - No hay errores al crear');
      assert(typeof userId === 'number', 'Test 3.2 - Retorna ID numérico');
      assert(userId > 0, 'Test 3.3 - ID es mayor a 0');
      usuarioCreado = { id: userId, ...nuevoUsuario };
      resolve();
    });
  });
  
  // ============================================
  // TEST 4: Obtener usuario por ID
  // ============================================
  console.log(`\n🔍 ${YELLOW}Test 4: Obtener usuario por ID${RESET}`);
  await new Promise((resolve) => {
    UserModel.obtenerUsuarioPorId(usuarioCreado.id, (err, usuario) => {
      assert(!err, 'Test 4.1 - No hay errores');
      assert(usuario !== null, 'Test 4.2 - Usuario encontrado');
      assert(usuario.username === nuevoUsuario.username, 'Test 4.3 - Username correcto');
      assert(usuario.email === nuevoUsuario.email, 'Test 4.4 - Email correcto');
      assert(usuario.rol === 'operador', 'Test 4.5 - Rol correcto');
      resolve();
    });
  });
  
  // ============================================
  // TEST 5: Autenticación de usuario
  // ============================================
  console.log(`\n🔐 ${YELLOW}Test 5: Autenticación de usuario${RESET}`);
  
  // Login con credenciales correctas
  await new Promise((resolve) => {
    UserModel.obtenerUsuarioConRol(nuevoUsuario.username, nuevoUsuario.password, (err, usuario) => {
      assert(!err, 'Test 5.1 - No hay errores');
      assert(usuario !== null, 'Test 5.2 - Usuario autenticado');
      assert(usuario.username === nuevoUsuario.username, 'Test 5.3 - Username correcto');
      assert(!usuario.hasOwnProperty('password'), 'Test 5.4 - No retorna password');
      resolve();
    });
  });
  
  // Login con credenciales incorrectas
  await new Promise((resolve) => {
    UserModel.obtenerUsuarioConRol(nuevoUsuario.username, 'contraseña_incorrecta', (err, usuario) => {
      assert(!err, 'Test 5.5 - No hay errores');
      assert(usuario === null, 'Test 5.6 - Usuario no autenticado con password incorrecta');
      resolve();
    });
  });
  
  // ============================================
  // TEST 6: Actualizar usuario (sin cambiar password)
  // ============================================
  console.log(`\n✏️ ${YELLOW}Test 6: Actualizar usuario (sin password)${RESET}`);
  await new Promise((resolve) => {
    const datosActualizacion = {
      username: usuarioCreado.username,
      email: usuarioCreado.email,
      nombre_completo: 'Usuario Test Actualizado',
      rol: 'experto'
    };
    
    UserModel.actualizarUsuario(usuarioCreado.id, datosActualizacion, (err, resultado) => {
      assert(!err, 'Test 6.1 - No hay errores al actualizar');
      assert(resultado && resultado.changes > 0, 'Test 6.2 - Se actualizó al menos 1 registro');
      resolve();
    });
  });
  
  // Verificar que se actualizó
  await new Promise((resolve) => {
    UserModel.obtenerUsuarioPorId(usuarioCreado.id, (err, usuario) => {
      assert(!err, 'Test 6.3 - No hay errores');
      assert(usuario.nombre_completo === 'Usuario Test Actualizado', 'Test 6.4 - Nombre actualizado');
      assert(usuario.rol === 'experto', 'Test 6.5 - Rol actualizado');
      resolve();
    });
  });
  
  // ============================================
  // TEST 7: Actualizar usuario (con password)
  // ============================================
  console.log(`\n✏️ ${YELLOW}Test 7: Actualizar usuario (con password)${RESET}`);
  const nuevaPassword = 'nueva_password_456';
  await new Promise((resolve) => {
    const datosActualizacion = {
      username: usuarioCreado.username,
      email: usuarioCreado.email,
      password: nuevaPassword,
      nombre_completo: 'Usuario Test Actualizado',
      rol: 'experto'
    };
    
    UserModel.actualizarUsuario(usuarioCreado.id, datosActualizacion, (err, resultado) => {
      assert(!err, 'Test 7.1 - No hay errores al actualizar password');
      assert(resultado && resultado.changes > 0, 'Test 7.2 - Se actualizó al menos 1 registro');
      resolve();
    });
  });
  
  // Verificar que la nueva password funciona
  await new Promise((resolve) => {
    UserModel.obtenerUsuarioConRol(usuarioCreado.username, nuevaPassword, (err, usuario) => {
      assert(!err, 'Test 7.3 - No hay errores');
      assert(usuario !== null, 'Test 7.4 - Login funciona con nueva password');
      resolve();
    });
  });
  
  // Verificar que la password antigua ya no funciona
  await new Promise((resolve) => {
    UserModel.obtenerUsuarioConRol(usuarioCreado.username, nuevoUsuario.password, (err, usuario) => {
      assert(!err, 'Test 7.5 - No hay errores');
      assert(usuario === null, 'Test 7.6 - Password antigua ya no funciona');
      resolve();
    });
  });
  
  // ============================================
  // TEST 8: Eliminar usuario
  // ============================================
  console.log(`\n🗑️ ${YELLOW}Test 8: Eliminar usuario${RESET}`);
  await new Promise((resolve) => {
    UserModel.eliminarUsuario(usuarioCreado.id, (err, eliminado) => {
      assert(!err, 'Test 8.1 - No hay errores al eliminar');
      assert(eliminado === true, 'Test 8.2 - Usuario eliminado exitosamente');
      resolve();
    });
  });
  
  // Verificar que el usuario ya no existe
  await new Promise((resolve) => {
    UserModel.obtenerUsuarioPorId(usuarioCreado.id, (err, usuario) => {
      assert(!err, 'Test 8.3 - No hay errores');
      assert(usuario === null, 'Test 8.4 - Usuario ya no existe en la BD');
      resolve();
    });
  });
  
  // ============================================
  // RESULTADOS FINALES
  // ============================================
  console.log(`
============================================================
📊 ${CYAN}RESULTADOS FINALES${RESET}
============================================================
`);
  
  const totalTests = testsPasados + testsFallados;
  const porcentaje = ((testsPasados / totalTests) * 100).toFixed(1);
  
  console.log(`✅ Tests pasados: ${GREEN}${testsPasados}/${totalTests} (${porcentaje}%)${RESET}`);
  
  if (testsFallados > 0) {
    console.log(`❌ Tests fallidos: ${RED}${testsFallados}${RESET}`);
    console.log(`\n⚠️ ${YELLOW}Algunos tests fallaron. Revisa los errores arriba.${RESET}\n`);
    process.exit(1);
  } else {
    console.log(`\n🎉 ${GREEN}¡TODOS LOS TESTS PASARON! El modelo User.js funciona perfectamente.${RESET}`);
    console.log(`✅ ${GREEN}La refactorización fue exitosa.${RESET}\n`);
  }
  
  // Cerrar conexión a BD
  db.close((err) => {
    if (err) {
      console.error('Error al cerrar BD:', err);
    }
    process.exit(0);
  });
}

runTests().catch(err => {
  console.error('❌ Error fatal en tests:', err);
  process.exit(1);
});

