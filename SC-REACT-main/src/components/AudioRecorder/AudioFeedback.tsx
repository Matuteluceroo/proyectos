import { useRef, useState } from "react"
import { useApiRequest } from "../../services/connections/apiRequest"

type Props = {
  idContenido: number
  tipoOrigen: string
  user: string
  titulo: string
}

export default function AudioFeedback({
  idContenido,
  tipoOrigen,
  user,
  titulo
}: Props) {
  const apiRequest = useApiRequest()

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [grabando, setGrabando] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioURL, setAudioURL] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const iniciarGrabacion = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)

      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
        setAudioURL(URL.createObjectURL(blob))
      }

      recorder.start()
      recorderRef.current = recorder
      setGrabando(true)
    } catch {
      alert("No se pudo acceder al micrófono")
    }
  }

  const detenerGrabacion = () => {
    recorderRef.current?.stop()
    setGrabando(false)
  }

  const enviarAudio = async () => {
    if (!audioBlob) return

    setLoading(true)

    const formData = new FormData()
    formData.append("audio", audioBlob, "feedback.webm")
    formData.append("id_contenido", String(idContenido))
    formData.append("tipo_origen", tipoOrigen)
    formData.append("user", user)
    formData.append("titulo", titulo)
    console.log("Enviando audio", {
      idContenido,
      tipoOrigen,
      size: audioBlob.size,
      user,
      titulo,
    })
    try {
      await apiRequest("contenido-audio", {
        method: "POST",
        body: formData,
      })

      alert("🎉 Audio enviado correctamente")
      setAudioBlob(null)
      setAudioURL(null)
    } catch (err) {
      console.error(err)
      alert("❌ Error al enviar audio")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      {!grabando ? (
        <button onClick={iniciarGrabacion}>🎙️ Grabar feedback</button>
      ) : (
        <button onClick={detenerGrabacion}>⏹️ Detener</button>
      )}

      {audioURL && (
        <>
          <audio controls src={audioURL} />
          <button onClick={enviarAudio} disabled={loading}>
            {loading ? "Enviando..." : "📤 Enviar"}
          </button>
        </>
      )}
    </div>
  )
}
