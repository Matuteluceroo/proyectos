import { useApiRequest } from "./apiRequest"

export const useObtenerLicitacionesPorProvincia = () => {
  const apiRequest = useApiRequest()

  return async ({
    fechaDesde,
    fechaHasta,
  }: {
    fechaDesde: string
    fechaHasta: string
  }) =>
    await apiRequest(`indicadores/licitacion_provincia`, {
      method: "POST",
      body: JSON.stringify({ fechaDesde, fechaHasta }),
    })
}

export const useObtenerLicitacionesPorRegion = () => {
  const apiRequest = useApiRequest()
  return async ({
    fechaDesde,
    fechaHasta,
  }: {
    fechaDesde: string
    fechaHasta: string
  }) =>
    await apiRequest(`indicadores/licitacion_region`, {
      method: "POST",
      body: JSON.stringify({ fechaDesde, fechaHasta }),
    })
}

export const useObtenerLicitacionesPorUsuario = () => {
  const apiRequest = useApiRequest()
  return async ({
    fechaDesde,
    fechaHasta,
  }: {
    fechaDesde: string
    fechaHasta: string
  }) =>
    await apiRequest(`indicadores/licitacion_usuario`, {
      method: "POST",
      body: JSON.stringify({ fechaDesde, fechaHasta }),
    })
}

// PARTICIPACIÓN vs MES ANTERIOR
export const useObtenerParticipacionVsMesAnterior = () => {
  const apiRequest = useApiRequest()
  return async (fecha?: string) =>
    await apiRequest(`indicadores/licitacion_porcentaje/${fecha ?? ""}`, {
      method: "GET",
    })
}

// HISTORIAL por provincia
export const useObtenerHistorialProvincia = () => {
  const apiRequest = useApiRequest()
  return async (fecha?: string) =>
    await apiRequest(
      `indicadores/licitaciones_provincia_historial/${fecha ?? ""}`,
      {
        method: "GET",
      }
    )
}

// LABORATORIOS TOP
export const useObtenerLaboratoriosTop = () => {
  const apiRequest = useApiRequest()
  return async ({
    fechaDesde,
    fechaHasta,
  }: {
    fechaDesde: string
    fechaHasta: string
  }) =>
    await apiRequest(`indicadores/laboratorios_top`, {
      method: "POST",
      body: JSON.stringify({ fechaDesde, fechaHasta }),
    })
}

// PRODUCTOS TOP
export const useObtenerProductosTop = () => {
  const apiRequest = useApiRequest()
  return async ({
    fechaDesde,
    fechaHasta,
  }: {
    fechaDesde: string
    fechaHasta: string
  }) =>
    await apiRequest(`indicadores/productos_top`, {
      method: "POST",
      body: JSON.stringify({ fechaDesde, fechaHasta }),
    })
}

export const useObtenerProductosDispersion = () => {
  const apiRequest = useApiRequest()
  return async ({
    fechaDesde,
    fechaHasta,
    codigoTarot,
  }: {
    fechaDesde: string
    fechaHasta: string
    codigoTarot: string
  }) =>
    await apiRequest(`indicadores/producto_dispersion`, {
      method: "POST",
      body: JSON.stringify({ fechaDesde, fechaHasta, codigoTarot }),
    })
}
