# 🍊 Saber Citrícola - Opciones de Arranque

## 🚀 Arranque Súper Rápido

### Opción 1: Script Simple Windows (RECOMENDADO)
```bash
# Doble clic en el archivo o ejecutar:
inicio-rapido.bat
```

### Opción 2: Manualmente (Si hay problemas)
```bash
# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend  
cd frontend
npm install
npm run dev
```

### Opción 3: Con el Script Node.js
```bash
node iniciar-saber-citricola.js
```

## 🔧 Solución de Problemas

### Si los puertos están ocupados:
```bash
# Buscar procesos en puerto 5000
netstat -ano | findstr :5000

# Terminar proceso (reemplaza PID con el número que aparece)
taskkill /PID [NUMERO_PID] /F

# Buscar procesos en puerto 5173
netstat -ano | findstr :5173
taskkill /PID [NUMERO_PID] /F
```

### Limpiar completamente:
```bash
# Borrar dependencias y reinstalar
cd backend
rmdir /s node_modules
npm install

cd ../frontend  
rmdir /s node_modules
npm install
```

## 📋 URLs una vez iniciado

- **Frontend (Aplicación)**: http://localhost:5173
- **Backend (API)**: http://localhost:5000
- **Admin Panel**: http://localhost:5173/admin

## 🎯 Lo que hace cada script

### `inicio-rapido.bat` ✅ MÁS CONFIABLE
- Mata procesos existentes en puertos 5000 y 5173
- Verifica estructura del proyecto
- Instala dependencias si no existen
- Abre ventanas separadas para backend y frontend
- Abre el navegador automáticamente

### `iniciar-saber-citricola.js` (Avanzado)
- Script multiplataforma
- Manejo robusto de procesos
- Logs detallados
- Monitoreo en tiempo real

### Arranque Manual (Debugging)
- Control total sobre cada paso
- Ideal para desarrollo y debugging
- Permite ver errores específicos

## ⚡ Recomendación

**Para uso diario**: Usa `inicio-rapido.bat` (doble clic)  
**Para desarrollo**: Arranque manual en dos terminales  
**Para demos**: Cualquiera de los scripts automáticos

## 🆘 Si nada funciona

1. Reinicia todas las terminales
2. Ejecuta: `taskkill /F /IM node.exe` (mata todos los procesos Node)
3. Usa el arranque manual para ver errores específicos
4. Verifica que Node.js esté instalado: `node --version`

---

¡Con cualquiera de estas opciones tendrás **Saber Citrícola** funcionando! 🍊✨