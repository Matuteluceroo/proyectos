# 📦 Dependencias del Backend - Explicación

## 🎯 ¿Qué hace cada paquete?

### **express** 🚦
- **¿Qué es?** El "camarero" del servidor
- **¿Qué hace?** Escucha peticiones HTTP y responde
- **Ejemplo:** Cuando frontend pide "GET /usuarios", Express maneja esa petición

### **cors** 🌐
- **¿Qué es?** Cross-Origin Resource Sharing
- **¿Qué hace?** Permite que frontend (puerto 3000) hable con backend (puerto 5000)
- **Sin CORS:** Navegador bloquea la comunicación por seguridad

### **sqlite3** 🗃️
- **¿Qué es?** Base de datos en un archivo
- **¿Qué hace?** Guarda usuarios, documentos, etc.
- **Ventaja:** No necesitas instalar nada extra, es solo un archivo

### **nodemon** 🔄 (desarrollo)
- **¿Qué es?** Monitor de archivos
- **¿Qué hace?** Reinicia el servidor automáticamente cuando cambias código
- **Sin nodemon:** Tienes que parar y iniciar el servidor manualmente

## 🚀 Comandos disponibles

- `npm start` → Inicia el servidor (producción)
- `npm run dev` → Inicia con nodemon (desarrollo)