import { useEffect, useState } from "react"
import Modal from "../../components/Modal/Modal"
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable"
import { useObtenerArticulosByRemito } from "../../services/connections/logistica"

const ModalsArticulosRemitos = ({
  isOpen,
  onClose,
  idRenglon,
}: {
  isOpen: boolean
  onClose: () => void
  idRenglon: string | null
}) => {
  const [tableRows, setTableRows] = useState<any[]>([])
  const obtenerArticulosByRemito = useObtenerArticulosByRemito()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const columnas = [
    {
      id: "codArticulo",
      label: "Codigo",
      editable: false,
      options: true,
      width: "80px",
    },
    {
      id: "descArticulo",
      label: "Descripcion",
      editable: false,
      options: false,
      width: "150px",
    },
    {
      id: "cantidad",
      label: "Cantidad",
      editable: false,
      options: false,
      width: "100px",
    },
  ]

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen || !idRenglon) return

      try {
        setIsLoading(true)
        const data = await obtenerArticulosByRemito({
          nro_remito: idRenglon,
        })
        if (Array.isArray(data)) {
          setTableRows(data)
        } else {
          setTableRows([])
        }
      } catch (error) {
        console.error("Error al obtener artículos del remito:", error)
        setTableRows([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [isOpen, idRenglon])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="DETALLE REMITOS">
      <div style={{ height: "60vh", overflow: "auto" }}>
        {isLoading ? (
          <div className="d-flex justify-content-center align-items-center h-100">
            <span className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <VirtualizedTable
            rows={tableRows}
            setRows={setTableRows}
            columns={columnas}
          />
        )}
      </div>
    </Modal>
  )
}

export default ModalsArticulosRemitos
