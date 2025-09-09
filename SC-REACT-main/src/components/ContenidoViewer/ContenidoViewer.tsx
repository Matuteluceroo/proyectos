import React from "react";

interface ContenidoViewerProps {
  titulo: string;
  autor: string;
  tipo: number; // 1 = PDF, 2 = Video, 3 = Imagen
  archivoUrl: string; // ej: /uploads/PDF/23-manual.pdf
}

const ContenidoViewer: React.FC<ContenidoViewerProps> = ({
  titulo,
  autor,
  tipo,
  archivoUrl,
}) => {
  const renderContenido = () => {
    switch (tipo) {
      case 1: // PDF
        return (
          <iframe
            src={archivoUrl}
            style={{ width: "100%", height: "500px", border: "none" }}
            title={titulo}
          />
        );
      case 2: // Video
        return (
          <video
            controls
            style={{ width: "100%", maxHeight: "500px", borderRadius: "8px" }}
          >
            <source src={archivoUrl} type="video/mp4" />
            Tu navegador no soporta la reproducción de video.
          </video>
        );
      case 3: // Imagen
        return (
          <img
            src={archivoUrl}
            alt={titulo}
            style={{ maxWidth: "100%", maxHeight: "500px", borderRadius: "8px" }}
          />
        );
      default:
        return <p>Tipo de contenido no soportado.</p>;
    }
  };

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "16px",
        background: "#fff",
      }}
    >
      {/* Título */}
      <h3 style={{ marginBottom: "16px" }}>{titulo}</h3>

      {/* Contenido dinámico */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "16px",
        }}
      >
        {renderContenido()}
      </div>

      {/* Autor */}
      <div style={{ textAlign: "right", fontStyle: "italic", color: "#555" }}>
        Autor: {autor}
      </div>
    </div>
  );
};

export default ContenidoViewer;
