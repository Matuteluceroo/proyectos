import { useEffect, useState } from "react"
import { VariacionLicitaciones } from "./GraficosLicitaciones"
import {
  useObtenerLicitacionesPorProvincia,
  useObtenerLicitacionesPorUsuario,
  useObtenerLicitacionesPorRegion,
  useObtenerParticipacionVsMesAnterior,
  useObtenerHistorialProvincia,
} from "../../../services/connections/indicadores"
import DateRangePicker from "../../../components/RangoFecha/RangoFecha"
import { GraficoBarras } from "../../../components/Graficos/GraficoBarras"
import { GraficoTorta } from "../../../components/Graficos/GraficoTorta"
import { GraficoLineas } from "../../../components/Graficos/GraficoLineas"
import type {
  FilterConfig,
  FilterOptions,
  SelectedFilters,
} from "../../../components/Graficos/GraficosTypes"

interface VariacionProps {
  mesAnterior: string
  valorAnterior: number
  mesActual: string
  valorActual: number
  variacionPorc: number
}
interface ParticipacionPorMesType {
  Region: string
  Provincia: string
  AnioMes: string
  Cantidad: number
}
interface HistorialProvinciaResponse {
  mesActual: string
  mesesIncluidos: number
  datos: ParticipacionPorMesType[]
}

const InformesLicitaciones = () => {
  const [period, setPeriod] = useState({ start: "", end: "" })

  const obtenerLicitacionesPorProvincia = useObtenerLicitacionesPorProvincia()
  const [datosProvincias, setDatosProvincias] = useState<any[]>([])

  const obtenerLicitacionesPorUsuario = useObtenerLicitacionesPorUsuario()
  const [datosUsuarios, setDatosUsuarios] = useState<any[]>([])

  const obtenerLicitacionesPorRegion = useObtenerLicitacionesPorRegion()
  const [datosPorRegion, setDatosPorRegion] = useState<any[]>([])

  const obtenerParticipacionVsMesAnterior =
    useObtenerParticipacionVsMesAnterior()
  const [variacionData, setVariacionData] = useState<VariacionProps | null>(
    null
  )

  const obtenerHistorialProvincia = useObtenerHistorialProvincia()
  const [datosHistorialProvincia, setDatosHistorialProvincia] = useState<
    ParticipacionPorMesType[]
  >([])

  useEffect(() => {
    if (period.start === "" || period.end === "") return
    const cargarDatos = async () => {
      const datosProvincia = await obtenerLicitacionesPorProvincia({
        fechaDesde: period.start,
        fechaHasta: period.end,
      })
      const datosProvinciaTransf = datosProvincia.map((item: any) => ({
        provincia: item.Provincia,
        cantidad: item.Cantidad_Licitaciones,
      }))
      setDatosProvincias(datosProvinciaTransf)
      const datosUsuario = await obtenerLicitacionesPorUsuario({
        fechaDesde: period.start,
        fechaHasta: period.end,
      })

      const datosUsuarioTransf = datosUsuario.map((item: any) => ({
        usuario: item.nombre,
        cantidad: item.cantidad,
      }))
      setDatosUsuarios(datosUsuarioTransf)
      const datosPorRegion = await obtenerLicitacionesPorRegion({
        fechaDesde: period.start,
        fechaHasta: period.end,
      })
      const datosPorRegionTransf = datosPorRegion.map((item: any) => ({
        regiones: item.Region,
        cantidad: item.Cantidad_Licitaciones,
      }))
      setDatosPorRegion(datosPorRegionTransf)
      const datosParticipacionVsMesAnteriorn =
        await obtenerParticipacionVsMesAnterior()
      setVariacionData(datosParticipacionVsMesAnteriorn)
      const res: HistorialProvinciaResponse = await obtenerHistorialProvincia()
      setDatosHistorialProvincia(res.datos)
    }
    cargarDatos()
  }, [period])

  const filtros: FilterConfig[] = [
    { field: "Region", label: "Filtrar por región" },
    /* { field: 'Provincia', label: 'Filtrar por provincia' }, */
  ]

  const opciones: FilterOptions = {
    Region: Array.from(new Set(datosHistorialProvincia.map((d) => d.Region))),
    Provincia: Array.from(
      new Set(datosHistorialProvincia.map((d) => d.Provincia))
    ),
  }

  const [sel, setSel] = useState<SelectedFilters>({ Region: [], Provincia: [] })

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

        {variacionData && (
          <div style={{ flex: 1, minWidth: "250px" }}>
            <VariacionLicitaciones {...variacionData} />
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          justifyContent: "space-between",
        }}
      >
        <GraficoBarras
          data={datosProvincias}
          dataKeyX="provincia"
          dataKeyY="cantidad"
          titulo="Licitaciones por Provincia"
          width="48%"
          height="40vh"
        />
        <GraficoBarras
          data={datosUsuarios}
          dataKeyX="usuario"
          dataKeyY="cantidad"
          titulo="Licitaciones por Usuario"
          width="48%"
          height="40vh"
        />

        <GraficoBarras
          data={datosPorRegion}
          dataKeyX="regiones"
          dataKeyY="cantidad"
          titulo="Licitaciones por Regiones"
          width="48%"
          height="35vh"
        />
        <GraficoTorta
          data={datosPorRegion}
          dataKeyX="regiones"
          dataKeyY="cantidad"
          titulo="Participación por Regiones"
          width="48%"
          height="35vh"
        />
      </div>

      {/* Gráfico de línea full width */}
      <div style={{ marginTop: "2rem" }}>
        <GraficoLineas
          titulo={"Licitaciones por Provincia"}
          datos={datosHistorialProvincia}
          filters={filtros}
          filterOptions={opciones}
          selectedFilters={sel}
          onFiltersChange={setSel}
          xKey={"AnioMes"}
          seriesKey={"Provincia"}
          valueKey={"Cantidad"}
        />
      </div>
    </div>
  )
}

export default InformesLicitaciones
