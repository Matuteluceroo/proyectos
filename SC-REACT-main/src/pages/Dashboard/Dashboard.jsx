import { useEffect, useState } from "react"
import Estructura from "../../components/Estructura/Estructura"
import { useObtenerResumenDashboard } from "../../services/connections/dashboard"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import * as XLSX from "xlsx"
import "./Dashboard.css"

import UsuariosActivosChart from "../../components/dashboard/UsuariosActivosChart.jsx";
import EntrenamientosTasaFinalizacion from "../../components/dashboard/EntrenamientosTasaFinalizacion.jsx";
import ContenidoTopChart from "../../components/dashboard/ContenidoTopChart.jsx";
import TagsTopChart from "../../components/dashboard/TagsTopChart.jsx";


export default function Dashboard({ resumen }) {
    const obtenerResumen = useObtenerResumenDashboard()
    const [resumen, setResumen] = useState(null)
    const [loading, setLoading] = useState(true)
    const [fechaInicio, setFechaInicio] = useState("")
    const [fechaFin, setFechaFin] = useState("")

    const COLORS = ["#7ab648", "#b9d96c", "#94c43b", "#5a8a1f", "#b4c99c"]

    const fetchData = async (inicio, fin) => {
        setLoading(true)
        const data = await obtenerResumen(inicio, fin)
        setResumen(data)
        setLoading(false)
    }

    useEffect(() => { fetchData() }, [])

    const handleExportExcel = () => {
        if (!resumen) return
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen.porTipo), "PorTipo")
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen.porMes), "PorMes")
        XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen.topAutores), "TopAutores")
        XLSX.writeFile(wb, "Dashboard_SaberCitricola.xlsx")
    }

    if (loading)
        return (
            <Estructura>
                <p style={{ color: "#497b1a" }}>Cargando datos...</p>
            </Estructura>
        )

    return (
        <Estructura>
            <div className="dashboard-wrapper">
                <h2 className="titulo-dashboard">📊 Dashboard de Conocimiento</h2>

                {/* === Filtros === */}
                <div className="filtros-dashboard">
                    <div>
                        <label>Desde:</label>
                        <input
                            type="date"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                        />
                    </div>
                    <div>
                        <label>Hasta:</label>
                        <input
                            type="date"
                            value={fechaFin}
                            onChange={(e) => setFechaFin(e.target.value)}
                        />
                    </div>
                    <button onClick={() => fetchData(fechaInicio, fechaFin)}>Filtrar</button>
                    <button onClick={handleExportExcel}>⬇️ Exportar Excel</button>
                </div>

                {/* === CARDS === */}
                <div className="grid grid-cols-2 gap-4">
                    <UsuariosActivosChart data={resumen.usuarios.topActivos} />
                    <EntrenamientosTasaFinalizacion porcentaje={resumen.entrenamientos.tasaFinalizacion} />
                    <ContenidoTopChart data={resumen.contenido.topConsultados} />
                    <TagsTopChart data={resumen.tags.topConsultados} />
                </div>
                <div className="cards-dashboard">
                    <div className="card-dash">
                        <h3>Total de Contenidos</h3>
                        <p className="numero">{resumen.totalContenidos}</p>
                    </div>
                    <div className="card-dash">
                        <h3>Tipos de Contenido</h3>
                        <p>{resumen.porTipo?.length || 0}</p>
                    </div>
                    <div className="card-dash">
                        <h3>Autores Activos</h3>
                        <p>{resumen.topAutores?.length || 0}</p>
                    </div>
                </div>

                {/* === GRAFICO POR TIPO === */}
                <div className="grafico-seccion">
                    <h3>Distribución por Tipo</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={resumen.porTipo}
                                dataKey="cantidad"
                                nameKey="tipo"
                                outerRadius={100}
                                label
                            >
                                {resumen.porTipo.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* === GRAFICO POR MES === */}
                <div className="grafico-seccion">
                    <h3>Evolución Mensual</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={resumen.porMes}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="mes" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="cantidad" stroke="#7ab648" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* === TOP AUTORES === */}
                <div className="grafico-seccion">
                    <h3>Top 5 Autores</h3>
                    <table className="tabla-autores">
                        <thead>
                            <tr>
                                <th>Autor</th>
                                <th>Contenidos</th>
                            </tr>
                        </thead>
                        <tbody>
                            {resumen.topAutores.map((a, i) => (
                                <tr key={i}>
                                    <td>{a.autor}</td>
                                    <td>{a.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Estructura>
    )
}
