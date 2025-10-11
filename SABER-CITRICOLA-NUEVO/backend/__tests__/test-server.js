// 🔍 test-server.js - Verificar si el servidor está funcionando
import http from 'http';

function testServer() {
    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/',
        method: 'GET'
    };

    console.log('🔄 Probando servidor en http://localhost:5000/');
    
    const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            console.log(`📊 Status: ${res.statusCode}`);
            console.log(`📥 Respuesta:`, data);
            
            if (res.statusCode === 200) {
                console.log('✅ Servidor funcionando correctamente');
            } else {
                console.log('❌ Problema en el servidor');
            }
        });
    });

    req.on('error', (error) => {
        console.error('💥 Error de conexión:', error.message);
        console.log('❌ El servidor no está corriendo o no es accesible');
    });

    req.end();
}

testServer();