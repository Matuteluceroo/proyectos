import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Estructura from "../../components/Estructura/Estructura"
import { useCapacitaciones } from "../../services/connections/capacitaciones"
import { useNavigate } from "react-router-dom"
import HtmlVisorPure from "../../components/Visores/HtmlVisorPure"
import PdfVisorPure from "../../components/Visores/PdfVisorPure"
import VideoVisorPure from "../../components/Visores/VideoVisorPure"
import ImagenVisorPure from "../../components/Visores/ImagenVisorPure"
import { Outlet } from "react-router-dom"

import "./CursoViewer.css"

export default function CursoViewer() {
  const navigate = useNavigate()

  const { id } = useParams()
  const { getById } = useCapacitaciones()

  const [curso, setCurso] = useState<any>(null)
  const [contenidos, setContenidos] = useState<any[]>([])
  const [activo, setActivo] = useState<any>(null)

  useEffect(() => {
    cargarCurso()
  }, [id])

  const cargarCurso = async () => {
    const data = await getById(Number(id))

    if (Array.isArray(data) && data.length > 0) {
      setCurso(data[0])
      const lista = data.filter((c) => c.id_contenido)
      setContenidos(lista)
      setActivo(lista[0] || null) // primer contenido activo
    }
  }

  const abrirContenido = (c: any) => {
    if (c.tipo_origen === "HTML") {
      navigate(`vista/html/${c.id_contenido}`)
    } else if (c.tipoNombre === "PDF") {
      // 🔥 CLAVE: sacar "PDF/"
      const archivo = c.url_archivo.replaceAll("\\", "/").replace(/^PDF\//i, "")

      navigate(`vista/pdf/${encodeURIComponent(archivo)}`)
    }
  }

  // return (
  //   <Estructura>
  //     <div className="curso-viewer">
  //       <aside className="curso-sidebar">
  //         <h2>{curso?.nombre}</h2>
  //         <p>{curso?.descripcion}</p>

  //         <ul>
  //           {contenidos.map((c) => (
  //             <li key={c.id_contenido} onClick={() => abrirContenido(c)}>
  //               {c.titulo}
  //             </li>
  //           ))}
  //         </ul>
  //       </aside>

  //       <main className="curso-visor">
  //         <Outlet />
  //       </main>
  //     </div>
  //   </Estructura>
  // )
  return (
    <Estructura>
      <div className="curso-viewer">
        {/* SIDEBAR */}
        <aside className="curso-sidebar">
          <h2 className="curso-titulo">{curso?.nombre}</h2>
          <p className="curso-descripcion">{curso?.descripcion}</p>

          <ul className="lista-contenidos">
            {contenidos.map((c, i) => (
              <li
                key={`${c.id_contenido}-${i}`}
                className={
                  activo?.id_contenido === c.id_contenido ? "activo" : ""
                }
                onClick={() => abrirContenido(c)}
              >
                <span className="tipo">{c.tipoNombre}</span>
                <span className="titulo">{c.titulo}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* VISOR */}
        <main className="curso-visor">
          <Outlet />
        </main>
      </div>
    </Estructura>
  )
}
