import { Router } from 'express'
import { RenglonController } from '../controllers/renglones.js'
import { validateToken } from '../middleware/jwt.js'

export const renglonesRouter = Router()

// Define las rutas y asocia los controladores
renglonesRouter.get('/', validateToken, RenglonController.getAll)

// RENGLONES POR LICITACION
renglonesRouter.get('/licitacion/:id', validateToken, RenglonController.getByIDLicitacion) // Obtiene todos los renglones de una licitación
renglonesRouter.post('/licitacion/:idLicitacion', validateToken, RenglonController.crearRenglonesLicitacion) // Agrega varios renglones a una licitación
renglonesRouter.delete('/licitacion/:idLicitacion', validateToken, RenglonController.eliminarRenglonesLicitacion) // Elimina todos los renglones de una licitación
renglonesRouter.patch('/licitacion/:idLicitacion', validateToken, RenglonController.modificarRenglonesLicitacion )
renglonesRouter.patch('/licitacion/preganados/:idLicitacion', validateToken, RenglonController.modificarPreganadosRenglonesLicitacion )

// RENGLONES ALTERNATIVOS
// renglonesRouter.get('/alternativos/:idLicitacion')
renglonesRouter.post('/alternativo/:idLicitacion', validateToken, RenglonController.crearRenglonAlternativo)

// LOS RENGLONES YA TIENEN ID!
// RENGLONES INDIVIDUALES
renglonesRouter.get('/:idRenglon', validateToken, RenglonController.getByIDRenglon) // Obtiene un renglón por id
renglonesRouter.get('/:idLicitacion/:nroRenglon/:alternativo', validateToken, RenglonController.getRenglon) // Obtiene un renglón por idLic, nroReng y alt
renglonesRouter.post('/:idLicitacion', validateToken, RenglonController.crearRenglon) // Agrega un renglón con id de la lic
renglonesRouter.delete('/:idRenglon', validateToken, RenglonController.eliminarRenglon) // Elimina un renglón por id
renglonesRouter.patch('/:idLicitacion/:idRenglon', validateToken, RenglonController.modificarRenglon) // Modifica un renglón por id (SIRVE PARA PASO 1 y PASO 3)