import { useState, useEffect, useMemo } from "react";
import Estructura from "../../components/Estructura/Estructura";
import "./Buscador.css";
import { FaSearch, FaMicrophone } from "react-icons/fa";
import {
  useBuscarContenidos,
  useObtenerUltimosContenidos,
} from "../../services/connections/contenido";
import { useObtenerTiposConocimiento } from "../../services/connections/tiposConocimiento";
import { useNavigate } from "react-router-dom";
import {
  useObtenerTopConsultados,
  useRegistrarHistorial,
} from "../../services/connections/historial";
import { useSocket } from "../../services/SocketContext";
import citricolosprueba from "../../assets/citricolosprueba.jpg";

// === Helpers ===
const toId = (item) =>
  item?.id ?? item?.id_contenido ?? item?.Id ?? item?.ID ?? null;
const toTipoNombre = (item) => item?.tipoNombre ?? item?.tipo ?? "";
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "");

// === Util: decidir visor según tipo/extension ===
const getVisorPath = (item) => {
  const id = item.id_contenido || item.id;
  const almacenamiento = (
    item.almacenamiento ||
    item.tipoNombre ||
    ""
  ).toUpperCase();
  const file = (item.url_archivo || "")
    .trim()
    .replace(/\\/g, "/")
    .split("/")
    .pop();
  const ext = file.split(".").pop()?.toLowerCase();

  if (almacenamiento === "HTML" || item.origen === "HTML")
    return `/visor-html/${id}`;
  if (
    almacenamiento === "IMAGEN" ||
    ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)
  )
    return `/visor-imagen/${file}`;
  if (
    almacenamiento === "VIDEO" ||
    ["mp4", "webm", "ogg", "mov", "mkv", "avi"].includes(ext)
  )
    return `/visor-video/${file}`;
  if (almacenamiento === "PDF" || ext === "pdf") return `/visor-pdf/${file}`;

  return `/visor-html/${id}`; // fallback
};

