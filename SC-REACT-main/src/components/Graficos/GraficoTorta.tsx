import {
  ResponsiveContainer,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Sector,
} from "recharts"
import "./Graficos.css"
import { useState } from "react"
import ContenedorGraficos from "./ContenedorGraficos"
import { coloresAlternativos } from "./coloresGraficos"

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

export const GraficoTorta = ({
  data,
  dataKeyX,
  dataKeyY,
  titulo,
  width,
  height,
  initialFavorite = false,
  onToggleFavorite,
}: ChartProps) => {
  const [activeIndex, setActiveIndex] = useState(-1)

  return (
    <ContenedorGraficos
      titulo={titulo}
      initialFavorite={initialFavorite}
      onToggleFavorite={onToggleFavorite}
      width={width}
      height={height}
    >
      <ResponsiveContainer width="100%" height={360}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={(props: any) => renderActiveShape(props, dataKeyX)}
            label={renderCustomizedLabel}
            data={data}
            dataKey={dataKeyY}
            nameKey={dataKeyX}
            cx="50%"
            cy="50%"
            outerRadius={100}
            innerRadius={60}
            paddingAngle={3}
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(-1)}
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={coloresAlternativos[index % coloresAlternativos.length]}
                stroke="none"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {renderCustomLegend(data, dataKeyX, dataKeyY)}
    </ContenedorGraficos>
  )
}

const renderActiveShape = (props: any, dataKeyX: string) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
  } = props

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill="#333" fontSize={16}>
        {`${payload[dataKeyX]} (${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  )
}

const renderCustomizedLabel = (props: any) => {
  const RADIAN = Math.PI / 180
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
    payload,
  } = props

  const radius = innerRadius + (outerRadius - innerRadius) / 2
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text
      x={x}
      y={y}
      fill="#333"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={13}
      fontWeight={600}
    >
      {payload.regiones ?? payload["Regiones"]}{" "}
      {/* nombre o campo personalizado */}
    </text>
  )
}

const renderCustomLegend = (
  data: any[],
  dataKeyX: string,
  dataKeyY: string
) => {
  const total = data.reduce((acc, item) => acc + item[dataKeyY], 0)

  return (
    <ul
      style={{
        listStyle: "none",
        marginTop: "20px",
        padding: 0,
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      {data.map((entry, index) => {
        const porcentaje = ((entry[dataKeyY] / total) * 100).toFixed(1)
        return (
          <li
            key={`legend-${index}`}
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              color: "#e2e8f0", // texto principal blanco azulado
            }}
          >
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: "50%",
                marginRight: 8,
                backgroundColor:
                  coloresAlternativos[index % coloresAlternativos.length],
              }}
            />
            <span style={{ fontWeight: 500 }}>{entry[dataKeyX]}</span>
            <span style={{ marginLeft: 4, color: "#94a3b8" }}>
              ({porcentaje}%)
            </span>
          </li>
        )
      })}
    </ul>
  )
}

const pastelColors = [
  "#A0C4FF",
  "#BDB2FF",
  "#FFC6FF",
  "#CAFFBF",
  "#FDFFB6",
  "#FFADAD",
  "#FFD6A5",
  "#9BF6FF",
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0]
    return (
      <div
        style={{
          background: "black",
          border: "1px solid #ccc",
          borderRadius: "10px",
          padding: "10px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontSize: "14px",
        }}
      >
        <strong>{name}</strong>
        <div>{`Total: ${value}`}</div>
      </div>
    )
  }
  return null
}
