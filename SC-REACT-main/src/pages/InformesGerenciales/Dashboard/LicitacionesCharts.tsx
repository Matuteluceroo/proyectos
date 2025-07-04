import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  PieChart,
  LineChart,
  Line,
  Pie,
  Legend,
  Cell,
} from "recharts"

type ProvinciaData = { provincia: string; cantidad: number }
type RegionData = { region: string; cantidad: number }
type NombreData = { nombre: string; cantidad: number }
type PuntoLinea = { fecha: string; [region: string]: number | string }
const colores = ["#00b3b3", "#ffc107", "#28a745", "#ff6384", "#36a2eb"]
const coloresPorRegion: Record<string, string> = {
  NOA: "#007bff",
  NEA: "#dc3545",
  CUYO: "#28a745",
  CENTRO: "#17a2b8",
  PATAGONIA: "#ffc107",
}
export const LicitacionesProvinciaChart = ({
  data,
}: {
  data: ProvinciaData[]
}) => (
  <div className="chart-card">
    <h4>Licitaciones por Provincia</h4>
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data.sort((a, b) => b.cantidad - a.cantidad)}
        layout="vertical"
      >
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="provincia" width={140} />
        <Tooltip />
        <Bar
          dataKey="cantidad"
          fill="#00b3b3"
          radius={[0, 10, 10, 0]}
          isAnimationActive
        >
          <LabelList dataKey="cantidad" position="right" fill="#333" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export const LicitacionesRegionChart = ({ data }: { data: RegionData[] }) => (
  <div className="chart-card">
    <h4>Licitaciones por Región</h4>
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          dataKey="cantidad"
          nameKey="region"
          cx="50%"
          cy="50%"
          outerRadius={110}
          label={({ name, percent }) =>
            `${name} (${(percent * 100).toFixed(0)}%)`
          }
          isAnimationActive
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colores[index % colores.length]}
            />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
)

export const LicitacionesUsuarioChart = ({ data }: { data: NombreData[] }) => (
  <div className="chart-card">
    <h4>Licitaciones por Usuario</h4>
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data.sort((a, b) => b.cantidad - a.cantidad)}
        layout="vertical"
      >
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey="nombre" width={160} />
        <Tooltip />
        <Bar
          dataKey="cantidad"
          fill="#00b3b3"
          radius={[0, 10, 10, 0]}
          isAnimationActive
        >
          <LabelList dataKey="cantidad" position="right" fill="#000" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export const LicitacionesRegionLineChart = ({
  data,
}: {
  data: PuntoLinea[]
}) => {
  if (!data || data.length === 0) return null

  const provincias = Array.from(
    new Set(
      data.flatMap((fila) => Object.keys(fila).filter((k) => k !== "fecha"))
    )
  )

  return (
    <div className="chart-card">
      <h4>Licitaciones por región (últimos meses)</h4>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
          <YAxis
            allowDecimals={false}
            label={{
              value: "Cantidad",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fill: "#666" },
            }}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />
          {provincias.map((provincia, index) => (
            <Line
              key={provincia}
              type="monotone"
              dataKey={provincia}
              stroke={colores[index % colores.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
