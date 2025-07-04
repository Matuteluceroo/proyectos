import React, { useState, useEffect, useRef, useMemo } from "react"
import Button from "../../components/Button/Button"
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable"
import { useSocket } from "../../services/SocketContext"
import {
  useObtenerFactura,
  useAgregarObservacion,
} from "../../services/connections/facturas"
import InfoItem from "../../components/InfoItem/InfoItem"
import FormReutilizable from "../../components/DynamicForm/FormReutilizable"
import { formatearNumero } from "../../services/functions"
import "./Factura.css"
import Modal from "../../components/Modal/Modal"
import Estructura from "../../components/Estructura/Estructura"
import { useGenerarExcel } from "../../services/connections/documents"
import { useObtenerUsuariosEnLinea } from "../../services/connections/usuarios"
import {
  getFacturaColumns,
  getFacturaDocsColumns,
} from "../Cobranzas/cobranzasLogic"
import { FiDownload, FiPlus } from "react-icons/fi"
import {
  Field,
  FormReutilizableRef,
} from "../../components/DynamicForm/FormReutilizableTypes"
import Alert from "../../components/Alert/Alert"
import AlertErrores from "../../components/Alert/AlertErrores"
import AlertCuidado from "../../components/Alert/AlertCuidado"
import BotonCerrarSesion from "../../components/Button/BotonCerrarSesion"
import { useNavigate } from "react-router-dom"
interface Observacion {
  [key: string]: any
}

interface Documento {
  [key: string]: any
}

