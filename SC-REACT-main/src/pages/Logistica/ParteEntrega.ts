import { useGenerarParteEntrega } from "../../services/connections/documents.js"
import {
  Field,
  FormReutilizableRef,
  GroupedField,
} from "../../components/DynamicForm/FormReutilizableTypes"
import { RefObject } from "react"

interface CampoFormulario {
  nombreCampo: string
  options?: {
    value: string
    conductor: string
    vehiculo: string
    patente: string
  }[]
}

interface ParteDataItem {
  NOMBRE_TRANSP?: string
  DEPOSITO?: string
  FECHA_PARTE?: string
  FECHA_ENTREGA?: string
  CONDUCTOR?: string
  VEHICULO?: string
  PATENTE?: string
  NRO_HOJA_RUTA?: string
  OBSERVACIONES?: string
}

interface Remito {
  check?: boolean
  razonSocial: string
  nroComprobante: string
}

export const funciongenerarPDFParteEntrega = ({
  formRef,
  camposFormulario,
  parteData,
  remitos,
  nroHoja,
}: {
  formRef?: RefObject<FormReutilizableRef | null>
  camposFormulario?: (Field | GroupedField)[]
  parteData?: ParteDataItem[]
  remitos: Remito[]
  nroHoja?: string
}) => {
  if (!remitos || remitos.length === 0) {
    alert("No hay remitos para imprimir.")
    return
  }

  const remitosSeleccionados = remitos.some((r) => r.hasOwnProperty("check"))
    ? remitos.filter((r) => r.check === true)
    : remitos

  if (remitosSeleccionados.length === 0) {
    alert("Debe seleccionar al menos un remito.")
    return
  }
  let json_data: Record<string, any> = {}

  if (formRef && camposFormulario) {
    const formData = formRef?.current?.getFormData()
    if (!formData) return
    const remitosSeleccionados = remitos.filter((r) => r.check)
    if (remitosSeleccionados.length === 0)
      return alert("Selecciona al menos un remito")

    const datosFormulario = formRef.current!.getFormData()
    const transporte = camposFormulario.find(
      (f) => !("group" in f) && f.nombreCampo === "id_conductor"
    )

    const transporteSeleccionado = (transporte as Field)?.options?.find(
      (opt) => opt.value === datosFormulario.id_conductor
    )
    const partes = transporteSeleccionado?.label.split(" - ") ?? []
    const descripcionCompleta = partes[0] ?? ""
    const tipoVehiculo = partes[1] ?? ""
    const patente = descripcionCompleta.split("-")[1] ?? ""

    const campos = camposFormulario
    const camposPlanos = campos.flatMap((campo) =>
      "group" in campo && Array.isArray((campo as any).fields)
        ? (campo as any).fields
        : campo
    )

    const selectedOption = camposPlanos
      .find((f: any) => f.nombreCampo === "id_conductor")
      ?.options?.find((opt: any) => opt.value === formData.id_conductor)

    json_data = {
      sucursal: (formData.deposito ?? "").toUpperCase(),
      fecha_parte: formData.fecha_parte,
      fecha_entrega: formData.fecha_entrega,
      conductor: descripcionCompleta,
      vehiculo: tipoVehiculo,
      patente: patente,
      numero_parte: nroHoja ?? "SIN NUMERO",
      observaciones: formData.observaciones ?? "",
    }
  } else if (parteData) {
    const parte = parteData[0]
    const partes = parte?.NOMBRE_TRANSP?.split(" - ") ?? []
    const descripcionCompleta = partes[0] ?? ""
    const tipoVehiculo = partes[1] ?? ""
    const patente = descripcionCompleta.split("-")[1] ?? ""
    const conductor = descripcionCompleta
    json_data = {
      sucursal: parte?.DEPOSITO?.toUpperCase() ?? "SIN DATOS",
      fecha_parte: parte?.FECHA_PARTE ?? "SIN FECHA",
      fecha_entrega: parte?.FECHA_ENTREGA ?? "SIN FECHA",
      conductor,
      vehiculo: tipoVehiculo,
      patente,
      numero_parte: parte?.NRO_HOJA_RUTA ?? "SIN NUMERO",
      observaciones: parte?.OBSERVACIONES ?? "",
    }
  } else {
    alert("No se proporcionó ni formRef ni parteData.")
    return
  }

  const body = {
    json_data,
    entregas: remitosSeleccionados.map((r, i) => ({
      orden: i + 1,
      cliente: r.razonSocial,
      remito: r.nroComprobante,
    })),
  }

  const nombreArchivo = `parte_entregas_${json_data.numero_parte}`
  useGenerarParteEntrega(body, nombreArchivo)
}
