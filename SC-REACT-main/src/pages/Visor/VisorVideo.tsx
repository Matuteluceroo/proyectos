import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Estructura from "../../components/Estructura/Estructura";
import "./VisorVideo.css";
import { url2 } from "../../services/connections/consts";

type Mode = "fit" | "width" | "actual";

export default function VisorVideo() {
  const { nombre } = useParams<{ nombre: string }>();

  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [src, setSrc] = useState<string | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [mode, setMode] = useState<Mode>("fit");
  const [fullscreen, setFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // para recalcular cuando cambie el tamaño del contenedor
  const [containerTick, setContainerTick] = useState(0);

  useEffect(() => {
    if (!nombre) return;
    const safe = encodeURIComponent(decodeURIComponent(nombre));
    setSrc(`${url2}/ver-contenido/VIDEO/${safe}`);
  }, [nombre]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerTick((t) => t + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // listeners básicos del video
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [src]);

  // atajos de teclado (espacio/k play/pause, flechas, f fullscreen, m mute, [ ] velocidad)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          if (v.paused) v.play();
          else v.pause();
          break;
        case "ArrowLeft":
          v.currentTime = Math.max(0, v.currentTime - 5);
          break;
        case "ArrowRight":
          v.currentTime = Math.min(v.duration || Number.MAX_VALUE, v.currentTime + 5);
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          v.muted = !v.muted;
          setMuted(v.muted);
          break;
        case "[":
          changeRate(Math.max(0.25, +(v.playbackRate - 0.25).toFixed(2)));
          break;
        case "]":
          changeRate(Math.min(2, +(v.playbackRate + 0.25).toFixed(2)));
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const containerSize = useMemo(() => {
    const el = containerRef.current;
    return el ? { w: el.clientWidth, h: el.clientHeight } : { w: 0, h: 0 };
  }, [containerTick]);

  // escala para el readout (no usamos transform; sólo calculamos porcentaje)
  const baseScale = useMemo(() => {
    if (!natural || !containerSize.w || !containerSize.h) return 1;
    const { w: iw, h: ih } = natural;
    const { w: cw, h: ch } = containerSize;
    if (mode === "fit") return Math.min(cw / iw, ch / ih);
    if (mode === "width") return cw / iw;
    return 1; // actual
  }, [mode, natural, containerSize]);

  const percent = Math.round(baseScale * 100);

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

  const togglePip = async () => {
    const v = videoRef.current as any;
    const doc = document as any;
    if (!v) return;
    try {
      if (doc.pictureInPictureElement) {
        await doc.exitPictureInPicture();
      } else if (v.requestPictureInPicture) {
        await v.requestPictureInPicture();
      }
    } catch {
      /* noop */
    }
  };

  const changeRate = (rate: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = rate;
    setPlaybackRate(rate);
  };

  const computedStyle: React.CSSProperties =
    mode === "actual" && natural
      ? { width: `${natural.w}px`, height: "auto" }
      : mode === "width"
      ? { width: "100%", height: "auto" }
      : { maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto" };

  if (!src) {
    return (
      <Estructura>
        <div className="vv-blank">No se encontró el video solicitado.</div>
      </Estructura>
    );
  }

  return (
    <Estructura>
      <div className="vv-root" ref={wrapperRef}>
        {/* Toolbar */}
        <div className="vv-toolbar" role="toolbar" aria-label="Controles del visor de video">
          <div className="group">
            <span className="readout" aria-live="polite">{percent}%</span>
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
          </div>

          <div className="group">
            <button
              className="btn"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                if (v.paused) v.play();
                else v.pause();
              }}
              title="Reproducir / Pausar (Espacio o K)"
            >
              {isPlaying ? "⏸ Pausar" : "▶ Reproducir"}
            </button>
            <button
              className="btn"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.currentTime = Math.max(0, v.currentTime - 5);
              }}
              title="Retroceder 5s (←)"
            >
              ⟲ 5s
            </button>
            <button
              className="btn"
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.currentTime = Math.min(v.duration || Number.MAX_VALUE, v.currentTime + 5);
              }}
              title="Avanzar 5s (→)"
            >
              5s ⟳
            </button>
          </div>

          <div className="group">
            {[0.5, 1, 1.5, 2].map((r) => (
              <button
                key={r}
                className={`btn ${playbackRate === r ? "active" : ""}`}
                onClick={() => changeRate(r)}
                title="Velocidad"
              >
                {r}×
              </button>
            ))}
            <button
              className={`btn ${muted ? "active" : ""}`}
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.muted = !v.muted;
                setMuted(v.muted);
              }}
              title="Silenciar (M)"
            >
              {muted ? "🔇" : "🔊"}
            </button>
          </div>

          <div className="group">
            <a className="btn" href={src} download title="Descargar">
              ⬇ Descargar
            </a>
            <button className="btn" onClick={togglePip} title="Picture-in-Picture">
              ⧉ PiP
            </button>
            <button className="btn" onClick={toggleFullscreen} title="Pantalla completa (F)">
              ⤢ {fullscreen ? "Salir" : "Full"}
            </button>
          </div>
        </div>

        {/* Stage */}
        <div className="vv-stage" ref={containerRef} role="region" aria-label="Área de reproducción">
          <video
            ref={videoRef}
            src={src}
            className="vv-player"
            style={computedStyle}
            controls
            playsInline
            onLoadedMetadata={() => {
              const v = videoRef.current;
              if (!v) return;
              setNatural({ w: v.videoWidth, h: v.videoHeight });
              setMuted(v.muted);
              setPlaybackRate(v.playbackRate || 1);
            }}
            onDoubleClick={toggleFullscreen}
          />
        </div>
      </div>
    </Estructura>
  );
}
