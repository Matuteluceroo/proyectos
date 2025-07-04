import { IndicadoresModel } from '../models/indicadores.js'

function buildDateRange(fecha) {
    if (!/^\d{4}-\d{2}$/.test(fecha)) {
        throw new Error('anioMes debe tener formato YYYY-MM')
    }
    const [y, m] = fecha.split('-').map(Number)
    const fechaIni = `${y}-${String(m).padStart(2, '0')}-01`
    const fechaFin = m === 12
        ? `${y + 1}-01-01`
        : `${y}-${String(m + 1).padStart(2, '0')}-01`
    return { fechaIni, fechaFin }
}

function anioMesActual() {
    const hoy = new Date()
    const y = hoy.getFullYear()
    const m = String(hoy.getMonth() + 1).padStart(2, '0')
    return `${y}-${m}`
}

export class IndicadoresController {
    //licitaciones

    static async Stock(req, res) {
        try {
            const data_kpi = await IndicadoresModel.stock()
            if (data_kpi.length === 0) return res.status(404).json({ mensaje: 'No hay licitaciones almacenadas' })

            return res.json(data_kpi)
        } catch (e) {
            console.log("ERROR: ", e)
            return res.status(404).json({ mensaje: 'Ocurrió un error en Indicadores', error: e.message })
        }
    }

    static async CantidadLicitacionXProvincia(req, res) {
        try {
            const { fechaDesde, fechaHasta } = req.body

            if (!fechaDesde || !fechaHasta) {
                return res.status(400).json({ mensaje: "Debe enviar fechaDesde y fechaHasta" })
            }

            const data_kpi = await IndicadoresModel.cantidadLicitacionXProvincia(fechaDesde, fechaHasta)

            if (data_kpi.length === 0) {
                return res.status(404).json({ mensaje: 'No hay licitaciones en ese rango de fechas' })
            }

            return res.json(data_kpi)
        } catch (e) {
            console.log("ERROR: ", e)
            return res.status(500).json({ mensaje: 'Ocurrió un error en Indicadores', error: e.message })
        }
    }

    static async CantidadLicitacionXRegion(req, res) {
        try {
            const { fechaDesde, fechaHasta } = req.body

            if (!fechaDesde || !fechaHasta) {
                return res.status(400).json({ mensaje: "Debe enviar fechaDesde y fechaHasta" })
            }

            const data_kpi = await IndicadoresModel.cantidadLicitacionXRegion(fechaDesde, fechaHasta)

            if (data_kpi.length === 0) {
                return res.status(404).json({ mensaje: 'No hay licitaciones almacenadas' })
            }

            return res.json(data_kpi)
        } catch (e) {
            console.log("ERROR: ", e)
            return res.status(500).json({ mensaje: 'Ocurrió un error en Indicadores', error: e.message })
        }
    }

    // static async CantidadLicitacionXEstado(req, res) {
    //     try {
    //         const data_kpi = await IndicadoresModel.cantidadLicitacionXEstado()
    //         if (data_kpi.length === 0) return res.status(404).json({ mensaje: 'No hay licitaciones almacenadas' })

    //         return res.json(data_kpi)
    //     } catch (e) {
    //         console.log("ERROR: ", e)
    //         return res.status(404).json({ mensaje: 'Ocurrió un error en Indicadores', error: e.message })
    //     }
    // }

    static async CantidadLicitacionXUsuario(req, res) {
        try {
            const { fechaDesde, fechaHasta } = req.body

            if (!fechaDesde || !fechaHasta) {
                return res.status(400).json({ mensaje: "Debe enviar fechaDesde y fechaHasta" })
            }
            const data_kpi = await IndicadoresModel.cantidadLicitacionXUsuario(fechaDesde, fechaHasta)
            if (data_kpi.length === 0) return res.status(404).json({ mensaje: 'No hay licitaciones almacenadas' })

            return res.json(data_kpi)
        } catch (e) {
            console.log("ERROR: ", e)
            return res.status(404).json({ mensaje: 'Ocurrió un error en licitaciones', error: e.message })
        }
    }

    //Licitaciones por mes

    static async participacionMesVsAnterior(req, res) {
        let { fecha } = req.params             // /participacion/:fecha?
        if (!fecha) fecha = anioMesActual()    // usa el mes actual por defecto
        console.log('fecha', fecha)

        try {
            // mes actual
            const { fechaIni: fiAct, fechaFin: ffAct } = buildDateRange(fecha)

            // mes anterior
            const [y, m] = fecha.split('-').map(Number)
            const fechaPrev = m === 1
                ? `${y - 1}-12`
                : `${y}-${String(m - 1).padStart(2, '0')}`
            const { fechaIni: fiPrev, fechaFin: ffPrev } = buildDateRange(fechaPrev)

            const datos = await IndicadoresModel.getParticipacionMes({
                fiPrev,
                ffPrev,
                fiAct,
                ffAct
            })

            const anterior = datos.find(r => r.Periodo === 'anterior')?.Cantidad ?? 0
            const actual = datos.find(r => r.Periodo === 'actual')?.Cantidad ?? 0
            const variacion = anterior === 0
                ? null
                : Number(((actual - anterior) / anterior * 100).toFixed(2))

            return res.json({
                mesAnterior: fechaPrev,
                valorAnterior: anterior,
                mesActual: fecha,
                valorActual: actual,
                variacionPorc: variacion
            })
        } catch (e) {
            return res.status(404).json({
                mensaje: 'Ocurrió un error en Indicadores',
                error: e.message
            })
        }
    }

