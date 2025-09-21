import React, { useState } from "react";
import Estructura from "../../components/Estructura/Estructura";
import MediaViewer from "../../components/MediaViewer/MediaViewer";
const PuntoConocimiento: React.FC = () => {
  const [query, setQuery] = useState("");
  const [resultado, setResultado] = useState<{
    tipo: "video" | "imagen" | "pdf" | string;
    titulo: string;
    descripcion: string;
    url?: string;
  } | null>(null);

  // Construí las URLs como ya lo tenías
  const videoUrl = new URL("./EjemplosSC/video.mp4", import.meta.url).href;
  const imgUrl = new URL("./EjemplosSC/imagen.png", import.meta.url).href;
  const pdfUrl = new URL("./EjemplosSC/pdf.pdf", import.meta.url).href;

  const data = [
    { tipo: "video", titulo: "Ejemplo de Video", descripcion: "Estoy mostrando un video", url: videoUrl },
    { tipo: "imagen", titulo: "Ejemplo de Imagen", descripcion: "Estoy mostrando una imagen", url: imgUrl },
    { tipo: "pdf", titulo: "Ejemplo de PDF", descripcion: "Estoy mostrando un PDF", url: pdfUrl },
  ];

  const handleBuscar = () => {
    const encontrado = data.find((i) => i.tipo.toLowerCase() === query.toLowerCase());
    setResultado(encontrado || null);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") handleBuscar();
  };

  return (
    <Estructura>
      {/* Página en grid: header / search / viewer */}
      <div
        style={{
          height: "100vh",
          display: "grid",
          gridTemplateRows: "auto auto 1fr",
          gap: 12,
          overflow: "hidden",
        }}
      >

        {/* Buscador */}
        <div className="row justify-content-center">
          <div className="col-6 d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Escriba video, imagen o pdf"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="btn btn-primary" onClick={handleBuscar}>
              Buscar
            </button>
          </div>
        </div>

        {/* Viewer: ocupa toda la fila 3 */}
        <div style={{ minHeight: 0, padding: "0 12px 12px 12px" }}>
          {resultado && (
            <MediaViewer
              tipo={resultado.tipo}
              titulo={resultado.titulo}
              descripcion={resultado.descripcion}
              url={resultado.url}
            />
          )}
        </div>

      </div>
    </Estructura>
  );
};

export default PuntoConocimiento;