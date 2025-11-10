import { Router } from 'express';
import {UsuarioController} from '../controllers/usuarios.js'
import { validateToken } from '../middleware/jwt.js';

export const usuariosRouter = Router();

// Define las rutas y asocia los controladores
usuariosRouter.get('/', validateToken, UsuarioController.getAll)
usuariosRouter.get('/:id', validateToken, UsuarioController.getById); // Buscar
usuariosRouter.get('/user/:userName', validateToken, UsuarioController.buscarUsuario); // Buscar un usuario por userName
usuariosRouter.post('/', validateToken, UsuarioController.create); // Crear una nuevo usuario
usuariosRouter.delete('/:id', validateToken, UsuarioController.delete); // Eliminar una licitacion por ID
usuariosRouter.patch('/:id', validateToken, UsuarioController.update); // Actualizar una licitacion por ID

///usuarios/change-password/
usuariosRouter.patch('/change-password/:id', validateToken, UsuarioController.updatePassword); // Actualizar una licitacion por ID
usuariosRouter.patch('/restart-password/:id', validateToken, UsuarioController.restartPassword)
usuariosRouter.post('/roles/:idUsuario', validateToken, UsuarioController.agregarRolUsuario)
usuariosRouter.delete('/roles/:idUsuario', validateToken, UsuarioController.eliminarRolUsuario)

usuariosRouter.get('/obtener-foto/:idUsuario', validateToken, UsuarioController.obtenerImagen)
usuariosRouter.post('/guardar-foto', validateToken, UsuarioController.subirImagen)
usuariosRouter.delete('/eliminar-foto/:idUsuario', validateToken, UsuarioController.eliminarImagen)

// 🔹 Nueva ruta: obtener los 10 tags más usados
usuariosRouter.get("/tags/top", validateToken, UsuarioController.getTopTags);
