@echo off
echo ======================================
echo    INICIANDO BACKEND SABER CITRICOLA
echo ======================================
echo.
echo Navegando al directorio del backend...
cd /d "%~dp0BACKEND-SC-main"
echo.
echo Ejecutando servidor backend en puerto 1234...
echo.
echo IMPORTANTE: 
echo - Asegurate de tener SQL Server configurado
echo - Revisa el archivo .env con tus credenciales
echo.
echo Presiona Ctrl+C para detener el servidor
echo.
npm run dev