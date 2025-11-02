import { useState, useEffect } from "react";
import Estructura from "../../components/Estructura/Estructura";
import "./Buscador.css";
import { FaSearch, FaMicrophone } from "react-icons/fa";
import {
  useBuscarContenidos,
  useObtenerUltimosContenidos,
} from "../../services/connections/contenido";
import { useObtenerTiposConocimiento } from "../../services/connections/tiposConocimiento";
import { useNavigate } from "react-router-dom";
export default function Buscador() {
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultados, setResultados] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Todos");
  const [ultimos, setUltimos] = useState([]);

  const buscarContenidos = useBuscarContenidos();
  const obtenerTipos = useObtenerTiposConocimiento();
  const obtenerUltimos = useObtenerUltimosContenidos();
  const navigate = useNavigate();
  // 🔹 Cargar tipos y últimos contenidos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataTipos, dataUltimos] = await Promise.all([
          obtenerTipos(),
          obtenerUltimos(),
        ]);
        console.log("✅ Últimos desde el servidor:", dataUltimos);
        setTipos(dataTipos || []);
        setUltimos(Array.isArray(dataUltimos) ? dataUltimos : []);
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Buscar contenidos
  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await buscarContenidos(query);
      if (!data || data.length === 0) {
        setError("No se encontraron resultados");
        setResultados([]);
        return;
      }
      const filtrados =
        tipoSeleccionado === "Todos"
          ? data
          : data.filter((c) => c.tipoNombre === tipoSeleccionado);
      setResultados(filtrados);
    } catch (err) {
      console.error("Error:", err);
      setError("No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Micrófono
  const handleMicClick = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Tu navegador no soporta reconocimiento de voz");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript;
      setQuery(texto);
      setTimeout(() => handleSearch(), 300);
    };

    recognition.start();
  };

  // 🔹 Si el backend ya devuelve los datos agrupados por tipo
  const ultimosPorTipo = Array.isArray(ultimos) ? ultimos : [];

  return (
    <Estructura>
      <div className="buscador-wrapper">
        {/* === Buscador === */}
        <div className="buscador-box">
          <FaSearch className="icon-search" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conocimiento..."
            className="buscador-input"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <FaMicrophone
            className={`icon-mic ${isListening ? "active" : ""}`}
            onClick={handleMicClick}
            title="Hablar"
          />
        </div>

        {/* === Filtros === */}
        <div className="filtros">
          <button
            className={`filtro-btn ${tipoSeleccionado === "Todos" ? "activo" : ""
              }`}
            onClick={() => setTipoSeleccionado("Todos")}
          >
            Todos
          </button>
          {Array.isArray(tipos) &&
            tipos.map((tipo) => (
              <button
                key={tipo.id_tipo}
                className={`filtro-btn ${tipoSeleccionado === tipo.nombre ? "activo" : ""
                  }`}
                onClick={() => setTipoSeleccionado(tipo.nombre)}
              >
                {tipo.nombre}
              </button>
            ))}
        </div>

        {/* === Mensajes === */}
        {isLoading && <p style={{ color: "#497b1a" }}>Buscando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* === Resultados o últimos === */}
        <div className="resultados">
          {resultados.length > 0 ? (
            <div className="cards-container">
              {resultados.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  onClick={() => navigate(`/visor/${item.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={
                      item.url_archivo?.endsWith(".pdf")
                        ? "/img/pdf-icon.png"
                        : item.url_archivo || "/img/default.png"
                    }
                    alt={item.titulo}
                  />
                  <p className="card-titulo">{item.titulo}</p>
                  <p className="card-autor">
                    {item.autorNombre || "Sin autor"} — {item.tipoNombre || "Sin tipo"}
                  </p>
                  <p className="card-descripcion">{item.descripcion}</p>
                </div>
              ))}
            </div>
          ) : (
            ultimosPorTipo
              .filter(
                (grupo) =>
                  tipoSeleccionado === "Todos" ||
                  grupo.tipo.toLowerCase() === tipoSeleccionado.toLowerCase()
              )
              .map((grupo) => (
                <div key={grupo.tipo} className="categoria-seccion">
                  <h3 className="categoria-titulo">Últimos {grupo.tipo}</h3>
                  <div className="cards-container">
                    {Array.isArray(grupo.items) &&
                      grupo.items.map((item) => (
                        <div
                          key={item.id}
                          className="card"
                          onClick={() => navigate(`/visor/${item.id}`)} // 👈 agregado acá también
                          style={{ cursor: "pointer" }}
                        >
                          <img
                            src={
                              item.url_archivo?.endsWith(".pdf")
                                ? "/img/pdf-icon.png"
                                : item.url_archivo || "/img/default.png"
                            }
                            alt={item.titulo}
                          />
                          <p className="card-titulo">{item.titulo}</p>
                          <p className="card-autor">
                            {item.autorNombre || "Sin autor"} — {item.fecha_creacion}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </Estructura>
  );
}
