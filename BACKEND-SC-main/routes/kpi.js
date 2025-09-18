import { Router } from 'express'
import { validateToken } from '../middleware/jwt.js'
import { KpiController } from '../controllers/kpi.js'

export const kpiRouter = Router()

// KPIs
kpiRouter.get('/total-contenidos', validateToken, KpiController.totalContenidos)
kpiRouter.get('/contenidos-por-mes', validateToken, KpiController.contenidosPorMes)
kpiRouter.get('/contenidos-por-tipo', validateToken, KpiController.contenidosPorTipo)
kpiRouter.get('/top-tags', validateToken, KpiController.topTags)
kpiRouter.get('/contenidos-por-usuario', validateToken, KpiController.contenidosPorUsuario)
kpiRouter.get('/promedio-tags', validateToken, KpiController.promedioTags)
kpiRouter.get('/cobertura-tematica', validateToken, KpiController.coberturaTematica)



// import { Router } from 'express'
// import { validateToken } from '../middleware/jwt.js'
// import { KpiController } from '../controllers/kpi.js'

// export const kpiRouter = Router()

// // ----- Contenido
// kpiRouter.get('/contenidos/publicados', validateToken, KpiController.contenidosPublicados)
// kpiRouter.get('/contenidos/por-tipo', validateToken, KpiController.contenidosPorTipo)
// kpiRouter.get('/contenidos/cobertura-tags', validateToken, KpiController.coberturaTags)
// kpiRouter.get('/contenidos/frios', validateToken, KpiController.contenidosFrios)            // ?days=90 (default)
// kpiRouter.get('/contenidos/top', validateToken, KpiController.topContenidos)                // ?days=30&top=10

// // ----- Uso / Engagement
// kpiRouter.get('/mau', validateToken, KpiController.mau)                                     // ?days=30
// kpiRouter.get('/consultas-por-usuario-activo', validateToken, KpiController.consultasPorUsuarioActivo) // ?days=30
// kpiRouter.get('/tags/engagement', validateToken, KpiController.engagementPorTag)           // ?days=30&top=20

// // ----- Entrenamientos
// kpiRouter.get('/entrenamientos/inscritos', validateToken, KpiController.inscritosPorEntrenamiento)
// kpiRouter.get('/entrenamientos/estados', validateToken, KpiController.estadosPorEntrenamiento)
// kpiRouter.get('/entrenamientos/finalizacion-por-rol', validateToken, KpiController.finalizacionPorRol)
