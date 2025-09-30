@echo off
echo ================================================
echo    INICIANDO APLICACION COMPLETA SABER CITRICOLA
echo ================================================
echo.
echo Este script iniciará:
echo 1. Backend (Puerto 1234)
echo 2. Frontend (Puerto 5173)
echo.
echo IMPORTANTE: Asegurate de tener configurado SQL Server
echo.
pause
echo.
echo Iniciando backend...
start "Backend Saber Citricola" cmd /k "cd /d "%~dp0BACKEND-SC-main" && npm run dev"
echo.
echo Esperando 3 segundos...
timeout /t 3 /nobreak >nul
echo.
echo Iniciando frontend...
start "Frontend Saber Citricola" cmd /k "cd /d "%~dp0SC-REACT-main" && npm run dev"
echo.
echo ================================================
echo  ✅ APLICACION INICIADA
echo ================================================
echo.
echo Backend: http://localhost:1234
echo Frontend: http://localhost:5173
echo.
echo Para detener, cierra las ventanas que se abrieron
echo.
pause