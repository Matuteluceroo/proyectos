import { useState } from "react"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import "./Graficos.css"
import type {
  FilterConfig,
  FilterOptions,
  SelectedFilters,
  PivotOptions,
} from "./GraficosTypes"
import ContenedorGraficos from "./ContenedorGraficos"
import { coloresAlternativos, coloresLinea } from "./coloresGraficos"

// FILTROS
interface GraficoLineasProps {
  datos: any[]
  titulo: string
  filters: FilterConfig[]
  filterOptions: FilterOptions
  selectedFilters: SelectedFilters
  onFiltersChange: (newSelection: SelectedFilters) => void
  xKey: string
  seriesKey: string
  valueKey: string
  initialFavorite?: boolean
  onToggleFavorite?: (isFavorite: boolean) => void
  width?: string | number
  height?: string | number
}

export const GraficoLineas = ({
  datos,
  titulo,
  filters,
  filterOptions,
  selectedFilters,
  onFiltersChange,
  xKey,
  seriesKey,
  valueKey,
  width,
  height,
  initialFavorite = false,
  onToggleFavorite,
}: GraficoLineasProps) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const datosFiltrados = datos.filter((d) =>
    filters.every(({ field }) => {
      const sel = selectedFilters[field] || []
      return sel.length === 0 || sel.includes(d[field])
    })
  )

  const dataTransformada = pivotData(datosFiltrados, {
    xKey: xKey,
    seriesKey: seriesKey,
    valueKey: valueKey,
  })
  const series = Object.keys(dataTransformada[0] || {}).filter(
    (k) => k !== xKey
  )
  return (
    <ContenedorGraficos
      titulo={titulo}
      initialFavorite={initialFavorite}
      onToggleFavorite={onToggleFavorite}
      width={width}
      height={height}
      extraContent={
        <div className="filter-row">
          {filters.map(({ field, label }) => (
            <div key={field} className="filter-group">
              <label className="filter-label">{label}</label>
              <div className="filter-options">
                {filterOptions[field].map((opt) => (
                  <label key={opt} className="filter-option">
                    <input
                      type="checkbox"
                      value={opt}
                      checked={(selectedFilters[field] || []).includes(opt)}
                      onChange={(e) => {
                        const checked = e.target.checked
                        const prev = selectedFilters[field] || []
                        const next = checked
                          ? [...prev, opt]
                          : prev.filter((v) => v !== opt)
                        onFiltersChange({
                          ...selectedFilters,
                          [field]: next,
                        })
                      }}
                    />
                    {opt}
                  </label>
                ))}
                {selectedFilters[field]?.length > 0 && (
                  <button
                    className="clear-filter"
                    onClick={() =>
                      onFiltersChange({ ...selectedFilters, [field]: [] })
                    }
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={dataTransformada}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="AnioMes"
            tick={{ fill: "#ffffff", fontSize: 12 }}
            axisLine={{ stroke: "#ffffff" }}
            tickLine={{ stroke: "#ffffff" }}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#ffffff", fontSize: 12 }}
            axisLine={{ stroke: "#ffffff" }}
            tickLine={{ stroke: "#ffffff" }}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #334155",
              borderRadius: "10px",
              color: "#f8fafc",
              fontSize: 13,
            }}
          />

          <Legend />
          {series.map((prov, index) => (
            <Line
              key={prov}
              type="monotone"
              dataKey={prov}
              stroke={colores[index % colores.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ContenedorGraficos>
  )
}

const colores = coloresLinea

// HASTA AQUI PERFECTO
/* function transformarDatosLineChart(datosOriginales: any[]) {
  const provincias = [...new Set(datosOriginales.map((d) => d.Provincia))]
  const meses = [...new Set(datosOriginales.map((d) => d.AnioMes))].sort()

  const datosPorMes: Record<string, any> = {}
  meses.forEach((mes) => {
    datosPorMes[mes] = { AnioMes: mes }
    provincias.forEach((prov) => {
      datosPorMes[mes][prov] = 0
    })
  })

  datosOriginales.forEach((d) => {
    datosPorMes[d.AnioMes][d.Provincia] = d.Cantidad
  })

  return Object.values(datosPorMes)
} */
function pivotData<T, X extends keyof T, S extends keyof T, V extends keyof T>(
  datos: T[],
  { xKey, seriesKey, valueKey }: PivotOptions<T, X, S, V>
): Array<Record<string, any>> {
  // 1) extraigo todos los valores únicos de X y de S
  const xs = Array.from(new Set(datos.map((d) => String(d[xKey])))).sort(
    (a, b) => a.localeCompare(b)
  )
  const series = Array.from(new Set(datos.map((d) => String(d[seriesKey]))))

  // 2) creo un mapa inicial: para cada x, tengo un objeto con xKey más cada serie a 0
  const mapa: Record<string, any> = {}
  xs.forEach((xVal) => {
    mapa[xVal] = { [xKey]: xVal }
    series.forEach((sVal) => {
      mapa[xVal][sVal] = 0
    })
  })

  // 3) relleno los valores que existen en los datos
  datos.forEach((d) => {
    const xVal = String(d[xKey])
    const sVal = String(d[seriesKey])
    const v = Number(d[valueKey]) || 0
    if (mapa[xVal]) {
      mapa[xVal][sVal] = v
    }
  })

  // 4) devuelvo un array ordenado por xs
  return xs.map((xVal) => mapa[xVal])
}
