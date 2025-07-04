import React, { useRef, useEffect, useState } from "react"
import FormReutilizable from "../../components/DynamicForm/FormReutilizable"
import { FormReutilizableRef } from "../../components/DynamicForm/FormReutilizableTypes"
import { funciongenerarPDFParteEntrega } from "./ParteEntrega"
import VirtualizedTable from "../../components/VirtualizedTable/VirtualizedTable"
import Button from "../../components/Button/Button"
import Estructura from "../../components/Estructura/Estructura"
import AlertOptions from "../../components/Alert/AlertOptions"
import AlertCuidado from "../../components/Alert/AlertCuidado"
import AlertErrores from "../../components/Alert/AlertErrores"
import {
  useObtenerRemitos,
  useCrearHojaRuta,
  useAgregarRemitosAHoja,
  useObtenerConductores,
} from "../../services/connections/logistica"
import { useNavigate } from "react-router-dom"
import { Column } from "../../types/TableTypes"
import verIco from "../../assets/eyes.svg"
import ModalsArticulosRemitos from "./ModalsArticulosRemitos"
import {
  Field,
  GroupedField,
} from "../../components/DynamicForm/FormReutilizableTypes"
import "./Logistica.css"
import { useSocket } from "../../services/SocketContext"
interface Remito {
  fechaEnvio: string
  nroComprobante: string
  codCliente: string
  razonSocial: string
  check: boolean
  [key: string]: any
}

