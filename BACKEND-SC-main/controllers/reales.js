import { RealesModel } from '../models/reales.js';

export class RealesController {
    static async getAll(req, res) {
        try {
            const lista = await RealesModel.getAll()
            if (lista.length === 0)
                return res.status(404).json({ mensaje: 'No hay reales almacenados' })

            return res.status(200).json(lista)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Reales', error: e.message })
        }
    }

    static async getByIdLicitacion(req, res) {
        const { idLicitacion } = req.params

        if (!idLicitacion) return res.status(404).json({ mensaje: 'No hay id de licitación' })
        try {
            const listaReales = await RealesModel.getByIdLicitacion({ idLicitacion })

            return res.json(listaReales)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en reales', error: e.message })
        }
    }

    static async getByRenglon(req, res) {
        const { idRenglon } = req.params

        if (!idRenglon) return res.status(404).json({ mensaje: 'No hay id de renglón' })
        try {
            const listaReales = await RealesModel.getByRenglon({ idRenglon })

            return res.json(listaReales)
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en reales', error: e.message })
        }
    }

    static async agregarNuevoReal(req, res) {
        const { idRenglon, cantidad_real, costo_real, precio_real, laboratorio_real } = req.body
        
        if (idRenglon == null ||
            cantidad_real == null ||
            costo_real == null ||
            precio_real == null ||
            laboratorio_real == null) return res.status(400).json({ mensaje: 'Faltan campos obligatorios' })

        try {
            const existeRenglon = await RealesModel.buscarRenglon({ idRenglon })
            if (!existeRenglon) return res.status(401).json({ mensaje: 'El Renglón no existe' })

            const newReal = await RealesModel.agregarNuevoReal({
                input: { idRenglon, cantidad_real, costo_real, precio_real, laboratorio_real }
            })

            if (!newReal) return res.status(401).json({ mensaje: 'Real no pudo ser creada' });

            // Después de procesar todos los renglones, enviamos una respuesta exitosa
            return res.status(201).json({ mensaje: 'Real creada correctamente', newReal })

        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Reales', error: e.message })
        }
    }

    static async modificarReal(req, res) {
        const { idReal } = req.params
        const { idRenglon, cantidad_real, costo_real, precio_real, laboratorio_real } = req.body

        try {
            const newReal = await RealesModel.modificarReal({
                idReal,
                input: { idRenglon, cantidad_real, costo_real, precio_real, laboratorio_real }
            });

            // Si no se crea el renglón, lanzar un error
            if (!newReal) return res.status(404).json({ mensaje: 'Real no encontrada' });

            return res.status(201).json({ mensaje: 'Real modificada', newCompra: newReal });
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Reales', error: e.message })
        }
    }

    static async eliminarReal(req, res) {
        const { idReal } = req.params

        try {
            const result = await RealesModel.eliminarReal({ idReal })

            if (!result) return res.status(404).json({ mensaje: 'Real no encontrado' })

            return res.json({ mensaje: 'Real eliminado' })
        } catch (e) {
            return res.status(404).json({ mensaje: 'Ocurrió un error en Reales', error: e.message })
        }
    }

}
