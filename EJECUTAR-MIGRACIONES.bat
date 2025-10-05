@echo off
echo 🚀 Ejecutando migraciones del Sistema Saber Citricola
echo.

cd /d "SABER-CITRICOLA-NUEVO\backend"

echo 📁 Directorio actual: %CD%
echo.

echo 🔧 Verificando archivos de migracion...
if exist "migrations\comentarios.sql" (
    echo ✅ comentarios.sql encontrado
) else (
    echo ❌ comentarios.sql NO encontrado
)

if exist "migrations\versiones.sql" (
    echo ✅ versiones.sql encontrado
) else (
    echo ❌ versiones.sql NO encontrado
)

if exist "migrations\notificaciones.sql" (
    echo ✅ notificaciones.sql encontrado
) else (
    echo ❌ notificaciones.sql NO encontrado
)

echo.
echo 🎯 Ejecutando migraciones...
echo.

node run-all-migrations.js

echo.
echo 🏁 Proceso completado.
echo.
pause