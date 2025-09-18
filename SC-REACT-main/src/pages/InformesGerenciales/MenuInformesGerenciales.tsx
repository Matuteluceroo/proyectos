import { Outlet } from "react-router-dom";
import "./MenuInformesGerenciales.css";
import Estructura from "../../components/Estructura/Estructura";
import SidebarGerencial from "./SidebarGerencial";
import DateRangePicker from "../../components/RangoFecha/RangoFecha";

import {
  useContenidosPorMes,
  useContenidosPorTipo,
  useCoberturaTematica,
  usePromedioTags,
  useTopTags,
  useTotalContenidos,
  useContenidosPorUsuario,
} from "../../services/connections/kpi";
import { useEffect, useState } from "react";
import { GraficoLineas } from "../../components/Graficos/GraficoLineas";
import { GraficoTorta } from "../../components/Graficos/GraficoTorta";
import { GraficoBarras } from "../../components/Graficos/GraficoBarras";

const MenuInformesGerenciales = ({}) => {
  const getTotalContenidos = useTotalContenidos();
  const getContenidosPorMes = useContenidosPorMes();
  const getContenidosPorTipo = useContenidosPorTipo();
  const getTopTags = useTopTags();
  const getContenidosPorUsuario = useContenidosPorUsuario();
  const getPromedioTags = usePromedioTags();
  const getCoberturaTematica = useCoberturaTematica();

  // estados
  const [total, setTotal] = useState<number>(0);
  const [period, setPeriod] = useState({ start: "", end: "" });
  const [promedioTags, setPromedioTags] = useState<number>(0);
  const [cobertura, setCobertura] = useState<number>(0);
  const [datosMes, setDatosMes] = useState<any[]>([]);
  const [datosTipo, setDatosTipo] = useState<any[]>([]);
  const [datosTags, setDatosTags] = useState<any[]>([]);
  const [datosUsuarios, setDatosUsuarios] = useState<any[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      setTotal((await getTotalContenidos()).total_contenidos);
      setPromedioTags((await getPromedioTags()).promedio_tags);
      setCobertura((await getCoberturaTematica()).porcentaje_cobertura);

      setDatosMes(await getContenidosPorMes());
      setDatosTipo(await getContenidosPorTipo());
      setDatosTags(await getTopTags());
      setDatosUsuarios(await getContenidosPorUsuario());
    };
    fetchData();
  }, []);
  return (
    <Estructura>
      <div className="layout-container">
        <SidebarGerencial />
        <main
          className="main-content px-4 py-3"
          style={{ background: "#1e293b" }}
        >
          <Outlet />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "12px",
              padding: "1rem",
              boxShadow: "inset 0 0 6px rgba(255,255,255,0.05)",
              minWidth: "260px",
              color: "#e2e8f0",
              fontSize: "0.9rem",
            }}
          >
            <label
              style={{
                marginBottom: "0.5rem",
                color: "#94a3b8",
                fontWeight: 700,
              }}
            >
              Seleccionar fechas
            </label>
            <DateRangePicker
              start={period.start}
              end={period.end}
              onChange={(newRange: any) => setPeriod(newRange)}
            />
          </div>
          <h2 style={{ color: "white", marginBottom: "1rem" }}>
            Dashboard Favoritos
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "space-between",
            }}
          >
            <GraficoTorta
              data={datosTipo.map((d) => ({
                tipo:
                  d.id_tipo === 1
                    ? "PDF"
                    : d.id_tipo === 2
                    ? "Video"
                    : "Imagen",
                total: d.total,
              }))}
              dataKeyX="tipo"
              dataKeyY="total"
              titulo="Distribución por Tipo de Contenido"
              width="48%"
              height="40vh"
            />

            <GraficoBarras
              data={datosTags.map((d) => ({ tag: d.tag, usos: d.usos }))}
              dataKeyX="tag"
              dataKeyY="usos"
              titulo="Top 10 Tags más utilizados"
              width="48%"
              height="40vh"
            />

            <GraficoBarras
              data={datosUsuarios.map((d) => ({
                usuario: d.id_usuario,
                cantidad: d.total,
              }))}
              dataKeyX="usuario"
              dataKeyY="cantidad"
              titulo="Contenidos por Usuario"
              width="48%"
              height="40vh"
            />
          </div>
        </main>
      </div>
    </Estructura>
  );
};

export default MenuInformesGerenciales;