export default function Buscador() {
  const { currentUser } = useSocket() ?? {};
  const [query, setQuery] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resultados, setResultados] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Todos");
  const [ultimos, setUltimos] = useState([]);
  const [topConsultados, setTopConsultados] = useState([]);

  const buscarContenidos = useBuscarContenidos();
  const obtenerTipos = useObtenerTiposConocimiento();
  const obtenerUltimos = useObtenerUltimosContenidos();
  const registrarHistorial = useRegistrarHistorial();
  const obtenerTopConsultados = useObtenerTopConsultados();
  const navigate = useNavigate();

  // === Cargar tipos, últimos contenidos y top consultados ===
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [dataTipos, dataUltimos, dataTop] = await Promise.all([
          obtenerTipos(),
          obtenerUltimos(currentUser?.id),
          obtenerTopConsultados(),
        ]);
        if (!mounted) return;
        setTipos(Array.isArray(dataTipos) ? dataTipos : []);
        setUltimos(Array.isArray(dataUltimos) ? dataUltimos : []);
        setTopConsultados(Array.isArray(dataTop) ? dataTop : []);
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // === Buscar contenidos ===
  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setIsLoading(true);
    setError("");
    try {
      const data = await buscarContenidos(q, currentUser?.id);
      const lista = Array.isArray(data) ? data : [];
      if (lista.length === 0) {
        setResultados([]);
        return;
      }
      const filtrados =
        tipoSeleccionado === "Todos"
          ? lista
          : lista.filter((c) => toTipoNombre(c) === tipoSeleccionado);
      setResultados(filtrados);
    } catch (err) {
      console.error("Error buscando contenidos:", err);
      setError("No se pudo conectar con el servidor");
    } finally {
      setIsLoading(false);
    }
  };

  // === Micrófono ===
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
      const texto = event.results?.[0]?.[0]?.transcript ?? "";
      setQuery(texto);
      setTimeout(() => handleSearch(), 250);
    };

    recognition.start();
  };

  // === Registrar consulta y navegar ===
  const handleClickCard = async (item) => {
    const idContenido = toId(item);
    if (!idContenido) return;
    try {
      if (currentUser?.id) {
        await registrarHistorial({
          id_usuario: currentUser.id,
          id_contenido: idContenido,
          tipo: item.origen === "HTML" ? "HTML" : "ARCHIVO", // 👈 agregado
        });
      }
    } catch (error) {
      console.error("❌ Error al registrar consulta:", error);
    } finally {
      const path = getVisorPath(item);
      navigate(path);
    }
  };

  const ultimosPorTipo = useMemo(
    () => (Array.isArray(ultimos) ? ultimos : []),
    [ultimos]
  );

  // === Icono segun origen ===
  const getIconoOrigen = (origen) => {
    switch ((origen || "").toUpperCase()) {
      case "HTML":
        return "📝";
      case "TAG":
        return "🔖";
      default:
        return "📄";
    }
  };

  // === Render de tarjeta ===
  const renderCard = (item, showDescripcion = false) => {
    const id = toId(item);
    const icono = getIconoOrigen(item.origen);
    return (
      <div
        key={id ?? item?.titulo}
        className="card"
        onClick={() => handleClickCard(item)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) =>
          (e.key === "Enter" || e.key === " ") && handleClickCard(item)
        }
        style={{ cursor: "pointer" }}
        aria-label={`Abrir ${item?.titulo ?? "contenido"}`}
      >
        <img src={citricolosprueba} alt={item?.titulo ?? ""} />
        <p className="card-titulo">
          {icono} {item?.titulo}
        </p>
        <p className="card-autor">
          {(item?.autorNombre || "Sin autor") +
            " — " +
            (toTipoNombre(item) || item?.fecha_creacion || "")}
        </p>
        {showDescripcion && item?.descripcion && (
          <p className="card-descripcion">{item.descripcion}</p>
        )}
      </div>
    );
  };

  const showEmpty =
    !isLoading &&
    !error &&
    ((query && resultados.length === 0) ||
      (!query && ultimosPorTipo.length === 0));

  // === Agrupamos sugerencias por TAG si existen ===
  const sugeridos = resultados.filter((r) => r.origen === "TAG");

  return (
    <Estructura>
      <div className="buscador-wrapper">
        {/* === Caja del buscador === */}
        <div className="buscador-box">
          <FaSearch className="icon-search" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conocimiento..."
            className="buscador-input"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            aria-label="Buscar conocimiento"
          />
          <FaMicrophone
            className={`icon-mic ${isListening ? "active" : ""}`}
            onClick={handleMicClick}
            title="Hablar"
            aria-label="Buscar por voz"
          />
        </div>

        {/* === Filtros === */}
        <div className="filtros">
          <button
            className={`filtro-btn ${
              tipoSeleccionado === "Todos" ? "activo" : ""
            }`}
            onClick={() => setTipoSeleccionado("Todos")}
          >
            Todos
          </button>
          {Array.isArray(tipos) &&
            tipos.map((tipo) => (
              <button
                key={tipo.id_tipo ?? tipo.nombre}
                className={`filtro-btn ${
                  tipoSeleccionado === tipo.nombre ? "activo" : ""
                }`}
                onClick={() => setTipoSeleccionado(tipo.nombre)}
              >
                {tipo.nombre}
              </button>
            ))}
        </div>

        {/* === Estado === */}
        {isLoading && (
          <div className="estado" style={{ color: "#497b1a" }}>
            Buscando...
          </div>
        )}
        {error && (
          <div className="estado" style={{ color: "red" }}>
            {error}
          </div>
        )}

        {/* === Resultados o últimos por tipo === */}
        <div className="resultados">
          {resultados.length > 0 ? (
            <>
              <div className="cards-container">
                {resultados
                  .filter((r) => r.origen !== "TAG")
                  .map((item) => renderCard(item, true))}
              </div>

              {/* Sección sugeridos */}
              {sugeridos.length > 0 && (
                <div
                  className="categoria-seccion"
                  style={{ marginTop: "2rem" }}
                >
                  <h3 className="categoria-titulo">
                    🎯 Contenidos sugeridos para vos
                  </h3>
                  <div className="cards-container">
                    {sugeridos.map((item) => renderCard(item, true))}
                  </div>
                </div>
              )}
            </>
          ) : (
            ultimosPorTipo
              .filter(
                (grupo) =>
                  tipoSeleccionado === "Todos" ||
                  (grupo?.tipo ?? "").toLowerCase() ===
                    tipoSeleccionado.toLowerCase()
              )
              .map((grupo) => (
                <div key={grupo?.tipo ?? "otros"} className="categoria-seccion">
                  <h3 className="categoria-titulo">Últimos {grupo?.tipo}</h3>
                  <div className="cards-container">
                    {Array.isArray(grupo?.items) &&
                      grupo.items.map((item) => renderCard(item))}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* === Más consultados recientemente === */}
        {topConsultados.length > 0 && (
          <div className="categoria-seccion">
            <h3 className="categoria-titulo">
              📈 Más consultados recientemente
            </h3>
            <div className="cards-container">
              {topConsultados.map((item) => (
                <div
                  key={toId(item) ?? item?.titulo}
                  className="card"
                  onClick={() => handleClickCard(item)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    handleClickCard(item)
                  }
                  style={{ cursor: "pointer" }}
                  aria-label={`Abrir ${item?.titulo ?? "contenido"}`}
                >
                  <img src={citricolosprueba} alt={item?.titulo ?? ""} />
                  <p className="card-titulo">📈 {item?.titulo}</p>
                  <p className="card-autor">
                    {(item?.autorNombre || "Sin autor") +
                      " — " +
                      (toTipoNombre(item) || "")}
                  </p>
                  {typeof item?.totalConsultas !== "undefined" && (
                    <p className="card-descripcion">
                      Consultas: {item.totalConsultas}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {showEmpty && (
          <div className="empty-state">
            {query
              ? "No se encontraron resultados para tu búsqueda."
              : "Todavía no hay contenidos para mostrar."}
          </div>
        )}
      </div>
    </Estructura>
  );
}
