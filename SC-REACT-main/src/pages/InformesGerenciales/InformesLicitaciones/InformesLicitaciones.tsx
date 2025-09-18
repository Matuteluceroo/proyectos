import { useEffect, useState } from "react";
import { VariacionLicitaciones } from "./GraficosLicitaciones";
import {
  useObtenerLicitacionesPorProvincia,
  useObtenerLicitacionesPorUsuario,
  useObtenerLicitacionesPorRegion,
  useObtenerParticipacionVsMesAnterior,
  useObtenerHistorialProvincia,
} from "../../../services/connections/indicadores";
import DateRangePicker from "../../../components/RangoFecha/RangoFecha";
import { GraficoBarras } from "../../../components/Graficos/GraficoBarras";
import { GraficoTorta } from "../../../components/Graficos/GraficoTorta";
import { GraficoLineas } from "../../../components/Graficos/GraficoLineas";
import type {
  FilterConfig,
  FilterOptions,
  SelectedFilters,
} from "../../../components/Graficos/GraficosTypes";
import Estructura from "../../../components/Estructura/Estructura";
import {
  useTotalContenidos,
  useContenidosPorMes,
  useContenidosPorTipo,
  useTopTags,
  useContenidosPorUsuario,
  usePromedioTags,
  useCoberturaTematica,
} from "../../../services/connections/kpi";

interface VariacionProps {
  mesAnterior: string;
  valorAnterior: number;
  mesActual: string;
  valorActual: number;
  variacionPorc: number;
}
interface ParticipacionPorMesType {
  Region: string;
  Provincia: string;
  AnioMes: string;
  Cantidad: number;
}
interface HistorialProvinciaResponse {
  mesActual: string;
  mesesIncluidos: number;
  datos: ParticipacionPorMesType[];
}

