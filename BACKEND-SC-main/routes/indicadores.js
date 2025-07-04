import { Router } from 'express'
import { IndicadoresController } from '../controllers/indicadores.js'
import { validateToken } from '../middleware/jwt.js'

export const indicadoresRouter = Router()

indicadoresRouter.get('/stocklive', validateToken, IndicadoresController.Stock)

// Licitaciones por agrupaciones
indicadoresRouter.post('/licitacion_provincia', validateToken, IndicadoresController.CantidadLicitacionXProvincia)
indicadoresRouter.post('/licitacion_region', validateToken, IndicadoresController.CantidadLicitacionXRegion)
// indicadoresRouter.post('/licitacion_estado', validateToken, IndicadoresController.CantidadLicitacionXEstado) en el futuro quizas sirve
indicadoresRouter.post('/licitacion_usuario', validateToken, IndicadoresController.CantidadLicitacionXUsuario)

// Licitaciones por mes
indicadoresRouter.get('/licitacion_porcentaje/:fecha?', validateToken, IndicadoresController.participacionMesVsAnterior)

// Historial
indicadoresRouter.get('/licitaciones_provincia_historial/:fecha?', validateToken, IndicadoresController.CantidadLicitacionXProvinciaHistorial)

// Laboratorios
indicadoresRouter.post('/laboratorios_top', validateToken, IndicadoresController.ObtenerResumenLaboratorios)

// Productos
indicadoresRouter.post('/productos_top', validateToken, IndicadoresController.ObtenerResumenProductos)
indicadoresRouter.post('/producto_dispersion', validateToken, IndicadoresController.ObtenerProductosDispersion)

//cobranza
//indicadoresRouter.post('/deudas_pendiente_cliente_Fecha', validateToken, IndicadoresController.ObtenerDeudaClienteFecha)
indicadoresRouter.post('/deudas_pendiente_cliente', validateToken, IndicadoresController.ObtenerDeudaCliente)
indicadoresRouter.post('/deudas_pendiente_provincia', validateToken, IndicadoresController.ObtenerDeudaProvincia)