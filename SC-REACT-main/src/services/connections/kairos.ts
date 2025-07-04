import { useApiRequest } from './apiRequest'

export const useObtenerKairos = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`kairos`, { method: 'GET' })
}

export const useAgregarProductoKairos = () => {
  const apiRequest = useApiRequest()

  return async ({
    id,
    laboratorio,
    nombre_comercial,
    droga_presentacion,
    ANMAT,
    cod_tarot,
    cod_kairos,
    codTango,
    ...rest
  }: {
    id: number | null
    laboratorio: string
    nombre_comercial: string
    droga_presentacion: string
    ANMAT: string
    cod_tarot: string
    cod_kairos: string
    codTango: string
    [key: string]: any
  }) =>
    await apiRequest(`kairos`, {
      method: 'POST',
      body: JSON.stringify({
        id,
        laboratorio,
        nombre_comercial,
        droga_presentacion,
        ANMAT,
        cod_tarot,
        cod_kairos,
        codTango,
        ...rest,
      }),
    })
}

export const useAgregarListaProductoKairos = () => {
  const apiRequest = useApiRequest()
  return async (
    listaAgregarKairos: {
      id: number | null
      laboratorio: string
      nombre_comercial: string
      droga_presentacion: string
      ANMAT: string
      cod_tarot: string
      cod_kairos: string
      codTango: string
      [key: string]: any
    }[]
  ) =>
    await apiRequest(`kairos/lista`, {
      method: 'POST',
      body: JSON.stringify({ listaAgregarKairos }),
    })
}

export const useModificarProductoKairos = () => {
  const apiRequest = useApiRequest()

  return async (
    idKairos: number | string,
    {
      id,
      laboratorio,
      nombre_comercial,
      droga_presentacion,
      ANMAT,
      cod_tarot,
      cod_kairos,
      codTango,
      ...rest
    }: {
      id: number | null
      laboratorio: string
      nombre_comercial: string
      droga_presentacion: string
      ANMAT: string
      cod_tarot: string
      cod_kairos: string
      codTango: string
      [key: string]: any
    }
  ) =>
    await apiRequest(`kairos/${idKairos}`, {
      method: 'PATCH',
      body: JSON.stringify({
        id,
        laboratorio,
        nombre_comercial,
        droga_presentacion,
        ANMAT,
        cod_tarot,
        cod_kairos,
        codTango,
        ...rest,
      }),
    })
}

export const useModificarListaProductoKairos = () => {
  const apiRequest = useApiRequest()
  return async (
    listaModificarKairos: {
      idKairos: string | number
      laboratorio: string
      nombre_comercial: string
      droga_presentacion: string
      ANMAT: string
      cod_tarot: string
      cod_kairos: string
      codTango: string
      [key: string]: any
    }[]
  ) =>
    await apiRequest(`kairos/lista`, {
      method: 'PATCH',
      body: JSON.stringify({ listaModificarKairos }),
    })
}

export const useEliminarProductoKairos = () => {
  const apiRequest = useApiRequest()
  return async ({ idKairos }: { idKairos: number | string }) =>
    await apiRequest(`kairos/${idKairos}`, {
      method: 'DELETE',
    })
}

export const useObtenerProductoPorCodTarot = () => {
  const apiRequest = useApiRequest()
  return async (codTarot: string) =>
    await apiRequest(`kairos/tarot/${codTarot}`, {
      method: 'GET',
    })
}

export const useObtenerProductoPorCodAnmat = () => {
  const apiRequest = useApiRequest()

  return async (codAnmat: string) =>
    await apiRequest(`kairos/anmat/${codAnmat}`, {
      method: 'GET',
    })
}

export const useObtenerProductoPorCodKairos = () => {
  const apiRequest = useApiRequest()
  return async (codKairos: string) =>
    await apiRequest(`kairos/cod_kairos/${codKairos}`, {
      method: 'GET',
    })
}

export const useObtenerProductoPorLaboratorio = () => {
  const apiRequest = useApiRequest()
  return async (laboratorio: string) =>
    await apiRequest(`kairos/laboratorio/${laboratorio}`, {
      method: 'GET',
    })
}

export const useObtenerProductoPorDrogaPresentacion = () => {
  const apiRequest = useApiRequest()
  return async (droga_presentacion: string) =>
    await apiRequest(`kairos/droga/${droga_presentacion}`, {
      method: 'GET',
    })
}

export const useObtenerProductoPorCodTango = () => {
  const apiRequest = useApiRequest()
  return async (codTango: string) =>
    await apiRequest(`kairos/tango/${codTango}`, {
      method: 'GET',
    })
}

export const useObtenerListaProductosTarot = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`prodstarot`, { method: 'GET' })
}
