# 🍊 Saber Citrícola - Guía de Arranque Automático

Esta guía explica cómo usar los scripts de arranque automático para levantar toda la aplica3. **Verifica puertos**: Asegúrate de que los puertos 5000 y 5173 estén disponiblesión Saber Citrícola con un solo comando.

## 📋 Requisitos Previos

- **Node.js** v16 o superior
- **npm** (incluido con Node.js)
- Conexión a internet (para instalar dependencias)

## 🚀 Scripts Disponibles

Tienes **3 opciones** para iniciar la aplicación, elige la que prefieras:

### 1. 🪟 Windows (Archivo .bat)
```bash
# Doble clic en el archivo o ejecutar desde PowerShell/CMD
iniciar-saber-citricola.bat
```

### 2. 🐧 Linux/Mac (Archivo .sh)
```bash
# Dar permisos de ejecución (solo la primera vez)
chmod +x iniciar-saber-citricola.sh

# Ejecutar el script
./iniciar-saber-citricola.sh
```

### 3. 🌍 Universal - Node.js (Cualquier plataforma)
```bash
# Opción 1: Ejecutar directamente
node iniciar-saber-citricola.js

# Opción 2: Usar como ejecutable (Linux/Mac)
chmod +x iniciar-saber-citricola.js
./iniciar-saber-citricola.js
```

## ⚡ ¿Qué hacen los scripts?

Todos los scripts realizan automáticamente:

1. **✅ Verificación de requisitos**
   - Detecta si Node.js y npm están instalados
   - Verifica la estructura del proyecto

2. **📦 Instalación de dependencias**
   - Instala automáticamente las dependencias del backend
   - Instala automáticamente las dependencias del frontend
   - Solo las instala si no existen o están desactualizadas

3. **🚀 Inicio de servicios**
   - Levanta el **backend** en `http://localhost:5000`
   - Levanta el **frontend** en `http://localhost:5173`
   - Ambos servicios se ejecutan simultáneamente

4. **🌐 Apertura automática del navegador**
   - Abre automáticamente `http://localhost:5173` en tu navegador predeterminado

5. **📋 Generación de logs**
   - `backend.log` - Logs del servidor backend
   - `frontend.log` - Logs del servidor de desarrollo frontend

## 🛠️ Resolución de Problemas

### Error: "Node.js no está instalado"
- Descarga e instala Node.js desde [nodejs.org](https://nodejs.org/)
- Versión recomendada: LTS (Long Term Support)

### Error: "Puerto en uso"
- **Puerto 5000 ocupado**: Otro servicio está usando el puerto del backend
- **Puerto 5173 ocupado**: Otro servicio está usando el puerto del frontend
- **Solución**: Detén los servicios que usan esos puertos o cambia los puertos en la configuración

### Error: "No se encontró la carpeta backend/frontend"
- Asegúrate de ejecutar el script desde la carpeta raíz del proyecto
- La estructura debe ser:
  ```
  SABER-CITRICOLA-NUEVO/
  ├── backend/
  ├── frontend/
  └── iniciar-saber-citricola.*
  ```

### Error: "Falló la instalación de dependencias"
- Verifica tu conexión a internet
- Borra las carpetas `node_modules` y ejecuta nuevamente
- En Windows, ejecuta como administrador si es necesario

### El navegador no se abre automáticamente
- Abre manualmente: `http://localhost:5173`
- El script continuará funcionando normalmente

## 🔄 Detener la Aplicación

Para detener completamente la aplicación:

- **Presiona `Ctrl + C`** en la terminal donde está ejecutándose el script
- En Windows: También puedes cerrar las ventanas de terminal que se abren
- Los scripts se encargan de limpiar todos los procesos automáticamente

## 📊 Monitoreo

### Verificar que todo esté funcionando:
- **Frontend**: Abre `http://localhost:5173` - Deberías ver la interfaz de Saber Citrícola
- **Backend API**: Abre `http://localhost:5000` - Deberías ver un mensaje del servidor
- **Logs**: Revisa los archivos `backend.log` y `frontend.log` para ver detalles

### URLs importantes:
- 🎨 **Aplicación Web**: http://localhost:5173
- 🔧 **API Backend**: http://localhost:5000
- 📊 **Admin Panel**: http://localhost:5173/admin (si tienes permisos)

## 🎯 Recomendaciones

### Para Desarrollo:
- Usa el **script Node.js** (`iniciar-saber-citricola.js`) - Es el más robusto
- Mantén las ventanas de terminal abiertas para ver logs en tiempo real

### Para Producción:
- Configura variables de entorno apropiadas
- Usa un process manager como PM2 para gestión avanzada de procesos

### Para Demostraciones:
- Usa el **script Windows** (`iniciar-saber-citricola.bat`) - Más visual para presentaciones
- Se abren ventanas separadas que son fáciles de mostrar

## 🔧 Personalización

### Cambiar puertos:
Si necesitas usar puertos diferentes, modifica:
- **Backend**: `backend/app.js` o variables de entorno
- **Frontend**: `frontend/vite.config.js`

### Agregar variables de entorno:
Crea archivos `.env` en las carpetas `backend` y `frontend` con tus configuraciones específicas.

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs**: `backend.log` y `frontend.log`
2. **Verifica la instalación**: Ejecuta `node --version` y `npm --version`
3. **Limpia dependencias**: Borra `node_modules` en ambas carpetas y ejecuta el script nuevamente
4. **Verifica puertos**: Asegúrate de que los puertos 3000 y 5173 estén disponibles

---

## 🎉 ¡Listo!

Con cualquiera de estos scripts, tendrás **Saber Citrícola** ejecutándose en segundos. El MVP está completo y listo para usar. 🍊✨

**¡Disfruta desarrollando con Saber Citrícola!** 🚀