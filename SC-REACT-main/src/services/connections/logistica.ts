import { useApiRequest } from "./apiRequest"

export const useObtenerConductores = () => {
  const apiRequest = useApiRequest()
  return async ({ origen }: { origen: string }) =>
    await apiRequest(`logistica/conductores/${origen}`, {
      method: "GET",
    })
}

export const useObtenerEstadoRemito = () => {
  const apiRequest = useApiRequest()
  return async () =>
    await apiRequest(`logistica/estado_remito`, {
      method: "GET",
    })
}

export const useobtenerPartesEntrega = () => {
  const apiRequest = useApiRequest()
  return async ({ deposito }: { deposito: string }) =>
    await apiRequest(`logistica/partes_deposito/${deposito}`, {
      method: "GET",
    })
}

export const useObtenerRemitos = () => {
  const apiRequest = useApiRequest()
  return async () =>
    await apiRequest(`logistica/remitos/pendientes`, {
      method: "GET",
    })
}

export const useEliminarParte = () => {
  const apiRequest = useApiRequest()
  return async ({ nroHojaRuta }: { nroHojaRuta: number }) => {
    await apiRequest(`logistica/eliminar_parte/${nroHojaRuta}`, {
      method: "DELETE",
    })
  }
}
export const useEnviarImagenAlBackend = () => {
  const apiRequest = useApiRequest()
  return async ({
    base64Image,
    nro_remito,
  }: {
    base64Image: string
    nro_remito: string
  }) => {
    await apiRequest(`logistica/guardar-foto`, {
      method: "POST",
      body: JSON.stringify({
        imagen: base64Image,
        nro_remito,
      }),
    })
  }
}
export const useAgregarNroSeguimiento = () => {
  const apiRequest = useApiRequest()
  return async ({
    nro_remito,
    nro_seguimiento,
  }: {
    nro_remito: string
    nro_seguimiento: string
  }) => {
    await apiRequest(`logistica/agregar_nroseguimiento`, {
      method: "POST",
      body: JSON.stringify({
        nro_seguimiento,
        nro_remito,
      }),
    })
  }
}
export const useAgregarObservaciones = () => {
  const apiRequest = useApiRequest()
  return async ({
    nro_remito,
    observaciones,
  }: {
    nro_remito: string
    observaciones: string
  }) => {
    await apiRequest(`logistica/agregar_observacion`, {
      method: "POST",
      body: JSON.stringify({
        nro_remito,
        observaciones,
      }),
    })
  }
}

export const useObtenerRemitosByParte = () => {
  const apiRequest = useApiRequest()
  return async ({ nroHojaRuta }: { nroHojaRuta: number }) => {
    return await apiRequest(`logistica/remitos/${nroHojaRuta}`, {
      method: "GET",
    })
  }
}

export const useObtenerDataHoja = () => {
  const apiRequest = useApiRequest()
  return async ({ nroHojaRuta }: { nroHojaRuta: number }) => {
    return await apiRequest(`logistica/partes/${nroHojaRuta}`, {
      method: "GET",
    })
  }
}
export const useObtenerImagenRemito = () => {
  const apiRequest = useApiRequest()
  return async ({ nro_remito }: { nro_remito: string }) => {
    try {
      const res = await apiRequest(`logistica/obtener-foto/${nro_remito}`, {
        method: "GET",
      })
      return res
    } catch (error: any) {
      console.warn(`No se encontraron ${nro_remito}`, error)
      return null
    }
  }
}

export const useCrearHojaRuta = () => {
  const apiRequest = useApiRequest()

  return async ({
    redireccion,
    nroHojaRuta,
    fecha_parte,
    fecha_entrega,
    descripcion_lote,
    id_conductor,
    nombre_transp,
    deposito,
    estado_entrega,
    observaciones,
  }: {
    redireccion: number
    nroHojaRuta: string | null
    fecha_parte: string
    fecha_entrega: string
    descripcion_lote: string
    id_conductor: string
    nombre_transp: string
    deposito: string
    estado_entrega: string
    observaciones: string
  }) => {
    return await apiRequest(`logistica/crear_hoja_ruta`, {
      method: "POST",
      body: JSON.stringify({
        redireccion,
        nroHojaRuta,
        fecha_parte,
        fecha_entrega,
        descripcion_lote,
        id_conductor,
        nombre_transp,
        deposito,
        estado_entrega,
        observaciones,
      }),
    })
  }
}

export const useAgregarRemitosAHoja = () => {
  const apiRequest = useApiRequest()
  return async ({
    nroHoja,
    remitos,
  }: {
    nroHoja: number
    remitos: string[]
  }) => {
    return await apiRequest(`logistica/agregar_remito_hoja`, {
      method: "POST",
      body: JSON.stringify({ nroHoja, remitos }),
    })
  }
}
export const useObtenerArticulosByRemito = () => {
  const apiRequest = useApiRequest()
  return async ({ nro_remito }: { nro_remito: string }) => {
    return await apiRequest(`logistica/remitos/articulos/${nro_remito}`, {
      method: "GET",
    })
  }
}
