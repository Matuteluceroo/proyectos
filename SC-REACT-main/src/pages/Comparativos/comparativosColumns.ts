import { Column } from "../../types/TableTypes"

const colorFila = (row: any) => {
  if (row.cargado) {
    return { backgroundColor: "#c6e7bd" } // Verde claro
  } else {
    return { backgroundColor: "#FDB7AA" } // Rojo claro
  }
}

export const comparativosColumns = (editable = false): Column[] => [
  {
    id: "nro_licitacion",
    label: "Nro Licitación",
    width: "130px",
    options: true,
    cellStyle: (row) => colorFila(row),
  },
  {
    id: "fecha",
    label: "Fecha",
    width: "110px",
    options: true,
    type: "date",
    cellStyle: (row) => colorFila(row),
  },
  {
    id: "nombre_cliente",
    label: "Cliente",
    width: "330px",
    options: true,
    cellStyle: (row) => colorFila(row),
  },
  {
    id: "tipo",
    label: "Tipo",
    width: "110px",
    options: true,
    cellStyle: (row) => colorFila(row),
  },
  {
    id: "nombre_carpeta",
    label: "Nombre Carpeta",
    width: "500px",
    options: true,
    cellStyle: (row) => colorFila(row),
  },
  {
    id: "estado",
    label: "Estado",
    width: "120px",
    options: true,
    cellStyle: (row) => colorFila(row),
    value: (row: any) => {
      if (row.cargado) {
        return "CARGADO"
      } else {
        return "PENDIENTE"
      }
    },
  },
]
