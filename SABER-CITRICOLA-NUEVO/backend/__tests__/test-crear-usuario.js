// 🔍 test-crear-usuario.js - Diagnóstico específico para creación de usuarios
import { crearUsuario } from './database-citricola.js';

console.log('🧪 Probando función crearUsuario directamente...');

const usuarioPrueba = {
    username: 'test_directo',
    email: 'test_directo@example.com',
    password: 'password123',
    nombre_completo: 'Usuario de Prueba Directo',
    rol: 'operador'
};

console.log('📤 Datos a crear:', usuarioPrueba);

crearUsuario(usuarioPrueba, (err, resultado) => {
    if (err) {
        console.error('❌ Error al crear usuario:', err);
        console.error('❌ Stack trace:', err.stack);
    } else {
        console.log('✅ Usuario creado exitosamente:', resultado);
    }
    
    console.log('🏁 Prueba completada');
    process.exit(0);
});