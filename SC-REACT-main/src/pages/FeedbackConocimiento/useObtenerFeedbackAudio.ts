import { useEffect, useState } from "react"
import { useApiRequest } from "../../services/connections/apiRequest"

export interface FeedbackAudio {
  id_contenido_audio: number
  titulo_contenido: string
  tipo_origen: string
  url_audio: string
  fecha_creacion: string
  usuario: string
}

export const useObtenerFeedbackAudio = () => {
  const apiRequest = useApiRequest()
  const [data, setData] = useState<FeedbackAudio[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await apiRequest("contenido-audio", {
          method: "GET",
        })
        setData(res)
      } catch (error) {
        console.error("Error cargando feedback de audio", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, loading }
}
