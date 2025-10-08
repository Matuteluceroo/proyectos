#!/bin/bash

# Colores para mejor visualización
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_colored() {
    echo -e "${2}${1}${NC}"
}

# Función para verificar si un comando existe
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Función para limpiar procesos en caso de salida
cleanup() {
    print_colored "\n🛑 Deteniendo servicios..." $YELLOW
    
    # Matar procesos de Node.js relacionados con nuestro proyecto
    pkill -f "npm.*start" 2>/dev/null
    pkill -f "npm.*dev" 2>/dev/null
    pkill -f "node.*app.js" 2>/dev/null
    pkill -f "vite" 2>/dev/null
    
    print_colored "✅ Servicios detenidos" $GREEN
    exit 0
}

# Capturar señales para limpieza
trap cleanup SIGINT SIGTERM

clear
print_colored "=========================================" $CYAN
print_colored "🍊 SABER CITRICOLA - INICIADOR AUTOMATICO" $CYAN
print_colored "=========================================" $CYAN
echo

# Verificar si Node.js está instalado
if ! command_exists node; then
    print_colored "❌ ERROR: Node.js no está instalado" $RED
    print_colored "Por favor instala Node.js desde: https://nodejs.org/" $YELLOW
    print_colored "O en Ubuntu/Debian: sudo apt install nodejs npm" $YELLOW
    print_colored "O en CentOS/RHEL: sudo yum install nodejs npm" $YELLOW
    print_colored "O en macOS: brew install node" $YELLOW
    exit 1
fi

# Verificar si npm está instalado
if ! command_exists npm; then
    print_colored "❌ ERROR: npm no está instalado" $RED
    print_colored "npm debería venir con Node.js. Reinstala Node.js" $YELLOW
    exit 1
fi

print_colored "✅ Node.js $(node --version) y npm $(npm --version) detectados correctamente" $GREEN
echo

# Obtener el directorio del script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

print_colored "📂 Directorio actual: $PWD" $BLUE
echo

# Verificar estructura del proyecto
if [ ! -d "backend" ]; then
    print_colored "❌ ERROR: No se encontró la carpeta 'backend'" $RED
    print_colored "Asegúrate de ejecutar este script desde la raíz del proyecto" $YELLOW
    exit 1
fi

if [ ! -d "frontend" ]; then
    print_colored "❌ ERROR: No se encontró la carpeta 'frontend'" $RED
    print_colored "Asegúrate de ejecutar este script desde la raíz del proyecto" $YELLOW
    exit 1
fi

print_colored "✅ Estructura del proyecto verificada" $GREEN
echo

# Instalar dependencias del backend
print_colored "🔧 Instalando dependencias del backend..." $BLUE
cd backend

if [ ! -d "node_modules" ]; then
    print_colored "📦 Instalando dependencias por primera vez..." $YELLOW
    npm install
    if [ $? -ne 0 ]; then
        print_colored "❌ ERROR: Falló la instalación de dependencias del backend" $RED
        exit 1
    fi
else
    print_colored "📦 Verificando dependencias existentes..." $YELLOW
    npm install --silent
fi

print_colored "✅ Dependencias del backend instaladas" $GREEN
echo

# Instalar dependencias del frontend
print_colored "🔧 Instalando dependencias del frontend..." $BLUE
cd ../frontend

if [ ! -d "node_modules" ]; then
    print_colored "📦 Instalando dependencias por primera vez..." $YELLOW
    npm install
    if [ $? -ne 0 ]; then
        print_colored "❌ ERROR: Falló la instalación de dependencias del frontend" $RED
        exit 1
    fi
else
    print_colored "📦 Verificando dependencias existentes..." $YELLOW
    npm install --silent
fi

print_colored "✅ Dependencias del frontend instaladas" $GREEN
echo

# Volver al directorio raíz
cd ..

print_colored "🚀 INICIANDO SABER CITRICOLA..." $PURPLE
echo
print_colored "Backend ejecutándose en: http://localhost:5000" $CYAN
print_colored "Frontend ejecutándose en: http://localhost:5173" $CYAN
echo
print_colored "⚠️  Para detener la aplicación, presiona Ctrl+C" $YELLOW
echo

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if command_exists lsof; then
        lsof -i :$port >/dev/null 2>&1
    elif command_exists netstat; then
        netstat -tuln | grep ":$port " >/dev/null 2>&1
    elif command_exists ss; then
        ss -tuln | grep ":$port " >/dev/null 2>&1
    else
        return 1
    fi
}

# Verificar si los puertos están disponibles
if check_port 5000; then
    print_colored "⚠️  Puerto 5000 está en uso. El backend podría no iniciar correctamente." $YELLOW
fi

if check_port 5173; then
    print_colored "⚠️  Puerto 5173 está en uso. El frontend podría no iniciar correctamente." $YELLOW
fi

# Iniciar backend en segundo plano
print_colored "🔥 Iniciando backend..." $GREEN
cd backend
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Esperar un momento para que el backend inicie
sleep 3

# Verificar si el backend sigue ejecutándose
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    print_colored "❌ ERROR: El backend falló al iniciar. Revisa backend.log" $RED
    tail -n 10 backend.log
    exit 1
fi

# Iniciar frontend en segundo plano
print_colored "🎨 Iniciando frontend..." $GREEN
cd frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Esperar un momento para que el frontend inicie
sleep 5

# Verificar si el frontend sigue ejecutándose
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    print_colored "❌ ERROR: El frontend falló al iniciar. Revisa frontend.log" $RED
    tail -n 10 frontend.log
    # Limpiar el backend antes de salir
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Intentar abrir el navegador
print_colored "🌐 Abriendo navegador web..." $CYAN
if command_exists xdg-open; then
    xdg-open http://localhost:5173 >/dev/null 2>&1
elif command_exists open; then
    open http://localhost:5173 >/dev/null 2>&1
elif command_exists firefox; then
    firefox http://localhost:5173 >/dev/null 2>&1 &
elif command_exists google-chrome; then
    google-chrome http://localhost:5173 >/dev/null 2>&1 &
elif command_exists chromium; then
    chromium http://localhost:5173 >/dev/null 2>&1 &
else
    print_colored "⚠️  No se pudo abrir el navegador automáticamente" $YELLOW
    print_colored "Abre manualmente: http://localhost:5173" $CYAN
fi

echo
print_colored "✅ ¡Saber Citrícola iniciado correctamente!" $GREEN
echo
print_colored "📱 Aplicación disponible en: http://localhost:5173" $CYAN
print_colored "🔧 API Backend disponible en: http://localhost:5000" $CYAN
echo
print_colored "📋 Logs disponibles en:" $BLUE
print_colored "   - Backend: backend.log" $BLUE
print_colored "   - Frontend: frontend.log" $BLUE
echo
print_colored "Presiona Ctrl+C para detener la aplicación..." $YELLOW

# Mantener el script ejecutándose y monitorear los procesos
while true; do
    # Verificar si los procesos siguen ejecutándose
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        print_colored "❌ El backend se detuvo inesperadamente" $RED
        break
    fi
    
    if ! kill -0 $FRONTEND_PID 2>/dev/null; then
        print_colored "❌ El frontend se detuvo inesperadamente" $RED
        break
    fi
    
    sleep 5
done

# Limpieza automática si algo falla
cleanup