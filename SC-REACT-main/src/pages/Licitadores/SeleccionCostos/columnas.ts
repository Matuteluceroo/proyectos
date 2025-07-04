import { formatearNumero } from "../../../services/functions"
import { Column } from "../../../types/TableTypes"
import eliminarIco from "../../../assets/trash.svg"

export const getColumnasLicitacion = (
  modoPrecio: string,
  calcularTotal: () => void
): Column[] => [
  {
    id: "alternativo",
    label: "idalternativo",
    width: "0px",
    type: "number",
    visible: false,
    editable: false,
    options: false,
  },
  {
    id: "codigoTarot",
    label: "idcodigoTarot",
    width: "1px",
    type: "number",
    visible: false,
    editable: false,
    options: false,
  },
  {
    id: "idLicitacion",
    label: "idLicitacion",
    width: "1px",
    type: "number",
    visible: false,
    editable: false,
    options: false,
  },
  {
    id: "idRenglon",
    label: "idRenglon",
    width: "1px",
    type: "number",
    visible: false,
    editable: false,
    options: false,
  },
  {
    id: "renglon",
    label: "R",
    width: "50px",
    type: "number",
    editable: false,
    options: true,
  },
  {
    id: "cantidad",
    label: "Cantidad",
    width: "70px",
    type: "number",
    editable: false,
    options: true,
  },
  {
    id: "descripcion",
    label: "Descripcion",
    width: "180px",
    editable: false,
    options: true,
  },
  {
    id: "descripcionTarot",
    label: "Nombre Tarot",
    width: "200px",
    editable: false,
    options: true,
  },
  {
    id: "nombre_comercial",
    label: "Nombre Comercial",
    width: "100px",
    editable: true,
    options: true,
  },
  {
    id: "laboratorio_elegido",
    label: "Lab Elegido",
    width: "100px",
    editable: true,
    options: true,
  },
  {
    id: "ANMAT",
    label: "ANMAT",
    width: "60px",
    editable: true,
    options: true,
  },
  {
    id: "costo_elegido",
    label: "Costo Elegido",
    width: "70px",
    editable: true,
    type: "number",
    options: true,
  },
  {
    id: "precio_vta",
    label: "Precio vta",
    width: "70px",
    options: true,
    editable: modoPrecio === "precio",
    type: "number",
    value: (row) => {
      if (row["precio_vta"] === "") {
        row["precio_vta"] = ""
        row["margen"] = ""
        return undefined
      }

      if (modoPrecio === "precio") return row["precio_vta"] || undefined

      const margen = parseFloat(row["margen"])
      if (isNaN(margen)) return "-"

      const costo_elegido = parseFloat(row["costo_elegido"])
      if (isNaN(costo_elegido)) return "-"

      const divisor = margen / 100 - 1
      if (divisor === 0) return "-"

      const precio_vta = (-costo_elegido / divisor).toFixed(2)
      row["precio_vta"] = precio_vta
      return formatearNumero(precio_vta)
    },
  },
  {
    id: "precio_vta_total",
    label: "Precio Total",
    width: "80px",
    options: true,
    editable: false,
    value: (row) => {
      const precio_u = parseFloat(row["precio_vta"])
      const cantidad = parseFloat(row["cantidad"])
      const precioVtaTot = precio_u * cantidad

      if (isNaN(precioVtaTot)) {
        row.precio_vta_total = null
        return "-"
      }

      row.precio_vta_total = precioVtaTot

      setTimeout(() => {
        calcularTotal()
      }, 10)

      return formatearNumero(precioVtaTot.toString())
    },
  },
  {
    id: "observaciones",
    label: "Observaciones Cliente",
    width: "115px",
    editable: true,
    options: true,
  },
  {
    id: "margen",
    label: "Margen",
    width: "65px",
    options: true,
    editable: modoPrecio === "margen",
    value: (row) => {
      if (modoPrecio === "margen") return row["margen"] || undefined

      const precio_vta = parseFloat(row["precio_vta"])
      if (isNaN(precio_vta)) return "-"

      const costo_elegido = parseFloat(row["costo_elegido"])
      if (isNaN(costo_elegido)) return "-"

      const margen = (
        ((precio_vta - costo_elegido) / precio_vta) *
        100
      ).toFixed(2)
      row["margen"] = margen
      return formatearNumero(margen) + "%"
    },
  },
  {
    id: "observaciones_internas",
    label: "Observaciones Internas",
    width: "110px",
    editable: true,
    options: true,
  },
]

