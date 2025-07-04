import { Router } from 'express';
import { FacturasController } from '../controllers/facturas.js';
import { validateToken } from '../middleware/jwt.js';

export const facturasRouter = Router();

// Define las rutas y asocia los controladores
//facturasRouter.get('/provincia/:nombreProvincia', validateToken, FacturasController.getByProvincia)
//facturasRouter.get('/zona/:idZona', validateToken, FacturasController.getByIdZona)
facturasRouter.post('/provincias/', validateToken, FacturasController.getByProvincias) // SE USA
//facturasRouter.get('/observaciones/:nroFactura', validateToken, FacturasController.getObservacionesFactura)
facturasRouter.post('/observaciones/', validateToken , FacturasController.agregarObservacion)  // SE USA
facturasRouter.post('/observaciones_masivo/', validateToken , FacturasController.agregarObservacionesMasivo)  // SE USA
//facturasRouter.delete('/observaciones/:nroFactura/:fecha_modificacion', validateToken, FacturasController.eliminarObservacion)
//facturasRouter.get('/documentos/:nroFactura', validateToken, FacturasController.getDocumentosFactura)
//facturasRouter.get('/negativos/', validateToken, FacturasController.getImportesNegativos)
//facturasRouter.post('/filtros/', validateToken, FacturasController.getFacturasConFiltros)



facturasRouter.get('/', validateToken , FacturasController.getAll) // SE USA
facturasRouter.get('/:nro_factura', validateToken, FacturasController.getByNroFactura)  // SE USA

