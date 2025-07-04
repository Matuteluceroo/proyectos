import { FacturasModel } from '../models/facturas.js';
import { formatearFecha, buildWhereClause } from '../functions/functions.js';

export class FacturasController {
  static async getAll(req, res) {
    try {

      const listaFacturas = await FacturasModel.getAll();
      if (listaFacturas.length === 0) return res.status(404).json({ mensaje: 'No hay facturas' });
      // Iterar y convertir las fechas
      for (let i = 0; i < listaFacturas.length; i++) {
        listaFacturas[i]['FECHA'] = "" + formatearFecha(listaFacturas[i]['FECHA'])
        listaFacturas[i]['FEC_EMIS_FAC'] = "" + formatearFecha(listaFacturas[i]['FEC_EMIS_FAC'])
        listaFacturas[i]['FECHA_ENTREGA'] = "" + formatearFecha(listaFacturas[i]['FECHA_ENTREGA'])
        listaFacturas[i]['FECHA_RECIBO'] = "" + formatearFecha(listaFacturas[i]['FECHA_RECIBO'])
      }

      return res.status(200).json(listaFacturas)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Facturas', error: e.message });
    }
  }

  static async getByNroFactura(req, res) {
    const { nro_factura } = req.params;
    try {
      const factura = await FacturasModel.getByNroFactura({ nro_factura })
      if (!factura) return res.status(404).json({ mensaje: 'La factura no existe', error: e.message });

      const obsFac = await FacturasModel.getObservacionesFactura({ nroFactura: nro_factura })
      factura.observaciones = obsFac

      const docsFac = await FacturasModel.getDocumentosFactura({ nroFactura: nro_factura })
      factura.documentos = docsFac


      factura['FECHA'] = "" + formatearFecha(factura['FECHA'])

      for (let i = 0; i < factura["observaciones"].length; i++) {
        factura["observaciones"][i]["fecha_gestion"] = formatearFecha(factura["observaciones"][i]["fecha_gestion"])
        factura["observaciones"][i]["fecha_modificacion"] = formatearFecha(factura["observaciones"][i]["fecha_modificacion"], true)
        if (factura["observaciones"][i]["fecha_entrega_documentacion"]) {
          factura["observaciones"][i]["fecha_entrega_documentacion"] = formatearFecha(factura["observaciones"][i]["fecha_entrega_documentacion"])
        }
      }

      for (let i = 0; i < factura["documentos"].length; i++) {
        factura["documentos"][i]["FECHA_RECIBO"] = formatearFecha(factura["documentos"][i]["FECHA_RECIBO"])
      }

      return res.status(200).json(factura);
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Facturas', error: e.message });
    }
  }

  static async getByProvincia(req, res) {
    const { nombreProvincia } = req.params

    try {
      const facturasDeProvincias = await FacturasModel.getByProvincia({ nombreProvincia })
      if (facturasDeProvincias.length === 0) return res.status(404).json({ mensaje: 'No hay facturas en la provincia' })

      facturasDeProvincias.forEach((factura) => {
        factura['FECHA'] = "" + formatearFecha(factura['FECHA'])
        factura['FEC_EMIS_FAC'] = "" + formatearFecha(factura['FEC_EMIS_FAC'])
        factura['FECHA_ENTREGA'] = "" + formatearFecha(factura['FECHA_ENTREGA'])
        factura['FECHA_RECIBO'] = "" + formatearFecha(factura['FECHA_RECIBO'])
      })

      return res.json(facturasDeProvincias)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Facturas', error: e.message });
    }
  }

  static async getByProvincias(req, res) {
    const { provincias } = req.body
    try {
      // Esperar todas las promesas y combinarlas en una sola lista
      let consultaProv = ""

      provincias.forEach((prov) => {
        if (prov !== "") consultaProv = consultaProv + "cli.NOMBRE_PRO = '" + prov + "' OR "
      })
      const listaFacturas = await FacturasModel.getByProvincia({ consultasProv: consultaProv.substring(0, consultaProv.length - 4) })

      listaFacturas.forEach((factura) => {
        factura['FEC_EMIS_FAC'] = "" + formatearFecha(factura['FEC_EMIS_FAC'])
        if (factura["fecha_modificacion"]) factura["fecha_modificacion"] = formatearFecha(factura["fecha_modificacion"])

        if (factura["fecha_entrega_documentacion"]) {
          factura["fecha_entrega_documentacion"] = formatearFecha(factura["fecha_entrega_documentacion"])
        }
      })

      return res.status(200).json(listaFacturas);
    } catch (e) {
      return res.status(500).json({ mensaje: 'Ocurrió un error en Facturassss', error: e.message });
    }

  }

  static async getByIdZona(req, res) {
    const { idZona } = req.params

    try {
      const facturasDeZona = await FacturasModel.getByIdZona({ idZona })
      if (facturasDeZona.length === 0) return res.status(404).json({ mensaje: 'No hay facturas en la Zona' })

      return res.json(facturasDeZona)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Facturas', error: e.message });
    }
  }

