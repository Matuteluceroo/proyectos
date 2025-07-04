import { Router } from 'express';
import { DocumentoController } from '../controllers/documentos.js';
import { validateToken } from '../middleware/jwt.js';

export const documentosRouter = Router();

documentosRouter.post('/', validateToken, DocumentoController.crear);
documentosRouter.get('/buscar', validateToken, DocumentoController.buscar);
documentosRouter.get('/:id', validateToken, DocumentoController.getByID);
