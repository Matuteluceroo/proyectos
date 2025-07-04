import React, { useState, useEffect } from "react"
import Modal from "../../../components/Modal/Modal"
import VirtualizedTable from "../../../components/VirtualizedTable/VirtualizedTable"
import AlertOptions from "../../../components/Alert/AlertOptions"
import { useNavigate } from "react-router-dom"
import agregarIco from "../../../assets/add.svg"
import LicitacionElegida from "./LicitacionElegida"
import { useObtenerLicitacionByID } from "../../../services/connections/licitaciones"
import { useObtenerRenglonesNoAsociados } from "../../../services/connections/compras"
import Button from "../../../components/Button/Button"
import { FiSend } from "react-icons/fi"
import { Column } from "../../../types/TableTypes"
import Alert from "../../../components/Alert/Alert"
import AlertErrores from "../../../components/Alert/AlertErrores"
import AlertCuidado from "../../../components/Alert/AlertCuidado"

interface Props {
  isModalAgregarOpen: boolean
  setIsModalAgregarOpen: (value: boolean) => void
  cotizacionToAdd: {
    cliente?: string
    cantidad?: string | number
    descripcion?: string
    laboratorio?: string
  } | null
  costo: string | number
  setCosto: (value: string) => void
  mantenimiento: string
  setMantenimiento: (value: string) => void
  observaciones: string
  setObservaciones: (value: string) => void
  agregarRenglon: () => void
}

const ModalAgregarCotizacion: React.FC<Props> = ({
  isModalAgregarOpen,
  setIsModalAgregarOpen,
  cotizacionToAdd,
  costo,
  setCosto,
  mantenimiento,
  setMantenimiento,
  observaciones,
  setObservaciones,
  agregarRenglon,
}) => {
  return (
    <Modal
      isOpen={isModalAgregarOpen}
      onClose={() => setIsModalAgregarOpen(false)}
      title={"AGREGAR COTIZACIÓN"}
    >
      {cotizacionToAdd !== null && (
        <>
          <div
            style={{
              maxHeight: "60vh",
              paddingRight: "0.5rem",
            }}
          >
            <div className="row">
              <div className="col-3">
                <p>
                  <strong>CLIENTE:</strong>
                </p>
                <p>{cotizacionToAdd.cliente}</p>
              </div>
              <div className="col-3">
                <p>
                  <strong>CANTIDAD:</strong>
                </p>
                <p>{cotizacionToAdd.cantidad}</p>
              </div>
              <div className="col-3">
                <p>
                  <strong>DESCRIPCIÓN:</strong>
                </p>
                <p>{cotizacionToAdd.descripcion}</p>
              </div>
              <div className="col-3">
                <p>
                  <strong>LABORATORIO:</strong>
                </p>
                <p>{cotizacionToAdd.laboratorio}</p>
              </div>
            </div>
          </div>
          <br />
          <div className="row">
            <div className="col-3">
              <label htmlFor="costo">COSTO:</label>
              <input
                type="number"
                id="costo"
                name="costo"
                value={costo}
                onChange={(e) => setCosto(e.target.value)}
              />
            </div>
            <div className="col-3">
              <label htmlFor="mantenimiento">MANTENIMIENTO:</label>
              <input
                type="text"
                id="mantenimiento"
                name="mantenimiento"
                value={mantenimiento}
                onChange={(e) => setMantenimiento(e.target.value)}
              />
            </div>
            <div className="col-3">
              <label htmlFor="observaciones">OBSERVACIONES:</label>
              <input
                type="text"
                id="observaciones"
                name="observaciones"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
          </div>
          <br />
          <div className="col-8">
            <Button
              text="AGREGAR COTIZACIÓN"
              icon={<FiSend style={{ marginRight: "5px" }} />}
              className="btnenviar"
              onClick={agregarRenglon}
              title="Agregar cotización"
            />
          </div>
        </>
      )}
    </Modal>
  )
}

export default ModalAgregarCotizacion

export interface Licitacion {
  id: number
  fecha: string
  cliente: string
  nroLic: string
  estado: string
  licitadores: string
}

interface Renglon {
  nroLic: string
  renglon: number
  descripcion: string
  codigoTarot: string
}

interface AuxComponent {
  Component: React.FC
  btnCerrarFunc: () => void
}

