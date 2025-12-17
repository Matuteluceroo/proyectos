import { useState, useEffect, useMemo } from "react"
import Estructura from "../../components/Estructura/Estructura"
import "./Buscador.css"
import { FaSearch, FaMicrophone } from "react-icons/fa"
import {
  useBuscarContenidos,
  useObtenerUltimosContenidos,
} from "../../services/connections/contenido"
import { useObtenerTiposConocimiento } from "../../services/connections/tiposConocimiento"
import { useNavigate } from "react-router-dom"
import {
  useObtenerTopConsultados,
  useRegistrarHistorial,
} from "../../services/connections/historial"
import { useSocket } from "../../services/SocketContext"
import { useVoiceSearch } from "../../hooks/useVoiceSearch"
import citricolosprueba from "../../assets/citricolosprueba.jpg"

/* ================= HELPERS ================= */

const toId = (item) =>
  item?.id ?? item?.id_contenido ?? item?.Id ?? item?.ID ?? null

const toTipoNombre = (item) => item?.tipoNombre ?? item?.tipo ?? ""

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "")

const getVisorPath = (item) => {
  const id = toId(item)
  const origen = (item.origen || "").toUpperCase()
  const file = (item.url_archivo || "").replace(/\\/g, "/").split("/").pop()
  const ext = file.split(".").pop()?.toLowerCase()

  if (origen === "HTML") return `/visor-html/${id}`
  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
    return `/visor-imagen/${file}`
  if (["mp4", "webm", "ogg"].includes(ext)) return `/visor-video/${file}`
  if (ext === "pdf") return `/visor-pdf/${file}`

  return `/visor-html/${id}`
}

/* ================= COMPONENTE ================= */

