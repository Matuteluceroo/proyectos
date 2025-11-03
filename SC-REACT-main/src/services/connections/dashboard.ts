import { useApiRequest } from "./apiRequest"

// ✅ Hook para obtener el resumen general del dashboard
export const useObtenerResumenDashboard = () => {
  const apiRequest = useApiRequest()

  return async (fechaInicio?: string, fechaFin?: string) => {
    try {
      const params = new URLSearchParams()
      if (fechaInicio) params.append("fechaInicio", fechaInicio)
      if (fechaFin) params.append("fechaFin", fechaFin)

      const response = await apiRequest(`dashboard/resumen?${params.toString()}`, {
        method: "GET",
      })

      if (!response || typeof response !== "object") {
        console.warn("⚠️ Respuesta vacía o inválida del backend /dashboard/resumen")
        return {
          usuarios: { topActivos: [] },
          entrenamientos: { tasaFinalizacion: 0 },
          contenido: { topConsultados: [] },
          tags: { topConsultados: [] },
          porTipo: [],
          porMes: [],
          topAutores: [],
          totalContenidos: 0,
        }
      }

      return response
    } catch (error) {
      console.error("Error al obtener resumen del dashboard:", error)
      return {
        usuarios: { topActivos: [] },
        entrenamientos: { tasaFinalizacion: 0 },
        contenido: { topConsultados: [] },
        tags: { topConsultados: [] },
        porTipo: [],
        porMes: [],
        topAutores: [],
        totalContenidos: 0,
      }
    }
  }
}
