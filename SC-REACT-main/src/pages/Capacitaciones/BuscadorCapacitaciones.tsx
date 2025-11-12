import { useState } from "react";
import { useBuscarContenidos } from "../../services/connections/contenido";
import PreviewModal from "./PreviewModal";
import "./BuscadorCapacitaciones.css";

interface BuscadorCapacitacionesProps {
  onSelect: (item: any) => void;
}

export default function BuscadorCapacitaciones({
  onSelect,
}: BuscadorCapacitacionesProps) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTipo, setPreviewTipo] = useState<
    "PDF" | "VIDEO" | "IMAGEN" | "HTML" | null
  >(null);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [previewNombre, setPreviewNombre] = useState<string | undefined>();
  const buscarContenidos = useBuscarContenidos();

  const handleBuscar = async () => {
    if (!query.trim()) return;
    setLoading(true);
    const data = await buscarContenidos(query);
    setResultados(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const handleSelect = (item: any) => {
    onSelect({
      id: item.id,
      titulo: item.titulo,
      tipoNombre: item.tipoNombre,
      origen: item.origen === "HTML" ? "HTML" : "ARCHIVO",
    });
  };

  const handlePreview = (item: any) => {
    const tipo = item.tipoNombre?.toUpperCase();
    if (["PDF", "VIDEO", "IMAGEN", "HTML"].includes(tipo)) {
      setPreviewTipo(tipo as any);
      if (tipo === "HTML") setPreviewId(item.id);
      else setPreviewNombre(item.titulo);
      setPreviewOpen(true);
    } else {
      alert("❌ Este tipo de contenido no tiene vista previa disponible.");
    }
  };

  return (
    <div className="buscador-capacitaciones">
      <h3>🔍 Buscar contenidos</h3>
      <div className="buscador-input">
        <input
          type="text"
          placeholder="Buscar por título, descripción o tipo..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
        />
        <button onClick={handleBuscar}>Buscar</button>
      </div>

      {loading && <p className="estado">Buscando...</p>}
      {!loading && resultados.length === 0 && query && (
        <p className="estado">No se encontraron resultados</p>
      )}

      <div className="resultados-lista">
        {resultados.map((r) => (
          <div key={`${r.id}-${r.origen}`} className="resultado-item">
            <div className="titulo">{r.titulo}</div>
            <div className="detalle">
              <span>{r.tipoNombre}</span>
              <span className="origen">({r.origen})</span>
            </div>
            <div className="acciones">
              <button className="btn-agregar" onClick={() => handleSelect(r)}>
                ➕ Agregar
              </button>
              <button
                className="btn-preview"
                onClick={() => handlePreview(r)}
              >
                👁️ Vista previa
              </button>
            </div>
          </div>
        ))}
      </div>

      <PreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        tipo={previewTipo}
        id={previewId}
        nombre={previewNombre}
      />
    </div>
  );
}
