import { formatearNumero } from "../../services/functions"
import { Column } from "../../types/TableTypes"

export const calcularTotal = (data: any[]): number => {
  return data.reduce((acc: number, row) => {
    const importe = parseFloat(row.IMPORTE ?? 0)
    const saldado = parseFloat(row.SALDADO ?? 0)
    return acc + importe + saldado
  }, 0)
}

export const filtrarData = (
  data: any[],
  filtros: Record<string, any>
): any[] => {
  return data.filter((row) =>
    Object.entries(filtros).every(([key, val]) => {
      if (val == null) return true
      const valorFiltro = val.toString().toLowerCase()
      const valorCelda = row[key]?.toString().toLowerCase()
      return valorCelda?.includes(valorFiltro)
    })
  )
}

export const cobranzaColumns: Column[] = [
  {
    id: "PROVINCIA",
    label: "Provincia",
    width: "130px",
    editable: false,
    options: true,
  },
  {
    id: "RAZON_SOCI",
    label: "Razon Social",
    width: "190px",
    editable: false,
    options: true,
  },
  {
    id: "NRO_OC_COMP",
    label: "Nro OC",
    width: "120px",
    editable: false,
    options: true,
  },
  {
    id: "NRO_FAC",
    label: "Nro Factura",
    width: "130px",
    editable: false,
    options: true,
  },
  {
    id: "FEC_EMIS_FAC",
    label: "Fecha Emision Factura",
    width: "150px",
    editable: false,
    options: true,
    type: "date",
  },
  {
    id: "DIAS",
    label: "Dias",
    width: "50px",
    editable: false,
    options: false,
    value: (row: any) => {
      const fechaInicio = new Date(row["FEC_EMIS_FAC"])
      const fechaHoy: Date = new Date()

      const diferenciaTiempo: number =
        fechaHoy.getTime() - fechaInicio.getTime()
      const diasDiferencia = Math.floor(
        diferenciaTiempo / (1000 * 60 * 60 * 24)
      )

      return diasDiferencia.toString()
    },
  },
  {
    id: "IMPORTE",
    label: "Importe",
    width: "115px",
    editable: false,
    options: true,
    value: (row) => {
      return "$ " + formatearNumero(row["IMPORTE"], 2).toString()
    },
  },
  {
    id: "ESTADO",
    label: "Pend Cobrar / Imputar",
    width: "110px",
    editable: false,
    options: true,
  },
  {
    id: "op_exp",
    label: "OP/Exp",
    width: "70px",
    editable: false,
    options: true,
    value: (row) => {
      if (row["op_exp"] === null) return " - "
      return row["op_exp"]
    },
  },
  {
    id: "observaciones",
    label: "Observaciones",
    width: "170px",
    editable: false,
    options: true,
    value: (row) => {
      if (row["observaciones"] === null) return " - "
      return row["observaciones"]
    },
  },
  {
    id: "fecha_modificacion",
    label: "Fecha Obs",
    width: "130px",
    editable: false,
    options: true,
  },
  {
    id: "fecha_entrega_documentacion",
    label: "Fecha entrega Doc",
    width: "130px",
    editable: false,
    options: true,
  },
  {
    id: "SALDADO",
    label: "Saldado",
    width: "120px",
    editable: false,
    options: false,
    value: (row) => {
      if (row["SALDADO"] === null || row["SALDADO"] === 0) return " - "
      return "$ " + formatearNumero(row["SALDADO"], 2).toString()
    },
  },
]
export const getFacturaColumns = (): Column[] => [
  {
    id: "fecha_gestion",
    label: "Fecha Gestion",
    width: "80px",
    editable: false,
    options: true,
  },
  {
    id: "op_exp",
    label: "OP/EXP",
    width: "65px",
    editable: false,
    options: true,
  },
  {
    id: "habilitado_pago",
    label: "Habilitado P/Pago",
    width: "70px",
    editable: false,
    options: true,
  },
  {
    id: "fecha_entrega_documentacion",
    label: "Fecha Entrega Doc",
    width: "90px",
    editable: false,
    options: true,
  },
  {
    id: "observaciones",
    label: "Observaciones",
    width: "190px",
    editable: false,
    options: true,
  },
  {
    id: "nombreUsuario",
    label: "Usuario",
    width: "90px",
    editable: false,
    options: true,
  },
  {
    id: "fecha_modificacion",
    label: "Fecha Obs",
    width: "90px",
    editable: false,
    options: true,
  },
]
export const getFacturaDocsColumns = (): Column[] => [
  {
    id: "T_COMP",
    label: "Tipo de Comprobante",
    width: "150px",
    editable: false,
    options: true,
  },
  {
    id: "NRO_COMPROBANTE",
    label: "Nro de Comprobante",
    width: "150px",
    editable: false,
    options: true,
  },
  {
    id: "IMPORTE",
    label: "Importe",
    width: "130px",
    editable: false,
    options: true,
    value: (row) => {
      return "$ " + formatearNumero(row["IMPORTE"], 2).toString()
    },
  },
  {
    id: "FECHA_RECIBO",
    label: "Fecha",
    width: "100px",
    editable: false,
    options: true,
  },
  {
    id: "ESTADO",
    label: "Estado",
    width: "150px",
    editable: false,
    options: true,
  },
]
