import React, { useMemo, useRef, useState } from "react";

interface MediaViewerProps {
  tipo: "imagen" | "video" | "pdf" | string;
  titulo: string;
  descripcion: string;
  url?: string;
}

type FitMode = "fit" | "normal";

const MediaViewer: React.FC<MediaViewerProps> = ({ tipo, titulo, descripcion, url }) => {
  const [mode, setMode] = useState<FitMode>("fit");
  const containerRef = useRef<HTMLDivElement>(null);

  // Para PDF: usar zoom por fragmento (Chrome/Edge/Firefox lo soportan en su visor)
  const pdfSrc = useMemo(() => {
    if (!url) return undefined;
    const hash = mode === "fit" ? "#zoom=page-fit" : "#zoom=100";
    // Evita duplicar hashes si ya hay uno
    const base = url.split("#")[0];
    return `${base}${hash}`;
  }, [url, mode]);

  const enterFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    // Safari < 16
    // @ts-ignore
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 8,
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 12,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: 200 }}>
          <h3 style={{ margin: 0 }}>{titulo}</h3>
          <small style={{ color: "#6c757d" }}>{descripcion}</small>
        </div>

        <div className="btn-group" role="group" aria-label="Controles de vista">
          <button
            className={`btn btn-sm ${mode === "fit" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setMode("fit")}
            title="Ajustar al panel"
          >
            Ajustar
          </button>
          <button
            className={`btn btn-sm ${mode === "normal" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setMode("normal")}
            title="Tamaño real (100%)"
          >
            100%
          </button>
          <button className="btn btn-sm btn-outline-secondary" onClick={enterFullscreen} title="Pantalla completa">
            ⛶
          </button>
          {url && (
            <a className="btn btn-sm btn-outline-secondary" href={url} target="_blank" rel="noreferrer">
              Abrir en pestaña
            </a>
          )}
        </div>
      </div>

      {/* Lienzo */}
      <div
        style={{
          minHeight: 0,
          overflow: mode === "normal" ? "auto" : "hidden",
          background: "#f8f9fa",
          borderRadius: 6,
          display: "grid",
          placeItems: mode === "fit" ? "center" : "start",
          padding: mode === "fit" ? 12 : 0,
        }}
      >
        {/* Imagen */}
        {tipo === "imagen" && url && (
          <img
            src={url}
            alt={titulo}
            style={
              mode === "fit"
                ? {
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                    display: "block",
                  }
                : {
                    // Tamaño real; si es más grande, scroll del contenedor
                    width: "auto",
                    height: "auto",
                    display: "block",
                  }
            }
          />
        )}

        {/* Video */}
        {tipo === "video" && url && (
          <video
            controls
            src={url}
            style={
              mode === "fit"
                ? {
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: "100%",
                    height: "auto",
                    objectFit: "contain",
                    display: "block",
                  }
                : {
                    // Tamaño real; deja que el video use su tamaño natural,
                    // y si se pasa, el contenedor hace scroll
                    display: "block",
                  }
            }
          />
        )}

        {/* PDF */}
        {tipo === "pdf" && url && (
          <iframe
            // usar pdfSrc que incluye el #zoom
            src={pdfSrc}
            title={titulo}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "#fff",
            }}
          />
        )}
      </div>
    </div>
  );
};

export default MediaViewer;
