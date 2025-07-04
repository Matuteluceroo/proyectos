import { LicitacionModel } from '../models/licitaciones.js'

export class LicitacionController {
  static async getAll(req, res) {
    try {
      const licitaciones = await LicitacionModel.getAll()
      if (licitaciones.length === 0) return res.status(404).json({ mensaje: 'No hay licitaciones almacenadas' })

      // Mapear y resolver las promesas con Promise.all
      const licitacionesConUsuarios = await Promise.all(
        licitaciones.map(async (licitacion) => {
          const usuariosAsociados = await LicitacionModel.obtenerUsuariosLicitacion({ idLicitacion: licitacion.id })
          licitacion.usuarios = usuariosAsociados

          licitacion.fecha = licitacion.fecha.toISOString().split('T')[0];

          //const cantidadRenglones = await LicitacionModel.obtenerCantidadRenglonesLicitacion({ idLicitacion: licitacion.id })

          return licitacion
        })
      )

      return res.json(licitacionesConUsuarios)
    } catch (e) {
      console.log("ERROR: ", e)
      return res.status(404).json({ mensaje: 'Ocurrió un error en Licitaciones', error: e.message })
    }
  }

  static async getByID(req, res) {
    const { idLicitacion } = req.params
    try {
      const licitacion = await LicitacionModel.getByID({ idLicitacion })
      if (!licitacion) return res.status(404).json({ mensaje: 'No existe la licitación' })

      const usuariosAsociados = await LicitacionModel.obtenerUsuariosLicitacion({ idLicitacion })
      licitacion.usuarios = usuariosAsociados
      const renglones = await LicitacionModel.obtenerRenglonesLicitacion({ idLicitacion })
      licitacion.renglones = renglones
      const cotizaciones = await LicitacionModel.obtenerCotizacionesLicitacion({ idLicitacion })
      licitacion.cotizaciones = cotizaciones
      //const reales = await LicitacionModel.obtenerRealesLicitacion({idLicitacion})
      //licitacion.reales = reales

      licitacion.fecha = licitacion.fecha.toISOString().split('T')[0]
      return res.json(licitacion)
    } catch (e) {
      console.log("ERRROR: ", e.message)
      return res.status(404).json({ mensaje: 'Ocurrió un error en Licitaciones', error: e.message });
    }
  }

  static async create(req, res) {
    const { codCliente, cliente, fecha, nroLic, tipo, hora, objeto, estado } = req.body;

    if (!codCliente || !cliente || !fecha || !nroLic || !estado) return res.status(400).json({ mensaje: 'Faltan campos obligatorios' })

    try {
      const newLicitacion = await LicitacionModel.create({ input: { codCliente, cliente, fecha, nroLic, tipo, hora, objeto, estado } });

      if (!newLicitacion) return res.status(401).json({ mensaje: 'Licitacion no disponible' });

      return res.status(201).json({ mensaje: 'Licitacion creada', newLicitacion });
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Licitaciones', error: e.message });
    }
  }

  static async eliminarLicitacion(req, res) {
    const { idLicitacion } = req.params
    try {
      const result = await LicitacionModel.eliminarLicitacion({ idLicitacion })

      if (!result) return res.status(404).json({ mensaje: 'Licitacion no encontrada' })

      return res.json({ mensaje: 'Licitacion eliminada' })
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Licitaciones', error: e.message });
    }
  }

  static async modificarLicitacion(req, res) {
    const { idLicitacion } = req.params;
    const { codCliente, cliente, fecha, nroLic, tipo, hora, objeto, estado } = req.body;

    if (!cliente || !fecha || !nroLic || !estado) return res.status(400).json({ mensaje: 'Faltan campos obligatorios de la licitación' });

    try {
      const licitacionModificada = await LicitacionModel.modificarLicitacion({ idLicitacion, input: { codCliente, cliente, fecha, nroLic, tipo, hora, objeto, estado } });

      if (!licitacionModificada) return res.status(404).json({ mensaje: 'Licitacion no encontrada' });


      return res.json({ mensaje: 'Licitacion actualizada', licitacionModificada });
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Licitaciones', error: e.message });
    }
  }

  static async obtenerLicitacionesUsuario(req, res) {
    const { idUsuario } = req.params;
    try {
      const licitacionesDeUsuario = await LicitacionModel.obtenerLicitacionesUsuario({ idUsuario });
      if (licitacionesDeUsuario.length === 0) return res.status(404).json({ mensaje: 'No hay licitaciones asociadas al usuario' });

      licitacionesDeUsuario.forEach(licitacion => {
        licitacion.fecha = licitacion.fecha.toISOString().split('T')[0]
      })

      return res.json(licitacionesDeUsuario);
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Licitaciones', error: e.message });
    }
  }

  static async obtenerUsuariosLicitacion(req, res) {
    const { idLicitacion } = req.params
    try {
      const licitacion = await LicitacionModel.getByID({ idLicitacion })
      if (!licitacion) return res.status(404).json({ mensaje: `La licitación no existe` })

      const usuariosAsociados = await LicitacionModel.obtenerUsuariosLicitacion({ idLicitacion })
      if (usuariosAsociados.length === 0) return res.status(404).json({ mensaje: 'No hay usuarios asociados a la licitación' })

      return res.json(usuariosAsociados);
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Licitaciones', error: e.message });
    }
  }

  // ## Devuelve listado de licitaciones según la zona con los respectivos licitadores de la misma
  static async obtenerLicitacionesZona(req, res) {
    const { idZona } = req.params
    try {
      const licitacionesDeZona = await LicitacionModel.getByIDZona({ idZona })
      if (licitacionesDeZona.length === 0) {
        return res.json([])
      }

      // Usamos map para manejar promesas de manera eficiente
      const licitacionesConUsuarios = await Promise.all(
        licitacionesDeZona.map(async (licitacion) => {
          licitacion.fecha = licitacion.fecha.toISOString().split('T')[0]
          const usuariosAsociados = await LicitacionModel.obtenerLicitadoresDeLicitacion({ idLicitacion: licitacion.idLicitacion })
          licitacion.licitadores = usuariosAsociados
            .map((usuario) => usuario.nombre)
            .join(', ');

          return licitacion
        })
      )
      return res.json(licitacionesConUsuarios)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Licitaciones', error: e.message })
    }
  }

  static async obtenerLicitacionesProvincia(req, res) {
    const { provincia } = req.params
    try {
      const licitacionesDeProvincia = await LicitacionModel.getByProvincia({ provincia })
      if (licitacionesDeProvincia.length === 0) return res.status(404).json({ mensaje: 'No hay clientes en la provincia' })

      return res.json(licitacionesDeProvincia)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Licitaciones', error: e.message });
    }
  }
}
