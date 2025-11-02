import { useState } from "react";

export default function VisorPDF({ url }) {
  const [error, setError] = useState(false);

  if (!url) return <p>📄 No hay archivo PDF disponible.</p>;

  // Si hubo error al cargar
  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <p style={{ color: "red" }}>⚠️ No se pudo cargar el PDF.</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            marginTop: "10px",
            color: "#497b1a",
            textDecoration: "none",
          }}
        >
          📎 Abrir PDF en nueva pestaña
        </a>
      </div>
    );
  }

  return (
    <div className="visor-pdf" style={{ textAlign: "center" }}>
      <iframe
        src={url}
        width="100%"
        height="600px"
        title="Visor PDF"
        onError={() => setError(true)}
        style={{
          border: "none",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#f9f9f9",
        }}
      />
      <div style={{ marginTop: "10px" }}>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#497b1a",
            textDecoration: "none",
          }}
        >
          📎 Abrir PDF en nueva pestaña
        </a>
      </div>
    </div>
  );
}
