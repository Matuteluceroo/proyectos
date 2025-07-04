import { useState, useEffect } from "react";
import { useBuscarDocumentos } from "../../services/connections/useDocumentos";
import { useNavigate } from "react-router-dom";
import Estructura from "../../components/Estructura/Estructura";

const Documentos = () => {
  const buscar = useBuscarDocumentos();
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length > 1) {
        buscar({ query }).then(setResultados).catch(console.error);
      }
    }, 300); // debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  return (
    <Estructura>
      <div style={{ padding: "2rem" }}>
        <input
          type="text"
          placeholder="Buscar documentos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "1rem",
            fontSize: "1.2rem",
            marginBottom: "2rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {resultados.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/documentos/${doc.id}`)}
              style={{
                border: "1px solid #ddd",
                borderRadius: "8px",
                padding: "1rem",
                cursor: "pointer",
                backgroundColor: "#fafafa",
                transition: "box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <h3>{doc.titulo}</h3>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                {doc.textoPlano.slice(0, 120)}...
              </p>
              <small>
                {new Date(doc.fechaCreacion).toLocaleDateString()} - Autor ID:{" "}
                {doc.autor}
              </small>
            </div>
          ))}
        </div>
      </div>
    </Estructura>
  );
};

export default Documentos;
