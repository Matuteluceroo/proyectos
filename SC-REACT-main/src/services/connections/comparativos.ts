import { useApiRequest } from './apiRequest'

export const useListarComparativos = () => {
  const apiRequest = useApiRequest()
  return async () =>
    await apiRequest(`generar-documento/comparativos`, { method: 'GET' })
}

export const useMarcarCargado = () => {
  const apiRequest = useApiRequest()
  return async ({ nombre_carpeta }: { nombre_carpeta: string }) =>
    await apiRequest(`generar-documento/comparativos/marcar-cargado`, {
      method: 'POST',
      body: JSON.stringify({ nombre_carpeta }),
    })
}

export const useQuitarCargado = () => {
  const apiRequest = useApiRequest()
  return async ({ nombre_carpeta }: { nombre_carpeta: string }) =>
    await apiRequest(`generar-documento/comparativos/quitar-cargado`, {
      method: 'POST',
      body: JSON.stringify({ nombre_carpeta }),
    })
}
