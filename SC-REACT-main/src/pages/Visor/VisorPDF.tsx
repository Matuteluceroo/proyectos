import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Estructura from "../../components/Estructura/Estructura";
import "./VisorPDF.css";

export default function VisorPDF() {
  const { nombre } = useParams<{ nombre: string }>();
  const [urlPDF, setUrlPDF] = useState<string | null>(null);

  useEffect(() => {
    if (nombre) {
      // ⚙️ puerto correcto del backend
      setUrlPDF(`http://localhost:1235/ver-contenido/PDF/${nombre}`);
    }
  }, [nombre]);

  if (!urlPDF) {
    return (
      <Estructura>
        <p>No se encontró el PDF solicitado.</p>
      </Estructura>
    );
  }

  return (
    <Estructura>
      <div className="visor-pdf-container">
        <iframe src={urlPDF} title={nombre} className="visor-pdf-frame" />
      </div>
    </Estructura>
  );
}
