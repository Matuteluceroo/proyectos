import React, { useState, useEffect } from "react"
import Modal from "../Modal/Modal"
import Button from "./Button"
import { FiSearch } from "react-icons/fi"
import VirtualizedTable from "../VirtualizedTable/VirtualizedTable"
import { useObtenerListaProductosTarot } from "../../services/connections/kairos"

const ButtonBuscador = ({
  title = "BUSCAR",
  buttonText = "BUSCAR CÓDIGO TAROT",
  buttonId = "btnBuscar",
  buttonClass = "boton-accion",
  maxWidth = "900px",
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [resultados, setResultados] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const obtenerListaProductosTarot = useObtenerListaProductosTarot()

  const columnas = [
    { id: "codTarot", label: "Código Tarot", options: true, width: "120px" },
    {
      id: "descripcionTarot",
      label: "Nombre Tarot",
      options: true,
      width: "390px",
    },
  ]

  useEffect(() => {
    if (isOpen) {
      const obtener = async () => {
        try {
          setIsLoading(true)
          const data = await obtenerListaProductosTarot()
          if (data) setResultados(data)
        } catch (error) {
          alert("Ocurrió un error al buscar los datos.")
        } finally {
          setIsLoading(false)
        }
      }
      obtener()
    }
  }, [isOpen])

  return (
    <>
      <Button
        id={buttonId}
        className={buttonClass}
        title={title}
        text={
          <span>
            <FiSearch style={{ marginRight: "6px" }} />
            {buttonText}
          </span>
        }
        onClick={() => setIsOpen(true)}
      />

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false)
        }}
        title={title}
        maxWidth={maxWidth}
      >
        <div style={{ height: "60vh", position: "relative" }}>
          {isLoading ? (
            <div className="d-flex justify-content-center align-items-center h-100">
              <span className="spinner-border text-primary" role="status" />
            </div>
          ) : (
            <VirtualizedTable
              rows={resultados}
              setRows={setResultados}
              columns={columnas}
            />
          )}
        </div>
      </Modal>
    </>
  )
}

export default ButtonBuscador