    static async CantidadLicitacionXProvinciaHistorial(req, res) {
        let { fecha } = req.params       // ej. 2025-06
        if (!fecha) fecha = anioMesActual()

        try {
            /* rango “mes actual” */
            const { fechaIni: fiAct } = buildDateRange(fecha)

            /* fechaIni 5 meses atrás (incluido) */
            const [y, m] = fecha.split('-').map(Number)
            const dateIni = new Date(y, m - 1 /*0-based*/, 1)      // 1er día mes actual
            dateIni.setMonth(dateIni.getMonth() - 5)               // retrocede 5 meses
            const fiHist = dateIni.toISOString().slice(0, 10)      // YYYY-MM-DD

            /* fechaFin exclusivo = primer día del mes siguiente al actual */
            const { fechaFin: ffHist } = buildDateRange(fecha)    // ya da +1 mes

            const datos = await IndicadoresModel.getCantidadLicitacionXProvinciaHistorial({
                fiHist,
                ffHist
            })

            /* opcional: ordenar por Provincia y Mes */
            datos.sort((a, b) =>
                a.Provincia.localeCompare(b.Provincia) ||
                a.AnioMes.localeCompare(b.AnioMes)
            )

            /* devuelvo tal cual; el front puede pivotar */
            return res.json({
                mesActual: fecha,
                mesesIncluidos: 6,
                datos
            })
        } catch (e) {
            return res.status(404).json({
                mensaje: 'Ocurrió un error en Indicadores',
                error: e.message
            })
        }
    }

    //Laboratorio

    static async ObtenerResumenLaboratorios(req, res) {
        try {
            const { fechaDesde, fechaHasta } = req.body

            if (!fechaDesde || !fechaHasta) {
                return res.status(400).json({ mensaje: "Debe enviar fechaDesde y fechaHasta" })
            }

            const data = await IndicadoresModel.obtenerResumenLaboratorios(fechaDesde, fechaHasta)
            res.status(200).json(data)
        } catch (e) {
            res.status(500).json({ mensaje: 'Error al obtener resumen de laboratorios', error: e.message })
        }
    }

    //Productos
    static async ObtenerResumenProductos(req, res) {

        try {
            const { fechaDesde, fechaHasta } = req.body

            if (!fechaDesde || !fechaHasta) {
                return res.status(400).json({ mensaje: "Debe enviar fechaDesde y fechaHasta" })
            }
            const data = await IndicadoresModel.obtenerResumenProductos(fechaDesde, fechaHasta)
            console.log("obtenerResumenProductos", data)
            res.status(200).json(data)
        } catch (e) {
            res.status(500).json({ mensaje: 'Error al obtener resumen de productos', error: e.message })
        }
    }
    static async ObtenerProductosDispersion(req, res) {

        try {
            const { fechaDesde, fechaHasta, codigoTarot } = req.body
            console.log("fechaDesde", fechaDesde)
            console.log("fechaHasta", fechaHasta)
            console.log("codigoTarot", codigoTarot)

            if (!fechaDesde || !fechaHasta || !codigoTarot) {
                return res.status(400).json({ mensaje: "Debe enviar fechaDesde y fechaHasta" })
            }
            const data = await IndicadoresModel.obtenerProductosDispersion(fechaDesde, fechaHasta, codigoTarot)
            console.log("data", data)

            res.status(200).json(data)
        } catch (e) {
            res.status(500).json({ mensaje: 'Error al obtener la dispersion del producto', error: e.message })
        }
    }


    // cobranza 
    static async ObtenerDeudaCliente(req, res) {
        const { fechaDesde, fechaHasta } = req.body

        if (!fechaDesde || !fechaHasta) {
            return res.status(400).json({ mensaje: 'Faltan campos obligatorios' })
        }

        try {
            const data = await IndicadoresModel.obtenerDeudaCliente({ fechaDesde, fechaHasta })
            res.status(200).json(data)
        } catch (e) {
            res.status(500).json({ mensaje: 'Error al obtener deudas', error: e.message })
        }
    }

    /* static async ObtenerDeudaClienteFecha(req, res) {
        const { fechaDesde } = req.query

        if (!fechaDesde) {
            return res.status(400).json({ mensaje: 'Falta el parámetro fechaDesde' })
        }

        try {
            const data = await IndicadoresModel.obtenerDeudaClienteFecha(fechaDesde)
            res.status(200).json(data)
        } catch (e) {
            res.status(500).json({ mensaje: 'Error al obtener deudas', error: e.message })
        }
    } */

    static async ObtenerDeudaProvincia(req, res) {
        const { fechaDesde, fechaHasta } = req.body

        if (!fechaDesde || !fechaHasta) {
            return res.status(400).json({ mensaje: 'Faltan campos obligatorios' })
        }

        try {
            const data = await IndicadoresModel.obtenerDeudaProvincia({ fechaDesde, fechaHasta })
            res.status(200).json(data)
        } catch (e) {
            res.status(500).json({ mensaje: 'Error al obtener deudas', error: e.message })
        }
    }

}