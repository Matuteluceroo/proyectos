import { ClienteModel } from '../models/clientes.js';

export class ClienteController {
  static async getAll(req, res) {
    try {
      const clientes = await ClienteModel.getAll()
      if (clientes.length === 0) return res.status(404).json({ mensaje: 'No hay clientes almacenados' })

      return res.json(clientes)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Clientes', error: e.message });
    }
  }

  static async getByCodCliente(req, res) {
    const { cod } = req.params
    try {

      const clientes = await ClienteModel.getByCodCliente({ cod })

      if (!clientes) return res.status(404).json({ mensaje: 'No se encontró el cliente' })

      return res.json(clientes)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Clientes', error: e.message });
    }
  }

  // ## Obtiene el listado de clientes según el ID de la zona
  static async getByIDZona(req, res) {
    const { idZona } = req.params

    if (!idZona) return res.status(400).json({ mensaje: 'Falta el id de la zona' })
    //if (isNaN(idZona)) return res.status(400).json({ mensaje: 'El id de la zona es inválido' })
    try {
      const clientes = await ClienteModel.getByIDZona({ idZona })

      if (!clientes) return res.status(404).json({ mensaje: 'No hay clientes almacenados' })

      return res.json(clientes)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Clientes', error: e.message });
    }
  }

  static async getByProvincia(req, res) {
    const { provincia } = req.params
    try {
      const clientes = await ClienteModel.getByProvincia({ provincia })

      if (clientes.length === 0) return res.status(404).json({ mensaje: 'No hay clientes almacenados' })

      return res.json(clientes)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Clientes', error: e.message });
    }
  }

}
