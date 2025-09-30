# 🚀 Guía de Desarrollo - Proyecto Tesis

## 📁 Estructura del Proyecto

### Backend (`BACKEND-SC-main/`)
```
├── app.js                 # Servidor principal
├── connection_TEST.js     # Conexión a base de datos
├── package.json          # Dependencias del backend
├── controllers/          # Lógica de negocio
├── routes/              # Rutas de la API
├── models/              # Modelos de datos
├── middleware/          # Middlewares (CORS, JWT)
├── scripts_python/      # Scripts de Python integrados
└── Testing/             # Archivos de prueba
```

### Frontend (`SC-REACT-main/`)
```
├── src/
│   ├── App.jsx          # Componente principal
│   ├── components/      # Componentes reutilizables
│   ├── pages/          # Páginas de la aplicación
│   ├── routes/         # Configuración de rutas
│   └── services/       # Servicios y contextos
├── package.json        # Dependencias del frontend
└── vite.config.js      # Configuración de Vite
```

## 🛠️ Configuración Inicial

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en `BACKEND-SC-main/` con:
```env
# Base de datos
USER=tu_usuario_sql
PASSWORD=tu_password_sql
SERVER=tu_servidor_sql
DATABASE=tu_base_de_datos

# Servidor
PORT=1234
RUTA_CONTENIDOS=uploads

# JWT (opcional)
JWT_SECRET=tu_clave_secreta
```

### 2. Instalar Dependencias

#### Backend:
```bash
cd BACKEND-SC-main
npm install
```

#### Frontend:
```bash
cd SC-REACT-main
npm install
```

### 3. Ejecutar el Proyecto

#### Opción 1 - Por separado:
```bash
# Terminal 1 - Backend
cd BACKEND-SC-main
npm run start:backend

# Terminal 2 - Frontend
cd SC-REACT-main
npm run dev
```

#### Opción 2 - Todo junto (Backend):
```bash
cd BACKEND-SC-main
npm run start:all
```

## 🎯 Cómo Empezar a Desarrollar

### 1. **Familiarízate con la Estructura**
- Explora los archivos `package.json` para entender las dependencias
- Revisa `app.js` para entender el flujo del servidor
- Mira `App.jsx` para entender la estructura del frontend

### 2. **Entiende los Módulos Principales**

#### Backend - Rutas importantes:
- `/routes/login.js` - Autenticación
- `/routes/usuarios.js` - Gestión de usuarios
- `/routes/documentos.js` - Gestión de documentos
- `/routes/contenido.js` - Gestión de contenido

#### Frontend - Páginas principales:
- `/pages/Login/` - Página de login
- `/pages/Administracion/` - Panel de administración
- `/pages/Documentos/` - Gestión de documentos
- `/pages/Conocimiento/` - Base de conocimiento

### 3. **Funcionalidades Clave**

#### WebSockets (Tiempo Real):
- Notificaciones en vivo
- Estado de usuarios conectados
- Comunicación bidireccional

#### Autenticación:
- JWT tokens
- Middleware de validación
- Cookies para sesiones

#### Generación de Documentos:
- Scripts Python para PDF/Excel
- Integración con el backend Node.js

## 🔧 Comandos Útiles

### Backend:
```bash
npm run start:backend        # Producción
npm run start:backend-test   # Desarrollo (con nodemon)
npm run start:all           # Backend + ngrok
```

### Frontend:
```bash
npm run dev                 # Desarrollo
npm run build              # Construir para producción
npm run preview            # Vista previa de producción
```

## 📚 Tecnologías Utilizadas

### Backend:
- **Express.js** - Framework web
- **Socket.IO** - WebSockets
- **MSSQL** - Base de datos
- **JWT** - Autenticación
- **Python** - Scripts adicionales
- **Ngrok** - Túneles para desarrollo

### Frontend:
- **React 19** - Framework UI
- **Vite** - Build tool
- **Bootstrap** - Estilos
- **TipTap** - Editor de texto
- **Recharts** - Gráficos
- **Socket.IO Client** - WebSockets

## 🎨 Primeros Pasos Recomendados

1. **Configura tu entorno** (variables .env)
2. **Ejecuta el proyecto** y familiarízate con la interfaz
3. **Explora el código** empezando por `app.js` y `App.jsx`
4. **Identifica el módulo** que quieres modificar/mejorar
5. **Haz pequeños cambios** para entender el flujo
6. **Usa las herramientas de desarrollo** del navegador

## 🚨 Notas Importantes

- El proyecto usa **ES6 modules** (type: "module")
- La base de datos es **SQL Server**
- El backend corre en puerto **1234** por defecto
- El frontend usa **Vite** en lugar de Create React App
- Hay scripts de **Python integrados** para tareas específicas

## 🆘 Problemas Comunes

1. **Error de conexión a BD**: Verifica las variables de entorno
2. **Puerto ocupado**: Cambia el PORT en .env
3. **CORS errors**: Revisa `acepted_origins` en app.js
4. **Dependencias faltantes**: Ejecuta `npm install`

¡Empieza poco a poco y no tengas miedo de experimentar! 🚀