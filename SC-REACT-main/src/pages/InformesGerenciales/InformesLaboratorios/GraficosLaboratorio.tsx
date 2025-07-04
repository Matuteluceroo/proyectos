import { useState } from "react"
import { GraficoBarrasDual } from "../../../components/Graficos/GraficoBarrasDual"

export const BarChartLaboratorios = ({ data }: { data: any[] }) => {
  const [topN, setTopN] = useState(5)
  const opcionesTop = [3, 5, 10, 15, 20]

  const dataFiltrada = data
    .slice()
    .sort((a, b) => b.total_cantidad - a.total_cantidad)
    .slice(0, topN)

  return (
    <GraficoBarrasDual
      data={dataFiltrada}
      dataKeyX="laboratorio"
      dataKeyYLeft="cantidad_productos_distintos"
      dataKeyYRight="total_cantidad"
      nombreYLeft="Productos Distintos"
      nombreYRight="Unidades"
      titulo="Productos vs Unidades por Laboratorio"
      width="100%"
      height="60vh"
      extraContent={
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>
            Mostrar TOP:
          </label>
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#f8f9fa",
              fontSize: "14px",
            }}
          >
            {opcionesTop.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      }
    />
  )
}
