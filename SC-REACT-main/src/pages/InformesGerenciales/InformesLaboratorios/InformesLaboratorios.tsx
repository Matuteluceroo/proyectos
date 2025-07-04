import { useEffect, useState } from "react"
import { BarChartLaboratorios } from "./GraficosLaboratorio"
import { useObtenerLaboratoriosTop } from "../../../services/connections/indicadores"
import DateRangePicker from "../../../components/RangoFecha/RangoFecha"

const InformesLaboratorio = () => {
  const [period, setPeriod] = useState({ start: "", end: "" })

  const obtenerLaboratoriosTop = useObtenerLaboratoriosTop()
  const [datosLaboratoriosTop, setDatosLaboratoriosTop] = useState<any[]>([])
  useEffect(() => {
    if (period.start === "" || period.end === "") return
    const cargarDatos = async () => {
      const datosLaboratoriosTop = await obtenerLaboratoriosTop({
        fechaDesde: period.start,
        fechaHasta: period.end,
      })
      console.log("datosLaboratoriosTop", datosLaboratoriosTop)
      setDatosLaboratoriosTop(datosLaboratoriosTop)
      //---------------------------------------------------------------------------
    }
    cargarDatos()
  }, [period])
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
      <BarChartLaboratorios data={datosLaboratoriosTop} />
    </div>
  )
}

export default InformesLaboratorio