export const getEncabezadosTablaCotizaciones = (
  costosMasNuevos: [string],
  estiloCeldaCosto: (row: any) => React.CSSProperties | null
): Column[] => [
  {
    id: "renglon",
    label: "R",
    width: "45px",
    type: "number",
    editable: false,
    options: true,
    cellStyle: (row) => {
      const fecha = costosMasNuevos[row["renglon"]]
      if (fecha !== undefined && fecha === row["fechora_comp"]) {
        return { backgroundColor: "#e4d270" }
      }
      return null
    },
  },
  {
    id: "cantidad",
    label: "Cantidad",
    width: "65px",
    type: "number",
    editable: false,
    options: true,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
  {
    id: "descripcion",
    label: "Descripción (pliego)",
    width: "300px",
    editable: false,
    options: true,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
  {
    id: "laboratorio",
    label: "Laboratorio",
    width: "85px",
    editable: false,
    options: true,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
  {
    id: "costoFinal",
    label: "Costo Unitario",
    width: "70px",
    type: "number",
    editable: false,
    options: true,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
  {
    id: "mantenimiento",
    label: "Mant/ Act lista / etc",
    width: "80px",
    editable: false,
    options: true,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
  {
    id: "observaciones",
    label: "Observaciones",
    width: "150px",
    editable: false,
    options: true,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
  {
    id: "ANMAT",
    label: "ANMAT",
    width: "55px",
    editable: false,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
  {
    id: "nombre_comercial",
    label: "Nombre Comercial",
    width: "300px",
    editable: false,
    options: true,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
  {
    id: "droga_presentacion",
    label: "Droga + Presentación (KAIROS)",
    width: "300px",
    options: true,
    editable: false,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
  {
    id: "modificadoPor",
    label: "Cotizado por",
    width: "110px",
    editable: false,
    options: true,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
  {
    id: "fechora_comp",
    label: "Fecha Cotizacion",
    width: "110px",
    editable: false,
    options: true,
    cellStyle: (row) => estiloCeldaCosto(row),
  },
]

// MODALS
export const getColumnasAlternativoAdd = (): Column[] => [
  { id: "idRenglon", label: "ID", width: "50px", visible: false },
  {
    id: "renglon",
    label: "R",
    width: "50px",
    type: "number",
    editable: false,
  },
  {
    id: "cantidad",
    label: "Cantidad",
    width: "75px",
    type: "number",
    editable: false,
  },
  {
    id: "descripcion",
    label: "Descripcion",
    width: "300px",
    editable: false,
  } /* 
  { id: "codigoTarot", label: "COD TAROT", width: "75px", visible: false }, */,
]

export const getColumnasAlternativoEliminar = (
  eliminarAlternativo: (row: any) => void
): Column[] => [
  {
    id: "renglon",
    label: "R",
    width: "75px",
    type: "number",
    editable: false,
  },
  {
    id: "descripcion",
    label: "Descripcion",
    width: "300px",
    editable: false,
  },
  { id: "codigoTarot", label: "Cod Tarot", width: "75px", visible: false },
  {
    id: "btnEliminar",
    label: "Eliminar",
    width: "95px",
    ico: eliminarIco, // Nuevo atributo para el icono
    onclick: async (row) => await eliminarAlternativo(row), // Función de clic personalizada
  },
]

export const getColumnasDemanda = (): Column[] => [
  {
    id: "renglon",
    label: "R",
    width: "75px",
    type: "number",
    editable: false,
  },
  {
    id: "cantidad",
    label: "Cantidad",
    width: "75px",
    type: "number",
    editable: false,
  },
  {
    id: "descripcion",
    label: "Descripcion",
    width: "300px",
    editable: false,
  },
  {
    id: "laboratorio_elegido",
    label: "Lab Elegido",
    width: "100px",
    editable: false,
  },
  {
    id: "costo_elegido",
    label: "Costo Elegido",
    width: "75px",
    editable: false,
    type: "number",
  },
  { id: "codigoTarot", label: "Cod Tarot", width: "50px", visible: false },
  {
    id: "nombre_comercial",
    label: "Nombre Comercial",
    width: "200px",
    visible: false,
  },
  {
    id: "laboratorio_elegido",
    label: "Lab Elegido",
    width: "100px",
    visible: false,
  },
  { id: "ANMAT", label: "ANMAT", width: "50px", visible: false },
  {
    id: "costo_elegido",
    label: "Costo Elegido",
    width: "75px",
    visible: false,
  },
]
