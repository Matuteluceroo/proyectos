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
    const { userRole } = req.headers;
    
    console.log('🔍 Headers recibidos:', req.headers);
    console.log('🔍 Verificando rol de usuario:', { userRole });
    
    // Para desarrollo: permitir todos los roles de admin
    const rolesPermitidos = ['admin', 'administrador', 'ADMINISTRADOR', 'ADMIN'];
    
    if (!userRole) {
        console.log('❌ No se encontró userRole en headers');
        return res.status(403).json({ 
            success: false,
            error: 'Acceso denegado. No se encontró información de rol.',
            debug: { 
                headersRecibidos: Object.keys(req.headers),
                userRoleRecibido: userRole
            }
        });
    }
    
    if (!rolesPermitidos.includes(userRole)) {
        console.log('❌ Acceso denegado. Rol actual:', userRole);
        return res.status(403).json({ 
            success: false,
            error: 'Acceso denegado. Solo administradores pueden gestionar usuarios.',
            debug: { 
                rolRecibido: userRole, 
                rolesPermitidos,
                esRolValido: false
            }
        });
    }
    
    console.log('✅ Acceso permitido para rol:', userRole);
    next();
};

// GET /api/usuarios - Obtener todos los usuarios
router.get('/', devBypassAuth, (req, res) => {
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
router.get('/:id', devBypassAuth, (req, res) => {
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
router.post('/', devBypassAuth, (req, res) => {
    const { username, email, password, nombre_completo, rol } = req.body;
    
    // Validaciones básicas
    if (!username || !email || !password || !nombre_completo || !rol) {
        return res.status(400).json({
            success: false,
            error: 'Todos los campos son requeridos: username, email, password, nombre_completo, rol'
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
    
    // Verificar si el usuario ya existe
    verificarUsuarioExiste(username, email, (err, existe) => {
        if (err) {
            console.error('❌ Error al verificar usuario:', err);
            return res.status(500).json({ 
                success: false,
                error: 'Error interno del servidor' 
            });
        }
        
        if (existe) {
            return res.status(409).json({
                success: false,
                error: 'Ya existe un usuario con ese username o email'
            });
        }
        
        // Crear el usuario
        crearUsuario({ username, email, password, nombre_completo, rol }, (err, usuarioId) => {
            if (err) {
                console.error('❌ Error al crear usuario:', err);
                res.status(500).json({ 
                    success: false,
                    error: 'Error interno del servidor' 
                });
            } else {
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
router.put('/:id', devBypassAuth, (req, res) => {
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
router.delete('/:id', devBypassAuth, (req, res) => {
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
