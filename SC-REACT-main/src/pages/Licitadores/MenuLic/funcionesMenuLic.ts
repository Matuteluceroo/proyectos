import { Column } from '../../../types/TableTypes'

export const listaCols: Column[] = [
  {
    id: 'provincia',
    label: 'Provincia',
    width: '150px',
    options: true,
  },
  {
    id: 'fecha',
    label: 'Fecha',
    width: '150px',
    options: true,
    type: 'date',
  },
  {
    id: 'cliente',
    label: 'Cliente',
    width: '300px',
    options: true,
  },
  {
    id: 'nroLic',
    label: 'N° C/L',
    width: '90px',
    options: true,
    type: 'number',
  },
  {
    id: 'estado',
    label: 'Estado',
    width: '180px',
    options: true,
  },
  {
    id: 'licitadores',
    label: 'Licitadores',
    width: '320px',
    options: true,
  },
]
