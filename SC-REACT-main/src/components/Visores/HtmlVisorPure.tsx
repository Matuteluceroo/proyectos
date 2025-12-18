import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useBuscarHTML } from "../../services/connections/documentos"
import "./VisorHtml.css"
import { useVoice } from "../../context/VoiceContext"

export default function VisorHtmlPure() {
  const { id } = useParams<{ id: string }>()
  const buscarHTML = useBuscarHTML()
  const [contenido, setContenido] = useState<string>("")
  const [datos, setDatos] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const { startListening, isListening } = useVoice()

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!id) return
        const data = await buscarHTML(Number(id))
        console.log("html", data)
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
    return <p>Cargando contenido...</p>
  }

  if (!datos) {
    return <p>No se encontró el contenido solicitado.</p>
  }

  return (
    <>
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
    </>
  )
}
