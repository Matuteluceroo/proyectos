#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    purple: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

// Función para imprimir con colores
function printColored(message, color = 'white') {
    console.log(colors[color] + message + colors.reset);
}

// Función para verificar si un comando existe
function commandExists(command) {
    return new Promise((resolve) => {
        exec(`${command} --version`, (error) => {
            resolve(!error);
        });
    });
}

// Función para matar procesos en puertos específicos
function killProcessOnPort(port) {
    return new Promise((resolve) => {
        const platform = os.platform();
        let command;
        
        if (platform === 'win32') {
            // En Windows, usamos netstat y taskkill
            exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
                if (error) {
                    resolve(); // No hay proceso en ese puerto
                    return;
                }
                
                const lines = stdout.split('\n');
                const pids = lines
                    .filter(line => line.includes('LISTENING'))
                    .map(line => {
                        const parts = line.trim().split(/\s+/);
                        return parts[parts.length - 1];
                    })
                    .filter(pid => pid && pid !== '0');
                
                if (pids.length === 0) {
                    resolve();
                    return;
                }
                
                // Matar todos los procesos que están usando el puerto
                const killPromises = pids.map(pid => {
                    return new Promise((killResolve) => {
                        exec(`taskkill /PID ${pid} /F`, () => {
                            killResolve(); // Siempre resolver, incluso si falla
                        });
                    });
                });
                
                Promise.all(killPromises).then(() => {
                    printColored(`🔧 Liberado puerto ${port}`, 'yellow');
                    setTimeout(resolve, 1000); // Esperar un poco después de matar
                });
            });
        } else {
            // En Linux/Mac, usamos lsof y kill
            exec(`lsof -ti:${port}`, (error, stdout) => {
                if (error) {
                    resolve(); // No hay proceso en ese puerto
                    return;
                }
                
                const pids = stdout.trim().split('\n').filter(pid => pid);
                if (pids.length === 0) {
                    resolve();
                    return;
                }
                
                const killPromises = pids.map(pid => {
                    return new Promise((killResolve) => {
                        exec(`kill -9 ${pid}`, () => {
                            killResolve(); // Siempre resolver, incluso si falla
                        });
                    });
                });
                
                Promise.all(killPromises).then(() => {
                    printColored(`🔧 Liberado puerto ${port}`, 'yellow');
                    setTimeout(resolve, 1000); // Esperar un poco después de matar
                });
            });
        }
    });
}

// Función para verificar si un puerto está en uso
function isPortInUse(port) {
    return new Promise((resolve) => {
        const net = require('net');
        const server = net.createServer();
        
        server.listen(port, () => {
            server.once('close', () => {
                resolve(false);
            });
            server.close();
        });
        
        server.on('error', () => {
            resolve(true);
        });
    });
}

// Función para abrir el navegador
function openBrowser(url) {
    const platform = os.platform();
    let command;
    
    switch (platform) {
        case 'darwin':
            command = 'open';
            break;
        case 'win32':
            command = 'start ""';
            break;
        default:
            command = 'xdg-open';
    }
    
    exec(`${command} ${url}`, (error) => {
        if (error) {
            printColored(`⚠️  No se pudo abrir el navegador automáticamente`, 'yellow');
            printColored(`Abre manualmente: ${url}`, 'cyan');
        }
    });
}

