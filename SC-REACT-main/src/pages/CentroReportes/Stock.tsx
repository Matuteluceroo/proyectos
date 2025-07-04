import { useState, useEffect } from "react"
import Estructura from "../../components/Estructura/Estructura"
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable"
import { useNavigate } from "react-router-dom"
import { useObtenerStockLive } from "../../services/connections/stock"
import type { Column } from "../../types/TableTypes"
import { formatearFecha } from "../../services/functions"
import "./Reportes.css"

type StockRow = {
  cod_articulo: string
  descripcion: string
  cod_deposito: string
  descripcion_deposito: string
  saldo_control_stock: number
  fecha_vencimiento: string
}

function useLastUpdate(
  baseTime: Date,
  intervalMin: number,
  tickMs: number = 1000
) {
  const [lastUpdate, setLastUpdate] = useState<Date>(() => {
    return computeLast(baseTime, intervalMin, new Date())
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdate(computeLast(baseTime, intervalMin, new Date()))
    }, tickMs)
    return () => clearInterval(timer)
  }, [baseTime.getTime(), intervalMin, tickMs])

  return lastUpdate
}

function computeLast(baseTime: Date, intervalMin: number, now: Date): Date {
  const diffMs = now.getTime() - baseTime.getTime()
  if (diffMs < 0) return baseTime
  const intervalMs = intervalMin * 60 * 1000
  const blocks = Math.floor(diffMs / intervalMs)
  return new Date(baseTime.getTime() + blocks * intervalMs)
}

function formatTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const Stock = () => {
  const obtenerStock = useObtenerStockLive()
  const [rows, setRows] = useState<StockRow[]>([])
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    const cargarStock = async () => {
      const data = await obtenerStock()
      setRows(data || [])
    }
    cargarStock()
  }, [])

  const listaCols: Column[] = [
    {
      id: "cod_articulo",
      label: "COD ARTICULO",
      width: "120px",
      options: true,
    },
    {
      id: "descripcion_articulo",
      label: "DESCRIPCION",
      width: "250px",
      options: true,
    },
    {
      id: "descripcion_deposito",
      label: "DESCRIPCION DEPOSITO",
      width: "250px",
      options: true,
    },
    {
      id: "saldo_control_stock",
      label: "SALDO STOCK",
      width: "140px",
      options: true,
    },
    {
      id: "fecha_vencimiento",
      label: "FECHA VENCIMIENTO",
      width: "180px",
      options: true,
      type: "date",
      value: (row: any) => formatearFecha(row.fecha_vencimiento),
    },
    {
      id: "ANMAT",
      label: "ANMAT",
      width: "140px",
      options: true,
    },
    {
      id: "laboratorio",
      label: "laboratorio",
      width: "140px",
      options: true,
    },
  ]

  const baseTime = new Date()
  baseTime.setHours(7, 59, 23, 0)

  const intervalMin = 5

  const tickMs = 1000

  // 4) Llamas al hook:
  const last = useLastUpdate(baseTime, intervalMin, tickMs)
  return (
    <Estructura>
      <div
        className="d-flex flex-column contenido-stock"
        style={{ height: "100vh", padding: "1rem" }}
      >
        {/* Encabezado centrado para todas las pantallas */}
        <div className="w-100 text-center mb-3">
          <h1
            className="headerTitle m-0"
            style={{
              textAlign: "center",
              width: isMobile ? "40%" : "100%",
              margin: "0 auto",
            }}
          >
            CONTROL DE STOCK
          </h1>

          <br />
          <p className="text-muted small d-block d-md-none mt-2">
            Última hora de actualización: <strong>{formatTime(last)}</strong>
          </p>
        </div>

        {/* Hora en pantallas grandes (derecha) */}
        <div className="d-none d-md-flex justify-content-end mb-3 w-100">
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
            Última hora de actualización: <strong>{formatTime(last)}</strong>
          </p>
        </div>

        <div
          className="d-flex justify-content-center"
          style={{ flexGrow: 1, minHeight: "0" }}
        >
          <div style={{ width: "100%", maxWidth: "1400px" }}>
            {rows.length > 0 ? (
              <VirtualizedTable
                nombreTabla={"StockLive"}
                rows={rows}
                setRows={setRows}
                columns={listaCols}
              />
            ) : (
              <div className="alert alert-warning" role="alert">
                No hay stock para mostrar.
              </div>
            )}
          </div>
        </div>
      </div>
    </Estructura>
  )
}

export default Stock
