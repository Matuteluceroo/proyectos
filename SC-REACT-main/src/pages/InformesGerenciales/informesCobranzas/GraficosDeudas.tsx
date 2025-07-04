import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from "recharts"
import { formatearNumero } from "../../../services/functions"
import ContenedorGraficos from "../../../components/Graficos/ContenedorGraficos"

export const DeudasClientes = ({ data }: { data: any[] }) => (
  <ContenedorGraficos titulo="Deudas Por Cliente" width="100%" height={500}>
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data.sort((a, b) => b.DEUDA_CLIENTE - a.DEUDA_CLIENTE)}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
        <XAxis
          type="number"
          allowDecimals={false}
          tickFormatter={(value: number) => formatearNumero(value)}
        />
        <YAxis
          type="category"
          dataKey="RAZON_SOCI"
          width={180} // aumenta este valor para que entren mejor
        />
        <Tooltip />
        <Bar
          dataKey="DEUDA_CLIENTE"
          fill="#00b3b3"
          radius={[0, 10, 10, 0]}
          maxBarSize={20} // px máximos de grosor
          isAnimationActive
        >
          <LabelList
            dataKey="DEUDA_CLIENTE"
            position="insideLeft" // o “right”, “insideLeft”…
            offset={10} // distancia en px
            fill="#0A12BC" // color contrastado
            formatter={(value: number) => formatearNumero(value)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ContenedorGraficos>
)

export const DeudasProvincias = ({ data }: { data: any[] }) => (
  <ContenedorGraficos titulo="Deudas Por Provincia" width="100%" height={500}>
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data.sort((a, b) => b.DEUDA_CLIENTE - a.DEUDA_CLIENTE)}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
      >
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
        <XAxis
          type="number"
          allowDecimals={false}
          tickFormatter={(value: number) => formatearNumero(value)}
        />
        <YAxis
          type="category"
          dataKey="PROVINCIA"
          width={180} // aumenta este valor para que entren mejor
        />
        <Tooltip />
        <Bar
          dataKey="DEUDA_PROVINCIA"
          fill="#00b3b3"
          radius={[0, 10, 10, 0]}
          maxBarSize={20} // px máximos de grosor
          isAnimationActive
        >
          <LabelList
            dataKey="DEUDA_PROVINCIA"
            position="insideLeft" // o “right”, “insideLeft”…
            offset={10} // distancia en px
            fill="#0A12BC" // color contrastado
            formatter={(value: number) => formatearNumero(value)}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ContenedorGraficos>
)
