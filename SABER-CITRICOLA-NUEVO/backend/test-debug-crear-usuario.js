// 🔍 test-debug-crear-usuario.js - Debug completo para creación de usuarios
import { 
    verificarUsuarioExiste,
    crearUsuario 
} from './database-citricola.js';

console.log('🧪 Iniciando debug completo de creación de usuario...');

const usuarioPrueba = {
    username: 'debug_user',
    email: 'debug@example.com',
    password: 'password123',
    nombre_completo: 'Usuario Debug',
    rol: 'operador'
};

console.log('📤 Datos del usuario:', usuarioPrueba);

// Paso 1: Verificar si el usuario existe
console.log('\n🔍 PASO 1: Verificando si el usuario existe...');
verificarUsuarioExiste(usuarioPrueba.username, usuarioPrueba.email, (err, existe) => {
    if (err) {
        console.error('❌ Error en verificarUsuarioExiste:', err);
        process.exit(1);
    }
    
    console.log('✅ Verificación completada. Usuario existe:', existe);
    
    if (existe) {
        console.log('⚠️ Usuario ya existe, intentando crear uno con datos únicos...');
        usuarioPrueba.username = `debug_user_${Date.now()}`;
        usuarioPrueba.email = `debug_${Date.now()}@example.com`;
        console.log('📤 Nuevos datos únicos:', usuarioPrueba);
    }
    
    // Paso 2: Crear el usuario
    console.log('\n🔧 PASO 2: Creando usuario...');
    crearUsuario(usuarioPrueba, (createErr, resultado) => {
        if (createErr) {
            console.error('❌ Error en crearUsuario:', createErr);
            console.error('❌ Stack trace completo:', createErr.stack);
            console.error('❌ Tipo de error:', typeof createErr);
            console.error('❌ Error code:', createErr.code);
            console.error('❌ Error errno:', createErr.errno);
            console.error('❌ Error message:', createErr.message);
        } else {
            console.log('✅ Usuario creado exitosamente!');
            console.log('📊 ID del usuario creado:', resultado);
        }
        
        console.log('\n🏁 Debug completado');
        process.exit(0);
    });
});