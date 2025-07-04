import { RenglonModel } from '../models/renglones.js';

export class RenglonController {
  static async getAll(req, res) {
    try {
      const licitaciones = await RenglonModel.getAll();
      if (licitaciones.length === 0) return res.status(404).json({ mensaje: 'No hay renglones almacenados' });

      return res.json(licitaciones);
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }
  }

  static async getByIDRenglon(req, res) {
    const { idRenglon } = req.params
    try {
      const renglones = await RenglonModel.getByIDRenglon({ idRenglon })
      if (!renglones) return res.status(404).json({ mensaje: 'No existe el renglon' })

      return res.json(renglones);
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }
  }

  static async getByIDLicitacion(req, res) {
    const { id } = req.params
    try {
      const licitacionExistente = await RenglonModel.getLicitacion({ idLicitacion: id })
      if (!licitacionExistente) return res.status(201).json({ mensaje: 'La licitacion no existe' })

      const renglones = await RenglonModel.getByIDlicitacion({ id })
      if (renglones.length === 0) return res.status(404).json({ mensaje: 'No hay renglones almacenados' })

      return res.json(renglones)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }
  }

  static async getRenglon(req, res) {
    const { idLicitacion, nroRenglon, alternativo } = req.params
    try {
      const renglon = await RenglonModel.getRenglon({ idLicitacion, nroRenglon, alternativo });
      if (!renglon) return res.status(404).json({ mensaje: 'No existe el Renglón' })

      return res.json(renglon);
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }
  }

  static async crearRenglon(req, res) {
    const { idLicitacion } = req.params
    const { renglon, cantidad, descripcion, codigoTarot, descripcionTarot } = req.body
    if (!idLicitacion || !renglon || !cantidad || !descripcion || !codigoTarot || !descripcionTarot) return res.status(400).json({ mensaje: 'Faltan campos obligatorios' })
    try {
      const licitacionExistente = await RenglonModel.getLicitacion({ idLicitacion })
      if (!licitacionExistente) return res.status(201).json({ mensaje: 'La licitacion no existe', lic: licitacionExistente })

      const renglonExistente = await RenglonModel.getRenglon({ idLicitacion, nroRenglon: renglon, alternativo: 0 })
      if (renglonExistente) return res.status(401).json({ mensaje: 'Renglón ya existe' })

      const newRenglon = await RenglonModel.crearRenglonLicitacion({ input: { idLicitacion, renglon, cantidad, descripcion, codigoTarot, descripcionTarot } })
      if (!newRenglon) return res.status(401).json({ mensaje: 'Renglón no disponible' })

      return res.status(201).json({ mensaje: 'Renglón creado', newRenglon })
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }
  }

  static async crearRenglonAlternativo(req, res) {
    const { idLicitacion } = req.params
    const { renglon, cantidad, descripcion, codigoTarot, descripcionTarot, alternativo } = req.body

    if (!idLicitacion || !renglon || !cantidad || !descripcion || !codigoTarot || !alternativo) return res.status(400).json({ mensaje: 'Faltan campos obligatorios' })

    try {
      const licitacionExistente = await RenglonModel.getLicitacion({ idLicitacion })
      if (!licitacionExistente) return res.status(201).json({ mensaje: 'La licitacion no existe', lic: licitacionExistente })

      const renglonExistente = await RenglonModel.getRenglon({ idLicitacion, nroRenglon: renglon, alternativo })
      if (renglonExistente) return res.status(401).json({ mensaje: 'Renglón ya existe' })

      const newRenglon = await RenglonModel.crearAlternativo({ idLicitacion, renglonAlt: { renglon, cantidad, descripcion, codigoTarot, descripcionTarot, alternativo } })
      if (!newRenglon) return res.status(401).json({ mensaje: 'Renglón no disponible' })

      return res.status(201).json({ mensaje: 'Renglón alternativo creado', newRenglon })
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }
  }

