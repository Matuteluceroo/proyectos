@echo off
echo ============================================
echo    🚀 INICIANDO SABER CITRICOLA (LOCAL)
echo ============================================
echo.

echo 📍 Iniciando Backend en puerto 1234...
cd /d "C:\Users\mauricio.batista\Desktop\proyectos\BACKEND-SC-main"
start "Backend-Saber-Citricola" cmd /k "node app.js"

echo ⏱️ Esperando que el backend se inicie...
timeout /t 3 /nobreak > nul

echo 🌐 Iniciando Frontend React...
cd /d "C:\Users\mauricio.batista\Desktop\proyectos\SC-REACT-main"
start "Frontend-Saber-Citricola" cmd /k "npm run dev"

echo.
echo ✅ ¡Proyecto iniciado!
echo.
echo 📋 Información de acceso:
echo    Backend:  http://localhost:1234
echo    Frontend: http://localhost:5173 (o el puerto que muestre Vite)
echo.
echo ⚠️  Si hay errores de CORS, verifica que ambos servicios estén corriendo
echo.
pause