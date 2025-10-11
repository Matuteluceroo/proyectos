// 🔍 test-bcrypt.js - Verificar que bcrypt funciona correctamente
import bcrypt from 'bcrypt';

async function testBcrypt() {
    try {
        console.log('🧪 Probando bcrypt...');
        
        const password = '123456';
        console.log('🔐 Contraseña original:', password);
        
        // Hashear
        const hash = await bcrypt.hash(password, 10);
        console.log('🔒 Hash generado:', hash);
        
        // Comparar
        const isValid = await bcrypt.compare(password, hash);
        console.log('✅ Comparación exitosa:', isValid);
        
        // Comparar con contraseña incorrecta
        const isInvalid = await bcrypt.compare('wrong', hash);
        console.log('❌ Comparación fallida:', isInvalid);
        
    } catch (error) {
        console.error('💥 Error en bcrypt:', error);
    }
}

testBcrypt();