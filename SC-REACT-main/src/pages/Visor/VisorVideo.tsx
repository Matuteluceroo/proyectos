import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Estructura from "../../components/Estructura/Estructura";
import "./VisorVideo.css";

export default function VisorVideo() {
  const { nombre } = useParams<{ nombre: string }>();
  const [urlVideo, setUrlVideo] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (nombre) {
      setUrlVideo(`http://localhost:1235/ver-contenido/VIDEO/${nombre}`);
    }
  }, [nombre]);

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!document.fullscreenElement) {
      video?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  if (!urlVideo) {
    return (
      <Estructura>
        <p>No se encontró el video solicitado.</p>
      </Estructura>
    );
  }

  return (
    <Estructura>
      <div className="visor-video-wrapper">
        <h2>{decodeURIComponent(nombre || "")}</h2>

        <div className="video-container">
          <video
            ref={videoRef}
            src={urlVideo}
            controls
            className="video-player"
          />
        </div>

        <div className="video-toolbar">
          <button onClick={toggleFullscreen}>
            {fullscreen ? "❌ Salir" : "🖥 Pantalla completa"}
          </button>
          <a href={urlVideo} download>
            ⬇ Descargar
          </a>
        </div>
      </div>
    </Estructura>
  );
}
