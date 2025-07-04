import { useState, useEffect } from "react"
import Estructura from "../../../components/Estructura/Estructura"
import Modal from "../../../components/Modal/Modal"
import VirtualizedTable from "../../../components/VirtualizedTable/VirtualizedTable"
import {
  useObtenerLicitacionesZona,
  useObtenerLicitacionByID,
  useModificarLicitacion,
} from "../../../services/connections/licitaciones.js"
import "./MenuLic.css"
import { useSocket } from "../../../services/SocketContext"
import { useNavigate } from "react-router-dom"
import BotonCerrarSesion from "../../../components/Button/BotonCerrarSesion"
import {
  ButtonIrLicitacion,
  ButtonElegirCotizacion,
  ButtonPreganados,
  ButtonVerLicitacion,
} from "./MenuLicComponents"
import { listaCols } from "./funcionesMenuLic"

const MenuLic = () => {
  const [rows, setRows] = useState<any[]>([])
  const [dataLicitacion, setDataLicitacion] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const { currentUser } = useSocket()
  const navigate = useNavigate()
  const obtenerLicitacionesZona = useObtenerLicitacionesZona()
  const obtenerLicitacionByID = useObtenerLicitacionByID()
  const modificarLicitacion = useModificarLicitacion()

  useEffect(() => {
    async function getLicitaciones() {
      const dataLicitaciones = await obtenerLicitacionesZona({
        idZona: currentUser.idZona,
      })
      setRows(dataLicitaciones)
    }
    getLicitaciones()
  }, [])

  useEffect(() => {
    const actualizarLicitaciones = async () => {
      const currentDate = new Date()
      const licitacionesToUpdate = rows.filter((licitacion) => {
        if (licitacion.estado === "OFERTA PRESENTADA") {
          return false
        }
        const fechaHoraLicitacion = new Date(
          `${licitacion.fecha} ${licitacion.hora}`
        )
        return fechaHoraLicitacion <= currentDate
      })

      for (const licitacion of licitacionesToUpdate) {
        try {
          const dataLic = await obtenerLicitacionByID({
            idLicitacion: licitacion.idLicitacion,
          })

          await modificarLicitacion({
            idLicitacion: licitacion.idLicitacion,
            dataLicitacion: {
              estado: "OFERTA PRESENTADA",
              cliente: dataLic.cliente,
              fecha: dataLic.fecha,
              nroLic: dataLic.nroLic,
              tipo: dataLic.tipo,
              hora: dataLic.hora,
              objeto: dataLic.objeto,
              codCliente: dataLic.codCliente,
            },
          })
        } catch (error) {
          console.error("Error al modificar la licitación:", error)
        }
      }
    }

    actualizarLicitaciones()
  }, [rows])

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const ModalContent = () => (
    <div className="modal-licitacion-content">
      <div className="info-grid">
        <div>
          <strong>CLIENTE:</strong> {dataLicitacion["cliente"]}
        </div>
        <div>
          <strong>FECHA:</strong> {dataLicitacion["fecha"]}
        </div>
        <div>
          <strong>NRO LIC:</strong> {dataLicitacion["nroLic"]}
        </div>
      </div>
      <div className="button-grid mt-3">
        <ButtonIrLicitacion
          idLicitacion={dataLicitacion["idLicitacion"]}
          estado={dataLicitacion["estado"]}
        />
        <ButtonElegirCotizacion
          idLicitacion={dataLicitacion["idLicitacion"]}
          estado={dataLicitacion["estado"]}
        />
        <ButtonVerLicitacion
          idLicitacion={dataLicitacion["idLicitacion"]}
          estado={dataLicitacion["estado"]}
        />
        <ButtonPreganados
          idLicitacion={dataLicitacion["idLicitacion"]}
          estado={dataLicitacion["estado"]}
        />
      </div>
    </div>
  )

  const handleClickRow = async (row: any) => {
    const idLicitacion = row["idLicitacion"]

    if (idLicitacion) {
      setDataLicitacion(row)
      handleOpenModal()
    } else {
      console.error("No se encontraron datos para la licitación seleccionada.")
    }
  }
  const irAControlRemitos = () => {
    navigate("/control_remitos")
  }
  return (
    <Estructura>
      <div
        className="d-flex flex-column"
        style={{ height: "100vh", padding: "1rem" }}
      >
        {/* Fila de título y botón */}
        <div className="row align-items-center justify-content-center mb-3">
          <div className="col-4 d-flex justify-content-start" />
          <div className="col-4 text-center">
            <h1 className="headerTitle m-0">MENÚ DE LICITACIONES</h1>
          </div>
          <div className="col-4 d-flex justify-content-end">
            <ButtonIrLicitacion idLicitacion={null} />
          </div>
        </div>

        {/* Tabla centrada y que ocupe el resto */}
        <div
          className="d-flex justify-content-center"
          style={{ flexGrow: 1, minHeight: "0" }}
        >
          <div style={{ width: "100%", maxWidth: "1400px" }}>
            {rows.length > 0 ? (
              <VirtualizedTable
                nombreTabla={"MenuLic"}
                rows={rows}
                setRows={setRows}
                columns={listaCols}
                onClickRow={handleClickRow}
              />
            ) : (
              <div className="alert alert-warning" role="alert">
                No hay licitaciones para mostrar.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="LICITACIÓN"
        minWidth={"450px"}
      >
        <ModalContent />
      </Modal>
    </Estructura>
  )
}

export default MenuLic
