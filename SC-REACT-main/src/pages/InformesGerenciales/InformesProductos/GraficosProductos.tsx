import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"
import { useState, useEffect } from "react"
import { useObtenerProductosDispersion } from "../../../services/connections/indicadores"
import ContenedorGraficos from "../../../components/Graficos/ContenedorGraficos"

interface PuntoDispersion {
  fecha: string
  costo: number
  precio: number
  cantidad: number
}

export const ScatterChartProductoIndividual = ({
  codigoTarot,
  fechaDesde,
  fechaHasta,
}: {
  codigoTarot: string
  fechaDesde: string
  fechaHasta: string
}) => {
  const [datos, setDatos] = useState<PuntoDispersion[]>([])
  const [loading, setLoading] = useState(true)
  const [usarLog, setUsarLog] = useState(true)
  const [usarLimiteDominio, setUsarLimiteDominio] = useState(false)

  const obtenerDispersion = useObtenerProductosDispersion()

  useEffect(() => {
    const cargar = async () => {
      setLoading(true)
      try {
        const res = await obtenerDispersion({
          fechaDesde,
          fechaHasta,
          codigoTarot,
        })
        const filtrados = res.filter(
          (d: PuntoDispersion) => d.costo > 0 && d.precio > 0
        )
        setDatos(filtrados)
      } catch (e) {
        console.error("Error al obtener dispersión:", e)
        setDatos([])
      } finally {
        setLoading(false)
      }
    }
    if (codigoTarot) {
      cargar()
    }
  }, [codigoTarot, fechaDesde, fechaHasta])

  if (loading) return <p style={{ textAlign: "center" }}>Cargando gráfico...</p>
  if (datos.length === 0)
    return (
      <p style={{ textAlign: "center" }}>
        Sin datos disponibles para este producto.
      </p>
    )

  return (
    <ContenedorGraficos
      titulo="Dispersión de Precio vs Costo"
      width="100%"
      height={500}
      extraContent={
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
          <label>
            <input
              type="checkbox"
              checked={usarLog}
              onChange={() => setUsarLog(!usarLog)}
            />{" "}
            Escala logarítmica
          </label>
          <label>
            <input
              type="checkbox"
              checked={usarLimiteDominio}
              onChange={() => setUsarLimiteDominio(!usarLimiteDominio)}
            />{" "}
            Limitar dominio (oculta outliers)
          </label>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 40 }}>
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="costo"
            name="Costo"
            scale={usarLog ? "log" : "linear"}
            domain={usarLimiteDominio ? [0, 25000] : ["dataMin", "dataMax"]}
            label={{
              value: "Costo",
              position: "insideBottom",
              offset: -10,
              fill: "#ffffff",
            }}
            tick={{ fill: "#ffffff", fontSize: 12 }}
          />

          <YAxis
            type="number"
            dataKey="precio"
            name="Precio"
            scale={usarLog ? "log" : "linear"}
            domain={usarLimiteDominio ? [0, 30000] : ["dataMin", "dataMax"]}
            label={{
              value: "Precio de Venta",
              angle: -90,
              position: "insideLeft",
              fill: "#ffffff",
            }}
            tick={{ fill: "#ffffff", fontSize: 12 }}
          />

          <ZAxis type="number" dataKey="cantidad" range={[50, 200]} />
          <Tooltip
            formatter={(value, name) => [`$${value}`, name]}
            labelFormatter={(_, payload) =>
              `Fecha: ${payload?.[0]?.payload?.fecha}`
            }
          />
          <Scatter name="Histórico" data={datos} fill="#82ca9d">
            <LabelList
              dataKey="cantidad"
              position="top"
              fontSize={11}
              fill="#ffffff"
            />
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ContenedorGraficos>
  )
}

