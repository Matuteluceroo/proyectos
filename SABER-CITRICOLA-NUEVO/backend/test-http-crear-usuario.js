// 🔍 test-http-crear-usuario.js - Simular exactamente lo que hace el frontend
import http from 'http';

const API_URL = 'localhost';
const PORT = 5000;

function crearUsuarioViaHTTP(datosUsuario) {
    return new Promise((resolve) => {
        const postData = JSON.stringify(datosUsuario);
        
        const options = {
            hostname: API_URL,
            port: PORT,
            path: '/api/usuarios',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'userRole': 'admin', // Header que usa devBypassAuth
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('🔄 Enviando petición POST a /api/usuarios');
        console.log('📤 Headers:', options.headers);
        console.log('📤 Datos:', datosUsuario);
        
        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log(`📊 Status HTTP: ${res.statusCode}`);
                console.log(`📥 Headers de respuesta:`, res.headers);
                
                try {
                    const jsonData = JSON.parse(responseData);
                    console.log(`📥 Respuesta JSON:`, jsonData);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    console.error('💥 Error parsing JSON:', error.message);
                    console.log('📄 Respuesta raw:', responseData);
                    resolve({ error: 'Invalid JSON response', raw: responseData, status: res.statusCode });
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

// Probar creación de usuario
async function testCrearUsuario() {
    console.log('🧪 Iniciando test HTTP de creación de usuario...\n');
    
    const nuevoUsuario = {
        username: 'test_http_user',
        email: 'test_http@example.com',
        password: 'password123',
        nombre_completo: 'Usuario HTTP Test',
        rol: 'operador'
    };
    
    const resultado = await crearUsuarioViaHTTP(nuevoUsuario);
    
    console.log('\n📊 RESULTADO FINAL:');
    if (resultado.status === 201) {
        console.log('✅ Usuario creado exitosamente!');
    } else {
        console.log('❌ Error al crear usuario');
        console.log('🔍 Detalles del error:', resultado);
    }
    
    console.log('\n🏁 Test completado');
}

testCrearUsuario();