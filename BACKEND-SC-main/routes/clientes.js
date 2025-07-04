import { Router } from 'express';
import { ClienteController } from '../controllers/clientes.js';
import { validateToken } from '../middleware/jwt.js';

export const clientesRouter = Router();

// Define las rutas y asocia los controladores
clientesRouter.get('/', validateToken, ClienteController.getAll)
clientesRouter.get('/cod-cliente/:cod', validateToken, ClienteController.getByCodCliente)
clientesRouter.get('/zona/:idZona', validateToken, ClienteController.getByIDZona)
clientesRouter.get('/provincia/:provincia', validateToken, ClienteController.getByProvincia)
