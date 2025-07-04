import { useEffect, useState } from "react"
import Estructura from "../../components/Estructura/Estructura"
import Button from "../../components/Button/Button"
import { useNavigate } from "react-router-dom"
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable"
import { useObtenerLicitaciones } from "../../services/connections/licitaciones"
import { Column } from "../../types/TableTypes"
import salida from "../../assets/volver.svg"

interface Licitacion {
  id: number
  provincia: string
  cliente: string
  nroLic: number
  estado: string
  usuarios: Usuario[]
  licitadores?: string
  compradores?: string
}

interface Usuario {
  nombre: string
  rol: string
}

const InformesProductos = () => {
  const navigate = useNavigate()
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([])
  const obtenerLicitaciones = useObtenerLicitaciones()

  const listaCols: Column[] = [
    { id: "provinciaa", label: "PRODUCTO", width: "100px", options: true },
    { id: "provinciaa", label: "DESCRIPCION", width: "100px", options: true },
  ]

  const irALicitacion = (row: Licitacion) => {
    navigate(`/datos-licitacion?id=${row.id}`)
  }

  return (
    <Estructura>
      <div
        style={{
          height: "80vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "60%",
            maxWidth: "1200px",
            height: "100%",
          }}
        >
          <VirtualizedTable
            setRows={setLicitaciones}
            rows={licitaciones}
            columns={listaCols}
            onClickRow={irALicitacion}
          />
        </div>
      </div>
    </Estructura>
  )
}

export default InformesProductos