export const ScatterChartCostoVsPrecio = ({
  data,
  onProductoClick,
}: {
  data: any[]
  onProductoClick: (producto: {
    codigoTarot: string
    nombre_tarot: string
  }) => void
}) => {
  const [topN, setTopN] = useState(10)

  const dataFiltrada = data
    .filter((d) => d.nombre_tarot !== null)
    .sort((a, b) => b.total_cantidad - a.total_cantidad)
    .slice(0, topN)

  return (
    <ContenedorGraficos
      titulo="Precio Promedio de Venta por Producto"
      width="100%"
      height={600}
      extraContent={
        <div>
          <label style={{ fontSize: 14, marginRight: 6 }}>TOP:</label>
          <select
            value={topN}
            onChange={(e) => setTopN(Number(e.target.value))}
            style={{
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#f8f9fa",
            }}
          >
            {[3, 5, 10, 15].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={dataFiltrada}
          margin={{ top: 20, right: 30, left: 20, bottom: 150 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="nombre_tarot"
            angle={-45}
            textAnchor="end"
            interval={0}
            height={150}
            tick={{ fontSize: 12, fill: "#ffffff" }}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#ffffff" }}
            label={{
              value: "Precio Prom. Venta",
              angle: -90,
              position: "insideLeft",
              fill: "#ffffff",
            }}
          />

          <Tooltip />
          <Bar
            dataKey="total_cantidad"
            fill="#82ca9d"
            name="Precio Prom. Venta"
            onClick={(entry) => {
              onProductoClick({
                codigoTarot: String(entry.codigoTarot),
                nombre_tarot: entry.nombre_tarot,
              })
            }}
          >
            <LabelList
              dataKey="total_cantidad"
              position="top"
              fontSize={12}
              fill="#ffffff"
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ContenedorGraficos>
  )
}

// export const ScatterChartCostoVsPrecio = ({ data }: { data: any[] }) => {
//   const [topN, setTopN] = useState(10)

//   const filtrado = data
//     .filter(
//       (d) =>
//         d.nombre_tarot &&
//         d.costo_promedio != null &&
//         d.precio_vta_promedio != null
//     )
//     .sort((a, b) => b.total_cantidad - a.total_cantidad)
//     .slice(0, topN)

//   return (
//     <div className="chart-card">
//       <div
//         style={{
//           display: "flex",
//           justifyContent: "space-between",
//           alignItems: "center",
//           marginBottom: "1rem",
//           flexWrap: "wrap",
//           gap: "1rem",
//         }}
//       >
//         <h4 style={{ margin: 0 }}>Relación Costo vs Precio de Venta</h4>
//         <div>
//           <label style={{ fontSize: 14, marginRight: 6 }}>TOP:</label>
//           <select
//             value={topN}
//             onChange={(e) => setTopN(Number(e.target.value))}
//             style={{
//               padding: "6px",
//               borderRadius: "6px",
//               border: "1px solid #ccc",
//               background: "#f8f9fa",
//             }}
//           >
//             {[3, 5, 10, 15].map((n) => (
//               <option key={n} value={n}>
//                 {n}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <ResponsiveContainer width="100%" height={450}>
//         <ScatterChart margin={{ top: 20, right: 40, bottom: 40, left: 40 }}>
//           <CartesianGrid />
//           <XAxis
//             type="number"
//             dataKey="costo_promedio"
//             name="Costo"
//             label={{
//               value: "Costo Promedio",
//               position: "insideBottom",
//               offset: -10,
//             }}
//           />
//           <YAxis
//             type="number"
//             dataKey="precio_vta_promedio"
//             name="Precio"
//             label={{
//               value: "Precio Prom. Venta",
//               angle: -90,
//               position: "insideLeft",
//             }}
//           />
//           <Tooltip
//             formatter={(value: number) => value.toFixed(2)}
//             labelFormatter={(label) => `Costo: ${label}`}
//           />
//           <Scatter name="Productos" data={filtrado} fill="#8884d8">
//             <LabelList dataKey="nombre_tarot" position="top" fontSize={11} />
//           </Scatter>
//         </ScatterChart>
//       </ResponsiveContainer>
//     </div>
//   )
// }
