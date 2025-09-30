# 🍊 Saber Citrícola - Inicio Rápido

## ⚡ Inicio Súper Fácil

### Opción 1: Todo junto
1. **Doble clic en `INICIAR-TODO.bat`**
2. ¡Listo! Se abrirán dos ventanas con backend y frontend

### Opción 2: Por separado
1. **Backend**: Doble clic en `INICIAR-BACKEND.bat`
2. **Frontend**: Doble clic en `INICIAR-FRONTEND.bat`

### Opción 3: Desde terminal
```bash
# Backend
cd BACKEND-SC-main
npm run dev

# Frontend (en otra terminal)
cd SC-REACT-main
npm run dev
```

## 🔧 Configuración Rápida

### 1. Base de Datos
- **Edita el archivo**: `BACKEND-SC-main\.env`
- **Cambia las credenciales** por las tuyas:
```
USER=tu_usuario
PASSWORD=tu_password
SERVER=localhost  # o localhost\SQLEXPRESS
```

### 2. URLs de Acceso
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:1234

## 🚨 Si no funciona...

1. **¿No tienes SQL Server?**
   - Instala SQL Server Express (gratis)
   - O usa LocalDB: cambia SERVER por `(localdb)\\MSSQLLocalDB`

2. **¿Error de dependencias?**
   ```bash
   cd BACKEND-SC-main && npm install
   cd SC-REACT-main && npm install
   ```

3. **¿Puerto ocupado?**
   - Cambia PORT en el archivo `.env`

## 🎯 Próximos Pasos
1. ✅ Configura tu base de datos
2. ✅ Ejecuta `INICIAR-TODO.bat`
3. ✅ Abre http://localhost:5173
4. ✅ ¡Empieza a desarrollar!

---
**¿Problemas?** Revisa los logs en las ventanas que se abren.