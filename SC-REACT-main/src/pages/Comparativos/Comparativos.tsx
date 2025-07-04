import React, { useState, useEffect } from 'react'
import Estructura from '../../components/Estructura/Estructura'
import VirtualizedTable from '../../components/VirtualizedTable/VirtualizedTable'
import { comparativosColumns } from './comparativosColumns'
import { useSocket } from '../../services/SocketContext'
import {
  useListarComparativos,
  useMarcarCargado,
  useQuitarCargado,
} from '../../services/connections/comparativos'
import './comparativos.css'

const Comparativos: React.FC = () => {
  const { currentUser } = useSocket()
  const [rows, setRows] = useState<any[]>([])
  const [cantidadFilas, setCantidadFilas] = useState<number>(0)
  const [cantidadPendientes, setCantidadPendientes] = useState<number>(0)
  const listarComparativos = useListarComparativos()
  const marcarCargado = useMarcarCargado()
  const quitarCargado = useQuitarCargado()
  useEffect(() => {
    const fetchData = async () => {
      const response = await listarComparativos()
      setRows(response)
    }

    fetchData()
  }, [])

  const filtrosCambian = (
    filters: { [key: string]: string[] },
    filteredSortedRows: any[]
  ) => {
    setCantidadFilas(filteredSortedRows.length)
    setCantidadPendientes(
      filteredSortedRows.filter((row) => row.cargado === false).length
    )
  }

  const listaColumsLicitacion = comparativosColumns(true)

  const enviarDatosApi = async (nombre_carpeta: string, cargado: boolean) => {
    if (cargado) {
      await marcarCargado({ nombre_carpeta })
    } else {
      await quitarCargado({ nombre_carpeta })
    }
  }

  const cambiarEstadoComparativo = (row: any) => {
    let autorizado = false
    currentUser?.roles_usuario.forEach((r_ol: any) => {
      if (r_ol.rol === 'ADMIN-COMPARATIVOS') {
        autorizado = true
      }
    })
    if (!autorizado) return

    setRows((prevRows) =>
      prevRows.map((item) =>
        item.nombre_carpeta === row.nombre_carpeta
          ? { ...item, cargado: !row.cargado }
          : item
      )
    )
    const cargado = !row.cargado
    enviarDatosApi(row.nombre_carpeta, cargado)
  }

  return (
    <Estructura>
      <h1 className="headerTitle m-0">CONTROL DE COMPARATIVOS</h1>

      <div className="contenedor-cantidad-comparativos">
        <p className="cantidad-comparativos">
          CANTIDAD FILTRADOS: {cantidadFilas}
        </p>
        <p className="cantidad-comparativos">
          CANTIDAD PENDIENTES: {cantidadPendientes}
        </p>
      </div>
      <div
        style={{
          height: '75vh',
          display: 'flex',
          justifyContent: 'center', // ✅ Centra horizontalmente
          alignItems: 'start', // 🚫 Alinea arriba
          padding: 0,
        }}
      >
        <div style={{ height: '80vh' }}>
          <VirtualizedTable
            rows={rows}
            columns={listaColumsLicitacion}
            setRows={setRows}
            onFiltersChange={filtrosCambian}
            onClickRow={cambiarEstadoComparativo}
          />
        </div>
      </div>
    </Estructura>
  )
}

export default Comparativos
