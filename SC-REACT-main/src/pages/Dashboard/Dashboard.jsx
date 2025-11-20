import { useEffect, useState } from "react";
import Estructura from "../../components/Estructura/Estructura";
import { useObtenerResumenDashboard } from "../../services/connections/dashboard";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import * as XLSX from "xlsx";
import "./Dashboard.css";

import UsuariosActivosChart from "../../components/dashboard/UsuariosActivosChart.jsx";

export default function Dashboard() {
  const obtenerResumen = useObtenerResumenDashboard();
  const [resumen, setResumen] = useState({
    usuarios: { topActivos: [] },
    entrenamientos: { tasaFinalizacion: 0, porMes: [] },
    contenido: { topConsultados: [], porMes: [] },
    tags: { topConsultados: [] },
    topAutores: [],
    porTipo: [],
    totalContenidos: 0,
  });

  const [loading, setLoading] = useState(true);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const COLORS = ["#7ab648", "#b9d96c", "#94c43b", "#5a8a1f", "#b4c99c"];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await obtenerResumen();
        setResumen(data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen?.porTipo ?? []), "PorTipo");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen?.contenido?.porMes ?? []), "PorMes");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen?.topAutores ?? []), "TopAutores");
    XLSX.writeFile(wb, "Dashboard_SaberCitricola.xlsx");
  };

  if (loading)
    return (
      <Estructura>
        <p style={{ color: "#497b1a", padding: "20px" }}>Cargando datos...</p>
      </Estructura>
    );

  console.log("TOP CONSULTADOS →", resumen.contenido.topConsultados);


  return (
    <Estructura>
      <div className="dashboard">
        
        {/* === SECCIÓN SUPERIOR (GRID 70% - 30%) === */}
        <div className="top-section-grid">
          
          {/* COLUMNA IZQUIERDA (70%) */}
          <div className="main-column">
            
            {/* Filtros */}
            <div className="topbar">
              <div className="filters">
                <div className="filter-item">
                  <label>Desde</label>
                  <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                </div>
                <div className="filter-item">
                  <label>Hasta</label>
                  <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </div>
                <button className="btn-action" onClick={() => fetchData(fechaInicio, fechaFin)}>Filtrar</button>
                <button className="btn-export" onClick={handleExportExcel}>⬇ Exportar</button>
              </div>
            </div>

            {/* 4 KPIs Superiores */}
            <div className="kpi-grid">
              <div className="kpi-box">
                <span className="kpi-title">Total Contenidos</span>
                <span className="kpi-value">{resumen.totalContenidos}</span>
              </div>
              <div className="kpi-box">
                <span className="kpi-title">Tipos Contenido</span>
                <span className="kpi-value">{resumen.porTipo.length}</span>
              </div>
              <div className="kpi-box">
                <span className="kpi-title">Autores Activos</span>
                <span className="kpi-value">{resumen.topAutores.length}</span>
              </div>
              <div className="kpi-box">
                <span className="kpi-title">Tasa Finalización</span>
                <span className="kpi-value">{resumen.entrenamientos.tasaFinalizacion}%</span>
              </div>
            </div>

            {/* Gráfico Principal (Evolución Mensual) */}
            <div className="dashboard-card">
              <h3>Evolución Mensual</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={resumen.contenido.porMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#7ab648" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* COLUMNA DERECHA (30%) - Sidebar */}
          <div className="sidebar-column">
            <div className="sidebar-card full-height">
              <h3>Top Autores</h3>
              <ul className="top-list">
                {resumen.topAutores?.slice(0, 5).map((a, i) => (
                  <li key={i}>
                    <span className="author-name">{a.autor}</span>
                    <span className="author-count">{a.total}</span>
                  </li>
                ))}
              </ul>

              <div className="sidebar-separator"></div>

              <h3>Usuarios más activos</h3>
              <div style={{ flex: 1, minHeight: "200px" }}>
                <UsuariosActivosChart data={resumen.usuarios.topActivos} />
              </div>
            </div>
          </div>
        </div>

        {/* === SECCIÓN INFERIOR (100%) === */}
        <div className="bottom-section">
          {/* Distribución por Tipo */}
          <div className="dashboard-card">
            <h3>Distribución por Tipo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={resumen.porTipo} dataKey="cantidad" nameKey="tipo" cx="50%" cy="50%" outerRadius={125} label>
                  {resumen.porTipo.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Temas más consultados */}
          <div className="dashboard-card">
            <h3>Temas más consultados</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={resumen.contenido.topConsultados}
                  dataKey="consultas"
                  nameKey="titulo"
                  cx="50%"
                  cy="50%"
                  outerRadius={125}
                  label
                >
                  {(resumen.contenido.topConsultados ?? []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>



          {/* Mini KPIs (Para no perder datos) */}
          <div className="mini-kpi-container">
            <div className="mini-kpi-box">
              <span className="mini-kpi-title">Contenidos recientes</span>
              <span className="mini-kpi-value">{resumen?.contenido?.porMes?.slice(-1)[0]?.total || 0}</span>
            </div>
            <div className="mini-kpi-box">
              <span className="mini-kpi-title">Usuarios nuevos</span>
              <span className="mini-kpi-value">{resumen?.usuarios?.topActivos?.length || 0}</span>
            </div>
          </div>
        </div>

      </div>
    </Estructura>
  );
}