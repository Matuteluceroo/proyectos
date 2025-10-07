// 🔍 test-auth-function.js - Probar la función de autenticación directamente
import { obtenerUsuarioConRol } from './database-citricola.js';

console.log('🧪 Probando función obtenerUsuarioConRol...');

// Probar con credenciales correctas
obtenerUsuarioConRol('admin', '123456', (err, usuario) => {
    console.log('\n🔄 Resultado para admin/123456:');
    if (err) {
        console.error('❌ Error:', err);
    } else if (usuario) {
        console.log('✅ Usuario encontrado:', usuario);
    } else {
        console.log('❌ Usuario no encontrado');
    }
    
    // Probar con credenciales incorrectas
    obtenerUsuarioConRol('admin', 'wrong_password', (err2, usuario2) => {
        console.log('\n🔄 Resultado para admin/wrong_password:');
        if (err2) {
            console.error('❌ Error:', err2);
        } else if (usuario2) {
            console.log('⚠️  Usuario encontrado (esto NO debería pasar):', usuario2);
        } else {
            console.log('✅ Usuario correctamente rechazado');
        }
        
        console.log('\n🏁 Pruebas completadas');
        process.exit(0);
    });
});