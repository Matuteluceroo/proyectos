import React, { useState, useEffect, useRef } from "react"
import VirtualizedTable from "../../../components/VirtualizedTable/VirtualizedTable"
import { getEncabezadosTablaCotizaciones } from "./columnas"

type DTableCotizProps = {
  rows: any[]
  setRows: React.Dispatch<React.SetStateAction<any[]>>
  elegirCotizacionRenglon: (row: any) => void
}

export const DTableCotizaciones = ({
  rows: cotizaciones,
  setRows: setCotizaciones,
  elegirCotizacionRenglon,
}: DTableCotizProps) => {
  const [costosMasNuevos, setCostosMasNuevos] = useState<any>({})
  const [costosMenores, setCostosMenores] = useState<any>({})
  const resaltarCostoMasNuevo = () => {
    // Crear un objeto para almacenar los costos mínimos por renglon
    const fechoraPorRenglon: any = {}

    cotizaciones.forEach((item) => {
      const renglon = item.renglon
      const fechora = item.fechora_comp
      if (fechora) {
        // Si el renglon no está en el objeto, agregarlo con el valor del costoFinal
        if (!fechoraPorRenglon[renglon]) {
          fechoraPorRenglon[renglon] = fechora
        } else {
          if (fechoraPorRenglon[renglon] < fechora) {
            fechoraPorRenglon[renglon] = fechora
          }
        }
      }
    })

    setCostosMasNuevos(fechoraPorRenglon)
  }

  const resaltarMenorCosto = () => {
    const costoPorRenglon: any = {}

    cotizaciones.forEach((item) => {
      const renglon = item.renglon
      const menorCosto = item.costoFinal
      if (menorCosto) {
        // Si el renglon no está en el objeto, agregarlo con el valor del costoFinal
        if (!costoPorRenglon[renglon]) {
          costoPorRenglon[renglon] = menorCosto
        } else {
          if (costoPorRenglon[renglon] > menorCosto) {
            costoPorRenglon[renglon] = menorCosto
          }
        }
      }
    })

    setCostosMenores(costoPorRenglon)
  }

  useEffect(() => {
    resaltarCostoMasNuevo()
    resaltarMenorCosto()
  }, [cotizaciones])

  const estiloCeldaCosto = (row: any) => {
    const costo = costosMenores[row["renglon"]]

    if (row["descripcion_deposito"]) {
      return { backgroundColor: "#FDB7AA" }
    }
    if (costo === row["costoFinal"]) {
      return { backgroundColor: "#c6e7bd" }
    } else {
      return null
    }
  }
  const encabezadosTablaCotizaciones = getEncabezadosTablaCotizaciones(
    costosMasNuevos,
    estiloCeldaCosto
  )

  return (
    <VirtualizedTable
      rows={cotizaciones}
      columns={encabezadosTablaCotizaciones}
      setRows={setCotizaciones}
      onClickRow={elegirCotizacionRenglon}
    />
  )
}