const Factura: React.FC = () => {
  const [dataFactura, setDataFactura] = useState<Record<string, any>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [observaciones, setObservaciones] = useState<Observacion[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const { currentUser, enviarNotificacion } = useSocket()
  const [valorOpExp, setValorOpExp] = useState("")
  const [valorFechaEntrega, setValorFechaEntrega] = useState("")
  const formRef = useRef<FormReutilizableRef>(null)
  const tableRef = useRef<any>(null)
  const navigate = useNavigate()
  const obtenerFactura = useObtenerFactura()
  const agregarObservacion = useAgregarObservacion()
  const obtenerUsuariosEnLinea = useObtenerUsuariosEnLinea()

  const listaCols = useMemo(() => getFacturaColumns(), [])
  const colsDocumentosFactura = useMemo(() => getFacturaDocsColumns(), [])
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
    const getDataFactura = async () => {
      const nroFactura = new URLSearchParams(window.location.search).get("id")
      if (!nroFactura) return

      const factura = await obtenerFactura(nroFactura)
      setDataFactura(factura)

      const ordenadas = (factura.observaciones || []).sort(
        (a: any, b: any) =>
          new Date(b.fecha_modificacion).getTime() -
          new Date(a.fecha_modificacion).getTime()
      )
      setObservaciones(ordenadas)
      setDocumentos(factura.documentos || [])
      setValorOpExp(ordenadas[0]?.op_exp || "")
      setValorFechaEntrega(ordenadas[0]?.fecha_entrega_documentacion || "")
    }

    getDataFactura()
  }, [])

  useEffect(() => {
    if (isModalOpen && formRef.current) {
      formRef.current.setFieldValue("op_exp", valorOpExp)
      formRef.current.setFieldValue(
        "fecha_entrega_documentacion",
        valorFechaEntrega
      )
    }
  }, [isModalOpen, valorOpExp, valorFechaEntrega])

  const camposFormulario: Field[] = [
    {
      nombreCampo: "fecha_gestion",
      labelText: "Fecha Gestion",
      type: "date",
    },
    {
      nombreCampo: "fecha_entrega_documentacion",
      labelText: "Fecha Entrega Documentación",
      type: "date",
    },
    {
      nombreCampo: "op_exp",
      labelText: "OP/EXP",
      type: "text",
    },
    {
      nombreCampo: "habilitado_pago",
      labelText: "Habilitado p/pago",
      type: "select",
      options: [
        { label: "SI", value: "SI" },
        { label: "NO", value: "NO" },
      ],
      defaultValue: "SI",
    },
    {
      nombreCampo: "observaciones",
      labelText: "Observaciones",
      type: "text",
    },
  ]

  const handleSubmit = async () => {
    const formData = formRef.current?.getFormData?.()
    if (!formData?.fecha_gestion) return

    setAlertaCuidado({
      isOpen: true,
      titulo: "Cuidado",
      message: "Debe completar todos los campos",
    })

    const usuarios = await obtenerUsuariosEnLinea()
    if (!usuarios) return

    const mensaje = `Agrego observación Factura NRO ${dataFactura["NRO COMPROBANTE"]}`
    usuarios.forEach((us: any) => {
      if (us.userData.rol === "ADMCOBRANZAS") {
        enviarNotificacion(us.userData.usuario, {
          usuario: currentUser.usuario,
          mensaje,
        })
      }
    })

    await agregarObservacion({
      nro_factura: dataFactura["NRO COMPROBANTE"],
      fecha_gestion: formData.fecha_gestion,
      op_exp: formData.op_exp,
      habilitado_pago: formData.habilitado_pago || "SI",
      observaciones: formData.observaciones,
      fecha_entrega_documentacion: formData.fecha_entrega_documentacion,
      idUsuario: currentUser.id.toString(),
      sello: "",
    })

    setIsModalOpen(false)
    formRef.current?.setAllFields({
      fecha_gestion: "",
      op_exp: "",
      habilitado_pago: "SI",
      observaciones: "",
      fecha_entrega_documentacion: "",
    })

    const factura = await obtenerFactura(dataFactura["NRO COMPROBANTE"])
    setObservaciones(
      (factura.observaciones || []).sort(
        (a: any, b: any) =>
          new Date(b.fecha_modificacion).getTime() -
          new Date(a.fecha_modificacion).getTime()
      )
    )
  }

  const exportarExcel = async () => {
    const headers = listaCols.reduce((acc: Record<string, string>, col) => {
      acc[col.id] = col.label
      return acc
    }, {})

    const datosFiltrados = observaciones.map((obs) =>
      Object.fromEntries(
        Object.entries(obs).filter(([key]) => headers.hasOwnProperty(key))
      )
    )

    try {
      await useGenerarExcel(
        { data_renglones: datosFiltrados, headers },
        "Observaciones_Factura"
      )
    } catch {
      setAlertaError({
        isOpen: true,
        titulo: "Error",
        message: "Ocurrió un error al exportar el Excel.",
      })
    }
  }

  return (
    <Estructura rutaVolver="/cobranzas">
      <div className="row w-100 align-items-center py-2 px-3 factura-header-content">
        <div className="col-2 d-flex d-md-none"></div>
        <div className="col-8 d-flex justify-content-center">
          <h1 className="headerTitle m-0">FACTURA</h1>
        </div>
        <div className="col-2 d-flex justify-content-end"></div>
      </div>

      <div style={{ minHeight: "auto", paddingBottom: "0.5rem" }}>
        <div className="data-cliente-row">
          <InfoItem
            fieldName="NRO FAC"
            value={dataFactura["NRO COMPROBANTE"]}
          />
          <InfoItem fieldName="FECHA" value={dataFactura["FECHA"]} />
          <InfoItem
            fieldName="RAZON SOCIAL"
            value={dataFactura["RAZON_SOCI"]}
          />
          <InfoItem fieldName="Provincia" value={dataFactura["PROVINCIA"]} />
          <InfoItem
            fieldName="Importe"
            value={"$" + formatearNumero(dataFactura["IMPORTE"])}
          />
        </div>
      </div>

      <div
        className="row"
        style={{ height: "75vh", margin: 0, overflow: "auto" }}
      >
        <div className="col-md-6 d-flex flex-column" style={{ height: "100%" }}>
          <div className="d-flex justify-content-between align-items-center flex-wrap mb-3 gap-2">
            <h4 className="mb-0 flex-grow-1">Observaciones</h4>
            <div className="d-flex gap-2 flex-wrap">
              <Button
                text={<span className="btn-text">Exportar Excel</span>}
                icon={<FiDownload className="btn-icon" />}
                className="btnFuncTabla"
                onClick={exportarExcel}
              />
              <Button
                text={<span className="btn-text">Añadir Observación</span>}
                icon={<FiPlus className="btn-icon" />}
                className="btnFuncTabla"
                onClick={() => setIsModalOpen(true)}
              />
            </div>
          </div>
          <div style={{ height: "calc(100% - 5vh)", overflowY: "auto" }}>
            {observaciones.length > 0 ? (
              <VirtualizedTable
                rows={observaciones}
                columns={listaCols}
                ref={tableRef}
                setRows={setObservaciones}
              />
            ) : (
              <div className="alert alert-warning" role="alert">
                No hay observaciones registradas.
              </div>
            )}
          </div>
        </div>

        <div className="col-md-6 d-flex flex-column" style={{ height: "100%" }}>
          <div
            className="d-flex justify-content-between align-items-center mb-2"
            style={{ height: "5vh" }}
          >
            <h4 className="mb-0">Documentos</h4>
          </div>
          <div style={{ height: "calc(100% - 5vh)", overflowY: "auto" }}>
            {documentos.length > 0 ? (
              <VirtualizedTable
                rows={documentos}
                columns={colsDocumentosFactura}
                setRows={setDocumentos}
              />
            ) : (
              <div className="alert alert-warning" role="alert">
                No hay documentos registrados.
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isCellPhone={true}
        title="AÑADIR OBSERVACIÓN"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <FormReutilizable fields={camposFormulario} ref={formRef} />
        <Button text="GUARDAR" className="btnLargo" onClick={handleSubmit} />
      </Modal>
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
    </Estructura>
  )
}

export default Factura
