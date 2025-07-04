import { Router } from 'express'
import { LogisticaController } from '../controllers/logistica.js'
import { validateToken } from '../middleware/jwt.js'

export const logisticaRouter = Router()

logisticaRouter.post('/agregar_remito_hoja', validateToken, LogisticaController.agregarRemitoHoja)
logisticaRouter.post('/crear_hoja_ruta', validateToken, LogisticaController.crearHojaRuta)
logisticaRouter.get('/partes_deposito/:deposito', validateToken, LogisticaController.obtenerPartesEntrega)
logisticaRouter.get('/partes/:nro_hoja_ruta', validateToken, LogisticaController.obtenerPartesEntregaByNro)
logisticaRouter.get('/conductores', validateToken, LogisticaController.obtenerConductores)
logisticaRouter.get('/estado_remito', validateToken, LogisticaController.obtenerEstadoRemito)
// logisticaRouter.patch('/actualizarEstadoRemito/:nro_remito', validateToken, LogisticaController.actualizarEstadoRemito)
logisticaRouter.post('/agregar_nroseguimiento', validateToken, LogisticaController.agregarNroSeguimiento)
logisticaRouter.post('/agregar_observacion', validateToken, LogisticaController.agregarObservaciones)
logisticaRouter.get('/remitos', validateToken, LogisticaController.obtenerRemitos)
logisticaRouter.get('/remitos/pendientes', validateToken, LogisticaController.obtenerRemitosPendientes)
logisticaRouter.get('/remitos/articulos/:nro_remito', validateToken, LogisticaController.obtenerArticulosByRemito)
logisticaRouter.get('/remitos/:nro_parte', validateToken, LogisticaController.obtenerRemitosByParte)
logisticaRouter.delete('/eliminar_parte/:nro_hoja_ruta', validateToken, LogisticaController.eliminarParteEntrega)


logisticaRouter.get('/obtener-foto/:nro_remito', validateToken, LogisticaController.obtenerImagen)
logisticaRouter.post('/guardar-foto', validateToken, LogisticaController.subirImagen)
