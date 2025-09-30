@echo off
echo ======================================
echo    INICIANDO FRONTEND SABER CITRICOLA
echo ======================================
echo.
echo Navegando al directorio del frontend...
cd /d "%~dp0SC-REACT-main"
echo.
echo Ejecutando servidor de desarrollo React con Vite...
echo.
echo El frontend estará disponible en: http://localhost:5173
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
npm run dev