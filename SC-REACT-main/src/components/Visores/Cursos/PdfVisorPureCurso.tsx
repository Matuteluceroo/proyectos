import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { url2 } from "../../../services/connections/consts"
import "./VisorPDF.css"

type Mode = "fit" | "width" | "actual"

export default function PdfVisorPureCurso() {
  const navigate = useNavigate()
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const { nombre } = useParams<{ nombre: string }>()
  const nombreSeguro = nombre ?? ""
  const [baseUrl, setBaseUrl] = useState<string | undefined>()
  const [mode, setMode] = useState<Mode>("fit")
  const [zoomPercent, setZoomPercent] = useState<number>(100)
  const [page, setPage] = useState<number>(1)
  const [fullscreen, setFullscreen] = useState(false)

  // 🔹 Construir URL base segura
  useEffect(() => {
    if (!nombre) return

    console.log("📄 PdfVisorPureCurso nombre:", nombre)

    // nombre ya viene normalizado desde navigate()
    const safe = encodeURIComponent(decodeURIComponent(nombre))
    setBaseUrl(`${url2}/ver-contenido/PDF/${safe}`)
  }, [nombre])

  // 🔹 Construir src final del iframe
  const src = useMemo(() => {
    if (!baseUrl) return undefined

    const zoomParam =
      mode === "fit"
        ? "page-fit"
        : mode === "width"
        ? "page-width"
        : `${zoomPercent}`

    return `${baseUrl}#page=${Math.max(1, page)}&zoom=${zoomParam}`
  }, [baseUrl, mode, zoomPercent, page])

  // 🔹 Controles
  const zoomIn = () => {
    setMode("actual")
    setZoomPercent((z) => Math.min(500, z + 25))
  }

  const zoomOut = () => {
    setMode("actual")
    setZoomPercent((z) => Math.max(25, z - 25))
  }

  const reset = () => {
    setMode("fit")
    setZoomPercent(100)
    setPage(1)
  }

  const goPrev = () => setPage((p) => Math.max(1, p - 1))
  const goNext = () => setPage((p) => p + 1)

  const toggleFullscreen = async () => {
    const el = wrapperRef.current
    if (!el) return

    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen()
        setFullscreen(true)
      } else {
        await document.exitFullscreen()
        setFullscreen(false)
      }
    } catch {
      /* noop */
    }
  }

  if (!src) {
    return <div className="vp-blank">No se encontró el PDF solicitado.</div>
  }

  return (
    <div className="vp-root" ref={wrapperRef}>
      {/* Toolbar */}
      <div className="vp-toolbar">
        <div className="group">
          <a className="btn" href={baseUrl} download title="Descargar PDF">
            ⬇ Descargar
          </a>

          <button className="btn" onClick={toggleFullscreen}>
            ⤢ {fullscreen ? "Salir" : "Full"}
          </button>

          <button className="btn" onClick={zoomOut}>
            −
          </button>
          <button className="btn" onClick={zoomIn}>
            +
          </button>
          <button className="btn" onClick={reset}>
            Reset
          </button>
        </div>

        <div className="group">
          <button className="btn" onClick={goPrev}>
            ◀
          </button>
          <span className="page">{page}</span>
          <button className="btn" onClick={goNext}>
            ▶
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="vp-stage">
        <iframe
          src={src}
          title={decodeURIComponent(nombreSeguro)}
          className="vp-frame"
        />
      </div>
    </div>
  )
}
