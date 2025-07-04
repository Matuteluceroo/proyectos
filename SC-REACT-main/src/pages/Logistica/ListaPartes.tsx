import React, { useEffect, useState } from "react"
import Button from "../../components/Button/Button"
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable"
import Estructura from "../../components/Estructura/Estructura"
import { useNavigate } from "react-router-dom"
import { useSocket } from "../../services/SocketContext"
import { useobtenerPartesEntrega } from "../../services/connections/logistica"
import "./Logistica.css"
import { Column } from "../../types/TableTypes"
import BotonCerrarSesion from "../../components/Button/BotonCerrarSesion"

interface ParteEntrega {
  NRO_HOJA_RUTA: string
  FECHA_PARTE: string
  FECHA_ENTREGA: string
  DESCRIPCION_LOTE: string
  id_conductor: string
  NOMBRE_TRANSP: string
  DEPOSITO: string
  OBSERVACIONES: string
  ESTADO_ENTREGA: string
  [key: string]: any
}

const ListaPartes: React.FC = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<ParteEntrega[]>([])
  const obtenerPartesEntrega = useobtenerPartesEntrega()
  const { currentUser } = useSocket()
  const isMobile = window.innerWidth <= 768
  const estiloFilaEntrega = (row: ParteEntrega) => {
    if (row.REDIRECCION === 1) {
      return {
        backgroundColor: "#CECECE",
        color: "#000000",
      }
    }
    return {}
  }
  const columnsHoja: Column[] = [
    {
      id: "NRO_HOJA_RUTA",
      label: "Nro Hoja de ruta:",
      type: "text",
      width: "120px",
      options: true,
      cellStyle: estiloFilaEntrega,
    },
    {
      id: "FECHA_PARTE",
      label: "Fecha Parte:",
      type: "date",
      width: "100px",
      options: true,
      cellStyle: estiloFilaEntrega,
    },
    {
      id: "FECHA_ENTREGA",
      label: "Fecha Entrega:",
      type: "date",
      width: "110px",
      options: true,
      cellStyle: estiloFilaEntrega,
    },
    {
      id: "DESCRIPCION_LOTE",
      label: "Descripcion lote:",
      type: "text",
      width: "300px",
      options: true,
      cellStyle: estiloFilaEntrega,
    },
    {
      id: "id_conductor",
      label: "Transporte:",
      type: "text",
      width: "100px",
      options: true,
      cellStyle: estiloFilaEntrega,
    },
    {
      id: "NOMBRE_TRANSP",
      label: "Nombre Transporte:",
      type: "text",
      width: "250px",
      options: true,
      cellStyle: estiloFilaEntrega,
    },
    {
      id: "DEPOSITO",
      label: "Deposito:",
      type: "text",
      width: "130px",
      options: true,
      cellStyle: estiloFilaEntrega,
    },
    {
      id: "OBSERVACIONES",
      label: "Observaciones:",
      type: "text",
      width: "210px",
      options: true,
      cellStyle: estiloFilaEntrega,
    },
    {
      id: "ESTADO_ENTREGA",
      label: "Estado de entrega:",
      type: "text",
      width: "150px",
      options: true,
      cellStyle: estiloFilaEntrega,
    },
  ]

  // const columnsHoja = baseColumns.map((col) => ({
  //   ...col,
  //   cellStyle: estiloFilaEntrega,
  // }))

  const handleRowClick = (rowData: ParteEntrega) => {
    navigate(`/logistica/lista-remitos/${rowData.NRO_HOJA_RUTA}`, {
      state: rowData.NRO_HOJA_RUTA,
    })
  }

  useEffect(() => {
    const getPartes = async () => {
      if (!currentUser.otros) return

      const match = currentUser.otros.match(/@([^@]+)@/)
      const deposito = match ? match[1] : null

      if (!deposito) return

      const data: ParteEntrega[] = await obtenerPartesEntrega({ deposito })
      setRows(data)
    }

    getPartes()
  }, [])

  return (
    <Estructura>
      <div
        className="d-flex flex-column"
        style={{ height: "100vh", padding: "1rem" }}
      >
        {/* Fila de título y botón */}
        <div className="row align-items-center justify-content-center mb-3">
          <div className="col-4 d-flex justify-content-start" />
          <div className="col-4 text-center">
            <h1 className="headerTitle m-0">LISTA DE PARTES</h1>
          </div>
          <div className="col-4 d-flex justify-content-end">
            {currentUser?.rol === "ADMLOGISTICA" && (
              <Button
                className="boton-accion"
                title="Crear Hoja de Ruta"
                text={isMobile ? "➕ Crear" : "➕ Crear Hoja de Ruta"}
                onClick={() => navigate("/logistica/hoja-de-ruta")}
              />
            )}
          </div>
        </div>
        <div style={{ height: isMobile ? "75vh" : "95vh", overflow: "hidden" }}>
          <div className="row h-100" style={{ overflowX: "auto" }}>
            <div className="col-12 d-flex flex-column h-100">
              <div
                className="table-container flex-grow-1"
                style={{ overflowY: "auto", margin: "5px" }}
              >
                <VirtualizedTable
                  columns={columnsHoja}
                  rows={rows}
                  setRows={setRows}
                  onClickRow={handleRowClick}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Estructura>
  )
}

export default ListaPartes
