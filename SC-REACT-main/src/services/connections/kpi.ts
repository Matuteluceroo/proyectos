import { useApiRequest } from "./apiRequest";

// Total de contenidos
export const useTotalContenidos = () => {
  const apiRequest = useApiRequest();
  return async () =>
    await apiRequest(`kpi/total-contenidos`, { method: "GET" });
};

// Contenidos por mes
export const useContenidosPorMes = () => {
  const apiRequest = useApiRequest();
  return async () =>
    await apiRequest(`kpi/contenidos-por-mes`, { method: "GET" });
};

// Contenidos por tipo (PDF, Video, Imagen)
export const useContenidosPorTipo = () => {
  const apiRequest = useApiRequest();
  return async () =>
    await apiRequest(`kpi/contenidos-por-tipo`, { method: "GET" });
};

// Top 10 tags
export const useTopTags = () => {
  const apiRequest = useApiRequest();
  return async () => await apiRequest(`kpi/top-tags`, { method: "GET" });
};

// Contenidos por usuario
export const useContenidosPorUsuario = () => {
  const apiRequest = useApiRequest();
  return async () =>
    await apiRequest(`kpi/contenidos-por-usuario`, { method: "GET" });
};

// Promedio de tags por contenido
export const usePromedioTags = () => {
  const apiRequest = useApiRequest();
  return async () => await apiRequest(`kpi/promedio-tags`, { method: "GET" });
};

// Cobertura temática
export const useCoberturaTematica = () => {
  const apiRequest = useApiRequest();
  return async () =>
    await apiRequest(`kpi/cobertura-tematica`, { method: "GET" });
};

// // SC-REACT-main/src/services/connections/kpi.ts
// import { useApiRequest } from "./apiRequest";
// export type KpiContenidosPublicados = { ContenidosPublicados: number };
// export type KpiContenidosPorTipo = { tipo: string; cantidad: number };
// export type KpiCoberturaTags = {
//   CoberturaTagsPct: number;
//   TagsPromedioPorContenido: number;
// };
// export type KpiContenidosFrios = { ContenidosFrios: number };
// export type KpiTopContenidos = {
//   id_contenido: number;
//   titulo: string;
//   vistas: number;
// };
// export type KpiMAU = { MAU: number };
// export type KpiConsultasPorUsuarioActivo = {
//   ConsultasPorUsuarioActivo: number;
// };
// export type KpiEngagementPorTag = { tag: string; vistas: number };
// export type KpiInscritosPorEntrenamiento = {
//   id_entrenamiento: number;
//   nombre: string;
//   inscritos: number;
// };
// export type KpiEstadosPorEntrenamiento = {
//   id_entrenamiento: number;
//   nombre: string;
//   estado: string;
//   cantidad: number;
// };
// export type KpiFinalizacionPorRol = {
//   rol: string;
//   finalizados: number;
//   total: number;
//   PctFinalizacion: number;
// };

// // ---------- Contenido ----------
// export const useKpiContenidosPublicados = () => {
//   const apiRequest = useApiRequest();
//   return async (): Promise<KpiContenidosPublicados> => {
//     const r = await apiRequest(`kpi/contenidos/publicados`, { method: "GET" });
//     return r as KpiContenidosPublicados;
//   };
// };

// export const useKpiContenidosPorTipo = () => {
//   const apiRequest = useApiRequest();
//   return async (): Promise<KpiContenidosPorTipo[]> => {
//     const r = await apiRequest(`kpi/contenidos/por-tipo`, { method: "GET" });
//     return r as KpiContenidosPorTipo[];
//   };
// };
// export const useKpiCoberturaTags = () => {
//   const apiRequest = useApiRequest();
//   return async (): Promise<KpiCoberturaTags> => {
//     const r = await apiRequest(`kpi/contenidos/cobertura-tags`, {
//       method: "GET",
//     });
//     return r as KpiCoberturaTags;
//   };
// };
// export const useKpiContenidosFrios = () => {
//   const apiRequest = useApiRequest();
//   return async ({
//     days = 90,
//   }: { days?: number } = {}): Promise<KpiContenidosFrios> => {
//     const r = await apiRequest(`kpi/contenidos/frios?days=${days}`, {
//       method: "GET",
//     });
//     return r as KpiContenidosFrios;
//   };
// };
// export const useKpiTopContenidos = () => {
//   const apiRequest = useApiRequest();
//   return async ({ days = 30, top = 10 } = {}): Promise<KpiTopContenidos[]> => {
//     const r = await apiRequest(`kpi/contenidos/top?days=${days}&top=${top}`, {
//       method: "GET",
//     });
//     return r as KpiTopContenidos[];
//   };
// };

// // ---------- Uso / Engagement ----------
// export const useKpiMAU = () => {
//   const apiRequest = useApiRequest();
//   return async ({ days = 30 } = {}): Promise<KpiMAU> => {
//     const r = await apiRequest(`kpi/mau?days=${days}`, { method: "GET" });
//     return r as KpiMAU;
//   };
// };
// export const useKpiConsultasPorUsuarioActivo = () => {
//   const apiRequest = useApiRequest();
//   return async ({ days = 30 } = {}): Promise<KpiConsultasPorUsuarioActivo> => {
//     const r = await apiRequest(
//       `kpi/consultas-por-usuario-activo?days=${days}`,
//       { method: "GET" }
//     );
//     return r as KpiConsultasPorUsuarioActivo;
//   };
// };
// export const useKpiEngagementPorTag = () => {
//   const apiRequest = useApiRequest();
//   return async ({ days = 30, top = 20 } = {}): Promise<
//     KpiEngagementPorTag[]
//   > => {
//     const r = await apiRequest(`kpi/tags/engagement?days=${days}&top=${top}`, {
//       method: "GET",
//     });
//     return r as KpiEngagementPorTag[];
//   };
// };

// // ---------- Entrenamientos ----------
// export const useKpiInscritosPorEntrenamiento = () => {
//   const apiRequest = useApiRequest();
//   return async (): Promise<KpiInscritosPorEntrenamiento[]> => {
//     const r = await apiRequest(`kpi/entrenamientos/inscritos`, {
//       method: "GET",
//     });
//     return r as KpiInscritosPorEntrenamiento[];
//   };
// };
// export const useKpiEstadosPorEntrenamiento = () => {
//   const apiRequest = useApiRequest();
//   return async (): Promise<KpiEstadosPorEntrenamiento[]> => {
//     const r = await apiRequest(`kpi/entrenamientos/estados`, { method: "GET" });
//     return r as KpiEstadosPorEntrenamiento[];
//   };
// };
// export const useKpiFinalizacionPorRol = () => {
//   const apiRequest = useApiRequest();
//   return async (): Promise<KpiFinalizacionPorRol[]> => {
//     const r = await apiRequest(`kpi/entrenamientos/finalizacion-por-rol`, {
//       method: "GET",
//     });
//     return r as KpiFinalizacionPorRol[];
//   };
// };
