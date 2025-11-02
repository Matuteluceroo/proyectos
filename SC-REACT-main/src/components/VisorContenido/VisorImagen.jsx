export default function VisorImagen({ url, titulo }) {
  if (!url) return <p>Imagen no disponible</p>;

  const esBase64 = url.startsWith("data:image");

  return (
    <div className="visor-imagen">
      <img
        src={url}
        alt={titulo || "Imagen"}
        style={{
          maxWidth: "100%",
          maxHeight: "600px",
          objectFit: "contain",
          borderRadius: "8px",
          boxShadow: esBase64 ? "0 0 8px rgba(0,0,0,0.2)" : "none",
        }}
      />
    </div>
  );
}
