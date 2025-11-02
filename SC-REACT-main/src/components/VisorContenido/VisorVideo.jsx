export default function VisorVideo({ url }) {
  if (!url) return <p>Video no disponible</p>;

  return (
    <div className="visor-video">
      <video
        controls
        preload="auto"
        style={{
          width: "100%",
          maxHeight: "600px",
          borderRadius: "8px",
          backgroundColor: "#000",
        }}
      >
        <source src={url} type="video/mp4" />
        Tu navegador no puede reproducir este formato de video.
      </video>
    </div>
  );
}
