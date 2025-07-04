import { Router } from 'express';
import { KTCController } from '../controllers/kairos.js';
import { validateToken } from '../middleware/jwt.js'

export const KTCRouter = Router();

// Define las rutas y asocia los controladores

KTCRouter.post('/lista', validateToken, KTCController.agregarListaProductoKairos)
KTCRouter.patch('/lista', validateToken, KTCController.modificarListaProductoKairos)

KTCRouter.get('/tarot/:codTarot', validateToken, KTCController.getByCodTarot)
KTCRouter.get('/tango/:codTango', validateToken, KTCController.getByCodTango)
KTCRouter.get('/anmat/:codAnmat', validateToken, KTCController.getByCodAnmat)
KTCRouter.get('/cod_kairos/:codKairos', validateToken, KTCController.getByCodKairos)
KTCRouter.get('/laboratorio/:laboratorio', validateToken, KTCController.getByLaboratorio)
KTCRouter.get('/droga/:droga_presentacion', validateToken, KTCController.getByDroga)

KTCRouter.get('/', validateToken, KTCController.getAll)
KTCRouter.post('/', validateToken, KTCController.agregarProductoKairos)
KTCRouter.patch('/:idKairos', validateToken, KTCController.modificarProductoKairos)
KTCRouter.delete('/:idKairos', validateToken, KTCController.eliminarProductoKairos)

KTCRouter.get('/:idKairos', validateToken, KTCController.getByIdKairos)