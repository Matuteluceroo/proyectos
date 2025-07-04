import { useApiRequest } from "./apiRequest"

export interface Real {
  idReal?: number
  cantidad_real: number
  costo_real: number
  precio_real: number
  laboratorio_real: string
  idRenglon?: string
}

// GET - Obtiene todo reales
export const useObtenerReales = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`reales`, { method: "GET" })
}

// GET - Obtiene los reales de un renglón
export const useObtenerRealesDeRenglon = () => {
  const apiRequest = useApiRequest()
  return async (idRenglon: string): Promise<Real[]> =>
    await apiRequest(`reales/renglon/${idRenglon}`, {
      method: "GET",
    })
}


// POST - Crea un nuevo real
export const useCrearNuevoReal = () => {
  const apiRequest = useApiRequest()
  return async ({
    cantidad_real,
    costo_real,
    precio_real,
    laboratorio_real,
    idRenglon,
  }: {
    cantidad_real: number
    costo_real: number
    precio_real: number
    laboratorio_real: string
    idRenglon: number
  }) => {
    return await apiRequest(`reales`, {
      method: 'POST',
      body: JSON.stringify({
        cantidad_real,
        costo_real,
        precio_real,
        laboratorio_real,
        idRenglon,
      }),
    })
  }
}

// DELETE - Elimina un real por ID
export const useEliminarReal = () => {
  const apiRequest = useApiRequest()
  return async ({ idReal }: { idReal: number })=>
    await apiRequest(`reales/${idReal}`, {
      method: "DELETE",
    })
}

// PATCH - Modifica un real existente
export const useModificarReal = () => {
  const apiRequest = useApiRequest()
  return async (
    idReal: number,
    {
      cantidad_real,
      costo_real,
      precio_real,
      laboratorio_real,
      idRenglon,
    }: {
      cantidad_real: number
      costo_real: number
      precio_real: number
      laboratorio_real: string
      idRenglon: number
    }
  ) => {
    return await apiRequest(`reales/${idReal}`, {
      method: "PATCH",
      body: JSON.stringify({
        cantidad_real,
        costo_real,
        precio_real,
        laboratorio_real,
        idRenglon,
      }),
    })
  }
}
