// 🧪 test-login.js - Script para probar el login después de la migración
import http from 'http';

const API_URL = 'localhost';
const PORT = 5000;

function testLogin(username, password) {
    return new Promise((resolve) => {
        const postData = JSON.stringify({ username, password });
        
        const options = {
            hostname: API_URL,
            port: PORT,
            path: '/api/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log(`🔄 Probando login: ${username} / ${password}`);
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const responseData = JSON.parse(data);
                    console.log(`📊 Status: ${res.statusCode}`);
                    console.log(`📥 Respuesta:`, responseData);
                    
                    if (res.statusCode === 200) {
                        console.log('✅ Login exitoso');
                    } else {
                        console.log('❌ Login fallido');
                    }
                    
                    resolve({ status: res.statusCode, data: responseData });
                } catch (error) {
                    console.error('💥 Error parsing JSON:', error.message);
                    resolve({ error: 'Invalid JSON response' });
                }
            });
        });

        req.on('error', (error) => {
            console.error('💥 Error de conexión:', error.message);
            resolve({ error: error.message });
        });

        req.write(postData);
        req.end();
    });
}

// Probar diferentes usuarios
async function runTests() {
    console.log('🧪 Iniciando pruebas de login...\n');
    
    await testLogin('admin', '123456');
    console.log('---');
    await testLogin('experto1', '123456');
    console.log('---');
    await testLogin('operador1', '123456');
    console.log('---');
    await testLogin('admin', 'wrong_password');
    
    console.log('\n🏁 Pruebas completadas');
}

runTests();