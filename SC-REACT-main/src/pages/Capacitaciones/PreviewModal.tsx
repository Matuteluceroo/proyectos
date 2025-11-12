import VisorPDF from "../../pages/Visor/VisorPDF";
import VisorVideo from "../../pages/Visor/VisorVideo";
import VisorImagen from "../../pages/Visor/VisorImagen";
import VisorHtml from "../../pages/Contenido/VisorHtml";
import "./PreviewModal.css";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: "PDF" | "VIDEO" | "IMAGEN" | "HTML" | null;
  id?: number | null;
  nombre?: string;
}

export default function PreviewModal({
  isOpen,
  onClose,
  tipo,
  id,
  nombre,
}: PreviewModalProps) {
  if (!isOpen || !tipo) return null;

  const renderVisor = () => {
    switch (tipo) {
      case "PDF":
        return <VisorPDF key={nombre} />;
      case "VIDEO":
        return <VisorVideo key={nombre} />;
      case "IMAGEN":
        return <VisorImagen key={nombre} />;
      case "HTML":
        return <VisorHtml key={id} />;
      default:
        return <p>No hay vista previa disponible</p>;
    }
  };

  return (
    <div className="preview-overlay" onClick={onClose}>
      <div className="preview-content" onClick={(e) => e.stopPropagation()}>
        <div className="preview-header">
          <h3>Vista previa {tipo}</h3>
          <button onClick={onClose}>✖</button>
        </div>
        <div className="preview-body">{renderVisor()}</div>
      </div>
    </div>
  );
}