const InformesLicitaciones = () => {
  // hooks API
  const getTotalContenidos = useTotalContenidos();
  const getContenidosPorMes = useContenidosPorMes();
  const getContenidosPorTipo = useContenidosPorTipo();
  const getTopTags = useTopTags();
  const getContenidosPorUsuario = useContenidosPorUsuario();
  const getPromedioTags = usePromedioTags();
  const getCoberturaTematica = useCoberturaTematica();

  // estados
  const [total, setTotal] = useState<number>(0);
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

  const [period, setPeriod] = useState({ start: "", end: "" });

  const obtenerLicitacionesPorProvincia = useObtenerLicitacionesPorProvincia();
  const [datosProvincias, setDatosProvincias] = useState<any[]>([]);

  const obtenerLicitacionesPorUsuario = useObtenerLicitacionesPorUsuario();
  // const [datosUsuarios, setDatosUsuarios] = useState<any[]>([]);

  const obtenerLicitacionesPorRegion = useObtenerLicitacionesPorRegion();
  const [datosPorRegion, setDatosPorRegion] = useState<any[]>([]);

  const obtenerParticipacionVsMesAnterior =
    useObtenerParticipacionVsMesAnterior();
  const [variacionData, setVariacionData] = useState<VariacionProps | null>(
    null
  );

  const obtenerHistorialProvincia = useObtenerHistorialProvincia();
  const [datosHistorialProvincia, setDatosHistorialProvincia] = useState<
    ParticipacionPorMesType[]
  >([]);

  // useEffect(() => {
  //   if (period.start === "" || period.end === "") return;
  //   const cargarDatos = async () => {
  //     const datosProvincia = await obtenerLicitacionesPorProvincia({
  //       fechaDesde: period.start,
  //       fechaHasta: period.end,
  //     });
  //     const datosProvinciaTransf = datosProvincia.map((item: any) => ({
  //       provincia: item.Provincia,
  //       cantidad: item.Cantidad_Licitaciones,
  //     }));
  //     setDatosProvincias(datosProvinciaTransf);
  //     const datosUsuario = await obtenerLicitacionesPorUsuario({
  //       fechaDesde: period.start,
  //       fechaHasta: period.end,
  //     });

  //     const datosUsuarioTransf = datosUsuario.map((item: any) => ({
  //       usuario: item.nombre,
  //       cantidad: item.cantidad,
  //     }));
  //     setDatosUsuarios(datosUsuarioTransf);
  //     const datosPorRegion = await obtenerLicitacionesPorRegion({
  //       fechaDesde: period.start,
  //       fechaHasta: period.end,
  //     });
  //     const datosPorRegionTransf = datosPorRegion.map((item: any) => ({
  //       regiones: item.Region,
  //       cantidad: item.Cantidad_Licitaciones,
  //     }));
  //     setDatosPorRegion(datosPorRegionTransf);
  //     const datosParticipacionVsMesAnteriorn =
  //       await obtenerParticipacionVsMesAnterior();
  //     setVariacionData(datosParticipacionVsMesAnteriorn);
  //     const res: HistorialProvinciaResponse = await obtenerHistorialProvincia();
  //     setDatosHistorialProvincia(res.datos);
  //   };
  //   cargarDatos();
  // }, [period]);

  const filtros: FilterConfig[] = [
    { field: "Region", label: "Filtrar por región" },
    /* { field: 'Provincia', label: 'Filtrar por provincia' }, */
  ];

  const opciones: FilterOptions = {
    Region: Array.from(new Set(datosHistorialProvincia.map((d) => d.Region))),
    Provincia: Array.from(
      new Set(datosHistorialProvincia.map((d) => d.Provincia))
    ),
  };

  const [sel, setSel] = useState<SelectedFilters>({
    Region: [],
    Provincia: [],
  });

  return (
    <Estructura>
      <div style={{ padding: "1.5rem" }}>
        <h2 style={{ color: "white", marginBottom: "1rem" }}>
          📊 Dashboard de KPI del Conocimiento
        </h2>
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
        {/* Tarjetas KPI */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          <div style={cardStyle}>
            <h3 style={cardTitle}>Total Contenidos</h3>
            <p style={cardValue}>{total}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={cardTitle}>Promedio Tags</h3>
            <p style={cardValue}>{promedioTags.toFixed(1)}</p>
          </div>
          <div style={cardStyle}>
            <h3 style={cardTitle}>Cobertura Temática</h3>
            <p style={cardValue}>{cobertura.toFixed(1)}%</p>
          </div>
        </div>

        {/* Gráficos */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
          }}
        >
          <GraficoLineas
            titulo="Contenidos creados por Mes"
            datos={datosMes.map((d) => ({
              AnioMes: d.mes,
              Cantidad: d.total,
              Serie: "Contenidos",
            }))}
            filters={[]}
            filterOptions={{}}
            selectedFilters={{}}
            onFiltersChange={() => {}}
            xKey="AnioMes"
            seriesKey="Serie"
            valueKey="Cantidad"
            width="100%"
            height="80vh"
          />

          {/* <GraficoTorta
            data={datosTipo.map((d) => ({
              tipo:
                d.id_tipo === 1 ? "PDF" : d.id_tipo === 2 ? "Video" : "Imagen",
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
          /> */}
        </div>
        {/*   </div>
      <div style={{ height: "100%", overflow: "hidden" }}>
        <div style={{ padding: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
              borderRadius: "16px",
              padding: "1.2rem 1.5rem",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.6)",
              marginBottom: "1.5rem",
              color: "#fff",
            }}
          >
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

            {variacionData && (
              <div style={{ flex: 1, minWidth: "250px" }}>
                <VariacionLicitaciones {...variacionData} />
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1rem",
              justifyContent: "space-between",
            }}
          >
            <GraficoBarras
              data={datosProvincias}
              dataKeyX="provincia"
              dataKeyY="cantidad"
              titulo="Licitaciones por Provincia"
              width="48%"
              height="40vh"
            />
            <GraficoBarras
              data={datosUsuarios}
              dataKeyX="usuario"
              dataKeyY="cantidad"
              titulo="Licitaciones por Usuario"
              width="48%"
              height="40vh"
            />

            <GraficoBarras
              data={datosPorRegion}
              dataKeyX="regiones"
              dataKeyY="cantidad"
              titulo="Licitaciones por Regiones"
              width="48%"
              height="35vh"
            />
            <GraficoTorta
              data={datosPorRegion}
              dataKeyX="regiones"
              dataKeyY="cantidad"
              titulo="Participación por Regiones"
              width="48%"
              height="35vh"
            />
          </div>

          <div style={{ marginTop: "2rem" }}>
            <GraficoLineas
              titulo={"Licitaciones por Provincia"}
              datos={datosHistorialProvincia}
              filters={filtros}
              filterOptions={opciones}
              selectedFilters={sel}
              onFiltersChange={setSel}
              xKey={"AnioMes"}
              seriesKey={"Provincia"}
              valueKey={"Cantidad"}
            />
          </div>
        </div>*/}
      </div>
    </Estructura>
  );
};
// estilos de tarjetas KPI
const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
  borderRadius: "12px",
  padding: "1rem 1.5rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
  flex: "1 1 200px",
  textAlign: "center",
};

const cardTitle: React.CSSProperties = {
  fontSize: "0.9rem",
  color: "#94a3b8",
  marginBottom: "0.5rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const cardValue: React.CSSProperties = {
  fontSize: "1.8rem",
  fontWeight: 700,
  color: "#38bdf8",
};
export default InformesLicitaciones;
