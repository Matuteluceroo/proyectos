import React, { useMemo, useState } from "react";
import Estructura from "../../components/Estructura/Estructura";

// Tipos de dato para las tarjetas
export type VideoItem = {
  id: string | number;
  title: string;
  thumbnail: string; // URL de imagen
  href?: string;     // Link opcional al contenido
  meta?: string;     // Ej: duración, fecha, autor, etc.
};

// Props del componente
type Props = {
  items?: VideoItem[];
  placeholder?: string;
  title?: string;
};

// Datos de ejemplo (se usan solo si no llegan props.items)
const DEMO_ITEMS: VideoItem[] = Array.from({ length: 24 }).map((_, i) => ({
  id: i + 1,
  title: `Título de Video ${i + 1}`,
  thumbnail: `https://picsum.photos/seed/yt-${i + 1}/640/360`, // 16:9 aprox
  meta: i % 3 === 0 ? "12:34" : i % 3 === 1 ? "8:05" : "3:49",
  href: "#",
}));

// Estilos simples, compatibles con Bootstrap (si tu proyecto lo usa)
const styles: React.CSSProperties = {
  height: "100%",
  display: "flex",
  flexDirection: "column",
};

const contentStyles: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
};

export default function PantallaInicioYouTube({
  items = DEMO_ITEMS,
  placeholder = "Buscar",
  title = "Inicio",
}: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => it.title.toLowerCase().includes(q));
  }, [items, query]);

  return (
    <Estructura>
      <div style={styles}>
        {/* Header con título centrado y un buscador */}
        <div className="container-fluid py-3 border-bottom bg-body" role="search">
          <div className="row align-items-center g-2">
            <div className="col-12 col-md-3 d-none d-md-block" />
            <div className="col-12 col-md-6 text-center">
              <h1 className="h4 m-0">{title}</h1>
            </div>
            <div className="col-12 col-md-3" />

            <div className="col-12 mt-3">
              <label htmlFor="yt-search" className="visually-hidden">
                {placeholder}
              </label>
              <div className="input-group">
                <input
                  id="yt-search"
                  className="form-control"
                  type="search"
                  placeholder={placeholder}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setQuery("")}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido scrollable con grid responsivo de tarjetas */}
        <div style={contentStyles} className="container-fluid py-3">
          {/* Contador y feedback de búsqueda */}
          <div className="d-flex justify-content-between align-items-center mb-2 small text-muted">
            <span>
              {filtered.length} resultado{filtered.length === 1 ? "" : "s"}
            </span>
            {query && <span>Filtrado por: “{query}”</span>}
          </div>

          {/* Grid responsivo. Usa CSS Grid para columnas fluidas */}
          <div
            className="yt-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {filtered.map((item) => (
              <Card key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </Estructura>
  );
}

function Card({ item }: { item: VideoItem }) {
  return (
    <a
      href={item.href || "#"}
      className="text-decoration-none text-reset"
      style={{ display: "block" }}
    >
      <div
        className="card h-100 shadow-sm"
        style={{ borderRadius: 12, overflow: "hidden" }}
      >
        {/* Thumbnail 16:9 */}
        <div
          className="ratio"
          style={{ position: "relative", paddingTop: "56.25%" }}
          aria-label={item.title}
        >
          <img
            src={item.thumbnail}
            alt={item.title}
            loading="lazy"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform .2s ease",
            }}
            className="card-img-top"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://placehold.co/640x360?text=Sin+imagen";
            }}
          />
          {item.meta && (
            <span
              style={{
                position: "absolute",
                right: 8,
                bottom: 8,
                background: "rgba(0,0,0,.75)",
                color: "#fff",
                fontSize: 12,
                padding: "2px 6px",
                borderRadius: 6,
              }}
            >
              {item.meta}
            </span>
          )}
        </div>

        {/* Título */}
        <div className="card-body">
          <h2 className="card-title h6 mb-1" style={{ lineHeight: 1.25 }}>
            {item.title}
          </h2>
          {item.meta && (
            <p className="card-text text-muted small mb-0">{item.meta}</p>
          )}
        </div>
      </div>
    </a>
  );
}
