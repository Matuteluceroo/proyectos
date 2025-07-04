import React, { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { useSocket } from "../../services/SocketContext"
import { useLoader } from "../../services/LoaderContext"
import {
  useObtenerFacturas,
  useObtenerFacturasProvincias,
  useAgregarObservacionesMasivo,
} from "../../services/connections/facturas"
import { calcularTotal, cobranzaColumns } from "./cobranzasLogic"
import Estructura from "../../components/Estructura/Estructura"
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable"
import "./Cobranzas.css"
import { formatearNumero } from "../../services/functions"
import AlertErrores from "../../components/Alert/AlertErrores"
import { FiDownload, FiRotateCw } from "react-icons/fi"
import BotonCerrarSesion from "../../components/Button/BotonCerrarSesion"
import Button from "../../components/Button/Button"
import Modal from "../../components/Modal/Modal"
import FileUpload from "../../components/FileUpload/FileUpload"
import Alert from "../../components/Alert/Alert"

interface FacturaRow {
  [key: string]: any
}

const formatearFecha = (
  valor: string
): { fecha: string; esValida: boolean } => {
  if (!valor) return { fecha: "", esValida: true }

  const fecha = new Date(valor)
  if (isNaN(fecha.getTime())) return { fecha: "", esValida: false }

  return { fecha: fecha.toISOString().split("T")[0], esValida: true }
}

const MenuCobranzas: React.FC = () => {
  const navigate = useNavigate()
  const { currentUser } = useSocket()
  const { setLoading } = useLoader()
  const tableRef = useRef<any>(null)
  const [rows, setRows] = useState<FacturaRow[]>([])
  const [precioTotal, setPrecioTotal] = useState<number>(0)
  const [alertaError, setAlertaError] = useState({
    isOpen: false,
    titulo: "",
    message: "",
  })
  const obtenerFacturas = useObtenerFacturas()
  const obtenerFacturasProvincias = useObtenerFacturasProvincias()
  const agregarObservacionesMasivo = useAgregarObservacionesMasivo()
  const [datosTablaExportar, setDatosTablaExportar] = useState<any[]>([])
  const [isModalImportarOpen, setIsModalImportarOpen] = useState(false)
  const [dataExcel, setDataExcel] = useState<any[]>([])
  const [alerta, setAlerta] = useState<boolean>(false)
  const [msgAlerta, setMsgAlerta] = useState<string>("")
  const [tituloAlerta, setTituloAlerta] = useState<string>("")
  const columnasObs = () => [
    {
      id: "NRO_FAC",
      label: "NRO FACTURA",
    },
    {
      id: "op_exp",
      label: "OP/EXP",
    },
    {
      id: "habilitado_pago",
      label: "Habilitado p/pago",
    },
    {
      id: "observaciones",
      label: "Observaciones",
    },
    {
      id: "fecha_gestion",
      label: "Fecha Gestion",
    },
    {
      id: "fecha_entrega_documentacion",
      label: "Fecha Entrega Documentación",
    },
  ]

  useEffect(() => {
    const handleGuardarExcel = async () => {
      if (dataExcel.length === 0) return
      const erroresFechas: string[] = []

      const nuevosRenglones = dataExcel
        .filter((fila) => {
          return (
            fila["NRO FACTURA"] &&
            (fila["OP/EXP"] ||
              fila["Habilitado p/pago"] ||
              fila["Observaciones"] ||
              fila["Fecha Gestion"] ||
              fila["Fecha Entrega Documentación"])
          )
        })
        .map((fila) => {
          const { fecha: fecha_gestion, esValida: fechaGestionValida } =
            formatearFecha(fila["Fecha Gestion"])
          const {
            fecha: fecha_entrega_documentacion,
            esValida: fechaEntregaValida,
          } = formatearFecha(fila["Fecha Entrega Documentación"])

          if (!fechaGestionValida || !fechaEntregaValida) {
            erroresFechas.push(fila["NRO FACTURA"])
          }

          return {
            nro_factura: fila["NRO FACTURA"] ?? "",
            op_exp: fila["OP/EXP"] ?? "",
            habilitado_pago: fila["Habilitado p/pago"] ?? "",
            observaciones: fila["Observaciones"] ?? "",
            fecha_gestion,
            fecha_entrega_documentacion,
            fecha_modificacion: new Date().toISOString().split("T")[0],
            idUsuario: String(currentUser?.id),
          }
        })

      if (erroresFechas.length > 0) {
        setAlertaError({
          isOpen: true,
          titulo: "Error en fechas",
          message: `Las siguientes facturas tienen una fecha inválida:\n${erroresFechas.join(
            ", "
          )}`,
        })
        return
      }
      setIsModalImportarOpen(false)
      try {
        const respuesta = await agregarObservacionesMasivo(nuevosRenglones)
        setTituloAlerta("OBSERVACIONES GUARDADAS")
        setMsgAlerta(respuesta.mensaje)
        setAlerta(true)
      } catch (e) {
        console.error("Error al guardar masivamente:", e)
      }
    }
    handleGuardarExcel()
  }, [dataExcel])

  useEffect(() => {
    const llenarDatos = async () => {
      try {
        setLoading(true)
        if (!currentUser?.rol) return
        let data: FacturaRow[] = []

        if (currentUser.rol === "ADMCOBRANZAS") {
          data = await obtenerFacturas()
        } else if (currentUser.otros) {
          const provincias = currentUser.otros.split(";").filter(Boolean)
          data = await obtenerFacturasProvincias(provincias)
        } else {
          console.warn(
            "Rol no autorizado para vista de cobranzas:",
            currentUser.rol
          )
        }
        setRows(data)
        setPrecioTotal(calcularTotal(data))
      } catch (error) {
        console.error("Error al leer los datos de cobranzas")
      } finally {
        setLoading(false)
      }
    }
    llenarDatos()
  }, [])

  const importarExcel = useCallback(async () => {
    if (tableRef.current) {
      const tableData = tableRef.current.getFilteredData()
      setDatosTablaExportar(tableData)
    }
    setIsModalImportarOpen(true)
  }, [])

  const limpiarFiltros = () => {
    tableRef.current?.setFilters({})
  }

  const clickFactura = (row: FacturaRow) => {
    const nroFac = row["NRO_FAC"]
    navigate(`/factura?id=${nroFac}`)
  }

  const handleFiltrosCambiados = (
    filtros: any,
    datosFiltrados: FacturaRow[]
  ) => {
    setPrecioTotal(calcularTotal(datosFiltrados))
  }

  return (
    <Estructura
      FooterButton={<BotonCerrarSesion onClick={() => navigate("/")} />}
    >
      <div
        className="d-flex flex-column"
        style={{ height: "100vh", padding: "1rem" }}
      >
        <div className="row align-items-center justify-content-between mb-3 cobranza-header-content">
          <div className="col-2 d-flex d-md-none" />
          <div className="col-8 d-flex justify-content-center">
            <h1 className="headerTitle m-0">ADM COBRANZA</h1>
          </div>
          <div className="col-2 d-flex justify-content-end">
            <div className="header-buttons d-flex gap-2">
              <Button
                onClick={importarExcel}
                className="btnFuncTabla"
                text={<span className="btn-text">Importar Excel</span>}
                icon={<FiDownload className="btn-icon" />}
              />
              <Button
                onClick={limpiarFiltros}
                className="btnFuncTabla"
                text={<span className="btn-text">Limpiar Filtros</span>}
                icon={<FiRotateCw className="btn-icon" />}
              />
            </div>
          </div>
        </div>

        <div style={{ flexGrow: 1, overflow: "hidden" }}>
          <div className="h-100 d-flex flex-column">
            <div style={{ flexGrow: 1, overflow: "auto" }}>
              <VirtualizedTable
                nombreTabla={"tablaCobranzas"}
                rows={rows}
                setRows={setRows}
                columns={cobranzaColumns}
                ref={tableRef}
                onClickRow={clickFactura}
                onFiltersChange={handleFiltrosCambiados}
              />
            </div>
            <div className="contentTotal" style={{ flexShrink: 0 }}>
              <p className="totalDemanda">
                TOTAL: ${formatearNumero(precioTotal)}
              </p>
            </div>
          </div>
        </div>
      </div>
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
      <Alert
        titulo={tituloAlerta}
        message={msgAlerta}
        duration={5000}
        setIsOpen={setAlerta}
        isOpen={alerta}
      />
      <Modal
        isOpen={isModalImportarOpen}
        onClose={() => setIsModalImportarOpen(false)}
        title={"IMPORTAR EXCEL"}
      >
        <FileUpload
          setData={setDataExcel}
          encabezados={columnasObs()}
          datosTabla={datosTablaExportar}
          paso={"Cobranza "}
          usarEncabezados={true}
        />
      </Modal>
    </Estructura>
  )
}

export default MenuCobranzas
