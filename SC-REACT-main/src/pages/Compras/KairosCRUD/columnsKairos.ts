// columnsKairos.ts
import editarIco from "../../../assets/edit.svg"
import eliminarIco from "../../../assets/trash.svg"
import { ProductoKairos } from "./typesKairos"


export interface ColumnaKairos {
  id: string
  label: string
  width: string
  editable?: boolean
  options?: boolean
  ico?: string
  onclick?: (row: ProductoKairos) => void
}

export const getColumnasKairos = (
  modificarProducto: (row: ProductoKairos) => void,
  eliminiarProducto: (row: ProductoKairos) => void
): ColumnaKairos[] => [
  { id: "idKairos", label: "idKairos", width: "90px", options: true },
  {
    id: "laboratorio",
    label: "Laboratorio",
    width: "130px",
    editable: false,
    options: true,
  },
  {
    id: "nombre_comercial",
    label: "Nombre Comercial",
    width: "250px",
    editable: false,
    options: true,
  },
  {
    id: "droga_presentacion",
    label: "Droga Presentacion",
    width: "450px",
    editable: false,
    options: true,
  },
  {
    id: "ANMAT",
    label: "ANMAT",
    width: "100px",
    editable: false,
    options: true,
  },
  {
    id: "cod_tarot",
    label: "Tarot",
    width: "100px",
    editable: false,
    options: true,
  },
  {
    id: "cod_kairos",
    label: "Kairos",
    width: "100px",
    editable: false,
    options: true,
  },
  {
    id: "codTango",
    label: "Tango",
    width: "100px",
    editable: false,
    options: true,
  },
  {
    id: "btnEditar",
    label: "EDITAR",
    width: "100px",
    ico: editarIco,
    onclick: modificarProducto,
  },
  {
    id: "btnEliminar",
    label: "ELIMINAR",
    width: "100px",
    ico: eliminarIco,
    onclick: (row) => eliminiarProducto(row),
  },
]

export interface CampoFormularioKairos {
  nombreCampo: string;
  labelText: string;
  type: "text" | "number" | "checkbox" | "radio" | "password" | "select" | "textarea" | "date" | "time";
  placeholder: string;
}



export const camposFormProductoKairos: CampoFormularioKairos[] = [
  {
    nombreCampo: "laboratorio",
    labelText: "Laboratorio",
    type: "text",
    placeholder: "Laboratorio",
  },
  {
    nombreCampo: "nombre_comercial",
    labelText: "Nombre Comercial",
    type: "text",
    placeholder: "Nombre Comercial",
  },
  {
    nombreCampo: "droga_presentacion",
    labelText: "Droga",
    type: "text",
    placeholder: "Droga",
  },
  {
    nombreCampo: "ANMAT",
    labelText: "ANMAT",
    type: "number",
    placeholder: "ANMAT",
  },
  {
    nombreCampo: "cod_tarot",
    labelText: "Cod Tarot",
    type: "text",
    placeholder: "Tarot",
  },
  {
    nombreCampo: "cod_kairos",
    labelText: "Cod Kairos",
    type: "text",
    placeholder: "Kairos",
  },
  {
    nombreCampo: "codTango",
    labelText: "Cod Tango",
    type: "text",
    placeholder: "Tango",
  },
]
