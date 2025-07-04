import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LabelList,
} from "recharts"
import { useState } from "react"
import "./Graficos.css"
import ContenedorGrafico from "./ContenedorGraficos"

type ChartProps = {
  data: any[]
  dataKeyX: string
  dataKeyY: string
  titulo: string
  initialFavorite?: boolean
  onToggleFavorite?: (isFavorite: boolean) => void
  width?: string | number
  height?: string | number
}

export const GraficoBarras = ({
  data,
  dataKeyX,
  dataKeyY,
  titulo,
  width,
  height,
  initialFavorite = false,
  onToggleFavorite,
}: ChartProps) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)

  return (
    <ContenedorGrafico
      titulo={titulo}
      initialFavorite={initialFavorite}
      onToggleFavorite={onToggleFavorite}
      width={width}
      height={height}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data}
          margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
          barCategoryGap="25%"
        >
          <CartesianGrid stroke="#2e2e3e" strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 12, fill: "#bbbbbb" }} />
          <YAxis
            dataKey={dataKeyX}
            type="category"
            width={100}
            tick={{ fontSize: 13, fill: "#f0f0f0" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1f2937",
              border: "1px solid #334155",
              borderRadius: "8px",
              color: "#f1f5f9",
              fontSize: "13px",
              padding: "10px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
            itemStyle={{
              color: "#e2e8f0",
              fontWeight: 500,
            }}
            labelStyle={{
              color: "#94a3b8",
              fontWeight: 600,
              fontSize: "13px",
            }}
          />

          <Bar
            dataKey={dataKeyY}
            fill="url(#colorBarra)"
            radius={[6, 6, 6, 6]}
            animationDuration={600}
            isAnimationActive={false} // opcional: sin animación
            activeBar={false}
          >
            <LabelList
              dataKey={dataKeyY}
              position="insideRight"
              fill="#ffffff"
              fontSize={12}
            />
          </Bar>
          <defs>
            <linearGradient id="colorBarra" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6c5ce7" />
              <stop offset="100%" stopColor="#00cec9" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </ContenedorGrafico>
  )
}
