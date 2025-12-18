import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import { useApiRequest } from "../../../services/connections/apiRequest"

export default function HtmlVisorPureCurso() {
  const { idContenido } = useParams()
  const apiRequest = useApiRequest()
  const [html, setHtml] = useState<string>("")

  useEffect(() => {
    if (!idContenido) return

    const fetchData = async () => {
      try {
        const data = await apiRequest(`documentos/html/${idContenido}`, {
          method: "GET",
        })
        setHtml(data?.html || "")
      } catch (e) {
        console.error("❌ Error al obtener HTML", e)
      }
    }

    fetchData()
  }, [idContenido])

  return (
    <div style={{ padding: "20px" }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
