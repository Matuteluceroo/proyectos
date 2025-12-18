import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useCapacitaciones } from "../../services/connections/capacitaciones"

import "./CursoViewer.css"

export default function CursoViewer() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getById } = useCapacitaciones()

  const [curso, setCurso] = useState<any>(null)
  const [contenidos, setContenidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    cargarCurso()
  }, [id])

  const cargarCurso = async () => {
    setLoading(true)
    const data = await getById(Number(id))

    if (Array.isArray(data) && data.length > 0) {
      setCurso({
        nombre: data[0].nombre,
        descripcion: data[0].descripcion,
      })

      const lista = data
        .filter((c: any) => c.id_contenido)
        .map((c: any) => ({
          id: c.id_contenido,
          titulo: c.titulo,
          tipo: c.tipoNombre,
        }))

      setContenidos(lista)
    }

    setLoading(false)
  }

  const abrirContenido = (item: any) => {
    const tipo = item.tipo?.toUpperCase()

    if (tipo === "HTML") {
      navigate(`/preview/html/${item.id}`)
    } else if (tipo === "PDF") {
      navigate(`/preview/pdf/${encodeURIComponent(item.titulo)}`)
    } else if (tipo === "VIDEO") {
      navigate(`/preview/video/${encodeURIComponent(item.titulo)}`)
    } else if (tipo === "IMAGEN") {
      navigate(`/preview/imagen/${encodeURIComponent(item.titulo)}`)
    }
  }

  if (loading) return <p>Cargando capacitación...</p>

  return (
    <div className="curso-viewer">
      <aside className="curso-sidebar">
        <h2>{curso?.nombre}</h2>
        <p className="descripcion">{curso?.descripcion}</p>

        <ul className="lista-contenidos">
          {contenidos.map((c, i) => (
            <li key={i} onClick={() => abrirContenido(c)}>
              <span className="tipo">{c.tipo}</span>
              <span className="titulo">{c.titulo}</span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="curso-placeholder">
        <p>👈 Seleccioná un contenido para comenzar</p>
      </main>
    </div>
  )
}
