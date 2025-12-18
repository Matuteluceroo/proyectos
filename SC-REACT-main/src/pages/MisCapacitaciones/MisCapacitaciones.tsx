import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import Estructura from "../../components/Estructura/Estructura"
import { useCapacitaciones } from "../../services/connections/capacitaciones"

import "./MisCapacitaciones.css"

export default function MisCapacitaciones() {
  const { getAll } = useCapacitaciones()
  const navigate = useNavigate()

  const [capacitaciones, setCapacitaciones] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarCapacitaciones()
  }, [])

  const cargarCapacitaciones = async () => {
    setLoading(true)
    const data = await getAll()
    if (Array.isArray(data)) setCapacitaciones(data)
    setLoading(false)
  }

  const capacitacionesFiltradas = capacitaciones.filter((c) =>
    `${c.nombre} ${c.descripcion}`.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <Estructura>
      <div className="mis-capacitaciones-container">
        <div className="header-cursos">
          <h1 className="titulo-cursos">Menu de Capacitaciones</h1>

          <div className="buscador-cursos">
            <input
              type="text"
              placeholder="Buscar capacitación..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* LISTADO */}
        {loading ? (
          <p>Cargando capacitaciones...</p>
        ) : capacitacionesFiltradas.length === 0 ? (
          <p>No se encontraron capacitaciones</p>
        ) : (
          <div className="grid-cursos">
            {capacitacionesFiltradas.map((c) => (
              <div
                key={c.id_capacitacion}
                className="card-curso"
                onClick={() => navigate(`/curso/${c.id_capacitacion}`)}
              >
                <div>
                  <h3>{c.nombre}</h3>
                  <p className="descripcion">
                    {c.descripcion || "Sin descripción"}
                  </p>
                </div>

                <div className="card-footer">
                  <span className="fecha">{c.fecha_creacion}</span>
                  <button>Ingresar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Estructura>
  )
}
