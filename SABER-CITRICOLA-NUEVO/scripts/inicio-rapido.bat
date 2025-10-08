@echo off
title Saber Citrícola - Iniciador Simple
color 0A

echo.
echo  =========================================
echo  🍊 SABER CITRICOLA - INICIADOR SIMPLE
echo  =========================================
echo.

REM Ir al directorio del script
cd /d "%~dp0"

echo 📂 Directorio: %CD%
echo.

REM Matar procesos Node.js existentes en los puertos
echo 🔧 Liberando puertos...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000') do (
    if "%%a" neq "0" (
        echo Terminando proceso %%a en puerto 5000...
        taskkill /PID %%a /F >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    if "%%a" neq "0" (
        echo Terminando proceso %%a en puerto 5173...
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo ✅ Puertos liberados
echo.

REM Verificar estructura
if not exist "backend\app.js" (
    echo ❌ ERROR: No se encontró backend\app.js
    pause
    exit /b 1
)

if not exist "frontend\package.json" (
    echo ❌ ERROR: No se encontró frontend\package.json
    pause
    exit /b 1
)

echo ✅ Estructura verificada
echo.

REM Instalar dependencias backend
echo 🔧 Verificando backend...
cd backend
if not exist "node_modules" (
    echo 📦 Instalando dependencias backend...
    npm install
    if errorlevel 1 (
        echo ❌ ERROR: Falló instalación backend
        pause
        exit /b 1
    )
)
cd ..

REM Instalar dependencias frontend
echo 🔧 Verificando frontend...
cd frontend
if not exist "node_modules" (
    echo 📦 Instalando dependencias frontend...
    npm install
    if errorlevel 1 (
        echo ❌ ERROR: Falló instalación frontend
        pause
        exit /b 1
    )
)
cd ..

echo ✅ Dependencias verificadas
echo.

echo 🚀 INICIANDO SABER CITRICOLA...
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.

REM Iniciar backend
start "🔥 Backend - Saber Citrícola" cmd /k "cd /d \"%~dp0backend\" && npm start"

REM Esperar 3 segundos
timeout /t 3 /nobreak >nul

REM Iniciar frontend
start "🎨 Frontend - Saber Citrícola" cmd /k "cd /d \"%~dp0frontend\" && npm run dev"

REM Esperar 5 segundos y abrir navegador
timeout /t 5 /nobreak >nul
echo 🌐 Abriendo navegador...
start "" http://localhost:5173

echo.
echo ✅ ¡Saber Citrícola iniciado!
echo.
echo 📱 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:5000
echo.
echo Las ventanas se abrieron por separado.
echo Cierra las ventanas del terminal para detener los servicios.
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause >nul