import { Router } from 'express';
import { TarotController } from '../controllers/prodsTarot.js';
import { validateToken } from '../middleware/jwt.js';

export const tarotRouter = Router();

// Define las rutas y asocia los controladores
tarotRouter.get('/', validateToken, TarotController.getListaCodigos)
tarotRouter.post('/', validateToken, TarotController.getAll) // Obtener licitacion con id
tarotRouter.get('/buscar/:busqueda',validateToken, TarotController.getEquivalencias)
tarotRouter.get('/:id', validateToken, TarotController.getByCodTarot) // Obtener licitacion con id