  static async getObservacionesFactura(req, res) {
    const { nroFactura } = req.params

    try {
      const observacionesFactura = await FacturasModel.getObservacionesFactura({ nroFactura })
      if (observacionesFactura.length === 0) return res.status(404).json({ mensaje: 'No hay observaciones en la factura' })

      return res.json(observacionesFactura)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Facturas', error: e.message });
    }
  }

  static async agregarObservacion(req, res) {
    const { nro_factura, op_exp, habilitado_pago, observaciones, fecha_gestion, fecha_entrega_documentacion, idUsuario } = req.body


    if (!nro_factura || !idUsuario) {
      return res.status(401).json({ mensaje: 'Faltan campos obligatorios' })
    }

    try {
      const newOBS = await FacturasModel.agregarObservacion({ input: { nro_factura, op_exp, habilitado_pago, observaciones, fecha_gestion, fecha_entrega_documentacion, idUsuario } });

      if (!newOBS) return res.status(401).json({ mensaje: 'Factura no disponible' });

      return res.status(201).json({ mensaje: 'Observacion agregada', newOBS });
    } catch (e) {
      return res.status(401).json({ mensaje: e.message });
    }
  }

  static async eliminarObservacion(req, res) {
    const { nroFactura, fecha_modificacion } = req.params
    try {
      const result = await FacturasModel.eliminarObservacion({ nroFactura, fecha_modificacion })

      if (!result) return res.status(404).json({ mensaje: 'Observacion no encontrada' })

      return res.json({ mensaje: 'Observacion eliminada' })
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Facturas', error: e.message });
    }
  }

  static async getDocumentosFactura(req, res) {
    const { nroFactura } = req.params

    try {
      const documentosFactura = await FacturasModel.getDocumentosFactura({ nroFactura })
      //if (documentosFactura.length === 0) return res.status(404).json({ mensaje: 'No hay documentos en la factura' })

      return res.json(documentosFactura)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Facturas DOCS', error: e.message });
    }
  }

  static async getImportesNegativos(req, res) {
    try {
      const importesNeg = await FacturasModel.getImportesNegativos();

      return res.status(200).json(importesNeg)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Facturas', error: e.message });
    }
  }

  static async getFacturasConFiltros(req, res) {
    const { filtros } = req.body

    try {
      if (filtros) {
        const whereClausule = buildWhereClause(filtros)

        if (whereClausule) {

          const listaFacturas = await FacturasModel.getFacturasConFiltros(whereClausule);
          for (let i = 0; i < listaFacturas.length; i++) {
            listaFacturas[i]['FEC_EMIS_FAC'] = "" + formatearFecha(listaFacturas[i]['FEC_EMIS_FAC'])
            if (listaFacturas[i]["fecha_modificacion"]) listaFacturas[i]["fecha_modificacion"] = formatearFecha(listaFacturas[i]["fecha_modificacion"])

            if (listaFacturas[i]["fecha_entrega_documentacion"]) {
              listaFacturas[i]["fecha_entrega_documentacion"] = formatearFecha(listaFacturas[i]["fecha_entrega_documentacion"])
            }
          }

          return res.status(200).json(listaFacturas)
        }
      }
      const listaFacturas = await FacturasModel.getFacturasConFiltros();
      if (listaFacturas.length === 0) return res.status(404).json({ mensaje: 'No hay facturas' });
      // Iterar y convertir las fechas
      for (let i = 0; i < listaFacturas.length; i++) {
        listaFacturas[i]['FEC_EMIS_FAC'] = "" + formatearFecha(listaFacturas[i]['FEC_EMIS_FAC'])
        if (listaFacturas[i]["fecha_modificacion"]) listaFacturas[i]["fecha_modificacion"] = formatearFecha(listaFacturas[i]["fecha_modificacion"])
        if (listaFacturas[i]["fecha_entrega_documentacion"]) {
          listaFacturas[i]["fecha_entrega_documentacion"] = formatearFecha(listaFacturas[i]["fecha_entrega_documentacion"])
        }
      }

      return res.status(200).json(listaFacturas)
    } catch (e) {
      return res.status(404).json({ mensaje: 'Ocurrió un error en Facturas', error: e.message });
    }
  }

  static async agregarObservacionesMasivo(req, res) {
    const { observaciones } = req.body
    if (!Array.isArray(observaciones) || observaciones.length === 0) {
      return res.status(400).json({ mensaje: 'No se recibieron observaciones' })
    }

    try {
      const resultados = []

      for (const obs of observaciones) {
        // Validación básica por item
        if (!obs.nro_factura || !obs.idUsuario) continue

        const resultado = await FacturasModel.agregarObservacionSimple(obs)
        if (resultado) resultados.push(resultado)
      }

      return res.status(201).json({
        mensaje: `Se agregaron ${resultados.length} observaciones`,
        resultados,
      })
    } catch (e) {
      return res.status(500).json({ mensaje: e.message })
    }
  }

}

