export default function VisorTexto({ html }) {
  if (!html) return <p>No hay contenido disponible</p>;

  return (
    <div
      className="visor-texto"
      style={{
        fontSize: "1rem",
        lineHeight: 1.6,
        color: "#333",
        backgroundColor: "#fff",
        padding: "1rem",
        borderRadius: "8px",
        boxShadow: "0 0 8px rgba(0,0,0,0.1)",
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
