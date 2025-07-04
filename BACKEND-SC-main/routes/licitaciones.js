import { Router } from 'express'
import { LicitacionController } from '../controllers/licitaciones.js'
import { validateToken } from '../middleware/jwt.js'

export const licitacionesRouter = Router()

// Define las rutas y asocia los controladores
licitacionesRouter.get('/', validateToken, LicitacionController.getAll) // Obtener todas las licitaciones
licitacionesRouter.get('/:idLicitacion', validateToken, LicitacionController.getByID) // Obtener licitacion con id
licitacionesRouter.post('/', validateToken, LicitacionController.create) // Crear una nueva licitacion
licitacionesRouter.delete('/:idLicitacion', validateToken, LicitacionController.eliminarLicitacion) // Eliminar una licitacion por ID
licitacionesRouter.patch('/:idLicitacion', validateToken, LicitacionController.modificarLicitacion) // Actualizar una licitacion por ID

licitacionesRouter.get('/zona/:idZona', validateToken, LicitacionController.obtenerLicitacionesZona)
licitacionesRouter.get('/provincia/:provincia', validateToken, LicitacionController.obtenerLicitacionesProvincia)
licitacionesRouter.get('/usuario/:idUsuario', validateToken, LicitacionController.obtenerLicitacionesUsuario)
licitacionesRouter.get('/usuarios-licitacion/:idLicitacion', validateToken, LicitacionController.obtenerUsuariosLicitacion)
