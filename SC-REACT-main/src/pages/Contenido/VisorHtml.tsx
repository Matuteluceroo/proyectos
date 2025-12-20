import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Estructura from "../../components/Estructura/Estructura"
import { useBuscarHTML } from "../../services/connections/documentos"
import "./VisorHtml.css"
import { useNavigate } from "react-router-dom"
import { useVoice } from "../../context/VoiceContext"
import { useLocation } from "react-router-dom"
import AudioFeedback from "../../components/AudioRecorder/AudioFeedback"
import { useSocket } from "../../services/SocketContext"
export default function VisorHtml() {
  const { currentUser, notificaciones } = useSocket()
  const location = useLocation()
  const { id_contenido, tipo_origen } = location.state || {}
  const { id } = useParams<{ id: string }>()
  const buscarHTML = useBuscarHTML()
  const [contenido, setContenido] = useState<string>("")
  const [datos, setDatos] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { startListening, isListening } = useVoice()
  useEffect(() => {
    const onVoiceCommand = (e: any) => {
      const text = e.detail
        .toLowerCase()
        .replace(/[.,!?]/g, "")
        .trim()

      if (text === "volver" || text === "atrás") {
        navigate(-1)
      }
    }

    window.addEventListener("voice-command", onVoiceCommand)
    return () => window.removeEventListener("voice-command", onVoiceCommand)
  }, [])
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return
        const data = await buscarHTML(Number(id))
        setContenido(data.html)
        setDatos(data)
      } catch (err) {
        console.error("❌ Error al obtener el contenido:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) {
    return (
      <Estructura>
        <p>Cargando contenido...</p>
      </Estructura>
    )
  }

  if (!datos) {
    return (
      <Estructura>
        <p>No se encontró el contenido solicitado.</p>
      </Estructura>
    )
  }

  return (
    <Estructura>
      <button onClick={startListening}>
        🎤 {isListening ? "Escuchando..." : "Activar micrófono"}
      </button>
      {id_contenido && (
        <AudioFeedback
          idContenido={id_contenido}
          tipoOrigen={tipo_origen || "PDF"}
          user={currentUser.id}
          titulo={datos.titulo}
        />
      )}
      <div className="visor-wrapper">
        <h1 className="visor-titulo">{datos.titulo}</h1>
        {datos.descripcion && (
          <p className="visor-descripcion">{datos.descripcion}</p>
        )}
        <div
          className="visor-html"
          dangerouslySetInnerHTML={{ __html: contenido }}
        />
      </div>
    </Estructura>
  )
}
