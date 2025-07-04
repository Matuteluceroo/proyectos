import { Router } from 'express';
import { RealesController } from '../controllers/reales.js';
import { validateToken } from '../middleware/jwt.js';

export const realesRouter = Router();

// Define las rutas y asocia los controladores
realesRouter.get('/', validateToken, RealesController.getAll) 
realesRouter.get('/licitacion/:idLicitacion', validateToken, RealesController.getByIdLicitacion)
realesRouter.get('/renglon/:idRenglon', validateToken, RealesController.getByRenglon)

realesRouter.post('/', validateToken, RealesController.agregarNuevoReal) 
realesRouter.delete('/:idReal', validateToken, RealesController.eliminarReal) 
realesRouter.patch('/:idReal', validateToken, RealesController.modificarReal)