  static async crearRenglonesLicitacion(req, res) {
    const { idLicitacion } = req.params;
    const { renglones } = req.body;

    if (!idLicitacion || !renglones) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    try {
      if (renglones.length === 0) {
        return res.status(400).json({ mensaje: 'No hay renglones para agregar' });
      }

      const licitacionExistente = await RenglonModel.getLicitacion({ idLicitacion })
      if (!licitacionExistente) return res.status(201).json({ mensaje: 'La licitacion no existe' })

      const { renglonesNuevos, renglonesIncompletos, renglonesRepetidos } = verificarRenglones(renglones, false)
      //return res.status(200).json({ mensaje: 'Renglones', renglonesNuevos, renglonesIncompletos, renglonesRepetidos })

      if (renglonesIncompletos.length > 0) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios en los renglones', renglonesIncompletos });
      }
      if (renglonesRepetidos.length > 0) {
        return res.status(400).json({ mensaje: 'Hay renglones repetidos en la lista', renglonesRepetidos });
      }

      // Verificar renglones en la base de datos
      const renglonesYaExisten = await Promise.all(
        renglonesNuevos.map(async (ren) => {
          const existe = await RenglonModel.getRenglon({ idLicitacion, nroRenglon: ren.renglon, alternativo: 0 });
          return existe ? ren : null;
        })
      );

      // Filtrar los que ya existen
      /* const renglonesExistentes = renglonesYaExisten.filter(Boolean);
      if (renglonesExistentes.length > 0) {
        return res.status(400).json({ mensaje: 'Algunos renglones ya existen', renglonesExistentes });
      } */

      // Insertar los renglones en la base de datos
      await Promise.all(
        renglonesNuevos.map((ren) => {
          if (!ren.alternativo || ren.alternativo === 0) {
            RenglonModel.crearRenglonLicitacion({ input: { idLicitacion, renglon: ren.renglon, cantidad: ren.cantidad, descripcion: ren.descripcion, codigoTarot: ren.codigoTarot, descripcionTarot: ren.descripcionTarot } })
          } else {
            RenglonModel.crearAlternativo({ idLicitacion, renglonAlt: ren })
          }
        }
        )
      )

      return res.json({ mensaje: "Renglones agregados", idLicitacion, renglonesAgregar: renglonesNuevos });
    } catch (e) {

      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }
  }

  static async modificarRenglon(req, res) {
    const { idLicitacion, idRenglon } = req.params
    const { renglon, cantidad, descripcion, codigoTarot, descripcionTarot, laboratorio_elegido, costo_elegido, ANMAT, precio_vta, observaciones, margen, alternativo, nombre_comercial, observaciones_internas } = req.body

    if (!idRenglon || !renglon || !cantidad || !descripcion || !codigoTarot || !descripcionTarot) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' })
    }

    try {
      const idRenglonExiste = await RenglonModel.getByIDRenglon({ idRenglon })
      if (!idRenglonExiste) return res.status(201).json({ mensaje: 'El renglón no existe' })

      const renglonExiste = await RenglonModel.getRenglon({ idLicitacion, nroRenglon: renglon, alternativo })
      if (renglonExiste) return res.status(201).json({ mensaje: 'Ya existe ese renglón en la licitación' })

      const updatedRenglon = await RenglonModel.modificarRenglon({ idRenglon, input: { renglon, cantidad, descripcion, codigoTarot, descripcionTarot, laboratorio_elegido, costo_elegido, ANMAT, precio_vta, observaciones, margen, alternativo, nombre_comercial, observaciones_internas } })
      if (!updatedRenglon) return res.status(401).json({ mensaje: 'Renglón no disponible' })

      return res.json({ mensaje: 'Renglón modificado', updatedRenglon });
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }

  }

  static async modificarRenglonesLicitacion(req, res) {
    const { idLicitacion } = req.params;
    const { renglones } = req.body;

    if (!idLicitacion || !renglones) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    if (renglones.length === 0) {
      return res.status(400).json({ mensaje: 'No hay renglones para agregar' });
    }
    try {
      const licitacionExistente = await RenglonModel.getLicitacion({ idLicitacion })
      if (!licitacionExistente) return res.status(201).json({ mensaje: 'La licitacion no existe' })

      const { renglonesNuevos, renglonesIncompletos, renglonesRepetidos } = verificarRenglones(renglones, true)

      if (renglonesIncompletos.length > 0) {
        return res.status(400).json({ mensaje: 'Faltan campos obligatorios en los renglones', renglonesIncompletos });
      }
      if (renglonesRepetidos.length > 0) {
        return res.status(400).json({ mensaje: 'Hay renglones repetidos en la lista', renglonesRepetidos });
      }

      // Verificar renglones en la base de datos
      const renglonesYaExisten = await Promise.all(
        renglonesNuevos.map(async (ren) => {
          const existe = await RenglonModel.getByIDRenglon({ idRenglon: ren.idRenglon });
          return existe ? ren : null;
        })
      );

      // Filtrar los que ya existen
      const renglonesExistentes = renglonesYaExisten.filter(Boolean);
      if (renglonesExistentes.length === 0) {
        return res.status(400).json({ mensaje: 'Los renglones no existen, no pueden modificarse' });
      }

      const renglonesAgregados = []
      await Promise.all(
        renglonesNuevos.map(async (ren) => {
          const nuevoRenglon = await RenglonModel.modificarRenglon({ idRenglon: ren.idRenglon, input: { idLicitacion: ren.idLicitacion, renglon: ren.renglon, cantidad: ren.cantidad, descripcion: ren.descripcion, codigoTarot: ren.codigoTarot, descripcionTarot: ren.descripcionTarot, laboratorio_elegido: ren.laboratorio_elegido, costo_elegido: ren.costo_elegido, ANMAT: ren.ANMAT, precio_vta: ren.precio_vta, observaciones: ren.observaciones, margen: ren.margen, alternativo: ren.alternativo, nombre_comercial: ren.nombre_comercial, observaciones_internas: ren.observaciones_internas } })

          renglonesAgregados.push(nuevoRenglon)
        }
        )
      )

      return res.status(200).json({ mensaje: "Renglones actualizados", renglonesAgregados })
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }
  }

  static async modificarPreganadosRenglonesLicitacion(req, res) {
    const { idLicitacion } = req.params;
    const { renglones } = req.body;

    if (!idLicitacion || !renglones) {
      return res.status(400).json({ mensaje: 'Faltan campos obligatorios' });
    }

    if (renglones.length === 0) {
      return res.status(400).json({ mensaje: 'No hay renglones para modificar' });
    }

    try {
      const licitacionExistente = await RenglonModel.getLicitacion({ idLicitacion })
      if (!licitacionExistente) return res.status(201).json({ mensaje: 'La licitacion no existe' })

      // Verificar renglones en la base de datos
      /* const renglonesYaExisten = await Promise.all(
        renglones.map(async (ren) => {
          const existe = await RenglonModel.getByIDRenglon({ idRenglon: ren.idRenglon })
          return existe ? ren : null
        })
      )

      // Filtrar los que ya existen
      const renglonesExistentes = renglonesYaExisten.filter(Boolean)
      if (renglonesExistentes.length === 0) {
        return res.status(400).json({ mensaje: 'Los renglones no existen, no pueden modificarse' })
      } */

      const renglonesAgregados = []
      await Promise.all(
        renglones.map(async (ren) => {
          let preg = ren.preganado ? 1 : 0
          let mes_est = ren.mes_estimado_entrega ? ren.mes_estimado_entrega : ""
          const nuevoRenglon = await RenglonModel.modificarPreganadoRenglon({ idRenglon: ren.idRenglon, input: { preganado: preg, mes_estimado_entrega: mes_est } })

          renglonesAgregados.push(nuevoRenglon)
        }
        )
      )

      return res.status(200).json({ mensaje: "Preganados actualizados", renglonesAgregados })
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }
  }

  static async eliminarRenglon(req, res) {
    const { idRenglon } = req.params;
    try {
      const result = await RenglonModel.eliminarRenglon({ idRenglon });

      if (result === false) {
        return res.status(404).json({ mensaje: 'Renglón no encontrado' });
      }

      return res.json({ mensaje: 'Renglón eliminado' });
    } catch (error) {
      return res.status(401).json({ mensaje: error.message });
    }
  }

  static async eliminarRenglonesLicitacion(req, res) {
    const { idLicitacion } = req.params;

    try {
      const licitacionExistente = await RenglonModel.getLicitacion({ idLicitacion })
      if (!licitacionExistente) return res.status(201).json({ mensaje: 'La licitacion no existe', lic: licitacionExistente })

      const result = await RenglonModel.eliminarRenglonesLicitacion({ idLicitacion })

      if (result === false) {
        return res.status(404).json({ mensaje: 'Renglones no encontrado' })
      }

      return res.json({ mensaje: 'Renglones eliminados' });
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en renglones', error: e.message });
    }
  }
}


