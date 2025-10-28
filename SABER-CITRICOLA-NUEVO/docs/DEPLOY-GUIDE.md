# 🚀 Guía de Deploy: Vercel + Railway

## 🎯 Resumen del Deploy
- **Frontend**: Vercel (React/Vite)
- **Backend**: Railway (Node.js/Express)
- **Base de Datos**: SQLite (incluida en Railway)

## 📋 Pre-requisitos
- [ ] Cuenta en [Vercel](https://vercel.com)
- [ ] Cuenta en [Railway](https://railway.app)
- [ ] Repositorio en GitHub
- [ ] Variables de entorno configuradas

## 🔧 Paso 1: Preparación del Código

### Backend (Railway)
```bash
cd backend
# Variables de entorno necesarias en Railway:
NODE_ENV=production
PORT=$PORT  # Railway lo asigna automáticamente
JWT_SECRET=tu-jwt-secret-super-seguro
FRONTEND_URL=https://tu-app.vercel.app
```

### Frontend (Vercel)
```bash
cd frontend
# Variables de entorno necesarias en Vercel:
NODE_ENV=production
VITE_API_URL=https://tu-backend.up.railway.app
```

## 🚂 Paso 2: Deploy Backend en Railway

1. **Conectar repositorio**:
   - Ve a [Railway.app](https://railway.app)
   - Click "Start a New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio

2. **Configurar proyecto**:
   - Selecciona la carpeta `backend`
   - Railway detectará Node.js automáticamente

3. **Variables de entorno**:
   ```
   NODE_ENV=production
   JWT_SECRET=tu-secreto-jwt-aqui
   FRONTEND_URL=https://tu-app.vercel.app
   ```

4. **Deploy automático**:
   - Railway construirá y desplegará automáticamente
   - Obtendrás una URL como: `https://tu-proyecto.up.railway.app`

## 🌐 Paso 3: Deploy Frontend en Vercel

1. **Conectar repositorio**:
   - Ve a [Vercel.com](https://vercel.com)
   - Click "Import Project"
   - Selecciona tu repositorio de GitHub

2. **Configurar build**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Variables de entorno**:
   ```
   NODE_ENV=production
   VITE_API_URL=https://tu-backend.up.railway.app
   ```

4. **Deploy**:
   - Vercel construirá y desplegará automáticamente
   - Obtendrás una URL como: `https://tu-app.vercel.app`

## 🔄 Paso 4: Actualizar CORS

Una vez que tengas las URLs de producción:

1. **Actualizar backend** en Railway:
   ```
   FRONTEND_URL=https://tu-app-real.vercel.app
   ```

2. **Redeploy** para aplicar cambios

## ✅ Paso 5: Verificación

- [ ] Backend responde en Railway URL
- [ ] Frontend carga en Vercel URL  
- [ ] Login funciona correctamente
- [ ] CORS permite comunicación
- [ ] Variables de entorno están configuradas

## 🔧 Comandos Útiles

```bash
# Verificar build local
cd frontend && npm run build:prod
cd backend && npm start

# Actualizar URLs de API
cd frontend && npm run update-api
```

## 🐛 Solución de Problemas

### CORS Error
- Verificar `FRONTEND_URL` en Railway
- Confirmar que Vercel URL es correcta

### Build Error en Vercel
- Verificar que `dist` folder se genera
- Revisar logs de build en Vercel

### 500 Error en Railway  
- Revisar logs en Railway dashboard
- Verificar variables de entorno

## 🔄 Deploys Automáticos

Ambas plataformas re-deployean automáticamente en cada push a `main`:
- **Railway**: Detecta cambios en `/backend`
- **Vercel**: Detecta cambios en `/frontend`