export default function Buscador() {
  const { currentUser } = useSocket() ?? {}
  const navigate = useNavigate()

  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [resultados, setResultados] = useState([])
  const [tipos, setTipos] = useState([])
  const [tipoSeleccionado, setTipoSeleccionado] = useState("Todos")
  const [ultimos, setUltimos] = useState([])
  const [topConsultados, setTopConsultados] = useState([])

  const buscarContenidos = useBuscarContenidos()
  const obtenerUltimos = useObtenerUltimosContenidos()
  const obtenerTipos = useObtenerTiposConocimiento()
  const obtenerTopConsultados = useObtenerTopConsultados()
  const registrarHistorial = useRegistrarHistorial()

  /* ======= VOZ ======= */

  // const handleVoiceResult = (text) => {
  //   const normalized = text
  //     .toLowerCase()
  //     .replace(/^buscar\s*/, "")
  //     .trim()

  //   setQuery(normalized)

  //   setTimeout(() => {
  //     handleSearch(normalized)
  //   }, 200)
  // }
  const handleVoiceResult = (text) => {
    if (!text) return

    // Normalizar texto
    const comando = text
      .toLowerCase()
      .replace(/[.,]/g, "") // 🔥 quita puntos y comas
      .trim()

    console.log("🎙️ Comando voz:", comando)

    // ===============================
    // 🔎 BUSCAR
    // ===============================
    if (comando.startsWith("buscar ")) {
      const termino = comando.replace("buscar", "").trim()
      if (!termino) return

      setQuery(termino)
      setTimeout(() => handleSearch(), 150)
      return
    }

    // ===============================
    // 🧹 LIMPIAR BÚSQUEDA
    // ===============================
    if (
      comando === "limpiar" ||
      comando === "limpiar búsqueda" ||
      comando === "limpiar busqueda"
    ) {
      setQuery("")
      setResultados([])
      setError("")
      setIsLoading(false)
      return
    }

    // ===============================
    // 👉 SELECCIONAR CONTENIDO N
    // ===============================
    if (comando.startsWith("seleccionar contenido")) {
      const numero = comando.replace("seleccionar contenido", "").trim()
      const index = parseInt(numero, 10) - 1

      if (isNaN(index)) return

      // Prioridad: resultados > sugeridos
      const lista =
        resultados.length > 0
          ? resultados
          : recomendadosPorTag.length > 0
          ? recomendadosPorTag
          : []

      if (!lista[index]) return

      handleClickCard(lista[index])
      return
    }

    // ===============================
    // ❓ COMANDO NO RECONOCIDO
    // ===============================
    console.warn("Comando de voz no reconocido:", comando)
  }

  const { startListening, isVoiceListening } = useVoiceSearch({
    onResult: handleVoiceResult,
  })

  /* ======= CARGA INICIAL ======= */

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const [t, u, top] = await Promise.all([
          obtenerTipos(currentUser?.id),
          obtenerUltimos(currentUser?.id),
          obtenerTopConsultados(),
        ])

        if (!mounted) return

        setTipos(Array.isArray(t) ? t : [])
        setUltimos(Array.isArray(u) ? u : [])
        setTopConsultados(Array.isArray(top) ? top : [])
      } catch (e) {
        console.error(e)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  /* ======= BUSCAR ======= */

  const handleSearch = async (overrideQuery) => {
    const q = (overrideQuery ?? query).trim()
    if (!q) return

    setIsLoading(true)
    setError("")

    try {
      const data = await buscarContenidos(q, currentUser?.id)
      const lista = Array.isArray(data) ? data : []

      const filtrados =
        tipoSeleccionado === "Todos"
          ? lista
          : lista.filter((c) => toTipoNombre(c) === tipoSeleccionado)

      setResultados(filtrados)
    } catch (e) {
      setError("Error al buscar contenidos")
    } finally {
      setIsLoading(false)
    }
  }

  /* ======= CLICK CARD ======= */

  const handleClickCard = async (item) => {
    const id = toId(item)
    if (!id) return

    try {
      if (currentUser?.id) {
        await registrarHistorial({
          id_usuario: currentUser.id,
          id_contenido: id,
          tipo: item.origen,
        })
      }
    } catch (e) {
      console.error(e)
    } finally {
      navigate(getVisorPath(item))
    }
  }

  /* ======= MEMOS ======= */

  const ultimosPorTipo = useMemo(
    () => (Array.isArray(ultimos) ? ultimos : []),
    [ultimos]
  )

  const recomendadosPorTag = useMemo(() => {
    if (!Array.isArray(ultimos)) return []
    return ultimos
      .flatMap((grupo) => grupo.items || [])
      .filter((item) => item.origen === "TAG")
  }, [ultimos])

  const sugeridos = resultados.filter((r) => r.origen === "TAG")

  /* ======= SHORTCUT ======= */

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "d") {
        e.preventDefault()
        startListening()
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  /* ======= LIMPIAR AL BORRAR ======= */

  useEffect(() => {
    if (query.trim() === "") {
      setResultados([])
      setError("")
      setIsLoading(false)
    }
  }, [query])

  /* ======= RENDER CARD ======= */
  // === Icono según origen del contenido ===
  const getIconoOrigen = (origen) => {
    switch ((origen || "").toUpperCase()) {
      case "HTML":
        return "📝"
      case "PDF":
        return "📕"
      case "IMAGEN":
        return "🖼️"
      case "VIDEO":
        return "🎬"
      case "TAG":
        return "🔖"
      default:
        return "📄"
    }
  }

  const renderCard = (item, index = null, showDescripcion = false) => {
    const id = toId(item)
    const icono = getIconoOrigen(item.origen)

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
        aria-label={`Abrir contenido ${index !== null ? index + 1 : ""}`}
      >
        {/* 🔢 Número visible */}
        {index !== null && <div className="card-index">{index + 1}</div>}

        <img src={citricolosprueba} alt={item?.titulo ?? ""} />

        <p className="card-titulo">
          {icono} {item?.titulo}
        </p>

        <p className="card-autor">
          {(item?.autorNombre || "Sin autor") +
            " — " +
            (toTipoNombre(item) || "")}
        </p>

        {showDescripcion && item?.descripcion && (
          <p className="card-descripcion">{item.descripcion}</p>
        )}
      </div>
    )
  }

  /* ================= JSX ================= */

  return (
    <Estructura>
      <div className="buscador-wrapper">
        {/* ================= BUSCADOR UNIFICADO (TEXTO + VOZ) ================= */}
        <div
          className={`buscador-voz ${isVoiceListening ? "escuchando" : ""}`}
          onClick={() => document.getElementById("input-buscador")?.focus()}
        >
          <FaSearch className="icon-search" />

          <input
            id="input-buscador"
            className="buscador-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar conocimiento… (decí “buscar citrus”)"
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            aria-label="Buscar conocimiento"
          />

          <div className="voz-info">
            <FaMicrophone
              className="icon-mic"
              onClick={(e) => {
                e.stopPropagation()
                startListening()
              }}
              title="Buscar por voz (Ctrl + D)"
            />

            {!isVoiceListening && <span className="hint">Ctrl + D</span>}
            {isVoiceListening && <span>Escuchando…</span>}
          </div>
        </div>

        {isLoading && <div className="estado">Buscando...</div>}
        {error && <div className="estado error">{error}</div>}

        <div className="resultados">
          {resultados.length > 0 ? (
            <>
              <h3>🔎 Coincidencias encontradas</h3>
              <div className="cards-container">
                {resultados
                  .filter((r) => r.origen !== "TAG")
                  .map((item, i) => renderCard(item, i, true))}
              </div>

              {sugeridos.length > 0 && (
                <>
                  <h3>🎯 Sugeridos según tus intereses</h3>
                  <div className="cards-container">
                    {sugeridos.map((item, i) => renderCard(item, i, true))}
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {recomendadosPorTag.length > 0 && (
                <>
                  <h3>🎯 Recomendados para vos (tags)</h3>
                  <div className="cards-container">
                    {recomendadosPorTag.map((item, i) => renderCard(item, i))}
                  </div>
                </>
              )}

              {ultimosPorTipo
                .filter(
                  (grupo) =>
                    tipoSeleccionado === "Todos" ||
                    (grupo?.tipo ?? "").toLowerCase() ===
                      tipoSeleccionado.toLowerCase()
                )
                .map((grupo) => (
                  <div
                    key={grupo?.tipo ?? "otros"}
                    className="categoria-seccion"
                  >
                    <h3 className="categoria-titulo">Últimos {grupo?.tipo}</h3>

                    <div className="cards-container">
                      {Array.isArray(grupo?.items) &&
                        grupo.items.map((item, i) => renderCard(item, i))}
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>

        {topConsultados.length > 0 && (
          <>
            <h3>📈 Más consultados</h3>
            <div className="cards-container">
              {topConsultados.map((i) => renderCard(i))}
            </div>
          </>
        )}
      </div>
    </Estructura>
  )
}
