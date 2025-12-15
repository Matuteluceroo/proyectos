import { useEffect, useMemo, useRef, useState } from "react";
import Estructura from "../../components/Estructura/Estructura";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../services/SocketContext";
import { useBuscarContenidos } from "../../services/connections/contenido";
import { useRegistrarHistorial } from "../../services/connections/historial";

// === Helpers (mismos criterios que tu Buscador actual) ===
const toId = (item) => item?.id ?? item?.id_contenido ?? item?.Id ?? item?.ID ?? null;
const toTipoNombre = (item) => item?.tipoNombre ?? item?.tipo ?? "";

const getVisorPath = (item) => {
  const id = item.id_contenido || item.id;
  const almacenamiento = (item.almacenamiento || item.tipoNombre || "").toUpperCase();
  const file = (item.url_archivo || "").trim().replace(/\\/g, "/").split("/").pop();
  const ext = file?.split(".").pop()?.toLowerCase();

  if (almacenamiento === "HTML" || item.origen === "HTML") return `/visor-html/${id}`;
  if (almacenamiento === "IMAGEN" || ["jpg","jpeg","png","gif","webp","svg"].includes(ext)) return `/visor-imagen/${file}`;
  if (almacenamiento === "VIDEO" || ["mp4","webm","ogg","mov","mkv","avi"].includes(ext)) return `/visor-video/${file}`;
  if (almacenamiento === "PDF" || ext === "pdf") return `/visor-pdf/${file}`;
  return `/visor-html/${id}`;
};

const normalizeText = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // saca tildes

const speak = (text) => {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "es-ES";
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
};

