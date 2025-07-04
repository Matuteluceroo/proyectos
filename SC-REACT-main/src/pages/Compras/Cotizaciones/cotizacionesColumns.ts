import { formatearNumero } from '../../../services/functions'
import agregarIco from '../../../assets/add.svg'
import { Column } from '../../../types/TableTypes'
type EnviarRenglonFn = (row: any, rowIndex: number) => void

export const getCotizacionesColumns = (
  enviarRenglonCotizacion: EnviarRenglonFn
): Column[] => [
  {
    id: 'nroLic',
    label: 'Nro Lic',
    width: '65px',
    editable: false,
    type: 'number',
    options: true,
  },
  {
    id: 'cliente',
    label: 'Cliente',
    width: '150px',
    editable: false,
    options: true,
  },
  {
    id: 'renglon',
    label: 'R',
    width: '50px',
    editable: false,
    options: true,
    type: 'number',
  },
  {
    id: 'cantidad',
    label: 'Cant',
    width: '70px',
    editable: false,
    options: true,
    type: 'number',
  },
  {
    id: 'descripcion',
    label: 'Descripción (pliego)',
    width: '310px',
    editable: false,
    options: true,
  },
  {
    id: 'codigoTarot',
    label: 'Cod Tarot',
    width: '80px',
    editable: false,
    type: 'number',
    options: true,
  },
  {
    id: 'laboratorio',
    label: 'Laboratorio',
    width: '90px',
    editable: false,
    options: true,
  },
  {
    id: 'nombre_comercial',
    label: 'Nombre Comercial',
    width: '140px',
    editable: false,
    options: true,
  },
  {
    id: 'droga_presentacion',
    label: 'Droga + Presentación (KAIROS)',
    width: '300px',
    editable: false,
    options: true,
  },
  {
    id: 'costoFinal',
    label: 'Costo U.',
    width: '70px',
    editable: (row) => (row.idCompra ? false : true),
    options: true,
    type: 'number',
    cellStyle: (row) => {
      if (row.idCompra) {
        return { backgroundColor: '#d4d4d4' }
      }
      return {}
    },
  },
  {
    id: 'mantenimiento',
    label: 'Mantenimiento',
    width: '100px',
    editable: (row) => (row.idCompra ? false : true),
    options: true,
    cellStyle: (row) => {
      if (row.idCompra !== null) {
        return { backgroundColor: '#d4d4d4' }
      }
      return {}
    },
  },
  {
    id: 'observaciones',
    label: 'Observaciones',
    width: '100px',
    editable: (row) => (row.idCompra ? false : true),
    options: true,
    cellStyle: (row) => {
      if (row.idCompra !== null) {
        return { backgroundColor: '#d4d4d4' }
      }
      return {}
    },
  },
  {
    id: 'valorizado',
    label: 'Valorizado',
    width: '110px',
    editable: false,
    options: true,
    value: (row) => {
      const costo_u = parseFloat(row['costoFinal'])
      const cantidad = parseFloat(row['cantidad'])
      const precioVtaTot = costo_u * cantidad
      row.valorizado = precioVtaTot

      if (isNaN(precioVtaTot)) return '-'

      return '$ ' + formatearNumero(precioVtaTot.toString())
    },
  },
  {
    id: 'ANMAT',
    label: 'ANMAT',
    width: '70px',
    editable: false,
    type: 'number',
    options: true,
  },
  {
    id: 'nombre_usuario',
    label: 'Usuario',
    width: '110px',
    editable: false,
    options: true,
  },
  {
    id: 'fechora_comp',
    label: 'Fecha',
    width: '130px',
    editable: false,
    options: true,
  },
  {
    id: 'btnAgregar',
    label: 'Agregar',
    width: '100px',
    editable: false,
    ico: agregarIco,
    onclick: enviarRenglonCotizacion,
  },
  // {
  //   id: "btnOcultar",
  //   label: "Ocultar",
  //   width: "45px",
  //   editable: false,
  //   ico: ocultarIco, // Nuevo atributo para el icono
  //   onclick: handleDeleteRow,
  // },
  { id: 'idUsuario', label: 'IDUSER', width: '1px', visible: false },
  { id: 'idKairos', label: 'IDKai', width: '1px', visible: false },
  { id: 'idLicitacion', label: 'IDLic', width: '1px', visible: false },
  { id: 'idCompra', label: 'IDCom', width: '1px', visible: false },
  { id: 'idRenglon', label: 'idRenglon', width: '1px', visible: false },
]