interface LicitacionesEnCursoProps {
  licitacionesEnCurso: Licitacion[]
  setLicitacionesEnCurso: (data: any) => void
  setIsModalLicitacionOpen: (open: boolean) => void
  setDataAuxComponent: (value: AuxComponent) => void
  setDataAuxOpen: (open: boolean) => void
  setLicitacionElegida: (data: any) => void
  colocarFiltrosIniciales?: () => void
}

const LicitacionesEnCurso: React.FC<LicitacionesEnCursoProps> = ({
  licitacionesEnCurso,
  setLicitacionesEnCurso,
  setIsModalLicitacionOpen,
  setDataAuxComponent,
  setDataAuxOpen,
  setLicitacionElegida,
}) => {
  const obtenerLicitacionByID = useObtenerLicitacionByID()

  const listaCols: Column[] = [
    {
      id: "fecha",
      label: "Fecha",
      width: "100px",
      options: true,
      editable: false,
      type: "text",
    },
    {
      id: "cliente",
      label: "Cliente",
      width: "220px",
      options: true,
      editable: false,
      type: "text",
    },
    {
      id: "nroLic",
      label: "N° C/L",
      width: "70px",
      options: true,
      editable: false,
      type: "number",
    },
    {
      id: "estado",
      label: "Estado",
      width: "120px",
      options: true,
      editable: false,
      type: "text",
    },
    {
      id: "licitadores",
      label: "Licitadores",
      width: "200px",
      options: true,
      editable: false,
      type: "text",
    },
  ]

  const selectedLicitacion = async (row: Licitacion) => {
    const dataLic = await obtenerLicitacionByID({
      idLicitacion: row.id.toString(),
    })
    setIsModalLicitacionOpen(false)
    setDataAuxComponent({
      Component: () => <LicitacionElegida dataLicitacionVisible={dataLic} />,
      btnCerrarFunc: () => setLicitacionElegida(null),
    })
    setDataAuxOpen(true)
    setLicitacionElegida(dataLic)
  }

  return (
    <VirtualizedTable
      rows={licitacionesEnCurso}
      setRows={setLicitacionesEnCurso}
      columns={listaCols}
      onClickRow={selectedLicitacion}
      initialFilters={{}}
      /*   onFiltersChange={(f, r) => setFiltrosLicitaciones(f)} */
    />
  )
}

export const ModalLicitacionesEnCurso: React.FC<{
  isModalLicitacionOpen: boolean
  setIsModalLicitacionOpen: (open: boolean) => void
  colocarFiltrosIniciales?: () => void
  licitacionesEnCurso: Licitacion[]
  setLicitacionesEnCurso: (rows: Licitacion[]) => void
  setDataAuxComponent: (value: AuxComponent) => void
  setDataAuxOpen: (open: boolean) => void
  setLicitacionElegida: (data: any) => void
}> = ({
  isModalLicitacionOpen,
  setIsModalLicitacionOpen,
  colocarFiltrosIniciales,
  licitacionesEnCurso,
  setLicitacionesEnCurso,
  setDataAuxComponent,
  setDataAuxOpen,
  setLicitacionElegida,
}) => {
  return (
    <Modal
      isOpen={isModalLicitacionOpen}
      onClose={() => setIsModalLicitacionOpen(false)}
      title={"ELEGIR LICITACIÓN"}
      maxWidth={"800px"}
    >
      <div style={{ height: "500px", overflow: "auto" }}>
        <LicitacionesEnCurso
          colocarFiltrosIniciales={colocarFiltrosIniciales}
          licitacionesEnCurso={licitacionesEnCurso}
          setLicitacionesEnCurso={setLicitacionesEnCurso}
          setDataAuxComponent={setDataAuxComponent}
          setDataAuxOpen={setDataAuxOpen}
          setIsModalLicitacionOpen={setIsModalLicitacionOpen}
          setLicitacionElegida={setLicitacionElegida}
        />
      </div>
    </Modal>
  )
}

