import { Router } from 'express';
import { ComprasController } from '../controllers/compras.js';
import { validateToken } from '../middleware/jwt.js';

export const comprasRouter = Router();


// Define las rutas y asocia los controladores
comprasRouter.get('/', validateToken, ComprasController.getAll) // Obtener todas las licitaciones
comprasRouter.get('/lista-kairos/', validateToken, ComprasController.getListaKairos)
comprasRouter.post('/lista-kairos/', validateToken, ComprasController.filtrarListaKairos)
comprasRouter.get('/lista-kairos/no-asociados/',validateToken, ComprasController.getRenglonesNoAsociados)

// Por licitación
comprasRouter.get('/licitacion/:idLicitacion', validateToken, ComprasController.getByIDLicitacion) // Obtener licitacion con id
comprasRouter.post('/licitacion/:idLicitacion', validateToken, ComprasController.crearComprasLicitacion)

// Cotizaciones Históricas
comprasRouter.get('/cotizaciones-hist/', validateToken, ComprasController.getAllCotizacionesHistoricas)
comprasRouter.get('/cotizaciones-hist/licitacion/:idLicitacion', validateToken, ComprasController.getCotizacionesHistoricasByIDlicitacion) // Obtener licitacion con id
comprasRouter.get('/cotizaciones-hist/codTarot/:idLicitacion', validateToken, ComprasController.getCotizacionesHistoricasByCodTarot) // Obtener licitacion con id

// Por compra
comprasRouter.get('/:idCompra', validateToken, ComprasController.getByIDCompra)
comprasRouter.post('/', validateToken, ComprasController.crearCompra) // Crear una nueva licitacion
comprasRouter.delete('/:idCompra', validateToken, ComprasController.eliminarCompra) // Eliminar una licitacion por ID
comprasRouter.patch('/:idCompra', validateToken, ComprasController.modificarCompra) // Actualizar una licitacion por ID

