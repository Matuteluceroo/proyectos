import VisorPDF from "./VisorPDF";
import VisorVideo from "./VisorVideo";
import VisorImagen from "./VisorImagen";
import VisorTexto from "./VisorTexto";
import "./VisorContenido.css";

export default function VisorContenido({ contenido }) {
  if (!contenido) return <p>No se ha seleccionado contenido</p>;

  const {
    tipoNombre,
    titulo,
    descripcion,
    url_completa,
    extension,
    contenido_html,
  } = contenido;

  const renderVisor = () => {
    const tipo = tipoNombre?.toUpperCase() || extension?.toUpperCase() || "";

    switch (true) {
      case tipo.includes("PDF"):
        return <VisorPDF url={url_completa} />;
      case tipo.includes("VIDEO") || [".MP4", ".MOV", ".WEBM"].includes(extension?.toUpperCase()):
        return <VisorVideo url={url_completa} />;
      case tipo.includes("IMAGEN") || [".JPG", ".JPEG", ".PNG"].includes(extension?.toUpperCase()):
        return <VisorImagen url={url_completa} titulo={titulo} />;
      case tipo.includes("TEXTO") || tipo.includes("HTML"):
        return <VisorTexto html={contenido_html || descripcion} />;
      default:
        return <p>Tipo de contenido no reconocido.</p>;
    }
  };

  return (
    <div className="visor-wrapper">
      <h2 className="visor-titulo">{titulo}</h2>
      {descripcion && <p className="visor-descripcion">{descripcion}</p>}
      <div className="visor-body">{renderVisor()}</div>
    </div>
  );
}