const RenglonesNoAsociados: React.FC<{ mostrarAgregar: boolean }> = ({
  mostrarAgregar,
}) => {
  const [renglonesNoAsociados, setRenglonesNoAsociados] = useState<Renglon[]>(
    []
  )
  const [renglonSeleccionado, setRenglonSeleccionado] =
    useState<Renglon | null>(null)
  const obtenerRenglonesNoAsociados = useObtenerRenglonesNoAsociados()
  const [modalConfirmarOpen, setModalConfirmarOpen] = useState(false)
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [alerta, setAlerta] = useState({
    isOpen: false,
    titulo: "",
    message: "",
  })
  const [alertaError, setAlertaError] = useState({
    isOpen: false,
    titulo: "",
    message: "",
  })
  const [alertaCuidado, setAlertaCuidado] = useState({
    isOpen: false,
    titulo: "",
    message: "",
  })
  useEffect(() => {
    const lleanarTabla = async () => {
      try {
        setIsLoading(true)
        const data = await obtenerRenglonesNoAsociados()
        setRenglonesNoAsociados(data)
      } catch (error) {
        setAlertaError({
          isOpen: true,
          titulo: "Error",
          message: "Ocurrió un error al buscar los datos.",
        })
      } finally {
        setIsLoading(false)
      }
    }
    lleanarTabla()
  }, [])

  const listaCols: Column[] = [
    {
      id: "nroLic",
      label: "Nro Lic",
      width: "100px",
      editable: false,
      type: "number",
      options: true,
    },
    {
      id: "renglon",
      label: "R",
      width: "50px",
      editable: false,
      options: true,
      type: "number",
    },
    {
      id: "descripcion",
      label: "Descripción (pliego)",
      width: "230px",
      editable: false,
      options: true,
    },
    {
      id: "codigoTarot",
      label: "Cod Tarot",
      width: "50px",
      editable: false,
      type: "number",
      options: true,
    },
    {
      id: "btnAgregar",
      label: "Agregar",
      width: "80px",
      editable: false,
      ico: agregarIco,
      onclick: () => setModalConfirmarOpen(true),
      visible: mostrarAgregar,
    },
  ]

  const handleRowClick = (row: Renglon) => {
    setRenglonSeleccionado(row)
  }

  const handleSubmit = () => {
    if (!renglonSeleccionado) {
      setAlertaCuidado({
        isOpen: true,
        titulo: "Cuidado",
        message: "Debe seleccionar un renglón primero",
      })
      return
    }
    const primeraPalabra = renglonSeleccionado.descripcion.trim().split(" ")[0]
    sessionStorage.setItem("droga_presentacion_temp", primeraPalabra)
    navigate("/administrador_kairos")
  }

  return (
    <>
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center h-100">
          <span className="spinner-border text-primary" role="status" />
        </div>
      ) : (
        <VirtualizedTable
          rows={renglonesNoAsociados}
          setRows={setRenglonesNoAsociados}
          columns={listaCols}
          onClickRow={handleRowClick}
        />
      )}

      <AlertOptions
        title={"IR AL ADMINISTRADOR DE KAIROS"}
        message={
          "¿Desea abandonar la pagina de cotizaciones? Recuerde guardar los cambios realizados o podria perderlos"
        }
        isOpen={modalConfirmarOpen}
        onCancel={() => setModalConfirmarOpen(false)}
        onConfirm={handleSubmit}
      />
      <Alert
        isOpen={alerta.isOpen}
        titulo={alerta.titulo}
        message={alerta.message}
        setIsOpen={(val) =>
          setAlerta((prev) => ({
            ...prev,
            isOpen: typeof val === "function" ? val(prev.isOpen) : val,
          }))
        }
      />

      <AlertErrores
        isOpen={alertaError.isOpen}
        titulo={alertaError.titulo}
        message={alertaError.message}
        setIsOpen={(val) =>
          setAlertaError((prev) => ({
            ...prev,
            isOpen: typeof val === "function" ? val(prev.isOpen) : val,
          }))
        }
      />

      <AlertCuidado
        isOpen={alertaCuidado.isOpen}
        titulo={alertaCuidado.titulo}
        message={alertaCuidado.message}
        setIsOpen={(val) =>
          setAlertaCuidado((prev) => ({
            ...prev,
            isOpen: typeof val === "function" ? val(prev.isOpen) : val,
          }))
        }
      />
    </>
  )
}

export const ModalNoAsociados: React.FC<{
  isModalNoAsocOpen: boolean
  setIsModalNoAsocOpen: (open: boolean) => void
  visible?: boolean
}> = ({ isModalNoAsocOpen, setIsModalNoAsocOpen, visible = true }) => {
  return (
    <Modal
      isOpen={isModalNoAsocOpen}
      onClose={() => setIsModalNoAsocOpen(false)}
      title={"RENGLONES NO ASOCIADOS"}
      maxWidth={"500px"}
    >
      <div style={{ height: "500px", overflow: "auto" }}>
        <RenglonesNoAsociados mostrarAgregar={visible} />
      </div>
    </Modal>
  )
}
