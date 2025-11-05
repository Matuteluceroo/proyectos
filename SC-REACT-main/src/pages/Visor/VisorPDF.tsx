import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Estructura from "../../components/Estructura/Estructura";
import "./VisorPDF.css";

type Mode = "fit" | "width" | "actual";

export default function VisorPDF() {
  const { nombre } = useParams<{ nombre: string }>();
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | undefined>(undefined);
  // const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("fit");
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [page, setPage] = useState<number>(1);
  const [fullscreen, setFullscreen] = useState(false);

  // Construir URL base segura
  useEffect(() => {
    if (!nombre) return;
    const safe = encodeURIComponent(decodeURIComponent(nombre));
    setBaseUrl(`http://localhost:1235/ver-contenido/PDF/${safe}`);
  }, [nombre]);

  // Construir src con parámetros del visor nativo del navegador
  const src = useMemo(() => {
    if (!baseUrl) return undefined;
    const zoomParam =
      mode === "fit"
        ? "page-fit"
        : mode === "width"
        ? "page-width"
        : `${zoomPercent}`;
    return `${baseUrl}#page=${Math.max(1, page)}&zoom=${zoomParam}`;
  }, [baseUrl, mode, zoomPercent, page]);

  // Acciones
  const zoomIn = () => {
    setMode("actual");
    setZoomPercent((z) => Math.min(500, z + 25));
  };
  const zoomOut = () => {
    setMode("actual");
    setZoomPercent((z) => Math.max(25, z - 25));
  };
  const reset = () => {
    setMode("fit");
    setZoomPercent(100);
    setPage(1);
  };
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => p + 1);

  const toggleFullscreen = async () => {
    const el = wrapperRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setFullscreen(true);
      } else {
        await document.exitFullscreen();
        setFullscreen(false);
      }
    } catch {
      /* noop */
    }
  };

  if (!src) {
    return (
      <Estructura>
        <div className="vp-blank">No se encontró el PDF solicitado.</div>
      </Estructura>
    );
  }

  const percentReadout =
    mode === "fit" ? "Ajustar" : mode === "width" ? "Ancho" : `${zoomPercent}%`;

  return (
    <Estructura>
      <div className="vp-root" ref={wrapperRef}>
        {/* Toolbar */}
        <div
          className="vp-toolbar"
          role="toolbar"
          aria-label="Controles del visor de PDF"
        >
          <div className="group">
            <button className="btn" onClick={zoomOut} title="Alejar">
              −
            </button>
            <span className="readout" aria-live="polite">
              {percentReadout}
            </span>
            <button className="btn" onClick={zoomIn} title="Acercar">
              +
            </button>
          </div>

          <div className="group">
            <button
              className={`btn ${mode === "fit" ? "active" : ""}`}
              onClick={() => setMode("fit")}
              title="Ajustar a pantalla"
            >
              Ajustar
            </button>
            <button
              className={`btn ${mode === "width" ? "active" : ""}`}
              onClick={() => setMode("width")}
              title="Ajustar al ancho"
            >
              Ancho
            </button>
            <button
              className={`btn ${mode === "actual" ? "active" : ""}`}
              onClick={() => setMode("actual")}
              title="100%"
            >
              100%
            </button>
            <button className="btn" onClick={reset} title="Reiniciar">
              Reiniciar
            </button>
          </div>

          <div className="group">
            <button className="btn" onClick={goPrev} title="Página anterior">
              ⟸
            </button>
            <label className="page">
              Pág.
              <input
                type="number"
                min={1}
                value={page}
                onChange={(e) =>
                  setPage(Math.max(1, Number(e.target.value) || 1))
                }
              />
            </label>
            <button className="btn" onClick={goNext} title="Página siguiente">
              ⟹
            </button>
          </div>

          <div className="group">
            <a className="btn" href={baseUrl} download title="Descargar PDF">
              ⬇ Descargar
            </a>
            <button
              className="btn"
              onClick={toggleFullscreen}
              title="Pantalla completa"
            >
              ⤢ {fullscreen ? "Salir" : "Full"}
            </button>
          </div>
        </div>

        {/* Stage */}
        <div className="vp-stage" role="region" aria-label="Área de lectura">
          <iframe
            src={src}
            title={decodeURIComponent(nombre || "PDF")}
            className="vp-frame"
          />
        </div>
      </div>
    </Estructura>
  );
}
