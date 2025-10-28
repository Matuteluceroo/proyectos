# 🔧 Corrección de Error CORS - Usuarios API

## 🚨 **Problema Identificado**

Error CORS al intentar crear usuarios:
```
Access to fetch at 'http://localhost:5000/api/usuarios' from origin 'http://localhost:5173' 
has been blocked by CORS policy: Request header field userrole is not allowed by 
Access-Control-Allow-Headers in preflight response.
```

## ✅ **Soluciones Implementadas**

### 1. **Configuración CORS Actualizada** (`backend/app.js`)
```javascript
// ✅ DESPUÉS: Headers personalizados permitidos
allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'userRole',     // 🔧 Header personalizado para rol de usuario
    'userrole'      // 🔧 Alias por compatibilidad
]
```

### 2. **Frontend con Cookies** (`frontend/src/services/usuariosAPI.js`)
```javascript
// ✅ Todas las peticiones ahora incluyen cookies
const response = await fetch(`${API_BASE_URL}/usuarios`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include', // 🍪 Incluir cookies para autenticación
    body: JSON.stringify(datosUsuario)
});
```

### 3. **Middleware de Autenticación Mejorado** (`backend/routes/usuarios.js`)
```javascript
// ✅ Verificación basada en usuario autenticado (no headers)
const verificarAdmin = (req, res, next) => {
    const usuarioAuth = req.user; // Viene de devBypassAuth o JWT
    const rolUsuario = usuarioAuth.rol || usuarioAuth.role;
    
    if (!rolesPermitidos.includes(rolUsuario)) {
        return res.status(403).json({ error: 'Solo administradores...' });
    }
    next();
};
```

### 4. **Rutas Protegidas Correctamente**
```javascript
// ✅ Todas las rutas de usuarios ahora tienen doble protección
router.get('/', devBypassAuth, verificarAdmin, (req, res) => { ... });
router.post('/', devBypassAuth, verificarAdmin, (req, res) => { ... });
router.put('/:id', devBypassAuth, verificarAdmin, (req, res) => { ... });
router.delete('/:id', devBypassAuth, verificarAdmin, (req, res) => { ... });
```

## 🔍 **Flujo de Autenticación Corregido**

### Antes (Problemático):
1. Frontend envía header `userRole` ❌
2. CORS bloquea la petición ❌
3. Backend nunca recibe la petición ❌

### Después (Correcto):
1. Usuario hace login → recibe cookie httpOnly ✅
2. Frontend incluye `credentials: 'include'` ✅
3. CORS permite headers personalizados ✅
4. Backend recibe cookie y header `userRole` ✅
5. `devBypassAuth` establece `req.user` ✅
6. `verificarAdmin` valida rol del usuario ✅
7. Ruta ejecuta la funcionalidad ✅

## 🧪 **Cómo Probar**

### 1. **Reiniciar Backend**
```bash
cd backend
node app.js
```

### 2. **Probar Login en Frontend**
- Usuario: `admin` / Contraseña: `123456`
- Verificar que se establece cookie en DevTools

### 3. **Probar Gestión de Usuarios**
- Ir a `/usuarios` en el frontend
- Intentar crear nuevo usuario
- Debería funcionar sin errores CORS

### 4. **Verificar Headers en DevTools**
```
Network → XHR → usuarios → Headers
✅ Request Headers debe incluir: Cookie: token=...
✅ Request Headers debe incluir: userRole: admin
✅ Response Headers: Access-Control-Allow-Headers debe incluir userRole
```

## 🔒 **Seguridad Mantenida**

- ✅ **Cookies httpOnly**: Tokens seguros, no accesibles por JavaScript
- ✅ **CORS restrictivo**: Solo orígenes específicos permitidos
- ✅ **Verificación de roles**: Solo admins pueden gestionar usuarios
- ✅ **Headers controlados**: Solo headers específicos permitidos

## 🚨 **Troubleshooting**

### Si sigue apareciendo error CORS:
1. Limpiar cache del navegador
2. Verificar que el backend esté corriendo
3. Verificar CORS en DevTools Network

### Si los usuarios no se crean:
1. Verificar que el usuario esté logueado como admin
2. Verificar cookie en DevTools Application tab
3. Revisar logs del backend para errores específicos

### Si aparece error 403:
1. Verificar que el usuario tenga rol 'admin' o 'administrador'
2. Verificar que `devBypassAuth` esté funcionando
3. Revisar estructura del objeto `req.user`

---

## 📝 **Resumen de Archivos Modificados**

- ✏️ `backend/app.js` - CORS headers permitidos
- ✏️ `frontend/src/services/usuariosAPI.js` - Credentials include
- ✏️ `backend/routes/usuarios.js` - Middleware de verificación
- ✏️ `backend/middleware/jwt.js` - Estructura usuario completa
- 🆕 `backend/test-usuarios-api.js` - Script de pruebas

¡El error CORS está resuelto y la gestión de usuarios debería funcionar correctamente! 🎉