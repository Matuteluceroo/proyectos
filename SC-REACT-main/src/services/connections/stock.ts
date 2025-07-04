import { useApiRequest } from './apiRequest'

// GET - Obtiene todo el stock
export const useObtenerStock = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`stock`, { method: 'GET' })
}

// GET - Obtiene todo el stock
export const useObtenerStockDeLicitacion = () => {
  const apiRequest = useApiRequest()
  return async (idLicitacion: string) =>
    await apiRequest(`stock/${idLicitacion}`, { method: 'GET' })
}
export const useObtenerStockLive = () => {
  const apiRequest = useApiRequest()
  return async () => await apiRequest(`indicadores/stocklive`, { method: 'GET' })
}