import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import Estructura from "../../components/Estructura/Estructura"
import "./VisorImagen.css"
import { url2 } from "../../services/connections/consts"
import { useNavigate } from "react-router-dom"
import { useVoice } from "../../context/VoiceContext"

/**
 * Visor de imágenes con:
 * - Modo Ajustar a Pantalla (contain)
 * - Ajustar al Ancho
 * - 100% (tamaño real)
 * - Zoom +/- (rueda con Ctrl), doble click para alternar Fit/100%
 * - Arrastrar para desplazar (pan)
 * - Rotar 90°
 * - Pantalla completa
 * - Descargar
 */
export default function VisorImagen() {
  const { startListening, isListening } = useVoice()

  const navigate = useNavigate()

  const { nombre } = useParams<{ nombre: string }>()
  const [src, setSrc] = useState<string | null>(null)
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
  const [mode, setMode] = useState<"fit" | "width" | "actual">("fit")
  const [zoomFactor, setZoomFactor] = useState(1) // multiplicador sobre baseScale según modo
  const [rotation, setRotation] = useState(0) // en grados
  const [offset, setOffset] = useState({ x: 0, y: 0 }) // pan
  const [dragging, setDragging] = useState(false)

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const dragRef = useRef<{ x: number; y: number } | null>(null)
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
  // Construir URL del backend (nombre puede venir encodeado desde la ruta)
  useEffect(() => {
    if (!nombre) return
    const safe = encodeURIComponent(decodeURIComponent(nombre))
    setSrc(`${url2}/ver-contenido/IMAGEN/${safe}`)
  }, [nombre])

  // Recalcular al cambiar modo / tamaño contenedor
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      // cambiar zoom para respetar el modo actual
      setZoomFactor(1)
      setOffset({ x: 0, y: 0 })
    })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const containerSize = useMemo(() => {
    const el = containerRef.current
    return el ? { w: el.clientWidth, h: el.clientHeight } : { w: 0, h: 0 }
  }, [containerRef.current, mode])

  const baseScale = useMemo(() => {
    if (!natural || !containerRef.current) return 1
    const { width: cw, height: ch } =
      containerRef.current.getBoundingClientRect()

    const { w: iw, h: ih } = natural
    if (iw === 0 || ih === 0 || cw === 0 || ch === 0) return 1

    if (mode === "fit") return Math.min(cw / iw, ch / ih)
    if (mode === "width") return cw / iw
    return 1 // actual
  }, [mode, natural])

  const scale = Math.max(0.1, Math.min(8, baseScale * zoomFactor))

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    if (!natural) return
    if (!e.ctrlKey) return // solo con Ctrl para no interferir con scroll normal
    e.preventDefault()

    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoomFactor((z) => Math.max(0.1, Math.min(8, z + delta)))
  }

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    setDragging(true)
    dragRef.current = { x: e.clientX - offset.x, y: e.clientY - offset.y }
  }
  const onMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!dragging) return
    setOffset({
      x: e.clientX - (dragRef.current?.x ?? 0),
      y: e.clientY - (dragRef.current?.y ?? 0),
    })
  }
  const onMouseUp = () => {
    setDragging(false)
    dragRef.current = null
  }

  const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = () => {
    // alternar entre fit y 100%
    setMode((m) => (m === "actual" ? "fit" : "actual"))
    setZoomFactor(1)
    setOffset({ x: 0, y: 0 })
  }

  const enterFs = async () => {
    const el = wrapperRef.current
    if (!el) return
    if (!document.fullscreenElement)
      await el.requestFullscreen().catch(() => {})
    else await document.exitFullscreen().catch(() => {})
  }

  const reset = () => {
    setMode("fit")
    setZoomFactor(1)
    setRotation(0)
    setOffset({ x: 0, y: 0 })
  }

  const zoomIn = () => setZoomFactor((z) => Math.min(8, z + 0.1))
  const zoomOut = () => setZoomFactor((z) => Math.max(0.1, z - 0.1))

  const percent = Math.round(scale * 100)

  if (!src) {
    return (
      <Estructura>
        <div className="visor-blank">No se encontró la imagen solicitada.</div>
      </Estructura>
    )
  }

  return (
    <Estructura>
      <button
        className="btn-volver"
        onClick={() => {
          navigate(-1)
          setTimeout(() => startListening(), 300)
        }}
      >
        ⬅ Volver
      </button>

      <div className="visor-root" ref={wrapperRef}>
        <div
          className="toolbar"
          role="toolbar"
          aria-label="Controles del visor de imagen"
        >
          <div className="group">
            <button
              className="btn"
              onClick={zoomOut}
              title="Alejar (Ctrl+rueda)"
            >
              −
            </button>
            <span className="readout" aria-live="polite">
              {percent}%
            </span>
            <button
              className="btn"
              onClick={zoomIn}
              title="Acercar (Ctrl+rueda)"
            >
              +
            </button>
          </div>
          <div className="group">
            <button
              className={`btn ${mode === "fit" ? "active" : ""}`}
              onClick={() => {
                setMode("fit")
                setZoomFactor(1)
                setOffset({ x: 0, y: 0 })
              }}
              title="Ajustar a pantalla"
            >
              Ajustar
            </button>
            <button
              className={`btn ${mode === "width" ? "active" : ""}`}
              onClick={() => {
                setMode("width")
                setZoomFactor(1)
                setOffset({ x: 0, y: 0 })
              }}
              title="Ajustar al ancho"
            >
              Ancho
            </button>
            <button
              className={`btn ${mode === "actual" ? "active" : ""}`}
              onClick={() => {
                setMode("actual")
                setZoomFactor(1)
                setOffset({ x: 0, y: 0 })
              }}
              title="100%"
            >
              100%
            </button>
            <button className="btn" onClick={reset} title="Reiniciar">
              Reiniciar
            </button>
          </div>
          <div className="group">
            <button
              className="btn"
              onClick={() => setRotation((r) => (r - 90) % 360)}
              title="Rotar 90° izq"
            >
              ⟲
            </button>
            <button
              className="btn"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              title="Rotar 90° der"
            >
              ⟳
            </button>
          </div>
          <div className="group">
            <a className="btn" href={src} download title="Descargar">
              ⬇
            </a>
            <button className="btn" onClick={enterFs} title="Pantalla completa">
              ⤢
            </button>
          </div>
        </div>

        <div
          className={`stage ${dragging ? "dragging" : ""}`}
          ref={containerRef}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseUp}
          onMouseUp={onMouseUp}
          onDoubleClick={onDoubleClick}
          role="region"
          aria-label="Área de visualización"
          tabIndex={0}
        >
          {/* Imagen real */}
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img
            ref={imgRef}
            src={src}
            alt={nombre || "Imagen"}
            onLoad={(e) => {
              const t = e.currentTarget
              setNatural({ w: t.naturalWidth, h: t.naturalHeight })
            }}
            onError={() => {
              setNatural(null)
            }}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${scale})`,
              transformOrigin: "center center",
            }}
            className="image"
            draggable={false}
          />
        </div>
      </div>
    </Estructura>
  )
}
