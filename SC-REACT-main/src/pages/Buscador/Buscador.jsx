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
import {
  useObtenerTopConsultados,
  useRegistrarHistorial,
} from "../../services/connections/historial";
import { useSocket } from "../../services/SocketContext";
import citricolosprueba from "../../assets/citricolosprueba.jpg";
export default function Buscador() {
  const { currentUser, notificaciones } = useSocket();
  console.log(currentUser);
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
    const fetchData = async () => {
      try {
        const [dataTipos, dataUltimos, dataTop] = await Promise.all([
          obtenerTipos(),
          obtenerUltimos(),
          obtenerTopConsultados(),
        ]);
        setTipos(dataTipos || []);
        setUltimos(Array.isArray(dataUltimos) ? dataUltimos : []);
        setTopConsultados(Array.isArray(dataTop) ? dataTop : []);
      } catch (err) {
        console.error("Error al cargar datos iniciales:", err);
      }
    };
    fetchData();
  }, []);

  // === Buscar contenidos ===
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
      const texto = event.results[0][0].transcript;
      setQuery(texto);
      setTimeout(() => handleSearch(), 300);
    };

    recognition.start();
  };

  // === Registrar consulta y navegar ===
  const handleClickCard = async (id_contenido) => {
    try {
      console.log("usuariosid", currentUser.id, "id_contenido", id_contenido);
      if (currentUser.id) {
        await registrarHistorial({
          id_usuario: currentUser.id,
          id_contenido,
        });
      }
      navigate(`/visor/${id_contenido}`);
    } catch (error) {
      console.error("❌ Error al registrar consulta:", error);
      navigate(`/visor/${id_contenido}`);
    }
  };

  // === Agrupación de últimos por tipo ===
  const ultimosPorTipo = Array.isArray(ultimos) ? ultimos : [];

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
                key={tipo.id_tipo}
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
        {isLoading && <p style={{ color: "#497b1a" }}>Buscando...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {/* === Resultados o últimos por tipo === */}
        <div className="resultados">
          {resultados.length > 0 ? (
            <div className="cards-container">
              {resultados.map((item) => (
                <div
                  key={item.id}
                  className="card"
                  onClick={() => handleClickCard(item.id)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={citricolosprueba} alt={item.titulo} />
                  <p className="card-titulo">{item.titulo}</p>
                  <p className="card-autor">
                    {item.autorNombre || "Sin autor"} —{" "}
                    {item.tipoNombre || "Sin tipo"}
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
                          onClick={() => handleClickCard(item.id)}
                          style={{ cursor: "pointer" }}
                        >
                          <img src={citricolosprueba} alt={item.titulo} />
                          <p className="card-titulo">{item.titulo}</p>
                          <p className="card-autor">
                            {item.autorNombre || "Sin autor"} —{" "}
                            {item.fecha_creacion}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              ))
          )}
        </div>

        {/* === Más consultados recientemente === */}
        {topConsultados.length > 0 && (
          <div className="categoria-seccion">
            <h3 className="categoria-titulo">Más consultados recientemente</h3>
            <div className="cards-container">
              {topConsultados.map((item) => (
                <div
                  key={item.id_contenido}
                  className="card"
                  onClick={() => handleClickCard(item.id_contenido)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={citricolosprueba} alt={item.titulo} />
                  <p className="card-titulo">{item.titulo}</p>
                  <p className="card-autor">
                    {item.autorNombre || "Sin autor"} — {item.tipoNombre}
                  </p>
                  <p className="card-descripcion">
                    Consultas: {item.totalConsultas}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Estructura>
  );
}
