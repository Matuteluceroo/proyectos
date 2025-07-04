import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LabelList,
} from "recharts"
import ContenedorGrafico from "./ContenedorGraficos"
import { coloresAlternativos } from "./coloresGraficos"

type Props = {
  data: any[]
  dataKeyX: string
  dataKeyYLeft: string
  dataKeyYRight: string
  nombreYLeft?: string
  nombreYRight?: string
  titulo: string
  initialFavorite?: boolean
  onToggleFavorite?: (isFavorite: boolean) => void
  width?: string | number
  height?: string | number
  extraContent?: React.ReactNode // <-- NUEVO
}

export const GraficoBarrasDual = ({
  data,
  dataKeyX,
  dataKeyYLeft,
  dataKeyYRight,
  nombreYLeft = "Serie A",
  nombreYRight = "Serie B",
  titulo,
  initialFavorite = false,
  onToggleFavorite,
  extraContent,
  width,
  height,
}: Props) => {
  return (
    <ContenedorGrafico
      titulo={titulo}
      initialFavorite={initialFavorite}
      onToggleFavorite={onToggleFavorite}
      width={width}
      height={height}
      extraContent={extraContent}
    >
      <ResponsiveContainer width="100%" height={420}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey={dataKeyX}
            angle={-45}
            textAnchor="end"
            interval={0}
            height={80}
            tick={{ fontSize: 12, fill: "#ffffff" }}
          />
          <YAxis
            yAxisId="left"
            label={{
              value: nombreYLeft,
              angle: -90,
              position: "insideLeft",
              fill: "#ffffff",
            }}
            tick={{ fontSize: 12, fill: "#ffffff" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: nombreYRight,
              angle: -90,
              position: "insideRight",
              fill: "#ffffff", // 👈 Blanco
            }}
            tick={{ fontSize: 12, fill: "#ffffff" }}
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

          <Legend
            wrapperStyle={{
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 500,
            }}
          />

          <Bar
            yAxisId="left"
            dataKey={dataKeyYLeft}
            fill={coloresAlternativos[0]}
            name={nombreYLeft}
          >
            <LabelList
              dataKey={dataKeyYLeft}
              position="insideTop"
              fill="#ffffff"
              fontSize={12}
            />
          </Bar>
          <Bar
            yAxisId="right"
            dataKey={dataKeyYRight}
            fill={coloresAlternativos[1]}
            name={nombreYRight}
          >
            <LabelList
              dataKey={dataKeyYRight}
              position="top"
              fill="#ffffff"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ContenedorGrafico>
  )
}