export default function BuscadorVoz() {
  const { currentUser } = useSocket() ?? {};
  const buscarContenidos = useBuscarContenidos();
  const registrarHistorial = useRegistrarHistorial();
  const navigate = useNavigate();

  const [isListening, setIsListening] = useState(false);
  const [modo, setModo] = useState("command"); // "command" | "awaiting_query"
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [lastHeard, setLastHeard] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef(null);
  const shouldAutoRestartRef = useRef(false);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const resultadosNoTag = useMemo(
    () => resultados.filter((r) => r?.origen !== "TAG"),
    [resultados]
  );

  const doSearch = async (q) => {
    const qq = (q ?? "").trim();
    if (!qq) return;

    setIsLoading(true);
    try {
      const data = await buscarContenidos(qq, currentUser?.id);
      const lista = Array.isArray(data) ? data : [];
      setResultados(lista);
      setSelectedIndex(lista.length ? 0 : -1);

      if (lista.length) {
        const titulo0 = lista[0]?.titulo ? `Primero: ${lista[0].titulo}.` : "";
        speak(`Encontré ${lista.length} resultados. Decí "elegir 1", "elegir 2", etc. ${titulo0}`);
      } else {
        speak(`No encontré resultados para ${qq}. Probá con otra palabra.`);
      }
    } catch (e) {
      console.error(e);
      speak("No pude conectar con el servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  const openByIndex = async (n1Based) => {
    const idx = Number(n1Based) - 1;
    if (!Number.isFinite(idx)) return;

    const item = resultadosNoTag[idx] ?? resultados[idx];
    if (!item) {
      speak(`No existe el resultado ${n1Based}.`);
      return;
    }

    setSelectedIndex(idx);

    const idContenido = toId(item);
    try {
      if (currentUser?.id && idContenido) {
        await registrarHistorial({
          id_usuario: currentUser.id,
          id_contenido: idContenido,
          tipo: item.origen === "HTML" ? "HTML" : "ARCHIVO",
        });
      }
    } catch (e) {
      console.error("Error registrando historial:", e);
      // igual navegamos
    } finally {
      speak(`Abriendo ${item?.titulo ?? "contenido"}.`);
      navigate(getVisorPath(item));
    }
  };

  const moveSelection = (delta) => {
    const max = (resultadosNoTag.length ? resultadosNoTag : resultados).length - 1;
    if (max < 0) {
      speak("No hay resultados para seleccionar.");
      return;
    }
    setSelectedIndex((prev) => {
      const next = Math.max(0, Math.min(max, (prev < 0 ? 0 : prev) + delta));
      const item = (resultadosNoTag.length ? resultadosNoTag : resultados)[next];
      if (item?.titulo) speak(`Seleccionado ${next + 1}: ${item.titulo}`);
      return next;
    });
  };

  const handleTranscript = async (raw) => {
    const text = normalizeText(raw);
    setLastHeard(raw);

    // Si estamos esperando que diga la query después de "buscar"
    if (modo === "awaiting_query") {
      setModo("command");
      setQuery(raw);
      await doSearch(raw);
      return;
    }

    // --- Comandos ---
    // 1) buscar [texto]
    const mBuscar = text.match(/^buscar(?:\s+(.*))?$/);
    if (mBuscar) {
      const q = (mBuscar[1] || "").trim();
      if (q) {
        setQuery(q);
        await doSearch(q);
      } else {
        setModo("awaiting_query");
        speak("Decime qué querés buscar.");
      }
      return;
    }

    // 2) elegir N / abrir N
    const mElegir = text.match(/^(elegir|abrir)\s+(\d+)$/);
    if (mElegir) {
      await openByIndex(mElegir[2]);
      return;
    }

    // 3) siguiente / anterior
    if (text === "siguiente") return moveSelection(+1);
    if (text === "anterior") return moveSelection(-1);

    // 4) leer / repetir (lee título del seleccionado)
    if (text === "leer" || text === "repetir") {
      const item = (resultadosNoTag.length ? resultadosNoTag : resultados)[selectedIndex];
      if (!item) return speak("No hay un resultado seleccionado.");
      return speak(`Resultado ${selectedIndex + 1}: ${item.titulo ?? "sin título"}. Tipo: ${toTipoNombre(item) || "sin tipo"}.`);
    }

    // 5) ayuda
    if (text === "ayuda" || text === "comandos") {
      return speak('Comandos: "buscar herramientas", "elegir 2", "siguiente", "anterior", "leer", "detener".');
    }

    // 6) detener
    if (text === "detener" || text === "parar") {
      stopListening();
      return;
    }

    // Fallback
    speak('No entendí. Decí "ayuda" para ver comandos.');
  };

  const startListening = () => {
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }

    // Creamos reconocimiento una sola vez
    if (!recognitionRef.current) {
      const rec = new SpeechRecognition();
      rec.lang = "es-ES";
      rec.continuous = true;     // clave: no se corta por cada frase
      rec.interimResults = false;

      rec.onstart = () => setIsListening(true);

      rec.onend = () => {
        setIsListening(false);
        // auto-restart para que sea realmente “manos libres”
        if (shouldAutoRestartRef.current) {
          try { rec.start(); } catch {}
        }
      };

      rec.onerror = (e) => {
        console.warn("Speech error:", e);
        // en algunos casos conviene reintentar
      };

      rec.onresult = (event) => {
        const last = event.results?.[event.results.length - 1];
        const transcript = last?.[0]?.transcript ?? "";
        if (transcript) handleTranscript(transcript);
      };

      recognitionRef.current = rec;
    }

    shouldAutoRestartRef.current = true;
    recognitionRef.current.start();
    speak('Modo voz activado. Decí "buscar" seguido de una palabra.');
  };

  const stopListening = () => {
    shouldAutoRestartRef.current = false;
    try {
      recognitionRef.current?.stop();
    } catch {}
    setIsListening(false);
    setModo("command");
    speak("Modo voz desactivado.");
  };

  // Cleanup
  useEffect(() => {
    return () => {
      shouldAutoRestartRef.current = false;
      try { recognitionRef.current?.stop(); } catch {}
    };
  }, []);

  return (
    <Estructura>
      <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <h2>🎙️ Visor por voz</h2>

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <button onClick={isListening ? stopListening : startListening}>
            {isListening ? (
              <>
                <FaStop /> Detener
              </>
            ) : (
              <>
                <FaMicrophone /> Iniciar voz
              </>
            )}
          </button>

          <div>
            <div><b>Estado:</b> {isListening ? "Escuchando" : "Detenido"} — <b>Modo:</b> {modo}</div>
            <div><b>Último:</b> {lastHeard || "-"}</div>
            <div><b>Query:</b> {query || "-"}</div>
            {isLoading && <div>Buscando...</div>}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <h3>Resultados</h3>
            {resultados.length === 0 ? (
              <div style={{ opacity: 0.8 }}>
                Decí: <b>“buscar herramientas”</b> y después <b>“elegir 2”</b>.
              </div>
            ) : (
              <ol>
                {(resultadosNoTag.length ? resultadosNoTag : resultados).slice(0, 10).map((r, i) => (
                  <li
                    key={toId(r) ?? r?.titulo ?? i}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 8,
                      marginBottom: 6,
                      outline: i === selectedIndex ? "2px solid #497b1a" : "1px solid #ddd",
                    }}
                  >
                    <b>{i + 1}.</b> {r?.titulo} <span style={{ opacity: 0.75 }}>({toTipoNombre(r) || "sin tipo"})</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div>
            <h3>Comandos</h3>
            <ul>
              <li><b>buscar</b> herramientas</li>
              <li><b>buscar</b> (y luego decís la palabra)</li>
              <li><b>elegir</b> 2 / <b>abrir</b> 2</li>
              <li><b>siguiente</b> / <b>anterior</b></li>
              <li><b>leer</b> / <b>repetir</b></li>
              <li><b>detener</b></li>
            </ul>
            <div style={{ opacity: 0.75 }}>
              Tip: si querés que sea todavía más “sin manos”, podemos agregar que diga “<b>abrir seleccionado</b>”
              para abrir lo que está marcado sin número.
            </div>
          </div>
        </div>
      </div>
    </Estructura>
  );
}
