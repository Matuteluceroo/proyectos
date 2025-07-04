import { useParams } from "react-router-dom";
import { useObtenerDocumentoByID } from "../../services/connections/useDocumentos";
import { useEffect, useState, useContext } from "react";
import { useSocket } from "../../services/SocketContext";
//@ts-ignore
import html2pdf from "html2pdf.js";
import Estructura from "../../components/Estructura/Estructura";

const VerDocumento = () => {
  const { id } = useParams();
  const obtenerDocumento = useObtenerDocumentoByID();
  const [documento, setDocumento] = useState<any>(null);
  const { currentUser } = useSocket(); // o como obtengas el usuario actual

  useEffect(() => {
    if (id) {
      obtenerDocumento({ idDocumento: parseInt(id) })
        .then(setDocumento)
        .catch(console.error);
    }
  }, [id]);

  const exportarPDF = () => {
    if (!documento) return;
    const opt = {
      margin: 10,
      filename: `${documento.titulo}.pdf`,
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };
    html2pdf().from(documento.html).set(opt).save();
  };

  const puedeEditar = ["ADMINISTRADOR", "EXPERTO"].includes(currentUser?.rol);

  if (!documento) return <p>Cargando documento...</p>;

  return (
    <Estructura>
      <div style={{ padding: "2rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h1>{documento.titulo}</h1>

          <div style={{ display: "flex", gap: "1rem" }}>
            {puedeEditar && (
              <button onClick={() => alert("Ir a página de edición")}>
                ✏️ Editar
              </button>
            )}

            <button onClick={exportarPDF}>📄 Exportar PDF</button>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "2rem",
            marginTop: "1rem",
            borderRadius: "8px",
            background: "#fff",
          }}
          dangerouslySetInnerHTML={{ __html: documento.html }}
        />
      </div>
    </Estructura>
  );
};

export default VerDocumento;