const HojaRuta: React.FC = () => {
  const navigate = useNavigate()
  const obtenerRemitos = useObtenerRemitos()
  const crearHojaRuta = useCrearHojaRuta()
  const agregarRemitosAHoja = useAgregarRemitosAHoja()
  const obtenerConductores = useObtenerConductores()
  const { currentUser, notificaciones } = useSocket()
  const [remitosOriginales, setRemitosOriginales] = useState<Remito[]>([])
  const [rows, setRows] = useState<Remito[]>([])
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [alertaCuidado, setAlertaCuidado] = useState(false)
  const [alertaError, setAlertaError] = useState(false)
  const [msgAlerta, setMsgAlerta] = useState("")
  const [tituloAlerta, setTituloAlerta] = useState("")
  const [modalArticulosAbierto, setModalArticulosAbierto] = useState(false)
  const [remitoSeleccionado, setRemitoSeleccionado] = useState<string | null>(
    null
  )

  const [desdeFecha, setDesdeFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [hastaFecha, setHastaFecha] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [fechaParte, setFechaParte] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [fechaEntrega, setFechaEntrega] = useState<string>(
    new Date().toISOString().split("T")[0]
  )

  const [dataHojaRuta, setDataHojaRuta] = useState({
    redireccion: "",
    nroHoja: "",
    fecha_parte: fechaParte,
    fecha_entrega: fechaEntrega,
    desdeFecha,
    hastaFecha,
    descripcion_lote: "",
    id_conductor: "1",
    nombre_transp: "",
    observaciones: "",
    deposito: currentUser.otros.match(/@([^@]+)@/)?.[1] || "",
    estado_entrega: "EN CAMINO",
  })

  const formRef = useRef<FormReutilizableRef>(null)

  const [camposFormulario, setCamposFormulario] = useState<
    (Field | GroupedField)[]
  >([
    // {
    //   nombreCampo: "redireccion",
    //   labelText: "Redireccionar:",
    //   type: "radio",
    //   options: [
    //     { value: "TUCUMAN", label: "Tucuman" },
    //     { value: "MENDOZA", label: "Mendoza" },
    //   ],
    //   defaultValue: dataHojaRuta.deposito,
    // },
    {
      group: true,
      nombreCampo: "filtroFechas1",
      fields: [
        {
          nombreCampo: "desdeFecha",
          labelText: "Desde Fecha:",
          type: "date",
          width: "140px",
          defaultValue: desdeFecha,
        },
        {
          nombreCampo: "hastaFecha",
          labelText: "Hasta fecha:",
          type: "date",
          width: "140px",
          defaultValue: hastaFecha,
        },
      ],
    },
    {
      nombreCampo: "redireccion",
      labelText: "Redireccionar:",
      type: "select",
      // defaultValue: dataHojaRuta.redireccion ? "1" : "0",
      options: [
        { value: "", label: "Seleccione..." },
        { value: "0", label: "No" },
        { value: "1", label: "Si" },
      ],
    },
    {
      nombreCampo: "id_conductor",
      labelText: "Transporte:",
      type: "select",
      defaultValue: dataHojaRuta.id_conductor,
      options: [],
    },
    {
      nombreCampo: "descripcion_lote",
      labelText: "Descripcion del lote:",
      width: "100%",
      defaultValue: dataHojaRuta.descripcion_lote,
      type: "text",
    },
    {
      group: true,
      nombreCampo: "filtroFechas2",
      fields: [
        {
          nombreCampo: "fecha_parte",
          labelText: "Fecha Parte:",
          type: "date",
          width: "140px",
          defaultValue: fechaParte,
        },
        {
          nombreCampo: "fecha_entrega",
          labelText: "Fecha Entrega:",
          type: "date",
          width: "140px",
          defaultValue: fechaEntrega,
        },
      ],
    },
    {
      nombreCampo: "observaciones",
      labelText: "Observacion:",
      width: "100%",
      defaultValue: dataHojaRuta.observaciones,
      type: "text",
    },
  ])

  const columnsHoja: Column[] = [
    {
      id: "check",
      label: "Check",
      width: "80px",
      type: "checkbox",
      editable: true,
    },
    {
      id: "fechaEnvio",
      label: "Fecha",
      width: "100px",
      type: "text",
      options: true,
    },
    {
      id: "codCliente",
      label: "Cod. Cliente",
      width: "150px",
      type: "text",
      options: true,
    },
    {
      id: "razonSocial",
      label: "Cliente",
      width: "300px",
      type: "text",
      options: true,
    },
    {
      id: "nroComprobante",
      label: "Nro Remito",
      width: "200px",
      type: "text",
      options: true,
    },
    {
      id: "btnDetalles",
      label: "Detalles",
      width: "100px",
      editable: false,
      ico: verIco,
      onclick: (row: Remito) => {
        setRemitoSeleccionado(row.nroComprobante)
        setModalArticulosAbierto(true)
      },
    },
  ]

  const syncFormToState = () => {
    if (!formRef.current) return
    const datosFormulario = formRef.current.getFormData()
    setDataHojaRuta({
      redireccion: datosFormulario.redireccion,
      nroHoja: "",
      deposito: datosFormulario.deposito,
      id_conductor: datosFormulario.id_conductor,
      nombre_transp: datosFormulario.optionLabel,
      descripcion_lote: datosFormulario.descripcion_lote,
      observaciones: datosFormulario.observaciones,
      estado_entrega: datosFormulario.estado_entrega,
      fecha_parte: datosFormulario.fecha_parte,
      fecha_entrega: datosFormulario.fecha_entrega,
      desdeFecha,
      hastaFecha,
    })
  }
  const aplicarFiltroPorFecha = () => {
    if (!formRef.current) return

    const formValues = formRef.current.getFormData()
    const desde = new Date(formValues.desdeFecha)
    const hasta = new Date(formValues.hastaFecha)

    const filtrados = remitosOriginales.filter((r) => {
      const fecha = new Date(r.fechaEnvio)
      return fecha >= desde && fecha <= hasta
    })

    setRows(filtrados)
  }

  const handleConfirmar = async () => {
    const remitosSeleccionados = rows.filter((r) => r.check)
    if (remitosSeleccionados.length === 0) {
      setAlertaCuidado(true)
      setTituloAlerta("CUIDADO")
      setMsgAlerta("Debe seleccionar al menos un remito")
      return
    }

    const datosFormulario = formRef.current!.getFormData()

    if (datosFormulario.redireccion === "") {
      setAlertaCuidado(true)
      setTituloAlerta("CUIDADO")
      setMsgAlerta("Debe seleccionar si el parte se tiene que redireccionar")
      return
    }
    const transporte = camposFormulario.find(
      (f) => !("group" in f) && f.nombreCampo === "id_conductor"
    )

    const transporteSeleccionado = (transporte as Field)?.options?.find(
      (opt) => opt.value === datosFormulario.id_conductor
    )

    const datosApi = {
      redireccion: datosFormulario.redireccion === "1" ? 1 : 0,
      nroHojaRuta: null,
      fecha_parte: datosFormulario.fecha_parte,
      fecha_entrega: datosFormulario.fecha_entrega,
      descripcion_lote: datosFormulario.descripcion_lote || "SIN DESCRIPCIÓN",
      id_conductor: datosFormulario.id_conductor || "SIN id_conductor",
      nombre_transp: transporteSeleccionado?.label ?? "SIN TRANSPORTE",
      deposito: datosFormulario.deposito ?? "SIN DEPOSITO",
      estado_entrega: "EN CAMINO",
      observaciones: datosFormulario.observaciones || "SIN OBSERVACIONES",
    }
    try {
      const response = await crearHojaRuta(datosApi)
      const nroHoja = response.nroHoja

      await agregarRemitosAHoja({
        nroHoja,
        remitos: remitosSeleccionados.map((r) => r.nroComprobante),
      })

      funciongenerarPDFParteEntrega({
        formRef,
        camposFormulario,
        remitos: rows,
        nroHoja,
      })

      setAlertModalOpen(false)
      navigate("/logistica/lista-partes")
    } catch (error) {
      setAlertaCuidado(true)
      setTituloAlerta("ERROR")
      setMsgAlerta("Ocurrió un error al generar el PDF del parte de entrega.")
    }
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (formRef.current) {
        const values = formRef.current.getFormData()
        if (
          values.desdeFecha !== desdeFecha ||
          values.hastaFecha !== hastaFecha
        ) {
          if (values.desdeFecha) setDesdeFecha(values.desdeFecha)
          if (values.hastaFecha) setHastaFecha(values.hastaFecha)
          aplicarFiltroPorFecha()
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [desdeFecha, hastaFecha, remitosOriginales])

  useEffect(() => {
    if (remitosOriginales.length > 0) aplicarFiltroPorFecha()
  }, [remitosOriginales])

  useEffect(() => {
    const cargarDatos = async () => {
      const remitos = await obtenerRemitos()
      if (!remitos || !Array.isArray(remitos)) {
        console.warn("No se obtuvieron remitos válidos:", remitos)
        return
      }
      setRemitosOriginales(remitos.map((r: Remito) => ({ ...r, check: false })))
      if (formRef.current) {
        formRef.current.setAllFields({
          ...formRef.current.getFormData(),
          deposito: dataHojaRuta.deposito,
        })
      }
    }

    cargarDatos()
  }, [])

  useEffect(() => {
    const CargarConductores = async () => {
      const origen = currentUser.otros.match(/@([^@]+)@/)?.[1] || ""

      const conductores = await obtenerConductores({ origen })
      const opciones = conductores.map((c: any) => ({
        value: c.id_conductor.toString(), // el value debe ser string
        label: `${c.Descripcion} - ${c.Tipo}`,
      }))
      // Actualizar el campo del formulario con las opciones
      setCamposFormulario((prevCampos) => {
        const actualizados = prevCampos.map((campo) =>
          campo.nombreCampo === "id_conductor" && !("group" in campo)
            ? { ...campo, options: opciones }
            : campo
        )
        return actualizados
      })
    }
    CargarConductores()
  }, [])

  useEffect(() => {
    syncFormToState()
  }, [rows])

  const handleRowClick = (clickedRow: Remito, e: any) => {
    if (e.target.type !== "submit") {
      setRows((prevRows) =>
        prevRows.map((r) =>
          // Comparamos por referencia. Si prefieres, hazlo por alguna clave única (p. ej. nroComprobante).
          r === clickedRow ? { ...r, check: !r.check } : r
        )
      )
    }
  }

  return (
    <Estructura rutaVolver="/logistica/lista-partes">
      <div className="encabezado-costos position-relative d-flex justify-content-center align-items-center">
        <h1 className="headerTitle m-0">HOJA DE RUTA</h1>
      </div>
      <div style={{ display: "flex" }}>
        <div
          style={{
            overflowY: "auto", // permite scroll si el contenido se excede
            display: "flex",
            flexDirection: "column",
            height: "90vh", // altura máxima para scroll
          }}
        >
          <h2 className="sub-title">DATOS HOJA DE RUTA</h2>

          {/* Formulario */}
          <FormReutilizable fields={camposFormulario} ref={formRef} />

          {/* Botón justo después del formulario */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "0.1rem",
            }}
          >
            <Button
              text="CONFIRMAR"
              className="btnHeader2"
              onClick={() => {
                syncFormToState()
                setAlertModalOpen(true)
              }}
            />
          </div>
        </div>

        <div style={{ padding: "10px", height: "85vh" }}>
          <VirtualizedTable
            nombreTabla="hojaDeRuta"
            columns={columnsHoja}
            rows={rows}
            setRows={setRows}
            onClickRow={handleRowClick}
          />
        </div>
      </div>

      <AlertOptions
        title="Generar Parte"
        message="¿Está seguro?"
        isOpen={alertModalOpen}
        onCancel={() => setAlertModalOpen(false)}
        onConfirm={handleConfirmar}
      />
      <AlertCuidado
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
      <ModalsArticulosRemitos
        isOpen={modalArticulosAbierto}
        onClose={() => setModalArticulosAbierto(false)}
        idRenglon={remitoSeleccionado}
      />
    </Estructura>
  )
}

export default HojaRuta
