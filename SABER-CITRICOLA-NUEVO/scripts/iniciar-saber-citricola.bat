@echo off
title Saber Citrícola - Iniciador Automático
color 0A

echo.
echo  =========================================
echo  🍊 SABER CITRICOLA - INICIADOR AUTOMATICO
echo  =========================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: Node.js no está instalado
    echo Por favor instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar si npm está instalado
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERROR: npm no está instalado
    echo npm debería venir con Node.js. Reinstala Node.js
    pause
    exit /b 1
)

echo ✅ Node.js y npm detectados correctamente
echo.

REM Obtener el directorio del script
set SCRIPT_DIR=%~dp0
cd /d "%SCRIPT_DIR%"

echo 📂 Directorio actual: %CD%
echo.

REM Verificar estructura del proyecto
if not exist "backend" (
    echo ❌ ERROR: No se encontró la carpeta 'backend'
    echo Asegúrate de ejecutar este script desde la raíz del proyecto
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ❌ ERROR: No se encontró la carpeta 'frontend'
    echo Asegúrate de ejecutar este script desde la raíz del proyecto
    pause
    exit /b 1
)

echo ✅ Estructura del proyecto verificada
echo.

REM Instalar dependencias del backend
echo 🔧 Instalando dependencias del backend...
cd backend
if not exist "node_modules" (
    echo 📦 Instalando dependencias por primera vez...
    npm install
    if errorlevel 1 (
        echo ❌ ERROR: Falló la instalación de dependencias del backend
        pause
        exit /b 1
    )
) else (
    echo 📦 Verificando dependencias existentes...
    npm install --silent
)

echo ✅ Dependencias del backend instaladas
echo.

REM Instalar dependencias del frontend
echo 🔧 Instalando dependencias del frontend...
cd ..\frontend
if not exist "node_modules" (
    echo 📦 Instalando dependencias por primera vez...
    npm install
    if errorlevel 1 (
        echo ❌ ERROR: Falló la instalación de dependencias del frontend
        pause
        exit /b 1
    )
) else (
    echo 📦 Verificando dependencias existentes...
    npm install --silent
)

echo ✅ Dependencias del frontend instaladas
echo.

REM Volver al directorio raíz
cd ..

echo 🚀 INICIANDO SABER CITRICOLA...
echo.
echo Backend ejecutándose en: http://localhost:5000
echo Frontend ejecutándose en: http://localhost:5173
echo.
echo ⚠️  Para detener la aplicación, presiona Ctrl+C en cada terminal
echo.

REM Crear archivos temporales para los scripts
echo cd "%SCRIPT_DIR%backend" ^&^& npm start > "%TEMP%\start_backend.bat"
echo cd "%SCRIPT_DIR%frontend" ^&^& npm run dev > "%TEMP%\start_frontend.bat"

REM Iniciar backend en nueva ventana
start "🔥 Saber Citrícola - Backend" cmd /k "%TEMP%\start_backend.bat"

REM Esperar un momento para que el backend inicie
timeout /t 3 /nobreak >nul

REM Iniciar frontend en nueva ventana
start "🎨 Saber Citrícola - Frontend" cmd /k "%TEMP%\start_frontend.bat"

REM Esperar un momento y abrir el navegador
timeout /t 5 /nobreak >nul
echo 🌐 Abriendo navegador web...
start "" http://localhost:5173

REM Limpiar archivos temporales
del "%TEMP%\start_backend.bat" 2>nul
del "%TEMP%\start_frontend.bat" 2>nul

echo.
echo ✅ ¡Saber Citrícola iniciado correctamente!
echo.
echo 📱 Aplicación disponible en: http://localhost:5173
echo 🔧 API Backend disponible en: http://localhost:5000
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul