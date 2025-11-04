import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Estructura from "../../components/Estructura/Estructura";
import "./VisorImagen.css";

export default function VisorImagen() {
  const { nombre } = useParams<{ nombre: string }>();
  const [urlImagen, setUrlImagen] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (nombre) {
      setUrlImagen(`http://localhost:1235/ver-contenido/IMAGEN/${nombre}`);
    }
  }, [nombre]);

  if (!urlImagen) {
    return (
      <Estructura>
        <p>No se encontró la imagen solicitada.</p>
      </Estructura>
    );
  }

  return (
    <Estructura>
      <div className="visor-imagen-wrapper">
        <div className="imagen-toolbar">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}>
            🔍 -
          </button>
          <button onClick={() => setZoom((z) => Math.min(3, z + 0.1))}>
            🔍 +
          </button>
          <a href={urlImagen} download>
            ⬇ Descargar
          </a>
        </div>

        <div className="imagen-container">
          <img
            src={urlImagen}
            alt={nombre || "Imagen"}
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
      </div>
    </Estructura>
  );
}
