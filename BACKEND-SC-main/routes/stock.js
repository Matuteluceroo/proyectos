import { Router } from 'express';
import { StockController } from '../controllers/stock.js';
import { validateToken } from '../middleware/jwt.js';

export const stockRouter = Router();

// Define las rutas y asocia los controladores
stockRouter.get('/', validateToken, StockController.getAll) // Obtener licitacion con id
stockRouter.get('/:idLicitacion', validateToken, StockController.getByIdLicitacion) // Obtener licitacion con id
