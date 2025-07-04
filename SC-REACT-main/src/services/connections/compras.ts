import { useApiRequest } from './apiRequest'

// SELECT - Obtiene todos los renglones de Kairos que coincidan con las licitaciones activas
export const useObtenerEquivalenciaKairos = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`compras/lista-kairos`, { method: 'GET' })
}

// /lista-kairos/no-asociados
export const useObtenerRenglonesNoAsociados = () => {
  const apiRequest = useApiRequest()
  return async () =>
    await apiRequest(`compras/lista-kairos/no-asociados`, {
      method: 'GET',
    })
}

// POST - Crea compras para una licitación
export const useCrearCotizacionesLicitacion = () => {
  const apiRequest = useApiRequest()
  return async ({
    idLicitacion,
    idUsuario,
    compras,
  }: {
    idLicitacion: string
    idUsuario: string
    compras: any
  }) =>
    await apiRequest(`compras/licitacion/${idLicitacion}`, {
      method: 'POST',
      body: JSON.stringify({ idUsuario, compras }),
    })
}

// POST - Crea una nueva compra
export const useCrearNuevaCotizacion = () => {
  const apiRequest = useApiRequest()
  return async (cotizacion: {
    idRenglon: string
    idLicitacion: string
    idKairos: string | undefined
    costoFinal: string
    mantenimiento: string
    observaciones: string
    codTarot: string | undefined
    idUsuario: string
    fechora_comp: string
  }) =>
    await apiRequest(`compras`, {
      method: 'POST',
      body: JSON.stringify(cotizacion),
    })
}
