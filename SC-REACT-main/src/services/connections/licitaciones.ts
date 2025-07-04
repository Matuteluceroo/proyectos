import { useApiRequest } from './apiRequest'

export const useObtenerLicitaciones = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`licitaciones`, { method: 'GET' })
}

export const useObtenerLicitacionesZona = () => {
  const apiRequest = useApiRequest()
  return async ({ idZona }: { idZona: string }) =>
    await apiRequest(`licitaciones/zona/${idZona}`, {
      method: 'GET',
    })
}

export const useObtenerLicitacionByID = () => {
  const apiRequest = useApiRequest()
  return async ({ idLicitacion }: { idLicitacion: string }) =>
    await apiRequest(`licitaciones/${idLicitacion}`, {
      method: 'GET',
    })
}

export const useCrearLicitacion = () => {
  const apiRequest = useApiRequest()
  return async ({
    codCliente,
    cliente,
    fecha,
    nroLic,
    tipo,
    hora,
    objeto,
    estado,
  }: {
    codCliente: string
    cliente: string
    fecha: string
    nroLic: string
    tipo: string
    hora: string
    objeto: string
    estado: string
  }) =>
    await apiRequest(`licitaciones`, {
      method: 'POST',
      body: JSON.stringify({
        codCliente,
        cliente,
        fecha,
        nroLic,
        tipo,
        hora,
        objeto,
        estado,
      }),
    })
}

export const useListaCodigos = () => {
  const apiRequest = useApiRequest()
  return async ({ listaCodigos }: { listaCodigos: any[] }) =>
    await apiRequest(`prodstarot`, {
      method: 'POST',
      body: JSON.stringify(listaCodigos),
    })
}

export const useModificarLicitacion = () => {
  const apiRequest = useApiRequest()
  return async ({
    idLicitacion,
    dataLicitacion,
  }: {
    idLicitacion: string
    dataLicitacion: {
      codCliente: string
      cliente: string
      fecha: string
      nroLic: string
      tipo: string
      hora: string
      objeto: string
      estado: string
    }
  }) =>
    await apiRequest(`licitaciones/${idLicitacion}`, {
      method: 'PATCH',
      body: JSON.stringify(dataLicitacion),
    })
}

export const useEliminarLicitacion = () => {
  const apiRequest = useApiRequest()
  return async (idLicitacion: string) =>
    await apiRequest(`licitaciones/${idLicitacion}`, {
      method: 'DELETE',
    })
}

export const useCrearRenglonesLicitacion = () => {
  const apiRequest = useApiRequest()
  return async ({
    idLicitacion,
    renglones,
  }: {
    idLicitacion: string
    renglones: any[]
  }) =>
    await apiRequest(`renglones/licitacion/${idLicitacion}`, {
      method: 'POST',
      body: JSON.stringify({ renglones }),
    })
}

export const useModificarRenglonesLicitacion = () => {
  const apiRequest = useApiRequest()
  return async ({
    idLicitacion,
    renglones,
  }: {
    idLicitacion: string
    renglones: any[]
  }) =>
    await apiRequest(`renglones/licitacion/${idLicitacion}`, {
      method: 'PATCH',
      body: JSON.stringify({ renglones }),
    })
}

export const useModificarPreganadoRenglonesLicitacion = () => {
  const apiRequest = useApiRequest()
  return async ({
    idLicitacion,
    renglones,
  }: {
    idLicitacion: string
    renglones: any[]
  }) =>
    await apiRequest(`renglones/licitacion/preganados/${idLicitacion}`, {
      method: 'PATCH',
      body: JSON.stringify({ renglones }),
    })
}

export const useEliminarRenglonesLicitacion = () => {
  const apiRequest = useApiRequest()
  return async (idLicitacion: string) =>
    await apiRequest(`renglones/licitacion/${idLicitacion}`, {
      method: 'DELETE',
    })
}

export const useCrearRenglon = () => {
  const apiRequest = useApiRequest()
  return async ({
    idLicitacion,
    datos,
  }: {
    idLicitacion: string
    datos: {
      renglon: string
      cantidad: string
      descripcion: string
      codigoTarot: string
    }
  }) => {
    const { renglon, cantidad, descripcion, codigoTarot } = datos
    await apiRequest(`renglones/${idLicitacion}`, {
      method: 'POST',
      body: JSON.stringify({ renglon, cantidad, descripcion, codigoTarot }),
    })
  }
}

export const useCrearRenglonAlternativo = () => {
  const apiRequest = useApiRequest()
  return async ({
    idLicitacion,
    datos,
  }: {
    idLicitacion: string
    datos: any
  }) => {
    const {
      renglon,
      cantidad,
      descripcion,
      codigoTarot,
      descripcionTarot,
      alternativo,
    } = datos
    return await apiRequest(`renglones/alternativo/${idLicitacion}`, {
      method: 'POST',
      body: JSON.stringify({
        renglon,
        cantidad,
        descripcion,
        codigoTarot,
        descripcionTarot,
        alternativo,
      }),
    })
  }
}

export const useEliminarRenglon = () => {
  const apiRequest = useApiRequest()
  return async (idRenglon: string) =>
    await apiRequest(`renglones/${idRenglon}`, {
      method: 'DELETE',
    })
}

export const useObtenerClientesZona = () => {
  const apiRequest = useApiRequest()
  return async (idZona: string) =>
    await apiRequest(`clientes/zona/${idZona}`, {
      method: 'GET',
    })
}

export const useObtenerNombreTarot = () => {
  const apiRequest = useApiRequest()
  return async (codTarot: string) =>
    await apiRequest(`prodstarot/${codTarot}`, {
      method: 'GET',
    })
}

export const useAsociarUsuarioLicitacion = () => {
  const apiRequest = useApiRequest()
  return async (idLicitacion: string, idUsuario: string) =>
    await apiRequest(`usuarios/asociar-licitacion/${idUsuario}`, {
      method: 'POST',
      body: JSON.stringify({ idLicitacion }),
    })
}
export const useObtenerIndicadoresProvincias = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`indicadores/licitacion_provincia`, { method: 'GET' })
}
export const useObtenerLicitacionRegion = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`indicadores/licitacion_region`, { method: 'GET' })
}
export const useObtenerLicitacionUsuario = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`indicadores/licitacion_usuario`, { method: 'GET' })
}
export const useObtenerIndicadoresProvinciasFecha = () => {
  const apiRequest = useApiRequest()
  return async (fecha: string) =>
    await apiRequest(`indicadores/licitacion_provincia_mes/${fecha}`, { method: 'GET' })
}

export const useObtenerLicitacionRegionFecha = () => {
  const apiRequest = useApiRequest()
  return async (fecha: string) => {
    try {
      return await apiRequest(`indicadores/licitacion_region_mes/${fecha}`, {
        method: "GET",
      })
    } catch (error) {
      console.warn(`Error al obtener datos para ${fecha}:`, error)
      return null 
    }
  }
}

export const useObtenerLicitacionUsuarioFecha = () => {
  const apiRequest = useApiRequest()
  return async (fecha: string) =>
    await apiRequest(`indicadores/licitacion_usuario_mes/${fecha}`, { method: 'GET' })
}
