import { Router } from 'express'
import { GenerarDocumentoController } from '../controllers/generar_docs.js'

export const generarDOCSRouter = Router()

generarDOCSRouter.post('/excel', GenerarDocumentoController.generarExcel)
generarDOCSRouter.post('/pdf', GenerarDocumentoController.generarPdf)
generarDOCSRouter.post('/parte', GenerarDocumentoController.generarPartePDF)

generarDOCSRouter.get('/comparativos', GenerarDocumentoController.obtenerComparativos)
generarDOCSRouter.post('/comparativos/marcar-cargado', GenerarDocumentoController.marcarComoCargado)
generarDOCSRouter.post('/comparativos/quitar-cargado', GenerarDocumentoController.desmarcarCargado)

generarDOCSRouter.post('/sugerencias', GenerarDocumentoController.nuevaSugerencia)
generarDOCSRouter.get('/sugerencias', GenerarDocumentoController.leerSugerencias)
