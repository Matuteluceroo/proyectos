import express from 'express';
import { 
    obtenerTodosUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    verificarUsuarioExiste
} from '../database-citricola.js';
import { devBypassAuth } from '../middleware/jwt.js';

const router = express.Router();

// Middleware para verificar que el usuario es admin
const verificarAdmin = (req, res, next) => {
    // Primero verificar si hay usuario autenticado (por devBypassAuth o token real)
    const usuarioAuth = req.user;
    if (!usuarioAuth) {
        return res.status(401).json({ 
            success: false,
            error: 'No autenticado. Se requiere login.' 
        });
    }

    // Verificar rol del usuario autenticado
    const rolUsuario = usuarioAuth.rol || usuarioAuth.role;
    console.log('🔍 Verificando rol de usuario:', { rolUsuario, usuario: usuarioAuth });
    
    // Para desarrollo: permitir todos los roles de admin
    const rolesPermitidos = ['admin', 'administrador', 'ADMINISTRADOR', 'ADMIN'];
    
    if (!rolesPermitidos.includes(rolUsuario)) {
        console.log('❌ Acceso denegado. Rol actual:', rolUsuario);
        return res.status(403).json({ 
            success: false,
            error: 'Acceso denegado. Solo administradores pueden gestionar usuarios.',
            debug: { 
                rolRecibido: rolUsuario, 
                rolesPermitidos,
                esRolValido: false
            }
        });
    }
    
    console.log('✅ Acceso permitido para rol:', rolUsuario);
    next();
};

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', devBypassAuth, verificarAdmin, (req, res) => {
    console.log('🎯 GET /api/usuarios - Iniciando consulta');
    obtenerTodosUsuarios((err, usuarios) => {
        if (err) {
            console.error('❌ Error al obtener usuarios:', err);
            res.status(500).json({ 
                success: false,
                error: 'Error interno del servidor' 
            });
        } else {
            console.log('✅ Usuarios obtenidos:', usuarios.length);
            res.json({
                success: true,
                mensaje: 'Lista de usuarios obtenida correctamente',
                data: usuarios
            });
        }
    });
});

// GET /api/usuarios/:id - Obtener usuario por ID
router.get('/:id', devBypassAuth, verificarAdmin, (req, res) => {
    const { id } = req.params;
    
    obtenerUsuarioPorId(id, (err, usuario) => {
        if (err) {
            console.error('❌ Error al obtener usuario:', err);
            res.status(500).json({ 
                success: false,
                error: 'Error interno del servidor' 
            });
        } else if (usuario) {
            res.json({
                success: true,
                mensaje: 'Usuario encontrado',
                data: usuario
            });
        } else {
            res.status(404).json({ 
                success: false,
                error: 'Usuario no encontrado' 
            });
        }
    });
});

// POST /api/usuarios - Crear nuevo usuario
router.post('/', devBypassAuth, verificarAdmin, (req, res) => {
    console.log('\n🎯 POST /api/usuarios - Iniciando creación de usuario');
    console.log('📥 Body recibido:', req.body);
    console.log('👤 Usuario autenticado:', req.user);
    
    const { username, email, password, nombre_completo, rol } = req.body;
    
    // Validaciones básicas
    if (!username || !email || !password || !nombre_completo || !rol) {
        console.log('❌ Faltan campos requeridos');
        return res.status(400).json({
            success: false,
            error: 'Todos los campos son requeridos: username, email, password, nombre_completo, rol'
        });
    }
    
    // Verificar que el rol sea válido
    const rolesValidos = ['admin', 'experto', 'operador'];
    if (!rolesValidos.includes(rol)) {
        console.log('❌ Rol inválido:', rol);
        return res.status(400).json({
            success: false,
            error: 'Rol inválido. Debe ser: admin, experto o operador'
        });
    }
    
    console.log('✅ Validaciones básicas pasadas');
    
    // Verificar si el usuario ya existe
    console.log('🔍 Verificando si el usuario existe...');
    verificarUsuarioExiste(username, email, (err, existe) => {
        if (err) {
            console.error('❌ Error al verificar usuario:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error interno del servidor' 
            });
        }
        
        console.log('📊 Usuario existe:', existe);
        
        if (existe) {
            console.log('⚠️ Usuario ya existe');
            return res.status(409).json({
                success: false,
                error: 'Ya existe un usuario con ese username o email'
            });
        }
        
        // Crear el usuario
        console.log('🔧 Creando usuario...');
        crearUsuario({ username, email, password, nombre_completo, rol }, (err, usuarioId) => {
            if (err) {
                console.error('❌ Error al crear usuario:', err);
                console.error('❌ Error completo:', {
                    message: err.message,
                    code: err.code,
                    errno: err.errno,
                    stack: err.stack
                });
                res.status(500).json({ 
                    success: false,
                    error: 'Error interno del servidor' 
                });
            } else {
                console.log('✅ Usuario creado exitosamente con ID:', usuarioId);
                res.status(201).json({
                    success: true,
                    mensaje: 'Usuario creado correctamente',
                    data: { id: usuarioId, username, email, nombre_completo, rol }
                });
            }
        });
    });
});

// PUT /api/usuarios/:id - Actualizar usuario
router.put('/:id', devBypassAuth, verificarAdmin, (req, res) => {
    const { id } = req.params;
    const { username, email, password, nombre_completo, rol } = req.body;
    
    // Validaciones básicas
    if (!username || !email || !nombre_completo || !rol) {
        return res.status(400).json({
            success: false,
            error: 'Los campos username, email, nombre_completo y rol son requeridos'
        });
    }
    
    // Verificar que el rol sea válido
    const rolesValidos = ['admin', 'experto', 'operador'];
    if (!rolesValidos.includes(rol)) {
        return res.status(400).json({
            success: false,
            error: 'Rol inválido. Debe ser: admin, experto o operador'
        });
    }
    
    const datosActualizacion = { username, email, nombre_completo, rol };
    if (password && password.trim()) {
        datosActualizacion.password = password;
    }
    
    actualizarUsuario(id, datosActualizacion, (err, actualizado) => {
        if (err) {
            console.error('❌ Error al actualizar usuario:', err);
            res.status(500).json({ 
                success: false,
                error: 'Error interno del servidor' 
            });
        } else if (actualizado) {
            res.json({
                success: true,
                mensaje: 'Usuario actualizado correctamente',
                data: { id, ...datosActualizacion }
            });
        } else {
            res.status(404).json({ 
                success: false,
                error: 'Usuario no encontrado' 
            });
        }
    });
});

// DELETE /api/usuarios/:id - Eliminar usuario
router.delete('/:id', devBypassAuth, verificarAdmin, (req, res) => {
    const { id } = req.params;
    
    eliminarUsuario(id, (err, eliminado) => {
        if (err) {
            console.error('❌ Error al eliminar usuario:', err);
            res.status(500).json({ 
                success: false,
                error: 'Error interno del servidor' 
            });
        } else if (eliminado) {
            res.json({
                success: true,
                mensaje: 'Usuario eliminado correctamente'
            });
        } else {
            res.status(404).json({ 
                success: false,
                error: 'Usuario no encontrado' 
            });
        }
    });
});

export default router;
