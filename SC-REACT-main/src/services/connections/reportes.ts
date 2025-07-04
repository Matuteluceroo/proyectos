import { useApiRequest } from './apiRequest'

export const useEnviarSugerencia = () => {
  const apiRequest = useApiRequest()
  return async (sugerencia: {
    nombreUsuario: string
    nombre?: string
    mensaje?: string
  }) =>
    apiRequest(`generar-documento/sugerencias`, {
      method: 'POST',
      body: JSON.stringify({ nuevaSugerencia: sugerencia }), // tu API espera { nuevaSugerencia: {...} }
    })
}

export const useLeerSugerencias = () => {
  const apiRequest = useApiRequest()
  return async () =>
    apiRequest(`generar-documento/sugerencias`, {
      method: 'GET',
    })
}
