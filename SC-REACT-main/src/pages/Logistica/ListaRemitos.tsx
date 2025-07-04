import React, { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable"
import Estructura from "../../components/Estructura/Estructura"
import verIco from "../../assets/eyes.svg"
import cameraIco from "../../assets/camara.svg"
import Modal from "../../components/Modal/Modal"
import CameraCapture from "../../components/CameraCapture/CameraCapture"
import {
  useObtenerRemitosByParte,
  useEnviarImagenAlBackend,
  useObtenerImagenRemito,
  useEliminarParte,
  useObtenerDataHoja,
  useAgregarNroSeguimiento,
  useAgregarObservaciones,
} from "../../services/connections/logistica"
import InfoItem from "../../components/InfoItem/InfoItem"
import "./Logistica.css"
import Alert from "../../components/Alert/Alert"
import AlertOptions from "../../components/Alert/AlertOptions"
import AlertaCuidado from "../../components/Alert/AlertCuidado"
import AlertErrores from "../../components/Alert/AlertErrores"
import Button from "../../components/Button/Button"
import { useSocket } from "../../services/SocketContext"
import { funciongenerarPDFParteEntrega } from "./ParteEntrega"
import { Column } from "../../types/TableTypes"
import ModalsArticulosRemitos from "./ModalsArticulosRemitos"
import BotonVolver from "../../components/Button/BotonVolver"
import { FiTrash2, FiPrinter } from "react-icons/fi"

interface Remito {
  fechaEnvio: string
  nroComprobante: string
  codCliente: string
  razonSocial: string
  observaciones: string
  nro_seguimiento: string
  [key: string]: any
}

interface DataHoja {
  NRO_HOJA_RUTA: string
  FECHA_PARTE: string
  FECHA_ENTREGA: string
  id_conductor: string
  NOMBRE_TRANSP: string
  ESTADO_ENTREGA: string
  DEPOSITO: string
  [key: string]: any
}

const ListaRemitos: React.FC = () => {
  const isMobile = window.innerWidth <= 768
  const { nro_parte } = useParams<{ nro_parte: string }>()
  const obtenerRemitosByParte = useObtenerRemitosByParte()
  const agregarObservaciones = useAgregarObservaciones()
  const agregarNroSeguimiento = useAgregarNroSeguimiento()
  const enviarImagenAlBackend = useEnviarImagenAlBackend()
  const obtenerImagenRemito = useObtenerImagenRemito()
  const eliminarParte = useEliminarParte()
  const obtenerDataHoja = useObtenerDataHoja()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useSocket()
  const [mostrarModal, setMostrarModal] = useState(false)
  const [remitos, setRemitos] = useState<Remito[]>([])
  const [remitoSeleccionado, setRemitoSeleccionado] = useState<Remito | null>(
    null
  )
  const [numeroSeguimiento, setNumeroSeguimiento] = useState<string>("")
  const [observaciones, setObservaciones] = useState<string>("")
  // const [imagenRemito, setImagenRemito] = useState<string | null>(null)
  const [imagenesRemito, setImagenesRemito] = useState<string[]>([])

  const [dataHoja, setDataHoja] = useState<DataHoja[]>([])
  const [fotoCapturada, setFotoCapturada] = useState<string | null>(null)
  const [alerta, setAlerta] = useState(false)
  const [alertaCuidado, setAlertaCuidado] = useState(false)
  const [alertaError, setAlertaError] = useState(false)
  const [msgAlerta, setMsgAlerta] = useState("")
  const [tituloAlerta, setTituloAlerta] = useState("")
  const [alertaOptionsOpen, setAlertaOptionsOpen] = useState(false)
  const [msgAlertaOptions, setMsgAlertaOptions] = useState("")
  const [tituloAlertaOptions, setTituloAlertaOptions] = useState("")
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(
    null
  )
  const [modalImagenAbierto, setModalImagenAbierto] = useState(false)
  const [isModalArticulosOpen, setIsModalArticulosOpen] = useState(false)
  const [idRenglonSeleccionado, setIdRenglonSeleccionado] = useState<
    string | null
  >(null)

  const handleClickAgregar = (row: Remito) => {
    setRemitoSeleccionado(row)
    setMostrarModal(true)
  }

  const columnsLista: Column[] = [
    {
      id: "fechaEnvio",
      label: "Fecha envío:",
      width: "130px",
      options: true,
      type: "text",
    },
    {
      id: "nroComprobante",
      label: "Nro. comprobante:",
      width: "130px",
      options: true,
      type: "text",
    },
    {
      id: "codCliente",
      label: "Cód. cliente:",
      width: "100px",
      options: true,
      type: "text",
    },
    {
      id: "razonSocial",
      label: "Razón social:",
      width: "300px",
      options: true,
      type: "text",
    },
    {
      id: "NRO_SEGUIMIENTO",
      label: "Nro de Seguimiento:",
      width: "150px",
      options: true,
      type: "text",
    },
    {
      id: "OBSERVACIONES",
      label: "Observaciones:",
      width: "300px",
      options: true,
      type: "text",
    },
    {
      id: "btnAgregar",
      label: "SACAR FOTO",
      width: "100px",
      editable: false,
      ico: cameraIco,
      onclick: (row: Remito, rowIndex: number) => handleClickAgregar(row),
    },
    {
      id: "btnDetalles",
      label: "DETALLES",
      width: "100px",
      editable: false,
      ico: verIco,
      onclick: (row: Remito, rowIndex: number) => handleClickDetalles(row),
    },
  ]

  const fetchRemitos = async () => {
    try {
      if (!nro_parte || isNaN(Number(nro_parte))) return

      const nroHojaRuta = Number(nro_parte)
      const dataParte = await obtenerDataHoja({ nroHojaRuta })
      const remitosParte = await obtenerRemitosByParte({ nroHojaRuta })

      setDataHoja(dataParte)
      setRemitos(remitosParte)
    } catch (error) {
      console.error("Error al obtener remitos:", error)
    }
  }
  useEffect(() => {
    if (!nro_parte) return

    fetchRemitos()
  }, [])

  useEffect(() => {
    if (!mostrarModal) {
      setImagenesRemito([])
      setRemitoSeleccionado(null)
      return
    }

    if (!remitoSeleccionado) return

    setNumeroSeguimiento(remitoSeleccionado.NRO_SEGUIMIENTO ?? "")
    setObservaciones(remitoSeleccionado.OBSERVACIONES ?? "")

    const verImagen = async () => {
      const imagenRemitoActual = await obtenerImagenRemito({
        nro_remito: String(remitoSeleccionado.nroComprobante),
      })

      if (imagenRemitoActual?.imagenes?.length > 0) {
        const imagenesBase64 = imagenRemitoActual.imagenes.map(
          (img: any) => img.imagen
        )
        setImagenesRemito(imagenesBase64)
      } else {
        setImagenesRemito([]) // importante: dejar vacío, no null
      }
    }

    verImagen()
  }, [mostrarModal])

  const nuevaFotoCapturada = async (imagen: string | null) => {
    if (!imagen || !remitoSeleccionado?.nroComprobante) return

    try {
      await enviarImagenAlBackend({
        base64Image: imagen,
        nro_remito: remitoSeleccionado.nroComprobante,
      })
      setAlerta(true)
      setTituloAlerta("EXITO")
      setMsgAlerta("Imagen subida correctamente.")
      setMostrarModal(false)
      setFotoCapturada(null)
      fetchRemitos()
    } catch (error) {
      setTituloAlerta("Error")
      setMsgAlerta("Hubo un error al subir la imagen")
      setAlertaError(true)
    }
  }

  const handleConfirm = async () => {
    setAlertaOptionsOpen(false)

    if (!nro_parte || isNaN(Number(nro_parte))) return

    await eliminarParte({ nroHojaRuta: Number(nro_parte) })

    navigate("/logistica/lista-partes")
  }

  const handleCancel = () => {
    setAlertaOptionsOpen(false)
  }

  const imprimirParte = () => {
    funciongenerarPDFParteEntrega({
      parteData: dataHoja,
      remitos,
      camposFormulario: [], // según lo que uses
      nroHoja: dataHoja?.[0]?.NRO_HOJA_RUTA,
    })
  }
  const handleSubirSeguimiento = async () => {
    if (!remitoSeleccionado?.nroComprobante || !numeroSeguimiento.trim()) {
      setAlertaCuidado(true)
      setTituloAlerta("CUIDADO")
      setMsgAlerta("Debe ingresar un número de seguimiento válido.")
      return
    }

    try {
      await agregarNroSeguimiento({
        nro_remito: remitoSeleccionado.nroComprobante,
        nro_seguimiento: numeroSeguimiento.trim(),
      })
      setTituloAlerta("¡Éxito!")
      setMsgAlerta("Número de seguimiento guardado correctamente.")
      setAlerta(true)
      fetchRemitos()
    } catch (error) {
      setTituloAlerta("Error")
      setMsgAlerta("Hubo un error al guardar el número de seguimiento.")
      setAlertaError(true)
    }
  }

  const handleSubirObservaciones = async () => {
    if (!remitoSeleccionado?.nroComprobante || !observaciones.trim()) {
      setAlertaCuidado(true)
      setTituloAlerta("CUIDADO")
      setMsgAlerta("Debe ingresar una observación.")
      return
    }

    try {
      await agregarObservaciones({
        nro_remito: remitoSeleccionado.nroComprobante,
        observaciones: observaciones.trim(),
      })
      setTituloAlerta("¡Éxito!")
      setMsgAlerta("Observaciones guardadas correctamente.")
      setAlerta(true)
      fetchRemitos()
    } catch (error) {
      setTituloAlerta("Error")
      setMsgAlerta("Hubo un error al guardar las observaciones.")
      setAlertaError(true)
    }
  }

  const handleSubirFoto = async () => {
    if (!remitoSeleccionado?.nroComprobante || !fotoCapturada) {
      setAlertaCuidado(true)
      setTituloAlerta("CUIDADO")
      setMsgAlerta("Debe capturar una imagen antes de subirla.")
      return
    }

    try {
      await enviarImagenAlBackend({
        base64Image: fotoCapturada,
        nro_remito: remitoSeleccionado.nroComprobante,
      })

      setFotoCapturada(null)
      setTituloAlerta("¡Éxito!")
      setMsgAlerta("Imagen subida correctamente")
      setAlerta(true)

      setMostrarModal(false)
      fetchRemitos()
    } catch (error) {
      console.error("Error al subir imagen:", error)
      setTituloAlerta("Error")
      setMsgAlerta("Hubo un error al subir la imagen.")
    }
  }

  const handleClickDetalles = (row: Remito) => {
    setIdRenglonSeleccionado(String(row.nroComprobante))
    setIsModalArticulosOpen(true)
  }

  return (
    <Estructura rutaVolver="/logistica/lista-partes">
      <div style={{ height: isMobile ? "75vh" : "100vh", overflow: "hidden" }}>
        <div
          className="position-relative d-flex align-items-center justify-content-center mb-3"
          style={{ height: "50px" }}
        >
          {/* Título centrado */}
          <h1 className="position-absolute top-50 start-50 translate-middle text-center m-0 headerTitle">
            {`LISTA DE REMITOS DEL PARTE NRO: ${
              dataHoja?.[0]?.NRO_HOJA_RUTA ?? "-"
            }`}
          </h1>

          {/* Botones derecha */}
          {currentUser?.rol === "ADMLOGISTICA" && (
            <div className="position-absolute top-50 end-0 translate-middle-y d-flex gap-2 pe-3">
              <Button
                className="btnEliminar"
                text={
                  <>
                    <FiTrash2 style={{ marginRight: "6px" }} />
                    Eliminar Parte
                  </>
                }
                onClick={() => setAlertaOptionsOpen(true)}
              />
              <Button
                className="btnFuncTabla"
                text={
                  <>
                    <FiPrinter style={{ marginRight: "6px" }} />
                    Imprimir
                  </>
                }
                onClick={imprimirParte}
              />
            </div>
          )}
        </div>

        <div style={{ height: "10vh", overflow: "hidden" }}>
          <div className="data-cliente-row">
            <InfoItem
              fieldName="NRO HOJA DE RUTA"
              value={dataHoja?.[0]?.NRO_HOJA_RUTA}
            />
            <InfoItem fieldName="F/PARTE" value={dataHoja?.[0]?.FECHA_PARTE} />
            <InfoItem
              fieldName="F/ENTREGA"
              value={dataHoja?.[0]?.FECHA_ENTREGA}
            />
            <InfoItem
              fieldName="TRANSPORTE"
              value={dataHoja?.[0]?.id_conductor}
            />
            <InfoItem
              fieldName="NOMBRE TRANSPORTE"
              value={dataHoja?.[0]?.NOMBRE_TRANSP}
            />
            <InfoItem
              fieldName="ESTADO DE LA ENTREGA"
              value={dataHoja?.[0]?.ESTADO_ENTREGA}
            />
            <InfoItem fieldName="DEPOSITO" value={dataHoja?.[0]?.DEPOSITO} />
          </div>
        </div>

        <div className="row h-100" style={{ overflowX: "auto" }}>
          <div className="col-12 d-flex flex-column h-100">
            <div
              className="table-container flex-grow-1"
              style={{ overflowY: "auto", margin: "5px" }}
            >
              {remitos.length > 0 ? (
                <VirtualizedTable
                  columns={columnsLista}
                  rows={remitos}
                  setRows={setRemitos}
                />
              ) : (
                <div className="alert alert-warning" role="alert">
                  No se registraron remitos para este parte.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={mostrarModal}
        onClose={() => {
          setFotoCapturada(null)
          setNumeroSeguimiento("")
          setObservaciones("")
          setMostrarModal(false)
        }}
        title={`📸 Remito nro: ${remitoSeleccionado?.nroComprobante}`}
        minWidth="320px"
        maxWidth="600px"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            padding: "1rem 0",
          }}
        >
          {/* Número de seguimiento */}
          <div>
            <input
              type="text"
              placeholder="Número de seguimiento"
              value={numeroSeguimiento}
              onChange={(e) => setNumeroSeguimiento(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSubirSeguimiento()
                }
              }}
              className="form-input"
            />
            <Button
              className="boton-accion"
              onClick={handleSubirSeguimiento}
              text={"Agregar Seguimiento"}
            ></Button>
          </div>

          {/* Observaciones */}
          <div>
            <textarea
              placeholder="Observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleSubirObservaciones()
                }
              }}
              className="form-input"
            />
            <Button
              className="boton-accion"
              onClick={handleSubirObservaciones}
              text={"Agregar Observaciones"}
            />
          </div>

          {/* Foto */}
          <div>
            <p style={{ fontWeight: "bold" }}>Capturar foto del documento</p>
            <div className="modals-camera-container">
              <CameraCapture
                onConfirm={nuevaFotoCapturada}
                resizeOptions={{ maxWidth: 800, maxHeight: 800, quality: 0.9 }}
              />
            </div>

            {imagenesRemito && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                  marginTop: "1rem",
                  justifyContent: "center",
                }}
              >
                {imagenesRemito.length > 0 ? (
                  <div
                    className="galeria-imagenes"
                    style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}
                  >
                    {imagenesRemito.map((img, i) => (
                      <img
                        key={i}
                        src={img}
                        alt={`Remito ${i + 1}`}
                        style={{ maxWidth: "100px", borderRadius: "6px" }}
                        onClick={() => {
                          setImagenSeleccionada(img)
                          setModalImagenAbierto(true)
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <p
                    style={{
                      marginTop: "1rem",
                      fontStyle: "italic",
                      color: "#777",
                    }}
                  >
                    Este remito aún no tiene imágenes cargadas.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {modalImagenAbierto && imagenSeleccionada && (
        <Modal
          isOpen={modalImagenAbierto}
          onClose={() => {
            setModalImagenAbierto(false)
            setImagenSeleccionada(null)
          }}
        >
          <div style={{ textAlign: "center" }}>
            <img
              src={imagenSeleccionada}
              alt="Imagen ampliada"
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                borderRadius: "10px",
                boxShadow: "0 0 10px rgba(0,0,0,0.3)",
              }}
            />
          </div>
        </Modal>
      )}

      <ModalsArticulosRemitos
        isOpen={isModalArticulosOpen}
        onClose={() => setIsModalArticulosOpen(false)}
        idRenglon={idRenglonSeleccionado}
      />
      <AlertOptions
        title="¿Está seguro que desea eliminar el Parte de Entrega?"
        message="Se eliminará de forma permanente"
        isOpen={alertaOptionsOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <AlertaCuidado
        setIsOpen={setAlertaCuidado}
        isOpen={alertaCuidado}
        message={msgAlerta}
        titulo={tituloAlerta}
      />
      <AlertErrores
        setIsOpen={setAlertaError}
        isOpen={alertaError}
        message={msgAlerta}
        titulo={tituloAlerta}
      />
      <Alert
        titulo={tituloAlerta}
        message={msgAlerta}
        duration={5000}
        setIsOpen={setAlerta}
        isOpen={alerta}
      />
    </Estructura>
  )
}

export default ListaRemitos
