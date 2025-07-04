import { ComprasModel } from '../models/compras.js'
import { buildWhereClause } from '../functions/functions.js'

export class ComprasController {
  static async getAll(req, res) {
    try {
      const compras = await ComprasModel.getAll()
      if (compras.length === 0)
        return res.status(404).json({ mensaje: 'No hay compras almacenados' })

      return res.json(compras)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }

  static async getListaKairos(req, res) {
    try {
      const listaKariosEnCurso = await ComprasModel.getListaKairos()

      return res.status(200).json(listaKariosEnCurso)
    } catch (e) {
      console.log(e)
      return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos 8' });
    }
  }

  static async filtrarListaKairos(req, res) {
    const { filtros } = req.body
    
    try {
      if (filtros) {
        //console.log("FILTROS: ",filtros)
        if (filtros.hasOwnProperty('idLicitacion')) {
          filtros['l.id'] = filtros.idLicitacion;
          delete filtros.idLicitacion;
        }
        
        const whereClausule = buildWhereClause(filtros)
        const listaKariosEnCurso = await ComprasModel.getListaKairos(whereClausule)

        return res.status(200).json(listaKariosEnCurso)
      }
      const listaKariosEnCurso = await ComprasModel.getListaKairos()

      return res.status(200).json(listaKariosEnCurso)
    } catch (e) {
      console.log(e)
      return res.status(404).json({ mensaje: 'Ocurrió un error en Kairos 9' });
    }
  }

  static async getByIDCompra(req, res) {
    const { idCompra } = req.params

    try {
      const compras = await ComprasModel.getByIDCompra({ idCompra })
      if (!compras) return res.status(404).json({ mensaje: 'No existe la compra' })

      return res.json(compras)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }

  static async getByIDLicitacion(req, res) {
    const { idLicitacion } = req.params
    try {
      const licitacion = await ComprasModel.buscarLicitacion({ idLicitacion })
      if (!licitacion) return res.status(404).json({ mensaje: 'No se encontró la licitación' })
      const compras = await ComprasModel.getByIDlicitacion({ idLicitacion })

      if (!compras) return res.status(404).json({ mensaje: 'No se encontraron compras en la licitación' })
      return res.json(compras)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }

  static async getCotizacionesHistoricasByIDlicitacion(req, res){
    const { idLicitacion } = req.params
    try {
      const licitacion = await ComprasModel.buscarLicitacion({ idLicitacion })
      if (!licitacion) return res.status(404).json({ mensaje: 'No se encontró la licitación' })
      const compras = await ComprasModel.getCotizacionesHistoricasByIDlicitacion({ idLicitacion })

      if (!compras) return res.status(404).json({ mensaje: 'No se encontraron cotizaciones para la licitación' })
      return res.json(compras)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }

  static async getCotizacionesHistoricasByCodTarot(req, res) {
    const { codTarot } = req.params
    try {
      const compras = await ComprasModel.getCotizacionesHistoricasByCodTarot({ codTarot })

      if (!compras) return res.status(404).json({ mensaje: 'No se encontraron cotizaciones para la licitación' })
      return res.json(compras)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }

  static async getAllCotizacionesHistoricas(req, res) {
    try {
      const compras = await ComprasModel.getAllCotizacionesHistoricas()

      if (!compras) return res.status(404).json({ mensaje: 'No hay historial de Cotizaciones' })
      return res.json(compras)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }

  static async getRenglonesNoAsociados(req, res) {
    try {
      const compras = await ComprasModel.getRenglonesNoAsociados()

      if (!compras) return res.status(404).json({ mensaje: 'No hay renglones no asociados' })
      return res.json(compras)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }

  static async crearCompra(req, res) {
    const { idRenglon, idLicitacion, idKairos, costoFinal, mantenimiento, observaciones, codTarot, idUsuario, fechora_comp } = req.body
console.log("req.body",req.body)
    if (idRenglon == null ||
      idLicitacion == null ||
      idKairos == null ||
      costoFinal == null ||
      mantenimiento == null ||
      observaciones == null ||  // Ahora solo bloquea si es null o undefined
      codTarot == null ||
      idUsuario == null ||
      fechora_comp == null) return res.status(400).json({ mensaje: 'Faltan campos obligatorios' })

    try {
      const existeUsuario = await ComprasModel.buscarUsuario({ idUsuario })
      if (!existeUsuario) return res.status(401).json({ mensaje: 'El usuario no existe' })

      const existeRenglon = await ComprasModel.buscarRenglon({ idRenglon })
      if (!existeRenglon) return res.status(401).json({ mensaje: 'El Renglón no existe' })

      const existeLicitacion = await ComprasModel.buscarLicitacion({ idLicitacion })
      if (!existeLicitacion) return res.status(401).json({ mensaje: 'La licitación no existe' })

      const existeKairos = await ComprasModel.buscarKairos({ idKairos })
      if (!existeKairos) return res.status(401).json({ mensaje: 'El id Kairos no existe' })

      const newCompra = await ComprasModel.crearCompra({
        input: { idRenglon, idLicitacion, idKairos, costoFinal, mantenimiento, observaciones, codTarot, idUsuario, fechora_comp }
      })

      if (!newCompra) return res.status(401).json({ mensaje: 'La compra no pudo ser creada' });

      // Después de procesar todos los renglones, enviamos una respuesta exitosa
      return res.status(201).json({ mensaje: 'Compra creada correctamente', newCompra })

    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }

  static async crearComprasLicitacion(req, res) {
    const { idLicitacion } = req.params;
    const { idUsuario, compras } = req.body

    console.log("idLicitacion",idLicitacion)
    console.log("idUsuario",idUsuario)
    console.log("compras",compras)
   
    if (!compras || !idLicitacion) return res.status(401).json({ mensaje: 'Faltan campos obligatorios' })

    if (compras.length === 0) return res.status(401).json({ mensaje: 'No hay compras que agregar' })

    try {
      const existeUsuario = await ComprasModel.buscarUsuario({ idUsuario })
      if (!existeUsuario) return res.status(401).json({ mensaje: 'El usuario no existe' })
      //comprasNuevas, comprasIncompletas, comprasRepetidas
      const { comprasNuevas, comprasIncompletas, comprasRepetidas } = verificarCompras(compras)

      if (comprasIncompletas.length > 0) {
        console.log("COMPRAS: ",comprasIncompletas)
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios en los renglones', comprasIncompletas });
      }
      if (comprasRepetidas.length > 0) {
        return res.status(400).json({ mensaje: 'Hay renglones repetidos en la lista', comprasRepetidas });
      }

      // Después de procesar todos los renglones, enviamos una respuesta exitosa
      console.log("enviar al model")
      await Promise.all(
        comprasNuevas.map((compra) => {
          ComprasModel.crearCompra({ input: compra })
        }
        )
      )
      return res.status(200).json({ mensaje: 'Compras creadas correctamente', comprasNuevas })

    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }

  static async eliminarCompra(req, res) {
    const { idCompra } = req.params

    try {
      const result = await ComprasModel.eliminarCompra({ idCompra })

      if (!result) return res.status(404).json({ mensaje: 'Compra no encontrada' })

      return res.json({ mensaje: 'Compra eliminada' })
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }

  static async modificarCompra(req, res) {
    const { idCompra } = req.params
    const { idLicitacion, idKairos, renglon, costoFinal, mantenimiento, observaciones, codTarot, idUsuario } = req.body

    try {
      const newCompra = await ComprasModel.modificarCompra({
        idCompra,
        input: { idLicitacion, idKairos, renglon, costoFinal, mantenimiento, observaciones, codTarot, idUsuario }
      });

      // Si no se crea el renglón, lanzar un error
      if (!newCompra) return res.status(404).json({ mensaje: 'Compra no encontrada' });

      return res.status(201).json({ mensaje: 'Compra modificada', newCompra });
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Compras', error: e.message })
    }
  }
}

const verificarCompras = (listaCompras, editar = false) => {
  const comprasNuevas = [];
  const comprasIncompletas = [];
  const comprasRepetidas = []
  const comprasRecorridas = new Set(); // Para detectar duplicados

  // Verifico que los renglones sean correctos
  if (!editar) {
    for (const ren of listaCompras) {
      const { idRenglon, idLicitacion, idKairos, costoFinal, codTarot, idUsuario, fechora_comp } = ren;

      if (!idRenglon || !idLicitacion || !idKairos || !costoFinal || !codTarot || !idUsuario || !fechora_comp) {
        comprasIncompletas.push(ren);
      } else {
        if (comprasRecorridas.has({ idRenglon })) {
          comprasRepetidas.push(idRenglon)
        } else {
          comprasNuevas.push(ren);
          comprasRecorridas.add({ idRenglon })
        }
      }
    }
  } else {
    for (const ren of listaCompras) {
      const { idRenglon, idLicitacion, idKairos, costoFinal, codTarot, idUsuario, fechora_comp } = ren;

      if (!idRenglon || !idLicitacion || !idKairos || !costoFinal || !codTarot || !idUsuario || !fechora_comp) {
        comprasIncompletas.push(ren);
      } else {
        if (comprasRecorridas.has(idRenglon)) {
          comprasRepetidas.push(idRenglon)
        } else {
          comprasNuevas.push(ren);
          comprasRecorridas.add(idRenglon)
        }
      }
    }
  }

  return { comprasNuevas, comprasIncompletas, comprasRepetidas }
}