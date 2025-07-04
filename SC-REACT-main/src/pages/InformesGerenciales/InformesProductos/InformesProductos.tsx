import { useEffect, useState } from "react"
import {
  ScatterChartProductoIndividual,
  ScatterChartCostoVsPrecio,
} from "./GraficosProductos"
import {
  useObtenerProductosTop,
  useObtenerProductosDispersion,
} from "../../../services/connections/indicadores"
import DateRangePicker from "../../../components/RangoFecha/RangoFecha"

const InformesLaboratorio = () => {
  const [period, setPeriod] = useState({ start: "", end: "" })
  const FAVORITOS_KEY = "favoritos_inicio"
  const obtenerProductosTop = useObtenerProductosTop()
  // const [datosProductosTop, setDatosProductosTop] = useState<any[]>([])
  // useEffect(() => {
  //   if (period.start === "" || period.end === "") return
  //   const cargarDatos = async () => {
  //     const datosProductosTop = await obtenerProductosTop({
  //       fechaDesde: period.start,
  //       fechaHasta: period.end,
  //     })
  //     console.log("datosProductosTop", datosProductosTop)
  //     setDatosProductosTop(datosProductosTop)
  //     //---------------------------------------------------------------------------
  //   }
  //   cargarDatos()
  // }, [period])
  const [productosTop, setProductosTop] = useState<any[]>([])
  const [productoSeleccionado, setProductoSeleccionado] = useState<null | {
    codigoTarot: string
    nombre_tarot: string
  }>(null)

  useEffect(() => {
    const cargarTop = async () => {
      if (period.start === "" || period.end === "") return
      const datos = await obtenerProductosTop({
        fechaDesde: period.start,
        fechaHasta: period.end,
      })
      setProductosTop(datos)
    }

    cargarTop()
  }, [period])
  console.log("Producto seleccionado:", productoSeleccionado)

  const guardarFavorito = (clave: string, estado: boolean) => {
    const favoritos = JSON.parse(localStorage.getItem(FAVORITOS_KEY) || "{}")
    if (estado) {
      favoritos[clave] = true
    } else {
      delete favoritos[clave]
    }
    localStorage.setItem(FAVORITOS_KEY, JSON.stringify(favoritos))
  }
  return (
    <div style={{ padding: "1rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "16px",
          padding: "1.2rem 1.5rem",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
          marginBottom: "1.5rem",
          color: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            padding: "1rem",
            boxShadow: "inset 0 0 6px rgba(255,255,255,0.05)",
            minWidth: "260px",
            color: "#e2e8f0",
            fontSize: "0.9rem",
          }}
        >
          <label
            style={{
              marginBottom: "0.5rem",
              color: "#94a3b8",
              fontWeight: 700,
            }}
          >
            Seleccionar fechas
          </label>
          <DateRangePicker
            start={period.start}
            end={period.end}
            onChange={(newRange: any) => setPeriod(newRange)}
          />
        </div>
      </div>
      <ScatterChartCostoVsPrecio
        data={productosTop}
        onProductoClick={(producto) => setProductoSeleccionado(producto)}
      />

      {productoSeleccionado && (
        <ScatterChartProductoIndividual
          codigoTarot={productoSeleccionado.codigoTarot}
          fechaDesde={period.start}
          fechaHasta={period.end}
        />
      )}
      <button
        onClick={() =>
          setProductoSeleccionado({
            codigoTarot: "3533",
            nombre_tarot: "TEST",
          })
        }
      >
        Ver gráfico TEST
      </button>
    </div>
  )
}

export default InformesLaboratorio
