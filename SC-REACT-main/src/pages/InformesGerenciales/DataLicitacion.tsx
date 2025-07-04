import { useEffect, useState } from 'react'
import { useObtenerLicitacionByID } from '../../services/connections/licitaciones'
import { formatearNumero } from '../../services/functions'
import VirtualizedTable from '../../components/VirtualizedTable/VirtualizedTable'
import Estructura from '../../components/Estructura/Estructura'
import { Column } from '../../types/TableTypes'
import InfoItem from '../../components/InfoItem/InfoItem'

interface Renglon {
  renglon: number
  cantidad: number
  descripcion: string
  laboratorio_elegido: string
  costo_elegido?: number | string
  precio_vta?: number | string
  precio_vta_total?: number
  margen?: string
}

interface LicitacionData {
  id: number
  renglones: Renglon[]
  [key: string]: any
}

const InformeLicitacion = () => {
  const [dataLicitacion, setDataLicitacion] = useState<LicitacionData | null>(
    null
  )
  const [renglonesDemanda, setRenglonesDemanda] = useState<Renglon[]>([])
  const obtenerLicitacionByID = useObtenerLicitacionByID()

  const columnasDemanda: Column[] = [
    { id: 'renglon', label: 'R', width: '50px', type: 'number', options: true },
    {
      id: 'cantidad',
      label: 'CANT',
      width: '55px',
      type: 'number',
      options: true,
    },
    { id: 'descripcion', label: 'DESCRIPCIÓN', width: '210px', options: true },
    {
      id: 'laboratorio_elegido',
      label: 'LAB ELEGIDO',
      width: '90px',
      options: true,
    },
    {
      id: 'costo_elegido',
      label: 'COSTO ELEGIDO',
      width: '100px',
      type: 'number',
      options: true,
      value: (row: Renglon) => {
        const val = Number(row.costo_elegido)
        return isNaN(val) ? '-' : '$' + formatearNumero(val)
      },
    },
    {
      id: 'precio_vta',
      label: 'PRECIO VTA',
      width: '100px',
      type: 'number',
      options: true,
      value: (row: Renglon) => {
        const val = Number(row.precio_vta)
        return isNaN(val) ? '-' : '$' + formatearNumero(val)
      },
    },
    {
      id: 'precio_vta_total',
      label: 'PRECIO VTA TOTAL',
      width: '120px',
      type: 'number',
      options: true,
      value: (row: Renglon) => {
        const precio_u = parseFloat(String(row.precio_vta))
        const cantidad = parseFloat(String(row.cantidad))
        const precioVtaTot = precio_u * cantidad
        row.precio_vta_total = precioVtaTot
        return isNaN(precioVtaTot)
          ? '-'
          : '$' + formatearNumero(precioVtaTot.toString())
      },
    },
    { id: 'margen', label: 'MARGEN', width: '85px', options: true },
  ]

  useEffect(() => {
    const getData = async () => {
      const params = new URLSearchParams(window.location.search)
      const idLicitacion = params.get('id')
      if (idLicitacion) {
        const dataLic = await obtenerLicitacionByID({ idLicitacion })
        setDataLicitacion(dataLic)
        setRenglonesDemanda(dataLic.renglones)
      }
    }
    getData()
  }, [])

  return (
    <Estructura>
      {dataLicitacion && (
        <div
          style={{ height: '10vh' }}
          className="data-cliente-row"
        >
          <InfoItem
            fieldName="CLIENTE"
            value={dataLicitacion.cliente || ''}
          />
          <InfoItem
            fieldName="OBJETO"
            value={dataLicitacion.objeto || ''}
          />
          <InfoItem
            fieldName="FECHA"
            value={dataLicitacion.fecha || ''}
          />
          <InfoItem
            fieldName="TIPO"
            value={dataLicitacion.tipo || ''}
          />
          <InfoItem
            fieldName="HORA"
            value={dataLicitacion.hora || ''}
          />
          <InfoItem
            fieldName="N° C/L"
            value={dataLicitacion.nroLic || ''}
          />
        </div>
      )}

      <div
        style={{
          height: '70vh',
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '55%',
            maxWidth: '1200px',
            height: '100%',
          }}
        >
          <VirtualizedTable
            rows={renglonesDemanda}
            columns={columnasDemanda}
            setRows={setRenglonesDemanda}
          />
        </div>
      </div>
    </Estructura>
  )
}

export default InformeLicitacion
