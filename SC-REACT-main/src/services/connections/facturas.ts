import { useApiRequest } from './apiRequest'

export const useObtenerFacturas = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`facturas`, { method: 'GET' })
}

export const useObtenerFacturasProvincias = () => {
  const apiRequest = useApiRequest()
  return async (provincias: string[]) =>
    await apiRequest(`facturas/provincias`, {
      method: 'POST',
      body: JSON.stringify({ provincias }),
    })
}

export const useObtenerFactura = () => {
  const apiRequest = useApiRequest()
  return async (nroFactura: string | number) =>
    await apiRequest(`facturas/${nroFactura}`, {
      method: 'GET',
    })
}

export const useAgregarObservacion = () => {
  const apiRequest = useApiRequest()
  return async ({
    nro_factura,
    op_exp,
    habilitado_pago,
    sello,
    observaciones,
    fecha_gestion,
    fecha_entrega_documentacion,
    idUsuario,
  }: {
    nro_factura: string
    op_exp: string
    habilitado_pago: string
    sello: string
    observaciones: string
    fecha_gestion: string
    fecha_entrega_documentacion: string
    idUsuario: string | number
  }) =>
    await apiRequest(`facturas/observaciones`, {
      method: 'POST',
      body: JSON.stringify({
        nro_factura,
        op_exp,
        habilitado_pago,
        sello,
        observaciones,
        fecha_gestion,
        fecha_entrega_documentacion,
        idUsuario,
      }),
    })
}

export const useAgregarObservacionesMasivo = () => {
  const apiRequest = useApiRequest()
  return async (
    observaciones: {
      nro_factura: string
      op_exp: string
      habilitado_pago: string
      observaciones: string
      fecha_gestion: string
      fecha_entrega_documentacion: string
      idUsuario: string
    }[]
  ) =>
    await apiRequest(`facturas/observaciones_masivo`, {
      method: 'POST',
      body: JSON.stringify({ observaciones }),
    })
}

export const useObtenerDeudaCliente = () => {
  const apiRequest = useApiRequest()
  return async ({
    fechaDesde,
    fechaHasta,
  }: {
    fechaDesde: string
    fechaHasta: string
  }) =>
    await apiRequest(`indicadores/deudas_pendiente_cliente`, {
      method: 'POST',
      body: JSON.stringify({ fechaDesde, fechaHasta }),
    })
}

export const useObtenerDeudaProvincia = () => {
  const apiRequest = useApiRequest()
  return async ({
    fechaDesde,
    fechaHasta,
  }: {
    fechaDesde: string
    fechaHasta: string
  }) =>
    await apiRequest(`indicadores/deudas_pendiente_provincia`, {
      method: 'POST',
      body: JSON.stringify({ fechaDesde, fechaHasta }),
    })
}