// Función para instalar dependencias
function installDependencies(directory) {
    return new Promise((resolve, reject) => {
        const nodeModulesPath = path.join(directory, 'node_modules');
        
        if (fs.existsSync(nodeModulesPath)) {
            printColored(`📦 Verificando dependencias existentes en ${directory}...`, 'yellow');
        } else {
            printColored(`📦 Instalando dependencias por primera vez en ${directory}...`, 'yellow');
        }
        
        const isWindows = os.platform() === 'win32';
        const npm = isWindows ? 'npm.cmd' : 'npm';
        const install = spawn(npm, ['install'], {
            cwd: directory,
            stdio: 'pipe',
            shell: isWindows
        });
        
        install.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Error al instalar dependencias en ${directory}`));
            }
        });
        
        install.stderr.on('data', (data) => {
            // Solo mostrar errores críticos, no warnings
            const message = data.toString();
            if (message.includes('ERR!')) {
                process.stderr.write(data);
            }
        });
    });
}

// Función para iniciar un servicio
function startService(directory, command, name, logFile) {
    return new Promise((resolve, reject) => {
        const isWindows = os.platform() === 'win32';
        const npm = isWindows ? 'npm.cmd' : 'npm';
        const args = command.split(' ');
        
        // ✅ CONFIGURAR VARIABLES DE ENTORNO PARA WINDOWS
        const env = { ...process.env };
        if (name === 'backend') {
            env.NODE_ENV = 'development'; // Importante para desarrollo local
        }
        
        const service = spawn(npm, args, {
            cwd: directory,
            stdio: 'pipe',
            detached: false,
            shell: isWindows,
            env: env // ✅ Pasar las variables de entorno
        });
        
        // Redirigir logs a archivo
        const logStream = fs.createWriteStream(logFile);
        service.stdout.pipe(logStream);
        service.stderr.pipe(logStream);
        
        // ✅ TAMBIÉN MOSTRAR LOGS EN CONSOLA PARA DEBUGGING
        service.stdout.on('data', (data) => {
            process.stdout.write(data);
        });
        
        service.stderr.on('data', (data) => {
            process.stderr.write(data); // ✅ Esto mostrará los errores
        });
        
        // Verificar que el servicio inició correctamente
        let started = false;
        const timeout = setTimeout(() => {
            if (!started) {
                reject(new Error(`Timeout iniciando ${name}`));
            }
        }, 30000); // 30 segundos de timeout
        
        service.stdout.on('data', (data) => {
            const message = data.toString();
            // Para el backend, buscar indicaciones de que está escuchando
            if ((name === 'backend' && (message.includes('listening') || message.includes('Server') || message.includes('puerto') || message.includes('iniciado') || message.includes('5000'))) ||
                (name === 'frontend' && (message.includes('Local:') || message.includes('ready') || message.includes('dev server')))) {
                if (!started) {
                    started = true;
                    clearTimeout(timeout);
                    resolve(service);
                }
            }
        });
        
        service.on('error', (error) => {
            clearTimeout(timeout);
            reject(error);
        });
        
        service.on('close', (code) => {
            clearTimeout(timeout);
            if (!started) {
                reject(new Error(`${name} se cerró con código ${code}`));
            }
        });
        
        // Para el frontend, a veces no hay output inmediato, así que esperamos un poco
        if (name === 'frontend') {
            setTimeout(() => {
                if (!started) {
                    started = true;
                    clearTimeout(timeout);
                    resolve(service);
                }
            }, 5000);
        }
    });
}

// Función principal
async function main() {
    console.clear();
    printColored('=========================================', 'cyan');
    printColored('🍊 SABER CITRICOLA - INICIADOR AUTOMATICO', 'cyan');
    printColored('=========================================', 'cyan');
    console.log();
    
    try {
        // Verificar Node.js y npm
        printColored('🔍 Verificando requisitos...', 'blue');
        
        const nodeExists = await commandExists('node');
        const npmExists = await commandExists('npm');
        
        if (!nodeExists) {
            printColored('❌ ERROR: Node.js no está instalado', 'red');
            printColored('Por favor instala Node.js desde: https://nodejs.org/', 'yellow');
            process.exit(1);
        }
        
        if (!npmExists) {
            printColored('❌ ERROR: npm no está instalado', 'red');
            printColored('npm debería venir con Node.js. Reinstala Node.js', 'yellow');
            process.exit(1);
        }
        
        printColored('✅ Node.js y npm detectados correctamente', 'green');
        console.log();
        
        // Verificar estructura del proyecto
        const currentDir = process.cwd();
        const backendDir = path.join(currentDir, 'backend');
        const frontendDir = path.join(currentDir, 'frontend');
        
        printColored(`📂 Directorio actual: ${currentDir}`, 'blue');
        
        if (!fs.existsSync(backendDir)) {
            printColored('❌ ERROR: No se encontró la carpeta "backend"', 'red');
            printColored('Asegúrate de ejecutar este script desde la raíz del proyecto', 'yellow');
            process.exit(1);
        }
        
        if (!fs.existsSync(frontendDir)) {
            printColored('❌ ERROR: No se encontró la carpeta "frontend"', 'red');
            printColored('Asegúrate de ejecutar este script desde la raíz del proyecto', 'yellow');
            process.exit(1);
        }
        
        printColored('✅ Estructura del proyecto verificada', 'green');
        console.log();
        
        // ✅ VERIFICACIÓN DEL .ENV
        const envPath = path.join(backendDir, '.env');
        const envExamplePath = path.join(backendDir, '.env.example');
        
        if (!fs.existsSync(envPath)) {
            printColored('⚠️  No se encontró archivo .env en backend', 'yellow');
            if (fs.existsSync(envExamplePath)) {
                printColored('📋 Copiando .env.example a .env...', 'blue');
                fs.copyFileSync(envExamplePath, envPath);
                printColored('✅ Archivo .env creado. Por favor revisa y ajusta las variables si es necesario.', 'green');
            } else {
                printColored('❌ ERROR: No se encontró .env.example', 'red');
                printColored('Crea un archivo .env en backend/ con las variables necesarias', 'yellow');
                process.exit(1);
            }
            console.log();
        }
        
        // Verificar y liberar puertos si están ocupados
        printColored('🔍 Verificando puertos...', 'blue');
        const backendPortInUse = await isPortInUse(5000);
        const frontendPortInUse = await isPortInUse(5173);
        
        if (backendPortInUse) {
            printColored('⚠️  Puerto 5000 está ocupado. Liberando...', 'yellow');
            await killProcessOnPort(5000);
        }
        
        if (frontendPortInUse) {
            printColored('⚠️  Puerto 5173 está ocupado. Liberando...', 'yellow');
            await killProcessOnPort(5173);
        }
        
        if (backendPortInUse || frontendPortInUse) {
            printColored('✅ Puertos liberados correctamente', 'green');
            console.log();
        }
        
        // Instalar dependencias
        printColored('🔧 Instalando dependencias del backend...', 'blue');
        await installDependencies(backendDir);
        printColored('✅ Dependencias del backend instaladas', 'green');
        console.log();
        
        printColored('🔧 Instalando dependencias del frontend...', 'blue');
        await installDependencies(frontendDir);
        printColored('✅ Dependencias del frontend instaladas', 'green');
        console.log();
        
        // Iniciar servicios
        printColored('🚀 INICIANDO SABER CITRICOLA...', 'purple');
        console.log();
        printColored('Backend ejecutándose en: http://localhost:5000', 'cyan');
        printColored('Frontend ejecutándose en: http://localhost:5173', 'cyan');
        console.log();
        printColored('⚠️  Para detener la aplicación, presiona Ctrl+C', 'yellow');
        console.log();
        
        // Iniciar backend
        printColored('🔥 Iniciando backend...', 'green');
        const backendProcess = await startService(
            backendDir, 
            'start', 
            'backend', 
            path.join(currentDir, 'backend.log')
        );
        
        printColored('✅ Backend iniciado correctamente', 'green');
        console.log();
        
        // Esperar un poco antes de iniciar el frontend
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Iniciar frontend
        printColored('🎨 Iniciando frontend...', 'green');
        const frontendProcess = await startService(
            frontendDir, 
            'run dev', 
            'frontend', 
            path.join(currentDir, 'frontend.log')
        );
        
        printColored('✅ Frontend iniciado correctamente', 'green');
        console.log();
        
        // Esperar antes de abrir el navegador
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        printColored('🌐 Abriendo navegador web...', 'cyan');
        openBrowser('http://localhost:5173');
        
        console.log();
        printColored('✅ ¡Saber Citrícola iniciado correctamente!', 'green');
        console.log();
        printColored('📱 Aplicación disponible en: http://localhost:5173', 'cyan');
        printColored('🔧 API Backend disponible en: http://localhost:5000', 'cyan');
        console.log();
        printColored('📋 Logs disponibles en:', 'blue');
        printColored('   - Backend: backend.log', 'blue');
        printColored('   - Frontend: frontend.log', 'blue');
        console.log();
        printColored('Presiona Ctrl+C para detener la aplicación...', 'yellow');
        
        // Manejar la salida
        const cleanup = () => {
            printColored('\n🛑 Deteniendo servicios...', 'yellow');
            
            if (backendProcess && !backendProcess.killed) {
                backendProcess.kill('SIGTERM');
            }
            
            if (frontendProcess && !frontendProcess.killed) {
                frontendProcess.kill('SIGTERM');
            }
            
            printColored('✅ Servicios detenidos', 'green');
            process.exit(0);
        };
        
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
        
        // Monitorear procesos
        backendProcess.on('close', (code) => {
            if (code !== 0 && code !== null) {
                printColored('❌ El backend se detuvo inesperadamente', 'red');
                cleanup();
            }
        });
        
        frontendProcess.on('close', (code) => {
            if (code !== 0 && code !== null) {
                printColored('❌ El frontend se detuvo inesperadamente', 'red');
                cleanup();
            }
        });
        
        // Mantener el proceso vivo
        await new Promise(() => {}); // Espera infinita
        
    } catch (error) {
        printColored(`❌ ERROR: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Verificar si se está ejecutando directamente
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };