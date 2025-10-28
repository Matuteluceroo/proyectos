// 🧪 test-usuarios-api.js - Script para probar la API de usuarios
import http from 'http';

const API_URL = 'localhost';
const PORT = 5000;

function testAPI(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve) => {
        const postData = data ? JSON.stringify(data) : null;
        
        const options = {
            hostname: API_URL,
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'userRole': 'admin', // Header que espera el backend
                ...headers
            }
        };

        if (postData) {
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }

        console.log(`🔄 ${method} ${path}`);
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    console.log(`📊 Status: ${res.statusCode}`);
                    console.log(`📥 Respuesta:`, jsonData);
                    
                    if (res.statusCode < 300) {
                        console.log('✅ Petición exitosa');
                    } else {
                        console.log('❌ Petición fallida');
                    }
                    
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    console.error('💥 Error parsing JSON:', error.message);
                    console.log('📄 Respuesta raw:', responseData);
                    resolve({ error: 'Invalid JSON response', raw: responseData });
                }
            });
        });

        req.on('error', (error) => {
            console.error('💥 Error de conexión:', error.message);
            resolve({ error: error.message });
        });

        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

// Probar diferentes endpoints
async function runTests() {
    console.log('🧪 Iniciando pruebas de API de usuarios...\n');
    
    // Test 1: Obtener usuarios
    await testAPI('/api/usuarios');
    console.log('---');
    
    // Test 2: Crear usuario
    const nuevoUsuario = {
        username: 'test_user',
        email: 'test@example.com',
        password: 'password123',
        nombre_completo: 'Usuario de Prueba',
        rol: 'operador'
    };
    
    await testAPI('/api/usuarios', 'POST', nuevoUsuario);
    console.log('---');
    
    // Test 3: Intentar crear usuario duplicado
    await testAPI('/api/usuarios', 'POST', nuevoUsuario);
    console.log('---');
    
    // Test 4: Probar sin permisos de admin
    await testAPI('/api/usuarios', 'GET', null, { 'userRole': 'operador' });
    
    console.log('\n🏁 Pruebas completadas');
}

runTests();