const verificarRenglones = (listaRenglones, editar = false) => {
  const renglonesNuevos = [];
  const renglonesIncompletos = [];
  const renglonesRepetidos = []
  const renglonesRecorridos = new Set(); // Para detectar duplicados

  // Verifico que los renglones sean correctos
  if (editar) {
    for (const ren of listaRenglones) {
      const { idRenglon, renglon, cantidad, descripcion, codigoTarot, alternativo } = ren;
      
      if (!idRenglon || !renglon || !cantidad || !descripcion || !codigoTarot) {
        renglonesIncompletos.push(ren);
      } else {
        if (renglonesRecorridos.has({ renglon, alternativo })) {
          renglonesRepetidos.push(renglon)
        } else {
          renglonesNuevos.push(ren);
          renglonesRecorridos.add({ renglon, alternativo })
        }
      }
    }
  } else {
    for (const ren of listaRenglones) {
      const { renglon, cantidad, descripcion, codigoTarot } = ren;

      if (!renglon || !cantidad || !descripcion || !codigoTarot) {
        renglonesIncompletos.push(ren);
      } else {
        if (renglonesRecorridos.has(renglon)) {
          renglonesRepetidos.push(renglon)
        } else {
          renglonesNuevos.push(ren);
          renglonesRecorridos.add(renglon)
        }
      }
    }
  }

  return { renglonesNuevos, renglonesIncompletos, renglonesRepetidos }
}