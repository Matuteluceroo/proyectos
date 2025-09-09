import { useAlert } from '../AlertContext'
import { useLoader } from '../LoaderContext'
import { url, headers } from './consts'

export const useApiRequest = () => {
  const { setIsAlertOpen, setAlertMessage } = useAlert()
  const { setLoading } = useLoader()

  return async (route: string, options: RequestInit = {}) => {
    try {
      if (!route.includes('prodstarot')) {
        setLoading(true)
      }

      // 👇 Detectamos si el body es FormData
      const isFormData = options.body instanceof FormData

      const response = await fetch(`${url}/${route}`, {
        ...options,
        headers: isFormData ? undefined : headers, // ❌ no forzar Content-Type en FormData
        credentials: 'include',
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error en response:', errorData)
        setAlertMessage(errorData.mensaje || 'Error desconocido en el servidor')
        setIsAlertOpen(true)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error('Error en fetch:', error)
      setAlertMessage('Error al conectar con el servidor.')
      setIsAlertOpen(true)
      return null
    } finally {
      if (!route.includes('prodstarot')) {
        setLoading(false)
      }
    }
  }
}
